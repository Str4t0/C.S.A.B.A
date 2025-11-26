# 🏗️ Rendszer Architektúra

## System Architect: Alex Chen
**Dátum:** 2024-11-26

---

## 🎨 High-Level Architektúra

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │  │
│  │   Browser    │  │   Browser    │  │   Browser    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/REST API
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND LAYER                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           React Application (SPA)                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │ UI       │  │ State    │  │ API          │  │   │
│  │  │ Components│  │Management│  │ Client       │  │   │
│  │  └──────────┘  └──────────┘  └──────────────┘  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │      Camera & File Upload Module         │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/JSON
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND LAYER                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           FastAPI Application                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │ REST     │  │ Business │  │ Image        │  │   │
│  │  │ Endpoints│  │ Logic    │  │ Processing   │  │   │
│  │  └──────────┘  └──────────┘  └──────────────┘  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │         SQLAlchemy ORM Layer              │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ SQL
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                             │
│  ┌──────────────┐              ┌──────────────────┐    │
│  │   SQLite/    │              │   File System    │    │
│  │  PostgreSQL  │              │  (Image Storage) │    │
│  │   Database   │              │                  │    │
│  └──────────────┘              └──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Adatbázis Séma

### Items Table (Tárgyak)
```sql
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    purchase_price DECIMAL(10, 2),
    purchase_date DATE,
    location VARCHAR(200),
    notes TEXT,
    image_filename VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category ON items(category);
CREATE INDEX idx_name ON items(name);
```

### Categories Table (Kategóriák)
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Items API
| Method | Endpoint | Leírás |
|--------|----------|--------|
| GET | `/api/items` | Összes tárgy listázása |
| GET | `/api/items/{id}` | Egy tárgy lekérése |
| POST | `/api/items` | Új tárgy létrehozása |
| PUT | `/api/items/{id}` | Tárgy módosítása |
| DELETE | `/api/items/{id}` | Tárgy törlése |
| GET | `/api/items/search?q={query}` | Keresés |

### Images API
| Method | Endpoint | Leírás |
|--------|----------|--------|
| POST | `/api/upload` | Kép feltöltés |
| GET | `/api/images/{filename}` | Kép lekérése |
| DELETE | `/api/images/{filename}` | Kép törlése |

### Categories API
| Method | Endpoint | Leírás |
|--------|----------|--------|
| GET | `/api/categories` | Kategóriák listázása |
| POST | `/api/categories` | Új kategória |

---

## 🔒 Biztonsági Megfontolások

1. **Input Validáció**
   - Pydantic modellek minden bemeneti adatra
   - Fájl típus és méret ellenőrzés
   - SQL injection védelem (ORM használat)

2. **CORS Konfiguráció**
   - Engedélyezett origin-ek definiálása
   - Credentials támogatás

3. **File Upload Biztonság**
   - Engedélyezett fájl típusok: jpg, jpeg, png, webp
   - Maximum fájlméret: 5MB
   - Fájlnév sanitizálás
   - Veszélyes file extension-ök blokkolása

4. **Rate Limiting**
   - API endpoint-ok védelem túlterhelés ellen

---

## 🚀 Deployment Architektúra

### Docker Compose Setup
```
┌─────────────────────────────────────┐
│     Docker Compose Network          │
│                                      │
│  ┌──────────────────────────────┐  │
│  │   nginx (Reverse Proxy)      │  │
│  │   Port: 80                   │  │
│  └──────────────┬───────────────┘  │
│                 │                   │
│        ┌────────┴────────┐         │
│        │                 │          │
│  ┌─────▼──────┐   ┌─────▼──────┐  │
│  │  frontend  │   │  backend   │  │
│  │  (React)   │   │  (FastAPI) │  │
│  │  Port:3000 │   │  Port:8000 │  │
│  └────────────┘   └─────┬──────┘  │
│                          │          │
│                    ┌─────▼──────┐  │
│                    │  volumes   │  │
│                    │  - db      │  │
│                    │  - uploads │  │
│                    └────────────┘  │
└─────────────────────────────────────┘
```

---

## 📁 Projekt Struktúra

```
home-inventory-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── database.py          # DB connection
│   │   ├── crud.py              # CRUD operations
│   │   └── utils/
│   │       ├── image_handler.py # Kép feldolgozás
│   │       └── validators.py    # Validációk
│   ├── uploads/                 # Feltöltött képek
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ItemCard.jsx
│   │   │   ├── ItemForm.jsx
│   │   │   ├── CameraCapture.jsx
│   │   │   └── FileUpload.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── main.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── Dockerfile
├── docker/
│   └── docker-compose.yml
└── docs/
    ├── PROJECT_SPEC.md
    ├── ARCHITECTURE.md
    └── API_DOCS.md
```

---

## ⚡ Teljesítmény Optimalizálás

1. **Backend**
   - SQLAlchemy lazy loading
   - Képek thumbnail generálás
   - Response caching potenciál

2. **Frontend**
   - Code splitting
   - Lazy loading komponensek
   - Képek lazy loading
   - Virtual scrolling hosszú listák esetén

3. **Képek**
   - WebP formátum használat
   - Automatikus tömörítés
   - Progressive loading

---

## 🔄 Jövőbeli Bővítési Lehetőségek

1. Multi-user support (autentikáció)
2. Cloud storage integráció (AWS S3, Google Cloud)
3. QR kód generálás tárgyakhoz
4. Export/Import funkció (CSV, JSON)
5. Statisztikák és riportok
6. Mobile app (React Native)
7. Barcode scanner
8. Emlékeztetők (warranty, maintenance)

---

**Jóváhagyás:** 
- System Architect: ✅
- Backend Lead: Pending
- Frontend Lead: Pending
- DevOps Lead: Pending
