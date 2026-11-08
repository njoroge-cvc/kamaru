from flask import Blueprint, jsonify
from app.models.event import Event
from app.models.participant import Participant
from app.models.user import User
from app.models.video import Video
from app.models.gallery import Gallery
from app import db

bp = Blueprint("stats_routes", __name__)

@bp.route("/", methods=["GET", "OPTIONS"])
def get_stats():
    try:
        total_events = db.session.query(Event).count()
        total_participants = db.session.query(Participant).count()
        total_users = db.session.query(User).count()
        total_videos = db.session.query(Video).count()
        total_gallery_items = db.session.query(Gallery).count()

        stats = {
            "total_events": total_events,
            "total_participants": total_participants,
            "total_users": total_users,
            "total_videos": total_videos,
            "total_gallery_items": total_gallery_items,
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------------------------
# Dashboard breakdowns (staff only), used for the admin overview charts.
# Data volumes are small, so grouping happens in Python: portable across Postgres/SQLite.
# ---------------------------------------------------------------------------
from collections import Counter  # noqa: E402
from datetime import datetime, timezone  # noqa: E402

from app.models.season import Season  # noqa: E402
from app.models.newsletter import NewsletterSubscriber  # noqa: E402
from app.models.blog import BlogPost  # noqa: E402
from app.utils import rbac  # noqa: E402
from app.utils.rbac import permission_required  # noqa: E402


def _last_months(n=12):
    now = datetime.now(timezone.utc)
    y, m = now.year, now.month
    out = []
    for _ in range(n):
        out.append(f"{y:04d}-{m:02d}")
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    return list(reversed(out))


def _by_month(dates, n=12):
    months = _last_months(n)
    counts = Counter(d.strftime("%Y-%m") for d in dates if d)
    return [{"month": mo, "count": counts.get(mo, 0)} for mo in months]


@bp.route("/dashboard", methods=["GET"])
@permission_required(rbac.STATS)
def dashboard_stats():
    participants = db.session.query(Participant.category, Participant.season_id, Participant.registered_at).all()
    seasons = {s.id: s for s in Season.query.order_by(Season.year).all()}

    # "Folk Songs" (Season 2's name) counts as today's "Folk Songs and Dances"
    from app.routes.participant_routes import CATEGORY_ALIASES
    by_category = Counter(CATEGORY_ALIASES.get(p.category, p.category) for p in participants)
    by_season = Counter(p.season_id for p in participants)
    season_rows = [
        {"season": s.name, "year": s.year, "count": by_season.get(s.id, 0), "active": bool(s.is_active)}
        for s in seasons.values()
    ]

    # Members vs each staff role (a person holding two roles counts under both)
    roles = Counter()
    for u in User.query.all():
        for r in (u.roles or ["member"]):
            roles[r] += 1
    subs = db.session.query(NewsletterSubscriber.is_verified, NewsletterSubscriber.subscribed_at).all()
    posts = db.session.query(BlogPost.published).all()

    return jsonify({
        "participants_by_category": [{"category": c, "count": n} for c, n in by_category.most_common()],
        "participants_by_season": season_rows,
        "registrations_by_month": _by_month([p.registered_at for p in participants]),
        "users_by_role": [{"role": r or "member", "count": n} for r, n in roles.most_common()],
        "subscribers": {
            "total": len(subs),
            "verified": sum(1 for s in subs if s.is_verified),
            "by_month": _by_month([s.subscribed_at for s in subs]),
        },
        "blog": {"published": sum(1 for (p,) in posts if p), "drafts": sum(1 for (p,) in posts if not p)},
    }), 200
