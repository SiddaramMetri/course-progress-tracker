from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services import auth_service


def get_current_user(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> User:
    """Extract user from Bearer token in Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization[7:]
    user = auth_service.get_user_by_token(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if user.is_blocked:
        raise HTTPException(status_code=403, detail="Account is blocked")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Require admin role, raise 403 otherwise."""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
