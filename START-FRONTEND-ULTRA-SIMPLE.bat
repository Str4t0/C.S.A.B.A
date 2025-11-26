@echo off
echo Frontend Inditas
echo.

cd frontend

echo npm install...
call npm install

if errorlevel 1 (
    echo npm install HIBA!
    pause
    exit /b 1
)

echo.
echo Frontend indul...
echo NE zard be az ablakot!
echo.

call npm run dev

pause
