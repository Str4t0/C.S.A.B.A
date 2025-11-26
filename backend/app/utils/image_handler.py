"""
Képfeldolgozás és kezelés
Backend Developer: Maria Rodriguez
"""

import os
import uuid
from typing import Tuple
from PIL import Image
import io

# Engedélyezett képformátumok
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB (mobilhoz növelve)
UPLOAD_DIR = "uploads"
THUMBNAIL_SIZE = (300, 300)
MAX_IMAGE_SIZE = (1920, 1920)


def allowed_file(filename: str) -> bool:
    """
    Ellenőrzi, hogy a fájl kiterjesztése engedélyezett-e
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def generate_unique_filename(original_filename: str) -> str:
    """
    Egyedi fájlnév generálása
    """
    ext = original_filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return unique_name


def create_upload_dir():
    """
    Upload könyvtár létrehozása, ha nem létezik
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_DIR, "thumbnails"), exist_ok=True)


def optimize_image(image_data: bytes, max_size: Tuple[int, int] = MAX_IMAGE_SIZE) -> bytes:
    """
    Kép optimalizálás - méret csökkentés és tömörítés
    
    Args:
        image_data: Eredeti kép bytes
        max_size: Maximum méret (szélesség, magasság)
    
    Returns:
        Optimalizált kép bytes
    """
    img = Image.open(io.BytesIO(image_data))
    
    # RGBA -> RGB konverzió ha szükséges (JPEG miatt)
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    
    # Méret csökkentés ha szükséges
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    # Mentés optimalizált formában
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=85, optimize=True)
    return output.getvalue()


def create_thumbnail(image_data: bytes, size: Tuple[int, int] = THUMBNAIL_SIZE) -> bytes:
    """
    Thumbnail (kicsinyített kép) létrehozása
    
    Args:
        image_data: Eredeti kép bytes
        size: Thumbnail méret
    
    Returns:
        Thumbnail bytes
    """
    img = Image.open(io.BytesIO(image_data))
    
    # RGBA -> RGB konverzió
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    
    # Thumbnail létrehozás (középre igazítva)
    img.thumbnail(size, Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=80)
    return output.getvalue()


def save_image(image_data: bytes, filename: str) -> Tuple[str, str]:
    """
    Kép és thumbnail mentése
    
    Args:
        image_data: Kép bytes
        filename: Fájlnév
    
    Returns:
        (fő_kép_útvonal, thumbnail_útvonal)
    """
    create_upload_dir()
    
    # Kép optimalizálás
    optimized_image = optimize_image(image_data)
    
    # Fő kép mentése
    main_path = os.path.join(UPLOAD_DIR, filename)
    with open(main_path, 'wb') as f:
        f.write(optimized_image)
    
    # Thumbnail létrehozása és mentése
    thumbnail_data = create_thumbnail(image_data)
    thumbnail_filename = f"thumb_{filename}"
    thumbnail_path = os.path.join(UPLOAD_DIR, "thumbnails", thumbnail_filename)
    with open(thumbnail_path, 'wb') as f:
        f.write(thumbnail_data)
    
    return main_path, thumbnail_path


def delete_image(filename: str) -> bool:
    """
    Kép és thumbnail törlése
    
    Args:
        filename: Fájlnév
    
    Returns:
        True ha sikeres
    """
    try:
        # Fő kép törlése
        main_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(main_path):
            os.remove(main_path)
        
        # Thumbnail törlése
        thumbnail_filename = f"thumb_{filename}"
        thumbnail_path = os.path.join(UPLOAD_DIR, "thumbnails", thumbnail_filename)
        if os.path.exists(thumbnail_path):
            os.remove(thumbnail_path)
        
        return True
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False


def get_image_info(image_data: bytes) -> dict:
    """
    Kép információk lekérése
    
    Args:
        image_data: Kép bytes
    
    Returns:
        Dict kép információkkal
    """
    img = Image.open(io.BytesIO(image_data))
    return {
        "width": img.width,
        "height": img.height,
        "format": img.format,
        "mode": img.mode,
        "size_bytes": len(image_data)
    }
