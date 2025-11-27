"""
QR kód kezelés utils - TELJES JAVÍTOTT VERZIÓ
Backend Developer: Maria Rodriguez
"""

import os
import qrcode
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)

# Konstansok
QR_DIR = "qr_codes"

# QR kód méretek (cm-ben és pixelben)
QR_SIZES = {
    "small": {"cm": 3, "pixels": 354, "box_size": 10, "border": 2},   # 3x3 cm (300 DPI)
    "medium": {"cm": 5, "pixels": 591, "box_size": 15, "border": 2},  # 5x5 cm (300 DPI)
    "large": {"cm": 8, "pixels": 945, "box_size": 25, "border": 2}    # 8x8 cm (300 DPI)
}


def create_qr_dir():
    """
    QR kód könyvtár létrehozása
    """
    os.makedirs(QR_DIR, exist_ok=True)
    logger.info(f"✅ QR könyvtár létrehozva: {QR_DIR}")


def get_qr_filename(item_id: int, size: str) -> str:
    """
    QR fájlnév generálása
    """
    return f"item_{item_id}_qr_{size}.png"


def get_qr_path(item_id: int, size: str) -> str:
    """
    QR fájl teljes útvonala
    """
    filename = get_qr_filename(item_id, size)
    return os.path.join(QR_DIR, filename)


def generate_qr_code(item_id: int, qr_code_str: str, size: str = "medium") -> Dict:
    """
    QR kód generálása egy tárgyhoz
    
    Args:
        item_id: Tárgy ID
        qr_code_str: QR kód string (pl: "ITM-ABC123")
        size: Méret (small, medium, large)
        
    Returns:
        Dict: QR kód információk
        
    Raises:
        ValueError: Ha érvénytelen méret
    """
    logger.info(f"🔲 QR kód generálás: item_id={item_id}, qr={qr_code_str}, size={size}")
    
    if size not in QR_SIZES:
        raise ValueError(f"Érvénytelen méret: {size}. Lehetséges: {', '.join(QR_SIZES.keys())}")
    
    try:
        # QR kód paraméterek
        qr_config = QR_SIZES[size]
        
        # QR objektum létrehozása
        qr = qrcode.QRCode(
            version=None,  # Automatikus méret
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # Magas hibajavítás (30%)
            box_size=qr_config["box_size"],
            border=qr_config["border"],
        )
        
        # Adat hozzáadása
        qr.add_data(qr_code_str)
        qr.make(fit=True)
        
        # Kép generálása
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Mentés
        qr_path = get_qr_path(item_id, size)
        img.save(qr_path)
        
        # Fájl méret
        file_size = os.path.getsize(qr_path)
        
        logger.info(f"✅ QR kód generálva: {qr_path} ({file_size / 1024:.1f} KB)")
        
        return {
            "item_id": item_id,
            "qr_code": qr_code_str,
            "size": size,
            "size_cm": qr_config["cm"],
            "filename": get_qr_filename(item_id, size),
            "path": qr_path,
            "file_size": file_size,
            "url": f"/qr_codes/{get_qr_filename(item_id, size)}"
        }
    
    except Exception as e:
        logger.error(f"❌ QR generálási hiba: {e}")
        raise ValueError(f"QR kód generálási hiba: {str(e)}")


def generate_all_sizes(item_id: int, qr_code_str: str) -> Dict[str, Dict]:
    """
    Mind a 3 méretű QR kód generálása
    
    Args:
        item_id: Tárgy ID
        qr_code_str: QR kód string
        
    Returns:
        Dict: Minden méret információi
    """
    logger.info(f"🔲 Mind a 3 QR méret generálása: item_id={item_id}")
    
    results = {}
    
    for size in ["small", "medium", "large"]:
        try:
            results[size] = generate_qr_code(item_id, qr_code_str, size)
        except Exception as e:
            logger.error(f"❌ Hiba {size} QR generálásakor: {e}")
            results[size] = {"error": str(e)}
    
    logger.info(f"✅ {len(results)} QR kód generálva")
    
    return results


def delete_qr_files(item_id: int) -> int:
    """
    Összes QR kód fájl törlése egy tárgyhoz
    
    Args:
        item_id: Tárgy ID
        
    Returns:
        int: Törölt fájlok száma
    """
    logger.info(f"🗑️  QR fájlok törlése: item_id={item_id}")
    
    deleted = 0
    
    for size in ["small", "medium", "large"]:
        qr_path = get_qr_path(item_id, size)
        
        if os.path.exists(qr_path):
            os.remove(qr_path)
            deleted += 1
            logger.info(f"   ✅ Törölve: {qr_path}")
        else:
            logger.debug(f"   ℹ️  Nem létezik: {qr_path}")
    
    logger.info(f"✅ {deleted} QR fájl törölve")
    
    return deleted


def qr_file_exists(item_id: int, size: str) -> bool:
    """
    Ellenőrzi hogy létezik-e már QR fájl
    """
    qr_path = get_qr_path(item_id, size)
    return os.path.exists(qr_path)
