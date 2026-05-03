import uuid

from pydantic import BaseModel


class LessonOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
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
