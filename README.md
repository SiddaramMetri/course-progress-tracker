# BatchLearn - Batch-Based Learning Management System

A full-featured Learning Management System (LMS) built with Next.js, FastAPI, PostgreSQL, and MinIO. Supports course management, video lessons, batch-based scheduling, drip content delivery, access control, and student progress tracking.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, TipTap Editor |
| **Backend** | Python, FastAPI, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL 16 (Docker) |
| **Storage** | MinIO S3-compatible (Docker) - videos, attachments, cover images |
| **Auth** | Session tokens with refresh token rotation, bcrypt password hashing |

## Prerequisites

- **Docker & Docker Compose** (for PostgreSQL + MinIO)
- **Python 3.11+**
- **Node.js 18+**

## Quick Start

### 1. Start Services

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5432` (user: `postgres`, password: `postgres`, db: `course_tracker`)
- **MinIO API** on port `9000` (access key: `minioadmin`, secret: `minioadmin`)
- **MinIO Console** on port `9001`

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed    # creates tables, demo users, batches, 10 courses with 65 lessons
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

---

## Routes

### Public Routes (No Auth)

| Route | Description |
|-------|-------------|
| `/` | Landing page - hero, features, course catalog with search |
| `/explore/{courseId}` | Public course detail - curriculum preview, enroll/request access |
| `/login` | Student login with demo accounts |
| `/register` | Student self-registration |
| `/admin` | Admin login (separate route, rejects non-admin accounts) |

### Authenticated Routes (Learner + Admin)

| Route | Description |
|-------|-------------|
| `/dashboard` | My courses, progress tracking, access requests status |
| `/courses/{courseId}` | Course detail - lesson content, video player, progress toggle |
| `/account` | Profile settings (name, email, mobile, batch info) |
| `/notifications` | Notification center |

### Admin-Only Routes

| Route | Description |
|-------|-------------|
| `/admin/users` | User management - stats, batch assignment, block/unblock |
| `/admin/batches` | Batch management - create, publish courses, schedule modules |
| `/admin/requests` | Access request approval/rejection |

---

## Demo Accounts

### Admin Login (`/admin`)

| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | admin123 | Admin |

### Student Login (`/login`)

| Email | Password | Role | Batch |
|-------|----------|------|-------|
| alice@demo.com | learner123 | Learner | July-2026 |
| bob@demo.com | learner123 | Learner | July-2026 |
| charlie@demo.com | learner123 | Learner | July-2026 |
| diana@demo.com | learner123 | Learner | July-2026 |
| eve@demo.com | learner123 | Learner | July-2026 |

> **Tip:** Both login pages have one-click demo login buttons.

---

## Seeded Data

### Courses (10 total)

| Course | Type | Modules | Lessons | Content |
|--------|------|---------|---------|---------|
| Python Programming Fundamentals | Premium | 3 | 8 | Video + reading |
| Web Development with HTML & CSS | **FREE** | 2 | 7 | Video + reading |
| JavaScript Essentials | Premium | 3 | 8 | Reading |
| Git & Version Control | **FREE** | 2 | 5 | Reading |
| Data Science with Python | Premium | 3 | 7 | Reading |
| CI/CD Pipeline Fundamentals | Premium | 2 | 7 | Reading + exercises |
| GitHub Actions Masterclass | **FREE** | 2 | 6 | Reading + exercises |
| Docker & Containerization | Premium | 2 | 6 | Reading + exercises |
| Application Security Essentials | Premium | 2 | 6 | Reading + exercises |
| Cloud Deployment & AWS Basics | Premium | 2 | 5 | Reading + exercises |

### Batches

| Batch | Period | Students |
|-------|--------|----------|
| July-2026 | Jul 1 - Jul 31, 2026 | 5 seeded learners |
| August-2026 | Aug 1 - Aug 31, 2026 | — |
| September-2026 | Sep 1 - Sep 30, 2026 | — |

---

## Access Control Model

| User Type | Free Courses | Premium Courses |
|-----------|-------------|-----------------|
| **Not logged in** | View curriculum (locked) | View curriculum (locked) |
| **Self-registered** (no batch) | Full access | Must "Request Access" → admin approves |
| **Batch learner** (admin-assigned) | Full access | Full access to batch-published courses (drip schedule) |
| **Admin** | Full access + CRUD | Full access + CRUD |

### Drip Schedule

When admin publishes a course to a batch:
- Module 1 unlocks on publish date
- Module 2 unlocks 1 week later
- Module 3 unlocks 2 weeks later
- Admin can customize each module's unlock date

---

## API Endpoints

### Public (No Auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/courses` | List all courses (with `?search=` param) |
| GET | `/api/public/courses/{id}` | Course detail with curriculum |
| POST | `/api/public/register` | Student self-registration |
| GET | `/api/health` | Health check |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login → access token + refresh token |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Current user profile |
| PUT | `/api/auth/profile` | Update name, mobile |

### Courses (Auth Required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/courses` | List accessible courses (filtered by role/batch) |
| GET | `/api/courses/{id}` | Course detail (403 if no access) |
| POST | `/api/progress/{lessonId}/toggle` | Toggle lesson completion |

### Courses CRUD (Admin Only)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |
| POST | `/api/courses/{id}/cover` | Upload cover image |
| POST/PUT/DELETE | `/api/courses/{id}/modules`, `/api/modules/{id}` | Module CRUD |
| POST/PUT/DELETE | `/api/modules/{id}/lessons`, `/api/lessons/{id}` | Lesson CRUD |

### Attachments & Videos (Auth Required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/lessons/{id}/attachments` | Upload attachment |
| GET | `/api/lessons/{id}/attachments` | List attachments |
| DELETE | `/api/lessons/attachments/{id}` | Delete attachment (admin) |
| POST | `/api/lessons/{id}/video` | Upload video to MinIO (admin) |
| DELETE | `/api/lessons/{id}/video` | Delete video (admin) |
| GET | `/api/lessons/{id}/video-url` | Get presigned video URL |

### Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | List my notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| POST | `/api/notifications/{id}/read` | Mark as read |
| POST | `/api/notifications/read-all` | Mark all read |
| POST | `/api/notifications/send` | Send to user or all (admin) |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users with progress |
| GET | `/api/admin/users/{id}` | User detail with per-course progress |
| POST | `/api/admin/users/{id}/block` | Block user |
| POST | `/api/admin/users/{id}/unblock` | Unblock user |
| PUT | `/api/admin/users/{id}/batch` | Assign user to batch |
| GET/POST/PUT/DELETE | `/api/admin/batches` | Batch CRUD |
| GET | `/api/admin/batches/{id}/detail` | Batch detail with courses, schedules, students |
| POST | `/api/admin/batches/{id}/publish` | Publish course to batch |
| PUT | `/api/admin/batches/schedules/{id}` | Update module unlock date |
| GET | `/api/admin/access-requests` | List all access requests |
| POST | `/api/admin/access-requests/{id}/approve` | Approve request |
| POST | `/api/admin/access-requests/{id}/reject` | Reject request |

### Access Requests (Auth Required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/public/access-requests` | Request access to premium course |
| GET | `/api/public/my-access-requests` | My access requests |

---

## Features

### For Learners
- Browse courses on public landing page with search
- Self-registration with instant free course access
- Request access to premium courses
- Video lessons (YouTube embed + self-hosted MinIO)
- Rich text lesson content (HTML)
- Exercise and reading lesson types
- Mark lessons complete/incomplete
- Progress tracking per module and course
- Next/Previous lesson navigation
- Course completion confetti celebration
- Notification bell with popup
- Account settings (name, mobile, batch info)

### For Admins
- Full course CRUD (create, edit, delete courses/modules/lessons)
- Rich text editor (TipTap) for lesson content
- Video upload to MinIO
- Cover image upload for courses
- User management (view all, block/unblock, assign batches)
- Batch management (create, publish courses, schedule modules)
- Drip content scheduling (weekly module unlock)
- Access request approval/rejection
- Send notifications to individual or all learners
- "View as Learner" preview mode
- User stats (batch vs self-registered, pending requests)

### Security
- Token-based auth with refresh token rotation (2h access / 30d refresh)
- Auto-refresh on 401, auto-logout on refresh failure
- Blocked user login prevention
- Course-level access control (free vs premium vs batch-published)
- Module-level lock enforcement (drip schedule)
- All admin endpoints require admin role
- All authenticated endpoints require valid token
- 23/23 security audit tests passing

---

## Project Structure

```
course-progress-tracker/
├── docker-compose.yml           # PostgreSQL + MinIO
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, routers
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── dependencies.py      # Auth dependencies (get_current_user, require_admin)
│   │   ├── models/              # ORM models (User, Course, Batch, Notification, etc.)
│   │   ├── schemas/             # Pydantic response/request models
│   │   ├── routers/             # API routes (auth, courses, admin, public, etc.)
│   │   ├── services/            # Business logic (auth, courses, admin, storage)
│   │   └── seed.py              # Database seeder (10 courses, 6 users, 3 batches)
│   └── requirements.txt
├── frontend/
│   ├── app/                     # Next.js pages (App Router)
│   │   ├── page.tsx             # Public landing page
│   │   ├── login/               # Student login
│   │   ├── register/            # Student registration
│   │   ├── admin/               # Admin login + admin pages
│   │   ├── dashboard/           # Authenticated dashboard
│   │   ├── courses/[courseId]/   # Course detail + lesson player
│   │   ├── explore/[courseId]/   # Public course preview
│   │   ├── account/             # Profile settings
│   │   └── notifications/       # Notification center
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── app-shell.tsx        # Layout (sidebar + topbar)
│   │   ├── app-sidebar.tsx      # Navigation sidebar
│   │   ├── top-navbar.tsx       # Top bar with notification bell
│   │   ├── course-list.tsx      # Course card grid
│   │   ├── course-sidebar.tsx   # Module/lesson tree
│   │   ├── lesson-panel.tsx     # Lesson content + video + navigation
│   │   ├── video-player.tsx     # YouTube + MinIO video player
│   │   ├── rich-text-editor.tsx # TipTap editor with toolbar
│   │   ├── confetti-celebration.tsx # Course completion animation
│   │   ├── auth-guard.tsx       # Auth redirect wrapper
│   │   └── require-role.tsx     # Role-based rendering (AdminOnly)
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-auth.tsx         # Auth context (isAdmin, isLearner, login, logout)
│   │   ├── use-courses.ts       # TanStack Query - course list
│   │   ├── use-course-detail.ts # TanStack Query - course detail
│   │   ├── use-toggle-lesson.ts # TanStack Query - mutation
│   │   ├── use-attachments.ts   # TanStack Query - attachments
│   │   ├── use-admin.ts         # Admin CRUD operations
│   │   └── use-confirm.ts       # Toast-based confirmation
│   ├── lib/
│   │   ├── api.ts               # Fetch wrapper (auth headers, auto-refresh, 401/403 handling)
│   │   ├── query-keys.ts        # TanStack Query key factory
│   │   └── utils.ts             # shadcn utilities
│   └── types/index.ts           # TypeScript interfaces
└── README.md
```
