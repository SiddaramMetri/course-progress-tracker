import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import UserProgress
from app.schemas.progress import ProgressToggleResponse

DEFAULT_USER_ID = "default-user"


def toggle_lesson(
    db: Session, lesson_id: uuid.UUID
) -> ProgressToggleResponse:
    """Toggle lesson completion for the default user.

    Creates a progress record if none exists, otherwise flips the
    completed flag.
    """
    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.lesson_id == lesson_id,
            UserProgress.user_id == DEFAULT_USER_ID,
        )
        .first()
    )

    if progress is None:
        progress = UserProgress(
            user_id=DEFAULT_USER_ID,
            lesson_id=lesson_id,
            completed=True,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(progress)
    else:
        progress.completed = not progress.completed
        progress.completed_at = (
            datetime.now(timezone.utc) if progress.completed else None
        )

    db.commit()
    db.refresh(progress)

    return ProgressToggleResponse(
        lesson_id=progress.lesson_id,
        completed=progress.completed,
        completed_at=progress.completed_at,
    )
