from flask import Blueprint, request, jsonify
from app import db
from app.models.gallery import Gallery
from app.models.user import User
import cloudinary.uploader
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("gallery_routes", __name__)

# Helper function to check if the user is an admin
def is_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.is_admin

# Admin: Upload Image
@bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_image():
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

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
    if images:
        return jsonify({"images": [image.to_dict() for image in images]}), 200
    return jsonify({"message": "No images found"}), 404


@bp.route("/about-image", methods=["GET"]) # Public: Get About Image
def get_about_image():
    # Fetch the image with a specific title (e.g., "About Us")
    image = Gallery.query.filter_by(title="kc_about_us_img").first()
    if image:
        return jsonify({"image": image.to_dict()}), 200
    return jsonify({"error": "Image not found"}), 404

# Admin: Delete Image
@bp.route("/<int:image_id>", methods=["DELETE"])
@jwt_required()
def delete_image(image_id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    image = Gallery.query.get(image_id)
    if not image:
        return jsonify({"error": "Image not found"}), 404

    # Delete from Cloudinary
    public_id = image.image_url.split("/")[-1].split(".")[0]  # Extract public ID
    cloudinary.uploader.destroy(public_id)

    # Delete from DB
    db.session.delete(image)
    db.session.commit()

    return jsonify({"message": "Image deleted successfully!"})
