@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Meedle - Automated Setup
echo ========================================
echo.

REM --- 1. Check Docker ---
echo [1/8] Checking Docker...
docker --version >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: Docker is not running! Please start Docker Desktop.
    exit /b 1
)
docker --version
echo.

REM --- 2. Cleanup ---
echo [2/8] Cleaning up existing containers and build cache...
docker compose down -v >nul 2>&1
docker builder prune -f >nul 2>&1

echo.
echo [3/8] Preparing for clean build...
REM Remove lockfiles to prevent cross-platform conflicts during build
if exist "backend\package-lock.json" del "backend\package-lock.json"
if exist "frontend\package-lock.json" del "frontend\package-lock.json"

echo.
echo [4/8] Building Docker containers (clean pull, no-cache)...
echo This may take a while as it pulls fresh images...
docker compose build --pull --no-cache
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ERROR: Failed to build containers.
    echo.
    echo Potential fixes:
    echo 1. Run 'docker system prune -a' to clear disk space
    echo 2. Check your internet connection for image downloads
    echo 3. Restart Docker Desktop
    echo.
    pause
    exit /b 1
)
echo.

REM --- 5. Start Database ---
echo [5/8] Starting database service...
docker compose up db -d
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: Failed to start database.
    exit /b 1
)

echo Waiting for database to stabilize (15 seconds)...
timeout /t 15 /nobreak >nul
echo.

REM --- 6. Prisma Setup ---
echo [6/8] Setting up Prisma (Generate ^& Push)...
docker compose run --rm backend npx prisma generate
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: Prisma generate failed.
    exit /b 1
)

docker compose run --rm backend npx prisma db push --accept-data-loss
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: Prisma db push failed.
    exit /b 1
)
echo.

REM --- 7. Seed Data ---
echo [7/8] Seeding database...
docker compose run --rm backend npm run db:seed
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: Seeding failed.
    exit /b 1
)
echo.

REM --- 8. Final Start ---
echo [8/8] Starting all services...
docker compose up -d
echo.

echo ========================================
echo    SETUP COMPLETE!
echo ========================================
echo.
echo Meedle is now running:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo.
echo To stop, run: stop.bat
echo = :D =
echo.
timeout /t 5
exit /b 0

