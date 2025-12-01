# 🔐 HTTPS Használat Hálózati Eléréshez

## 📋 Lépések

### 1. Tanúsítvány Generálása

**Első alkalommal vagy IP cím változás esetén:**

```bash
cd frontend
generate-cert.bat
```

Vagy manuálisan Git Bash-ben:
```bash
cd frontend
bash generate-cert.sh
```

**Eredmény:** A `frontend/certs/` mappában létrejön:
- `cert.pem` (tanúsítvány)
- `key.pem` (kulcs)

### 2. Szerverek Indítása HTTPS-sel

```bash
START-ALL-HTTPS.bat
```

Ez a script:
- ✅ Automatikusan ellenőrzi a tanúsítványt
- ✅ Ha nincs, automatikusan generálja
- ✅ Elindítja a backend-et (HTTP, port 8000)
- ✅ Elindítja a frontend-et (HTTPS, port 3000)

### 3. Böngészőben Elérés

**PC-ről:**
- `https://localhost:3000`

**Hálózatról (mobil, más eszköz):**
- `https://192.168.50.75:3000` (cseréld ki a saját IP címedre!)

**⚠️ FONTOS:** A böngésző figyelmeztetést fog mutatni:
- Chrome/Edge: "Your connection is not private" → "Advanced" → "Proceed to localhost (unsafe)"
- Firefox: "Warning: Potential Security Risk Ahead" → "Advanced" → "Accept the Risk and Continue"

### 4. Mobil Böngészőben

1. Nyisd meg: `https://192.168.50.75:3000`
2. A böngésző figyelmeztetést mutat
3. Fogadd el a tanúsítványt:
   - **Chrome (Android):** "Advanced" → "Proceed to 192.168.50.75 (unsafe)"
   - **Safari (iOS):** "Show Details" → "visit this website" → "Visit Website"

## 🔄 HTTP vs HTTPS

### HTTP (START-ALL.bat)
- ✅ Egyszerűbb
- ✅ Nincs tanúsítvány szükség
- ❌ Kamera nem működik (böngésző biztonsági követelmény)

### HTTPS (START-ALL-HTTPS.bat)
- ✅ Kamera működik
- ✅ Biztonságosabb
- ⚠️ Self-signed tanúsítvány (böngésző figyelmeztet)

## 🐛 Hibaelhárítás

### Tanúsítvány nem generálódik

**Probléma:** OpenSSL nem található

**Megoldás:**
1. Telepítsd a Git for Windows-t: https://git-scm.com/download/win
2. Vagy használd a Git Bash-t: `bash generate-cert.sh`

### Böngésző nem fogadja el a tanúsítványt

**Megoldás:**
- Kattints a "Tovább a webhelyre" / "Proceed" gombra
- Self-signed tanúsítvány, ez normális fejlesztéshez

### Mobil nem éri el

**Ellenőrizd:**
1. ✅ Mindkét eszköz ugyanazon a WiFi hálózaton van
2. ✅ Windows tűzfal engedélyezi a 3000 portot
3. ✅ `https://` protokollt használsz (nem `http://`)
4. ✅ A tanúsítvány tartalmazza az IP címet

### IP cím változott

**Megoldás:**
1. Töröld a régi tanúsítványt: `del frontend\certs\*.pem`
2. Generáld újra: `cd frontend && generate-cert.bat`
3. Indítsd újra a szervereket: `START-ALL-HTTPS.bat`

## 📝 Gyors Referencia

```bash
# Tanúsítvány generálása
cd frontend
generate-cert.bat

# HTTPS indítás
START-ALL-HTTPS.bat

# Elérés
# PC: https://localhost:3000
# Mobil: https://192.168.50.75:3000
```

## ✅ Ellenőrzés

A tanúsítvány sikeresen generálódott, ha:
- ✅ `frontend/certs/cert.pem` létezik
- ✅ `frontend/certs/key.pem` létezik
- ✅ A frontend HTTPS-sel indul (lásd a konzolban: "🔐 HTTPS tanúsítványok betöltve")

