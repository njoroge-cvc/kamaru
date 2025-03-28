import os
import cloudinary
from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

app.config["BREVO_API_KEY"] = os.getenv("BREVO_API_KEY")
app.config["BREVO_SENDER_EMAIL"] = os.getenv("BREVO_SENDER_EMAIL")

# Configure Cloudinary using CLOUDINARY_URL from .env
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Database configuration using environment variables
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Import and register routes
from app.routes import user_routes, event_routes, participant_routes, gallery_routes, video_routes, stat_routes

app.register_blueprint(user_routes.bp, url_prefix="/api/users")
app.register_blueprint(event_routes.bp, url_prefix="/api/events", strict_slashes=False)
app.register_blueprint(stat_routes.bp, url_prefix="/api/stats")
app.register_blueprint(participant_routes.bp, url_prefix="/api/participants")
app.register_blueprint(gallery_routes.bp, url_prefix="/api/gallery")
app.register_blueprint(video_routes.bp, url_prefix="/api/videos")
