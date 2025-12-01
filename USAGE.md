# 📖 C.S.A.B.A - Használati Útmutató

> Gyors útmutató az alkalmazás használatához

---

## 🚀 Első lépések

### 1. Alkalmazás indítása
```bash
# Windows - dupla kattintás:
START-ALL.bat
```
Ezután nyisd meg a böngészőben: **http://localhost:3000**

### 2. Hálózati elérés (mobil/tablet)
Ha más eszközről szeretnéd elérni:
1. Nézd meg a PC IP címét (pl. `192.168.1.100`)
2. Nyisd meg mobilon: **http://192.168.1.100:3000**

### 3. Kamera használathoz (HTTPS)
```bash
START-ALL-HTTPS.bat
```
Majd: **https://192.168.1.100:3000**

---

## 📦 Tárgyak kezelése

### Új tárgy hozzáadása
1. Kattints az **➕ Új tárgy** gombra
2. Töltsd ki a mezőket:
   - **Név** (kötelező)
   - **Kategória** (kötelező)
   - Ár, dátum, leírás (opcionális)
3. Adj hozzá **képet** (fájl feltöltés vagy kamera)
4. Válassz **tulajdonost** és **helyszínt**
5. Kattints a **Mentés** gombra

### Tárgy szerkesztése
1. Kattints a tárgy kártyájára → megnyílik az **előnézet**
2. Kattints a **✏️ Szerkesztés** gombra
3. Módosítsd az adatokat
4. **Mentés**

### Tárgy törlése
1. Nyisd meg a tárgy szerkesztését
2. Görgess le és kattints a **🗑️ Törlés** gombra
3. Erősítsd meg a törlést

---

## 🔍 Keresés és szűrés

### Keresés
- Írd be a keresőmezőbe a tárgy nevét
- A keresés a **névben**, **leírásban** és **megjegyzésben** is keres

### Kategória szűrés
- Kattints egy kategória gombra (pl. **Elektronika**)
- A keresés és kategória szűrés **együtt működik**!

### Szűrők törlése
- Kattints az **Összes** gombra, vagy
- Kattints a **🔄 Frissítés** gombra

---

## 📷 Képek kezelése

### Kép feltöltése
1. Tárgy szerkesztésénél görgess a **Képek** részhez
2. Kattints a **📁 Fájl kiválasztása** gombra
3. Válaszd ki a képet

### Fotó készítése (mobil)
1. Kattints a **📷 Fotó készítése** gombra
2. Engedélyezd a kamera hozzáférést
3. Készítsd el a fotót
4. A kép automatikusan mentésre kerül

> ⚠️ **Fontos:** Kamera csak HTTPS-en működik!

### Több kép
- Egy tárgyhoz **több képet** is hozzáadhatsz
- A képek között **lapozással** tudsz váltani

---

## 📱 QR kód használata

### QR kód generálása
1. Nyisd meg a tárgy szerkesztését
2. Kattints a **🔲 QR kód generálása** gombra
3. A QR kód automatikusan létrejön

### QR kód beolvasása
1. Menj a **📷 QR Scanner** menüpontra
2. Kattints a **Kamera indítása** gombra
3. Tartsd a telefont a QR kód fölé
4. A tárgy automatikusan megnyílik

---

## 🔔 Értesítések

Az **Értesítések** menüpontban láthatod:
- ⚠️ **Alacsony készlet** - ha egy tárgyból kevés van
- 📸 **Hiányzó képek** - tárgyak kép nélkül
- 📍 **Helyszín nélküli** - tárgyak helyszín nélkül
- 👤 **Tulajdonos nélküli** - tárgyak tulajdonos nélkül
- 📱 **QR kód nélküli** - tárgyak QR kód nélkül

Kattints egy értesítésre → megjelenik az érintett tárgyak listája!

---

## 📊 Statisztikák

A **Statisztikák** menüpontban láthatod:
- 📦 Összes tárgy száma
- 💰 Összes érték
- 📈 Adatok teljessége (%)
- 🏆 Top 5 legértékesebb tárgy

Kattints egy tárgyra a listában → megnyílik az előnézet!

---

## ⚙️ Beállítások

### Felhasználók kezelése
1. Menj a **Beállítások** → **Felhasználók kezelése**
2. **Új felhasználó:** Töltsd ki az adatokat és kattints **Hozzáadás**
3. **Törlés:** Kattints a felhasználó melletti 🗑️ gombra

### Helyszínek kezelése
1. Menj a **Beállítások** → **Helyszínek kezelése**
2. **Új helyszín:** Add meg a címadatokat és kattints **Hozzáadás**
3. **Törlés:** Kattints a helyszín melletti 🗑️ gombra

---

## 🎨 Dizájn váltás

Az alkalmazás **két dizájnnal** rendelkezik:
- **🎮 Game UI** - Játékos, színes dizájn
- **📝 Retro Design** - Klasszikus, letisztult

Váltás: Kattints a jobb felső sarokban lévő **Game UI** / **Retro Design** gombra!

---

## 💡 Tippek

1. **Mobil használat:** Az alkalmazás teljesen reszponzív, mobilon is kényelmesen használható
2. **Offline:** Az adatok a számítógépen tárolódnak, internet nem szükséges
3. **Biztonsági mentés:** A `backend/home_inventory.db` fájl tartalmazza az összes adatot
4. **Képek helye:** `backend/uploads/` mappában találhatók

---

## ❓ Gyakori kérdések

### Nem működik a kamera?
- Használj **HTTPS**-t (`START-ALL-HTTPS.bat`)
- Engedélyezd a kamera hozzáférést a böngészőben

### Nem érem el más eszközről?
- Ellenőrizd, hogy ugyanazon a hálózaton vagy
- Próbáld ki a `FIX-NETWORK-ACCESS.bat` szkriptet

### Hogyan készítsek biztonsági mentést?
Másold el ezeket a mappákat:
- `backend/home_inventory.db` (adatbázis)
- `backend/uploads/` (képek)
- `backend/documents/` (dokumentumok)
- `backend/qr_codes/` (QR kódok)

---

<p align="center">
  <b>Jó leltározást!</b> 📦✨
</p>

