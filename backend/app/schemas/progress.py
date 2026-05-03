import uuid
from datetime import datetime

from pydantic import BaseModel


class ProgressToggleResponse(BaseModel):
    lesson_id: uuid.UUID
    completed: bool
    completed_at: datetime | None

    model_config = {"from_attributes": True}
