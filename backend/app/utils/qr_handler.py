"""
QR Kód generálás és kezelés
Backend Developer: Maria Rodriguez
"""

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from PIL import Image, ImageDraw, ImageFont
import io
import os
import uuid
from typing import Optional

QR_DIR = "qr_codes"


def create_qr_dir():
    """
    QR kód mappa létrehozása, ha nem létezik
    """
    if not os.path.exists(QR_DIR):
        os.makedirs(QR_DIR)
        print(f"✅ QR kód mappa létrehozva: {QR_DIR}")


def generate_qr_code_id() -> str:
    """
    Egyedi QR kód azonosító generálása
    """
    return f"ITM-{str(uuid.uuid4())[:8].upper()}"


def generate_qr_image(
    data: str,
    filename: str,
    size: int = 10,
    border: int = 2,
    add_label: bool = True,
    label_text: Optional[str] = None
) -> str:
    """
    QR kód kép generálása
    
    Args:
        data: QR kódba kódolandó adat (pl. item ID vagy URL)
        filename: Fájlnév mentéshez
        size: QR kód mérete (dobozok száma)
        border: Szegély mérete
        add_label: Címke hozzáadása a QR kód alá
        label_text: Címke szövege
    
    Returns:
        Mentett fájl neve
    """
    # QR kód létrehozása
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=size,
        border=border,
    )
    qr.add_data(data)
    qr.make(fit=True)

    # Kép generálása kerekített sarkokkal
    img = qr.make_image(
        fill_color="black",
        back_color="white",
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer()
    )

    # Ha címke kell, új képet készítünk címkével
    if add_label and label_text:
        # Eredeti QR kép mérete
        qr_width, qr_height = img.size
        
        # Új kép magasság számítása (QR + címke)
        label_height = 40
        total_height = qr_height + label_height
        
        # Új kép létrehozása
        new_img = Image.new('RGB', (qr_width, total_height), 'white')
        
        # QR kód beillesztése
        new_img.paste(img, (0, 0))
        
        # Címke rajzolása
        draw = ImageDraw.Draw(new_img)
        try:
            font = ImageFont.truetype("arial.ttf", 16)
        except:
            font = ImageFont.load_default()
        
        # Szöveg központosítása
        bbox = draw.textbbox((0, 0), label_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_x = (qr_width - text_width) // 2
        text_y = qr_height + 10
        
        draw.text((text_x, text_y), label_text, fill='black', font=font)
        
        img = new_img

    # Mentés
    create_qr_dir()
    file_path = os.path.join(QR_DIR, filename)
    img.save(file_path)
    
    return filename


def generate_printable_qr_label(
    item_name: str,
    item_id: int,
    qr_code_id: str,
    size: str = "small"  # small, medium, large
) -> str:
    """
    Nyomtatható QR címke generálása különböző méretekben
    
    Args:
        item_name: Tárgy neve
        item_id: Tárgy ID
        qr_code_id: QR kód azonosító
        size: Címke mérete (small: 3x3cm, medium: 5x5cm, large: 8x8cm)
    
    Returns:
        Mentett fájl neve
    """
    # Méret beállítások (pixel)
    size_config = {
        "small": {"box_size": 3, "width": 150, "height": 180},    # ~3x3.6cm @100dpi
        "medium": {"box_size": 5, "width": 250, "height": 300},   # ~5x6cm @100dpi
        "large": {"box_size": 8, "width": 400, "height": 480},    # ~8x9.6cm @100dpi
    }
    
    config = size_config.get(size, size_config["small"])
    
    # QR kód URL (backend URL + item ID)
    qr_data = f"ITEM-{item_id}-{qr_code_id}"
    
    # QR kód generálása
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=config["box_size"],
        border=1,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_width, qr_height = qr_img.size
    
    # Teljes címke kép létrehozása
    img_width = config["width"]
    img_height = config["height"]
    
    label_img = Image.new('RGB', (img_width, img_height), 'white')
    
    # QR kód központosítása
    qr_x = (img_width - qr_width) // 2
    qr_y = 20
    label_img.paste(qr_img, (qr_x, qr_y))
    
    # Szövegek hozzáadása
    draw = ImageDraw.Draw(label_img)
    
    # Font betöltése
    try:
        title_font = ImageFont.truetype("arial.ttf", 14 if size == "small" else 18)
        code_font = ImageFont.truetype("arial.ttf", 10 if size == "small" else 14)
    except:
        title_font = ImageFont.load_default()
        code_font = ImageFont.load_default()
    
    # Tárgy neve (max 25 karakter)
    truncated_name = item_name[:25] + "..." if len(item_name) > 25 else item_name
    
    # Szöveg pozíciók számítása
    name_y = qr_y + qr_height + 10
    code_y = name_y + 25
    
    # Név rajzolása (központosítva)
    name_bbox = draw.textbbox((0, 0), truncated_name, font=title_font)
    name_width = name_bbox[2] - name_bbox[0]
    name_x = (img_width - name_width) // 2
    draw.text((name_x, name_y), truncated_name, fill='black', font=title_font)
    
    # QR kód ID rajzolása (központosítva)
    code_bbox = draw.textbbox((0, 0), qr_code_id, font=code_font)
    code_width = code_bbox[2] - code_bbox[0]
    code_x = (img_width - code_width) // 2
    draw.text((code_x, code_y), qr_code_id, fill='gray', font=code_font)
    
    # Keret rajzolása
    draw.rectangle([(0, 0), (img_width-1, img_height-1)], outline='black', width=2)
    
    # Mentés
    create_qr_dir()
    filename = f"label_{size}_{qr_code_id}.png"
    file_path = os.path.join(QR_DIR, filename)
    label_img.save(file_path, dpi=(300, 300))  # Magas DPI nyomtatáshoz
    
    return filename


def get_qr_path(filename: str) -> str:
    """
    QR kép teljes elérési útja
    """
    return os.path.join(QR_DIR, filename)


def delete_qr_image(filename: str) -> bool:
    """
    QR kép törlése
    """
    try:
        file_path = get_qr_path(filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"❌ QR kép törlési hiba: {e}")
        return False
