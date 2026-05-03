import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BatchCourse(Base):
    """Assigns a course to a batch with a publish date."""

    __tablename__ = "batch_courses"
    __table_args__ = (
        UniqueConstraint("batch_id", "course_id", name="uq_batch_course"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4, primary_key=True
    )
    batch_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("batches.id", ondelete="CASCADE"), index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )
    publish_date: Mapped[date] = mapped_column(
        Date, nullable=False
    )
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    batch: Mapped["Batch"] = relationship()  # noqa: F821
    course: Mapped["Course"] = relationship()  # noqa: F821


class BatchModuleSchedule(Base):
    """Controls when a module unlocks for a specific batch."""

    __tablename__ = "batch_module_schedules"
    __table_args__ = (
        UniqueConstraint(
            "batch_course_id", "module_id", name="uq_batch_module"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4, primary_key=True
    )
    batch_course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("batch_courses.id", ondelete="CASCADE"), index=True
    )
    module_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("modules.id", ondelete="CASCADE"), index=True
    )
    unlock_date: Mapped[date] = mapped_column(Date, nullable=False)

    batch_course: Mapped["BatchCourse"] = relationship()
    module: Mapped["Module"] = relationship()  # noqa: F821
