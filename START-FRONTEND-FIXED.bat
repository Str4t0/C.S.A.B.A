@echo off
echo Frontend Inditas
echo.

REM Meghajto valtas
D:

REM Mappa valtas
cd D:\Programozas\Progs\home-inventory-system\home-inventory-system\frontend

echo npm install...
call npm install

if errorlevel 1 (
    echo HIBA: npm install nem sikerult!
    pause
    exit /b 1
)

echo.
echo Frontend indul...
echo NE zard be az ablakot!
echo.

call npm run dev

pause