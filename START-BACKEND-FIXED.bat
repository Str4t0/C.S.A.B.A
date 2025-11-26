@echo off
echo Backend Inditas
echo.

REM Meghajto valtas
D:

REM Mappa valtas
cd D:\Programozas\Progs\home-inventory-system\home-inventory-system\backend

echo Fuggosegek telepitese...
python -m pip install fastapi "uvicorn[standard]" sqlalchemy pydantic pillow python-multipart aiofiles python-dotenv

if errorlevel 1 (
    echo HIBA: Telepites nem sikerult!
    pause
    exit /b 1
)

echo.
echo Backend indul...
echo NE zard be az ablakot!
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause