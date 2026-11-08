"""Events: the Kamaru Challenge itself, camps and retreats, community and partner events."""
from datetime import datetime, timedelta

import cloudinary.uploader
from flask import Blueprint, Response, jsonify, request
from sqlalchemy import or_

from app import db
from app.models.event import Event, KINDS, STATUSES, now_eat
from app.models.season import Season
from app.utils import rbac
from app.utils.media import destroy_quietly
from app.utils.rbac import permission_required

bp = Blueprint("event_routes", __name__)

TRUE = {"1", "true", "yes", "on"}


def _not_cancelled():
    # NULL-safe: older rows may have no status, and `NULL != 'cancelled'` is not true in SQL
    return or_(Event.status.is_(None), Event.status != "cancelled")


def _apply(event, data, creating=False):
    """Validate the form and copy it onto `event`. Returns an error message or None."""
    title = (data.get("title") if "title" in data or creating else event.title) or ""
    location = (data.get("location") if "location" in data or creating else event.location) or ""
    if not title.strip():
        return "Give the event a title."
    if not location.strip():
        return "Add where the event takes place."

    if data.get("date_time") or creating:
        try:
            event.date_time = datetime.strptime(str(data.get("date_time") or "")[:16], "%Y-%m-%dT%H:%M")
        except ValueError:
            return "Pick a valid date and time."

    status = data.get("status")
    if status in ("upcoming", "past"):  # older clients
        status = "scheduled"
    if status is not None:
        if status not in STATUSES:
            return f"Status must be one of: {', '.join(STATUSES)}."
        event.status = status
    elif creating:
        event.status = "scheduled"

    kind = data.get("kind")
    if kind is not None:
        if kind not in KINDS:
            return f"Type must be one of: {', '.join(KINDS)}."
        event.kind = kind
    elif creating:
        event.kind = "community"

    if "season_id" in data:
        sid = data.get("season_id")
        if sid in (None, "", "none", "null"):
            event.season_id = None
        else:
            try:
                sid = int(sid)
            except (TypeError, ValueError):
                return "Invalid season."
            if not Season.query.get(sid):
                return "That season doesn't exist."
            event.season_id = sid

    event.title = title.strip()
    event.location = location.strip()
    for field in ("theme", "details", "registration_link", "cost", "map_link"):
        if field in data:
            value = (data.get(field) or "").strip()
            setattr(event, field, value if value or field in ("theme", "details") else None)
    if "registration_required" in data:
        event.registration_required = str(data.get("registration_required")).lower() in TRUE
    if "featured" in data:
        event.featured = str(data.get("featured")).lower() in TRUE
    return None


def _unfeature_others(event):
    """Only one event drives the homepage countdown."""
    if event.featured:
        Event.query.filter(Event.id != event.id, Event.featured.is_(True)).update({Event.featured: False}, synchronize_session=False)


# Create an event
@bp.route("/", methods=["POST"])
@permission_required(rbac.EVENTS)
def create_event():
    data = request.form
    event = Event()
    error = _apply(event, data, creating=True)
    if error:
        return jsonify({"error": error}), 400

    image = request.files.get("image")
    if image and image.filename:
        event.image_url = cloudinary.uploader.upload(image, folder="events").get("secure_url")
    elif data.get("image_url"):  # e.g. duplicating an event keeps its photo
        event.image_url = data.get("image_url")

    db.session.add(event)
    db.session.flush()
    _unfeature_others(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201


# Public list
#   ?scope=upcoming (default) -> not cancelled, still ahead, soonest first
#   ?scope=past               -> not cancelled, already happened, newest first
#   ?scope=all                -> everything (admin), newest first
#   ?kind=challenge|camp|community|partner   optional filter
@bp.route("/", methods=["GET"])
def get_events():
    scope = request.args.get("scope", "upcoming")
    now = now_eat()
    query = Event.query
    if request.args.get("kind") in KINDS:
        query = query.filter(Event.kind == request.args["kind"])

    if scope == "all":
        events = query.order_by(Event.date_time.desc()).all()
    elif scope == "past":
        events = query.filter(Event.date_time < now, _not_cancelled()).order_by(Event.date_time.desc()).all()
    else:
        # Featured event first (it drives the homepage countdown), then soonest
        events = query.filter(Event.date_time >= now, _not_cancelled()).order_by(Event.featured.desc(), Event.date_time.asc()).all()
    return jsonify([e.to_dict() for e in events]), 200


# Public: event types (for filters and forms)
@bp.route("/kinds", methods=["GET"])
def get_kinds():
    return jsonify([{"kind": k, "label": v} for k, v in KINDS.items()]), 200


# Public: one event
@bp.route("/<int:id>", methods=["GET"])
def get_event(id):
    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(event.to_dict()), 200


def _ics_text(value):
    return (value or "").replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


# Public: "Add to calendar" file (.ics); assumes a 4-hour event when no end time is known
@bp.route("/<int:id>/calendar.ics", methods=["GET"])
def event_calendar(id):
    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    start = event.date_time - timedelta(hours=3)  # EAT -> UTC
    end = start + timedelta(hours=4)
    fmt = "%Y%m%dT%H%M%SZ"
    url = f"https://kamaruchallenge.africa/events/{event.id}"
    body = "\r\n".join([
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kamaru Challenge//Events//EN", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        f"UID:event-{event.id}@kamaruchallenge.africa",
        f"DTSTAMP:{datetime.utcnow().strftime(fmt)}",
        f"DTSTART:{start.strftime(fmt)}",
        f"DTEND:{end.strftime(fmt)}",
        f"SUMMARY:{_ics_text(event.title)}",
        f"LOCATION:{_ics_text(event.location)}",
        f"DESCRIPTION:{_ics_text((event.theme + chr(10) if event.theme else '') + url)}",
        f"URL:{url}",
        "STATUS:CANCELLED" if event.status == "cancelled" else "STATUS:CONFIRMED",
        "END:VEVENT", "END:VCALENDAR", "",
    ])
    filename = "".join(c if c.isalnum() else "-" for c in event.title.lower()).strip("-")[:60] or "event"
    return Response(body, mimetype="text/calendar", headers={"Content-Disposition": f'attachment; filename="{filename}.ics"'})


# Update an event
@bp.route("/<int:id>", methods=["PUT"])
@permission_required(rbac.EVENTS)
def update_event(id):
    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    data = request.form if request.form else (request.get_json(silent=True) or {})
    error = _apply(event, data)
    if error:
        db.session.rollback()
        return jsonify({"error": error}), 400

    image = request.files.get("image")
    if image and image.filename:
        old_url = event.image_url
        event.image_url = cloudinary.uploader.upload(image, folder="events").get("secure_url")
        if old_url and not Event.query.filter(Event.id != event.id, Event.image_url == old_url).first():
            destroy_quietly(old_url)  # only if no duplicate still uses it
    elif str(data.get("remove_image", "")).lower() in TRUE and event.image_url:
        old_url, event.image_url = event.image_url, None
        if not Event.query.filter(Event.id != event.id, Event.image_url == old_url).first():
            destroy_quietly(old_url)

    _unfeature_others(event)
    db.session.commit()
    return jsonify(event.to_dict()), 200


# Delete an event
@bp.route("/<int:id>", methods=["DELETE"])
@permission_required(rbac.EVENTS)
def delete_event(id):
    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    image_url = event.image_url
    db.session.delete(event)
    db.session.commit()
    # Keep the photo if another event (e.g. a duplicate) still uses it
    if image_url and not Event.query.filter_by(image_url=image_url).first():
        destroy_quietly(image_url)
    return jsonify({"message": "Event deleted successfully"}), 200
