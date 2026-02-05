@echo off
echo ========================================
echo    Meedle - Setup Script
echo ========================================
echo.
echo Choose setup option:
echo.
echo [1] Fresh Install (Recommended for first time)
echo     - Clean setup from scratch
echo     - Removes old containers
echo     - Full Prisma setup
echo.
echo [2] Quick Setup (If already installed before)
echo     - Keeps existing data
echo     - Faster setup
echo.
echo [3] Fix/Rebuild (If having issues)
echo     - Cleans everything
echo     - Rebuilds from scratch
echo     - Fixes Docker/Prisma issues
echo.
echo [4] Local Setup (Without Docker)
echo     - Requires Node.js 18+
echo     - Manual database setup
echo.
echo ========================================
echo.

choice /C 1234 /N /M "Enter your choice (1-4): "
set SETUP_CHOICE=%ERRORLEVEL%

echo.
echo ========================================
echo.

if %SETUP_CHOICE%==1 goto FRESH_DOCKER_SETUP
if %SETUP_CHOICE%==2 goto QUICK_DOCKER_SETUP
if %SETUP_CHOICE%==3 goto FIX_DOCKER_SETUP
if %SETUP_CHOICE%==4 goto LOCAL_SETUP

:FRESH_DOCKER_SETUP
echo    Fresh Docker Install
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

echo [1/6] Cleaning old containers...
docker compose down -v >nul 2>&1

echo [2/6] Pulling required Docker images...
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
echo [3/6] Building Docker containers...
docker compose build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to build Docker containers!
    echo.
    pause
    exit /b 1
)

echo.
echo [4/6] Starting database...
docker compose up db -d

echo.
echo Waiting for database to be ready...
timeout /t 8 /nobreak >nul

echo.
echo [5/6] Setting up Prisma...
docker compose run --rm backend npm run db:generate
docker compose run --rm backend npm run db:push

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: Prisma setup had issues, trying alternative method...
    timeout /t 3 /nobreak >nul
    docker compose up backend -d
    timeout /t 5 /nobreak >nul
    docker compose exec backend npm run db:generate
    docker compose exec backend npm run db:push
)

echo.
echo [6/6] Seeding database with initial data...
docker compose run --rm backend npm run db:seed

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: Database seeding had issues.
    echo You can seed manually later with:
    echo   docker compose exec backend npm run db:seed
    echo.
)

echo.
echo Stopping temporary containers...
docker compose down

goto DOCKER_COMPLETE

:QUICK_DOCKER_SETUP
echo    Quick Docker Setup
echo ========================================
echo.

docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed or not running!
    pause
    exit /b 1
)

echo [1/2] Building containers...
docker compose build

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Starting services...
docker compose up -d

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start services!
    pause
    exit /b 1
)

echo.
echo Waiting for services...
timeout /t 5 /nobreak >nul

goto DOCKER_COMPLETE

:FIX_DOCKER_SETUP
echo    Fix/Rebuild Docker Setup
echo ========================================
echo.
echo This will clean everything and rebuild from scratch.
echo.
pause

docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed!
    pause
    exit /b 1
)

echo [1/7] Stopping all containers...
docker compose down -v

echo.
echo [2/7] Cleaning Docker cache...
docker system prune -f

echo.
echo [3/7] Building containers (no cache)...
docker compose build --no-cache

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [4/7] Starting database...
docker compose up db -d

echo.
echo Waiting for database...
timeout /t 10 /nobreak >nul

echo.
echo [5/7] Setting up Prisma...
docker compose run --rm backend npm run db:generate
docker compose run --rm backend npm run db:push

if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Trying alternative method...
    docker compose up backend -d
    timeout /t 5 /nobreak >nul
    docker compose exec backend npm run db:generate
    docker compose exec backend npm run db:push
)

echo.
echo [6/7] Seeding database...
docker compose run --rm backend npm run db:seed

echo.
echo [7/7] Starting all services...
docker compose up -d

echo.
echo Waiting for services...
timeout /t 5 /nobreak >nul

goto DOCKER_COMPLETE

:DOCKER_COMPLETE
echo.
echo ========================================
echo    Docker Setup Complete!
echo ========================================
echo.
echo Checking status...
docker compose ps
echo.

echo Testing API connection...
timeout /t 2 /nobreak >nul
curl -s http://localhost:5000/api/health 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ API is responding!
) else (
    echo.
    echo ⚠️  API not responding yet. It may need a few more seconds.
    echo    Check with: docker compose logs backend
)

echo.
echo ========================================
echo    Access Your Application:
echo ========================================
echo.
echo 🌐 Frontend:      http://localhost:3000
echo 🔧 Backend API:   http://localhost:5000
echo 💾 Database:      localhost:5432
echo 📊 Prisma Studio: docker compose exec backend npm run db:studio
echo.
echo ========================================
echo    Useful Commands:
echo ========================================
echo.
echo ▶️  Start:        start.bat
echo ⏹️  Stop:         stop.bat
echo 📋 View logs:     docker compose logs -f
echo 🔄 Restart:       docker compose restart
echo 🗑️  Clean all:     docker compose down -v
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
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies.
    pause
    cd ..
    exit /b 1
)

echo.
echo [2/4] Setting up Prisma...
call npm run db:generate
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Prisma generation failed.
    echo You may need to set up the database first.
)

cd ..
echo.

echo [3/4] Installing Frontend Dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies.
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
echo ⚠️  IMPORTANT: Database Setup Required!
echo.
echo For local development, you need PostgreSQL running.
echo.
echo 📌 Option 1 - Use Docker for database only:
echo    docker compose up db -d
echo    cd backend
echo    npm run db:push
echo    npm run db:seed
echo.
echo 📌 Option 2 - Install PostgreSQL locally:
echo    1. Install from https://www.postgresql.org/
echo    2. Create database: meedle_db
echo    3. Update backend/.env with credentials
echo    4. Run: cd backend ^&^& npm run db:push ^&^& npm run db:seed
echo.
echo Then start the application:
echo    Backend:  cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm run dev
echo.
pause
exit /b 0
