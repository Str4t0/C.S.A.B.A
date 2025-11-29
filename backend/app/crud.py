"""
CRUD műveletek - JAVÍTOTT verzió
Backend Developer: Maria Rodriguez
JAVÍTVA: quantity mezők kezelése, jobb hibakezelés
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_
from . import models, schemas
from typing import List, Optional


# ============= ITEMS CRUD =============

def get_items(db: Session, skip: int = 0, limit: int = 100) -> List[models.Item]:
    """
    Összes item lekérése
    """
    return db.query(models.Item).offset(skip).limit(limit).all()


def get_item(db: Session, item_id: int) -> Optional[models.Item]:
    """
    Egy item lekérése ID alapján
    """
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def search_items(db: Session, query: str) -> List[models.Item]:
    """
    Keresés név vagy kategória alapján
    """
    search_pattern = f"%{query}%"
    return db.query(models.Item).filter(
        or_(
            models.Item.name.ilike(search_pattern),
            models.Item.category.ilike(search_pattern),
            models.Item.description.ilike(search_pattern)
        )
    ).all()


def get_items_by_category(db: Session, category: str) -> List[models.Item]:
    """
    Itemek lekérése kategória szerint
    """
    return db.query(models.Item).filter(models.Item.category == category).all()


def get_items_by_user(db: Session, user_id: int) -> List[models.Item]:
    """
    User tárgyai
    """
    return db.query(models.Item).filter(models.Item.user_id == user_id).all()


def get_items_by_location(db: Session, location_id: int, include_children: bool = False) -> List[models.Item]:
    """
    Helyszín tárgyai
    """
    if include_children:
        # TODO: rekurzív lekérdezés gyerek helyszínekhez
        pass
    
    return db.query(models.Item).filter(models.Item.location_id == location_id).all()


def create_item(db: Session, item: schemas.ItemCreate) -> models.Item:
    """
    Új item létrehozása - JAVÍTVA
    """
    # Adat előkészítés
    item_data = item.model_dump()
    
    # KRITIKUS: quantity alapértelmezett érték
    if "quantity" not in item_data or item_data["quantity"] is None:
        item_data["quantity"] = 1
    
    # Győződj meg róla hogy legalább 1
    if item_data["quantity"] < 1:
        item_data["quantity"] = 1
    
    # Hozd létre az item-et
    images = item_data.pop("images", []) or []

    db_item = models.Item(**item_data)

    for image in images:
        db_item.images.append(
            models.ItemImage(
                filename=image.filename,
                orientation=image.orientation
            )
        )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item


def update_item(db: Session, item_id: int, item_update: schemas.ItemUpdate) -> Optional[models.Item]:
    """
    Item frissítése - JAVÍTVA
    """
    db_item = get_item(db, item_id)
    if not db_item:
        return None
    
    # Csak a nem-None mezőket frissítjük
    update_data = item_update.model_dump(exclude_unset=True)
    
    # KRITIKUS: quantity validáció
    if "quantity" in update_data:
        if update_data["quantity"] is None or update_data["quantity"] < 1:
            update_data["quantity"] = 1
    
    images = update_data.pop("images", None)

    for field, value in update_data.items():
        setattr(db_item, field, value)

    if images is not None:
        db_item.images.clear()
        for image in images:
            db_item.images.append(
                models.ItemImage(
                    filename=image.filename,
                    orientation=image.orientation
                )
            )

    db.commit()
    db.refresh(db_item)
    
    return db_item


def delete_item(db: Session, item_id: int) -> bool:
    """
    Item törlése
    """
    db_item = get_item(db, item_id)
    if not db_item:
        return False
    
    db.delete(db_item)
    db.commit()
    return True


def get_low_stock_items(db: Session) -> List[models.Item]:
    """
    Alacsony készletű tárgyak - JAVÍTVA
    """
    return db.query(models.Item).filter(
        models.Item.min_quantity.isnot(None),
        models.Item.quantity <= models.Item.min_quantity
    ).all()


# ============= CATEGORIES CRUD =============

def get_categories(db: Session) -> List[models.Category]:
    """
    Összes kategória lekérése
    """
    return db.query(models.Category).all()


def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    """
    Egy kategória lekérése
    """
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def get_category_by_name(db: Session, name: str) -> Optional[models.Category]:
    """
    Kategória lekérése név alapján
    """
    return db.query(models.Category).filter(models.Category.name == name).first()


def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    """
    Új kategória létrehozása
    """
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def init_default_categories(db: Session):
    """
    Alapértelmezett kategóriák inicializálása
    """
    default_categories = [
        {"name": "Elektronika", "icon": "💻", "color": "#4A90E2"},
        {"name": "Bútorok", "icon": "🛋️", "color": "#8B4513"},
        {"name": "Konyhai eszközök", "icon": "🍳", "color": "#E67E22"},
        {"name": "Szerszámok", "icon": "🔧", "color": "#95A5A6"},
        {"name": "Ruházat", "icon": "👕", "color": "#E91E63"},
        {"name": "Könyvek", "icon": "📚", "color": "#9B59B6"},
        {"name": "Műszaki cikkek", "icon": "⚙️", "color": "#34495E"},
        {"name": "Egyéb", "icon": "📦", "color": "#7F8C8D"},
    ]
    
    for cat_data in default_categories:
        existing = get_category_by_name(db, cat_data["name"])
        if not existing:
            cat = schemas.CategoryCreate(**cat_data)
            create_category(db, cat)


# ============= USERS CRUD =============

def get_users(db: Session) -> List[models.User]:
    """
    Összes user lekérése
    """
    return db.query(models.User).filter(models.User.is_active == True).all()


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """
    Egy user lekérése ID alapján
    """
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """
    User lekérése username alapján
    """
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Új user létrehozása
    """
    db_user = models.User(
        username=user.username,
        display_name=user.display_name,
        email=user.email,
        avatar_color=user.avatar_color
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user: schemas.UserUpdate) -> Optional[models.User]:
    """
    User frissítése
    """
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    if user.display_name is not None:
        db_user.display_name = user.display_name
    if user.email is not None:
        db_user.email = user.email
    if user.avatar_color is not None:
        db_user.avatar_color = user.avatar_color
    if user.is_active is not None:
        db_user.is_active = user.is_active
    
    db.commit()
    db.refresh(db_user)
    return db_user


# ============= LOCATIONS CRUD =============

def get_locations(db: Session) -> List[models.Location]:
    """
    Összes helyszín lekérése
    """
    return db.query(models.Location).all()


def get_location(db: Session, location_id: int) -> Optional[models.Location]:
    """
    Egy helyszín lekérése ID alapján
    """
    return db.query(models.Location).filter(models.Location.id == location_id).first()


def get_root_locations(db: Session) -> List[models.Location]:
    """
    Gyökér helyszínek (nincs parent)
    """
    return db.query(models.Location).filter(models.Location.parent_id == None).all()


def get_child_locations(db: Session, parent_id: int) -> List[models.Location]:
    """
    Egy helyszín gyerekei
    """
    return db.query(models.Location).filter(models.Location.parent_id == parent_id).all()


def create_location(db: Session, location: schemas.LocationCreate) -> models.Location:
    """
    Új helyszín létrehozása
    """
    db_location = models.Location(
        name=location.name,
        description=location.description,
        parent_id=location.parent_id,
        icon=location.icon
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


def update_location(db: Session, location_id: int, location: schemas.LocationUpdate) -> Optional[models.Location]:
    """
    Helyszín frissítése
    """
    db_location = get_location(db, location_id)
    if not db_location:
        return None
    
    update_data = location.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_location, field, value)
    
    db.commit()
    db.refresh(db_location)
    return db_location


def delete_location(db: Session, location_id: int) -> bool:
    """
    Helyszín törlése
    """
    db_location = get_location(db, location_id)
    if not db_location:
        return False
    
    # Ellenőrizd hogy vannak-e gyerek helyszínek
    children = get_child_locations(db, location_id)
    if children:
        return False  # Nem törölhető ha van gyereke
    
    db.delete(db_location)
    db.commit()
    return True


# ============= DOCUMENTS CRUD =============

def get_document(db: Session, document_id: int) -> Optional[models.Document]:
    """
    Egy dokumentum lekérése ID alapján
    """
    return db.query(models.Document).filter(models.Document.id == document_id).first()


def get_documents_by_item(db: Session, item_id: int) -> List[models.Document]:
    """
    Egy tárgyhoz tartozó összes dokumentum lekérése
    """
    return db.query(models.Document).filter(models.Document.item_id == item_id).all()


def create_document(db: Session, document_data: dict) -> models.Document:
    """
    Új dokumentum létrehozása
    """
    db_document = models.Document(**document_data)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


def update_document(db: Session, document_id: int, document_type: Optional[str], description: Optional[str]) -> Optional[models.Document]:
    """
    Dokumentum frissítése
    """
    db_document = get_document(db, document_id)
    if not db_document:
        return None
    
    if document_type is not None:
        db_document.document_type = document_type
    if description is not None:
        db_document.description = description
    
    db.commit()
    db.refresh(db_document)
    return db_document


def delete_document(db: Session, document_id: int) -> bool:
    """
    Dokumentum törlése
    """
    db_document = get_document(db, document_id)
    if not db_document:
        return False
    
    db.delete(db_document)
    db.commit()
    return True
