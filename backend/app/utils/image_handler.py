"""
Kép kezelés utils - TELJES JAVÍTOTT VERZIÓ
Backend Developer: Maria Rodriguez
"""

import os
import uuid
import shutil
import asyncio
from PIL import Image
from fastapi import UploadFile
from typing import Dict
import logging

logger = logging.getLogger(__name__)

# Konstansok
UPLOAD_DIR = "uploads"
THUMBNAIL_DIR = os.path.join(UPLOAD_DIR, "thumbnails")
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_DIMENSION = 1920
THUMBNAIL_SIZE = (300, 300)


def create_upload_dir():
    """
    Upload könyvtárak létrehozása
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(THUMBNAIL_DIR, exist_ok=True)
    logger.info(f"✅ Upload könyvtárak létrehozva: {UPLOAD_DIR}")


def get_image_path(filename: str) -> str:
    """
    Teljes elérési út egy képhez
    """
    return os.path.join(UPLOAD_DIR, filename)


def get_thumbnail_path(filename: str) -> str:
    """
    Thumbnail elérési útja
    """
    thumb_filename = f"thumb_{filename}"
    return os.path.join(THUMBNAIL_DIR, thumb_filename)


def generate_unique_filename(original_filename: str) -> str:
    """
    Egyedi fájlnév generálása
    """
    ext = os.path.splitext(original_filename)[1].lower()
    unique_id = uuid.uuid4().hex[:12]
    return f"{unique_id}{ext}"


def validate_image_file(file: UploadFile) -> None:
    """
    Kép validáció
    
    Raises:
        ValueError: Ha a fájl nem megfelelő
    """
    # Fájl típus ellenőrzés
    if not file.content_type or not file.content_type.startswith('image/'):
        raise ValueError(f"Nem támogatott fájl típus: {file.content_type}. Csak képek engedélyezettek (JPG, PNG, WebP, GIF).")
    
    # Fájl kiterjesztés ellenőrzés
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Nem támogatott fájl kiterjesztés: {ext}. Engedélyezett: {', '.join(ALLOWED_EXTENSIONS)}")


async def save_uploaded_file(file: UploadFile) -> Dict:
    """
    Feltöltött kép mentése és feldolgozása

    A PIL-es képfeldolgozás blokkoló műveleteit külön thread-ben futtatjuk,
    így elkerüljük az "event loop is already running" típusú hibákat és a
    runtime warningokat.
    """

    logger.info(f"📸 Kép feltöltés: {file.filename} ({file.content_type})")

    try:
        validate_image_file(file)

        new_filename = generate_unique_filename(file.filename)
        file_path = get_image_path(new_filename)
        temp_path = f"{file_path}.tmp"

        logger.info(f"   Mentés: {temp_path}")

        content = await file.read()
        file_size = len(content)

        if file_size > MAX_IMAGE_SIZE:
            raise ValueError(
                f"A fájl túl nagy! Maximum {MAX_IMAGE_SIZE / 1024 / 1024:.1f}MB méretű lehet. Jelenlegi: {file_size / 1024 / 1024:.1f}MB"
            )

        def _process_image():
            # Mentés temp fájlba
            with open(temp_path, "wb") as f:
                f.write(content)

            logger.info("   Feldolgozás...")

            orientation = None
            original_size = (0, 0)

            try:
                with Image.open(temp_path) as img:
                    original_size = img.size
                    if img.width > img.height:
                        orientation = "landscape"
                    elif img.height > img.width:
                        orientation = "portrait"
                    else:
                        orientation = "square"

                    if img.mode in ('RGBA', 'LA', 'P'):
                        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                        img = rgb_img

                    if img.width > MAX_DIMENSION or img.height > MAX_DIMENSION:
                        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)
                        logger.info(f"   Átméretezve: {img.size}")

                    img.save(file_path, 'JPEG', quality=85, optimize=True)
                    logger.info(f"   ✅ Kép mentve: {file_path}")

                    img.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
                    thumb_path = get_thumbnail_path(new_filename)
                    img.save(thumb_path, 'JPEG', quality=80)
                    logger.info(f"   ✅ Thumbnail mentve: {thumb_path}")

            except Exception as e:
                logger.error(f"   ❌ PIL hiba: {e}")
                shutil.copy(temp_path, file_path)
                logger.warning("   ⚠️  Kép feldolgozás kihagyva, eredeti mentve")

            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

            return os.path.getsize(file_path), orientation, original_size

        final_size, orientation, original_size = await asyncio.to_thread(_process_image)

        logger.info(f"✅ Kép feltöltve: {new_filename} ({final_size / 1024:.1f} KB)")

        return {
            "filename": new_filename,
            "original_filename": file.filename,
            "size": final_size,
            "content_type": "image/jpeg",
            "url": f"/uploads/{new_filename}",
            "orientation": orientation,
            "width": original_size[0],
            "height": original_size[1]
        }

    except ValueError as e:
        logger.error(f"❌ Validációs hiba: {e}")
        raise

    except Exception as e:
        logger.error(f"❌ Általános hiba: {e}")
        raise ValueError(f"Kép feltöltési hiba: {str(e)}")


def delete_image(filename: str) -> None:
    """
    Kép és thumbnail törlése
    
    Args:
        filename: Fájlnév
        
    Raises:
        FileNotFoundError: Ha a fájl nem létezik
    """
    logger.info(f"🗑️  Kép törlése: {filename}")
    
    # Fő kép
    image_path = get_image_path(filename)
    if os.path.exists(image_path):
        os.remove(image_path)
        logger.info(f"   ✅ Kép törölve: {image_path}")
    else:
        logger.warning(f"   ⚠️  Kép nem található: {image_path}")
        raise FileNotFoundError(f"Kép nem található: {filename}")
    
    # Thumbnail
    thumb_path = get_thumbnail_path(filename)
    if os.path.exists(thumb_path):
        os.remove(thumb_path)
        logger.info(f"   ✅ Thumbnail törölve: {thumb_path}")
    else:
        logger.warning(f"   ⚠️  Thumbnail nem található: {thumb_path}")
