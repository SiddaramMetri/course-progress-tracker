import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.course import Course, Module, Lesson
from app.models.user import User
from app.schemas.course import (
    CourseCreate,
    CourseDetail,
    CourseListItem,
    CourseOut,
    CourseUpdate,
    LessonCreate,
    LessonOutSingle,
    LessonUpdate,
    ModuleCreate,
    ModuleOutSingle,
    ModuleUpdate,
)
from app.services import course_service

router = APIRouter(prefix="/api", tags=["courses"])


# --- Read endpoints (any authenticated user) ---


@router.get("/courses", response_model=list[CourseListItem])
def list_courses(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    all_courses = course_service.get_all_courses(db, str(user.id))

    # Admins see everything; learners see batch-published + free courses
    if user.role == "admin":
        return all_courses

    from app.models import AccessRequest
    from app.services import admin_service

    available_ids = admin_service.get_learner_available_courses(
        db, user.id, user.batch_id
    )

    # Also include courses with approved access requests
    approved_ids = [
        r.course_id
        for r in db.query(AccessRequest)
        .filter(AccessRequest.user_id == user.id, AccessRequest.status == "approved")
        .all()
    ]

    return [
        c for c in all_courses
        if c.id in available_ids or c.is_free or c.id in approved_ids
    ]


@router.get("/courses/{course_id}", response_model=CourseDetail)
def get_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.models import Course as CourseModel
    from app.services import admin_service

    # Access control: check if user can access this course
    if user.role != "admin":
        course_obj = (
            db.query(CourseModel).filter(CourseModel.id == course_id).first()
        )
        if not course_obj:
            raise HTTPException(status_code=404, detail="Course not found")

        # Free courses: anyone can access
        if not course_obj.is_free:
            # Premium: check batch access OR approved access request
            from app.models import AccessRequest

            available_ids = admin_service.get_learner_available_courses(
                db, user.id, user.batch_id
            )
            has_approved_request = (
                db.query(AccessRequest)
                .filter(
                    AccessRequest.user_id == user.id,
                    AccessRequest.course_id == course_id,
                    AccessRequest.status == "approved",
                )
                .first()
                is not None
            )
            if course_id not in available_ids and not has_approved_request:
                raise HTTPException(
                    status_code=403,
                    detail="You don't have access to this course. Request access from the course page.",
                )

    course = course_service.get_course_detail(
        db, course_id, str(user.id)
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # For learners, mark locked modules with unlock dates
    if user.role != "admin" and user.batch_id:
        schedule_map = admin_service.get_module_schedule_map(
            db, user.batch_id, course_id
        )
        for module in course.modules:
            sched = schedule_map.get(module.id)
            if sched and not sched["is_unlocked"]:
                module.is_locked = True
                module.unlock_date = str(sched["unlock_date"])
                for lesson in module.lessons:
                    lesson.description = None
                    lesson.video_url = None
                    lesson.video_storage_key = None

    return course


# --- Course CRUD (admin only) ---


@router.post("/courses", response_model=CourseOut, status_code=201)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    existing = db.query(Course).filter(Course.title == data.title.strip()).first()
    if existing:
        raise HTTPException(status_code=409, detail="A course with this title already exists")
    return course_service.create_course(db, data)


@router.put("/courses/{course_id}", response_model=CourseOut)
def update_course(
    course_id: uuid.UUID,
    data: CourseUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if data.title is not None:
        existing = db.query(Course).filter(
            Course.title == data.title.strip(), Course.id != course_id
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="A course with this title already exists")
    course = course_service.update_course(db, course_id, data)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/courses/{course_id}/duplicate", response_model=CourseOut, status_code=201)
def duplicate_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Duplicate a course with all modules and lessons."""
    source = db.query(Course).filter(Course.id == course_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Course not found")

    # Generate unique title
    base_title = f"{source.title} (Copy)"
    title = base_title
    counter = 1
    while db.query(Course).filter(Course.title == title).first():
        counter += 1
        title = f"{source.title} (Copy {counter})"

    new_course = Course(
        title=title,
        description=source.description,
        is_free=source.is_free,
    )
    db.add(new_course)
    db.flush()

    for mod in source.modules:
        new_mod = Module(
            course_id=new_course.id,
            title=mod.title,
            sort_order=mod.sort_order,
        )
        db.add(new_mod)
        db.flush()

        for lesson in mod.lessons:
            new_lesson = Lesson(
                module_id=new_mod.id,
                title=lesson.title,
                description=lesson.description,
                video_url=lesson.video_url,
                lesson_type=lesson.lesson_type,
                duration_minutes=lesson.duration_minutes,
                sort_order=lesson.sort_order,
            )
            db.add(new_lesson)

    db.commit()
    db.refresh(new_course)
    return new_course


@router.delete("/courses/{course_id}", status_code=204)
def delete_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if not course_service.delete_course(db, course_id):
        raise HTTPException(status_code=404, detail="Course not found")


# --- Module CRUD (admin only) ---


@router.post(
    "/courses/{course_id}/modules",
    response_model=ModuleOutSingle,
    status_code=201,
)
def create_module(
    course_id: uuid.UUID,
    data: ModuleCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    existing = db.query(Module).filter(
        Module.course_id == course_id, Module.title == data.title.strip()
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A module with this title already exists in this course")
    module = course_service.create_module(db, course_id, data)
    if not module:
        raise HTTPException(status_code=404, detail="Course not found")
    return module


@router.put("/modules/{module_id}", response_model=ModuleOutSingle)
def update_module(
    module_id: uuid.UUID,
    data: ModuleUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if data.title is not None:
        mod = db.query(Module).filter(Module.id == module_id).first()
        if mod:
            existing = db.query(Module).filter(
                Module.course_id == mod.course_id,
                Module.title == data.title.strip(),
                Module.id != module_id,
            ).first()
            if existing:
                raise HTTPException(status_code=409, detail="A module with this title already exists in this course")
    module = course_service.update_module(db, module_id, data)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.delete("/modules/{module_id}", status_code=204)
def delete_module(
    module_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if not course_service.delete_module(db, module_id):
        raise HTTPException(status_code=404, detail="Module not found")


# --- Lesson CRUD (admin only) ---


@router.post(
    "/modules/{module_id}/lessons",
    response_model=LessonOutSingle,
    status_code=201,
)
def create_lesson(
    module_id: uuid.UUID,
    data: LessonCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    existing = db.query(Lesson).filter(
        Lesson.module_id == module_id, Lesson.title == data.title.strip()
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A lesson with this title already exists in this module")
    lesson = course_service.create_lesson(db, module_id, data)
    if not lesson:
        raise HTTPException(status_code=404, detail="Module not found")
    return lesson


@router.put("/lessons/{lesson_id}", response_model=LessonOutSingle)
def update_lesson(
    lesson_id: uuid.UUID,
    data: LessonUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if data.title is not None:
        les = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if les:
            existing = db.query(Lesson).filter(
                Lesson.module_id == les.module_id,
                Lesson.title == data.title.strip(),
                Lesson.id != lesson_id,
            ).first()
            if existing:
                raise HTTPException(status_code=409, detail="A lesson with this title already exists in this module")
    lesson = course_service.update_lesson(db, lesson_id, data)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.delete("/lessons/{lesson_id}", status_code=204)
def delete_lesson(
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if not course_service.delete_lesson(db, lesson_id):
        raise HTTPException(status_code=404, detail="Lesson not found")


# --- Reorder ---


class ReorderItem(BaseModel):
    id: uuid.UUID
    sort_order: int


@router.put("/modules/{module_id}/reorder-lessons")
def reorder_lessons(
    module_id: uuid.UUID,
    items: list[ReorderItem],
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Bulk update sort_order for lessons in a module."""
    for item in items:
        db.query(Lesson).filter(
            Lesson.id == item.id, Lesson.module_id == module_id
        ).update({"sort_order": item.sort_order})
    db.commit()
    return {"status": "ok"}


# --- Course Cover Image ---


@router.post("/courses/{course_id}/cover")
async def upload_cover_image(
    course_id: uuid.UUID,
    file: UploadFile,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Upload a cover image for a course (admin only)."""
    from app.models import Course
    from app.services import storage_service

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    ct = file.content_type or ""
    if not ct.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds 5 MB")

    # Delete old cover
    if course.cover_image_key:
        try:
            storage_service.delete_file(course.cover_image_key)
        except Exception:
            pass

    key = f"covers/{course_id}/{uuid.uuid4()}_{file.filename}"
    storage_service.upload_file(file_bytes, key, ct)
    course.cover_image_key = key
    db.commit()

    url = storage_service.generate_download_url(key, expires_in=7200)
    return {"cover_image_url": url}
