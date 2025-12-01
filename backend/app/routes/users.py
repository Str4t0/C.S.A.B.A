"""
User API routes
Backend Developer: Maria Rodriguez
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("", response_model=List[schemas.UserResponse])
async def get_users(db: Session = Depends(get_db)):
    """
    Összes felhasználó lekérése
    """
    return crud.get_users(db)


@router.get("/{user_id}", response_model=schemas.UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Egy felhasználó lekérése
    """
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    return user


@router.post("", response_model=schemas.UserResponse, status_code=201)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Új felhasználó létrehozása
    """
    # Username egyediség ellenőrzése
    existing = crud.get_user_by_username(db, user.username)
    if existing:
        raise HTTPException(status_code=400, detail="Ez a felhasználónév már létezik")
    
    return crud.create_user(db, user)


@router.put("/{user_id}", response_model=schemas.UserResponse)
async def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    """
    Felhasználó frissítése
    """
    updated_user = crud.update_user(db, user_id, user)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    return updated_user


@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Felhasználó törlése
    """
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    
    result = crud.delete_user(db, user_id)
    if not result:
        raise HTTPException(status_code=500, detail="Törlés sikertelen")
    
    return {"message": "Felhasználó sikeresen törölve", "id": user_id}


@router.get("/{user_id}/items", response_model=List[schemas.ItemResponse])
async def get_user_items(user_id: int, db: Session = Depends(get_db)):
    """
    Felhasználó összes tárgyának lekérése
    """
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    
    return crud.get_items_by_user(db, user_id)


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """
    Felhasználó statisztikái
    """
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    
    items = crud.get_items_by_user(db, user_id)
    
    total_value = sum(item.purchase_price or 0 for item in items)
    total_documents = sum(len(item.documents) for item in items)
    
    category_counts = {}
    for item in items:
        category_counts[item.category] = category_counts.get(item.category, 0) + 1
    
    return {
        "user_id": user_id,
        "username": user.username,
        "display_name": user.display_name,
        "total_items": len(items),
        "total_value": round(total_value, 2),
        "total_documents": total_documents,
        "items_by_category": category_counts,
        "items_with_images": sum(1 for item in items if item.image_filename),
        "low_stock_items": sum(1 for item in items if item.is_low_stock)
    }
