#!/bin/bash

# Otthoni Tárgyi Nyilvántartó Rendszer
# Unix/Linux HTTPS Quick Start Script

# Színek
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Otthoni Tárgyi Nyilvántartó - HTTPS INDÍTÁS${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# IP cím meghatározása (Unix/Linux)
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7; exit}')
fi
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
fi
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="127.0.0.1"
    echo -e "${YELLOW}⚠️  IP cím nem található, használom: $LOCAL_IP${NC}"
else
    echo -e "${GREEN}✅ Helyi IP cím: $LOCAL_IP${NC}"
fi
echo ""

# Projekt könyvtár meghatározása
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# SSL tanúsítvány ellenőrzése
if [ ! -f "frontend/certs/cert.pem" ] || [ ! -f "frontend/certs/key.pem" ]; then
    echo -e "${YELLOW}[FIGYELMEZTETÉS] HTTPS tanúsítvány nem található!${NC}"
    echo ""
    echo "A HTTPS mód használatához SSL tanúsítvány szükséges."
    echo ""
    read -p "Szeretnéd most generálni a tanúsítványt? (i/n): " GENERATE_CERT
    
    if [ "$GENERATE_CERT" = "i" ] || [ "$GENERATE_CERT" = "I" ] || [ "$GENERATE_CERT" = "igen" ] || [ "$GENERATE_CERT" = "y" ] || [ "$GENERATE_CERT" = "Y" ]; then
        echo ""
        echo "Tanúsítvány generálása..."
        cd frontend
        if [ -f "generate-cert.sh" ]; then
            bash generate-cert.sh
        else
            echo -e "${RED}❌ generate-cert.sh nem található!${NC}"
            echo "Használj HTTP-t a start-unix.sh fájllal, vagy"
            echo "telepítsd az OpenSSL-t és generáld manuálisan a tanúsítványt."
            exit 1
        fi
        cd ..
        echo ""
        
        if [ ! -f "frontend/certs/cert.pem" ] || [ ! -f "frontend/certs/key.pem" ]; then
            echo -e "${RED}❌ Tanúsítvány generálása sikertelen!${NC}"
            echo "Használj HTTP-t a start-unix.sh fájllal, vagy"
            echo "telepítsd az OpenSSL-t és próbáld újra."
            exit 1
        fi
    else
        echo ""
        echo -e "${YELLOW}Tanúsítvány generálása kihagyva.${NC}"
        echo ""
        echo "A tanúsítványt később is generálhatod:"
        echo "  cd frontend"
        echo "  ./generate-cert.sh"
        echo ""
        echo "Vagy használd a HTTP módot:"
        echo "  ./start-unix.sh"
        echo ""
        exit 0
    fi
fi

echo -e "${GREEN}✅ SSL tanúsítvány megtalálva${NC}"
echo ""

# Előfeltételek ellenőrzése
echo -e "${BLUE}[INFO] Előfeltételek ellenőrzése...${NC}"

# Python keresése (több helyen is)
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION_CHECK=$(python --version 2>&1 | grep -oP 'Python \K[0-9]+' | head -1)
    if [ "$PYTHON_VERSION_CHECK" -ge 3 ] 2>/dev/null; then
        PYTHON_CMD="python"
    fi
fi

# Ha még mindig nincs, keressük a gyakori helyeken
if [ -z "$PYTHON_CMD" ]; then
    for PYTHON_PATH in /share/CACHEDEV1_DATA/.qpkg/Python3/opt/python3/bin/python3 /usr/bin/python3 /usr/local/bin/python3 /opt/bin/python3 /usr/bin/python /usr/local/bin/python; do
        if [ -f "$PYTHON_PATH" ] && [ -x "$PYTHON_PATH" ]; then
            PYTHON_VERSION_CHECK=$($PYTHON_PATH --version 2>&1 | grep -oP 'Python \K[0-9]+' | head -1)
            if [ "$PYTHON_VERSION_CHECK" -ge 3 ] 2>/dev/null; then
                PYTHON_CMD="$PYTHON_PATH"
                break
            fi
        fi
    done
fi

# Ha még mindig nincs, kérjük be a felhasználótól
if [ -z "$PYTHON_CMD" ]; then
    echo -e "${YELLOW}⚠️  Python 3 nem található a PATH-ban!${NC}"
    echo ""
    echo "Kérlek add meg a Python 3 teljes elérési útját:"
    echo "Például: /usr/bin/python3 vagy /opt/bin/python3"
    read -p "Python elérési út: " PYTHON_CMD
    
    if [ -z "$PYTHON_CMD" ] || [ ! -f "$PYTHON_CMD" ] || [ ! -x "$PYTHON_CMD" ]; then
        echo -e "${RED}❌ Érvénytelen Python elérési út!${NC}"
        exit 1
    fi
    
    PYTHON_VERSION_CHECK=$($PYTHON_CMD --version 2>&1 | grep -oP 'Python \K[0-9]+' | head -1)
    if [ -z "$PYTHON_VERSION_CHECK" ] || [ "$PYTHON_VERSION_CHECK" -lt 3 ] 2>/dev/null; then
        echo -e "${RED}❌ A megadott Python nem Python 3!${NC}"
        exit 1
    fi
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✅ Python: $PYTHON_VERSION (${PYTHON_CMD})${NC}"

# Node.js ellenőrzése
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js nincs telepítve!${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

echo ""

# Backend beállítás
echo -e "${YELLOW}[1/2] Backend beállítása...${NC}"
cd backend

# Virtuális környezet létrehozása (ha nincs)
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Virtuális környezet létrehozása...${NC}"
    $PYTHON_CMD -m venv venv
fi

# Virtuális környezet aktiválása
source venv/bin/activate

# Függőségek telepítése
echo -e "${BLUE}Függőségek telepítése...${NC}"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

cd ..
echo -e "${GREEN}✅ Backend beállítva${NC}"
echo ""

# Frontend beállítás
echo -e "${YELLOW}[2/2] Frontend beállítása...${NC}"
cd frontend

# Függőségek telepítése
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Függőségek telepítése (ez eltarthat néhány percig)...${NC}"
    npm install
else
    echo -e "${BLUE}Függőségek ellenőrzése...${NC}"
    npm install
fi

cd ..
echo -e "${GREEN}✅ Frontend beállítva${NC}"
echo ""

# .env fájl létrehozása/frissítése
echo -e "${BLUE}[INFO] .env fájl létrehozása...${NC}"
echo "# Auto-generált .env fájl" > frontend/.env
echo "VITE_API_URL=http://$LOCAL_IP:8000/api" >> frontend/.env
echo -e "${GREEN}✅ .env fájl létrehozva: VITE_API_URL=http://$LOCAL_IP:8000/api${NC}"
echo ""

# Indítás
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  SZOLGÁLTATÁSOK INDÍTÁSA (HTTPS)${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Backend indítása (háttérben)
echo -e "${YELLOW}[1/2] Backend indítása (port 8000 - HTTP)...${NC}"
cd backend
source venv/bin/activate
nohup $PYTHON_CMD -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✅ Backend elindult (PID: $BACKEND_PID)${NC}"

# Várakozás a backend elindulására
sleep 3

# Frontend indítása (háttérben, HTTPS-sel)
echo -e "${YELLOW}[2/2] Frontend indítása (port 3000 - HTTPS)...${NC}"
cd frontend
USE_HTTPS=true nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✅ Frontend elindult (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}  SIKERESEN ELINDULT (HTTPS)!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${BLUE}📍 ELÉRHETŐSÉGEK:${NC}"
echo ""
echo -e "${GREEN}[PC-RŐL]${NC}"
echo "   Frontend: ${BLUE}https://localhost:3000${NC}"
echo "   Backend:  ${BLUE}http://localhost:8000/api/docs${NC}"
echo ""
echo -e "${GREEN}[MOBILRÓL / MÁS ESZKÖZRŐL]${NC}"
echo "   Frontend: ${BLUE}https://$LOCAL_IP:3000${NC}"
echo "   Backend:  ${BLUE}http://$LOCAL_IP:8000/api/docs${NC}"
echo ""
echo -e "${YELLOW}💡 FONTOS:${NC}"
echo "   - Mobil és PC azonos WiFi hálózaton!"
echo "   - Tűzfal engedélyezi a 8000 és 3000 portokat!"
echo "   - A böngészőben figyelmeztetés jelenik meg"
echo "     (self-signed tanúsítvány) - fogadd el!"
echo "   - Mobil böngészőben is el kell fogadni a tanúsítványt!"
echo ""
echo -e "${BLUE}📋 HASZNOS PARANCSOK:${NC}"
echo "   Logok megtekintése:"
echo "     tail -f backend.log"
echo "     tail -f frontend.log"
echo ""
echo "   Leállítás:"
echo "     kill $BACKEND_PID $FRONTEND_PID"
echo "     vagy: ./stop-unix.sh"
echo ""
echo -e "${YELLOW}⏳ Várj 5-10 másodpercet, amíg a szolgáltatások teljesen elindulnak...${NC}"
echo ""
