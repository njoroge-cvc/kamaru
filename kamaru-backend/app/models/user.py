from app import db
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    # Legacy flag kept in sync with `role` (admin or superadmin) for older clients.
    is_admin = db.Column(db.Boolean, default=False)
    # Main role (the highest staff role held, or "member"); kept for older clients and simple queries
    role = db.Column(db.String(20), nullable=False, default="member", server_default="member")
    # Every staff role the person holds, comma-separated ("coordinator,official"); empty = member
    staff_roles = db.Column(db.String(120), nullable=False, default="", server_default="")

    @property
    def roles(self):
        """Staff roles held, highest first. Empty list = a member."""
        from app.utils.rbac import STAFF_ROLES

        held = {r for r in (self.staff_roles or "").split(",") if r}
        if not held and self.role and self.role != "member":  # rows from before multi-role
            held = {self.role}
        return [r for r in STAFF_ROLES if r in held]

    @property
    def group(self):
        return "staff" if self.roles else "member"

    def set_roles(self, roles):
        from app.utils.rbac import STAFF_ROLES

        held = [r for r in STAFF_ROLES if r in set(roles or [])]
        self.staff_roles = ",".join(held)
        self.role = held[0] if held else "member"
        self.is_admin = bool({"admin", "superadmin"} & set(held))

    def set_role(self, role):
        """Single-role setter kept for older code paths: replaces all staff roles."""
        self.set_roles([] if not role or role == "member" else [role])

    def set_password(self, password):
        """Hash and set user password."""
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        """Check if password matches hashed password."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Return user object as dictionary."""
        from app.utils.rbac import permissions_for

        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.roles[0] if self.roles else "member",
            "roles": self.roles,
            "group": self.group,
            "permissions": permissions_for(self),
            "is_admin": bool({"admin", "superadmin"} & set(self.roles)),
        }
