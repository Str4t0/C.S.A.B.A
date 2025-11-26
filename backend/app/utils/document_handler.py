"""
Dokumentum feldolgozás és kezelés
Backend Developer: Maria Rodriguez
"""

import os
import uuid
from typing import Tuple

# Engedélyezett dokumentum formátumok
ALLOWED_DOCUMENT_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'txt', 
    'xls', 'xlsx', 'csv',
    'odt', 'ods', 'rtf'
}

MAX_DOCUMENT_SIZE = 20 * 1024 * 1024  # 20 MB
DOCUMENT_DIR = "documents"


def allowed_document(filename: str) -> bool:
    """
    Ellenőrzi, hogy a dokumentum kiterjesztése engedélyezett-e
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_DOCUMENT_EXTENSIONS


def generate_unique_document_filename(original_filename: str) -> str:
    """
    Egyedi dokumentum fájlnév generálása
    """
    extension = original_filename.rsplit('.', 1)[1].lower()
    unique_id = str(uuid.uuid4())
    # Eredeti fájlnév első 50 karaktere (biztonságos)
    safe_name = "".join(c for c in original_filename.rsplit('.', 1)[0] 
                       if c.isalnum() or c in (' ', '-', '_'))[:50]
    return f"{unique_id}_{safe_name}.{extension}"


def create_document_dir():
    """
    Dokumentum mappa létrehozása, ha nem létezik
    """
    if not os.path.exists(DOCUMENT_DIR):
        os.makedirs(DOCUMENT_DIR)
        print(f"✅ Dokumentum mappa létrehozva: {DOCUMENT_DIR}")


def get_document_path(filename: str) -> str:
    """
    Dokumentum teljes elérési útja
    """
    return os.path.join(DOCUMENT_DIR, filename)


def delete_document(filename: str) -> bool:
    """
    Dokumentum törlése
    """
    try:
        file_path = get_document_path(filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"✅ Dokumentum törölve: {filename}")
            return True
        return False
    except Exception as e:
        print(f"❌ Hiba dokumentum törlésekor: {e}")
        return False


def get_document_type(filename: str) -> str:
    """
    Dokumentum típus meghatározása kiterjesztés alapján
    """
    if '.' not in filename:
        return 'unknown'
    
    extension = filename.rsplit('.', 1)[1].lower()
    
    type_mapping = {
        'pdf': 'PDF',
        'doc': 'Word',
        'docx': 'Word',
        'txt': 'Szöveg',
        'xls': 'Excel',
        'xlsx': 'Excel',
        'csv': 'CSV',
        'odt': 'OpenDocument',
        'ods': 'OpenDocument',
        'rtf': 'RTF'
    }
    
    return type_mapping.get(extension, extension.upper())


def get_document_icon(filename: str) -> str:
    """
    Dokumentum ikon emoji visszaadása típus alapján
    """
    if '.' not in filename:
        return '📄'
    
    extension = filename.rsplit('.', 1)[1].lower()
    
    icon_mapping = {
        'pdf': '📕',
        'doc': '📘',
        'docx': '📘',
        'txt': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'csv': '📊',
        'odt': '📄',
        'ods': '📄',
        'rtf': '📄'
    }
    
    return icon_mapping.get(extension, '📄')


def format_file_size(size_bytes: int) -> str:
    """
    Fájl méret formázása emberileg olvasható formába
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"
