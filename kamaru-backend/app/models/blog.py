import re
import unicodedata
from datetime import datetime, timezone

from app import db


def slugify(text):
    """'Kĩhooto: fairness that holds' -> 'kihooto-fairness-that-holds' (macrons folded to ASCII)."""
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:200] or "post"


class BlogPost(db.Model):
    """A blog article about Kikuyu culture. `content` is plain text with light formatting
    (## headings, - lists, **bold**), rendered by the frontend; never raw HTML."""

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False, unique=True, index=True)
    excerpt = db.Column(db.Text, nullable=True)
    content = db.Column(db.Text, nullable=False)
    cover_image_url = db.Column(db.String(500), nullable=True)  # Cloudinary URL
    published = db.Column(db.Boolean, nullable=False, default=False)
    published_at = db.Column(db.DateTime, nullable=True)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    # Byline shown on the post (optional; falls back to the account's username)
    author_name = db.Column(db.String(120), nullable=True)
    author_title = db.Column(db.String(120), nullable=True)  # profession / niche, e.g. "Historian"
    author_org = db.Column(db.String(160), nullable=True)  # organisation
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    author = db.relationship("User", lazy="joined")

    def to_dict(self, with_content=True, include_newsletter=False):
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt or "",
            "cover_image_url": self.cover_image_url,
            "published": self.published,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "author": self.author_name or (self.author.username if self.author and hasattr(self.author, "username") else None),
            "author_name": self.author_name or "",
            "author_title": self.author_title or "",
            "author_org": self.author_org or "",
        }
        if with_content:
            data["content"] = self.content
        if include_newsletter:  # admin only
            from app.models.newsletter import NewsletterSend  # local import avoids a cycle
            last = (NewsletterSend.query.filter_by(blog_post_id=self.id, kind="blog")
                    .order_by(NewsletterSend.created_at.desc()).first())
            data["newsletter"] = last.to_dict() if last else None
        return data
