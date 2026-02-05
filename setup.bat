@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Meedle - Automated Setup
echo ========================================
echo.

REM --- 1. Check Docker ---
echo [1/7] Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running! Please start Docker Desktop.
    exit /b 1
)
docker --version
echo.

REM --- 2. Cleanup ---
echo [2/7] Cleaning up existing containers...
docker compose down -v >nul 2>&1
echo.

REM --- 3. Build ---
echo [3/7] Building Docker containers (this may take a while)...
docker compose build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to build containers.
    exit /b 1
)
echo.

REM --- 4. Start Database ---
echo [4/7] Starting database service...
docker compose up db -d
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start database.
    exit /b 1
)

echo Waiting for database to stabilize (10 seconds)...
timeout /t 10 /nobreak >nul
echo.

REM --- 5. Prisma Setup ---
echo [5/7] Setting up Prisma (Generate ^& Push)...
docker compose run --rm backend npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Prisma generate failed.
    exit /b 1
)

docker compose run --rm backend npx prisma db push --accept-data-loss
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Prisma db push failed.
    exit /b 1
)
echo.

REM --- 6. Seed Data ---
echo [6/7] Seeding database...
docker compose run --rm backend npm run db:seed
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Seeding failed.
    exit /b 1
)
echo.

REM --- 7. Final Start ---
echo [7/7] Starting all services...
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

