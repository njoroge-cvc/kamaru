from flask import Blueprint, request, jsonify
from app import db, limiter
from app.models.newsletter import NewsletterSubscriber, NewsletterSend
from app.utils.email_service import send_email

from datetime import datetime
import secrets

bp = Blueprint("newsletter_routes", __name__)

# --------------------------------------------------------
# Newsletter Subscription Route
# --------------------------------------------------------

@bp.route("/newsletter/subscribe", methods=["POST"])
@limiter.limit("5 per hour")
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

    if existing and existing.unsubscribed_at:
        existing.unsubscribed_at = None  # they're opting back in
        db.session.commit()

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
        <h2>Hello,</h2>

        <p>
        We noticed your subscription to our Newsletter is not yet verified.
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
            "message": "A new verification email has been sent to your email address. Please check your inbox and click the verification button to confirm your subscription."
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

    email_sent = send_email(
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

@bp.route("/newsletter/verify", methods=["GET"])
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



# --------------------------------------------------------
# Public: one-click unsubscribe (link in every newsletter)
# --------------------------------------------------------
@bp.route("/newsletter/unsubscribe", methods=["GET", "POST"])
@limiter.limit("30 per hour")
def unsubscribe():
    token = request.args.get("token") or (request.get_json(silent=True) or {}).get("token")
    sub = NewsletterSubscriber.query.filter_by(unsubscribe_token=token).first() if token else None
    if not sub:
        return jsonify({"error": "This unsubscribe link isn't valid. It may be from a test email."}), 404
    if not sub.unsubscribed_at:
        sub.unsubscribed_at = datetime.utcnow()
        db.session.commit()
    return jsonify({"message": "You've been unsubscribed.", "email": sub.email}), 200


# --------------------------------------------------------
# Staff: subscribers and sends
# --------------------------------------------------------
from app.utils import rbac  # noqa: E402
from app.utils.rbac import permission_required  # noqa: E402
from app.utils.newsletter import send_confirmation, recipients  # noqa: E402
import re  # noqa: E402

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@bp.route("/newsletter/subscribers", methods=["GET"])
@permission_required(rbac.NEWSLETTER)
def list_subscribers():
    subs = NewsletterSubscriber.query.order_by(NewsletterSubscriber.subscribed_at.desc().nullslast()).all()
    return jsonify({"subscribers": [s.to_dict() for s in subs], "recipients": len(recipients())}), 200


@bp.route("/newsletter/subscribers", methods=["POST"])
@permission_required(rbac.NEWSLETTER)
def add_subscriber():
    email = ((request.get_json(silent=True) or {}).get("email") or "").strip().lower()
    if not EMAIL_RE.match(email):
        return jsonify({"error": "Enter a valid email address."}), 400
    existing = NewsletterSubscriber.query.filter(db.func.lower(NewsletterSubscriber.email) == email).first()
    if existing and not existing.unsubscribed_at:
        return jsonify({"error": "That email is already on the list."}), 409
    if existing:
        return jsonify({"error": "That person unsubscribed. They can sign up again from the website footer."}), 409
    sub = NewsletterSubscriber(email=email, is_verified=False)
    sub.ensure_unsubscribe_token()
    db.session.add(sub)
    db.session.commit()
    send_confirmation(sub)
    db.session.commit()
    return jsonify({"subscriber": sub.to_dict()}), 201


@bp.route("/newsletter/subscribers/<int:sid>", methods=["DELETE"])
@permission_required(rbac.NEWSLETTER)
def remove_subscriber(sid):
    sub = NewsletterSubscriber.query.get(sid)
    if not sub:
        return jsonify({"error": "Subscriber not found"}), 404
    db.session.delete(sub)
    db.session.commit()
    return jsonify({"message": "Removed"}), 200


# Resend confirmation links: {"ids": [...]} or {"all_unconfirmed": true}
@bp.route("/newsletter/subscribers/resend-confirmation", methods=["POST"])
@permission_required(rbac.NEWSLETTER)
def resend_confirmation():
    data = request.get_json(silent=True) or {}
    q = NewsletterSubscriber.query.filter(NewsletterSubscriber.unsubscribed_at.is_(None),
                                          db.or_(NewsletterSubscriber.is_verified.is_(None), NewsletterSubscriber.is_verified.is_(False)))
    if not data.get("all_unconfirmed"):
        ids = [i for i in (data.get("ids") or []) if isinstance(i, int)]
        if not ids:
            return jsonify({"error": "No subscribers selected"}), 400
        q = q.filter(NewsletterSubscriber.id.in_(ids))
    sent = failed = 0
    for sub in q.all():
        if send_confirmation(sub):
            sent += 1
        else:
            failed += 1
        db.session.commit()
    return jsonify({"sent": sent, "failed": failed}), 200


@bp.route("/newsletter/sends", methods=["GET"])
@permission_required(rbac.NEWSLETTER)
def list_sends():
    sends = NewsletterSend.query.order_by(NewsletterSend.created_at.desc()).limit(100).all()
    return jsonify({"sends": [s.to_dict() for s in sends]}), 200
