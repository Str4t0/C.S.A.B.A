"""
QR Code API routes
Backend Developer: Maria Rodriguez
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from .. import crud, schemas
from ..database import get_db
from ..utils import qr_handler

router = APIRouter(prefix="/api/qr", tags=["QR Codes"])


@router.post("/generate/{item_id}", response_model=schemas.QRCodeResponse)
async def generate_qr_code(item_id: int, size: str = "medium", db: Session = Depends(get_db)):
    """
    QR kód generálás egy tárgyhoz
    
    Sizes: small (3x3cm), medium (5x5cm), large (8x8cm)
    """
    # Item létezésének ellenőrzése
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tárgy nem található")
    
    # QR kód ID generálása ha még nincs
    if not item.qr_code:
        item.qr_code = qr_handler.generate_qr_code_id()
        db.commit()
        db.refresh(item)
    
    # Nyomtatható címke generálása
    try:
        label_filename = qr_handler.generate_printable_qr_label(
            item_name=item.name,
            item_id=item.id,
            qr_code_id=item.qr_code,
            size=size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QR kód generálási hiba: {str(e)}")
    
    return {
        "qr_code_id": item.qr_code,
        "qr_image_url": f"/qr_codes/{label_filename}",
        "printable_label_url": f"/api/qr/download/{item.id}/{size}"
    }


@router.get("/download/{item_id}/{size}")
async def download_qr_label(item_id: int, size: str = "medium", db: Session = Depends(get_db)):
    """
    QR címke letöltése nyomtatáshoz
    """
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tárgy nem található")
    
    if not item.qr_code:
        raise HTTPException(status_code=400, detail="Ehhez a tárgyhoz még nincs QR kód")
    
    # Fájl elérési út
    filename = f"label_{size}_{item.qr_code}.png"
    file_path = qr_handler.get_qr_path(filename)
    
    if not os.path.exists(file_path):
        # Ha nem létezik, generáljuk újra
        try:
            qr_handler.generate_printable_qr_label(
                item_name=item.name,
                item_id=item.id,
                qr_code_id=item.qr_code,
                size=size
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"QR kód generálási hiba: {str(e)}")
    
    return FileResponse(
        path=file_path,
        filename=f"qr_label_{item.name[:20]}_{size}.png",
        media_type="image/png"
    )


@router.get("/scan/{qr_code}")
async def scan_qr_code(qr_code: str, db: Session = Depends(get_db)):
    """
    QR kód beolvasása - tárgy keresése QR kód alapján
    """
    item = crud.get_item_by_qr(db, qr_code)
    if not item:
        raise HTTPException(status_code=404, detail="Nincs tárgy ezzel a QR kóddal")
    
    return {
        "item_id": item.id,
        "name": item.name,
        "category": item.category,
        "location": item.location.full_path if item.location else None,
        "user": item.user.display_name if item.user else None,
        "image_url": f"/uploads/{item.image_filename}" if item.image_filename else None,
        "quantity": item.quantity,
        "is_low_stock": item.is_low_stock
    }


@router.delete("/{item_id}/qr")
async def delete_qr_code(item_id: int, db: Session = Depends(get_db)):
    """
    QR kód törlése egy tárgyról
    """
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tárgy nem található")
    
    if not item.qr_code:
        raise HTTPException(status_code=400, detail="Ennek a tárgynak nincs QR kódja")
    
    # QR képek törlése
    qr_code = item.qr_code
    for size in ["small", "medium", "large"]:
        filename = f"label_{size}_{qr_code}.png"
        qr_handler.delete_qr_image(filename)
    
    # QR kód törlése az adatbázisból
    item.qr_code = None
    db.commit()
    
    return {"message": "QR kód törölve"}


@router.get("/low-stock", response_model=list[schemas.ItemResponse])
async def get_low_stock_items(db: Session = Depends(get_db)):
    """
    Alacsony készletű tárgyak listája
    """
    return crud.get_low_stock_items(db)
