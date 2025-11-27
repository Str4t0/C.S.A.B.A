@echo off
color 0B
echo ================================================
echo   KORNYEZET ELLENORZO
echo ================================================
echo.

echo [1/5] Projekt struktura:
if exist "backend" (
    echo OK - backend/ mappa
) else (
    echo HIBA - backend/ mappa HIANZIK
)

if exist "frontend" (
    echo OK - frontend/ mappa
) else (
    echo HIBA - frontend/ mappa HIANZIK
)

if exist "backend\app" (
    echo OK - backend/app/ mappa
) else (
    echo HIBA - backend/app/ mappa HIANZIK
)

if exist "backend\app\main.py" (
    echo OK - backend/app/main.py
) else (
    echo HIBA - backend/app/main.py HIANZIK
)
echo.

echo [2/5] Python:
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo OK - Python telepitve:
    python --version
) else (
    echo HIBA - Python NINCS telepitve!
)
echo.

echo [3/5] Pip:
python -m pip --version >nul 2>&1
if %errorlevel% equ 0 (
    echo OK - Pip:
    python -m pip --version
) else (
    echo HIBA - Pip NINCS elerheto!
)
echo.

echo [4/5] Node.js:
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo OK - Node.js:
    node --version
) else (
    echo HIBA - Node.js NINCS telepitve!
)
echo.

echo [5/5] NPM:
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo OK - NPM:
    npm --version
) else (
    echo HIBA - NPM NINCS elerheto!
)
echo.

echo ================================================
echo   OSSZEGZES
echo ================================================
echo.
echo Ha minden OK akkor folytasd:
echo   1. START-BACKEND-SIMPLE.bat
echo   2. START-FRONTEND.bat
echo.
pause
