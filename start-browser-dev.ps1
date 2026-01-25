# Quick start script for browser development
# Starts both backend and frontend in separate windows

Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SUZENT Browser Development Mode   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "This mode DOES NOT require Rust/Cargo" -ForegroundColor Green
Write-Host ""

# Start backend in new window
Write-Host "Starting Python backend in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python src/suzent/server.py"

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/config" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend running on http://localhost:8000" -ForegroundColor Green
} catch {
    Write-Host "⚠ Backend may still be starting..." -ForegroundColor Yellow
}

# Start frontend dev server
Write-Host ""
Write-Host "Starting frontend dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Your browser will open automatically" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend
npm run dev
