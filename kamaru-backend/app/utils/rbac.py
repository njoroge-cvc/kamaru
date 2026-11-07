"""
Role-based access control.

Every user has exactly one role. Roles grant permissions; routes ask for a
permission, never for a role, so roles can be reshaped without touching routes.

    member       -> ordinary account (can register as a contestant)
    media        -> gallery, videos, site images and the blog
    coordinator  -> events, seasons/registration window, participants and the blog
    admin        -> everything, including users and their roles
"""
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

# --- Permissions ---------------------------------------------------------
EVENTS = "events:manage"
PARTICIPANTS = "participants:manage"
SEASONS = "seasons:manage"
GALLERY = "gallery:manage"
VIDEOS = "videos:manage"
SITE_IMAGES = "site_images:manage"
USERS = "users:manage"
DASHBOARD = "dashboard:view"
BLOG = "blog:manage"

ALL_PERMISSIONS = [DASHBOARD, EVENTS, PARTICIPANTS, SEASONS, GALLERY, VIDEOS, SITE_IMAGES, USERS, BLOG]

# --- Roles ---------------------------------------------------------------
ROLE_PERMISSIONS = {
    "member": [],
    "media": [DASHBOARD, GALLERY, VIDEOS, SITE_IMAGES, BLOG],
    "coordinator": [DASHBOARD, EVENTS, SEASONS, PARTICIPANTS, BLOG],
    "admin": list(ALL_PERMISSIONS),
}

ROLE_LABELS = {
    "member": "Member",
    "media": "Media team",
    "coordinator": "Coordinator",
    "admin": "Administrator",
}

ROLES = list(ROLE_PERMISSIONS.keys())
DEFAULT_ROLE = "member"


def permissions_for(user):
    if not user:
        return []
    return ROLE_PERMISSIONS.get(user.role or DEFAULT_ROLE, [])


def has_permission(user, permission):
    return permission in permissions_for(user)


def current_user():
    """Return the logged-in User (or None). Requires a verified JWT in the request."""
    from app.models.user import User  # local import avoids a circular import

    identity = get_jwt_identity()
    if identity is None:
        return None
    return User.query.get(int(identity))


def permission_required(*permissions):
    """
    Route decorator: requires a valid JWT and a user holding ANY of the given permissions.
    Usage:  @permission_required(rbac.GALLERY)
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = current_user()
            if not user:
                return jsonify({"error": "Unauthorized. Please log in."}), 401
            if not any(has_permission(user, p) for p in permissions):
                return jsonify({"error": "You don't have permission to do that."}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
