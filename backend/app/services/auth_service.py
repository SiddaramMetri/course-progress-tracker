import uuid

import bcrypt
from sqlalchemy.orm import Session as DBSession

from app.models.session import Session
from app.models.user import User


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


def login_user(
    db: DBSession, email: str, password: str
) -> tuple[User, str] | None:
    """Verify credentials and create a session token."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return None

    token = str(uuid.uuid4())
    session = Session(user_id=user.id, token=token)
    db.add(session)
    db.commit()

    return user, token


def get_user_by_token(db: DBSession, token: str) -> User | None:
    """Look up a user by session token."""
    session = (
        db.query(Session).filter(Session.token == token).first()
    )
    if not session:
        return None
    return (
        db.query(User).filter(User.id == session.user_id).first()
    )


def delete_session(db: DBSession, token: str) -> None:
    """Delete a session (logout)."""
    db.query(Session).filter(Session.token == token).delete()
    db.commit()
