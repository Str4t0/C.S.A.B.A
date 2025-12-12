#!/bin/bash

# Otthoni Tárgyi Nyilvántartó Rendszer
# Unix/Linux Stop Script

# Színek
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Otthoni Tárgyi Nyilvántartó - LEÁLLÍTÁS${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Backend PID keresése (uvicorn folyamat)
BACKEND_PID=$(ps aux | grep "[u]vicorn app.main:app" | awk '{print $2}' | head -1)

# Frontend PID keresése (vite folyamat)
FRONTEND_PID=$(ps aux | grep "[v]ite" | grep -v grep | awk '{print $2}' | head -1)

# Node dev server PID keresése (ha van)
NODE_PID=$(lsof -ti:3000 2>/dev/null)

if [ -z "$BACKEND_PID" ] && [ -z "$FRONTEND_PID" ] && [ -z "$NODE_PID" ]; then
    echo -e "${YELLOW}⚠️  Nincs futó szolgáltatás${NC}"
    exit 0
fi

echo -e "${YELLOW}Leállítás folyamatban...${NC}"
echo ""

# Backend leállítása
if [ ! -z "$BACKEND_PID" ]; then
    echo -e "${BLUE}Backend leállítása (PID: $BACKEND_PID)...${NC}"
    kill $BACKEND_PID 2>/dev/null
    sleep 1
    # Ha még fut, erőszakos leállítás
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill -9 $BACKEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}✅ Backend leállítva${NC}"
fi

# Frontend leállítása
if [ ! -z "$FRONTEND_PID" ]; then
    echo -e "${BLUE}Frontend leállítása (PID: $FRONTEND_PID)...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    sleep 1
    # Ha még fut, erőszakos leállítás
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill -9 $FRONTEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}✅ Frontend leállítva${NC}"
fi

# Node dev server leállítása (port alapján)
if [ ! -z "$NODE_PID" ]; then
    echo -e "${BLUE}Node dev server leállítása (PID: $NODE_PID)...${NC}"
    kill $NODE_PID 2>/dev/null
    sleep 1
    # Ha még fut, erőszakos leállítás
    if ps -p $NODE_PID > /dev/null 2>&1; then
        kill -9 $NODE_PID 2>/dev/null
    fi
    echo -e "${GREEN}✅ Node dev server leállítva${NC}"
fi

# További uvicorn folyamatok ellenőrzése
REMAINING_UVICORN=$(ps aux | grep "[u]vicorn" | wc -l)
if [ "$REMAINING_UVICORN" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Még vannak futó uvicorn folyamatok${NC}"
    ps aux | grep "[u]vicorn"
fi

# További vite/node folyamatok ellenőrzése
REMAINING_VITE=$(ps aux | grep "[v]ite" | wc -l)
if [ "$REMAINING_VITE" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Még vannak futó vite folyamatok${NC}"
    ps aux | grep "[v]ite"
fi

echo ""
echo -e "${GREEN}✅ Minden szolgáltatás leállítva${NC}"
echo ""

