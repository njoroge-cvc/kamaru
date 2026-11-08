import re
from flask import Blueprint, request, jsonify
from app import db
from app.models.sys_images import SystemImage
import cloudinary.uploader
from app.utils.media import destroy_quietly
from app.utils import rbac
from app.utils.rbac import permission_required

bp = Blueprint("sys_images_routes", __name__)


# Site media slots actually shown on the site (anything else is rejected)
#   logo  -> navbar and full-screen menu
#   about -> patron photo on the homepage ("Our Part") and the About page
SECTIONS = {"logo", "about"}


# Admin: upload or replace a site image
@bp.route("/upload", methods=["POST"])
@permission_required(rbac.SITE_IMAGES)
def upload_system_image():
    section = (request.form.get("section") or "").strip()
    if section not in SECTIONS:
        return jsonify({"error": f"Unknown slot. Use one of: {', '.join(sorted(SECTIONS))}"}), 400
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_url = cloudinary.uploader.upload(request.files["image"]).get("secure_url")

    system_image = SystemImage.query.filter_by(section=section).first()
    if system_image:
        old_url = system_image.image_url  # replace, and remove the file it replaces
        system_image.image_url = image_url
        destroy_quietly(old_url)
    else:
        system_image = SystemImage(section=section, image_url=image_url)
        db.session.add(system_image)
    db.session.commit()
    return jsonify({"message": "Image uploaded successfully!", "image": system_image.to_dict(), "image_url": image_url}), 201


# Public: get the image for a slot
@bp.route("/<section>", methods=["GET"])
def get_system_image(section):
    if section not in SECTIONS:
        return jsonify({"error": "Image not found"}), 404
    system_image = SystemImage.query.filter_by(section=section).first()
    if system_image:
        return jsonify({"image": system_image.to_dict()}), 200
    return jsonify({"error": "Image not found"}), 404


# Admin: remove a site image (by id)
@bp.route("/<int:image_id>", methods=["DELETE"])
@permission_required(rbac.SITE_IMAGES)
def delete_system_image(image_id):
    system_image = SystemImage.query.get(image_id)
    if not system_image or system_image.section not in SECTIONS:
        return jsonify({"error": "Image not found"}), 404
    image_url = system_image.image_url
    db.session.delete(system_image)
    db.session.commit()
    destroy_quietly(image_url)
    return jsonify({"message": "Image deleted successfully!"}), 200


# ---------------------------------------------------------------------------
# Background music: one track visitors can play while browsing.
# Stored as two rows in system_images: the audio URL, and its display title.
# ---------------------------------------------------------------------------
AUDIO = "background_audio"
AUDIO_TITLE = "background_audio_title"
AUDIO_TYPES = {"mp3", "m4a", "aac", "ogg", "oga", "opus", "wav", "webm", "weba", "flac"}
MAX_AUDIO_MB = 20


def _audio_payload():
    track = SystemImage.query.filter_by(section=AUDIO).first()
    if not track:
        return None
    title = SystemImage.query.filter_by(section=AUDIO_TITLE).first()
    return {"url": track.image_url, "title": title.image_url if title else "", "uploaded_at": track.uploaded_at.isoformat()}


# Public: the current track, or {"audio": null}
@bp.route("/audio", methods=["GET"])
def get_audio():
    return jsonify({"audio": _audio_payload()}), 200


# Admin: upload or replace the track (form fields: audio=<file>, title=<text>)
@bp.route("/audio", methods=["POST"])
@permission_required(rbac.SITE_IMAGES)
def upload_audio():
    file = request.files.get("audio")
    if not file or not file.filename:
        return jsonify({"error": "Choose an audio file (MP3 works best)."}), 400
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in AUDIO_TYPES and not (file.mimetype or "").startswith("audio/"):
        return jsonify({"error": "That isn't an audio file. Please upload an MP3, WEBA, M4A, OGG or WAV."}), 400
    file.seek(0, 2)
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)
    if size_mb > MAX_AUDIO_MB:
        return jsonify({"error": f"The file is {size_mb:.0f} MB; please keep it under {MAX_AUDIO_MB} MB (a 3 to 5 minute MP3 is ideal)."}), 400

    uploaded = cloudinary.uploader.upload(file, resource_type="video", folder="site-audio").get("secure_url")
    # Deliver as MP3 whatever was uploaded (WEBA/Opus doesn't play on older iPhones/Safari):
    # Cloudinary converts the format when the extension in the URL changes.
    url = re.sub(r"\.[A-Za-z0-9]+$", ".mp3", uploaded)
    title = (request.form.get("title") or "").strip()[:200]

    track = SystemImage.query.filter_by(section=AUDIO).first()
    if track:
        old = track.image_url
        track.image_url = url
        destroy_quietly(old, resource_type="video")
    else:
        db.session.add(SystemImage(section=AUDIO, image_url=url))
    title_row = SystemImage.query.filter_by(section=AUDIO_TITLE).first()
    if title_row:
        title_row.image_url = title
    else:
        db.session.add(SystemImage(section=AUDIO_TITLE, image_url=title))
    db.session.commit()
    return jsonify({"message": "Background music updated", "audio": _audio_payload()}), 201


# Admin: rename the track without re-uploading
@bp.route("/audio", methods=["PATCH"])
@permission_required(rbac.SITE_IMAGES)
def rename_audio():
    title = ((request.get_json(silent=True) or {}).get("title") or "").strip()[:200]
    row = SystemImage.query.filter_by(section=AUDIO_TITLE).first()
    if not SystemImage.query.filter_by(section=AUDIO).first():
        return jsonify({"error": "No background music uploaded"}), 404
    if row:
        row.image_url = title
    else:
        db.session.add(SystemImage(section=AUDIO_TITLE, image_url=title))
    db.session.commit()
    return jsonify({"audio": _audio_payload()}), 200


# Admin: remove the track (the site then hides the music button)
@bp.route("/audio", methods=["DELETE"])
@permission_required(rbac.SITE_IMAGES)
def delete_audio():
    track = SystemImage.query.filter_by(section=AUDIO).first()
    if not track:
        return jsonify({"error": "No background music uploaded"}), 404
    url = track.image_url
    db.session.delete(track)
    SystemImage.query.filter_by(section=AUDIO_TITLE).delete()
    db.session.commit()
    destroy_quietly(url, resource_type="video")
    return jsonify({"message": "Background music removed"}), 200
