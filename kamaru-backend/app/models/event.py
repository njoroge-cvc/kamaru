from app import db
from datetime import datetime, timedelta, timezone

# Event dates are entered and stored as Kenyan local time (naive, EAT = UTC+3, no daylight saving)
EAT = timezone(timedelta(hours=3))

KINDS = {
    "challenge": "Kamaru Challenge",
    "camp": "Camp / retreat",
    "community": "Community event",
    "partner": "Partner event",
    "webinar": "Webinar",
    "podcast": "Podcast",
}
ONLINE_KINDS = {"webinar", "podcast"}
STATUSES = ("scheduled", "postponed", "cancelled")


def now_eat():
    """Current Kenyan local time as a naive datetime, comparable with stored event dates."""
    return datetime.now(EAT).replace(tzinfo=None)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    theme = db.Column(db.String(255), nullable=False, default="")
    details = db.Column(db.Text, nullable=False, default="")
    date_time = db.Column(db.DateTime, nullable=False)  # Kenyan local time
    location = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(500), nullable=True)  # Cloudinary URL; optional (site shows a brand image)

    # scheduled | postponed | cancelled. Upcoming/past is worked out from the date (see `timing`).
    status = db.Column(db.String(20), nullable=False, default="scheduled", server_default="scheduled")
    registration_required = db.Column(db.Boolean, default=False)
    registration_link = db.Column(db.String(500), nullable=True)
    cost = db.Column(db.String(50), nullable=True)  # e.g. "Free", "KES 1000", "Donation-based"
    map_link = db.Column(db.String(1000), nullable=True)  # Google Maps link for the location

    # What kind of event, and how it ties to the Kamaru Challenge
    kind = db.Column(db.String(20), nullable=False, default="community", server_default="community")
    season_id = db.Column(db.Integer, db.ForeignKey("season.id", ondelete="SET NULL"), nullable=True, index=True)
    featured = db.Column(db.Boolean, nullable=False, default=False, server_default=db.false())  # hero countdown

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    season = db.relationship("Season", lazy="joined")

    @property
    def timing(self):
        """'upcoming' or 'past', from the date (Kenyan time). Cancelled events keep their date's timing."""
        return "upcoming" if self.date_time >= now_eat() else "past"

    def to_dict(self):
        status = self.status if self.status in STATUSES else "scheduled"
        return {
            "id": self.id,
            "title": self.title,
            "theme": self.theme or "",
            "details": self.details or "",
            "date_time": self.date_time.isoformat(),
            "location": self.location,
            "image_url": self.image_url,
            "status": status,
            "timing": self.timing,
            "kind": self.kind or "community",
            "kind_label": KINDS.get(self.kind or "community", "Community event"),
            "online": (self.kind or "") in ONLINE_KINDS,
            "season_id": self.season_id,
            "season": self.season.name if self.season else None,
            "featured": bool(self.featured),
            "registration_required": bool(self.registration_required),
            "registration_link": self.registration_link,
            "cost": self.cost,
            "map_link": self.map_link,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
