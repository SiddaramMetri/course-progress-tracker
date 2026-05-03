# Course Progress Tracker

A mini-application to view course curricula, mark lessons as complete, and track learning progress.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

## Setup

### 1. Database

```bash
brew install postgresql@16
brew services start postgresql@16
createdb course_tracker
```

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
| GET | `/api/health` | Health check |

## Project Structure

```
course-progress-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Environment settings
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models/          # ORM models
│   │   ├── schemas/         # Pydantic response models
│   │   ├── routers/         # API route handlers
│   │   ├── services/        # Business logic
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
