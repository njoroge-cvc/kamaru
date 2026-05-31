from app import db
from datetime import datetime

class NewsletterSubscriber(db.Model):
    id = db.Column(
        db.Integer, 
        primary_key=True
    )

    email = db.Column(
        db.String(255), 
        unique=True, 
        nullable=False
    )

    is_verified = db.Column(
        db.Boolean, 
        default=False
    )

    verification_token = db.Column(
        db.String(64), 
        unique=True, 
        nullable=True
    )

    subscribed_at = db.Column(
        db.DateTime, 
        default=datetime.utcnow
    )

    verified_at = db.Column(
        db.DateTime, 
        nullable=True
    )

    def to_dict(self):
        return {
            "id": self.id, 
            "email": self.email, 
            "subscribed_at": self.subscribed_at,
            "is_verified": self.is_verified,
            "verified_at": self.verified_at,
            "verification_token": self.verification_token
        }