# PowerShell build script for SUZENT Tauri application
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SUZENT Tauri Build Pipeline" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ProjectRoot = Split-Path -Parent $PSScriptRoot

# Step 1: Build frontend
Write-Host "`n[1/4] Building frontend..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\frontend"
try {
    npm install
    npm run build
} finally {
    Pop-Location
}

# Step 2: Build Python backend
Write-Host "`n[2/4] Building Python backend..." -ForegroundColor Yellow
python "$ProjectRoot\scripts\build_backend.py"

# Step 3: Prepare resources
Write-Host "`n[3/4] Preparing resources..." -ForegroundColor Yellow
$BinariesDir = "$ProjectRoot\src-tauri\binaries"
if (-not (Test-Path $BinariesDir)) {
    New-Item -ItemType Directory -Force -Path $BinariesDir | Out-Null
}

# Step 4: Build Tauri application
Write-Host "`n[4/4] Building Tauri application..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\src-tauri"
try {
    npm run build
} finally {
    Pop-Location
}

Write-Host "`nBuild complete!" -ForegroundColor Green
Write-Host "Artifacts: $ProjectRoot\src-tauri\target\release\bundle\" -ForegroundColor Cyan
