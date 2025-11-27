@echo off
chcp 65001 >nul
color 0B
echo ================================================
echo   🔍 KORNYEZET ELLENORZO
echo ================================================
echo.

echo [1/5] Projekt struktura ellenorzese...
if exist "backend" (
    echo ✅ backend/ mappa OK
) else (
    echo ❌ backend/ mappa HIÁNYZIK
    echo    Rossz helyen vagy! Menj a projekt fokonyvtaraba!
)

if exist "frontend" (
    echo ✅ frontend/ mappa OK
) else (
    echo ❌ frontend/ mappa HIÁNYZIK
)

if exist "backend\app" (
    echo ✅ backend/app/ mappa OK
) else (
    echo ❌ backend/app/ mappa HIÁNYZIK
)

if exist "backend\app\main.py" (
    echo ✅ backend/app/main.py OK
) else (
    echo ❌ backend/app/main.py HIÁNYZIK
)
echo.

echo [2/5] Python ellenorzese...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python telepitve:
    python --version
) else (
    echo ❌ Python NINCS telepitve vagy nincs a PATH-ban!
    echo    Telepitsd innen: https://www.python.org/downloads/
)
echo.

echo [3/5] Pip ellenorzese...
python -m pip --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Pip OK:
    python -m pip --version
) else (
    echo ❌ Pip NINCS elerheto!
)
echo.

echo [4/5] Node.js ellenorzese...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js telepitve:
    node --version
) else (
    echo ❌ Node.js NINCS telepitve!
    echo    Telepitsd innen: https://nodejs.org/
)
echo.

echo [5/5] NPM ellenorzese...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ NPM OK:
    npm --version
) else (
    echo ❌ NPM NINCS elerheto!
)
echo.

echo ================================================
echo   OSSZEGZES
echo ================================================
echo.
echo Ha minden ✅ akkor folytathatod:
echo   1. START-BACKEND-PY314-DEBUG.bat
echo   2. START-FRONTEND.bat
echo.
echo Ha van ❌ akkor eloszor javitsd azt!
echo.
pause
