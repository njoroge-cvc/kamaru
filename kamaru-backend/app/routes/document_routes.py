"""Official documents: every staff member can view and download; administrators upload, edit, delete."""
import logging
import os
import re
import time

import cloudinary.uploader
import cloudinary.utils
from flask import Blueprint, jsonify, request

from app import db
from app.models.document import CATEGORIES, Document
from app.models.season import Season
from app.utils import rbac
from app.utils.rbac import current_user, permission_required

bp = Blueprint("document_routes", __name__)
log = logging.getLogger(__name__)

ALLOWED = {"pdf", "doc", "docx", "xls", "xlsx", "csv", "ppt", "pptx", "odt", "ods", "odp", "rtf", "txt", "jpg", "jpeg", "png"}
MAX_MB = 15
LINK_SECONDS = 300  # download links expire after 5 minutes


def _check_file(file):
    if not file or not file.filename:
        return None, "Choose a file to upload."
    name = os.path.basename(file.filename)
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext not in ALLOWED:
        return None, "Only documents can be uploaded: PDF, Word, Excel, PowerPoint, text, or a photo/scan (JPG, PNG)."
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_MB * 1024 * 1024:
        return None, f"The file is {size / 1048576:.1f} MB; the limit is {MAX_MB} MB."
    return (name, ext, size), None


def _store(file, name):
    """Upload privately (authenticated delivery) as a raw file; returns the Cloudinary public id."""
    stem = re.sub(r"[^A-Za-z0-9_-]+", "-", name.rsplit(".", 1)[0]).strip("-")[:60] or "document"
    result = cloudinary.uploader.upload(
        file, resource_type="raw", type="authenticated", folder="documents",
        public_id=f"{stem}-{int(time.time())}.{name.rsplit('.', 1)[-1].lower()}", overwrite=False,
    )
    return result["public_id"]


def _destroy(public_id):
    try:
        cloudinary.uploader.destroy(public_id, resource_type="raw", type="authenticated")
    except Exception:  # never block the database change on storage cleanup
        log.exception("Could not delete document file %s", public_id)


def _apply(doc, data):
    if "title" in data:
        doc.title = (data.get("title") or "").strip()[:200]
    if "description" in data:
        doc.description = (data.get("description") or "").strip() or None
    if "category" in data:
        if data.get("category") not in CATEGORIES:
            return f"Category must be one of: {', '.join(CATEGORIES)}."
        doc.category = data["category"]
    if "season_id" in data:
        sid = data.get("season_id")
        if sid in (None, "", "none", "null"):
            doc.season_id = None
        else:
            try:
                sid = int(sid)
            except (TypeError, ValueError):
                return "Invalid season."
            if not Season.query.get(sid):
                return "That season doesn't exist."
            doc.season_id = sid
    if not doc.title:
        return "Give the document a title."
    return None


@bp.route("/categories", methods=["GET"])
@permission_required(rbac.DOCUMENTS_VIEW)
def categories():
    return jsonify([{"category": k, "label": v} for k, v in CATEGORIES.items()]), 200


@bp.route("/", methods=["GET"], strict_slashes=False)
@permission_required(rbac.DOCUMENTS_VIEW)
def list_documents():
    docs = Document.query.order_by(Document.created_at.desc()).all()
    return jsonify({"documents": [d.to_dict() for d in docs]}), 200


@bp.route("/<int:doc_id>/download", methods=["GET"])
@permission_required(rbac.DOCUMENTS_VIEW)
def download(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    url = cloudinary.utils.private_download_url(
        doc.public_id, "", resource_type="raw", type="authenticated",
        expires_at=int(time.time()) + LINK_SECONDS, attachment=True,
    )
    return jsonify({"url": url, "file_name": doc.file_name, "expires_in": LINK_SECONDS}), 200


@bp.route("/", methods=["POST"], strict_slashes=False)
@permission_required(rbac.DOCUMENTS_MANAGE)
def upload():
    meta, error = _check_file(request.files.get("file"))
    if error:
        return jsonify({"error": error}), 400
    name, ext, size = meta
    doc = Document(category="other", uploaded_by_id=current_user().id)
    data = dict(request.form)
    data.setdefault("title", name.rsplit(".", 1)[0])
    error = _apply(doc, data)
    if error:
        return jsonify({"error": error}), 400
    doc.public_id = _store(request.files["file"], name)
    doc.file_name, doc.file_ext, doc.size_bytes = name, ext, size
    db.session.add(doc)
    db.session.commit()
    return jsonify({"document": doc.to_dict()}), 201


@bp.route("/<int:doc_id>", methods=["PUT"])
@permission_required(rbac.DOCUMENTS_MANAGE)
def update(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    data = request.form if request.form or request.files else (request.get_json(silent=True) or {})
    error = _apply(doc, data)
    if error:
        db.session.rollback()
        return jsonify({"error": error}), 400
    file = request.files.get("file")
    if file and file.filename:
        meta, error = _check_file(file)
        if error:
            db.session.rollback()
            return jsonify({"error": error}), 400
        old = doc.public_id
        doc.public_id = _store(file, meta[0])
        doc.file_name, doc.file_ext, doc.size_bytes = meta
        _destroy(old)
    db.session.commit()
    return jsonify({"document": doc.to_dict()}), 200


@bp.route("/<int:doc_id>", methods=["DELETE"])
@permission_required(rbac.DOCUMENTS_MANAGE)
def delete(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    public_id = doc.public_id
    db.session.delete(doc)
    db.session.commit()
    _destroy(public_id)
    return jsonify({"message": "Document deleted"}), 200
