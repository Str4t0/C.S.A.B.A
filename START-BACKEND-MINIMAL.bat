@echo off
echo Backend inditas...
echo.

cd backend

echo Fuggosegek telepitese...
python -m pip install fastapi "uvicorn[standard]" sqlalchemy pydantic pillow python-multipart aiofiles python-dotenv

if %errorlevel% neq 0 (
    echo.
    echo HIBA a telepites soran!
    echo Probald Admin modban futtatni!
    echo.
    pause
    exit /b 1
)

echo.
echo Backend indul...
echo Ne zard be az ablakot!
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
