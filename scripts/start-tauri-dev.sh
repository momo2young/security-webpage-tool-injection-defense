#!/bin/bash
# Quick start script for Tauri development

echo "╔══════════════════════════════════════╗"
echo "║   SUZENT Tauri Development Mode     ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check for Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed!"
    echo ""
    echo "Please install Rust first:"
    echo "  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo ""
    exit 1
fi

echo "✓ Rust detected"

# Start backend in background
echo ""
echo "Starting Python backend..."
python3 src/suzent/server.py &
BACKEND_PID=$!

# Function to kill backend on exit
cleanup() {
    echo ""
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
    exit
}

trap cleanup INT TERM EXIT

# Wait for backend
echo "Waiting for backend to initialize..."
sleep 3

# Start Tauri
echo ""
echo "Starting Tauri desktop app..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  A DESKTOP WINDOW should open soon..."
echo "  (Not a browser tab!)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd src-tauri
npm install
npm run dev
