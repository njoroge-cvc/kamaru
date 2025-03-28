from flask import Blueprint, request, jsonify
from app import db
from app.models.event import Event
from app.models.user import User  # Import the User model
import cloudinary.uploader
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

bp = Blueprint("event_routes", __name__)

# Helper function to check if the user is an admin
def is_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.is_admin

# Create an event (Admin-only)
@bp.route("/", methods=["POST"])
@jwt_required()
def create_event():
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

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
    events = Event.query.order_by(Event.date_time.desc()).all()
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
@jwt_required()
def update_event(id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.form
    image = request.files.get("image")
    if image:
        upload_result = cloudinary.uploader.upload(image)
        event.image_url = upload_result.get("secure_url")

    try:
        # Parse datetime-local format if provided
        if "date_time" in data:
            event.date_time = datetime.strptime(data.get("date_time"), "%Y-%m-%dT%H:%M")
        event.title = data.get("title", event.title)
        event.theme = data.get("theme", event.theme)
        event.details = data.get("details", event.details)
        event.location = data.get("location", event.location)

        db.session.commit()
        return jsonify(event.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Delete an event (Admin-only)
@bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_event(id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted successfully"}), 200