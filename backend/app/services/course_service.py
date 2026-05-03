import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models import Course, Lesson, Module, UserProgress
from app.schemas.course import (
    CourseCreate,
    CourseDetail,
    CourseListItem,
    CourseUpdate,
    LessonCreate,
    LessonOut,
    LessonUpdate,
    ModuleCreate,
    ModuleOut,
    ModuleUpdate,
)


def get_all_courses(
    db: Session, user_id: str = "default-user"
) -> list[CourseListItem]:
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
            & (UserProgress.user_id == user_id)
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
            Course.cover_image_key,
            Course.is_free,
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

    from app.services import storage_service

    result = []
    for row in rows:
        cover_url = None
        if row.cover_image_key:
            try:
                cover_url = storage_service.generate_download_url(
                    row.cover_image_key, expires_in=7200
                )
            except Exception:
                pass
        result.append(
            CourseListItem(
                id=row.id,
                title=row.title,
                description=row.description,
                cover_image_url=cover_url,
                is_free=row.is_free,
                total_count=row.total_count,
                completed_count=row.completed_count,
            )
        )
    return result


def get_course_detail(
    db: Session, course_id: uuid.UUID, user_id: str = "default-user"
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

    lesson_ids = [
        lesson.id
        for module in course.modules
        for lesson in module.lessons
    ]

    progress_map: dict[uuid.UUID, bool] = {}
    if lesson_ids:
        progress_rows = (
            db.query(UserProgress.lesson_id, UserProgress.completed)
            .filter(
                UserProgress.lesson_id.in_(lesson_ids),
                UserProgress.user_id == user_id,
            )
            .all()
        )
        progress_map = {row.lesson_id: row.completed for row in progress_rows}

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
                    video_url=lesson.video_url,
                    video_storage_key=lesson.video_storage_key,
                    lesson_type=lesson.lesson_type,
                    duration_minutes=lesson.duration_minutes,
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


# --- Admin CRUD ---


def create_course(db: Session, data: CourseCreate) -> Course:
    course = Course(title=data.title, description=data.description, is_free=data.is_free)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def update_course(
    db: Session, course_id: uuid.UUID, data: CourseUpdate
) -> Course | None:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return None
    if data.title is not None:
        course.title = data.title
    if data.description is not None:
        course.description = data.description
    db.commit()
    db.refresh(course)
    return course


def delete_course(db: Session, course_id: uuid.UUID) -> bool:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return False
    db.delete(course)
    db.commit()
    return True


def create_module(
    db: Session, course_id: uuid.UUID, data: ModuleCreate
) -> Module | None:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return None
    module = Module(
        course_id=course_id, title=data.title, sort_order=data.sort_order
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


def update_module(
    db: Session, module_id: uuid.UUID, data: ModuleUpdate
) -> Module | None:
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        return None
    if data.title is not None:
        module.title = data.title
    if data.sort_order is not None:
        module.sort_order = data.sort_order
    db.commit()
    db.refresh(module)
    return module


def delete_module(db: Session, module_id: uuid.UUID) -> bool:
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        return False
    db.delete(module)
    db.commit()
    return True


def create_lesson(
    db: Session, module_id: uuid.UUID, data: LessonCreate
) -> Lesson | None:
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        return None
    lesson = Lesson(
        module_id=module_id,
        title=data.title,
        description=data.description,
        video_url=data.video_url,
        lesson_type=data.lesson_type,
        duration_minutes=data.duration_minutes,
        sort_order=data.sort_order,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


def update_lesson(
    db: Session, lesson_id: uuid.UUID, data: LessonUpdate
) -> Lesson | None:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return None
    if data.title is not None:
        lesson.title = data.title
    if data.description is not None:
        lesson.description = data.description
    if data.video_url is not None:
        lesson.video_url = data.video_url
    if data.lesson_type is not None:
        lesson.lesson_type = data.lesson_type
    if data.duration_minutes is not None:
        lesson.duration_minutes = data.duration_minutes
    if data.sort_order is not None:
        lesson.sort_order = data.sort_order
    db.commit()
    db.refresh(lesson)
    return lesson


def delete_lesson(db: Session, lesson_id: uuid.UUID) -> bool:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return False
    db.delete(lesson)
    db.commit()
    return True
