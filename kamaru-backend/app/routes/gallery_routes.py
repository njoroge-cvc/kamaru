from flask import Blueprint, request, jsonify
from app import db
from app.models.gallery import Gallery
from app.utils import rbac
from app.utils.rbac import permission_required
import cloudinary.uploader
from app.utils.media import destroy_quietly

bp = Blueprint("gallery_routes", __name__)


# Admin: Upload Image
@bp.route("/upload", methods=["POST"])
@permission_required(rbac.GALLERY)
def upload_image():

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files["image"]
    title = request.form.get("title", "Untitled")

    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(image)
    image_url = upload_result.get("secure_url")

    # Save to database
    new_image = Gallery(title=title, image_url=image_url)
    db.session.add(new_image)
    db.session.commit()

    return jsonify({"message": "Image uploaded successfully!", "image": new_image.to_dict()}), 201

# Public: Get All Gallery Images
@bp.route("/", methods=["GET"])
def get_gallery():
    images = Gallery.query.order_by(Gallery.uploaded_at.desc()).all()
    # Always 200: an empty gallery is a valid state, not a missing resource
    return jsonify({"images": [image.to_dict() for image in images]}), 200


@bp.route("/about-image", methods=["GET"]) # Public: Get About Image
def get_about_image():
    # Fetch the image with a specific title (e.g., "About Us")
    image = Gallery.query.filter_by(title="kc_about_us_img").first()
    if image:
        return jsonify({"image": image.to_dict()}), 200
    return jsonify({"error": "Image not found"}), 404

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
