"""Database migrations for BatchLearn.

Run from the backend directory:
    python -m app.migrations.migrate
"""

from sqlalchemy import text, inspect

from app.database import engine


def run_migrations():
    """Apply all pending migrations."""
    inspector = inspect(engine)

    with engine.connect() as conn:
        applied = []

        # --- Migration 001: Add last_login_at to users ---
        user_cols = [c["name"] for c in inspector.get_columns("users")]
        if "last_login_at" not in user_cols:
            conn.execute(
                text(
                    "ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE"
                )
            )
            applied.append("001_add_users_last_login_at")

        # --- Migration 002: Unique constraint on course title ---
        conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_course_title ON courses (title)"
            )
        )

        # --- Migration 003: Unique constraint on module title per course ---
        conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_module_course_title ON modules (course_id, title)"
            )
        )

        # --- Migration 004: Unique constraint on lesson title per module ---
        conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_lesson_module_title ON lessons (module_id, title)"
            )
        )

        if not applied:
            applied.append("002-004_unique_indexes (idempotent)")

        conn.commit()

        for m in applied:
            print(f"  ✓ {m}")

    print("Migrations complete.")


if __name__ == "__main__":
    print("Running database migrations...")
    run_migrations()
