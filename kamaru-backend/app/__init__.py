import os
import cloudinary
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.sql import text
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import time

# Load environment variables
load_dotenv()

# Enable debug logging globally
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)

# Database configuration using environment variables
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Retry logic for database connection
def retry_on_operational_error(func, retries=3, delay=5):
    for attempt in range(retries):
        try:
            return func()
        except OperationalError as e:
            if attempt < retries - 1:
                print(f"Retrying database connection... (Attempt {attempt + 1})")
                time.sleep(delay)
            else:
                print("Max retries reached. Could not connect to the database.")
                raise e

# Create the SQLAlchemy engine with retry logic
engine = retry_on_operational_error(
    lambda: create_engine(
        app.config["SQLALCHEMY_DATABASE_URI"],
        pool_size=5,  # Initial pool size
        max_overflow=10,  # Allow up to 10 additional connections
        pool_timeout=30,  # Timeout for acquiring a connection
        pool_recycle=900,  # Recycle connections after 15 minutes
    )
)

# Check the number of active connections (optional for debugging)
@app.route("/db_stats", methods=["GET"])
def db_stats():
    """Return the number of active database connections."""
    with engine.connect() as connection:
        result = connection.execute(text("SELECT COUNT(*) FROM pg_stat_activity"))
        return {"active_connections": result.scalar()}

# Create a scoped session
Session = scoped_session(sessionmaker(bind=engine))

@app.teardown_appcontext
def shutdown_session(exception=None):
    """Ensure database sessions are properly closed after each request."""
    Session.remove()

# Global error handler for OperationalError
@app.errorhandler(OperationalError)
def handle_operational_error(e):
    """Handle database connection errors gracefully."""
    return {"error": "Database connection error. Please try again later."}, 500

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", 
                "https://kamaruchallenge.africa"],
                "supports_credentials": True
                }})

# Configure Cloudinary using CLOUDINARY_URL from .env
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Additional configurations
app.config["BREVO_API_KEY"] = os.getenv("BREVO_API_KEY")
app.config["BREVO_SENDER_EMAIL"] = os.getenv("BREVO_SENDER_EMAIL")

# Import and register routes
from app.routes import (
    user_routes,
    event_routes,
    participant_routes,
    gallery_routes,
    video_routes,
    stat_routes,
    newsletter_routes,
    sys_images_routes,
)

app.register_blueprint(user_routes.bp, url_prefix="/api/users")
app.register_blueprint(event_routes.bp, url_prefix="/api/events", strict_slashes=False)
app.register_blueprint(stat_routes.bp, url_prefix="/api/stats")
app.register_blueprint(newsletter_routes.bp, url_prefix="/api")
app.register_blueprint(participant_routes.bp, url_prefix="/api/participants")
app.register_blueprint(gallery_routes.bp, url_prefix="/api/gallery")
app.register_blueprint(sys_images_routes.bp, url_prefix="/api/sys_images")
app.register_blueprint(video_routes.bp, url_prefix="/api/videos")
