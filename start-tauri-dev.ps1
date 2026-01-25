# Quick start script for Tauri development
# Starts both backend and Tauri app in separate windows

Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SUZENT Tauri Development Mode     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Rust is installed
try {
    $null = Get-Command cargo -ErrorAction Stop
} catch {
    Write-Host "❌ Rust is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Rust first:" -ForegroundColor Yellow
    Write-Host "  winget install --id Rustlang.Rustup" -ForegroundColor White
    Write-Host ""
    Write-Host "Or download from: https://rustup.rs/" -ForegroundColor White
    Write-Host ""
    Write-Host "After installing, restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Rust detected" -ForegroundColor Green

# Start backend in new window
Write-Host ""
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

# Start Tauri dev
Write-Host ""
Write-Host "Starting Tauri desktop app..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  A DESKTOP WINDOW should open soon..." -ForegroundColor Cyan
Write-Host "  (Not a browser tab!)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Set-Location src-tauri
npm run dev
