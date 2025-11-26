# 🚀 Deployment Útmutató

## Otthoni Tárgyi Nyilvántartó Rendszer - Telepítési Guide

**DevOps Engineer: Tom Wilson**

---

## 📋 Tartalom

1. [Előfeltételek](#előfeltételek)
2. [Gyors Indítás (Helyi Fejlesztés)](#gyors-indítás)
3. [Production Deployment](#production-deployment)
4. [Környezeti Változók](#környezeti-változók)
5. [Adatbázis Migráció](#adatbázis-migráció)
6. [Backup és Visszaállítás](#backup-és-visszaállítás)
7. [Monitoring és Logok](#monitoring-és-logok)
8. [Hibaelhárítás](#hibaelhárítás)

---

## 🔧 Előfeltételek

### Fejlesztői Környezet
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**
- Legalább 2GB szabad RAM
- 5GB szabad lemezterület

### Production Környezet
- Linux szerver (Ubuntu 20.04+ ajánlott)
- Docker & Docker Compose
- Nginx vagy más reverse proxy
- SSL tanúsítvány (Let's Encrypt ajánlott)
- Domain név (opcionális)

---

## 🚀 Gyors Indítás

### Linux/Mac

```bash
# 1. Projekt klónozása
git clone <repository-url>
cd home-inventory-system

# 2. Gyors indítás script használata
./start.sh

# Válaszd az "1) Első telepítés" opciót
```

### Windows (PowerShell)

```powershell
# 1. Projekt klónozása
git clone <repository-url>
cd home-inventory-system

# 2. Docker Compose indítása
cd docker
docker-compose up --build -d
```

### Manuális Indítás

```bash
# 1. Backend indítása
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Új terminálban - Frontend indítása
cd frontend
npm install
npm run dev
```

---

## 🏭 Production Deployment

### 1. Szerver Előkészítése

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx

# Felhasználó hozzáadása docker csoporthoz
sudo usermod -aG docker $USER

# Kijelentkezés és újra bejelentkezés
```

### 2. Projekt Telepítése

```bash
# 1. Projekt klónozása
cd /opt
sudo git clone <repository-url> home-inventory
cd home-inventory

# 2. Környezeti változók beállítása
sudo nano .env
```

**`.env` fájl tartalma:**
```env
# Backend
DATABASE_URL=postgresql://user:password@db:5432/inventory
SECRET_KEY=your-super-secret-key-here
DEBUG=False

# Frontend
VITE_API_URL=https://yourdomain.com/api

# PostgreSQL
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=strong-password-here
POSTGRES_DB=inventory_db
```

### 3. Docker Compose Production Konfiguráció

Készíts egy `docker-compose.prod.yml` fájlt:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    networks:
      - app-network
    restart: always

  backend:
    build: 
      context: ../backend
      dockerfile: Dockerfile
    volumes:
      - backend-uploads:/app/uploads
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
    networks:
      - app-network
    restart: always

  frontend:
    build: 
      context: ../frontend
      dockerfile: Dockerfile
    depends_on:
      - backend
    networks:
      - app-network
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: always

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  backend-uploads:
```

### 4. Nginx Konfiguráció Production-ra

`nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Uploads
        location /uploads {
            proxy_pass http://backend;
            proxy_set_header Host $host;
        }
    }
}
```

### 5. SSL Tanúsítvány Beszerzése

```bash
# Let's Encrypt SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 6. Alkalmazás Indítása

```bash
cd /opt/home-inventory/docker
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔐 Környezeti Változók

### Backend (.env)
```env
# Adatbázis
DATABASE_URL=sqlite:///./home_inventory.db  # vagy PostgreSQL URL
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Biztonság
SECRET_KEY=your-secret-key-here-minimum-32-chars
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Upload
MAX_UPLOAD_SIZE=5242880  # 5MB
UPLOAD_DIR=/app/uploads

# App
DEBUG=False
LOG_LEVEL=INFO
```

### Frontend (.env)
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_TITLE=Otthoni Tárgyi Nyilvántartás
```

---

## 🗄️ Adatbázis Migráció

### SQLite-ról PostgreSQL-re

```python
# migrate.py script
import sqlite3
import psycopg2

# SQLite kapcsolat
sqlite_conn = sqlite3.connect('home_inventory.db')
sqlite_cursor = sqlite_conn.cursor()

# PostgreSQL kapcsolat
pg_conn = psycopg2.connect(
    dbname='inventory_db',
    user='inventory_user',
    password='password',
    host='localhost'
)
pg_cursor = pg_conn.cursor()

# Adatok másolása
sqlite_cursor.execute("SELECT * FROM items")
items = sqlite_cursor.fetchall()

for item in items:
    pg_cursor.execute("""
        INSERT INTO items VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, item)

pg_conn.commit()
```

---

## 💾 Backup és Visszaállítás

### Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/home-inventory"
DATE=$(date +%Y%m%d_%H%M%S)

# Adatbázis backup
docker exec home-inventory-backend python -c "
from app.database import engine
import subprocess
subprocess.run(['sqlite3', 'home_inventory.db', '.dump'], 
               stdout=open('/app/backup_$DATE.sql', 'w'))
"

# Képek backup
docker cp home-inventory-backend:/app/uploads $BACKUP_DIR/uploads_$DATE

# Tömörítés
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz \
    $BACKUP_DIR/uploads_$DATE \
    backup_$DATE.sql

# Régi backupok törlése (30 napnál régebbiek)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
```

### Visszaállítás

```bash
# 1. Backup kicsomagolása
tar -xzf backup_20241126_120000.tar.gz

# 2. Adatbázis visszaállítása
docker cp backup_20241126_120000.sql home-inventory-backend:/app/
docker exec home-inventory-backend sqlite3 home_inventory.db < /app/backup_20241126_120000.sql

# 3. Képek visszaállítása
docker cp uploads_20241126_120000/. home-inventory-backend:/app/uploads/
```

---

## 📊 Monitoring és Logok

### Logok Megtekintése

```bash
# Összes service log
docker-compose logs -f

# Csak backend
docker-compose logs -f backend

# Csak frontend
docker-compose logs -f frontend

# Utolsó 100 sor
docker-compose logs --tail=100
```

### Health Check Endpoints

```bash
# Backend health
curl http://localhost:8000/

# API docs
curl http://localhost:8000/api/docs
```

### Resource Monitor

```bash
# Container resource használat
docker stats

# Disk használat
docker system df
```

---

## 🔍 Hibaelhárítás

### Backend nem indul el

```bash
# Logok ellenőrzése
docker-compose logs backend

# Konténer újraindítása
docker-compose restart backend

# Teljes újraépítés
docker-compose down
docker-compose up --build backend
```

### Frontend nem éri el a backend-et

```bash
# CORS ellenőrzés
# A backend main.py-ban:
# allow_origins=["*"]  # vagy konkrét domain-ek

# Proxy ellenőrzés
# vite.config.js proxy beállítások
```

### Adatbázis hiba

```bash
# Adatbázis fájl jogosultságok
docker exec backend ls -la home_inventory.db

# Újra inicializálás
docker exec backend python -c "from app.database import init_db; init_db()"
```

### Képfeltöltési hiba

```bash
# Upload könyvtár jogosultságok
docker exec backend ls -la /app/uploads
docker exec backend chmod -R 755 /app/uploads

# Méret limit ellenőrzés
# Nginx: client_max_body_size 10M;
```

---

## 🔄 Frissítés

```bash
# 1. Backup készítése
./backup.sh

# 2. Legújabb verzió letöltése
git pull origin main

# 3. Újraépítés és indítás
cd docker
docker-compose down
docker-compose up --build -d

# 4. Ellenőrzés
docker-compose ps
docker-compose logs -f
```

---

## 📞 Support

Ha problémád van:
1. Ellenőrizd a logokat: `docker-compose logs`
2. Nézd meg a dokumentációt
3. Nyiss issue-t a GitHub-on

---

**Deployment Guide készítve a DevOps csapat által** 🚀
