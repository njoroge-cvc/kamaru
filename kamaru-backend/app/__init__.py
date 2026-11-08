import os
import logging
from datetime import timedelta
from urllib.parse import quote_plus  # URL-encode the database password

import cloudinary
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import OperationalError
from sqlalchemy.sql import text

# Load environment variables
load_dotenv()

# Log level from env (DEBUG locally if you want it; INFO in production)
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())

# Initialize Flask app
app = Flask(__name__)

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
db_user = os.getenv("DB_USER")
db_password = quote_plus(os.getenv("DB_PASSWORD") or "")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?sslmode=require"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# One pool, owned by Flask-SQLAlchemy (previously a second, unused engine doubled connections).
# pre_ping transparently replaces connections the Supabase pooler has closed.
app.config.setdefault("SQLALCHEMY_ENGINE_OPTIONS", {
    "pool_pre_ping": True,
    "pool_recycle": 900,
    "pool_size": 5,
    "max_overflow": 10,
    "pool_timeout": 30,
})

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
# Flask-JWT-Extended defaults to 15-minute tokens, which logged participants out
# mid-registration. Configurable via env; defaults to 12 hours.
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=int(os.getenv("JWT_ACCESS_TOKEN_HOURS", "12")))

# ---------------------------------------------------------------------------
# Extensions
# ---------------------------------------------------------------------------
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Rate limiting: protects login, password reset, contact and newsletter from abuse.
# In-memory storage is per process; set RATELIMIT_STORAGE_URI (e.g. redis://…) when scaling out.
app.config["RATELIMIT_HEADERS_ENABLED"] = True
limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=os.getenv("RATELIMIT_STORAGE_URI", "memory://"),
    default_limits=[],
)

# Behind Render's proxy the client IP is in X-Forwarded-For
if os.getenv("BEHIND_PROXY", "true").lower() == "true":
    from werkzeug.middleware.proxy_fix import ProxyFix

    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)


@app.errorhandler(429)
def handle_rate_limit(e):
    return jsonify({"error": "Too many attempts. Please wait a few minutes and try again."}), 429


@app.errorhandler(OperationalError)
def handle_operational_error(e):
    """Handle database connection errors gracefully."""
    db.session.rollback()
    return {"error": "Database connection error. Please try again later."}, 500


# CORS: only the production site and local development
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "http://localhost:5000", "https://kamaruchallenge.africa", "https://www.kamaruchallenge.africa"],
    "supports_credentials": True,
}})

# Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# Email (Brevo)
app.config["BREVO_API_KEY"] = os.getenv("BREVO_API_KEY")
app.config["BREVO_SENDER_EMAIL"] = os.getenv("BREVO_SENDER_EMAIL")
app.config["NEWSLETTER_REPLY_TO"] = os.getenv("NEWSLETTER_REPLY_TO", "info@kamaruchallenge.africa")


@app.route("/db_stats", methods=["GET"])
def db_stats():
    """Active database connections — administrators only."""
    from flask_jwt_extended import verify_jwt_in_request
    from app.utils.rbac import current_user, has_permission, USERS

    verify_jwt_in_request()
    if not has_permission(current_user(), USERS):
        return {"error": "You don't have permission to do that."}, 403
    result = db.session.execute(text("SELECT COUNT(*) FROM pg_stat_activity"))
    return {"active_connections": result.scalar()}


# ---------------------------------------------------------------------------
# Blueprints
# ---------------------------------------------------------------------------
from app.routes import (  # noqa: E402
    user_routes,
    event_routes,
    participant_routes,
    gallery_routes,
    video_routes,
    stat_routes,
    newsletter_routes,
    contact_routes,
    sys_images_routes,
    season_routes,
    blog_routes,
    health_routes,
)

app.register_blueprint(user_routes.bp, url_prefix="/api/users")
app.register_blueprint(event_routes.bp, url_prefix="/api/events", strict_slashes=False)
app.register_blueprint(stat_routes.bp, url_prefix="/api/stats")
app.register_blueprint(newsletter_routes.bp, url_prefix="/api")
app.register_blueprint(contact_routes.bp, url_prefix="/api")
app.register_blueprint(participant_routes.bp, url_prefix="/api/participants")
app.register_blueprint(gallery_routes.bp, url_prefix="/api/gallery")
app.register_blueprint(sys_images_routes.bp, url_prefix="/api/sys_images")
app.register_blueprint(video_routes.bp, url_prefix="/api/videos")
app.register_blueprint(season_routes.bp, url_prefix="/api/seasons")
app.register_blueprint(blog_routes.bp, url_prefix="/api/blog", strict_slashes=False)
app.register_blueprint(health_routes.bp, url_prefix="/api/health")
