from flask import Blueprint, request, jsonify
from app import db
from app.models.video import Video
from app.utils import rbac
from app.utils.rbac import permission_required
from app.utils.youtube import extract_youtube_id, watch_url

bp = Blueprint("video_routes", __name__)

# Add a new video (Admin only)
@bp.route("/add", methods=["POST"])
@permission_required(rbac.VIDEOS)
def add_video():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    youtube_url = (data.get("youtube_url") or "").strip()

    # Validate input
    if not title or not youtube_url:
        return jsonify({"error": "Title and YouTube URL are required"}), 400

    # Accept any common YouTube link, but only if it points at a single video
    video_id = extract_youtube_id(youtube_url)
    if not video_id:
        return jsonify({
            "error": "That doesn't look like a YouTube video link. Use the video's Share link "
                     "(e.g. https://youtu.be/…) rather than a channel or playlist link."
        }), 400

    # Same video under a different link format (youtu.be, ?si=…, &t=…) is still a duplicate
    for existing in Video.query.all():
        if extract_youtube_id(existing.youtube_url) == video_id:
            return jsonify({"error": f"This video is already added as “{existing.title}”"}), 409

    # Store one canonical link so every page builds the same player
    video = Video(title=title, youtube_url=watch_url(video_id))
    db.session.add(video)
    db.session.commit()

    return jsonify({"message": "Video added successfully!", "video": video.to_dict()}), 201

# Get all videos (Public)
@bp.route("/", methods=["GET"], strict_slashes=False)
def get_videos():
    videos = Video.query.order_by(Video.uploaded_at.desc()).all()
    return jsonify({"videos": [video.to_dict() for video in videos]}), 200

# Delete a video (Admin only)
@bp.route("/delete/<int:video_id>", methods=["DELETE"])
@permission_required(rbac.VIDEOS)
def delete_video(video_id):
    video = Video.query.get(video_id)

    if not video:
        return jsonify({"error": "Video not found"}), 404

    db.session.delete(video)
    db.session.commit()
    return jsonify({"message": "Video deleted successfully!"}), 200
