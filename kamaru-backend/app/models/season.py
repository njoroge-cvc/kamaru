from app import db

# Season model representing a competition season in the Kamaru competition
class Season(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)

    is_active = db.Column(db.Boolean, default=False)

    # Participation window, controlled by coordinators/admins
    registration_open = db.Column(db.Boolean, nullable=False, default=False, server_default=db.false())
    registration_closes_at = db.Column(db.DateTime, nullable=True)  # optional auto-close (local time)
    created_at = db.Column(
        db.DateTime, 
        default=db.func.current_timestamp()
        )
    
    def is_registration_open(self):
        """Open only if switched on and the optional closing time hasn't passed."""
        from datetime import datetime

        if not self.registration_open:
            return False
        if self.registration_closes_at and datetime.now() >= self.registration_closes_at:
            return False
        return True

    # Relationship to participants - one season can have many participants
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "year": self.year,
            "is_active": self.is_active,
            "registration_open": self.registration_open,
            "registration_closes_at": self.registration_closes_at.isoformat() if self.registration_closes_at else None,
            # Effective state, accounting for the auto-close time
            "accepting_registrations": self.is_registration_open(),
            "created_at": self.created_at.isoformat()
        }
