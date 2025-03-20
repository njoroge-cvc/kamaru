from app import db

# The Video model represents a video uploaded by an admin. The model has the following attributes:
# - id: the unique identifier of the video (primary key)
# - title: the title of the video
# - youtube_url: the URL of the video on YouTube (unique)
# - uploaded_at: the timestamp when the video was uploaded
# The Video model also has a to_dict method that converts the model to a dictionary for JSON serialization.
class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    youtube_url = db.Column(db.String(500), nullable=False, unique=True)
    uploaded_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "youtube_url": self.youtube_url,
            "uploaded_at": self.uploaded_at.strftime("%Y-%m-%d %H:%M:%S")
        }
