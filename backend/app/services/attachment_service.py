import uuid

from sqlalchemy.orm import Session

from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentOut
from app.services import storage_service

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def upload_attachment(
    db: Session,
    lesson_id: uuid.UUID,
    filename: str,
    content_type: str,
    file_bytes: bytes,
) -> Attachment:
    """Upload a file to MinIO and create a DB record."""
    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError("File exceeds 50 MB limit")

    object_key = f"lessons/{lesson_id}/{uuid.uuid4()}_{filename}"
    storage_service.upload_file(file_bytes, object_key, content_type)

    attachment = Attachment(
        lesson_id=lesson_id,
        filename=filename,
        object_key=object_key,
        content_type=content_type,
        size_bytes=len(file_bytes),
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


def list_attachments(
    db: Session, lesson_id: uuid.UUID
) -> list[AttachmentOut]:
    """List all attachments for a lesson with presigned download URLs."""
    attachments = (
        db.query(Attachment)
        .filter(Attachment.lesson_id == lesson_id)
        .order_by(Attachment.uploaded_at)
        .all()
    )

    return [
        AttachmentOut(
            id=att.id,
            lesson_id=att.lesson_id,
            filename=att.filename,
            content_type=att.content_type,
            size_bytes=att.size_bytes,
            uploaded_at=att.uploaded_at,
            download_url=storage_service.generate_download_url(
                att.object_key
            ),
        )
        for att in attachments
    ]


def delete_attachment(db: Session, attachment_id: uuid.UUID) -> bool:
    """Delete an attachment from MinIO and the database."""
    att = (
        db.query(Attachment)
        .filter(Attachment.id == attachment_id)
        .first()
    )
    if not att:
        return False

    storage_service.delete_file(att.object_key)
    db.delete(att)
    db.commit()
    return True
