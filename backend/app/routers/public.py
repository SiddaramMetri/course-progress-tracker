"""Public endpoints - no authentication required."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import AccessRequest, Course, Lesson, Module
from app.models.user import User
from app.services import auth_service

router = APIRouter(prefix="/api/public", tags=["public"])


class PublicCourseOut(BaseModel):
    id: str
    title: str
    description: str | None
    is_free: bool
    total_lessons: int
    total_modules: int


class PublicLessonOut(BaseModel):
    id: str
    title: str
    sort_order: int
    duration_minutes: int | None


class PublicModuleOut(BaseModel):
    title: str
    sort_order: int
    lessons: list[PublicLessonOut]


class PublicCourseDetailOut(BaseModel):
    id: str
    title: str
    description: str | None
    is_free: bool
    total_lessons: int
    total_modules: int
    modules: list[PublicModuleOut]


class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str


class AccessRequestInput(BaseModel):
    course_id: uuid.UUID
    message: str | None = None


class AccessRequestOut(BaseModel):
    id: str
    course_id: str
    course_title: str
    status: str
    created_at: str


@router.get("/courses", response_model=list[PublicCourseOut])
def list_public_courses(search: str = "", db: Session = Depends(get_db)):
    """List all courses publicly. No auth needed."""
    query = db.query(Course).order_by(Course.created_at)

    if search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            Course.title.ilike(term) | Course.description.ilike(term)
        )

    courses = query.all()
    result = []
    for c in courses:
        lesson_count = (
            db.query(func.count(Lesson.id))
            .join(Module, Module.id == Lesson.module_id)
            .filter(Module.course_id == c.id)
            .scalar() or 0
        )
        module_count = (
            db.query(func.count(Module.id))
            .filter(Module.course_id == c.id)
            .scalar() or 0
        )
        result.append(PublicCourseOut(
            id=str(c.id), title=c.title, description=c.description,
            is_free=c.is_free, total_lessons=lesson_count, total_modules=module_count,
        ))
    return result


@router.get("/courses/{course_id}", response_model=PublicCourseDetailOut)
def get_public_course_detail(course_id: uuid.UUID, db: Session = Depends(get_db)):
    """Public course detail with curriculum (lesson titles only, no content)."""
    course = (
        db.query(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .filter(Course.id == course_id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    modules_out = []
    total_lessons = 0
    for module in sorted(course.modules, key=lambda m: m.sort_order):
        lessons = []
        for lesson in sorted(module.lessons, key=lambda l: l.sort_order):
            lessons.append(PublicLessonOut(
                id=str(lesson.id),
                title=lesson.title,
                sort_order=lesson.sort_order,
                duration_minutes=lesson.duration_minutes,
            ))
            total_lessons += 1
        modules_out.append(PublicModuleOut(
            title=module.title, sort_order=module.sort_order, lessons=lessons,
        ))

    return PublicCourseDetailOut(
        id=str(course.id), title=course.title, description=course.description,
        is_free=course.is_free, total_lessons=total_lessons,
        total_modules=len(modules_out), modules=modules_out,
    )


@router.post("/register")
def register_student(data: RegisterInput, db: Session = Depends(get_db)):
    """Self-registration for students."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = auth_service.register_user(db, data.email, data.password, data.name, "learner")
    result = auth_service.login_user(db, data.email, data.password)
    if not result:
        raise HTTPException(status_code=500, detail="Registration failed")

    user, token, refresh_token = result
    return {
        "token": token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(user.id), "email": user.email, "name": user.name,
            "mobile": user.mobile, "role": user.role,
            "batch_name": None, "batch_start": None, "batch_end": None,
        },
    }


# --- Access Requests (require auth) ---


@router.post("/access-requests")
def create_access_request(
    data: AccessRequestInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Learner requests access to a premium course."""
    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.is_free:
        raise HTTPException(status_code=400, detail="This course is free - no request needed")

    existing = (
        db.query(AccessRequest)
        .filter(
            AccessRequest.user_id == user.id,
            AccessRequest.course_id == data.course_id,
            AccessRequest.status == "pending",
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Request already pending")

    req = AccessRequest(
        user_id=user.id,
        course_id=data.course_id,
        message=data.message,
    )
    db.add(req)
    db.commit()
    return {"status": "pending", "message": "Access request submitted. Admin will review it."}


@router.get("/my-access-requests", response_model=list[AccessRequestOut])
def get_my_access_requests(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get current user's access requests."""
    requests = (
        db.query(AccessRequest)
        .filter(AccessRequest.user_id == user.id)
        .order_by(AccessRequest.created_at.desc())
        .all()
    )
    return [
        AccessRequestOut(
            id=str(r.id),
            course_id=str(r.course_id),
            course_title=r.course.title if r.course else "Unknown",
            status=r.status,
            created_at=r.created_at.isoformat(),
        )
        for r in requests
    ]
