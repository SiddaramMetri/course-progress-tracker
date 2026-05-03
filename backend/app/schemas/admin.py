import uuid
from datetime import date, datetime

from pydantic import BaseModel


# --- Batch schemas ---


class BatchCreate(BaseModel):
    name: str
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class BatchUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class BatchOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    start_date: date | None
    end_date: date | None
    student_count: int = 0
    course_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


# --- User admin schemas ---


class UserAdminOut(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    role: str
    is_blocked: bool
    batch_id: uuid.UUID | None
    batch_name: str | None = None
    created_at: datetime
    last_login_at: datetime | None = None
    total_lessons: int = 0
    completed_lessons: int = 0
    progress_percent: int = 0

    model_config = {"from_attributes": True}


class UserBatchAssign(BaseModel):
    batch_id: uuid.UUID | None = None


# --- Batch Course Publishing ---


class PublishCourseInput(BaseModel):
    course_id: uuid.UUID
    publish_date: date


class ModuleScheduleInput(BaseModel):
    module_id: uuid.UUID
    unlock_date: date


class ModuleScheduleOut(BaseModel):
    id: uuid.UUID
    module_id: uuid.UUID
    module_title: str
    unlock_date: date
    is_unlocked: bool = False

    model_config = {"from_attributes": True}


class BatchCourseOut(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    course_title: str
    publish_date: date
    is_published: bool
    module_schedules: list[ModuleScheduleOut] = []

    model_config = {"from_attributes": True}


class BatchDetailOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    start_date: date | None
    end_date: date | None
    student_count: int = 0
    students: list[UserAdminOut] = []
    published_courses: list[BatchCourseOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}
