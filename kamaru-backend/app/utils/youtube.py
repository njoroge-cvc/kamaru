"""YouTube link parsing: mirrors kamaru-frontend/src/utils/youtube.js."""
import re
from urllib.parse import parse_qs, urlparse

_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


def extract_youtube_id(value):
    """Return the 11-character video ID from any common YouTube link, or None."""
    raw = (value or "").strip()
    if _ID.match(raw):
        return raw
    if not re.match(r"^https?://", raw, re.I):
        raw = "https://" + raw
    try:
        url = urlparse(raw)
    except ValueError:
        return None
    host = re.sub(r"^(www|m|music)\.", "", (url.hostname or "").lower())
    parts = [p for p in url.path.split("/") if p]

    if host == "youtu.be":
        return parts[0] if parts and _ID.match(parts[0]) else None
    if host in ("youtube.com", "youtube-nocookie.com"):
        v = (parse_qs(url.query).get("v") or [None])[0]
        if v and _ID.match(v):
            return v
        if len(parts) >= 2 and parts[0] in ("shorts", "live", "embed", "v", "e") and _ID.match(parts[1]):
            return parts[1]
    return None


def watch_url(video_id):
    return f"https://www.youtube.com/watch?v={video_id}"
