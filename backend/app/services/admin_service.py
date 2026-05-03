import uuid
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import (
    Batch,
    BatchCourse,
    BatchModuleSchedule,
    Course,
    Lesson,
    Module,
    User,
    UserProgress,
)
from app.schemas.admin import (
    BatchCourseOut,
    BatchCreate,
    BatchDetailOut,
    BatchOut,
    BatchUpdate,
    ModuleScheduleOut,
    UserAdminOut,
)


def get_all_users(db: Session) -> list[UserAdminOut]:
    """Get all users with their progress stats."""
    # Total lessons count
    total_lessons = db.query(func.count(Lesson.id)).scalar() or 0

    # Get users with batch info
    users = db.query(User).order_by(User.created_at).all()

    result = []
    for user in users:
        completed = 0
        if total_lessons > 0:
            completed = (
                db.query(func.count(UserProgress.id))
                .filter(
                    UserProgress.user_id == str(user.id),
                    UserProgress.completed.is_(True),
                )
                .scalar()
                or 0
            )

        pct = (
            round((completed / total_lessons) * 100) if total_lessons > 0 else 0
        )

        result.append(
            UserAdminOut(
                id=user.id,
                email=user.email,
                name=user.name,
                role=user.role,
                is_blocked=user.is_blocked,
                batch_id=user.batch_id,
                batch_name=user.batch.name if user.batch else None,
                created_at=user.created_at,
                total_lessons=total_lessons,
                completed_lessons=completed,
                progress_percent=pct,
            )
        )

    return result


def get_user_detail(db: Session, user_id: uuid.UUID) -> dict | None:
    """Get detailed progress per course for a specific user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    courses = db.query(Course).order_by(Course.created_at).all()
    course_progress = []

    for course in courses:
        lessons = (
            db.query(Lesson)
            .join(Module, Module.id == Lesson.module_id)
            .filter(Module.course_id == course.id)
            .all()
        )
        lesson_ids = [l.id for l in lessons]
        completed = 0
        if lesson_ids:
            completed = (
                db.query(func.count(UserProgress.id))
                .filter(
                    UserProgress.user_id == str(user.id),
                    UserProgress.lesson_id.in_(lesson_ids),
                    UserProgress.completed.is_(True),
                )
                .scalar()
                or 0
            )

        total = len(lessons)
        course_progress.append(
            {
                "course_id": str(course.id),
                "course_title": course.title,
                "total_lessons": total,
                "completed_lessons": completed,
                "progress_percent": (
                    round((completed / total) * 100) if total > 0 else 0
                ),
            }
        )

    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "is_blocked": user.is_blocked,
        "batch_id": str(user.batch_id) if user.batch_id else None,
        "batch_name": user.batch.name if user.batch else None,
        "created_at": user.created_at.isoformat(),
        "courses": course_progress,
    }


def block_user(db: Session, user_id: uuid.UUID) -> User | None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.is_blocked = True
    db.commit()
    db.refresh(user)
    return user


def unblock_user(db: Session, user_id: uuid.UUID) -> User | None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.is_blocked = False
    db.commit()
    db.refresh(user)
    return user


def assign_batch(
    db: Session, user_id: uuid.UUID, batch_id: uuid.UUID | None
) -> User | None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.batch_id = batch_id
    db.commit()
    db.refresh(user)
    return user


# --- Batch CRUD ---


def get_all_batches(db: Session) -> list[BatchOut]:
    batches = db.query(Batch).order_by(Batch.start_date.desc().nullslast()).all()
    result = []
    for batch in batches:
        student_count = (
            db.query(func.count(User.id))
            .filter(User.batch_id == batch.id)
            .scalar()
            or 0
        )
        course_count = (
            db.query(func.count(BatchCourse.id))
            .filter(BatchCourse.batch_id == batch.id)
            .scalar()
            or 0
        )
        result.append(
            BatchOut(
                id=batch.id,
                name=batch.name,
                description=batch.description,
                start_date=batch.start_date,
                end_date=batch.end_date,
                student_count=student_count,
                course_count=course_count,
                created_at=batch.created_at,
            )
        )
    return result


def create_batch(db: Session, data: BatchCreate) -> Batch:
    batch = Batch(
        name=data.name,
        description=data.description,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


def update_batch(
    db: Session, batch_id: uuid.UUID, data: BatchUpdate
) -> Batch | None:
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        return None
    if data.name is not None:
        batch.name = data.name
    if data.description is not None:
        batch.description = data.description
    if data.start_date is not None:
        batch.start_date = data.start_date
    if data.end_date is not None:
        batch.end_date = data.end_date
    db.commit()
    db.refresh(batch)
    return batch


def delete_batch(db: Session, batch_id: uuid.UUID) -> bool:
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        return False
    db.delete(batch)
    db.commit()
    return True


# --- Batch Detail + Course Publishing ---


def get_batch_detail(db: Session, batch_id: uuid.UUID) -> BatchDetailOut | None:
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        return None

    # Students in this batch
    students_raw = get_all_users(db)
    students = [s for s in students_raw if s.batch_id == batch_id]

    # Published courses
    batch_courses = (
        db.query(BatchCourse)
        .filter(BatchCourse.batch_id == batch_id)
        .all()
    )

    today = date.today()
    published_courses: list[BatchCourseOut] = []

    for bc in batch_courses:
        course = db.query(Course).filter(Course.id == bc.course_id).first()
        if not course:
            continue

        # Module schedules
        schedules = (
            db.query(BatchModuleSchedule)
            .filter(BatchModuleSchedule.batch_course_id == bc.id)
            .all()
        )

        module_schedules: list[ModuleScheduleOut] = []
        for sched in schedules:
            module = db.query(Module).filter(Module.id == sched.module_id).first()
            if module:
                module_schedules.append(
                    ModuleScheduleOut(
                        id=sched.id,
                        module_id=sched.module_id,
                        module_title=module.title,
                        unlock_date=sched.unlock_date,
                        is_unlocked=sched.unlock_date <= today,
                    )
                )

        module_schedules.sort(key=lambda m: m.unlock_date)

        published_courses.append(
            BatchCourseOut(
                id=bc.id,
                course_id=bc.course_id,
                course_title=course.title,
                publish_date=bc.publish_date,
                is_published=bc.is_published,
                module_schedules=module_schedules,
            )
        )

    student_count = len(students)

    return BatchDetailOut(
        id=batch.id,
        name=batch.name,
        description=batch.description,
        start_date=batch.start_date,
        end_date=batch.end_date,
        student_count=student_count,
        students=students,
        published_courses=published_courses,
        created_at=batch.created_at,
    )


def publish_course_to_batch(
    db: Session,
    batch_id: uuid.UUID,
    course_id: uuid.UUID,
    publish_date: date,
) -> BatchCourse:
    """Publish a course to a batch and auto-create module schedules."""
    bc = BatchCourse(
        batch_id=batch_id,
        course_id=course_id,
        publish_date=publish_date,
    )
    db.add(bc)
    db.flush()

    # Auto-create module schedules (one week apart by default)
    modules = (
        db.query(Module)
        .filter(Module.course_id == course_id)
        .order_by(Module.sort_order)
        .all()
    )

    from datetime import timedelta

    for i, module in enumerate(modules):
        unlock = publish_date + timedelta(weeks=i)
        sched = BatchModuleSchedule(
            batch_course_id=bc.id,
            module_id=module.id,
            unlock_date=unlock,
        )
        db.add(sched)

    db.commit()
    db.refresh(bc)
    return bc


def update_module_schedule(
    db: Session, schedule_id: uuid.UUID, unlock_date: date
) -> BatchModuleSchedule | None:
    sched = (
        db.query(BatchModuleSchedule)
        .filter(BatchModuleSchedule.id == schedule_id)
        .first()
    )
    if not sched:
        return None
    sched.unlock_date = unlock_date
    db.commit()
    db.refresh(sched)
    return sched


def unpublish_course_from_batch(
    db: Session, batch_course_id: uuid.UUID
) -> bool:
    bc = db.query(BatchCourse).filter(BatchCourse.id == batch_course_id).first()
    if not bc:
        return False
    db.delete(bc)
    db.commit()
    return True


def get_learner_available_courses(
    db: Session, user_id: uuid.UUID, batch_id: uuid.UUID | None
) -> list[uuid.UUID]:
    """Get course IDs available to a learner based on their batch."""
    if not batch_id:
        return []

    today = date.today()
    batch_courses = (
        db.query(BatchCourse)
        .filter(
            BatchCourse.batch_id == batch_id,
            BatchCourse.is_published.is_(True),
            BatchCourse.publish_date <= today,
        )
        .all()
    )
    return [bc.course_id for bc in batch_courses]


def get_learner_unlocked_modules(
    db: Session, batch_id: uuid.UUID, course_id: uuid.UUID
) -> list[uuid.UUID]:
    """Get module IDs that are unlocked for a batch in a specific course."""
    today = date.today()
    bc = (
        db.query(BatchCourse)
        .filter(
            BatchCourse.batch_id == batch_id,
            BatchCourse.course_id == course_id,
        )
        .first()
    )
    if not bc:
        return []

    schedules = (
        db.query(BatchModuleSchedule)
        .filter(
            BatchModuleSchedule.batch_course_id == bc.id,
            BatchModuleSchedule.unlock_date <= today,
        )
        .all()
    )
    return [s.module_id for s in schedules]


def get_module_schedule_map(
    db: Session, batch_id: uuid.UUID, course_id: uuid.UUID
) -> dict[uuid.UUID, dict]:
    """Get all module schedules with lock status for a batch + course."""
    today = date.today()
    bc = (
        db.query(BatchCourse)
        .filter(
            BatchCourse.batch_id == batch_id,
            BatchCourse.course_id == course_id,
        )
        .first()
    )
    if not bc:
        return {}

    schedules = (
        db.query(BatchModuleSchedule)
        .filter(BatchModuleSchedule.batch_course_id == bc.id)
        .all()
    )
    return {
        s.module_id: {
            "unlock_date": s.unlock_date,
            "is_unlocked": s.unlock_date <= today,
        }
        for s in schedules
    }


def is_module_unlocked_for_user(
    db: Session, user_id: uuid.UUID, batch_id: uuid.UUID | None,
    module_id: uuid.UUID
) -> bool:
    """Check if a specific module is unlocked for a user's batch."""
    if not batch_id:
        return False
    today = date.today()

    # Find the batch_course that contains this module
    from app.models import Module as ModuleModel
    module = db.query(ModuleModel).filter(ModuleModel.id == module_id).first()
    if not module:
        return False

    bc = (
        db.query(BatchCourse)
        .filter(
            BatchCourse.batch_id == batch_id,
            BatchCourse.course_id == module.course_id,
        )
        .first()
    )
    if not bc:
        return False

    sched = (
        db.query(BatchModuleSchedule)
        .filter(
            BatchModuleSchedule.batch_course_id == bc.id,
            BatchModuleSchedule.module_id == module_id,
        )
        .first()
    )
    if not sched:
        # No schedule means no restriction - module is unlocked
        return True
    return sched.unlock_date <= today
