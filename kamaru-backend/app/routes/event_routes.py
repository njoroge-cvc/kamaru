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

# Admin: Create Event
@bp.route("/", methods=["POST"])  # Changed from "/events"
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

    return jsonify({"message": "Event created successfully!", "event": event.to_dict()})


# Public: Get All Events
@bp.route("/", methods=["GET"])  # Changed from "/events"
def get_events():
    events = Event.query.all()
    return jsonify([event.to_dict() for event in events]) if events else jsonify({"error": "No events found"}), 404


# Public: Get Single Event
@bp.route("/<int:event_id>", methods=["GET"])  # Changed from "/event"
def get_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(event.to_dict())


# Admin: Update Event
@bp.route("/<int:event_id>", methods=["PUT"])  # Changed from "/event"
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
    return jsonify({"message": "Event updated successfully!", "event": event.to_dict()})


# Admin: Delete Event
@bp.route("/<int:event_id>", methods=["DELETE"])  # Changed from "/event"
@jwt_required()
def delete_event(event_id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Event deleted successfully!"})
