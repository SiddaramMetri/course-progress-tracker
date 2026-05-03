import uuid
from datetime import datetime

from pydantic import BaseModel


class AttachmentOut(BaseModel):
    id: uuid.UUID
    lesson_id: uuid.UUID
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime
    download_url: str

    model_config = {"from_attributes": True}


class AttachmentUploadResponse(BaseModel):
    id: uuid.UUID
    filename: str
    content_type: str
    size_bytes: int

    model_config = {"from_attributes": True}
