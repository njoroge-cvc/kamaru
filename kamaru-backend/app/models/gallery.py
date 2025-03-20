from app import db
from datetime import datetime, timezone

# Gallery model
class Gallery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)  # Cloudinary URL
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # Timezone-aware datetime

    def to_dict(self):  # Convert the model to a dictionary
        return {
            "id": self.id,
            "title": self.title,
            "image_url": self.image_url,  # Cloudinary URL
            "uploaded_at": self.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
