from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, attachments, auth, courses, notifications, progress, public

app = FastAPI(title="BatchLearn", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(progress.router)
app.include_router(attachments.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(public.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
