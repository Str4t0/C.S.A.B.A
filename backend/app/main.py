"""
FastAPI fő alkalmazás
Backend Developer: Maria Rodriguez
"""

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil

from . import models, schemas, crud
from .database import engine, get_db, init_db
from .utils import image_handler, document_handler, qr_handler
from .routes import users_router, locations_router, qr_router

# Adatbázis inicializálás
models.Base.metadata.create_all(bind=engine)

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


# ============= STARTUP EVENTS =============

@app.on_event("startup")
async def startup_event():
    """
    Alkalmazás indításkor futó műveletek
    """
    db = next(get_db())
    crud.init_default_categories(db)
    print("✅ Backend elindult!")
    print("📚 API dokumentáció: http://localhost:8000/api/docs")


# ============= HEALTH CHECK =============

@app.get("/", tags=["Health"])
async def root():
    """
    API health check endpoint
    """
    return {
        "status": "healthy",
        "message": "Home Inventory API v1.0",
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
    if category:
        items = crud.get_items_by_category(db, category)
    else:
        items = crud.get_items(db, skip=skip, limit=limit)
    return items


@app.get("/api/items/search", response_model=List[schemas.ItemResponse], tags=["Items"])
async def search_items(
    q: str = Query(..., min_length=1, description="Keresési kulcsszó"),
    db: Session = Depends(get_db)
):
    """
    Keresés név, kategória vagy leírás alapján
    """
    items = crud.search_items(db, q)
    return items


@app.get("/api/items/{item_id}", response_model=schemas.ItemResponse, tags=["Items"])
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """
    Egy konkrét item lekérése
    """
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.post("/api/items", response_model=schemas.ItemResponse, status_code=201, tags=["Items"])
async def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    """
    Új item létrehozása
    """
    return crud.create_item(db, item)


@app.put("/api/items/{item_id}", response_model=schemas.ItemResponse, tags=["Items"])
async def update_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    db: Session = Depends(get_db)
):
    """
    Item módosítása
    """
    updated_item = crud.update_item(db, item_id, item_update)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item


@app.delete("/api/items/{item_id}", response_model=schemas.MessageResponse, tags=["Items"])
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    """
    Item törlése
    """
    # Kép törlése is ha létezik
    item = crud.get_item(db, item_id)
    if item and item.image_filename:
        image_handler.delete_image(item.image_filename)
    
    success = crud.delete_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"message": "Item successfully deleted"}


# ============= IMAGE UPLOAD ENDPOINTS =============

@app.post("/api/upload", response_model=schemas.ImageUploadResponse, tags=["Images"])
async def upload_image(file: UploadFile = File(...)):
    """
    Kép feltöltés
    
    Támogatott formátumok: JPG, JPEG, PNG, WebP
    Maximum méret: 5MB
    """
    # Fájl validáció
    if not image_handler.allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Nem támogatott fájl formátum. Engedélyezett: {', '.join(image_handler.ALLOWED_EXTENSIONS)}"
        )
    
    # Fájl méret ellenőrzés
    contents = await file.read()
    if len(contents) > image_handler.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Fájl túl nagy. Maximum méret: {image_handler.MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Egyedi fájlnév generálás
    unique_filename = image_handler.generate_unique_filename(file.filename)
    
    try:
        # Kép mentése (optimalizálva és thumbnail-lel)
        main_path, thumb_path = image_handler.save_image(contents, unique_filename)
        
        # Kép információk
        image_info = image_handler.get_image_info(contents)
        
        return schemas.ImageUploadResponse(
            filename=unique_filename,
            original_filename=file.filename,
            size=len(contents),
            content_type=file.content_type,
            url=f"/uploads/{unique_filename}"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kép feltöltési hiba: {str(e)}")


@app.get("/api/images/{filename}", tags=["Images"])
async def get_image(filename: str, thumbnail: bool = Query(False)):
    """
    Kép lekérése (fő kép vagy thumbnail)
    """
    if thumbnail:
        file_path = os.path.join("uploads", "thumbnails", f"thumb_{filename}")
    else:
        file_path = os.path.join("uploads", filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)


@app.delete("/api/images/{filename}", response_model=schemas.MessageResponse, tags=["Images"])
async def delete_image(filename: str):
    """
    Kép törlése (fő kép és thumbnail)
    """
    success = image_handler.delete_image(filename)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return {"message": "Image successfully deleted"}


# ============= CATEGORIES ENDPOINTS =============

@app.get("/api/categories", response_model=List[schemas.CategoryResponse], tags=["Categories"])
async def list_categories(db: Session = Depends(get_db)):
    """
    Összes kategória listázása
    """
    return crud.get_categories(db)


@app.post("/api/categories", response_model=schemas.CategoryResponse, status_code=201, tags=["Categories"])
async def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """
    Új kategória létrehozása
    """
    # Ellenőrzés hogy létezik-e már
    existing = crud.get_category_by_name(db, category.name)
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    return crud.create_category(db, category)


# ============= DOCUMENTS ENDPOINTS =============

@app.post("/api/items/{item_id}/documents", response_model=schemas.DocumentUploadResponse, tags=["Documents"])
async def upload_document(
    item_id: int,
    file: UploadFile = File(...),
    document_type: Optional[str] = None,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Dokumentum feltöltése egy tárgyhoz
    """
    # Tárgy létezésének ellenőrzése
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tárgy nem található")
    
    # Fájl validáció
    if not document_handler.allowed_document(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Nem támogatott fájl típus. Engedélyezett: {', '.join(document_handler.ALLOWED_DOCUMENT_EXTENSIONS)}"
        )
    
    # Fájl méret ellenőrzés
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Seek back to start
    
    if file_size > document_handler.MAX_DOCUMENT_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Fájl túl nagy! Maximum: {document_handler.MAX_DOCUMENT_SIZE / 1024 / 1024:.0f} MB"
        )
    
    # Fájl mentése
    unique_filename = document_handler.generate_unique_document_filename(file.filename)
    file_path = document_handler.get_document_path(unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fájl mentési hiba: {str(e)}")
    finally:
        file.file.close()
    
    # Adatbázisba mentés
    db_document = crud.create_document(
        db=db,
        item_id=item_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_size=file_size,
        document_type=document_type,
        description=description
    )
    
    return {
        "id": db_document.id,
        "filename": db_document.filename,
        "original_filename": db_document.original_filename,
        "file_size": db_document.file_size,
        "url": f"/documents/{db_document.filename}",
        "document_type": db_document.document_type
    }


@app.get("/api/items/{item_id}/documents", response_model=List[schemas.DocumentResponse], tags=["Documents"])
async def get_item_documents(item_id: int, db: Session = Depends(get_db)):
    """
    Egy tárgyhoz tartozó összes dokumentum lekérése
    """
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tárgy nem található")
    
    documents = crud.get_documents_by_item(db, item_id)
    
    # URL hozzáadása minden dokumentumhoz
    result = []
    for doc in documents:
        doc_dict = {
            "id": doc.id,
            "item_id": doc.item_id,
            "filename": doc.filename,
            "original_filename": doc.original_filename,
            "file_size": doc.file_size,
            "document_type": doc.document_type,
            "description": doc.description,
            "uploaded_at": doc.uploaded_at,
            "url": f"/documents/{doc.filename}"
        }
        result.append(doc_dict)
    
    return result


@app.get("/api/documents/{document_id}", response_model=schemas.DocumentResponse, tags=["Documents"])
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """
    Egy dokumentum adatainak lekérése
    """
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Dokumentum nem található")
    
    return {
        "id": document.id,
        "item_id": document.item_id,
        "filename": document.filename,
        "original_filename": document.original_filename,
        "file_size": document.file_size,
        "document_type": document.document_type,
        "description": document.description,
        "uploaded_at": document.uploaded_at,
        "url": f"/documents/{document.filename}"
    }


@app.get("/api/documents/{document_id}/download", tags=["Documents"])
async def download_document(document_id: int, db: Session = Depends(get_db)):
    """
    Dokumentum letöltése
    """
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Dokumentum nem található")
    
    file_path = document_handler.get_document_path(document.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fájl nem található a szerveren")
    
    return FileResponse(
        path=file_path,
        filename=document.original_filename,
        media_type='application/octet-stream'
    )


@app.put("/api/documents/{document_id}", response_model=schemas.DocumentResponse, tags=["Documents"])
async def update_document_metadata(
    document_id: int,
    document_type: Optional[str] = None,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Dokumentum metaadatainak frissítése
    """
    document = crud.update_document(db, document_id, document_type, description)
    if not document:
        raise HTTPException(status_code=404, detail="Dokumentum nem található")
    
    return {
        "id": document.id,
        "item_id": document.item_id,
        "filename": document.filename,
        "original_filename": document.original_filename,
        "file_size": document.file_size,
        "document_type": document.document_type,
        "description": document.description,
        "uploaded_at": document.uploaded_at,
        "url": f"/documents/{document.filename}"
    }


@app.delete("/api/documents/{document_id}", tags=["Documents"])
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    """
    Dokumentum törlése
    """
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Dokumentum nem található")
    
    # Fájl törlése a fájlrendszerből
    document_handler.delete_document(document.filename)
    
    # Adatbázisból törlés
    crud.delete_document(db, document_id)
    
    return {"message": "Dokumentum sikeresen törölve"}


# ============= STATISTICS ENDPOINTS =============

@app.get("/api/stats", tags=["Statistics"])
async def get_statistics(db: Session = Depends(get_db)):
    """
    Statisztikák lekérése
    """
    items = crud.get_items(db)
    categories = crud.get_categories(db)
    
    # Kategóriánkénti összesítés
    category_counts = {}
    total_value = 0.0
    total_documents = 0
    
    for item in items:
        category_counts[item.category] = category_counts.get(item.category, 0) + 1
        if item.purchase_price:
            total_value += item.purchase_price
        total_documents += len(item.documents)
    
    return {
        "total_items": len(items),
        "total_categories": len(categories),
        "total_value": round(total_value, 2),
        "items_by_category": category_counts,
        "items_with_images": sum(1 for item in items if item.image_filename),
        "total_documents": total_documents,
        "items_with_documents": sum(1 for item in items if len(item.documents) > 0)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
