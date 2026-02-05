@echo off
echo ========================================
echo    Meedle - First Time Setup
echo ========================================
echo.
echo Choose setup method:
echo.
echo [1] Docker (Recommended)
echo     - No Node.js required
echo     - Automatic database setup
echo     - Isolated environment
echo.
echo [2] Local (Manual)
echo     - Requires Node.js 18+
echo     - Manual database setup
echo     - Direct on your system
echo.
echo ========================================
echo.

choice /C 12 /N /M "Enter your choice (1 or 2): "
set SETUP_CHOICE=%ERRORLEVEL%

echo.
echo ========================================
echo.

if %SETUP_CHOICE%==1 goto DOCKER_SETUP
if %SETUP_CHOICE%==2 goto LOCAL_SETUP

:DOCKER_SETUP
echo    Docker Setup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed or not running!
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    echo.
    echo After installation:
    echo 1. Start Docker Desktop
    echo 2. Run this setup again
    echo.
    pause
    exit /b 1
)

echo Docker found! Version:
docker --version
echo.

echo [1/2] Pulling required Docker images...
echo This may take a few minutes...
docker pull node:18-alpine
docker pull postgres:15-alpine

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to pull Docker images!
    echo Please check your internet connection.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/2] Building Docker containers...
docker compose build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to build Docker containers!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Docker Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run start.bat to launch the application
echo 2. Access at http://localhost:3000
echo.
echo Useful commands:
echo - start.bat : Start the application
echo - stop.bat  : Stop all containers
echo.
pause
exit /b 0

:LOCAL_SETUP
echo    Local Setup (Node.js)
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js 18+ from:
    echo https://nodejs.org/
    echo.
    echo After installation, run this setup again.
    echo.
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version
echo.

echo [1/2] Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install backend dependencies.
    echo Please make sure Node.js is installed correctly.
    echo.
    pause
    cd ..
    exit /b 1
)
cd ..
echo.

echo [2/2] Installing Frontend Dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install frontend dependencies.
    echo.
    pause
    cd ..
    exit /b 1
)
cd ..
echo.

echo ========================================
echo    Local Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run start.bat for Docker version
echo 2. Or manually start:
echo    - Backend:  cd backend ^&^& npm run dev
echo    - Frontend: cd frontend ^&^& npm run dev
echo.
echo Note: For local setup, you'll need to run
echo both backend and frontend manually, or use
echo the old start.ps1 script.
echo.
pause
exit /b 0
