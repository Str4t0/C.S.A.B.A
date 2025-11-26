# 🔌 API Dokumentáció

## Otthoni Tárgyi Nyilvántartó Rendszer API

**Base URL:** `http://localhost:8000`  
**API verzió:** v1.0  
**Swagger dokumentáció:** `http://localhost:8000/api/docs`

---

## 📋 Tartalom

1. [Autentikáció](#autentikáció)
2. [Items Endpoints](#items-endpoints)
3. [Images Endpoints](#images-endpoints)
4. [Categories Endpoints](#categories-endpoints)
5. [Statistics Endpoints](#statistics-endpoints)
6. [Hibakezelés](#hibakezelés)
7. [Rate Limiting](#rate-limiting)

---

## 🔐 Autentikáció

**Jelenlegi verzió:** Nincs autentikáció (fejlesztés alatt)
**Jövőbeli verzió:** JWT token alapú autentikáció

---

## 📦 Items Endpoints

### 1. Összes Item Listázása

```http
GET /api/items
```

**Query paraméterek:**
- `skip` (int, optional): Lapozáshoz, elhagyandó elemek száma (default: 0)
- `limit` (int, optional): Maximum visszaadott elemek (default: 100, max: 500)
- `category` (string, optional): Szűrés kategória szerint

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "name": "Samsung TV",
    "category": "Elektronika",
    "description": "55 inches OLED TV",
    "purchase_price": 250000.0,
    "purchase_date": "2024-01-15",
    "location": "Nappali",
    "notes": "Garancia: 2 év",
    "image_filename": "abc123.jpg",
    "created_at": "2024-11-26T10:30:00",
    "updated_at": "2024-11-26T10:30:00"
  }
]
```

**Példa:**
```bash
curl http://localhost:8000/api/items?limit=10&category=Elektronika
```

---

### 2. Item Keresése

```http
GET /api/items/search
```

**Query paraméterek:**
- `q` (string, required): Keresési kulcsszó

**Keresési mezők:**
- `name` - Tárgy neve
- `category` - Kategória
- `description` - Leírás

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "name": "Samsung TV",
    ...
  }
]
```

**Példa:**
```bash
curl "http://localhost:8000/api/items/search?q=samsung"
```

---

### 3. Egy Item Lekérése

```http
GET /api/items/{item_id}
```

**Path paraméterek:**
- `item_id` (int, required): Item azonosító

**Response 200 OK:**
```json
{
  "id": 1,
  "name": "Samsung TV",
  "category": "Elektronika",
  ...
}
```

**Response 404 Not Found:**
```json
{
  "detail": "Item not found"
}
```

**Példa:**
```bash
curl http://localhost:8000/api/items/1
```

---

### 4. Új Item Létrehozása

```http
POST /api/items
```

**Request Body:**
```json
{
  "name": "Samsung TV",
  "category": "Elektronika",
  "description": "55 inches OLED TV",
  "purchase_price": 250000.0,
  "purchase_date": "2024-01-15",
  "location": "Nappali",
  "notes": "Garancia: 2 év",
  "image_filename": "abc123.jpg"
}
```

**Kötelező mezők:**
- `name` (string, max 200 karakter)
- `category` (string, max 100 karakter)

**Opcionális mezők:**
- `description` (string)
- `purchase_price` (float, >= 0)
- `purchase_date` (date, YYYY-MM-DD formátum)
- `location` (string, max 200 karakter)
- `notes` (string)
- `image_filename` (string, max 300 karakter)

**Response 201 Created:**
```json
{
  "id": 1,
  "name": "Samsung TV",
  ...
}
```

**Response 400 Bad Request:**
```json
{
  "detail": "Validation error message"
}
```

**Példa:**
```bash
curl -X POST http://localhost:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung TV",
    "category": "Elektronika",
    "purchase_price": 250000
  }'
```

---

### 5. Item Frissítése

```http
PUT /api/items/{item_id}
```

**Path paraméterek:**
- `item_id` (int, required): Item azonosító

**Request Body:**
Minden mező opcionális (csak a frissíteni kívánt mezőket kell küldeni)

```json
{
  "name": "Samsung TV Updated",
  "purchase_price": 240000.0
}
```

**Response 200 OK:**
```json
{
  "id": 1,
  "name": "Samsung TV Updated",
  ...
}
```

**Response 404 Not Found:**
```json
{
  "detail": "Item not found"
}
```

**Példa:**
```bash
curl -X PUT http://localhost:8000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"purchase_price": 240000}'
```

---

### 6. Item Törlése

```http
DELETE /api/items/{item_id}
```

**Path paraméterek:**
- `item_id` (int, required): Item azonosító

**Response 200 OK:**
```json
{
  "message": "Item successfully deleted"
}
```

**Response 404 Not Found:**
```json
{
  "detail": "Item not found"
}
```

**Megjegyzés:** Az item-hez tartozó kép is törlődik!

**Példa:**
```bash
curl -X DELETE http://localhost:8000/api/items/1
```

---

## 📸 Images Endpoints

### 1. Kép Feltöltése

```http
POST /api/upload
```

**Request:** `multipart/form-data`

**Form Fields:**
- `file` (file, required): Képfájl

**Támogatott formátumok:**
- JPG / JPEG
- PNG
- WebP

**Maximum fájlméret:** 5MB

**Response 200 OK:**
```json
{
  "filename": "abc123def456.jpg",
  "original_filename": "my_photo.jpg",
  "size": 1024000,
  "content_type": "image/jpeg",
  "url": "/uploads/abc123def456.jpg"
}
```

**Response 400 Bad Request:**
```json
{
  "detail": "Nem támogatott fájl formátum"
}
```

**Képfeldolgozás:**
- Automatikus méret optimalizálás (max 1920x1920)
- Thumbnail generálás (300x300)
- JPEG tömörítés (85% minőség)

**Példa:**
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@photo.jpg"
```

---

### 2. Kép Lekérése

```http
GET /api/images/{filename}
```

**Query paraméterek:**
- `thumbnail` (bool, optional): Ha true, thumbnail-t ad vissza (default: false)

**Response 200 OK:**
Bináris kép adat

**Response 404 Not Found:**
```json
{
  "detail": "Image not found"
}
```

**Példa:**
```bash
# Fő kép
curl http://localhost:8000/api/images/abc123.jpg

# Thumbnail
curl "http://localhost:8000/api/images/abc123.jpg?thumbnail=true"
```

---

### 3. Kép Törlése

```http
DELETE /api/images/{filename}
```

**Path paraméterek:**
- `filename` (string, required): Fájlnév

**Response 200 OK:**
```json
{
  "message": "Image successfully deleted"
}
```

**Response 404 Not Found:**
```json
{
  "detail": "Image not found"
}
```

**Megjegyzés:** A thumbnail is törlődik!

**Példa:**
```bash
curl -X DELETE http://localhost:8000/api/images/abc123.jpg
```

---

## 🏷️ Categories Endpoints

### 1. Összes Kategória Listázása

```http
GET /api/categories
```

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "name": "Elektronika",
    "icon": "💻",
    "color": "#4A90E2",
    "created_at": "2024-11-26T10:00:00"
  },
  {
    "id": 2,
    "name": "Bútorok",
    "icon": "🛋️",
    "color": "#8B4513",
    "created_at": "2024-11-26T10:00:00"
  }
]
```

**Példa:**
```bash
curl http://localhost:8000/api/categories
```

---

### 2. Új Kategória Létrehozása

```http
POST /api/categories
```

**Request Body:**
```json
{
  "name": "Sport felszerelések",
  "icon": "⚽",
  "color": "#FF5733"
}
```

**Kötelező mezők:**
- `name` (string, max 100 karakter, egyedi)

**Opcionális mezők:**
- `icon` (string, max 50 karakter)
- `color` (string, max 20 karakter, hex color)

**Response 201 Created:**
```json
{
  "id": 9,
  "name": "Sport felszerelések",
  "icon": "⚽",
  "color": "#FF5733",
  "created_at": "2024-11-26T10:30:00"
}
```

**Response 400 Bad Request:**
```json
{
  "detail": "Category already exists"
}
```

**Példa:**
```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sport felszerelések",
    "icon": "⚽",
    "color": "#FF5733"
  }'
```

---

## 📊 Statistics Endpoints

### 1. Statisztikák Lekérése

```http
GET /api/stats
```

**Response 200 OK:**
```json
{
  "total_items": 25,
  "total_categories": 8,
  "total_value": 1250000.0,
  "items_by_category": {
    "Elektronika": 8,
    "Bútorok": 5,
    "Konyhai eszközök": 12
  },
  "items_with_images": 20
}
```

**Példa:**
```bash
curl http://localhost:8000/api/stats
```

---

## ⚠️ Hibakezelés

### HTTP Státusz Kódok

| Kód | Jelentés | Leírás |
|-----|----------|--------|
| 200 | OK | Sikeres kérés |
| 201 | Created | Sikeres létrehozás |
| 400 | Bad Request | Hibás kérés / validációs hiba |
| 404 | Not Found | Az erőforrás nem található |
| 500 | Internal Server Error | Szerver hiba |

### Hiba Formátum

```json
{
  "detail": "Hibaüzenet szövege"
}
```

vagy Pydantic validációs hiba esetén:

```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 🚦 Rate Limiting

**Jelenlegi verzió:** Nincs rate limiting
**Jövőbeli verzió:** 100 kérés / óra / IP

---

## 🔧 Példa Workflow

### Teljes Item Létrehozás Képpel

```bash
# 1. Kép feltöltése
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:8000/api/upload \
  -F "file=@my_photo.jpg")

FILENAME=$(echo $UPLOAD_RESPONSE | jq -r '.filename')

# 2. Item létrehozása a képpel
curl -X POST http://localhost:8000/api/items \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Samsung TV\",
    \"category\": \"Elektronika\",
    \"description\": \"55 inches OLED TV\",
    \"purchase_price\": 250000,
    \"purchase_date\": \"2024-01-15\",
    \"image_filename\": \"$FILENAME\"
  }"
```

---

## 📚 További Információk

- **Interaktív API dokumentáció:** http://localhost:8000/api/docs
- **Swagger UI:** http://localhost:8000/api/docs
- **ReDoc:** http://localhost:8000/api/redoc

---

**API Dokumentáció készítve a Backend csapat által** 🚀
