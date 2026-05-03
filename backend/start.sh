#!/bin/sh
set -e

echo "=== BatchLearn Backend Starting ==="

# Run database migrations / seed on startup
echo "Running database seed (skips if already seeded)..."
python -m app.seed

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
