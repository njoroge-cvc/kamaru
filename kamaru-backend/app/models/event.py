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
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "theme": self.theme,
            "details": self.details,
            "date_time": self.date_time.strftime("%Y-%m-%d %H:%M:%S"),
            "location": self.location,
            "image_url": self.image_url,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }