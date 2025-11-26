@echo off
echo ============================================
echo   Otthoni Targyi Nyilvantarto - Frontend
echo ============================================
echo.

cd frontend

echo Node.js ellenorzese...
node --version
npm --version
echo.

echo Fuggosegek telepitese...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo HIBA: A fuggosegek telepitese nem sikerult!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Frontend sikeresen telepitve!
echo ========================================
echo.
echo Frontend elerheto: http://localhost:3000
echo.
echo NE zard be ezt az ablakot!
echo.

call npm run dev

pause
