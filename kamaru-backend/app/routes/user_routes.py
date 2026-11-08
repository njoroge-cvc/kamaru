from flask import Blueprint, request, jsonify
from app import db, limiter
from app.models.user import User
from app.utils import rbac
from app.utils.rbac import permission_required
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from app.utils.email_service import send_email
from app.models.short_token import ShortToken
from sqlalchemy.exc import IntegrityError

bp = Blueprint("user_routes", __name__) # Create a new blueprint for user routes

# User Registration
@bp.route("/register", methods=["POST"])
@limiter.limit("10 per hour")
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
@limiter.limit("10 per minute;60 per hour")
def login():
    data = request.get_json() # Get data from request
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first() # Check if user exists

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Generate JWT token
    access_token = create_access_token(identity=str(user.id))
    profile = user.to_dict()
    return jsonify({
        "message": "Login successful!",
        "token": access_token,
        "user": profile,
        "role": profile["role"],
        "permissions": profile["permissions"],
        "is_admin": profile["is_admin"],  # legacy field for older clients
    }), 200


# Current user's profile, role and permissions (lets the UI refresh after role changes)
@bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = rbac.current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


# Role catalogue for the admin UI
@bp.route("/roles", methods=["GET"])
@permission_required(rbac.USERS)
def roles():
    return jsonify([
        {"role": r, "label": rbac.ROLE_LABELS[r], "permissions": rbac.ROLE_PERMISSIONS[r],
         "group": "member" if r == "member" else "staff"}
        for r in ["member"] + list(reversed(rbac.STAFF_ROLES))
    ]), 200


@bp.route("/forgot_password", methods=["POST"])
@limiter.limit("5 per 15 minutes")
# Route to handle forgot password requests, sending a reset code to the user's email
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    generic = {"message": "If that email is registered, a reset code has been sent to it."}
    user = User.query.filter_by(email=email).first()
    if not user:
        # Same response either way, so the form can't be used to discover accounts
        return jsonify(generic), 200

    short_token = ShortToken.generate_token(user.id)

    subject = "Password Reset Code"
    content = f"""
    <p>Hello,</p>
    <p>You requested a password reset. Use the code below to reset your password:</p>
    <h2>{short_token}</h2>
    <p>This code is valid for 15 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    """

    if send_email(
        email, 
        subject, 
        content
    ):
        return jsonify(generic), 200
    else:
        return jsonify({"error": "Failed to send reset code"}), 500


@bp.route("/reset_password", methods=["POST"])
@limiter.limit("10 per 15 minutes")
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
@permission_required(rbac.USERS)
def get_all_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

# Get a single user by ID (admin-only)
@bp.route("/admin/users/<int:user_id>", methods=["GET"])
@permission_required(rbac.USERS)
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200

def _superadmin_count():
    return sum(1 for u in User.query.filter(User.role != "member").all() if "superadmin" in u.roles)


# Update a user (admin-only)
@bp.route("/admin/users/<int:user_id>", methods=["PUT"])
@permission_required(rbac.USERS)
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    can_manage_admins = rbac.has_permission(rbac.current_user(), rbac.ADMINS)
    old_roles = set(user.roles)

    # New roles: "roles" (a list; [] = member) or, from older clients, a single "role" / "is_admin"
    if "roles" in data:
        if not isinstance(data["roles"], list):
            return jsonify({"error": "roles must be a list"}), 400
        new_roles = set(data["roles"])
    elif data.get("role") is not None:
        new_roles = set() if data["role"] == "member" else {data["role"]}
    elif "is_admin" in data:
        new_roles = {"admin"} if data["is_admin"] else set()
    else:
        new_roles = None

    if new_roles is not None:
        unknown = new_roles - set(rbac.STAFF_ROLES)
        if unknown:
            return jsonify({"error": f"Unknown role(s): {', '.join(sorted(unknown))}"}), 400

    # Admin-level accounts, and granting or removing admin-level roles, are for Super admins only
    privileged_change = new_roles is not None and (old_roles ^ new_roles) & rbac.PRIVILEGED_ROLES
    if (old_roles & rbac.PRIVILEGED_ROLES or privileged_change) and not can_manage_admins:
        return jsonify({"error": "Only a Super admin can change Administrator or Super admin accounts."}), 403

    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)

    if new_roles is not None and new_roles != old_roles:
        if "superadmin" in old_roles and "superadmin" not in new_roles and _superadmin_count() <= 1:
            return jsonify({"error": "You can't remove the last Super admin. Make someone else Super admin first."}), 400
        user.set_roles(list(new_roles))

    db.session.commit()
    return jsonify({"message": "User updated successfully", "user": user.to_dict()}), 200

# Delete a user (admin-only)
@bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@permission_required(rbac.USERS)
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if str(user.id) == str(get_jwt_identity()):
        return jsonify({"error": "You can't delete your own account here."}), 400
    if set(user.roles) & rbac.PRIVILEGED_ROLES and not rbac.has_permission(rbac.current_user(), rbac.ADMINS):
        return jsonify({"error": "Only a Super admin can delete Administrator or Super admin accounts."}), 403
    if "superadmin" in user.roles and _superadmin_count() <= 1:
        return jsonify({"error": "You can't delete the last Super admin."}), 400

    # Password-reset links point at the user and would block the delete; they're useless without the account
    ShortToken.query.filter_by(user_id=user.id).delete(synchronize_session=False)
    db.session.delete(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "This account is still linked to other records, so it can't be deleted."}), 409
    return jsonify({"message": "User deleted successfully"}), 200


# Admin Dashboard Route
@bp.route("/admin/dashboard", methods=["GET"])
@permission_required(rbac.DASHBOARD)
def admin_dashboard():
    return jsonify({"message": "Welcome to the admin dashboard!"}), 200