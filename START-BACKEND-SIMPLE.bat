@echo off
color 0A
echo ================================================
echo   Backend Inditas - Python 3.14
echo ================================================
echo.

REM Backend mappa ellenorzese
if not exist "backend" (
    color 0C
    echo.
    echo HIBA: Nem talalom a backend mappat!
    echo.
    echo Jelenlegi hely:
    cd
    echo.
    echo Helyes struktura:
    echo   home-inventory-system/
    echo   - START-BACKEND-SIMPLE.bat
    echo   - backend/
    echo   - frontend/
    echo.
    pause
    exit /b 1
)

cd backend

echo Python verzio:
python --version 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo HIBA: Python nincs telepitve!
    echo Telepitsd innen: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
echo.

echo Requirements fajl letrehozasa...
(
echo fastapi^>=0.115.0
echo uvicorn[standard]^>=0.32.0
echo sqlalchemy^>=2.0.36
echo pydantic^>=2.10.0
echo pillow^>=11.0.0
echo python-multipart^>=0.0.18
echo aiofiles^>=24.1.0
echo python-dotenv^>=1.0.1
echo annotated-types^>=0.7.0
echo typing-extensions^>=4.12.0
) > requirements-py314.txt

echo.
echo Pip frissitese...
python -m pip install --upgrade pip setuptools wheel
echo.

echo Fuggosegek telepitese...
echo Varj 2-3 percet...
echo.
python -m pip install -r requirements-py314.txt

if %errorlevel% neq 0 (
    color 0E
    echo.
    echo ================================================
    echo   HIBA: Telepites nem sikerult!
    echo ================================================
    echo.
    echo MEGOLDASOK:
    echo.
    echo 1. Futtasd ADMIN MODBAN:
    echo    Jobb klikk -^> Run as administrator
    echo.
    echo 2. Visual C++ Build Tools:
    echo    https://visualstudio.microsoft.com/downloads/
    echo.
    echo 3. Hasznald Python 3.11-et:
    echo    https://www.python.org/downloads/release/python-31110/
    echo.
    pause
    exit /b 1
)

echo.
color 0A
echo ================================================
echo   Backend sikeresen telepitve!
echo ================================================
echo.
echo Backend portok:
echo   - API: http://localhost:8000
echo   - Docs: http://localhost:8000/api/docs
echo.
echo NE zard be ezt az ablakot!
echo CTRL+C megnyomasaval allithato le.
echo.
echo Backend inditasa...
echo.

if not exist "app" (
    color 0C
    echo HIBA: Nem talalom az app mappat!
    pause
    exit /b 1
)

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo Hiba az inditas soran!
    echo.
)

echo.
echo Backend leallitva.
pause
