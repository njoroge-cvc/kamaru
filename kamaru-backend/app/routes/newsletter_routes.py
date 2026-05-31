from flask import Blueprint, request, jsonify
from app import db
from app.models.newsletter import NewsletterSubscriber
from app.utils.email_service import send_email

from datetime import datetime
import secrets

bp = Blueprint("newsletter_routes", __name__)

# Subscribe to Newsletter
@bp.route("/newsletter/subscribe", methods=["POST"])
def subscribe_newsletter():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    email = data.get("email")

    # Validation if not email:
    if not email:
        return jsonify({
            "error": "Email is required"
        }), 400

    existing = (
        NewsletterSubscriber.query.filter_by(
            email=email
        ).first()
    )

    # --------------------------------------------------- 
    # Already verified subscriber 
    # ---------------------------------------------------

    if existing and existing.is_verified:
            return jsonify({
                "error": "You are already subscribed to the newsletter!"
            }), 409
    

    # --------------------------------------------------- 
    # Existing but not verified 
    # Resend verification email 
    # ---------------------------------------------------
    
    if existing and not existing.is_verified: 
        
        verification_token = secrets.token_urlsafe(32)

        existing.verification_token = verification_token

        verification_link = (
            "https://kamaruchallenge.africa/verify-newsletter"
            f"?token={verification_token}"
        )

        subject = (
            "Confirm your subscription to Kamaru Challenge Newsletter"
        )

        content = f"""
        <h2>Confirm your subscription to the Kamaru Challenge Newsletter!</h2>

        <p>
        We noticed your subscription is not yet verified.
        </p>

        <p>
        Please confirm your subscription by clicking the link below:
        </p>

        <p>
        <a href="{verification_link}" 
            style="
                display: inline-block; 
                padding: 10px 20px; 
                background-color: #D57500; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px;">
            Confirm Subscription
        </a>
        </p>

        <p>
        If you did not subscribe to this newsletter, please ignore this email.
        </p>
        """

        email_sent = send_email(
            email,
            subject,
            content
        )

        if not email_sent:
            return jsonify({
                "error": "Failed to resend verification email. Please try again later."
            }), 500
        
        db.session.commit()

        return jsonify({
            "message": "A new verification email has been sent to your email address. Please check your inbox and click the verification link to confirm your subscription."
        }), 200
    
    # --------------------------------------------------- 
    # New Subscriber
    # ---------------------------------------------------
  
    verification_token = (
        secrets.token_urlsafe(32)
    )

    verification_link = (
        "https://kamaruchallenge.africa/verify-newsletter"
        f"?token={verification_token}"
    )

    subject = (
        "Confirm your subscription to Kamaru Challenge Newsletter"
    )

    content = f"""
    <h2>Welcome to the Kamaru Challenge Newsletter!</h2>

    <p>
    Thank you for your interest in our community and for subscribing to our newsletter.
    </p>

    <p>
    Please confirm your subscription by clicking the button below:
    </p>

    <p>
    <a href="{verification_link}" 
        style="
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #D57500; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;">
        Confirm Subscription
    </a>
    </p>

    <p>
    If you did not subscribe to this newsletter, please ignore this email.
    </p>
    """

    send_email(
        email,
        subject,
        content
    )

    if not email_sent:
        return jsonify({
            "error": "Failed to send verification email. Please try again later."
        }), 500
    
    subscriber = NewsletterSubscriber(
        email=email,
        verification_token=verification_token,
        is_verified=False
    )

    db.session.add(subscriber)
    db.session.commit()

    return jsonify({
        "message": "Verification email sent successfully. Please check your inbox and click the verification link to confirm your subscription."
    }), 201

# --------------------------------------------------------
# Newsletter Verification Route
# --------------------------------------------------------

@bp.route(
    "/newsletter/verify",
    methods=["GET"]
)
def verify_newsletter():

    token = request.args.get(
        "token"
    )

    if not token:
        return jsonify({
            "error": "Verification token is required"
        }), 400

    subscriber = (
        NewsletterSubscriber.query.filter_by(
            verification_token=token
        ).first()
    )

    if not subscriber:
        return jsonify({
            "error": "Invalid verification token"
        }), 404
    
    if subscriber.is_verified:
        return jsonify({
            "message": "Subscription already verified!"
        }), 200
    
    subscriber.is_verified = True
    subscriber.verified_at = datetime.utcnow()
    subscriber.verification_token = None

    db.session.commit()

    # ---------------------------------------------------------
    # Send Welcome Email
    # ---------------------------------------------------------

    welcome_subject = (
        "Welcome to the Kamaru Challenge Community!"
    )

    welcome_content = f"""
    <h2>Thank you for joining the Kamaru Challenge Community!</h2>

    <p>
    You will now receive updates
    about:
    </p>

    <ul>
      <li>Competition Seasons</li> 
      <li>Community Events</li> 
      <li>Cultural Programs</li> 
      <li>News and Announcements</li> 
      <li>Opportunities to Participate</li>
    </ul>

    <p>
    Together we continue
    fanning the flame of values.
    </p>

    <p> 
    Visit: 
    <a href="https://kamaruchallenge.africa"> 
        kamaruchallenge.africa 
    </a> 
    </p>
    """

    send_email(
        subscriber.email,
        welcome_subject,
        welcome_content
    )

    return jsonify({
        "message": "Subscription verified successfully!"
    }), 200                                     

# Contact Us Form Handler
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
    subject = f"New Message from {name}"
    content = f"""
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Message:</strong></p>
    <p>{message}</p>
    """

    # Send email to the designated admin
    if send_email(
        "info@kamaruchallenge.africa", 
        subject, 
        content
    ):
        return jsonify({
            "message": "Message sent successfully!"
        }), 200
    else:
        return jsonify({"error": "Failed to send message"}), 500
