@echo off
echo ========================================
echo    Meedle - Educational Platform
echo    Docker Version
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker Compose is not available!
    echo Please make sure Docker Desktop is running.
    echo.
    pause
    exit /b 1
)

echo [1/3] Stopping any existing containers...
docker compose down >nul 2>&1

echo [2/3] Building and starting Docker containers...
echo This may take a few minutes on first run...
docker compose up -d --build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start Docker containers!
    echo Please check Docker Desktop is running.
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Waiting for services to start...
timeout /t 10 /nobreak > nul

echo.
echo Opening Browser...
start http://localhost:3000

echo.
echo ========================================
echo    Meedle is running in Docker!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo Database: localhost:5432
echo.
echo To view logs: docker compose logs -f
echo To stop:      docker compose down
echo ========================================
echo.
pause
