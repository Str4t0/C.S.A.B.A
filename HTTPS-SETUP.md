# 🔐 HTTPS Beállítás Fejlesztéshez

Ez az útmutató bemutatja, hogyan állítsd be az HTTPS-t a fejlesztési környezetben.

## 🚀 Gyors Beállítás (AJÁNLOTT - OpenSSL nélkül)

A Vite automatikusan generál egy self-signed tanúsítványt, amikor HTTPS-t használsz!

### 1. Frontend Indítása HTTPS-sel

A `vite.config.js` már be van állítva HTTPS-re. Csak indítsd el:

```bash
cd frontend
npm run dev
```

A frontend automatikusan **https://localhost:3000** címen indul el.

### 2. Böngésző Figyelmeztetés

A böngésző figyelmeztetést fog mutatni (self-signed tanúsítvány). 
- Kattints a **"Tovább a webhelyre"** vagy **"Advanced" → "Proceed to localhost"** gombra
- Ez biztonságos fejlesztéshez, mert te generáltad a tanúsítványt

### 3. Kész! 🎉

Most már működnie kell a kamerának! 📷

---

## 📋 Alternatív: Saját Tanúsítvány (OpenSSL szükséges)

Ha saját tanúsítványt szeretnél használni (pl. IP címekkel):

### 1. Tanúsítvány Generálása

**Windows (ha van OpenSSL):**
```bash
cd frontend
generate-cert.bat
```

**Linux/Mac:**
```bash
cd frontend
bash generate-cert.sh
```

**Vagy manuálisan:**
```bash
cd frontend
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout certs/key.pem \
  -out certs/cert.pem \
  -days 3650 \
  -subj "/C=HU/ST=Hungary/L=Budapest/O=Home Inventory/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:192.168.50.75"
```

### 2. Frontend Indítása

A `vite.config.js` automatikusan észleli a tanúsítványokat és használja őket.

```bash
cd frontend
npm run dev
```

### 3. Backend HTTPS (Opcionális)

A backend-et is lehet HTTPS-re állítani, de általában elég, ha csak a frontend HTTPS-en fut.

Ha mégis szeretnéd:

```bash
cd backend
# Tanúsítvány másolása
cp ../frontend/certs/cert.pem .
cp ../frontend/certs/key.pem .

# Backend indítása HTTPS-sel
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --ssl-keyfile key.pem --ssl-certfile cert.pem
```

**VAGY** módosítsd a `START-ALL.bat` fájlt.

### 4. CORS Beállítások Frissítése

Frissítsd a `backend/app/main.py` fájlban a CORS allowed_origins listát:

```python
allowed_origins = [
    "http://localhost:3000",
    "https://localhost:3000",  # HTTPS hozzáadása
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",  # HTTPS hozzáadása
    "http://192.168.50.75:3000",
    "https://192.168.50.75:3000",  # HTTPS hozzáadása
]
```

## ⚠️ Fontos Megjegyzések

1. **Self-signed tanúsítvány**: A böngésző figyelmeztetést fog mutatni. Kattints a "Tovább a webhelyre" gombra.

2. **IP címek**: A tanúsítvány tartalmazza a `192.168.50.75` IP-t, de ha más IP-t használsz, generáld újra a tanúsítványt az új IP-vel.

3. **Mobil eszközök**: Self-signed tanúsítványok esetén a mobil böngészők is figyelmeztetést fognak mutatni. Elfogadhatod a tanúsítványt a böngésző beállításaiban.

## 🔍 Ellenőrzés

1. Indítsd el a frontend-et: `npm run dev`
2. Nyisd meg: `https://localhost:3000`
3. A böngésző figyelmeztetést mutat - kattints "Tovább a webhelyre"
4. Most már működnie kell a kamerának! 📷

## 🐛 Hibaelhárítás

### OpenSSL nem található

**Windows:**
- Telepítsd a Git for Windows-t (tartalmaz OpenSSL-t)
- Vagy használd a Git Bash-t: `bash generate-cert.sh`

**Linux:**
```bash
sudo apt-get install openssl  # Debian/Ubuntu
sudo yum install openssl      # CentOS/RHEL
```

**Mac:**
```bash
brew install openssl
```

### Tanúsítvány nem működik

1. Ellenőrizd, hogy a `certs` mappa létezik és tartalmazza a fájlokat
2. Generáld újra a tanúsítványt
3. Indítsd újra a dev szervert

### CORS hibák

Frissítsd a backend CORS beállításait, hogy tartalmazza az HTTPS URL-eket is.

