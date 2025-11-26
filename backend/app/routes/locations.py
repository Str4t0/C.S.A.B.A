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
            "full_path": loc.full_path
        }
        for loc in locations
    ]


@router.get("/roots", response_model=List[schemas.LocationResponse])
async def get_root_locations(db: Session = Depends(get_db)):
    """
    Gyökér helyszínek (nincs parent)
    """
    locations = crud.get_root_locations(db)
    return [
        {
            **loc.__dict__,
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
        "full_path": location.full_path
    }


@router.get("/{location_id}/children", response_model=List[schemas.LocationResponse])
async def get_child_locations(location_id: int, db: Session = Depends(get_db)):
    """
    Egy helyszín gyerekei
    """
    location = crud.get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Helyszín nem található")
    
    children = crud.get_child_locations(db, location_id)
    return [
        {
            **loc.__dict__,
            "full_path": loc.full_path
        }
        for loc in children
    ]


@router.post("", response_model=schemas.LocationResponse, status_code=201)
async def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    """
    Új helyszín létrehozása
    """
    # Parent létezésének ellenőrzése
    if location.parent_id:
        parent = crud.get_location(db, location.parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Szülő helyszín nem található")
    
    new_location = crud.create_location(db, location)
    return {
        **new_location.__dict__,
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
    # Parent létezésének ellenőrzése
    if location.parent_id:
        parent = crud.get_location(db, location.parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Szülő helyszín nem található")
        
        # Circular reference ellenőrzés
        if location.parent_id == location_id:
            raise HTTPException(status_code=400, detail="Egy helyszín nem lehet a saját szülője")
    
    updated_location = crud.update_location(db, location_id, location)
    if not updated_location:
        raise HTTPException(status_code=404, detail="Helyszín nem található")
    
    return {
        **updated_location.__dict__,
        "full_path": updated_location.full_path
    }


@router.delete("/{location_id}")
async def delete_location(location_id: int, db: Session = Depends(get_db)):
    """
    Helyszín törlése
    """
    # Gyerekek ellenőrzése
    children = crud.get_child_locations(db, location_id)
    if children:
        raise HTTPException(
            status_code=400,
            detail="Ez a helyszín nem törölhető, mert vannak al-helyszínei"
        )
    
    # Tárgyak ellenőrzése
    items = crud.get_items_by_location(db, location_id)
    if items:
        raise HTTPException(
            status_code=400,
            detail=f"Ez a helyszín nem törölhető, mert {len(items)} tárgy tartozik hozzá"
        )
    
    success = crud.delete_location(db, location_id)
    if not success:
        raise HTTPException(status_code=404, detail="Helyszín nem található")
    
    return {"message": "Helyszín sikeresen törölve"}


@router.get("/{location_id}/items", response_model=List[schemas.ItemResponse])
async def get_location_items(
    location_id: int,
    include_children: bool = False,
    db: Session = Depends(get_db)
):
    """
    Helyszín tárgyai (opcionálisan al-helyszínekkel együtt)
    """
    location = crud.get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Helyszín nem található")
    
    return crud.get_items_by_location(db, location_id, include_children)
