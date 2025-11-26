@echo off
chcp 65001 >nul
color 0A
echo ================================================
echo   🏠 Otthoni Targyi Nyilvantarto - Backend
echo   Python 3.14 Kompatibilis Verzio
echo ================================================
echo.

REM Ellenőrizzük hogy a backend mappában vagyunk-e
if not exist "backend" (
    color 0C
    echo.
    echo ❌ HIBA: Nem talalom a backend mappat!
    echo.
    echo Biztosits, hogy a projekt fokonyvtaraban vagy!
    echo.
    echo Jelenlegi hely:
    cd
    echo.
    echo Helyes struktura:
    echo   home-inventory-system/
    echo   ├── START-BACKEND-PY314.bat  ^<-- Itt vagy
    echo   ├── backend/                 ^<-- Ezt keresem
    echo   └── frontend/
    echo.
    pause
    exit /b 1
)

cd backend

echo 🐍 Python verzio ellenorzese...
python --version 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ HIBA: Python nincs telepitve vagy nincs a PATH-ban!
    echo.
    echo Telepitsd Python 3.14-et innen:
    echo https://www.python.org/downloads/
    echo.
    echo FONTOS: Telepiteskor pipald be az "Add Python to PATH" opciot!
    echo.
    pause
    exit /b 1
)
echo.

echo 📦 Frissitett fuggosegek (Python 3.14)...
echo.

REM Requirements Python 3.14-hez
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

echo 🔄 Pip es setuptools frissitese...
python -m pip install --upgrade pip setuptools wheel
echo.

echo 📥 Fuggosegek telepitese...
echo    Ez 2-5 percet vehet igenybe, legyszi varj...
echo.
python -m pip install -r requirements-py314.txt

if %errorlevel% neq 0 (
    color 0E
    echo.
    echo ================================================
    echo   ⚠️  FIGYELEM: Telepitesi problema!
    echo ================================================
    echo.
    echo Lehetseges okok es megoldasok:
    echo.
    echo 1^) Futtasd ADMIN MODBAN:
    echo    - Jobb klikk a .bat fajlra
    echo    - "Run as administrator"
    echo.
    echo 2^) Telepitsd a Visual C++ Build Tools-t:
    echo    https://visualstudio.microsoft.com/downloads/
    echo    ^(Build Tools for Visual Studio 2022^)
    echo.
    echo 3^) VAGY hasznald Python 3.11-et:
    echo    https://www.python.org/downloads/release/python-31110/
    echo.
    echo Probald meg az 1-es megoldast eloszor ^(Admin mod^)!
    echo.
    pause
    exit /b 1
)

echo.
color 0A
echo ================================================
echo   ✅ Backend sikeresen telepitve!
echo ================================================
echo.
echo 🌐 Backend portok:
echo    - API: http://localhost:8000
echo    - Docs: http://localhost:8000/api/docs
echo    - Health: http://localhost:8000/
echo.
echo ⚠️  NE zard be ezt az ablakot amig hasznalod!
echo    CTRL+C megnyomasaval allithato le.
echo.
echo 🚀 Backend inditasa...
echo.

REM Ellenőrizzük hogy létezik-e az app mappa
if not exist "app" (
    color 0C
    echo.
    echo ❌ HIBA: Nem talalom az app mappat!
    echo.
    echo Biztosits, hogy a backend/ mappaban vannak a fajlok:
    dir /b
    echo.
    pause
    exit /b 1
)

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

REM Ha valami hiba történt
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ Hiba az inditas soran!
    echo.
    echo Ellenorizd:
    echo 1. A backend/app/main.py fajl letezik
    echo 2. Nincs mas alkalmazas a 8000-es porton
    echo 3. Minden fuggoseg telepitve van
    echo.
)

echo.
echo Backend leallitva.
echo.
pause
