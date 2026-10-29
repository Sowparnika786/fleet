#!/bin/bash
set -e

echo "================================================="
echo "   FLEETWISE NEXUS // AUTONOMOUS DISPATCH SYSTEM"
echo "================================================="

# Start FastAPI backend on port 8000
echo ">> Starting FastAPI backend on http://127.0.0.1:8000 ..."
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

trap "kill $BACKEND_PID" EXIT

# Start Vite frontend on port 5173
echo ">> Starting Vite frontend on http://127.0.0.1:5173 ..."
npm run dev
