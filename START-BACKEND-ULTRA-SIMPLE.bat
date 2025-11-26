@echo off
echo Backend Inditas - Python 3.14
echo.

cd backend

echo Python verzio:
python --version
echo.

echo Fuggosegek telepitese...
python -m pip install --upgrade pip
python -m pip install fastapi "uvicorn[standard]" sqlalchemy pydantic pillow python-multipart aiofiles python-dotenv

if errorlevel 1 (
    echo.
    echo HIBA: Telepites nem sikerult!
    echo Futtasd ADMIN MODBAN!
    pause
    exit /b 1
)

echo.
echo Backend indul...
echo NE zard be az ablakot!
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
