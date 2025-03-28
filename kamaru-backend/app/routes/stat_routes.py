from flask import Blueprint, jsonify
from app.models.event import Event
from app.models.participant import Participant
from app.models.user import User
from app.models.video import Video
from app.models.gallery import Gallery
from app import db

bp = Blueprint("stats_routes", __name__)

@bp.route("/", methods=["GET", "OPTIONS"])
def get_stats():
    try:
        total_events = db.session.query(Event).count()
        total_participants = db.session.query(Participant).count()
        total_users = db.session.query(User).count()
        total_videos = db.session.query(Video).count()
        total_gallery_items = db.session.query(Gallery).count()

        stats = {
            "total_events": total_events,
            "total_participants": total_participants,
            "total_users": total_users,
            "total_videos": total_videos,
            "total_gallery_items": total_gallery_items,
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500