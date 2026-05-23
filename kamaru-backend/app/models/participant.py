from app import db

# Participant model representing a participant in the Kamaru competition
class Participant(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    category = db.Column(db.String(50), nullable=False)

    season_id = db.Column(
        db.Integer,
        db.ForeignKey("season.id"),
        nullable=False,
        index=True
    )

    registered_at = db.Column(
        db.DateTime, 
        default=db.func.current_timestamp()
        )
    
    season = db.relationship("Season", backref="participants")

# Unique constraints to ensure email and phone are unique within the same season
    __table_args__ = (
        db.UniqueConstraint(
            'email',
            'season_id',
            name='unique_email_per_season'
        ),
        db.UniqueConstraint(
            'phone',
            'season_id',
            name='unique_phone_per_season'
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "category": self.category,
            "season_id": self.season_id,
            "season": self.season.name if self.season else None,
            "registered_at": self.registered_at.isoformat()
        }