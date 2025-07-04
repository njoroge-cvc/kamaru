from flask import Blueprint, request, jsonify
from app import db
from app.models.newsletter import NewsletterSubscriber
from app.utils.email_service import send_email

bp = Blueprint("newsletter_routes", __name__)

# 📩 Subscribe to Newsletter
@bp.route("/newsletter/subscribe", methods=["POST"])
def subscribe_newsletter():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Check for duplicate subscriptions
    if NewsletterSubscriber.query.filter_by(email=email).first():
        return jsonify({"error": "Email is already subscribed"}), 409

    # Save the new subscriber
    subscriber = NewsletterSubscriber(email=email)
    db.session.add(subscriber)
    db.session.commit()

    return jsonify({"message": "Subscribed successfully!"}), 201

# 📬 Contact Us Form Handler
@bp.route("/contact", methods=["POST"])
def contact_us():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    # Validation
    if not name or not email or not message:
        return jsonify({"error": "All fields are required"}), 400

    # Prepare email
    subject = f"New Contact Us Message from {name}"
    content = f"""
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Message:</strong></p>
    <p>{message}</p>
    """

    # Send email to the designated admin
    if send_email("info@kamaruchallenge.africa", subject, content):
        return jsonify({"message": "Message sent successfully!"}), 200
    else:
        return jsonify({"error": "Failed to send message"}), 500
