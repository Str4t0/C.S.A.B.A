@echo off
color 0B
echo ================================================
echo   Otthoni Targyi Nyilvantarto - HTTPS INDITAS
echo ================================================
echo.

REM IP cim meghatarozasa
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP:~1%

echo Helyi IP cim: %LOCAL_IP%
echo.

REM Ellenorizzuk, hogy letezik-e a tanusitvany
if not exist "frontend\certs\cert.pem" (
    echo [FIGYELMEZTETES] HTTPS tanusitvany nem talalhato!
    echo.
    echo Tanusitvany generalasa...
    cd frontend
    call generate-cert.bat
    cd ..
    echo.
    
    if not exist "frontend\certs\cert.pem" (
        echo [HIBA] Tanusitvany generalasa sikertelen!
        echo Hasznalj HTTP-t a START-ALL.bat fajllal, vagy
        echo telepitsd az OpenSSL-t es probald ujra.
        pause
        exit /b 1
    )
)

echo Mindket service HTTPS-sel indul...
echo - Backend: http://localhost:8000 (HTTP)
echo - Frontend: https://localhost:3000 (HTTPS)
echo - Halozati eleres: https://%LOCAL_IP%:3000
echo.

REM Meghajto valtas
D:
cd D:\Programozas\Progs\home-inventory-system\home-inventory-system

REM .env fajl letrehozasa/frissitese
echo # Auto-generalt .env fajl > frontend\.env
echo VITE_API_URL=http://%LOCAL_IP%:8000/api >> frontend\.env
echo [INFO] .env fajl letrehozva: VITE_API_URL=http://%LOCAL_IP%:8000/api
echo.

echo [1/2] Backend inditasa (HTTP)...
start "Backend Server" cmd /k "cd backend && python -m pip install --quiet fastapi uvicorn[standard] sqlalchemy pydantic pillow python-multipart aiofiles python-dotenv qrcode[pil] && echo. && echo Backend indul... && echo. && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Frontend inditasa (HTTPS)...
timeout /t 5 /nobreak >nul
start "Frontend Dev Server (HTTPS)" cmd /k "cd frontend && npm install && echo. && echo Frontend indul HTTPS-sel... && echo. && set USE_HTTPS=true && set NODE_ENV=development && npm run dev"

echo.
echo ================================================
echo   SIKERESEN ELINDULT (HTTPS)!
echo ================================================
echo.
echo 2 uj ablak nyilt meg:
echo   1. Backend Server (port 8000 - HTTP)
echo   2. Frontend Dev Server (port 3000 - HTTPS)
echo.
echo ================================================
echo   ELERHETOSEGEK:
echo ================================================
echo.
echo [PC-ROL]
echo   Frontend: https://localhost:3000
echo   Backend:  http://localhost:8000/api/docs
echo.
echo [MOBILROL / MAS ESZKOZROL]
echo   Frontend: https://%LOCAL_IP%:3000
echo   Backend:  http://%LOCAL_IP%:8000/api/docs
echo.
echo FONTOS:
echo   - Mobil es PC azonos WiFi halozaton!
echo   - Tuzfal engedelyezi a 8000 es 3000 portokat!
echo   - A bongeszoben figyelmeztetes jelenik meg
echo     (self-signed tanusitvany) - fogadd el!
echo   - Mobil bongeszoben is el kell fogadni a tanusitvanyt!
echo.
echo Leallitas: Zard be a 2 CMD ablakot vagy CTRL+C
echo.
pause

