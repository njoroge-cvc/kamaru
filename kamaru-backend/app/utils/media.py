"""Cloudinary helpers: keep the media library in sync with the database."""
import logging
import re

import cloudinary.uploader

log = logging.getLogger(__name__)

_VERSION = re.compile(r"^v\d+$")


def public_id_from_url(url):
    """
    Derive a Cloudinary public_id from a delivery URL, keeping folders:
      https://res.cloudinary.com/<cloud>/image/upload/v1751656524/folder/abc.webp -> folder/abc
    Transformation segments before the version (e.g. "c_fill,w_400") are skipped.
    """
    if not url or "/upload/" not in url:
        return None
    path = url.split("/upload/", 1)[1].split("?", 1)[0]
    parts = [p for p in path.split("/") if p]
    # Stored secure_urls always carry a version segment (v123…); everything after it is the
    # public_id. Anchoring on it means folder names are never mistaken for transformations.
    versions = [i for i, seg in enumerate(parts) if _VERSION.match(seg)]
    if versions:
        parts = parts[versions[0] + 1:]
    if not parts:
        return None
    parts[-1] = parts[-1].rsplit(".", 1)[0]
    return "/".join(parts)


def destroy_quietly(url):
    """Delete the asset behind `url` from Cloudinary; never raises (DB changes shouldn't fail on cleanup)."""
    public_id = public_id_from_url(url)
    if not public_id:
        return False
    try:
        result = cloudinary.uploader.destroy(public_id)
        ok = result.get("result") in ("ok", "not found")
        if not ok:
            log.warning("Cloudinary destroy returned %s for %s", result, public_id)
        return ok
    except Exception as exc:  # network / credentials problems
        log.warning("Cloudinary destroy failed for %s: %s", public_id, exc)
        return False
