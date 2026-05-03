import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Course, Lesson, Module
from app.models.user import User
from app.schemas.progress import ProgressToggleResponse
from app.services import admin_service, progress_service

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.post("/{lesson_id}/toggle", response_model=ProgressToggleResponse)
def toggle_lesson(
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Toggle lesson completion for the current user."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if user.role != "admin":
        # Check course-level access: is this a free course?
        module = db.query(Module).filter(Module.id == lesson.module_id).first()
        course = db.query(Course).filter(Course.id == module.course_id).first() if module else None

        if course and not course.is_free:
            # Premium course - check if user has batch access
            available_ids = admin_service.get_learner_available_courses(
                db, user.id, user.batch_id
            )
            if course.id not in available_ids:
                raise HTTPException(
                    status_code=403,
                    detail="You don't have access to this course",
                )

        # Check module-level lock (for batch users with drip schedule)
        if user.batch_id:
            if not admin_service.is_module_unlocked_for_user(
                db, user.id, user.batch_id, lesson.module_id
            ):
                raise HTTPException(
                    status_code=403, detail="This module is not yet unlocked"
                )

    return progress_service.toggle_lesson(db, lesson_id, str(user.id))
