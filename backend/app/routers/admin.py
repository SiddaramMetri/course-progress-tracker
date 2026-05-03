import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin
from app.models.user import User
from app.schemas.admin import (
    BatchCreate,
    BatchDetailOut,
    BatchOut,
    BatchUpdate,
    ModuleScheduleInput,
    PublishCourseInput,
    UserAdminOut,
    UserBatchAssign,
)
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["admin"])


# --- Users ---


@router.get("/users", response_model=list[UserAdminOut])
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List all users with progress stats (admin only)."""
    return admin_service.get_all_users(db)


@router.get("/users/{user_id}")
def get_user_detail(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Get detailed progress per course for a user."""
    detail = admin_service.get_user_detail(db, user_id)
    if not detail:
        raise HTTPException(status_code=404, detail="User not found")
    return detail


@router.post("/users/{user_id}/block", response_model=UserAdminOut)
def block_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Block a user."""
    user = admin_service.block_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Return full user info
    users = admin_service.get_all_users(db)
    return next((u for u in users if u.id == user_id), None)


@router.post("/users/{user_id}/unblock", response_model=UserAdminOut)
def unblock_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Unblock a user."""
    user = admin_service.unblock_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    users = admin_service.get_all_users(db)
    return next((u for u in users if u.id == user_id), None)


@router.put("/users/{user_id}/batch")
def assign_user_batch(
    user_id: uuid.UUID,
    data: UserBatchAssign,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Assign a user to a batch (or remove from batch with null)."""
    user = admin_service.assign_batch(db, user_id, data.batch_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "ok"}


# --- Batches ---


@router.get("/batches", response_model=list[BatchOut])
def list_batches(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List all batches."""
    return admin_service.get_all_batches(db)


@router.post("/batches", response_model=BatchOut, status_code=201)
def create_batch(
    data: BatchCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Create a new batch."""
    batch = admin_service.create_batch(db, data)
    return BatchOut(
        id=batch.id,
        name=batch.name,
        description=batch.description,
        start_date=batch.start_date,
        end_date=batch.end_date,
        student_count=0,
        created_at=batch.created_at,
    )


@router.put("/batches/{batch_id}", response_model=BatchOut)
def update_batch(
    batch_id: uuid.UUID,
    data: BatchUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Update a batch."""
    batch = admin_service.update_batch(db, batch_id, data)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    batches = admin_service.get_all_batches(db)
    return next((b for b in batches if b.id == batch_id), None)


@router.delete("/batches/{batch_id}", status_code=204)
def delete_batch(
    batch_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Delete a batch."""
    if not admin_service.delete_batch(db, batch_id):
        raise HTTPException(status_code=404, detail="Batch not found")


# --- Batch Detail + Course Publishing ---


@router.get("/batches/{batch_id}/detail", response_model=BatchDetailOut)
def get_batch_detail(
    batch_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Get full batch detail with students and published courses."""
    detail = admin_service.get_batch_detail(db, batch_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Batch not found")
    return detail


@router.post("/batches/{batch_id}/publish")
def publish_course(
    batch_id: uuid.UUID,
    data: PublishCourseInput,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Publish a course to a batch with auto-generated module schedule."""
    try:
        bc = admin_service.publish_course_to_batch(
            db, batch_id, data.course_id, data.publish_date
        )
        return {"id": str(bc.id), "status": "published"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/batches/schedules/{schedule_id}")
def update_schedule(
    schedule_id: uuid.UUID,
    data: ModuleScheduleInput,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Update a module unlock date."""
    sched = admin_service.update_module_schedule(
        db, schedule_id, data.unlock_date
    )
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"status": "updated"}


@router.delete("/batches/courses/{batch_course_id}", status_code=204)
def unpublish_course(
    batch_course_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Remove a published course from a batch."""
    if not admin_service.unpublish_course_from_batch(db, batch_course_id):
        raise HTTPException(status_code=404, detail="Not found")


# --- Access Requests ---


@router.get("/access-requests")
def list_access_requests(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List all pending access requests."""
    from app.models import AccessRequest

    requests = (
        db.query(AccessRequest)
        .order_by(AccessRequest.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(r.id),
            "user_id": str(r.user_id),
            "user_name": r.user.name if r.user else "Unknown",
            "user_email": r.user.email if r.user else "",
            "course_id": str(r.course_id),
            "course_title": r.course.title if r.course else "Unknown",
            "status": r.status,
            "message": r.message,
            "created_at": r.created_at.isoformat(),
        }
        for r in requests
    ]


@router.post("/access-requests/{request_id}/approve")
def approve_access_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Approve an access request - assign user to a batch if they don't have one."""
    from app.models import AccessRequest, Notification

    req = db.query(AccessRequest).filter(AccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req.status = "approved"

    # Send notification to user
    notif = Notification(
        user_id=req.user_id,
        title="Access Approved!",
        message=f"Your request to access '{req.course.title}' has been approved.",
    )
    db.add(notif)
    db.commit()

    return {"status": "approved"}


@router.post("/access-requests/{request_id}/reject")
def reject_access_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Reject an access request."""
    from app.models import AccessRequest, Notification

    req = db.query(AccessRequest).filter(AccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req.status = "rejected"

    notif = Notification(
        user_id=req.user_id,
        title="Access Request Update",
        message=f"Your request to access '{req.course.title}' was not approved at this time.",
    )
    db.add(notif)
    db.commit()

    return {"status": "rejected"}
