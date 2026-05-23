from app import db

# Season model representing a competition season in the Kamaru competition
class Season(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)

    is_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(
        db.DateTime, 
        default=db.func.current_timestamp()
        )
    
    # Relationship to participants - one season can have many participants
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "year": self.year,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }
