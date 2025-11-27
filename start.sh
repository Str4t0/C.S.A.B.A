#!/bin/bash

# Otthoni Tárgyi Nyilvántartó Rendszer
# Quick Start Script
# DevOps Engineer: Tom Wilson

echo "🏠 Otthoni Tárgyi Nyilvántartó Rendszer - Quick Start"
echo "=================================================="
echo ""

# Színek
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Docker ellenőrzése
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker nincs telepítve!${NC}"
    echo "Kérlek telepítsd a Docker-t: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose nincs telepítve!${NC}"
    echo "Kérlek telepítsd a Docker Compose-t: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker és Docker Compose megtalálva${NC}"
echo ""

# Menü
echo -e "${BLUE}Mit szeretnél csinálni?${NC}"
echo "1) 🚀 Alkalmazás indítása (első telepítés)"
echo "2) ▶️  Alkalmazás indítása (már telepítve van)"
echo "3) 🔄 Újraépítés és indítás"
echo "4) ⏹️  Alkalmazás leállítása"
echo "5) 🗑️  Minden törlése (adatok is!)"
echo "6) 📋 Logok megtekintése"
echo "7) ❌ Kilépés"
echo ""

read -p "Válassz egy opciót (1-7): " choice

case $choice in
    1)
        echo -e "${YELLOW}🚀 Első telepítés indítása...${NC}"
        cd docker
        docker-compose up --build -d
        echo ""
        echo -e "${GREEN}✅ Alkalmazás elindult!${NC}"
        echo ""
        echo -e "${BLUE}📍 Hozzáférési pontok:${NC}"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:8000"
        echo "   API Docs: http://localhost:8000/api/docs"
        echo ""
        echo -e "${YELLOW}💡 Tipp: Várd meg, amíg mindkét konténer teljesen elindul (15-30 mp)${NC}"
        ;;
    2)
        echo -e "${YELLOW}▶️  Alkalmazás indítása...${NC}"
        cd docker
        docker-compose up -d
        echo ""
        echo -e "${GREEN}✅ Alkalmazás elindult!${NC}"
        ;;
    3)
        echo -e "${YELLOW}🔄 Újraépítés és indítás...${NC}"
        cd docker
        docker-compose down
        docker-compose up --build -d
        echo ""
        echo -e "${GREEN}✅ Újraépítés kész!${NC}"
        ;;
    4)
        echo -e "${YELLOW}⏹️  Alkalmazás leállítása...${NC}"
        cd docker
        docker-compose down
        echo ""
        echo -e "${GREEN}✅ Alkalmazás leállítva${NC}"
        ;;
    5)
        echo -e "${RED}⚠️  FIGYELEM: Ez MINDEN adatot töröl (képek, adatbázis)!${NC}"
        read -p "Biztosan folytatod? (igen/nem): " confirm
        if [ "$confirm" = "igen" ]; then
            echo -e "${YELLOW}🗑️  Törlés folyamatban...${NC}"
            cd docker
            docker-compose down -v
            docker system prune -f
            echo ""
            echo -e "${GREEN}✅ Minden törölve${NC}"
        else
            echo "Törlés megszakítva."
        fi
        ;;
    6)
        echo -e "${YELLOW}📋 Logok megjelenítése (Ctrl+C a kilépéshez)...${NC}"
        cd docker
        docker-compose logs -f
        ;;
    7)
        echo "Viszlát! 👋"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Érvénytelen választás!${NC}"
        exit 1
        ;;
esac
