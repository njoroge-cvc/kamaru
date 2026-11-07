from flask import Blueprint, request, jsonify
from app import db
from app.models.event import Event
from app.utils import rbac
from app.utils.rbac import permission_required
import cloudinary.uploader
from app.utils.media import destroy_quietly
from datetime import datetime

bp = Blueprint("event_routes", __name__)


# Create an event (Admin-only)
@bp.route("/", methods=["POST"])
@permission_required(rbac.EVENTS)
def create_event():

    data = request.form

    image = request.files.get("image")
    if not image:
        return jsonify({"error": "Image is required"}), 400

    try:
        # Parse datetime-local format
        date_time = datetime.strptime(data.get("date_time"), "%Y-%m-%dT%H:%M")

        # Upload image to Cloudinary
        upload_result = cloudinary.uploader.upload(image)
        image_url = upload_result.get("secure_url")

        # Create and save the event
        event = Event(
            title=data.get("title"),
            theme=data.get("theme"),
            details=data.get("details"),
            date_time=date_time,
            location=data.get("location"),
            status=data.get("status", "upcoming"),
            registration_required=data.get("registration_required", "false").lower() == "true",
            registration_link=data.get("registration_link"),
            cost=data.get("cost"),
            map_link=data.get("map_link"),
            image_url=image_url,
        )
        db.session.add(event)
        db.session.commit()
        return jsonify(event.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Fetch all events (Public)
@bp.route("/", methods=["GET"])
def get_events():
    # ?scope=all  -> every event (admin management, newest first)
    # ?scope=past -> completed events (newest first) for the public story/timeline
    # default     -> upcoming, non-cancelled events (soonest first)
    scope = request.args.get("scope", "upcoming")
    now = datetime.utcnow()

    if scope == "all":
        events = Event.query.order_by(Event.date_time.desc()).all()
    elif scope == "past":
        events = Event.query.filter(
            Event.date_time < now,
            Event.status != "cancelled"
        ).order_by(Event.date_time.desc()).all()
    else:
        events = Event.query.filter(
            Event.date_time >= now,
            Event.status != "cancelled"
        ).order_by(
            Event.date_time.asc()
        ).all()

    return jsonify([event.to_dict() for event in events]), 200

# Fetch event details (Public)
@bp.route("/<int:id>", methods=["GET"])
def get_event(id):
    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(event.to_dict()), 200

# Update an event (Admin-only)
@bp.route("/<int:id>", methods=["PUT"])
@permission_required(rbac.EVENTS)
def update_event(id):

    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.form

    # Handle image upload if a new image is provided
    image = request.files.get("image")

    # If a new image is uploaded, upload it to Cloudinary and update the event's image URL
    if image and image.filename:
        upload_result = cloudinary.uploader.upload(image)
        old_url = event.image_url
        event.image_url = upload_result.get("secure_url")
        destroy_quietly(old_url)  # remove the replaced image

    try:
        # Parse datetime-local format if provided and update the event fields
        if data.get("date_time"): # Only update date_time if it's provided in the request
            event.date_time = datetime.strptime( # Parse the date_time string from the frontend
                data.get("date_time"), # Expecting date_time in "YYYY-MM-DDTHH:MM" format from the frontend
                "%Y-%m-%dT%H:%M" # Adjusted format to match datetime-local input
            )
        event.title = data.get("title", event.title)
        event.theme = data.get("theme", event.theme)
        event.details = data.get("details", event.details)
        event.location = data.get("location", event.location)
        event.status = data.get("status", event.status)
        event.registration_required = data.get("registration_required", str(event.registration_required)).lower() == "true"
        event.registration_link = data.get("registration_link", event.registration_link)
        event.cost = data.get("cost", event.cost)
        event.map_link = data.get("map_link", event.map_link)

        db.session.commit()
        return jsonify(event.to_dict()), 200
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print the stack trace for debugging

        return jsonify({
            "error": str(e)
        }), 400

# Delete an event (Admin-only)
@bp.route("/<int:id>", methods=["DELETE"])
@permission_required(rbac.EVENTS)
def delete_event(id):

    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    image_url = event.image_url
    db.session.delete(event)
    db.session.commit()
    destroy_quietly(image_url)
    return jsonify({"message": "Event deleted successfully"}), 200