# 🐧 Unix/Linux Telepítési és Futtatási Útmutató

## 📋 Előfeltételek

### Telepítés (Debian/Ubuntu)
```bash
# Python 3 és pip
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv

# Node.js 18+ (NodeSource repository-ból)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# OpenSSL (HTTPS tanúsítvány generáláshoz)
sudo apt-get install -y openssl

# Git
sudo apt-get install -y git
```

### Telepítés (RHEL/CentOS/Fedora)
```bash
# Python 3 és pip
sudo yum install -y python3 python3-pip
# vagy: sudo dnf install -y python3 python3-pip

# Node.js 18+ (NodeSource repository-ból)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
# vagy: sudo dnf install -y nodejs

# OpenSSL
sudo yum install -y openssl
# vagy: sudo dnf install -y openssl

# Git
sudo yum install -y git
# vagy: sudo dnf install -y git
```

## 🚀 Gyors indítás

### 1. Projekt klónozása
```bash
git clone https://github.com/Str4t0/C.S.A.B.A.git
cd C.S.A.B.A
```

### 2. Scriptek végrehajthatóvá tétele
```bash
chmod +x start-unix.sh start-unix-https.sh stop-unix.sh
chmod +x frontend/generate-cert.sh
```

### 3. Indítás

#### HTTP mód (egyszerű)
```bash
./start-unix.sh
```

#### HTTPS mód (kamera támogatáshoz)
```bash
./start-unix-https.sh
```

## 🔌 SSH-n keresztüli futtatás

### Alapvető használat
```bash
# SSH kapcsolat
ssh admin@192.168.50.235

# Projekt könyvtárba navigálás
cd /path/to/home-inventory-system

# Indítás
./start-unix.sh
```

### Screen használata (ajánlott SSH-nél)

A **screen** segítségével a kapcsolat megszakadása után is futhatnak a szolgáltatások:

```bash
# Screen telepítése (ha nincs)
sudo apt-get install screen  # Debian/Ubuntu
sudo yum install screen      # RHEL/CentOS

# Screen munkamenet indítása
screen -S inventory

# Projekt indítása
cd /path/to/home-inventory-system
./start-unix.sh

# Screen elhagyása (de futnak a szolgáltatások)
# Nyomd meg: Ctrl+A, majd D

# Visszatérés a screen munkamenethez
screen -r inventory

# Screen munkamenetek listázása
screen -ls
```

### Tmux használata (alternatíva)

```bash
# Tmux telepítése (ha nincs)
sudo apt-get install tmux  # Debian/Ubuntu
sudo yum install tmux      # RHEL/CentOS

# Tmux munkamenet indítása
tmux new -s inventory

# Projekt indítása
cd /path/to/home-inventory-system
./start-unix.sh

# Tmux elhagyása
# Nyomd meg: Ctrl+B, majd D

# Visszatérés a tmux munkamenethez
tmux attach -t inventory
```

## 📊 Logok megtekintése

### Külön terminálban
```bash
# Backend logok
tail -f backend.log

# Frontend logok
tail -f frontend.log

# Mindkettő egyszerre
tail -f backend.log frontend.log
```

### Screen/Tmux munkamenetben
```bash
# Új ablak nyitása (Screen: Ctrl+A, C | Tmux: Ctrl+B, C)
# Logok megtekintése
tail -f backend.log
```

## 🛑 Leállítás

### Script használatával
```bash
./stop-unix.sh
```

### Manuális leállítás
```bash
# PID-ek keresése
ps aux | grep uvicorn
ps aux | grep vite

# Leállítás PID alapján
kill <PID>

# Erőszakos leállítás (ha nem működik)
kill -9 <PID>
```

### Port alapján leállítás
```bash
# Backend (port 8000)
lsof -ti:8000 | xargs kill

# Frontend (port 3000)
lsof -ti:3000 | xargs kill
```

## 🔐 HTTPS tanúsítvány generálása

```bash
cd frontend
./generate-cert.sh
```

A tanúsítvány a `frontend/certs/` mappába kerül:
- `cert.pem` - SSL tanúsítvány
- `key.pem` - Privát kulcs

## 🌐 Hálózati hozzáférés

### Tűzfal beállítása (UFW - Ubuntu)
```bash
# Portok engedélyezése
sudo ufw allow 8000/tcp
sudo ufw allow 3000/tcp

# Tűzfal státusz
sudo ufw status
```

### Tűzfal beállítása (firewalld - RHEL/CentOS)
```bash
# Portok engedélyezése
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Tűzfal státusz
sudo firewall-cmd --list-all
```

### IP cím meghatározása
```bash
# Helyi IP cím
hostname -I

# Részletes információk
ip addr show
# vagy
ifconfig
```

## 📱 Elérési pontok

A scriptek automatikusan detektálják a helyi IP címet. A szolgáltatások elérhetők:

- **Lokális:** http://localhost:3000 (vagy https://localhost:3000)
- **Hálózati:** http://192.168.50.235:3000 (vagy https://192.168.50.235:3000)
- **Backend API:** http://192.168.50.235:8000/api/docs

## ⚠️ Hibaelhárítás

### Port már használatban
```bash
# Port foglaltság ellenőrzése
lsof -i:8000
lsof -i:3000

# Folyamat leállítása
kill <PID>
```

### Virtuális környezet problémák
```bash
# Újra létrehozás
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node modules problémák
```bash
# Újra telepítés
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Engedélyek problémái
```bash
# Scriptek végrehajthatóvá tétele
chmod +x *.sh
chmod +x frontend/*.sh
```

## 🔄 Frissítés

```bash
# Kód frissítése
git pull origin main

# Backend függőségek frissítése
cd backend
source venv/bin/activate
pip install -r requirements.txt --upgrade

# Frontend függőségek frissítése
cd frontend
npm install
npm update
```

## 📝 Hasznos parancsok

```bash
# Futó folyamatok listázása
ps aux | grep -E "(uvicorn|vite|node)"

# Portok használata
netstat -tulpn | grep -E "(8000|3000)"
# vagy
ss -tulpn | grep -E "(8000|3000)"

# Memória használat
free -h

# Disk használat
df -h

# CPU használat
top
# vagy
htop  # (ha telepítve van)
```

