from flask import Blueprint, request, jsonify
from app import db
from app.models.gallery import Gallery
from app.models.season import Season
from app.utils import rbac
from app.utils.rbac import permission_required
import cloudinary.uploader
from app.utils.media import destroy_quietly

bp = Blueprint("gallery_routes", __name__)


def _season_id(value):
    """'' / None / 'none' -> None (unassigned); otherwise an existing season id, else ValueError."""
    if value in (None, "", "none", "null"):
        return None
    try:
        sid = int(value)
    except (TypeError, ValueError):
        raise ValueError("Invalid season")
    if not Season.query.get(sid):
        raise ValueError("Season not found")
    return sid


# Admin: Upload Image
@bp.route("/upload", methods=["POST"])
@permission_required(rbac.GALLERY)
def upload_image():

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files["image"]
    title = (request.form.get("title") or "").strip() or "Untitled"
    try:
        season_id = _season_id(request.form.get("season_id"))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(image)
    image_url = upload_result.get("secure_url")

    # Save to database
    new_image = Gallery(title=title, image_url=image_url, season_id=season_id)
    db.session.add(new_image)
    db.session.commit()

    return jsonify({"message": "Image uploaded successfully!", "image": new_image.to_dict()}), 201

# Public: Get All Gallery Images (optionally ?season_id=<id> or ?season_id=none for unassigned)
@bp.route("/", methods=["GET"], strict_slashes=False)
def get_gallery():
    query = Gallery.query
    if "season_id" in request.args:
        try:
            query = query.filter(Gallery.season_id == _season_id(request.args.get("season_id")))
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
    images = query.order_by(Gallery.uploaded_at.desc()).all()
    # Always 200: an empty gallery is a valid state, not a missing resource
    return jsonify({"images": [image.to_dict() for image in images]}), 200


@bp.route("/about-image", methods=["GET"]) # Public: Get About Image
def get_about_image():
    # Fetch the image with a specific title (e.g., "About Us")
    image = Gallery.query.filter_by(title="kc_about_us_img").first()
    if image:
        return jsonify({"image": image.to_dict()}), 200
    return jsonify({"error": "Image not found"}), 404

# Admin: Edit an image's title and/or season
@bp.route("/<int:image_id>", methods=["PATCH"])
@permission_required(rbac.GALLERY)
def update_image(image_id):
    image = Gallery.query.get(image_id)
    if not image:
        return jsonify({"error": "Image not found"}), 404
    data = request.get_json(silent=True) or {}
    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"error": "Title can't be empty"}), 400
        image.title = title
    if "season_id" in data:
        try:
            image.season_id = _season_id(data.get("season_id"))
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
    db.session.commit()
    return jsonify({"message": "Image updated", "image": image.to_dict()}), 200


# Admin: Move several images to a season at once  {"ids": [..], "season_id": 3 | null}
@bp.route("/bulk-season", methods=["PATCH"])
@permission_required(rbac.GALLERY)
def bulk_assign_season():
    data = request.get_json(silent=True) or {}
    ids = [i for i in (data.get("ids") or []) if isinstance(i, int)]
    if not ids:
        return jsonify({"error": "No images selected"}), 400
    try:
        season_id = _season_id(data.get("season_id"))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    count = Gallery.query.filter(Gallery.id.in_(ids)).update({Gallery.season_id: season_id}, synchronize_session=False)
    db.session.commit()
    return jsonify({"message": f"{count} image(s) updated", "updated": count}), 200


# Admin: Delete Image
@bp.route("/<int:image_id>", methods=["DELETE"])
@permission_required(rbac.GALLERY)
def delete_image(image_id):

    image = Gallery.query.get(image_id)
    if not image:
        return jsonify({"error": "Image not found"}), 404

    # Delete from Cloudinary (folder-aware; never blocks the DB delete)
    destroy_quietly(image.image_url)

    # Delete from DB
    db.session.delete(image)
    db.session.commit()

    return jsonify({"message": "Image deleted successfully!"})
