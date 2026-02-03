@echo off
echo ========================================
echo    Meedle - Educational Platform
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js found: 
node --version
echo.

REM Check if dependencies are installed
echo [1/5] Checking dependencies...

if not exist "backend\node_modules\" (
    echo [INFO] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
) else (
    echo [OK] Backend dependencies already installed
)

if not exist "frontend\node_modules\" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
) else (
    echo [OK] Frontend dependencies already installed
)

echo.
echo [2/5] Starting Backend Server...
start "Meedle Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 5 /nobreak > nul

echo [3/5] Starting Frontend Server...
start "Meedle Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 8 /nobreak > nul

echo [4/5] Waiting for servers to start...
timeout /t 3 /nobreak > nul

echo [5/5] Opening Browser...
start http://localhost:5173

echo.
echo ========================================
echo    Meedle is starting!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Wait 10-15 seconds for servers to fully start
echo.
echo To stop servers: Close the terminal windows
echo ========================================
echo.
pause
