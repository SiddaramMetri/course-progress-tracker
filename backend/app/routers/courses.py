import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.course import CourseDetail, CourseListItem
from app.services import course_service

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("", response_model=list[CourseListItem])
def list_courses(db: Session = Depends(get_db)):
    """List all courses with aggregated progress."""
    return course_service.get_all_courses(db)


@router.get("/{course_id}", response_model=CourseDetail)
def get_course(course_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a single course with full module/lesson tree and progress."""
    course = course_service.get_course_detail(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
