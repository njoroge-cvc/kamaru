from flask import Blueprint, request, jsonify
from app import db
from app.models.sys_images import SystemImage
import cloudinary.uploader
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

bp = Blueprint("sys_images_routes", __name__)

# Helper function to check if the user is an admin
def is_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and user.is_admin

# Admin: Upload or Update System Image
@bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_system_image():
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    section = request.form.get("section")
    if not section:
        return jsonify({"error": "Section name is required"}), 400

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files["image"]

    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(image)
    image_url = upload_result.get("secure_url")

    # Check if the section already exists (except for banners)
    if section != "banners":
        system_image = SystemImage.query.filter_by(section=section).first()
        if system_image:
            # Update existing image
            system_image.image_url = image_url
        else:
            # Create new image
            system_image = SystemImage(section=section, image_url=image_url)
            db.session.add(system_image)
    else:
        # For banners, allow multiple uploads
        banner = SystemImage(section="banners", image_url=image_url)
        db.session.add(banner)

    db.session.commit()
    return jsonify({"message": "Image uploaded successfully!", "image_url": image_url}), 201

# Public: Get System Image by Section
@bp.route("/<section>", methods=["GET"])
def get_system_image(section):
    if section == "banners":
        # Return all banners
        banners = SystemImage.query.filter_by(section="banners").all()
        return jsonify({"banners": [banner.to_dict() for banner in banners]}), 200

    # Return a single system image for other sections
    system_image = SystemImage.query.filter_by(section=section).first()
    if system_image:
        return jsonify({"image": system_image.to_dict()}), 200
    return jsonify({"error": "Image not found"}), 404


@bp.route("/<int:image_id>", methods=["DELETE"])
@jwt_required()
def delete_system_image(image_id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    # Find the image by its ID
    system_image = SystemImage.query.get(image_id)
    if not system_image:
        return jsonify({"error": "Image not found"}), 404

    # Delete the image
    db.session.delete(system_image)
    db.session.commit()

    return jsonify({"message": "Image deleted successfully!"}), 200


@bp.route("/banners/upload", methods=["POST"])
@jwt_required()
def upload_banner_image():
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files["image"]

    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(image)
    image_url = upload_result.get("secure_url")

    # Create a new banner entry
    banner = SystemImage(section="banners", image_url=image_url)
    db.session.add(banner)
    db.session.commit()

    return jsonify({"message": "Banner uploaded successfully!", "banner": banner.to_dict()}), 201


# Admin: Delete a Banner
@bp.route("/banners/<int:banner_id>", methods=["DELETE"])
@jwt_required()
def delete_banner(banner_id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403

    banner = SystemImage.query.filter_by(id=banner_id, section="banners").first()
    if not banner:
        return jsonify({"error": "Banner not found"}), 404

    db.session.delete(banner)
    db.session.commit()
    return jsonify({"message": "Banner deleted successfully!"}), 200

# Public: Get All Banners
@bp.route("/banners", methods=["GET"])
def get_banners():
    banners = SystemImage.query.filter_by(section="banners").all()
    return jsonify({"banners": [banner.to_dict() for banner in banners]}), 200