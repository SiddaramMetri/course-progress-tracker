import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from sqlalchemy.orm import Session as DBSession

from app.models.session import Session
from app.models.user import User

ACCESS_TOKEN_EXPIRY_HOURS = 2
REFRESH_TOKEN_EXPIRY_DAYS = 30


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"), password_hash.encode("utf-8")
    )


def register_user(
    db: DBSession, email: str, password: str, name: str, role: str = "learner"
) -> User:
    """Create a new user with hashed password."""
    user = User(
        email=email,
        password_hash=hash_password(password),
        name=name,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _create_session(db: DBSession, user_id: uuid.UUID) -> Session:
    """Create a new session with access and refresh tokens."""
    now = datetime.now(timezone.utc)
    session = Session(
        user_id=user_id,
        token=str(uuid.uuid4()),
        refresh_token=str(uuid.uuid4()),
        expires_at=now + timedelta(hours=ACCESS_TOKEN_EXPIRY_HOURS),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def login_user(
    db: DBSession, email: str, password: str
) -> tuple[User, str, str] | None:
    """Verify credentials and create a session. Returns (user, token, refresh_token).
    Raises ValueError if account is blocked."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return None

    if user.is_blocked:
        raise ValueError("Account is blocked. Contact your administrator.")

    session = _create_session(db, user.id)
    return user, session.token, session.refresh_token


def get_user_by_token(db: DBSession, token: str) -> User | None:
    """Look up a user by access token. Returns None if expired."""
    session = db.query(Session).filter(Session.token == token).first()
    if not session:
        return None

    now = datetime.now(timezone.utc)
    if session.expires_at < now:
        return None

    return db.query(User).filter(User.id == session.user_id).first()


def refresh_access_token(
    db: DBSession, refresh_token: str
) -> tuple[User, str, str] | None:
    """Use a refresh token to get new access + refresh tokens."""
    session = (
        db.query(Session)
        .filter(Session.refresh_token == refresh_token)
        .first()
    )
    if not session:
        return None

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        return None

    # Delete old session
    db.delete(session)
    db.flush()

    # Create new session with fresh tokens
    new_session = _create_session(db, user.id)
    return user, new_session.token, new_session.refresh_token


def delete_session(db: DBSession, token: str) -> None:
    """Delete a session (logout)."""
    db.query(Session).filter(Session.token == token).delete()
    db.commit()
