import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
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
    return course_service.get_all_courses(db, str(user.id))


@router.get("/courses/{course_id}", response_model=CourseDetail)
def get_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    course = course_service.get_course_detail(
        db, course_id, str(user.id)
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# --- Course CRUD (admin only) ---


@router.post("/courses", response_model=CourseOut, status_code=201)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return course_service.create_course(db, data)


@router.put("/courses/{course_id}", response_model=CourseOut)
def update_course(
    course_id: uuid.UUID,
    data: CourseUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    course = course_service.update_course(db, course_id, data)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


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
