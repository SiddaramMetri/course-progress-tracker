import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class NotificationOut(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationCreate(BaseModel):
    user_id: uuid.UUID | None = None  # None = send to all learners
    user_ids: list[uuid.UUID] | None = None  # Send to multiple specific users
    title: str
    message: str


# --- Learner endpoints ---


@router.get("", response_model=list[NotificationOut])
def list_my_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get current user's notifications."""
    return (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    count = (
        db.query(func.count(Notification.id))
        .filter(
            Notification.user_id == user.id,
            Notification.is_read.is_(False),
        )
        .scalar()
        or 0
    )
    return {"count": count}


@router.post("/{notification_id}/read")
def mark_as_read(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Not found")
    notif.is_read = True
    db.commit()
    return {"status": "ok"}


@router.post("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read.is_(False),
    ).update({"is_read": True})
    db.commit()
    return {"status": "ok"}


# --- Admin endpoints ---


@router.post("/send", status_code=201)
def send_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Send notification to a specific user, multiple users, or all learners."""
    if data.user_ids and len(data.user_ids) > 0:
        # Send to multiple specific users
        for uid in data.user_ids:
            notif = Notification(
                user_id=uid,
                title=data.title,
                message=data.message,
            )
            db.add(notif)
        db.commit()
        return {"sent_to": len(data.user_ids)}
    elif data.user_id:
        notif = Notification(
            user_id=data.user_id,
            title=data.title,
            message=data.message,
        )
        db.add(notif)
        db.commit()
        return {"sent_to": 1}
    else:
        learners = (
            db.query(User)
            .filter(User.role == "learner", User.is_blocked.is_(False))
            .all()
        )
        for learner in learners:
            notif = Notification(
                user_id=learner.id,
                title=data.title,
                message=data.message,
            )
            db.add(notif)
        db.commit()
        return {"sent_to": len(learners)}
