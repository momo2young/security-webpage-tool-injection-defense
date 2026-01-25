#!/bin/bash
set -e

echo "========================================"
echo "   SUZENT Tauri Build Pipeline"
echo "========================================"

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Step 1: Build frontend
echo ""
echo "[1/4] Building frontend..."
cd "$PROJECT_ROOT/frontend"
npm install
npm run build

# Step 2: Build Python backend
echo ""
echo "[2/4] Building Python backend..."
cd "$PROJECT_ROOT"
python scripts/build_backend.py

# Step 3: Prepare resources
echo ""
echo "[3/4] Preparing resources..."
mkdir -p "$PROJECT_ROOT/src-tauri/binaries"

# Step 4: Build Tauri application
echo ""
echo "[4/4] Building Tauri application..."
cd "$PROJECT_ROOT/src-tauri"
npm run build

echo ""
echo "Build complete!"
echo "Artifacts: $PROJECT_ROOT/src-tauri/target/release/bundle/"
