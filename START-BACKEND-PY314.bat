@echo off
chcp 65001 >nul
echo ================================================
echo   🏠 Otthoni Tárgyi Nyilvántartó - Backend
echo   Python 3.14 Kompatibilis Verzió
echo ================================================
echo.

cd backend

echo 🐍 Python verzió ellenőrzése...
python --version
echo.

echo 📦 Frissített függőségek (Python 3.14)...
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

echo 🔄 Pip és setuptools frissítése...
python -m pip install --upgrade pip setuptools wheel
echo.

echo 📥 Függőségek telepítése...
echo    Ez 2-5 percet vehet igénybe...
echo.
python -m pip install -r requirements-py314.txt

if %errorlevel% neq 0 (
    echo.
    echo ================================================
    echo   ❌ HIBA: Telepítés nem sikerült!
    echo ================================================
    echo.
    echo Lehetséges okok:
    echo.
    echo 1. Python 3.14 még béta verzió
    echo    Néhány könyvtárhoz nincs előre fordított csomag
    echo.
    echo 2. Hiányzik a C++ fordító környezet
    echo.
    echo MEGOLDÁSOK:
    echo.
    echo A^) Telepítsd a Visual C++ Build Tools-t:
    echo    https://visualstudio.microsoft.com/downloads/
    echo    ^(Build Tools for Visual Studio 2022^)
    echo.
    echo B^) VAGY használj Python 3.11/3.12-t
    echo    https://www.python.org/downloads/
    echo.
    echo C^) Futtasd ezt Adminként ^(jobb klikk -^> Run as admin^)
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   ✅ Backend sikeresen telepítve!
echo ================================================
echo.
echo 🌐 Backend portok:
echo    - API: http://localhost:8000
echo    - Docs: http://localhost:8000/api/docs
echo    - Health: http://localhost:8000/
echo.
echo ⚠️  NE zárd be ezt az ablakot amíg használod!
echo.
echo 🚀 Backend indítása...
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if %errorlevel% neq 0 (
    echo.
    echo ❌ Hiba az indítás során!
    pause
)
