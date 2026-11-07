from app import db
from datetime import datetime, timezone


class Gallery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)  # Cloudinary URL
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    # Which season (edition) the photo belongs to; optional, kept if the season is deleted
    season_id = db.Column(db.Integer, db.ForeignKey("season.id", ondelete="SET NULL"), nullable=True, index=True)

    season = db.relationship("Season", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "image_url": self.image_url,
            "uploaded_at": self.uploaded_at.isoformat(),
            "season_id": self.season_id,
            "season": self.season.name if self.season else None,
            "season_year": self.season.year if self.season else None,
        }
