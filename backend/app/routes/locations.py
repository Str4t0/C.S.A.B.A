"""
Location API routes
Backend Developer: Maria Rodriguez
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/locations", tags=["Locations"])


@router.get("", response_model=List[schemas.LocationResponse])
async def get_locations(db: Session = Depends(get_db)):
    """
    Összes helyszín lekérése
    """
    locations = crud.get_locations(db)
    return [
        {
            **loc.__dict__,
            "name": loc.name,
            "full_path": loc.full_path
        }
        for loc in locations
    ]


@router.get("/{location_id}", response_model=schemas.LocationResponse)
async def get_location(location_id: int, db: Session = Depends(get_db)):
    """
    Egy helyszín lekérése
    """
    location = crud.get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Helyszín nem található")
    
    return {
        **location.__dict__,
        "name": location.name,
        "full_path": location.full_path
    }


@router.post("", response_model=schemas.LocationResponse, status_code=201)
async def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    """
    Új helyszín létrehozása
    """
    new_location = crud.create_location(db, location)
    return {
        **new_location.__dict__,
        "name": new_location.name,
        "full_path": new_location.full_path
    }


@router.put("/{location_id}", response_model=schemas.LocationResponse)
async def update_location(
    location_id: int,
    location: schemas.LocationUpdate,
    db: Session = Depends(get_db)
):
    """
    Helyszín frissítése
    """
    updated_location = crud.update_location(db, location_id, location)
    if not updated_location:
        raise HTTPException(status_code=404, detail="Helyszín nem található")
    
    return {
        **updated_location.__dict__,
        "name": updated_location.name,
        "full_path": updated_location.full_path
    }


@router.delete("/{location_id}")
async def delete_location(location_id: int, db: Session = Depends(get_db)):
    """
    Helyszín törlése - a tárgyakból is eltávolítja a helyszínt
    """
    location = crud.get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Helyszín nem található")
    
    success = crud.delete_location(db, location_id)
    if not success:
        raise HTTPException(status_code=500, detail="Törlés sikertelen")
    
    return {"message": "Helyszín sikeresen törölve"}


@router.get("/{location_id}/items", response_model=List[schemas.ItemResponse])
async def get_location_items(
    location_id: int,
    db: Session = Depends(get_db)
):
    """
    Helyszín tárgyai
    """
    location = crud.get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Helyszín nem található")
    
    return crud.get_items_by_location(db, location_id)
