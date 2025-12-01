@echo off
color 0B
echo ================================================
echo   HALOZATI ELERES JAVITASA
echo ================================================
echo.

REM IP cim meghatarozasa
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP:~1%

echo Helyi IP cim: %LOCAL_IP%
echo.

echo [1/3] Windows Tuzfal szabalyok hozzaadasa...
echo.

REM Tuzfal szabaly hozzaadasa port 3000-hoz (Frontend)
netsh advfirewall firewall add rule name="Home Inventory Frontend (Port 3000)" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Port 3000 engedelyezve a tuzfalon
) else (
    echo [FIGYELMEZTETES] Port 3000 szabaly mar letezhet vagy nincs admin jog
)

REM Tuzfal szabaly hozzaadasa port 8000-hoz (Backend)
netsh advfirewall firewall add rule name="Home Inventory Backend (Port 8000)" dir=in action=allow protocol=TCP localport=8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Port 8000 engedelyezve a tuzfalon
) else (
    echo [FIGYELMEZTETES] Port 8000 szabaly mar letezhet vagy nincs admin jog
)

echo.
echo [2/3] Frontend .env fajl frissitese...
echo.

REM .env fajl letrehozasa/frissitese
if not exist "frontend" (
    echo [HIBA] frontend mappa nem talalhato!
    pause
    exit /b 1
)

echo # Auto-generalt .env fajl > frontend\.env
echo VITE_API_URL=http://%LOCAL_IP%:8000/api >> frontend\.env
echo [OK] .env fajl frissitve: VITE_API_URL=http://%LOCAL_IP%:8000/api

echo.
echo [3/3] Konfiguracio ellenorzes...
echo.

REM Vite config ellenorzes
findstr /C:"host: '0.0.0.0'" frontend\vite.config.js >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] vite.config.js helyesen be van allitva (host: 0.0.0.0)
) else (
    echo [FIGYELMEZTETES] vite.config.js ellenorzese szukseges
)

echo.
echo ================================================
echo   KOVETKEZO LEPESEK:
echo ================================================
echo.
echo [HTTP MOD - AJANLOTT HALOZATI ELERESHEZ]
echo 1. Allitsd le a frontend szervert (ha fut)
echo 2. Inditsd ujra a START-ALL.bat fajlt
echo 3. Ellenorizd: http://%LOCAL_IP%:3000
echo.
echo [HTTPS MOD - KAMERA HOZZAFERESHEZ]
echo 1. Generald a tanusitvanyt: cd frontend && generate-cert.bat
echo 2. Inditsd a START-ALL-HTTPS.bat fajlt
echo 3. Ellenorizd: https://%LOCAL_IP%:3000
echo 4. Fogadd el a bongeszoben a figyelmeztetest!
echo.
echo FONTOS:
echo - Mindket szerver (backend es frontend) futnia kell
echo - Backend: --host 0.0.0.0 --port 8000
echo - Frontend: host: '0.0.0.0' a vite.config.js-ben
echo - PC es mobil azonos WiFi halozaton!
echo - HTTPS eseten a tanusitvany tartalmazza az IP cimet
echo.
echo Ha meg mindig nem mukodik:
echo 1. Ellenorizd a Windows Tuzfal beallitasait
echo 2. Ellenorizd, hogy a router nem blokkolja a portokat
echo 3. Probald meg https:// -t (ha HTTPS van beallitva)
echo 4. Ellenorizd, hogy a tanusitvany tartalmazza az IP cimet
echo.
pause

