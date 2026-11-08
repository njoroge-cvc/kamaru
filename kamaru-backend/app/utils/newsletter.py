"""Newsletter emails: branded templates and a background sender with delivery counts."""
import html
import logging
import secrets
import threading
from datetime import datetime

from flask import current_app

from app import db
from app.models.newsletter import NewsletterSend, NewsletterSubscriber
from app.utils.email_service import send_email

log = logging.getLogger(__name__)

SITE = "https://kamaruchallenge.africa"
API = "https://kamaru-challenge.onrender.com/api"
LOGO = f"{SITE}/brand/logo.png"


def unsubscribe_url(token):
    return f"{SITE}/unsubscribe?token={token}"


def _layout(inner, unsub_link=None):
    footer_unsub = (
        f'<p style="margin:8px 0 0">Don\'t want these emails? <a href="{unsub_link}" style="color:#B5441B">Unsubscribe</a>.</p>'
        if unsub_link else ""
    )
    return f"""<!doctype html><html><body style="margin:0;background:#FBF3E8;font-family:Arial,Helvetica,sans-serif;color:#2B1A10">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF3E8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff">
<tr><td style="background:#2B1A10;padding:20px 28px"><img src="{LOGO}" alt="Kamaru Challenge" height="40" style="display:block;height:40px"></td></tr>
<tr><td style="padding:28px">{inner}</td></tr>
<tr><td style="background:#2B1A10;color:#E9DCCB;padding:20px 28px;font-size:13px;line-height:1.5">
<p style="margin:0;color:#F4A261;font-weight:bold">Ny&#299;mbo ciit&#363;, M&#299;gambo ya K&#299;hooto na M&#299;tugo</p>
<p style="margin:8px 0 0">Kamaru Challenge &middot; <a href="{SITE}" style="color:#F4A261">kamaruchallenge.africa</a> &middot; Reply to this email to reach us.</p>
{footer_unsub}
</td></tr></table></td></tr></table></body></html>"""


def _button(href, label):
    return (f'<a href="{href}" style="display:inline-block;background:#D57500;color:#2B1A10;font-weight:bold;'
            f'text-decoration:none;padding:12px 24px">{html.escape(label)}</a>')


def blog_email(post, unsub_link):
    url = f"{SITE}/blog/{post.slug}"
    cover = ""
    if post.cover_image_url:
        img = post.cover_image_url.replace("/upload/", "/upload/f_jpg,q_auto,c_limit,w_1200/", 1)
        cover = f'<a href="{url}"><img src="{img}" alt="" width="544" style="display:block;width:100%;max-width:544px;height:auto;margin:0 0 20px"></a>'
    excerpt = html.escape(post.excerpt or "")
    inner = f"""{cover}
<p style="margin:0;color:#B5441B;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">New on the blog</p>
<h1 style="margin:8px 0 12px;font-size:26px;line-height:1.25;color:#2B1A10">{html.escape(post.title)}</h1>
{f'<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#4E3221">{excerpt}</p>' if excerpt else ''}
<p style="margin:0">{_button(url, "Read the full story")}</p>"""
    return _layout(inner, unsub_link)


def confirmation_email(link):
    inner = f"""<h1 style="margin:0 0 12px;font-size:24px;color:#2B1A10">Please confirm your subscription</h1>
<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#4E3221">You signed up for news from the Kamaru Challenge: competition seasons,
community events, cultural programmes and stories from our blog. Please confirm it's you:</p>
<p style="margin:20px 0">{_button(link, "Confirm my subscription")}</p>
<p style="margin:0;font-size:13px;color:#6B4A33">If you didn't sign up, ignore this email and you won't hear from us again.</p>"""
    return _layout(inner)


def send_confirmation(subscriber):
    """(Re)send the confirm-your-subscription email. Returns True if Brevo accepted it."""
    subscriber.verification_token = secrets.token_urlsafe(32)
    link = f"{SITE}/verify-newsletter?token={subscriber.verification_token}"
    ok = send_email(subscriber.email, "Please confirm your Kamaru Challenge subscription", confirmation_email(link))
    if ok:
        subscriber.last_confirmation_sent_at = datetime.utcnow()
    return ok


def recipients():
    """Everyone who signed up and hasn't unsubscribed (the team's choice: not only confirmed)."""
    return NewsletterSubscriber.query.filter(NewsletterSubscriber.unsubscribed_at.is_(None)).order_by(NewsletterSubscriber.id).all()


def _deliver(app, send_id, post_id, subscriber_ids, subject):
    from app.models.blog import BlogPost

    with app.app_context():
        record = NewsletterSend.query.get(send_id)
        post = BlogPost.query.get(post_id)
        delivered = failed = 0
        for sid in subscriber_ids:
            sub = NewsletterSubscriber.query.get(sid)
            if not sub or sub.unsubscribed_at:
                continue
            token = sub.ensure_unsubscribe_token()
            db.session.commit()
            link = unsubscribe_url(token)
            try:
                ok = send_email(sub.email, subject, blog_email(post, link),
                                headers={"List-Unsubscribe": f"<{link}>"})
            except Exception:  # one bad address never stops the rest
                log.exception("Newsletter send failed for subscriber %s", sid)
                ok = False
            delivered += 1 if ok else 0
            failed += 0 if ok else 1
            record.delivered, record.failed = delivered, failed
            db.session.commit()
        record.status = "sent" if delivered else "failed"
        record.finished_at = datetime.utcnow()
        db.session.commit()


def start_blog_send(post, user, test_email=None):
    """Create the send record and deliver in a background thread. Returns the record."""
    subject = post.title if not test_email else f"[Test] {post.title}"
    if test_email:
        record = NewsletterSend(subject=subject, blog_post_id=post.id, kind="test", recipients=1, sent_by_id=user.id if user else None)
        db.session.add(record)
        db.session.commit()
        ok = send_email(test_email, subject, blog_email(post, unsubscribe_url("example")))
        record.delivered, record.failed = (1, 0) if ok else (0, 1)
        record.status = "sent" if ok else "failed"
        record.finished_at = datetime.utcnow()
        db.session.commit()
        return record

    subs = recipients()
    record = NewsletterSend(subject=subject, blog_post_id=post.id, kind="blog", recipients=len(subs), sent_by_id=user.id if user else None)
    db.session.add(record)
    db.session.commit()
    app = current_app._get_current_object()
    if current_app.config.get("NEWSLETTER_SYNC"):  # tests
        _deliver(app, record.id, post.id, [s.id for s in subs], subject)
    else:
        threading.Thread(target=_deliver, args=(app, record.id, post.id, [s.id for s in subs], subject), daemon=True).start()
    return record
