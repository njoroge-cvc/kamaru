from flask import Blueprint, request, jsonify
from app import db, jwt
from app.models.video import Video
from app.utils.decorators import admin_required
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("video_routes", __name__)

# Add a new video (Admin only)
@bp.route("/add", methods=["POST"])
@jwt_required()
@admin_required
def add_video():
    data = request.get_json()
    title = data.get("title")
    youtube_url = data.get("youtube_url")

    # Validate input
    if not title or not youtube_url:
        return jsonify({"error": "Title and YouTube URL are required"}), 400

    # Check if video already exists
    if Video.query.filter_by(youtube_url=youtube_url).first():
        return jsonify({"error": "This video is already added"}), 409

    # Save video to database
    video = Video(title=title, youtube_url=youtube_url)
    db.session.add(video)
    db.session.commit()

    return jsonify({"message": "Video added successfully!", "video": video.to_dict()}), 201

# Get all videos (Public)
@bp.route("/", methods=["GET"])
def get_videos():
    videos = Video.query.order_by(Video.uploaded_at.desc()).all()
    return jsonify({"videos": [video.to_dict() for video in videos]}), 200

# Delete a video (Admin only)
@bp.route("/delete/<int:video_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_video(video_id):
    video = Video.query.get(video_id)

    if not video:
        return jsonify({"error": "Video not found"}), 404

    db.session.delete(video)
    db.session.commit()
    return jsonify({"message": "Video deleted successfully!"}), 200
