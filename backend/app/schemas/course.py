import uuid

from pydantic import BaseModel


class LessonOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    video_url: str | None
    video_storage_key: str | None
    lesson_type: str
    duration_minutes: int | None
    sort_order: int
    completed: bool

    model_config = {"from_attributes": True}


class ModuleOut(BaseModel):
    id: uuid.UUID
    title: str
    sort_order: int
    lessons: list[LessonOut]
    completed_count: int
    total_count: int

    model_config = {"from_attributes": True}


class CourseDetail(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    modules: list[ModuleOut]
    completed_count: int
    total_count: int

    model_config = {"from_attributes": True}


class CourseListItem(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    completed_count: int
    total_count: int

    model_config = {"from_attributes": True}


# --- Input schemas for admin CRUD ---


class CourseCreate(BaseModel):
    title: str
    description: str | None = None


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class ModuleCreate(BaseModel):
    title: str
    sort_order: int = 0


class ModuleUpdate(BaseModel):
    title: str | None = None
    sort_order: int | None = None


class LessonCreate(BaseModel):
    title: str
    description: str | None = None
    video_url: str | None = None
    lesson_type: str = "video"
    duration_minutes: int | None = None
    sort_order: int = 0


class LessonUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    video_url: str | None = None
    lesson_type: str | None = None
    duration_minutes: int | None = None
    sort_order: int | None = None


# --- Simple response schemas for single items ---


class CourseOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None

    model_config = {"from_attributes": True}


class ModuleOutSingle(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    sort_order: int

    model_config = {"from_attributes": True}


class LessonOutSingle(BaseModel):
    id: uuid.UUID
    module_id: uuid.UUID
    title: str
    description: str | None
    video_url: str | None
    lesson_type: str
    duration_minutes: int | None
    sort_order: int

    model_config = {"from_attributes": True}
