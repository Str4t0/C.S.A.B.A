"""
QR kód API routes - JAVÍTOTT VERZIÓ
Backend Developer: Maria Rodriguez
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import logging

from .. import crud, schemas
from ..database import get_db
from ..utils import qr_handler

router = APIRouter(prefix="/api/qr", tags=["QR Codes"])
logger = logging.getLogger(__name__)


@router.post("/generate/{item_id}", response_model=schemas.QRCodeResponse)
async def generate_qr_code(
    item_id: int,
    size: str = Query("medium", regex="^(small|medium|large)$"),
    db: Session = Depends(get_db)
):
    """
    QR kód generálása egy tárgyhoz
    
    Méretek:
    - small: 3x3 cm (300 DPI)
    - medium: 5x5 cm (300 DPI) 
    - large: 8x8 cm (300 DPI)
    """
    logger.info(f"POST /api/qr/generate/{item_id}?size={size}")
    
    try:
        # Item ellenőrzés
        item = crud.get_item(db, item_id)
        if not item:
            logger.warning(f"❌ Item #{item_id} nem található")
            raise HTTPException(status_code=404, detail="Tárgy nem található")
        
        # QR kód string - ha nincs még, generálj egyet
        if not item.qr_code:
            import uuid
            qr_code_str = f"ITM-{uuid.uuid4().hex[:8].upper()}"
            
            # Mentsd el az adatbázisba
            item.qr_code = qr_code_str
            db.commit()
            db.refresh(item)
            
            logger.info(f"   Új QR kód generálva: {qr_code_str}")
        else:
            qr_code_str = item.qr_code
            logger.info(f"   Meglévő QR kód: {qr_code_str}")
        
        # QR kép generálása
        qr_info = qr_handler.generate_qr_code(item_id, qr_code_str, size)
        
        logger.info(f"✅ QR kód generálva: {qr_info['filename']}")
        
        return {
            "item_id": item_id,
            "qr_code": qr_code_str,
            "qr_url": qr_info["url"],
            "size": size
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ QR generálási hiba: {e}")
        raise HTTPException(status_code=500, detail=f"QR generálási hiba: {str(e)}")


@router.get("/download/{item_id}/{size}")
async def download_qr_label(
    item_id: int,
    size: str,
    db: Session = Depends(get_db)
):
    """
    QR kód címke letöltése
    
    JAVÍTVA: Helyes paraméterek a get_qr_path()-hoz
    """
    logger.info(f"GET /api/qr/download/{item_id}/{size}")
    
    try:
        # Méret validáció
        if size not in ["small", "medium", "large"]:
            raise HTTPException(status_code=400, detail="Érvénytelen méret. Lehetséges: small, medium, large")
        
        # Item ellenőrzés
        item = crud.get_item(db, item_id)
        if not item:
            logger.warning(f"❌ Item #{item_id} nem található")
            raise HTTPException(status_code=404, detail="Tárgy nem található")
        
        # JAVÍTVA: item_id ÉS size paraméter
        file_path = qr_handler.get_qr_path(item_id, size)
        
        if not os.path.exists(file_path):
            logger.warning(f"❌ QR fájl nem létezik: {file_path}")
            raise HTTPException(
                status_code=404, 
                detail="QR kód még nem lett generálva. Először generáld le!"
            )
        
        logger.info(f"✅ QR letöltés: {file_path}")
        
        # QR kód fájlnév
        filename = qr_handler.get_qr_filename(item_id, size)
        
        return FileResponse(
            file_path,
            media_type="image/png",
            filename=filename
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ QR letöltési hiba: {e}")
        raise HTTPException(status_code=500, detail=f"QR letöltési hiba: {str(e)}")


@router.get("/scan/{qr_code}", response_model=schemas.ItemResponse)
async def scan_qr_code(qr_code: str, db: Session = Depends(get_db)):
    """
    QR kód beolvasása és tárgy lekérése
    """
    logger.info(f"GET /api/qr/scan/{qr_code}")
    
    try:
        # Keresés QR kód alapján
        item = db.query(crud.models.Item).filter(
            crud.models.Item.qr_code == qr_code
        ).first()
        
        if not item:
            logger.warning(f"❌ Tárgy nem található QR kóddal: {qr_code}")
            raise HTTPException(status_code=404, detail="Tárgy nem található ezzel a QR kóddal")
        
        logger.info(f"✅ Tárgy megtalálva: #{item.id} - {item.name}")
        
        return item
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ QR scan hiba: {e}")
        raise HTTPException(status_code=500, detail=f"QR beolvasási hiba: {str(e)}")


@router.delete("/{item_id}/qr")
async def delete_qr_codes(item_id: int, db: Session = Depends(get_db)):
    """
    Tárgy QR kódjai törlése (mind a 3 méret)
    """
    logger.info(f"DELETE /api/qr/{item_id}/qr")
    
    try:
        # Item ellenőrzés
        item = crud.get_item(db, item_id)
        if not item:
            logger.warning(f"❌ Item #{item_id} nem található")
            raise HTTPException(status_code=404, detail="Tárgy nem található")
        
        # QR fájlok törlése
        deleted_count = qr_handler.delete_qr_files(item_id)
        
        # QR kód törlése az adatbázisból
        item.qr_code = None
        db.commit()
        
        logger.info(f"✅ {deleted_count} QR fájl törölve, DB frissítve")
        
        return {
            "message": f"{deleted_count} QR kód törölve",
            "item_id": item_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ QR törlési hiba: {e}")
        raise HTTPException(status_code=500, detail=f"QR törlési hiba: {str(e)}")


@router.get("/low-stock", response_model=List[schemas.ItemResponse])
async def get_low_stock_items(db: Session = Depends(get_db)):
    """
    Alacsony készletű tárgyak lekérése
    
    Azok a tárgyak ahol quantity <= min_quantity
    """
    logger.info("GET /api/qr/low-stock")
    
    try:
        items = crud.get_low_stock_items(db)
        logger.info(f"✅ {len(items)} alacsony készletű tárgy")
        
        return items
    
    except Exception as e:
        logger.error(f"❌ Low stock lekérési hiba: {e}")
        raise HTTPException(status_code=500, detail=f"Low stock lekérési hiba: {str(e)}")
