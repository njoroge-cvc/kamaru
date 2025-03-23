from flask import Blueprint, request, jsonify
from app import db, jwt
from app.models.user import User
from app.utils.decorators import admin_required
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from functools import wraps

# Helper function to check if the user is an admin
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


bp = Blueprint("user_routes", __name__)

# User Registration
@bp.route("/register", methods=["POST"])
@jwt_required(optional=True)  # Optional token for public registration
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    is_admin = data.get("is_admin", False)  # Default to False

    # Check if all fields are provided
    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409

    # Ensure only admins can create admin users
    if is_admin:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({"error": "Unauthorized"}), 401
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.is_admin:
            return jsonify({"error": "Admin access required to create admin users"}), 403

    # Create new user
    new_user = User(username=username, email=email, is_admin=is_admin)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201


# User Login
@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() # Get data from request
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first() # Check if user exists

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Generate JWT token
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Login successful!", "token": access_token, "is_admin": user.is_admin}), 200

# Get all users (admin-only)
@bp.route("/admin/users", methods=["GET"])
@jwt_required()
@admin_required
def get_all_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

# Get a single user by ID (admin-only)
@bp.route("/admin/users/<int:user_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200

# Update a user (admin-only)
@bp.route("/admin/users/<int:user_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)
    user.is_admin = data.get("is_admin", user.is_admin)

    db.session.commit()
    return jsonify({"message": "User updated successfully", "user": user.to_dict()}), 200

# Delete a user (admin-only)
@bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200


# Admin Dashboard Route
@bp.route("/admin/dashboard", methods=["GET"])
@jwt_required()
@admin_required
def admin_dashboard():
    return jsonify({"message": "Welcome to the admin dashboard!"}), 200