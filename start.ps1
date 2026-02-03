# Meedle Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Meedle - Educational Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install from https://nodejs.org/" -ForegroundColor Red
    pause
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "[2/5] Checking dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "[INFO] Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
} else {
    Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[INFO] Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
} else {
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
}

# Start Backend
Write-Host ""
Write-Host "[3/5] Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Frontend
Write-Host "[4/5] Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 8

# Open Browser
Write-Host "[5/5] Opening Browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Meedle is starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Wait 10-15 seconds for servers to fully start" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop: Close the PowerShell windows" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
