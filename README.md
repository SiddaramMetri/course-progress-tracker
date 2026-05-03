# Course Progress Tracker

A mini-application to view course curricula, mark lessons as complete, track learning progress, and upload lesson materials (documents, videos, notes, etc.).

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, MinIO (S3-compatible storage)
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Infrastructure:** Docker Compose (PostgreSQL + MinIO)

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

## Setup

### 1. Start Services (PostgreSQL + MinIO)

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5432` (user: `postgres`, password: `postgres`, db: `course_tracker`)
- **MinIO API** on port `9000` (access key: `minioadmin`, secret: `minioadmin`)
- **MinIO Console** on port `9001` (browse uploaded files at http://localhost:9001)

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python -m app.seed    # creates tables and seeds sample data
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/courses` | List all courses with progress |
| GET | `/api/courses/{id}` | Course detail with modules and lessons |
| POST | `/api/progress/{lesson_id}/toggle` | Toggle lesson completion |
| POST | `/api/lessons/{lesson_id}/attachments` | Upload file to a lesson |
| GET | `/api/lessons/{lesson_id}/attachments` | List lesson attachments |
| DELETE | `/api/lessons/attachments/{id}` | Delete an attachment |
| GET | `/api/health` | Health check |

## Project Structure

```
course-progress-tracker/
├── docker-compose.yml       # PostgreSQL + MinIO
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Environment settings
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models/          # ORM models (Course, Module, Lesson, Attachment, UserProgress)
│   │   ├── schemas/         # Pydantic response models
│   │   ├── routers/         # API route handlers
│   │   ├── services/        # Business logic + MinIO storage
│   │   └── seed.py          # Database seeder
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   └── types/               # TypeScript interfaces
└── README.md
```
