from datetime import datetime

from flask import Blueprint, jsonify, request

from app import db
from app.models.season import Season
from app.utils import rbac
from app.utils.rbac import permission_required

bp = Blueprint("season_routes", __name__)


def _parse_dt(value):
    """Accepts 'YYYY-MM-DDTHH:MM' (datetime-local input) or ISO strings; '' / None clears it."""
    if not value:
        return None
    return datetime.fromisoformat(str(value)[:16])


# Get active season (Public) — the registration page uses this to know if entries are open
@bp.route("/active", methods=["GET"])
def get_active_season():
    season = Season.query.filter_by(is_active=True).first()
    if not season:
        return jsonify({"error": "No active season"}), 404
    return jsonify(season.to_dict()), 200


# Get all seasons (Public: names/years only are exposed)
@bp.route("/", methods=["GET"])
def get_seasons():
    seasons = Season.query.order_by(Season.year.desc()).all()
    return jsonify([season.to_dict() for season in seasons]), 200


# Create a season (coordinators/admins)
@bp.route("/", methods=["POST"])
@permission_required(rbac.SEASONS)
def create_season():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    year = data.get("year")
    if not name or not year:
        return jsonify({"error": "Season name and year are required"}), 400
    try:
        season = Season(
            name=name,
            year=int(year),
            is_active=False,
            registration_open=False,
            registration_closes_at=_parse_dt(data.get("registration_closes_at")),
        )
    except ValueError:
        return jsonify({"error": "Invalid year or closing date"}), 400
    db.session.add(season)
    db.session.commit()
    return jsonify(season.to_dict()), 201


# Update a season: rename, activate, open/close registration, set auto-close
@bp.route("/<int:season_id>", methods=["PATCH"])
@permission_required(rbac.SEASONS)
def update_season(season_id):
    season = Season.query.get(season_id)
    if not season:
        return jsonify({"error": "Season not found"}), 404

    data = request.get_json(silent=True) or {}
    try:
        if "name" in data and str(data["name"]).strip():
            season.name = str(data["name"]).strip()
        if "year" in data:
            season.year = int(data["year"])
        if "registration_closes_at" in data:
            season.registration_closes_at = _parse_dt(data["registration_closes_at"])
    except ValueError:
        return jsonify({"error": "Invalid year or closing date"}), 400

    if data.get("is_active") is True:
        # Exactly one active season: participants register into it
        Season.query.filter(Season.id != season.id, Season.is_active.is_(True)).update(
            {"is_active": False, "registration_open": False}
        )
        season.is_active = True
    elif data.get("is_active") is False:
        season.is_active = False
        season.registration_open = False

    if "registration_open" in data:
        wants_open = bool(data["registration_open"])
        if wants_open and not season.is_active:
            db.session.rollback()
            return jsonify({"error": "Activate this season before opening registration."}), 400
        season.registration_open = wants_open

    db.session.commit()
    return jsonify(season.to_dict()), 200
