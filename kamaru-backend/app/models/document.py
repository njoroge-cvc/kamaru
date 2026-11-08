from datetime import datetime, timezone

from app import db

# Shown as tabs/filters in the dashboard
CATEGORIES = {
    "consent": "Consent forms",
    "judging": "Judging sheets",
    "rules": "Rules & guidelines",
    "programme": "Programmes & schedules",
    "other": "Other documents",
}


class Document(db.Model):
    """An official document (consent form, judging sheet…) for staff to download.
    The file is stored privately in Cloudinary; downloads go through the API."""

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(20), nullable=False, default="other", server_default="other")
    season_id = db.Column(db.Integer, db.ForeignKey("season.id", ondelete="SET NULL"), nullable=True, index=True)

    public_id = db.Column(db.String(300), nullable=False)  # Cloudinary id (raw, authenticated)
    file_name = db.Column(db.String(255), nullable=False)  # original name, used for the download
    file_ext = db.Column(db.String(10), nullable=False)
    size_bytes = db.Column(db.Integer, nullable=False, default=0)

    uploaded_by_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    season = db.relationship("Season", lazy="joined")
    uploaded_by = db.relationship("User", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description or "",
            "category": self.category,
            "category_label": CATEGORIES.get(self.category, "Other documents"),
            "season_id": self.season_id,
            "season": self.season.name if self.season else None,
            "file_name": self.file_name,
            "file_ext": self.file_ext,
            "size_bytes": self.size_bytes,
            "uploaded_by": self.uploaded_by.username if self.uploaded_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
