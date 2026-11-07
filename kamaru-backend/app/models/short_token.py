import secrets
import string
from app import db
from datetime import datetime, timedelta

class ShortToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    short_token = db.Column(db.String(6), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(minutes=15))

    @staticmethod
    def generate_token(user_id):
        """Generates a short token and saves it."""
        # Cryptographically secure code (was `random`, which is predictable)
        alphabet = string.ascii_uppercase + string.digits
        token = ''.join(secrets.choice(alphabet) for _ in range(6))
        expires_at = datetime.utcnow() + timedelta(minutes=15)

        # Store the token in the database
        short_token_entry = ShortToken(user_id=user_id, short_token=token, expires_at=expires_at)
        db.session.add(short_token_entry)
        db.session.commit()

        return token
