@echo off
setlocal enabledelayedexpansion
REM Self-signed SSL tanúsítvány generálása fejlesztéshez Windows-on

echo 🔐 SSL tanúsítvány generálása...

REM IP cim automatikus detektalasa
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP:~1%

if "%LOCAL_IP%"=="" (
    echo ⚠️  IP cim nem talalhato, hasznalom a 192.168.50.75-t
    set LOCAL_IP=192.168.50.75
)

echo Helyi IP cim: %LOCAL_IP%
echo.

REM Könyvtár létrehozása
if not exist "certs" mkdir certs

REM Ellenőrizzük, hogy van-e OpenSSL a PATH-ban
where openssl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    REM Próbáljuk meg megtalálni a Git Bash-t (tartalmaz OpenSSL-t)
    set GIT_BASH=
    
    REM Tipikus Git Bash helyek
    if exist "C:\Program Files\Git\bin\bash.exe" (
        set "GIT_BASH=C:\Program Files\Git\bin\bash.exe"
    ) else if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
        set "GIT_BASH=C:\Program Files (x86)\Git\bin\bash.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\bin\bash.exe" (
        set "GIT_BASH=%LOCALAPPDATA%\Programs\Git\bin\bash.exe"
    )
    
    if not "%GIT_BASH%"=="" (
        echo [INFO] Git Bash talalhato, hasznalom azt...
        echo.
        echo Tanusitvany generalasa az alabbi IP cimekkel:
        echo   - localhost (127.0.0.1)
        echo   - %LOCAL_IP%
        echo.
        REM Használjuk a generate-cert.sh scriptet Git Bash-ben
        REM Teljes útvonallal hívjuk a scriptet
        if exist "generate-cert.sh" (
            "%GIT_BASH%" "%CD%\generate-cert.sh"
        ) else (
            REM Ha nincs .sh fájl, futtatjuk közvetlenül az openssl parancsot
            REM Windows útvonal bash formátumra: D:\path -> /d/path
            set "WIN_PATH=%CD%"
            set "BASH_PATH=!WIN_PATH:\=/!"
            set "BASH_PATH=!BASH_PATH::=!"
            "%GIT_BASH%" -c "cd '/%BASH_PATH%' && openssl req -x509 -newkey rsa:4096 -nodes -keyout certs/key.pem -out certs/cert.pem -days 3650 -subj '/C=HU/ST=Hungary/L=Budapest/O=Home Inventory/CN=localhost' -addext 'subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:%LOCAL_IP%'"
        )
        set CERT_RESULT=!ERRORLEVEL!
        if !CERT_RESULT! EQU 0 (
            goto :cert_success
        ) else (
            echo [HIBA] Tanusitvany generalasa sikertelen Git Bash-sel!
            echo.
            echo Probald meg manualisan:
            echo   cd frontend
            echo   bash generate-cert.sh
            echo.
            goto :cert_error
        )
    ) else (
        :cert_error
        echo ❌ OpenSSL nem található!
        echo.
        echo Telepítés:
        echo 1. Telepítsd a Git for Windows-t (tartalmaz OpenSSL-t)
        echo    Letoltes: https://git-scm.com/download/win
        echo    Vagy
        echo 2. Telepítsd a Chocolatey-t, majd: choco install openssl
        echo    Vagy
        echo 3. Használd a Git Bash-t manualisan:
        echo    cd frontend
        echo    bash generate-cert.sh
        echo.
        pause
        exit /b 1
    )
) else (
    REM OpenSSL a PATH-ban van, hasznaljuk azt
    echo Tanusitvany generalasa az alabbi IP cimekkel:
    echo   - localhost (127.0.0.1)
    echo   - %LOCAL_IP%
    echo.
    
    REM Self-signed tanúsítvány generálása (10 évig érvényes)
    openssl req -x509 -newkey rsa:4096 -nodes -keyout certs/key.pem -out certs/cert.pem -days 3650 -subj "/C=HU/ST=Hungary/L=Budapest/O=Home Inventory/CN=localhost" -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:%LOCAL_IP%"
    set CERT_RESULT=!ERRORLEVEL!
)

:cert_success
if !CERT_RESULT! EQU 0 (
    echo.
    echo ✅ Tanúsítvány létrehozva: certs/cert.pem
    echo ✅ Kulcs létrehozva: certs/key.pem
    echo.
    echo ⚠️  FIGYELEM: Self-signed tanúsítvány! A böngésző figyelmeztetést fog mutatni.
    echo    Kattints a 'Tovább a webhelyre' gombra a böngészőben.
) else (
    echo ❌ Hiba történt a tanúsítvány generálása során!
)

pause

