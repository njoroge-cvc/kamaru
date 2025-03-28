from flask import Blueprint, request, jsonify
from app import db
from app.models.participant import Participant
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("participant_routes", __name__)

# Helper function to check if the user is an admin
def is_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.is_admin

# Allowed categories
ALLOWED_CATEGORIES = ["Poetry", "Folk Songs", "Original Songs", "Rendition", "Use of African Proverbs in Spoken Word"]

# -------------------- Public Routes --------------------

# Logged-in User Register Participant
@bp.route("/", methods=["POST"])
@jwt_required()
def user_register_participant():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "Unauthorized. Please log in to register as a participant."}), 401

    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    category = data.get("category")

    # Validate required fields
    if not all([name, email, phone, category]):
        return jsonify({"error": "All fields (name, email, phone, category) are required"}), 400

    # Validate category
    if category not in ALLOWED_CATEGORIES:
        return jsonify({"error": f"Invalid category. Choose from {ALLOWED_CATEGORIES}"}), 400

    # Check if email or phone already exists
    if Participant.query.filter_by(email=email).first() or Participant.query.filter_by(phone=phone).first():
        return jsonify({"error": "Email or phone already registered"}), 409

    participant = Participant(name=name, email=email, phone=phone, category=category)
    
    db.session.add(participant)
    db.session.commit()

    return jsonify({"message": "Registration successful!", "participant": participant.to_dict()}), 201

# -------------------- Admin Routes --------------------

# Admin: Register Participant
@bp.route("/admin", methods=["POST"])
@jwt_required()
def admin_register_participant():
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    category = data.get("category")

    # Validate required fields
    if not all([name, email, phone, category]):
        return jsonify({"error": "All fields (name, email, phone, category) are required"}), 400

    # Validate category
    if category not in ALLOWED_CATEGORIES:
        return jsonify({"error": f"Invalid category. Choose from {ALLOWED_CATEGORIES}"}), 400

    # Check if email or phone already exists
    if Participant.query.filter_by(email=email).first() or Participant.query.filter_by(phone=phone).first():
        return jsonify({"error": "Email or phone already registered"}), 409

    participant = Participant(name=name, email=email, phone=phone, category=category)
    
    db.session.add(participant)
    db.session.commit()

    return jsonify({"message": "Participant registered successfully by admin!", "participant": participant.to_dict()}), 201

# Admin: Get All Participants
@bp.route("/", methods=["GET"])
@jwt_required()
def get_participants():
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    participants = Participant.query.all()
    return jsonify([p.to_dict() for p in participants]), 200
# Admin: Update a Participant
@bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_participant(id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    participant = Participant.query.get(id)
    if not participant:
        return jsonify({"error": "Participant not found"}), 404

    data = request.get_json()
    participant.name = data.get("name", participant.name)
    participant.email = data.get("email", participant.email)
    participant.phone = data.get("phone", participant.phone)
    participant.category = data.get("category", participant.category)

    # Validate category if updated
    if participant.category not in ALLOWED_CATEGORIES:
        return jsonify({"error": f"Invalid category. Choose from {ALLOWED_CATEGORIES}"}), 400

    db.session.commit()
    return jsonify({"message": "Participant updated successfully!", "participant": participant.to_dict()}), 200

# Admin: Delete a Participant
@bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_participant(id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    participant = Participant.query.get(id)
    if not participant:
        return jsonify({"error": "Participant not found"}), 404

    db.session.delete(participant)
    db.session.commit()

    return jsonify({"message": "Participant deleted successfully"}), 200