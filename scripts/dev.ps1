# Development script - runs backend and opens browser
# Use this if you don't have Rust/Tauri installed yet

Write-Host "Starting SUZENT in development mode..." -ForegroundColor Cyan

# Start Python backend in background
Write-Host "`nStarting Python backend..." -ForegroundColor Yellow
Start-Process -NoNewWindow powershell -ArgumentList "python src/suzent/server.py"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend dev server
Write-Host "Starting frontend dev server..." -ForegroundColor Yellow
Set-Location frontend
npm run dev
