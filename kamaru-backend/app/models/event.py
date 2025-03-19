from app import db

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    mission = db.Column(db.Text, nullable=False)
    categories = db.Column(db.JSON, nullable=False)  # Store categories as a JSON array

    def to_dict(self):
        """Convert event object to dictionary format."""
        return {
            "id": self.id,
            "name": self.name,
            "date": str(self.date),  # Convert date to string for JSON response
            "location": self.location,
            "mission": self.mission,
            "categories": self.categories
        }
