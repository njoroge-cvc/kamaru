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
    # RBAC role — see app/utils/rbac.py for what each role may do
    role = db.Column(db.String(20), nullable=False, default="member", server_default="member")

    def set_role(self, role):
        self.role = role
        self.is_admin = role in ("admin", "superadmin")

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
            "role": self.role,
            "permissions": permissions_for(self),
            "is_admin": self.role in ("admin", "superadmin"),
        }
