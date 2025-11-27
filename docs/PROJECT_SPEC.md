# 🏠 Otthoni Tárgyi Eszköz Nyilvántartó Rendszer

## Projekt Áttekintés
**Verzió:** 1.0  
**Projekt Vezető:** Ügyfél  
**Csapat Összeállítás:**
- Project Manager (PM) - Koordináció és tervezés
- System Architect - Rendszer tervezés
- Backend Developer (Python) - API fejlesztés
- Frontend Developer (React) - UI fejlesztés
- UI/UX Designer - Design és felhasználói élmény
- DevOps Engineer - Deployment és infrastruktúra
- QA Engineer - Tesztelés és minőségbiztosítás

---

## 🎯 Projekt Célkitűzés
Egy modern, könnyen használható webalkalmazás létrehozása, amely lehetővé teszi a háztartási tárgyak digitális nyilvántartását fotókkal, leírásokkal és kategorizálással.

---

## 📋 Funkcionális Követelmények

### 1. Felhasználói Funkciók
- ✅ Tárgy hozzáadása (név, kategória, leírás, ár, vásárlás dátuma)
- ✅ Kép feltöltés PC-ről (drag & drop, file picker)
- ✅ Kamera használat mobilon (native camera API)
- ✅ Tárgyak listázása kártyás nézetben
- ✅ Keresés és szűrés (név, kategória)
- ✅ Tárgy szerkesztése
- ✅ Tárgy törlése
- ✅ Kategória menedzsment

### 2. Kategóriák
- Elektronika
- Bútorok
- Konyhai eszközök
- Szerszámok
- Ruházat
- Könyvek
- Műszaki cikkek
- Egyéb

### 3. Képkezelés
- Többféle formátum támogatás (JPG, PNG, WebP)
- Automatikus képméret optimalizálás
- Thumbnail generálás
- Maximum 5MB fájlméret

---

## 🏗️ Technikai Stack

### Backend
- **Framework:** FastAPI (Python 3.9+)
- **Adatbázis:** SQLite (development), PostgreSQL (production ready)
- **ORM:** SQLAlchemy
- **Képkezelés:** Pillow
- **API Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** React 18+ (Node.js környezet)
- **Styling:** Modern CSS + Tailwind CSS
- **State Management:** React Hooks (useState, useContext)
- **HTTP Client:** Axios
- **Kamera:** HTML5 MediaDevices API
- **File Upload:** react-dropzone

### DevOps
- **Containerization:** Docker + Docker Compose
- **Web Server:** Uvicorn (backend), Nginx (frontend proxy)

---

## 📅 Sprint Tervezés

### Sprint 1 (Hét 1) - Architektúra és Backend Alap
- [ ] Rendszer architektúra tervezés
- [ ] Backend projekt setup
- [ ] Adatbázis séma design
- [ ] Alap CRUD API endpoint-ok
- [ ] Képfeltöltés API

### Sprint 2 (Hét 2) - Frontend Alap
- [ ] Frontend projekt setup
- [ ] UI/UX design mockup
- [ ] Komponens architektúra
- [ ] Alap layout és navigáció
- [ ] Tárgy lista nézet

### Sprint 3 (Hét 3) - Képkezelés és Funkciók
- [ ] Kamera integráció
- [ ] File upload UI
- [ ] Képek megjelenítése
- [ ] CRUD műveletek UI
- [ ] Keresés és szűrés

### Sprint 4 (Hét 4) - Finalizálás
- [ ] QA tesztelés
- [ ] Bug fixing
- [ ] Dokumentáció
- [ ] Docker setup
- [ ] Deployment

---

## 🔐 Nem-funkcionális Követelmények
- **Biztonság:** CORS konfiguráció, input validáció
- **Teljesítmény:** Gyors képbetöltés, optimalizált lekérdezések
- **Használhatóság:** Reszponzív design, intuitív UI
- **Karbantarthatóság:** Tiszta kód, dokumentáció
- **Skálázhatóság:** Microservice-ready architektúra

---

## 📊 Sikerkritériumok
1. ✅ Működő backend API Swagger dokumentációval
2. ✅ Reszponzív frontend PC és mobil eszközökön
3. ✅ Kamera és file upload funkciók működnek
4. ✅ Gyors és stabil működés
5. ✅ Docker konténerben futtatható
6. ✅ Teljes dokumentáció

---

## 🚀 Következő Lépések
1. System Architect: Architektúra diagram készítése
2. Backend Dev: FastAPI projekt inicializálás
3. Frontend Dev: React projekt setup
4. UI/UX Designer: Design mockup készítése
