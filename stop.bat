@echo off
echo ========================================
echo    Meedle - Docker Cleanup
echo ========================================
echo.

echo Stopping all Meedle containers...
docker compose down

echo.
echo ========================================
echo    All containers stopped!
echo ========================================
echo.
pause
