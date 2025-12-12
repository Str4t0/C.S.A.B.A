# 🚀 Gyors indítás Unix/Linux rendszeren

## 📍 Projekt elérési út
```
/share/CACHEDEV1_DATA/Multimedia/Temp/CSABA/Szoftverfejlesztés/Programozás/home-inventory-system
```

## 🔧 Lépések

### 1. Navigálás a projekt könyvtárba
```bash
cd "/share/CACHEDEV1_DATA/Multimedia/Temp/CSABA/Szoftverfejlesztés/Programozás/home-inventory-system"
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

### 4. Leállítás
```bash
./stop-unix.sh
```

## 📋 Teljes parancsok másoláshoz

```bash
# Navigálás
cd "/share/CACHEDEV1_DATA/Multimedia/Temp/CSABA/Szoftverfejlesztés/Programozás/home-inventory-system"

# Végrehajthatóvá tétel
chmod +x start-unix.sh start-unix-https.sh stop-unix.sh frontend/generate-cert.sh

# Indítás (válassz egyet)
./start-unix.sh
# vagy
./start-unix-https.sh
```

## 📊 Logok megtekintése
```bash
# Backend logok
tail -f backend.log

# Frontend logok
tail -f frontend.log
```

## 🌐 Elérési pontok
A script automatikusan detektálja az IP címet. A szolgáltatások elérhetők:
- **Frontend:** http://YOUR_IP:3000 (vagy https://...)
- **Backend API:** http://YOUR_IP:8000/api/docs

## ⚠️ Ha első alkalommal futtatod

Először telepítsd a függőségeket:

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

Ezután futtasd a `./start-unix.sh` vagy `./start-unix-https.sh` scriptet.

## 🔍 Python nem található a PATH-ban?

Ha a Python nincs a PATH-ban, a script automatikusan megkérdezi az elérési útját.

Vagy használd a `find-python.sh` scriptet a Python megtalálásához:

```bash
chmod +x find-python.sh
./find-python.sh
```

Ez megmutatja, hol található a Python 3 a rendszeren.

