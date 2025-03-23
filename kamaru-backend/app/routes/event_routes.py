from flask import Blueprint, request, jsonify
from app import db
from app.models.event import Event
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("event_routes", __name__)

# Helper function to check if the user is an admin
def is_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.is_admin


# -------------------- Public Routes --------------------

# Public: Get All Events
@bp.route("/", methods=["GET"])
def get_events():
    events = Event.query.all()
    if not events:
        return jsonify({"error": "No events found"}), 404
    return jsonify([event.to_dict() for event in events]), 200


# Public: Get Single Event
@bp.route("/<int:event_id>", methods=["GET"])
def get_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(event.to_dict()), 200


# -------------------- Admin Routes --------------------

# Admin: Create Event
@bp.route("/admin", methods=["POST"])
@jwt_required()
def create_event():
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    name = data.get("name")
    date = data.get("date")
    location = data.get("location")
    mission = data.get("mission")
    categories = data.get("categories")

    # Validate required fields
    if not all([name, date, location, mission, categories]):
        return jsonify({"error": "All fields are required"}), 400

    event = Event(
        name=name,
        date=date,
        location=location,
        mission=mission,
        categories=categories
    )

    db.session.add(event)
    db.session.commit()

    return jsonify({"message": "Event created successfully!", "event": event.to_dict()}), 201


# Admin: Update Event
@bp.route("/admin/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.get_json()
    event.name = data.get("name", event.name)
    event.date = data.get("date", event.date)
    event.location = data.get("location", event.location)
    event.mission = data.get("mission", event.mission)
    event.categories = data.get("categories", event.categories)

    db.session.commit()
    return jsonify({"message": "Event updated successfully!", "event": event.to_dict()}), 200


# Admin: Delete Event
@bp.route("/admin/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Event deleted successfully!"}), 200