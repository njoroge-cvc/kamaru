import secrets
from datetime import datetime

from app import db


class NewsletterSubscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(64), unique=True, nullable=True)
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified_at = db.Column(db.DateTime, nullable=True)

    # One-click unsubscribe link in every newsletter; unsubscribed people are kept (marked) so
    # they can't be re-added by accident, and receive nothing.
    unsubscribe_token = db.Column(db.String(64), unique=True, nullable=True)
    unsubscribed_at = db.Column(db.DateTime, nullable=True)
    last_confirmation_sent_at = db.Column(db.DateTime, nullable=True)

    def ensure_unsubscribe_token(self):
        if not self.unsubscribe_token:
            self.unsubscribe_token = secrets.token_urlsafe(32)
        return self.unsubscribe_token

    @property
    def status(self):
        if self.unsubscribed_at:
            return "unsubscribed"
        return "confirmed" if self.is_verified else "unconfirmed"

    def to_dict(self):
        # Tokens are never exposed
        return {
            "id": self.id,
            "email": self.email,
            "status": self.status,
            "is_verified": bool(self.is_verified),
            "subscribed_at": self.subscribed_at.isoformat() if self.subscribed_at else None,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "unsubscribed_at": self.unsubscribed_at.isoformat() if self.unsubscribed_at else None,
            "last_confirmation_sent_at": self.last_confirmation_sent_at.isoformat() if self.last_confirmation_sent_at else None,
        }


class NewsletterSend(db.Model):
    """One newsletter send (or a test send), with delivery counts."""

    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(255), nullable=False)
    blog_post_id = db.Column(db.Integer, db.ForeignKey("blog_post.id", ondelete="SET NULL"), nullable=True, index=True)
    kind = db.Column(db.String(20), nullable=False, default="blog")  # blog | test | confirmation
    status = db.Column(db.String(20), nullable=False, default="sending")  # sending | sent | failed
    recipients = db.Column(db.Integer, nullable=False, default=0)
    delivered = db.Column(db.Integer, nullable=False, default=0)
    failed = db.Column(db.Integer, nullable=False, default=0)
    sent_by_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    finished_at = db.Column(db.DateTime, nullable=True)

    sent_by = db.relationship("User", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "subject": self.subject,
            "blog_post_id": self.blog_post_id,
            "kind": self.kind,
            "status": self.status,
            "recipients": self.recipients,
            "delivered": self.delivered,
            "failed": self.failed,
            "sent_by": self.sent_by.username if self.sent_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
        }
