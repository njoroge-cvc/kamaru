"""
Role-based access control.

Two groups: members (no staff roles) and staff (officials: one or more staff roles).
A person's permissions are the union of their roles' permissions. Routes ask for a
permission, never for a role, so roles can be reshaped without touching routes.

    member       -> ordinary account (can register as a contestant); holds no staff roles
    staff        -> any staff member or official (judges, MCs, desk team): the dashboard's Documents
    media        -> gallery, videos, site media (logo, patron photo, music), blog, newsletter
    coordinator  -> events, seasons/registration window, participants and the blog
    admin        -> everything, including users and their roles (except admin-level accounts)
    superadmin   -> everything, plus granting/removing Administrator and Super admin access
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
NEWSLETTER = "newsletter:manage"  # subscribers and sending newsletters
STATS = "stats:view"  # dashboard overview charts
DOCUMENTS_VIEW = "documents:view"  # see and download official documents
DOCUMENTS_MANAGE = "documents:manage"  # upload, edit, delete official documents
ADMINS = "admins:manage"  # make/remove Administrators and Super admins; edit or delete their accounts

ALL_PERMISSIONS = [DASHBOARD, STATS, EVENTS, PARTICIPANTS, SEASONS, GALLERY, VIDEOS, SITE_IMAGES, USERS, BLOG, NEWSLETTER,
                   DOCUMENTS_VIEW, DOCUMENTS_MANAGE, ADMINS]

# --- Roles ---------------------------------------------------------------
ROLE_PERMISSIONS = {
    "member": [],
    "staff": [DASHBOARD, DOCUMENTS_VIEW],
    "media": [DASHBOARD, STATS, GALLERY, VIDEOS, SITE_IMAGES, BLOG, NEWSLETTER, DOCUMENTS_VIEW],
    "coordinator": [DASHBOARD, STATS, EVENTS, SEASONS, PARTICIPANTS, BLOG, DOCUMENTS_VIEW],
    "admin": [p for p in ALL_PERMISSIONS if p != ADMINS],
    "superadmin": list(ALL_PERMISSIONS),
}

ROLE_LABELS = {
    "member": "Member",
    "staff": "Staff",
    "media": "Media team",
    "coordinator": "Coordinator",
    "admin": "Administrator",
    "superadmin": "Super admin",
}

ROLES = list(ROLE_PERMISSIONS.keys())
DEFAULT_ROLE = "member"
# Staff roles a person can hold (any combination); highest first, used to pick the "main" role
STAFF_ROLES = ["superadmin", "admin", "coordinator", "media", "staff"]
PRIVILEGED_ROLES = {"admin", "superadmin"}  # changing these needs ADMINS


def permissions_for(user):
    """Union of the permissions of every staff role the user holds (members: none)."""
    if not user:
        return []
    perms = []
    for role in user.roles:
        for p in ROLE_PERMISSIONS.get(role, []):
            if p not in perms:
                perms.append(p)
    return [p for p in ALL_PERMISSIONS if p in perms]


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
