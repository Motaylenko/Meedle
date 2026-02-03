@echo off
echo ========================================
echo    Meedle - Educational Platform
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "Meedle Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Frontend Server...
start "Meedle Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak > nul

echo [3/3] Opening Browser...
start http://localhost:5173

echo.
echo ========================================
echo    Meedle is starting!
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul
