"""
Item Images API routes - JAVÍTOTT VERZIÓ
Backend Developer: Maria Rodriguez

JAVÍTVA: save_image() használata save_uploaded_file() helyett
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from .. import crud, schemas
from ..database import get_db
from ..utils import image_handler

router = APIRouter(prefix="/api/items/{item_id}/images", tags=["Item Images"])
logger = logging.getLogger(__name__)


@router.get("", response_model=List[schemas.ItemImageResponse])
async def get_item_images(item_id: int, db: Session = Depends(get_db)):
    """
    Egy tárgy összes képének lekérése
    """
    logger.info(f"GET /api/items/{item_id}/images")
    
    try:
        # Item ellenőrzés
        item = crud.get_item(db, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Tárgy nem található")
        
        images = crud.get_item_images(db, item_id)
        
        # URL hozzáadása
        for img in images:
            img.url = f"/uploads/{img.filename}"
        
        logger.info(f"✅ {len(images)} kép lekérve")
        
        return images
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Képek lekérési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=schemas.ItemImageResponse, status_code=201)
async def upload_item_image(
    item_id: int,
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    rotation: int = Form(0),
    db: Session = Depends(get_db)
):
    """
    Új kép feltöltése egy tárgyhoz
    
    Args:
        item_id: Tárgy ID
        file: Kép fájl
        is_primary: Elsődleges kép legyen-e
        rotation: Forgatás (0, 90, 180, 270)
    """
    logger.info(f"POST /api/items/{item_id}/images (primary={is_primary}, rotation={rotation})")
    
    try:
        # Item ellenőrzés
        item = crud.get_item(db, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Tárgy nem található")
        
        # Rotation validáció
        if rotation not in [0, 90, 180, 270]:
            raise HTTPException(status_code=400, detail="Forgatás csak 0, 90, 180, 270 lehet")
        
        # ✅ JAVÍTVA: save_uploaded_file() használata (async)
        result = await image_handler.save_uploaded_file(file)
        filename = result["filename"]
        
        # ItemImage rekord létrehozása
        db_image = crud.create_item_image(
            db=db,
            item_id=item_id,
            filename=filename,
            original_filename=result.get("original_filename") or file.filename,
            rotation=rotation,
            is_primary=is_primary
        )
        
        # Backward compatibility: ha ez az első kép, mentsd az item.image_filename-be is
        existing_images = crud.get_item_images(db, item_id)
        if len(existing_images) == 1:  # Ez az első kép
            item.image_filename = filename
            db.commit()
        
        # URL hozzáadása
        db_image.url = f"/uploads/{db_image.filename}"
        
        logger.info(f"✅ Kép feltöltve: {db_image.filename}")
        
        return db_image
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Kép feltöltési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{image_id}/rotate", response_model=schemas.ItemImageResponse)
async def rotate_image(
    item_id: int,
    image_id: int,
    rotation: int,
    db: Session = Depends(get_db)
):
    """
    Kép forgatása
    
    Args:
        rotation: Új forgatás (0, 90, 180, 270)
    """
    logger.info(f"PUT /api/items/{item_id}/images/{image_id}/rotate?rotation={rotation}")
    
    try:
        # Rotation validáció
        if rotation not in [0, 90, 180, 270]:
            raise HTTPException(status_code=400, detail="Forgatás csak 0, 90, 180, 270 lehet")
        
        # Kép frissítése
        db_image = crud.update_item_image(db, image_id, rotation=rotation)
        if not db_image:
            raise HTTPException(status_code=404, detail="Kép nem található")
        
        # Item ID ellenőrzés
        if db_image.item_id != item_id:
            raise HTTPException(status_code=400, detail="Kép nem ehhez a tárgyhoz tartozik")
        
        # URL hozzáadása
        db_image.url = f"/uploads/{db_image.filename}"
        
        logger.info(f"✅ Kép elforgatva: {rotation}°")
        
        return db_image
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Forgatási hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{image_id}/primary", response_model=schemas.ItemImageResponse)
async def set_primary_image(
    item_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):
    """
    Kép beállítása elsődlegeskként
    """
    logger.info(f"PUT /api/items/{item_id}/images/{image_id}/primary")
    
    try:
        # Kép frissítése
        db_image = crud.update_item_image(db, image_id, is_primary=True)
        if not db_image:
            raise HTTPException(status_code=404, detail="Kép nem található")
        
        # Item ID ellenőrzés
        if db_image.item_id != item_id:
            raise HTTPException(status_code=400, detail="Kép nem ehhez a tárgyhoz tartozik")
        
        # Backward compatibility: frissítsd az item.image_filename-t is
        item = crud.get_item(db, item_id)
        if item:
            item.image_filename = db_image.filename
            db.commit()
        
        # URL hozzáadása
        db_image.url = f"/uploads/{db_image.filename}"
        
        logger.info(f"✅ Elsődleges kép beállítva")
        
        return db_image
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Primary beállítási hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/reorder", response_model=List[schemas.ItemImageResponse])
async def reorder_images(
    item_id: int,
    image_ids: List[int],
    db: Session = Depends(get_db)
):
    """
    Képek átrendezése
    
    Args:
        image_ids: Kép ID-k az új sorrendben
    """
    logger.info(f"PUT /api/items/{item_id}/images/reorder")
    
    try:
        # Item ellenőrzés
        item = crud.get_item(db, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Tárgy nem található")
        
        # Átrendezés
        reordered = crud.reorder_item_images(db, item_id, image_ids)
        
        # URL hozzáadása
        for img in reordered:
            img.url = f"/uploads/{img.filename}"
        
        logger.info(f"✅ {len(reordered)} kép átrendezve")
        
        return reordered
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Átrendezési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{image_id}")
async def delete_image(
    item_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):
    """
    Kép törlése
    """
    logger.info(f"DELETE /api/items/{item_id}/images/{image_id}")
    
    try:
        # Kép lekérése
        db_image = crud.get_item_image(db, image_id)
        if not db_image:
            raise HTTPException(status_code=404, detail="Kép nem található")
        
        # Item ID ellenőrzés
        if db_image.item_id != item_id:
            raise HTTPException(status_code=400, detail="Kép nem ehhez a tárgyhoz tartozik")
        
        filename = db_image.filename
        
        # DB törlés
        success = crud.delete_item_image(db, image_id)
        if not success:
            raise HTTPException(status_code=404, detail="Kép nem található")
        
        # Fájl törlése
        try:
            image_handler.delete_image(filename)
        except FileNotFoundError:
            logger.warning(f"⚠️ Fájl már nem létezik: {filename}")
        
        # Backward compatibility: ha ez volt az item.image_filename, frissítsd
        item = crud.get_item(db, item_id)
        if item and item.image_filename == filename:
            remaining_images = crud.get_item_images(db, item_id)
            if remaining_images:
                item.image_filename = remaining_images[0].filename
            else:
                item.image_filename = None
            db.commit()
        
        logger.info(f"✅ Kép törölve: {filename}")
        
        return {"message": "Kép sikeresen törölve", "filename": filename}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Törlési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))
