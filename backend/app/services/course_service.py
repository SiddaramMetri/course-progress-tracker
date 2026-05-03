import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models import Course, Lesson, Module, UserProgress
from app.schemas.course import (
    CourseDetail,
    CourseListItem,
    LessonOut,
    ModuleOut,
)

DEFAULT_USER_ID = "default-user"


def get_all_courses(db: Session) -> list[CourseListItem]:
    """Fetch all courses with aggregated progress counts."""
    total_subq = (
        db.query(
            Course.id.label("course_id"),
            func.count(Lesson.id).label("total"),
        )
        .join(Module, Module.course_id == Course.id)
        .join(Lesson, Lesson.module_id == Module.id)
        .group_by(Course.id)
        .subquery()
    )

    completed_subq = (
        db.query(
            Course.id.label("course_id"),
            func.count(UserProgress.id).label("completed"),
        )
        .join(Module, Module.course_id == Course.id)
        .join(Lesson, Lesson.module_id == Module.id)
        .join(
            UserProgress,
            (UserProgress.lesson_id == Lesson.id)
            & (UserProgress.user_id == DEFAULT_USER_ID)
            & (UserProgress.completed.is_(True)),
        )
        .group_by(Course.id)
        .subquery()
    )

    rows = (
        db.query(
            Course.id,
            Course.title,
            Course.description,
            func.coalesce(total_subq.c.total, 0).label("total_count"),
            func.coalesce(completed_subq.c.completed, 0).label(
                "completed_count"
            ),
        )
        .outerjoin(total_subq, total_subq.c.course_id == Course.id)
        .outerjoin(completed_subq, completed_subq.c.course_id == Course.id)
        .order_by(Course.created_at)
        .all()
    )

    return [
        CourseListItem(
            id=row.id,
            title=row.title,
            description=row.description,
            total_count=row.total_count,
            completed_count=row.completed_count,
        )
        for row in rows
    ]


def get_course_detail(
    db: Session, course_id: uuid.UUID
) -> CourseDetail | None:
    """Fetch a course with full module/lesson tree and progress."""
    course = (
        db.query(Course)
        .options(
            selectinload(Course.modules).selectinload(Module.lessons)
        )
        .filter(Course.id == course_id)
        .first()
    )

    if not course:
        return None

    # Gather all lesson IDs for this course
    lesson_ids = [
        lesson.id
        for module in course.modules
        for lesson in module.lessons
    ]

    # Single query for all progress rows
    progress_map: dict[uuid.UUID, bool] = {}
    if lesson_ids:
        progress_rows = (
            db.query(UserProgress.lesson_id, UserProgress.completed)
            .filter(
                UserProgress.lesson_id.in_(lesson_ids),
                UserProgress.user_id == DEFAULT_USER_ID,
            )
            .all()
        )
        progress_map = {row.lesson_id: row.completed for row in progress_rows}

    # Build response
    total_completed = 0
    total_lessons = 0
    modules_out: list[ModuleOut] = []

    for module in course.modules:
        lessons_out: list[LessonOut] = []
        module_completed = 0

        for lesson in module.lessons:
            completed = progress_map.get(lesson.id, False)
            if completed:
                module_completed += 1
            lessons_out.append(
                LessonOut(
                    id=lesson.id,
                    title=lesson.title,
                    description=lesson.description,
                    sort_order=lesson.sort_order,
                    completed=completed,
                )
            )

        total_completed += module_completed
        total_lessons += len(module.lessons)

        modules_out.append(
            ModuleOut(
                id=module.id,
                title=module.title,
                sort_order=module.sort_order,
                lessons=lessons_out,
                completed_count=module_completed,
                total_count=len(module.lessons),
            )
        )

    return CourseDetail(
        id=course.id,
        title=course.title,
        description=course.description,
        modules=modules_out,
        completed_count=total_completed,
        total_count=total_lessons,
    )
