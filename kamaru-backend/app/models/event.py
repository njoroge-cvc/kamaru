from app import db
from datetime import datetime, timezone

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    theme = db.Column(db.String(255), nullable=False)
    details = db.Column(db.Text, nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)  # Cloudinary URL
    
    status = db.Column(db.String(20), default="upcoming")  # upcoming, past, cancelled
    registration_required = db.Column(db.Boolean, default=False)
    registration_link = db.Column(db.String(500), nullable=True)
    cost = db.Column(db.String(50), nullable=True)  # e.g., "Free", "ksh 1000", "Donation-based"
    map_link = db.Column(db.String(1000), nullable=True)  # Google Maps link for the location

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "theme": self.theme,
            "details": self.details,
            "date_time": self.date_time.isoformat(),
            "location": self.location,
            "image_url": self.image_url,
            "status": self.status,
            "registration_required": self.registration_required,
            "registration_link": self.registration_link,
            "cost": self.cost,
            "map_link": self.map_link,
            "created_at": self.created_at.isoformat()
        }