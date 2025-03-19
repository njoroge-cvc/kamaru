from flask import Blueprint, request, jsonify
from app import db, jwt
from app.models.user import User
from app.utils.decorators import admin_required
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

bp = Blueprint("user_routes", __name__)

# User Registration
@bp.route("/register", methods=["POST"])
@jwt_required(optional=True) # if no token is provided, user is registered as a regular user
def register():
    data = request.get_json() # Get data from request
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    is_admin = data.get("is_admin", False) # default to False

    # Check if all fields are provided
    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409
    
    # Check if current user is admin when creating new admin user
    current_user = get_jwt_identity()
    if is_admin: # Trying to create an admin user
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401
        current_user = User.query.get(current_user )
        if not current_user or not current_user.is_admin:
            return jsonify({"error": "Admin access required"}), 401

    # Create new user
    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201 # Return success message

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
    return jsonify({"message": "Login successful!", "token": access_token})

# Admin Route Example
@bp.route("/admin/dashboard", methods=["GET"])
@jwt_required()
@admin_required
def admin_dashboard():
    return jsonify({"message": "Welcome, Admin!"})

# Protected Route Example
@bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.to_dict())