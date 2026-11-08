"""Blog: articles about Kikuyu culture. Public reads; staff with blog:manage write."""
from datetime import datetime, timezone

import cloudinary.uploader
from flask import Blueprint, jsonify, request

from app import db
from app.models.blog import BlogPost, slugify
from app.utils import rbac
from app.utils.media import destroy_quietly
from app.utils.rbac import current_user, permission_required

bp = Blueprint("blog_routes", __name__)

TRUE = {"1", "true", "yes", "on"}


def _unique_slug(title, exclude_id=None):
    base = slugify(title)
    slug, n = base, 2
    while True:
        q = BlogPost.query.filter_by(slug=slug)
        if exclude_id:
            q = q.filter(BlogPost.id != exclude_id)
        if not q.first():
            return slug
        slug = f"{base}-{n}"
        n += 1


def _apply_form(post, data):
    """Copy title/excerpt/content/published from a form or JSON payload onto `post`."""
    if "title" in data:
        post.title = (data.get("title") or "").strip()
    if "excerpt" in data:
        post.excerpt = (data.get("excerpt") or "").strip() or None
    for field, limit in (("author_name", 120), ("author_title", 120), ("author_org", 160)):
        if field in data:
            setattr(post, field, (data.get(field) or "").strip()[:limit] or None)
    if "content" in data:
        post.content = data.get("content") or ""
    if "published" in data:
        published = str(data.get("published")).lower() in TRUE
        if published and not post.published_at:
            post.published_at = datetime.now(timezone.utc)
        post.published = published


def _payload():
    return request.form if request.form else (request.get_json(silent=True) or {})


# --- Public ---------------------------------------------------------------

@bp.route("/", methods=["GET"])
def list_posts():
    posts = (
        BlogPost.query.filter_by(published=True)
        .order_by(BlogPost.published_at.desc())
        .all()
    )
    return jsonify({"posts": [p.to_dict(with_content=False) for p in posts]}), 200


@bp.route("/<slug>", methods=["GET"])
def get_post(slug):
    post = BlogPost.query.filter_by(slug=slug, published=True).first()
    if not post:
        return jsonify({"error": "Post not found"}), 404
    return jsonify({"post": post.to_dict()}), 200


# --- Staff ----------------------------------------------------------------

@bp.route("/admin/all", methods=["GET"])
@permission_required(rbac.BLOG)
def admin_list():
    posts = BlogPost.query.order_by(BlogPost.created_at.desc()).all()
    return jsonify({"posts": [p.to_dict(include_newsletter=True) for p in posts]}), 200


@bp.route("/", methods=["POST"])
@permission_required(rbac.BLOG)
def create_post():
    data = _payload()
    post = BlogPost(author_id=current_user().id)
    _apply_form(post, data)
    if not post.title or not (post.content or "").strip():
        return jsonify({"error": "Title and content are required"}), 400
    post.slug = _unique_slug(post.title)

    image = request.files.get("image")
    if image:
        post.cover_image_url = cloudinary.uploader.upload(image, folder="blog").get("secure_url")

    db.session.add(post)
    db.session.commit()
    return jsonify({"message": "Post saved", "post": post.to_dict()}), 201


@bp.route("/<int:post_id>", methods=["PUT"])
@permission_required(rbac.BLOG)
def update_post(post_id):
    post = BlogPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    data = _payload()
    old_title = post.title
    _apply_form(post, data)
    if not post.title or not (post.content or "").strip():
        return jsonify({"error": "Title and content are required"}), 400
    # Keep links stable once published; drafts follow their title
    if post.title != old_title and not post.published_at:
        post.slug = _unique_slug(post.title, exclude_id=post.id)

    image = request.files.get("image")
    if image:
        old = post.cover_image_url
        post.cover_image_url = cloudinary.uploader.upload(image, folder="blog").get("secure_url")
        destroy_quietly(old)
    elif str(data.get("remove_image", "")).lower() in TRUE and post.cover_image_url:
        destroy_quietly(post.cover_image_url)
        post.cover_image_url = None

    db.session.commit()
    return jsonify({"message": "Post updated", "post": post.to_dict()}), 200


@bp.route("/<int:post_id>", methods=["DELETE"])
@permission_required(rbac.BLOG)
def delete_post(post_id):
    post = BlogPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    image = post.cover_image_url
    db.session.delete(post)
    db.session.commit()
    destroy_quietly(image)
    return jsonify({"message": "Post deleted"}), 200


# Staff: email a published post to subscribers. {"test": true} sends only to you.
# A post can be emailed once; pass {"force": true} to send again.
@bp.route("/<int:post_id>/newsletter", methods=["POST"])
@permission_required(rbac.NEWSLETTER)
def send_post_newsletter(post_id):
    from app.models.newsletter import NewsletterSend
    from app.utils.newsletter import start_blog_send

    post = BlogPost.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    data = request.get_json(silent=True) or {}
    user = current_user()
    if data.get("test"):
        record = start_blog_send(post, user, test_email=user.email)
        if record.status != "sent":
            return jsonify({"error": "The test email couldn't be sent. Please try again."}), 502
        return jsonify({"message": f"Test sent to {user.email}", "send": record.to_dict()}), 200
    if not post.published:
        return jsonify({"error": "Publish the post before emailing it."}), 400
    already = NewsletterSend.query.filter_by(blog_post_id=post.id, kind="blog").filter(NewsletterSend.status != "failed").first()
    if already and not data.get("force"):
        return jsonify({"error": "This post was already emailed to subscribers.", "send": already.to_dict()}), 409
    record = start_blog_send(post, user)
    return jsonify({"message": f"Sending to {record.recipients} subscribers", "send": record.to_dict()}), 202
