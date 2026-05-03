import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin
from app.models import Lesson
from app.models.user import User
from app.schemas.attachment import AttachmentOut, AttachmentUploadResponse
from app.services import attachment_service, storage_service

router = APIRouter(prefix="/api/lessons", tags=["attachments"])

MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500 MB


class VideoUploadResponse(BaseModel):
    lesson_id: uuid.UUID
    video_storage_key: str
    video_url: str


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


@router.post(
    "/{lesson_id}/video",
    response_model=VideoUploadResponse,
)
async def upload_video(
    lesson_id: uuid.UUID,
    file: UploadFile,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Upload a video file to a lesson (admin only). Stored in MinIO."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    content_type = file.content_type or "video/mp4"
    if not content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_VIDEO_SIZE:
        raise HTTPException(status_code=413, detail="Video exceeds 500 MB limit")

    # Remove old video from MinIO if exists
    if lesson.video_storage_key:
        try:
            storage_service.delete_file(lesson.video_storage_key)
        except Exception:
            pass

    object_key = f"videos/{lesson_id}/{uuid.uuid4()}_{file.filename or 'video.mp4'}"
    storage_service.upload_file(file_bytes, object_key, content_type)

    # Update lesson
    lesson.video_storage_key = object_key
    lesson.video_url = None  # Clear YouTube URL when uploading custom video
    db.commit()
    db.refresh(lesson)

    download_url = storage_service.generate_download_url(object_key, expires_in=7200)

    return VideoUploadResponse(
        lesson_id=lesson.id,
        video_storage_key=object_key,
        video_url=download_url,
    )


@router.delete("/{lesson_id}/video", status_code=204)
def delete_video(
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Delete a lesson's uploaded video (admin only)."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if lesson.video_storage_key:
        try:
            storage_service.delete_file(lesson.video_storage_key)
        except Exception:
            pass
        lesson.video_storage_key = None
        db.commit()


@router.get("/{lesson_id}/video-url")
def get_video_url(
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Get a fresh presigned URL for a lesson's uploaded video."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if not lesson.video_storage_key:
        raise HTTPException(status_code=404, detail="No uploaded video")

    url = storage_service.generate_download_url(
        lesson.video_storage_key, expires_in=7200
    )
    return {"video_url": url}
