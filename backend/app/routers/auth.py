from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.user import (
    LoginResponse,
    ProfileUpdate,
    UserCreate,
    UserLogin,
    UserOut,
)
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_to_out(user: User) -> UserOut:
    """Convert User model to UserOut with batch info."""
    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        mobile=user.mobile,
        role=user.role,
        batch_name=user.batch.name if user.batch else None,
        batch_start=str(user.batch.start_date) if user.batch and user.batch.start_date else None,
        batch_end=str(user.batch.end_date) if user.batch and user.batch.end_date else None,
    )


@router.post("/login", response_model=LoginResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password."""
    result = auth_service.login_user(db, data.email, data.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user, token = result
    return LoginResponse(token=token, user=_user_to_out(user))


@router.post("/register", response_model=UserOut, status_code=201)
def register(
    data: UserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Create a new user (admin only)."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")
    user = auth_service.register_user(
        db, data.email, data.password, data.name, data.role
    )
    return _user_to_out(user)


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    """Get the current authenticated user."""
    return _user_to_out(user)


@router.put("/profile", response_model=UserOut)
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update current user's profile."""
    if data.name is not None:
        user.name = data.name
    if data.mobile is not None:
        user.mobile = data.mobile
    db.commit()
    db.refresh(user)
    return _user_to_out(user)
