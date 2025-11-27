"""
Dokumentum kezelés utils - TELJES JAVÍTOTT VERZIÓ
Backend Developer: Maria Rodriguez
"""

import os
import uuid
from fastapi import UploadFile
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Konstansok
DOCUMENT_DIR = "documents"
MAX_DOCUMENT_SIZE = 20 * 1024 * 1024  # 20MB

# Engedélyezett MIME típusok
ALLOWED_MIME_TYPES = {
    # PDF
    "application/pdf": ".pdf",
    
    # Word dokumentumok
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    
    # Excel táblázatok
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    
    # Szöveges fájlok
    "text/plain": ".txt",
    "text/csv": ".csv",
    
    # Képek (garanciák, számlák fotói)
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

# Fájl kiterjesztések
ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", 
    ".txt", ".csv", ".jpg", ".jpeg", ".png", ".webp"
}


def create_document_dir():
    """
    Dokumentum könyvtár létrehozása
    """
    os.makedirs(DOCUMENT_DIR, exist_ok=True)
    logger.info(f"✅ Dokumentum könyvtár létrehozva: {DOCUMENT_DIR}")


def generate_document_filename(original_filename: str) -> str:
    """
    Egyedi dokumentum fájlnév generálása
    """
    ext = os.path.splitext(original_filename)[1].lower()
    unique_id = uuid.uuid4().hex[:12]
    return f"doc_{unique_id}{ext}"


def validate_document_file(file: UploadFile) -> None:
    """
    Dokumentum validáció
    
    Raises:
        ValueError: Ha a fájl nem megfelelő
    """
    # MIME típus ellenőrzés
    if file.content_type not in ALLOWED_MIME_TYPES:
        allowed = ", ".join([ALLOWED_MIME_TYPES[m] for m in ALLOWED_MIME_TYPES.keys()])
        raise ValueError(
            f"Nem támogatott fájl típus: {file.content_type}. "
            f"Engedélyezett: {allowed}"
        )
    
    # Fájl kiterjesztés ellenőrzés
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Nem támogatott fájl kiterjesztés: {ext}. "
            f"Engedélyezett: {', '.join(ALLOWED_EXTENSIONS)}"
        )


async def save_document(
    file: UploadFile,
    item_id: int,
    document_type: Optional[str] = None,
    description: Optional[str] = None
) -> Dict:
    """
    Dokumentum mentése
    
    Args:
        file: Feltöltött fájl
        item_id: Tárgy ID
        document_type: Dokumentum típus (pl: "garancia", "számla")
        description: Leírás
        
    Returns:
        Dict: Dokumentum információk
        
    Raises:
        ValueError: Validációs hiba esetén
    """
    logger.info(f"📄 Dokumentum feltöltés: {file.filename} (item_id={item_id})")
    
    try:
        # Validáció
        validate_document_file(file)
        
        # Fájl olvasása
        content = await file.read()
        file_size = len(content)
        
        # Méret ellenőrzés
        if file_size > MAX_DOCUMENT_SIZE:
            raise ValueError(
                f"A fájl túl nagy! Maximum {MAX_DOCUMENT_SIZE / 1024 / 1024:.0f}MB méretű lehet. "
                f"Jelenlegi: {file_size / 1024 / 1024:.1f}MB"
            )
        
        # Egyedi fájlnév
        new_filename = generate_document_filename(file.filename)
        file_path = os.path.join(DOCUMENT_DIR, new_filename)
        
        # Mentés
        logger.info(f"   Mentés: {file_path}")
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        logger.info(f"✅ Dokumentum mentve: {new_filename} ({file_size / 1024:.1f} KB)")
        
        return {
            "item_id": item_id,
            "filename": new_filename,
            "original_filename": file.filename,
            "file_size": file_size,
            "mime_type": file.content_type,
            "document_type": document_type,
            "description": description
        }
    
    except ValueError as e:
        logger.error(f"❌ Validációs hiba: {e}")
        raise
    
    except Exception as e:
        logger.error(f"❌ Dokumentum mentési hiba: {e}")
        raise ValueError(f"Dokumentum feltöltési hiba: {str(e)}")


def delete_document(filename: str) -> None:
    """
    Dokumentum törlése
    
    Args:
        filename: Fájlnév
        
    Raises:
        FileNotFoundError: Ha a fájl nem létezik
    """
    logger.info(f"🗑️  Dokumentum törlése: {filename}")
    
    file_path = os.path.join(DOCUMENT_DIR, filename)
    
    if os.path.exists(file_path):
        os.remove(file_path)
        logger.info(f"   ✅ Dokumentum törölve: {file_path}")
    else:
        logger.warning(f"   ⚠️  Dokumentum nem található: {file_path}")
        raise FileNotFoundError(f"Dokumentum nem található: {filename}")


def get_document_path(filename: str) -> str:
    """
    Dokumentum teljes elérési útja
    """
    return os.path.join(DOCUMENT_DIR, filename)
