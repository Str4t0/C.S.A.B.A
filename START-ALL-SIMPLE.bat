@echo off
color 0A
echo ================================================
echo   TELJES RENDSZER INDITAS
echo ================================================
echo.

REM Meghajto es mappa
D:
cd D:\Programozas\Progs\home-inventory-system\home-inventory-system

echo Backend inditasa (uj ablak)...
start "Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo Varakozas 5 masodperc...
timeout /t 5 /nobreak >nul

echo Frontend inditasa (uj ablak)...
start "Frontend" cmd /k "cd frontend && npm run dev -- --host"

echo.
echo ================================================
echo   ELINDULT!
echo ================================================
echo.
echo 2 uj ablak nyilt:
echo   - Backend
echo   - Frontend
echo.
echo Lokalis: http://localhost:3000
echo Halozati: http://[HELYI-IP]:3000
echo.
echo Helyi IP megtekintese:
echo   Futtasd: ipconfig
echo   IPv4 Address: XXX.XXX.XXX.XXX
echo.
echo Leallitas: Zard be a 2 ablakot
echo.
pause
