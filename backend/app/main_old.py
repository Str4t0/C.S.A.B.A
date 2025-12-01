"""
FastAPI fő alkalmazás - JAVÍTOTT verzió
Backend Developer: Maria Rodriguez
JAVÍTVA: Teljes hibaellenőrzés, jobb logging, quantity kezelés
"""

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import logging

from . import models, schemas, crud
from .database import engine, get_db, init_db
from .utils import image_handler, document_handler, qr_handler
from .routes import users_router, locations_router, qr_router
from .routes.notifications_stats import router as notif_stats_router

# Logging beállítása
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Adatbázis inicializálás
logger.info("Adatbázis táblák létrehozása...")
models.Base.metadata.create_all(bind=engine)
logger.info("✅ Adatbázis inicializálva")

# FastAPI app inicializálás
app = FastAPI(
    title="Home Inventory API",
    description="Otthoni tárgyi eszközök nyilvántartó rendszer API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware - engedélyezi a frontend hozzáférést
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production-ban konkrét origin-eket adj meg!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Statikus fájlok (képek) kiszolgálása
logger.info("Upload könyvtárak létrehozása...")
image_handler.create_upload_dir()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Dokumentumok kiszolgálása
document_handler.create_document_dir()
app.mount("/documents", StaticFiles(directory="documents"), name="documents")

# QR kódok kiszolgálása
qr_handler.create_qr_dir()
app.mount("/qr_codes", StaticFiles(directory="qr_codes"), name="qr_codes")

# API Routers
app.include_router(users_router)
app.include_router(locations_router)
app.include_router(qr_router)
app.include_router(notif_stats_router)

logger.info("✅ Backend inicializálva")


# ============= STARTUP EVENTS =============

@app.on_event("startup")
async def startup_event():
    """
    Alkalmazás indításkor futó műveletek
    """
    logger.info("🚀 Backend indítása...")
    
    db = next(get_db())
    crud.init_default_categories(db)
    
    logger.info("✅ Backend elindult!")
    logger.info("📚 API dokumentáció: http://localhost:8000/api/docs")
    logger.info("🌐 Frontend: http://localhost:3000")


# ============= HEALTH CHECK =============

@app.get("/", tags=["Health"])
async def root():
    """
    API health check endpoint
    """
    return {
        "status": "healthy",
        "message": "Home Inventory API v1.0 - JAVÍTOTT verzió",
        "docs": "/api/docs"
    }


# ============= ITEMS ENDPOINTS =============

@app.get("/api/items", response_model=List[schemas.ItemResponse], tags=["Items"])
async def list_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Összes item listázása szűrési lehetőséggel
    """
    logger.info(f"GET /api/items - skip={skip}, limit={limit}, category={category}")
    
    try:
        if category:
            items = crud.get_items_by_category(db, category)
        else:
            items = crud.get_items(db, skip=skip, limit=limit)
        
        logger.info(f"✅ {len(items)} item visszaadva")
        return items
    
    except Exception as e:
        logger.error(f"❌ Hiba items listázásakor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/items/search", response_model=List[schemas.ItemResponse], tags=["Items"])
async def search_items(
    q: str = Query(..., min_length=1, description="Keresési kulcsszó"),
    db: Session = Depends(get_db)
):
    """
    Keresés név, kategória vagy leírás alapján
    """
    logger.info(f"GET /api/items/search - q='{q}'")
    
    try:
        items = crud.search_items(db, q)
        logger.info(f"✅ {len(items)} találat")
        return items
    
    except Exception as e:
        logger.error(f"❌ Keresési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/items/{item_id}", response_model=schemas.ItemResponse, tags=["Items"])
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """
    Egy item lekérése ID alapján
    """
    logger.info(f"GET /api/items/{item_id}")
    
    item = crud.get_item(db, item_id)
    if not item:
        logger.warning(f"❌ Item #{item_id} nem található")
        raise HTTPException(status_code=404, detail="Item nem található")
    
    logger.info(f"✅ Item #{item_id} visszaadva")
    return item


@app.post("/api/items", response_model=schemas.ItemResponse, status_code=201, tags=["Items"])
async def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    """
    Új item létrehozása - JAVÍTVA
    """
    logger.info(f"POST /api/items - name='{item.name}', category='{item.category}', quantity={item.quantity}")
    
    try:
        # Quantity validáció
        if item.quantity is None or item.quantity < 1:
            logger.warning(f"⚠️  Hibás quantity érték: {item.quantity}, beállítva 1-re")
            item.quantity = 1
        
        new_item = crud.create_item(db, item)
        logger.info(f"✅ Új item létrehozva: #{new_item.id} - {new_item.name}")
        
        return new_item
    
    except Exception as e:
        logger.error(f"❌ Item létrehozási hiba: {e}")
        raise HTTPException(status_code=400, detail=f"Hiba az item létrehozásakor: {str(e)}")


@app.put("/api/items/{item_id}", response_model=schemas.ItemResponse, tags=["Items"])
async def update_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    db: Session = Depends(get_db)
):
    """
    Item frissítése - JAVÍTVA
    """
    logger.info(f"PUT /api/items/{item_id}")
    
    try:
        updated_item = crud.update_item(db, item_id, item_update)
        
        if not updated_item:
            logger.warning(f"❌ Item #{item_id} nem található")
            raise HTTPException(status_code=404, detail="Item nem található")
        
        logger.info(f"✅ Item #{item_id} frissítve")
        return updated_item
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Item frissítési hiba: {e}")
        raise HTTPException(status_code=400, detail=f"Hiba az item frissítésekor: {str(e)}")


@app.delete("/api/items/{item_id}", tags=["Items"])
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    """
    Item törlése
    """
    logger.info(f"DELETE /api/items/{item_id}")
    
    try:
        # Item lekérése
        item = crud.get_item(db, item_id)
        if not item:
            logger.warning(f"❌ Item #{item_id} nem található")
            raise HTTPException(status_code=404, detail="Item nem található")
        
        # Kép törlése ha van
        if item.image_filename:
            try:
                image_handler.delete_image(item.image_filename)
                logger.info(f"   Kép törölve: {item.image_filename}")
            except Exception as e:
                logger.warning(f"   ⚠️  Kép törlési hiba: {e}")
        
        # QR kód törlése ha van
        if item.qr_code:
            try:
                qr_handler.delete_qr_files(item_id)
                logger.info(f"   QR kód törölve")
            except Exception as e:
                logger.warning(f"   ⚠️  QR törlési hiba: {e}")
        
        # Item törlése
        success = crud.delete_item(db, item_id)
        
        if success:
            logger.info(f"✅ Item #{item_id} törölve")
            return {"message": "Item sikeresen törölve"}
        else:
            raise HTTPException(status_code=500, detail="Törlési hiba")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Törlési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= IMAGES ENDPOINTS =============

@app.post("/api/upload", tags=["Images"])
async def upload_image(file: UploadFile = File(...)):
    """
    Kép feltöltése - JAVÍTVA
    """
    logger.info(f"POST /api/upload - file='{file.filename}', type='{file.content_type}'")
    
    try:
        result = await image_handler.save_uploaded_file(file)
        logger.info(f"✅ Kép feltöltve: {result['filename']}")
        return result
    
    except ValueError as e:
        logger.error(f"❌ Validációs hiba: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"❌ Feltöltési hiba: {e}")
        raise HTTPException(status_code=500, detail=f"Kép feltöltési hiba: {str(e)}")


@app.get("/api/images/{filename}", tags=["Images"])
async def get_image(filename: str, thumbnail: bool = Query(False)):
    """
    Kép lekérése
    """
    logger.info(f"GET /api/images/{filename} - thumbnail={thumbnail}")
    
    try:
        if thumbnail:
            file_path = image_handler.get_thumbnail_path(filename)
        else:
            file_path = image_handler.get_image_path(filename)
        
        if not os.path.exists(file_path):
            logger.warning(f"❌ Kép nem található: {filename}")
            raise HTTPException(status_code=404, detail="Kép nem található")
        
        return FileResponse(file_path)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Képlekérési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/images/{filename}", tags=["Images"])
async def delete_image(filename: str):
    """
    Kép törlése
    """
    logger.info(f"DELETE /api/images/{filename}")
    
    try:
        image_handler.delete_image(filename)
        logger.info(f"✅ Kép törölve: {filename}")
        return {"message": "Kép sikeresen törölve"}
    
    except FileNotFoundError:
        logger.warning(f"❌ Kép nem található: {filename}")
        raise HTTPException(status_code=404, detail="Kép nem található")
    
    except Exception as e:
        logger.error(f"❌ Képtörlési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= CATEGORIES ENDPOINTS =============

@app.get("/api/categories", response_model=List[schemas.CategoryResponse], tags=["Categories"])
async def get_categories(db: Session = Depends(get_db)):
    """
    Összes kategória lekérése
    """
    logger.info("GET /api/categories")
    
    try:
        categories = crud.get_categories(db)
        logger.info(f"✅ {len(categories)} kategória visszaadva")
        return categories
    
    except Exception as e:
        logger.error(f"❌ Kategória lekérési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/categories", response_model=schemas.CategoryResponse, status_code=201, tags=["Categories"])
async def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """
    Új kategória létrehozása
    """
    logger.info(f"POST /api/categories - name='{category.name}'")
    
    try:
        # Egyediség ellenőrzés
        existing = crud.get_category_by_name(db, category.name)
        if existing:
            logger.warning(f"⚠️  Kategória már létezik: {category.name}")
            raise HTTPException(status_code=400, detail="Ez a kategória már létezik")
        
        new_category = crud.create_category(db, category)
        logger.info(f"✅ Kategória létrehozva: #{new_category.id} - {new_category.name}")
        return new_category
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Kategória létrehozási hiba: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# ============= STATISTICS ENDPOINTS =============

@app.get("/api/stats", response_model=schemas.StatsResponse, tags=["Statistics"])
async def get_statistics(db: Session = Depends(get_db)):
    """
    Globális statisztikák lekérése - JAVÍTVA
    """
    logger.info("GET /api/stats")
    
    try:
        items = crud.get_items(db)
        categories = crud.get_categories(db)
        
        # Összesítések
        total_value = sum([item.purchase_price or 0 for item in items])
        
        items_by_category = {}
        for item in items:
            cat = item.category
            items_by_category[cat] = items_by_category.get(cat, 0) + 1
        
        # Low stock items
        low_stock_items = crud.get_low_stock_items(db)
        
        stats = {
            "total_items": len(items),
            "total_categories": len(categories),
            "total_value": total_value,
            "items_by_category": items_by_category,
            "low_stock_items": len(low_stock_items)
        }
        
        logger.info(f"✅ Statisztikák: {stats['total_items']} items, {stats['low_stock_items']} low stock")
        return stats
    
    except Exception as e:
        logger.error(f"❌ Statisztika lekérési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= DOCUMENTS ENDPOINTS =============

@app.post("/api/items/{item_id}/documents", response_model=schemas.DocumentResponse, tags=["Documents"])
async def upload_document(
    item_id: int,
    file: UploadFile = File(...),
    document_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Dokumentum feltöltése egy item-hez - JAVÍTVA
    """
    logger.info(f"POST /api/items/{item_id}/documents - file='{file.filename}'")
    
    try:
        # Item ellenőrzés
        item = crud.get_item(db, item_id)
        if not item:
            logger.warning(f"❌ Item #{item_id} nem található")
            raise HTTPException(status_code=404, detail="Item nem található")
        
        # Dokumentum mentése
        doc_data = await document_handler.save_document(file, item_id, document_type, description)
        
        # DB bejegyzés
        document = crud.create_document(db, doc_data)
        
        logger.info(f"✅ Dokumentum feltöltve: #{document.id} - {document.filename}")
        return document
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Dokumentum feltöltési hiba: {e}")
        raise HTTPException(status_code=500, detail=f"Dokumentum feltöltési hiba: {str(e)}")


@app.get("/api/items/{item_id}/documents", response_model=List[schemas.DocumentResponse], tags=["Documents"])
async def get_item_documents(item_id: int, db: Session = Depends(get_db)):
    """
    Item dokumentumainak lekérése
    """
    logger.info(f"GET /api/items/{item_id}/documents")
    
    try:
        # Item ellenőrzés
        item = crud.get_item(db, item_id)
        if not item:
            logger.warning(f"❌ Item #{item_id} nem található")
            raise HTTPException(status_code=404, detail="Item nem található")
        
        documents = crud.get_documents_by_item(db, item_id)
        logger.info(f"✅ {len(documents)} dokumentum visszaadva")
        return documents
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Dokumentum lekérési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents/{document_id}", response_model=schemas.DocumentResponse, tags=["Documents"])
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """
    Egy dokumentum adatainak lekérése
    """
    logger.info(f"GET /api/documents/{document_id}")
    
    try:
        document = crud.get_document(db, document_id)
        if not document:
            logger.warning(f"❌ Dokumentum #{document_id} nem található")
            raise HTTPException(status_code=404, detail="Dokumentum nem található")
        
        logger.info(f"✅ Dokumentum #{document_id} visszaadva")
        return document
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents/{document_id}/download", tags=["Documents"])
async def download_document(document_id: int, db: Session = Depends(get_db)):
    """
    Dokumentum letöltése
    """
    logger.info(f"GET /api/documents/{document_id}/download")
    
    try:
        document = crud.get_document(db, document_id)
        if not document:
            logger.warning(f"❌ Dokumentum #{document_id} nem található")
            raise HTTPException(status_code=404, detail="Dokumentum nem található")
        
        file_path = os.path.join("documents", document.filename)
        
        if not os.path.exists(file_path):
            logger.warning(f"❌ Fájl nem található: {file_path}")
            raise HTTPException(status_code=404, detail="Fájl nem található")
        
        logger.info(f"✅ Dokumentum letöltve: {document.filename}")
        return FileResponse(
            file_path,
            media_type=document.mime_type,
            filename=document.original_filename
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Letöltési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/documents/{document_id}", response_model=schemas.DocumentResponse, tags=["Documents"])
async def update_document(
    document_id: int,
    document_update: schemas.DocumentUpdate,
    db: Session = Depends(get_db)
):
    """
    Dokumentum metaadatainak frissítése
    """
    logger.info(f"PUT /api/documents/{document_id}")
    
    try:
        updated_doc = crud.update_document(
            db,
            document_id,
            document_update.document_type,
            document_update.description
        )
        
        if not updated_doc:
            logger.warning(f"❌ Dokumentum #{document_id} nem található")
            raise HTTPException(status_code=404, detail="Dokumentum nem található")
        
        logger.info(f"✅ Dokumentum #{document_id} frissítve")
        return updated_doc
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Frissítési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/documents/{document_id}", tags=["Documents"])
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    """
    Dokumentum törlése
    """
    logger.info(f"DELETE /api/documents/{document_id}")
    
    try:
        document = crud.get_document(db, document_id)
        if not document:
            logger.warning(f"❌ Dokumentum #{document_id} nem található")
            raise HTTPException(status_code=404, detail="Dokumentum nem található")
        
        # Fájl törlése
        file_path = os.path.join("documents", document.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"   Fájl törölve: {document.filename}")
        
        # DB bejegyzés törlése
        success = crud.delete_document(db, document_id)
        
        if success:
            logger.info(f"✅ Dokumentum #{document_id} törölve")
            return {"message": "Dokumentum sikeresen törölve"}
        else:
            raise HTTPException(status_code=500, detail="Törlési hiba")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Törlési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


logger.info("✅ API végpontok regisztrálva")
