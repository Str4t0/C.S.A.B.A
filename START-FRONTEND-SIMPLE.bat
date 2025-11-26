@echo off
color 0B
echo ============================================
echo   Frontend Inditas
echo ============================================
echo.

cd frontend

echo Node.js verzio:
node --version
npm --version
echo.

echo Fuggosegek telepitese...
echo Varj 1-2 percet...
echo.

call npm install

if errorlevel 1 (
    echo.
    echo HIBA: npm install nem sikerult!
    echo.
    pause
    exit /b 1
)

echo.
echo Frontend sikeresen telepitve!
echo.
echo Frontend elerheto lesz: http://localhost:3000
echo.
echo NE zard be ezt az ablakot!
echo.
echo Frontend inditasa...
echo.

call npm run dev

if errorlevel 1 (
    echo.
    echo HIBA: Frontend inditas nem sikerult!
    pause
)

pause
