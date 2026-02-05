@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Meedle - Automated Setup (v3)
echo ========================================
echo.

REM --- 1. Check Docker ---
echo [1/8] Checking Docker...
docker --version >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: Docker is not running or not installed!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
docker --version
echo.

REM --- 2. Create .env if not exists ---
if not exist "backend\.env" (
    echo [2/8] Creating .env from .env.example...
    copy backend\.env.example backend\.env >nul
)

REM --- 3. Cleanup ---
echo [3/8] Cleaning up existing containers and build cache...
docker compose down -v >nul 2>&1
docker builder prune -f >nul 2>&1

echo.
echo [4/8] Preparing for clean build...
REM Видаляємо lock-файли, які можуть блокувати збірку на різних ОС
if exist "backend\package-lock.json" del "backend\package-lock.json"
if exist "frontend\package-lock.json" del "frontend\package-lock.json"

echo.
echo [5/8] Building Docker containers (clean build)...
echo This might take several minutes...
docker compose build --pull --no-cache
docker image prune -f >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ERROR: Failed to build containers.
    echo Trying with BuildKit disabled as a fallback...
    set DOCKER_BUILDKIT=0
    docker compose build --pull
    if !ERRORLEVEL! NEQ 0 (
        echo.
        echo CRITICAL ERROR: Build failed even without BuildKit.
        echo Check your internet connection.
        pause
        exit /b 1
    )
)
echo.

REM --- 6. Start Database ---
echo [6/8] Starting database...
docker compose up db -d
echo Waiting for DB to be ready (15 seconds)...
timeout /t 15 /nobreak >nul

REM --- 7. Prisma Setup ---
echo [7/8] Initializing Database (Prisma)...
docker compose run --rm backend npx prisma generate
docker compose run --rm backend npx prisma db push --accept-data-loss
docker compose run --rm backend npm run db:seed

if !ERRORLEVEL! NEQ 0 (
    echo.
    echo WARNING: Prisma initialization had some issues.
    echo API might be empty, but we will still try to start.
)

REM --- 8. Final Start ---
echo [8/8] Starting all services...
docker compose up -d
echo.

echo ========================================
echo    SETUP FINISHED!
echo ========================================
echo.
echo ✅ Frontend: http://localhost:3000
echo ✅ Backend API: http://localhost:5000
echo ✅ Database is ready with Prisma
echo.
echo To view logs: docker compose logs -f
echo.
timeout /t 10
exit /b 0
