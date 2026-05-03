import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import UserProgress
from app.schemas.progress import ProgressToggleResponse


def toggle_lesson(
    db: Session, lesson_id: uuid.UUID, user_id: str = "default-user"
) -> ProgressToggleResponse:
    """Toggle lesson completion for the given user."""
    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.lesson_id == lesson_id,
            UserProgress.user_id == user_id,
        )
        .first()
    )

    if progress is None:
        progress = UserProgress(
            user_id=user_id,
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
