from flask import Blueprint, request, jsonify
from app import db, limiter
from sqlalchemy.exc import IntegrityError
from app.models.participant import Participant
from app.models.season import Season
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils import rbac
from app.utils.rbac import permission_required

bp = Blueprint("participant_routes", __name__)


# Allowed categories for participants - this can be expanded as needed or moved to a config file
ALLOWED_CATEGORIES = ["Poetry", "Folk Songs and Dances", "Original Songs"]

# -------------------- Public Routes --------------------

# Logged-in User Register Participant
@bp.route("/", methods=["POST"])
@limiter.limit("20 per hour")
@jwt_required()
def user_register_participant():

    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({
            "error": "Unauthorized. Please log in."
            }), 401

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    category = data.get("category")

    # Validate fields
    if not all([name, email, phone, category]):
        return jsonify({
            "error": "All fields required"
            }), 400

    # Validate category
    if category not in ALLOWED_CATEGORIES:
        return jsonify({
            "error": f"Invalid category. Choose from {ALLOWED_CATEGORIES}"
            }), 400
    
    #get active season
    active_season = Season.query.filter_by(
        is_active=True
    ).first()

    if not active_season:
        return jsonify({
            "error": "No active season available"
            }), 400

    # Participation window is controlled by coordinators/admins
    if not active_season.is_registration_open():
        return jsonify({
            "error": f"Registration for {active_season.name} is currently closed."
            }), 403
    
    # Check if email or phone already exists for the active season
    existing_participant = Participant.query.filter(
        (
            Participant.email == email
        ) |
        (
            Participant.phone == phone
        ),
        Participant.season_id == active_season.id
    ).first()

    if existing_participant:
        return jsonify({
            "error": "You are already registered for this season"
            }), 409

    participant = Participant(
        name=name, email=email, 
        phone=phone, 
        category=category,
        season_id=active_season.id,
        user_id=current_user.id,  # link the entry to the account that submitted it
        )
    
    db.session.add(participant)
    db.session.commit()

    return jsonify({
        "message": "Registration successful!", 
        "participant": participant.to_dict()
        }), 201

# The logged-in user's own entries (all seasons, newest first)
@bp.route("/mine", methods=["GET"])
@jwt_required()
def my_entries():
    user = rbac.current_user()
    if not user:
        return jsonify({"error": "Unauthorized. Please log in."}), 401
    entries = (
        Participant.query.filter_by(user_id=user.id)
        .order_by(Participant.registered_at.desc())
        .all()
    )
    return jsonify([p.to_dict() for p in entries]), 200


# Withdraw one of your own entries — only while that season's registration is still open
@bp.route("/mine/<int:id>", methods=["DELETE"])
@jwt_required()
def withdraw_entry(id):
    user = rbac.current_user()
    participant = Participant.query.get(id)
    if not user or not participant or participant.user_id != user.id:
        return jsonify({"error": "Entry not found"}), 404
    season = participant.season
    if not season or not season.is_active or not season.is_registration_open():
        return jsonify({"error": "Entries can only be withdrawn while registration is open. Please contact us."}), 403
    db.session.delete(participant)
    db.session.commit()
    return jsonify({"message": "Your entry has been withdrawn."}), 200

# -------------------- Admin Routes --------------------

# Admin: Register Participant
@bp.route("/admin", methods=["POST"])
@permission_required(rbac.PARTICIPANTS)
def admin_register_participant():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    category = data.get("category")

    # Validate fields
    if not all([name, email, phone, category]):
        return jsonify({
            "error": "All fields are required"
            }), 400

    # Validate category
    if category not in ALLOWED_CATEGORIES:
        return jsonify({
            "error": f"Invalid category. Choose from {ALLOWED_CATEGORIES}"
            }), 400
    
    active_season = Season.query.filter_by(
        is_active=True
    ).first()

    if not active_season:
        return jsonify({
            "error": "No active season available"
            }), 400
    
    existing_participant = Participant.query.filter(
        (
            Participant.email == email
        ) |
        (
            Participant.phone == phone
        ),
        Participant.season_id == active_season.id
    ).first()

    if existing_participant:
        return jsonify({
            "error": "Email already registered for this season"
            }), 409
    
    participant = Participant(
        name=name, email=email, 
        phone=phone, 
        category=category,
        season_id=active_season.id
    )

    db.session.add(participant)
    db.session.commit()

    return jsonify({
        "message": "Participant registered successfully by admin!", 
        "participant": participant.to_dict()
        }), 201

# Admin: Get All Participants
@bp.route("/", methods=["GET"])
@permission_required(rbac.PARTICIPANTS)
def get_participants():

    season_id = request.args.get("season_id", type=int)

    if season_id:
        participants = Participant.query.filter_by(
            season_id=season_id
        ).order_by(
            Participant.registered_at.desc()
            ).all()
    else:
        participants = Participant.query.order_by(
            Participant.registered_at.desc()
        ).all()

    return jsonify([p.to_dict() for p in participants]), 200

# Admin: Update a Participant
@bp.route("/<int:id>", methods=["PUT"])
@permission_required(rbac.PARTICIPANTS)
def update_participant(id):

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
        db.session.rollback()
        return jsonify({"error": f"Invalid category. Choose from {ALLOWED_CATEGORIES}"}), 400

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Another participant this season already uses that email or phone."}), 409
    return jsonify({"message": "Participant updated successfully!", "participant": participant.to_dict()}), 200

# Admin: Delete a Participant
@bp.route("/<int:id>", methods=["DELETE"])
@permission_required(rbac.PARTICIPANTS)
def delete_participant(id):

    participant = Participant.query.get(id)
    if not participant:
        return jsonify({"error": "Participant not found"}), 404

    db.session.delete(participant)
    db.session.commit()

    return jsonify({"message": "Participant deleted successfully"}), 200