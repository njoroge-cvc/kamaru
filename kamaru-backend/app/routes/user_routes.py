import random
import string
from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.utils.decorators import admin_required
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from functools import wraps
from datetime import datetime
from app.utils.email_service import send_email
from app.models.short_token import ShortToken

bp = Blueprint("user_routes", __name__) # Create a new blueprint for user routes

# Decorator to check if user is an admin before accessing a route (admin-only)
def admin_required(fn): # Decorator function that takes a function as an argument and returns a new function
    @wraps(fn) # Preserve the original function's metadata (name, docstring, etc.)
    def wrapper(*args, **kwargs): # New function that takes any number of positional and keyword arguments
        current_user_id = get_jwt_identity() # Get the current user's ID from the JWT token
        user = User.query.get(current_user_id) # Get the user object from the database
        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs) # Call the original function with the arguments and keyword arguments
    return wrapper # Return the new function

# Function to generate a random 6-character alphanumeric token
def generate_short_token():
    """Generate a secure 6-character alphanumeric token."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


# Store reset tokens in-memory or create a model for persistence
password_reset_tokens = {}


# User Registration
@bp.route("/register", methods=["POST"])
@jwt_required(optional=True) # Allow both authenticated and unauthenticated users to access this route
def register():
    current_user_id = get_jwt_identity()
    if current_user_id:  # If the user is already authenticated
        return jsonify({"error": "You are already logged in"}), 400

    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Check if all fields are provided
    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409

    # Create new user
    new_user = User(username=username, email=email)
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

@bp.route("/forgot_password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    short_token = ShortToken.generate_token(user.id)

    subject = "Password Reset Code"
    content = f"""
    <p>Hello,</p>
    <p>You requested a password reset. Use the code below to reset your password:</p>
    <h2>{short_token}</h2>
    <p>This code is valid for 15 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    """

    if send_email(email, subject, content):
        return jsonify({"message": "Password reset code sent to your email"}), 200
    else:
        return jsonify({"error": "Failed to send reset code"}), 500


@bp.route("/reset_password", methods=["POST"])
def reset_password():
    data = request.get_json()
    short_token = data.get("short_token")
    new_password = data.get("new_password")

    token_entry = ShortToken.query.filter_by(short_token=short_token).first()

    if not token_entry or token_entry.expires_at < datetime.utcnow():
        return jsonify({"error": "Invalid or expired reset code"}), 400

    user = User.query.get(token_entry.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.set_password(new_password)
    db.session.delete(token_entry)  # Remove the used token
    db.session.commit()

    return jsonify({"message": "Password reset successfully!"}), 200

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