@echo off
echo ========================================
echo    Meedle - First Time Setup
echo ========================================
echo.

echo [1/2] Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install backend dependencies.
    echo Please make sure Node.js is installed.
    pause
    exit /b
)
cd ..
echo.

echo [2/2] Installing Frontend Dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install frontend dependencies.
    pause
    exit /b
)
cd ..
echo.

echo ========================================
echo    Setup Complete!
echo    You can now run start.bat
echo ========================================
pause
