"""Health check for uptime monitors (e.g. UptimeRobot keyword monitor on "connected").

GET/HEAD /api/health
  200 {"status": "ok", "database": "connected", ...}     app and database are up
  503 {"status": "error", "database": "unavailable", ...} database unreachable

The failure body deliberately avoids the word "connected" (e.g. "disconnected"),
so a keyword monitor can never mistake an outage for success.
"""
import logging
import time
from datetime import datetime, timezone

from flask import Blueprint, jsonify
from sqlalchemy import text

from app import db

bp = Blueprint("health_routes", __name__)
log = logging.getLogger(__name__)


@bp.route("", methods=["GET", "HEAD"], strict_slashes=False)
def health():
    started = time.perf_counter()
    try:
        if db.engine.dialect.name == "postgresql":
            # Never let a stuck database hang the monitor: give up after 5 seconds
            db.session.execute(text("SET LOCAL statement_timeout = 5000"))
        db.session.execute(text("SELECT 1"))
        db.session.commit()
        ok = True
    except Exception:  # any DB failure means "unavailable"; details go to the logs only
        log.exception("Health check: database query failed")
        db.session.rollback()
        ok = False

    body = {
        "status": "ok" if ok else "error",
        "database": "connected" if ok else "unavailable",
        "db_latency_ms": round((time.perf_counter() - started) * 1000, 1),
        "time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    resp = jsonify(body)
    resp.status_code = 200 if ok else 503
    resp.headers["Cache-Control"] = "no-store"
    return resp
