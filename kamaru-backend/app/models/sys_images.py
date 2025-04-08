from app import db
from datetime import datetime, timezone

class SystemImage(db.Model):
    __tablename__ = 'system_images'

    id = db.Column(db.Integer, primary_key=True)
    section = db.Column(db.String(255), nullable=False)  # Section name
    image_url = db.Column(db.String(500), nullable=False)  # Cloudinary URL
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # Timestamp

    def to_dict(self):
        return {
            "id": self.id,
            "section": self.section,
            "image_url": self.image_url,
            "uploaded_at": self.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
        }