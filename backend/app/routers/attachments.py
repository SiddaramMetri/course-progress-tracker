import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lesson
from app.schemas.attachment import AttachmentOut, AttachmentUploadResponse
from app.services import attachment_service

router = APIRouter(prefix="/api/lessons", tags=["attachments"])


@router.post(
    "/{lesson_id}/attachments",
    response_model=AttachmentUploadResponse,
)
async def upload_attachment(
    lesson_id: uuid.UUID,
    file: UploadFile,
    db: Session = Depends(get_db),
):
    """Upload a file attachment to a lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    file_bytes = await file.read()
    try:
        attachment = attachment_service.upload_attachment(
            db,
            lesson_id,
            file.filename or "unnamed",
            file.content_type or "application/octet-stream",
            file_bytes,
        )
    except ValueError as e:
        raise HTTPException(status_code=413, detail=str(e))

    return attachment


@router.get(
    "/{lesson_id}/attachments",
    response_model=list[AttachmentOut],
)
def list_attachments(
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """List all attachments for a lesson with download URLs."""
    return attachment_service.list_attachments(db, lesson_id)


@router.delete("/attachments/{attachment_id}", status_code=204)
def delete_attachment(
    attachment_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Delete an attachment."""
    deleted = attachment_service.delete_attachment(db, attachment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Attachment not found")
