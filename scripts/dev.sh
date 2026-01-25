#!/bin/bash
# Development script - runs backend and opens browser
# Use this if you don't have Rust/Tauri installed yet

echo "Starting SUZENT in development mode..."

# Start Python backend in background
echo "→ Starting Python backend..."
python src/suzent/server.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend dev server
echo "→ Starting frontend dev server..."
cd frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
