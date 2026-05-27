#!/usr/bin/env bash
set -euo pipefail

echo "Start backend on :8000"
(cd backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!

echo "Start frontend on :5173"
(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap 'kill ${BACKEND_PID} ${FRONTEND_PID} 2>/dev/null || true' EXIT
wait
