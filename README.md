# 🏠 C.S.A.B.A - Home Inventory System

**Otthoni Tárgyi Nyilvántartó Rendszer** QR kódokkal, multi-user támogatással és retro design-nal.

---

## ✨ Funkciók

### 🔲 QR Kód Rendszer
- QR címkék generálása 3 méretben (3x3, 5x5, 8x8 cm)
- Mobil QR scanner (kamera API)
- Nyomtatható 300 DPI címkék
- Gyors tárgy azonosítás

### 👥 Multi-User Support
- Több felhasználó kezelése
- Színes avatárok
- User statisztikák
- Tárgyak user-ekhez rendelése

### 📍 Hierarchikus Helyszínek
- Parent-child struktúra (Lakás > Szoba > Polc)
- Teljes elérési út
- Ikonok helyszínekhez
- Nested lista nézet

### ⚠️ Low Stock Alerts
- Mennyiség követés
- Minimum készlet riasztás
- Floating alert button
- Auto-refresh

### 📎 Dokumentum Kezelés
- PDF, Word, Excel, TXT támogatás
- Számlák, garanciák tárolása
- Letöltés funkció
- Dokumentum típusok

### 📸 Kép Kezelés
- Fotó készítés mobilon
- Automatikus thumbnail
- Képfeltöltés drag & drop

### 🎨 Retro Sketch Design
- Kézzel rajzolt vintage stílus
- Paper texture háttér
- Sketchy borders
- Handwritten fonts (Patrick Hand, Caveat)

---

## 🛠️ Technológiák

### Backend
- **Python 3.14**
- **FastAPI** - Modern, gyors web framework
- **SQLAlchemy** - ORM
- **SQLite** - Adatbázis
- **qrcode[pil]** - QR generálás
- **Pillow** - Képkezelés

### Frontend
- **React 18**
- **Vite** - Build tool
- **Axios** - HTTP kliens
- **@zxing/browser** - QR scanner
- **CSS3** - Retro sketch design

---

## 🚀 Telepítés

### Előfeltételek
- Python 3.14+
- Node.js 18+
- npm/yarn

### Backend

```bash
cd backend

# Virtual environment (opcionális)
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Dependencies
pip install -r requirements.txt --break-system-packages

# Adatbázis létrehozása (automatikus első indításkor)
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Indítás
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**VAGY Windows Batch script:**
```bash
START-BACKEND-SIMPLE.bat
```

### Frontend

```bash
cd frontend

# Dependencies
npm install

# Development
npm run dev

# Production build
npm run build
```

**VAGY Windows Batch script:**
```bash
START-FRONTEND-SIMPLE.bat
```

---

## 📱 Használat

### Első lépések

1. **Backend indítása:** `http://localhost:8000`
2. **Frontend indítása:** `http://localhost:3000`
3. **API docs:** `http://localhost:8000/api/docs`

### Mobil hozzáférés

1. Ellenőrizd helyi IP címed: `ipconfig` (Windows) / `ifconfig` (Linux/Mac)
2. Nyisd meg: `http://[HELYI-IP]:3000` (pl: `http://192.168.1.100:3000`)
3. QR scanner kamera engedély szükséges

### Új tárgy létrehozása QR-ral

1. Klikk: **"Új tárgy"** gomb
2. Töltsd ki az adatokat (név, kategória kötelező)
3. Válassz **tulajdonost** és **helyszínt**
4. Állítsd be **mennyiséget** és **min. készletet**
5. **Mentés**
6. Nyisd meg újra → **"QR Kód"** szekció
7. Generálj QR kódot (Kis/Közepes/Nagy)
8. Letöltés és nyomtatás!

### QR szkennelés mobilon

1. Mobil: `http://[HELYI-IP]:3000`
2. Klikk: **➕** floating gomb (jobb alsó)
3. Válaszd: **📷 QR Szkennelés**
4. Engedélyezd kamerát
5. Helyezd QR kódot keretbe → Automatikus azonosítás!

---

## 📁 Projekt Struktúra

```
C.S.A.B.A/
├── backend/
│   ├── app/
│   │   ├── models.py          # SQLAlchemy modellek
│   │   ├── schemas.py         # Pydantic sémák
│   │   ├── crud.py            # CRUD műveletek
│   │   ├── database.py        # DB kapcsolat
│   │   ├── main.py            # FastAPI app
│   │   ├── routes/
│   │   │   ├── users.py       # User API
│   │   │   ├── locations.py  # Location API
│   │   │   └── qr_codes.py   # QR API
│   │   └── utils/
│   │       ├── qr_handler.py      # QR generálás
│   │       ├── image_handler.py   # Képkezelés
│   │       └── document_handler.py # Dokumentumok
│   ├── requirements.txt
│   └── START-BACKEND-SIMPLE.bat
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ItemForm.jsx
    │   │   ├── ItemCard.jsx
    │   │   ├── QRScanner.jsx
    │   │   ├── UserSelector.jsx
    │   │   ├── LocationSelector.jsx
    │   │   ├── LowStockAlert.jsx
    │   │   └── QuickActions.jsx
    │   ├── services/
    │   │   └── api.js            # API kliens
    │   ├── styles/
    │   │   ├── main.css
    │   │   └── retro-sketch.css  # Retro design
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── START-FRONTEND-SIMPLE.bat
```

---

## 🔧 API Endpoints

### Items
- `GET /api/items` - Lista
- `GET /api/items/{id}` - Egy tárgy
- `POST /api/items` - Létrehozás
- `PUT /api/items/{id}` - Módosítás
- `DELETE /api/items/{id}` - Törlés
- `GET /api/items/search?q=...` - Keresés

### Users
- `GET /api/users` - Userek listája
- `POST /api/users` - User létrehozás
- `GET /api/users/{id}/items` - User tárgyai
- `GET /api/users/{id}/stats` - User statisztika

### Locations
- `GET /api/locations` - Helyszínek listája
- `POST /api/locations` - Helyszín létrehozás
- `GET /api/locations/{id}/items` - Helyszín tárgyai

### QR Codes
- `POST /api/qr/generate/{item_id}?size=medium` - QR generálás
- `GET /api/qr/download/{item_id}/{size}` - QR letöltés
- `GET /api/qr/scan/{qr_code}` - QR scan
- `GET /api/qr/low-stock` - Alacsony készlet

### Documents & Images
- `POST /api/items/{id}/documents` - Dokumentum feltöltés
- `POST /api/upload` - Kép feltöltés
- `GET /api/documents/{id}/download` - Dokumentum letöltés

**Teljes API dokumentáció:** `http://localhost:8000/api/docs`

---

## 🎨 Design

### Színpaletta
- Paper Beige: `#F5E6D3`
- Ink Dark: `#3A3226`
- Orange Sketch: `#E67E22`
- Green Sketch: `#82B366`
- Blue Sketch: `#5B9BD5`

### Betűtípusok
- Patrick Hand (Fő szövegek)
- Caveat (Címek)
- Indie Flower (Alcímek)

### Komponensek
```jsx
<div className="paper-card">...</div>
<button className="btn-sketch btn-sketch-primary">...</button>
<input className="input-sketch" />
<span className="badge-sketch badge-sketch-orange">...</span>
```

---

## 🐛 Hibaelhárítás

### Backend nem indul
```bash
# Ellenőrizd Python verziót
python --version  # Kell: 3.14+

# Telepítsd dependencies-t
pip install -r requirements.txt --break-system-packages

# Töröld és újraépítsd az adatbázist
del backend\inventory.db
python REBUILD-DATABASE.py
```

### Frontend nem indul
```bash
# Töröld node_modules
rm -rf node_modules package-lock.json

# Újratelepítés
npm install

# Dev szerver indítása
npm run dev
```

### QR scanner nem működik mobilon
- Használd **HTTPS**-t vagy **helyi IP-t** (nem localhost)
- Engedélyezd kamera hozzáférést a böngészőben
- Chrome vagy Safari ajánlott

### CORS hiba
- Ellenőrizd backend CORS beállításokat (`main.py`)
- Használd ugyanazt a network-öt (WiFi)

---

## 📊 Statisztikák

### Global Stats
```javascript
GET /api/stats

{
  total_items: 25,
  total_categories: 8,
  total_value: 125000.50,
  items_by_category: {...},
  low_stock_items: 5
}
```

### User Stats
```javascript
GET /api/users/{id}/stats

{
  user_id: 1,
  total_items: 12,
  total_value: 45000,
  items_by_category: {...}
}
```

---

## 🤝 Közreműködés

1. Fork the repo
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📝 Licenc

MIT License - Szabad felhasználás

---

## 👨‍💻 Fejlesztő

**Készítette:** Str4t0  
**Repo:** https://github.com/Str4t0/C.S.A.B.A

---

## 🙏 Köszönet

- FastAPI dokumentáció
- React.js közösség
- @zxing/browser QR scanner library
- Google Fonts (Patrick Hand, Caveat, Indie Flower)

---

**Élvezd a használatát!** 🎉📦✨
