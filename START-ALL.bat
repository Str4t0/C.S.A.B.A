@echo off
color 0A
echo ================================================
echo   Otthoni Targyi Nyilvantarto - TELJES INDITAS
echo ================================================
echo.
echo Mindket service indul...
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo - Halozati eleres: http://[HELYI-IP]:3000
echo.

echo A szkript konyvtara: %~dp0
pushd "%~dp0"

echo [1/2] Backend inditasa...
start "Backend Server" cmd /k "cd backend ^&^& python -m pip install --quiet fastapi uvicorn[standard] sqlalchemy pydantic pillow ^&^& python-multipart aiofiles python-dotenv ^&^& echo. ^&^& echo Backend indul... ^&^& echo. ^&^& python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Frontend inditasa...
timeout /t 5 /nobreak >nul
start "Frontend Dev Server" cmd /k "cd frontend ^&^& npm install ^&^& echo. ^&^& echo Frontend indul... ^&^& echo. ^&^& npm run dev -- --host"

echo.
echo ================================================
echo   SIKERESEN ELINDULT!
echo ================================================
echo.
echo 2 uj ablak nyilt meg:
echo   1. Backend Server
echo   2. Frontend Dev Server
echo.
echo Lokalis eleres:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo.
echo Halozati eleres (mas eszkozokrol):
echo   1. Nyisd meg a CMD-t es ird be: ipconfig
echo   2. Keresd meg az "IPv4 Address" erteket
echo   3. Pelda: http://192.168.1.100:3000
echo.
echo A helyi IP cimed:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo   http://%%a:3000 ^& goto :found
:found
echo.
echo TIPP: Mobilon vagy masik gepen is hasznalhatod!
echo       Biztosits, hogy ugyanazon a halozaton vagy!
echo.
echo Leallitas: Zard be a 2 CMD ablakot vagy nyomj CTRL+C mindkettobe
echo.
pause
