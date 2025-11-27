"""
Értesítések és Statisztikák API routes - ÚJ FUNKCIÓK
Backend Developer: Maria Rodriguez
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import datetime, timedelta
import logging

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(tags=["Notifications & Stats"])
logger = logging.getLogger(__name__)


# ============= ÉRTESÍTÉSEK =============

@router.get("/api/notifications", response_model=List[Dict])
async def get_notifications(db: Session = Depends(get_db)):
    """
    Értesítések lekérése
    
    Típusok:
    - LOW_STOCK: Alacsony készlet riasztás
    - NO_IMAGE: Kép nélküli tárgyak
    - OLD_PURCHASE: Régen vásárolt tárgyak (1+ év)
    - NO_LOCATION: Helyszín nélküli tárgyak
    """
    logger.info("GET /api/notifications")
    
    try:
        notifications = []
        
        # 1. Alacsony készlet figyelmeztetések
        low_stock_items = crud.get_low_stock_items(db)
        for item in low_stock_items:
            notifications.append({
                "id": f"low_stock_{item.id}",
                "type": "LOW_STOCK",
                "severity": "warning",
                "title": "⚠️ Alacsony készlet",
                "message": f"{item.name}: {item.quantity} db / min. {item.min_quantity} db",
                "item_id": item.id,
                "item_name": item.name,
                "created_at": datetime.now().isoformat()
            })
        
        # 2. Kép nélküli tárgyak
        items_without_image = db.query(models.Item).filter(
            models.Item.image_filename == None
        ).all()
        
        if len(items_without_image) > 0:
            notifications.append({
                "id": "no_images",
                "type": "NO_IMAGE",
                "severity": "info",
                "title": "📸 Hiányzó képek",
                "message": f"{len(items_without_image)} tárgynak nincs képe",
                "count": len(items_without_image),
                "created_at": datetime.now().isoformat()
            })
        
        # 3. Helyszín nélküli tárgyak
        items_without_location = db.query(models.Item).filter(
            models.Item.location_id == None
        ).all()
        
        if len(items_without_location) > 0:
            notifications.append({
                "id": "no_location",
                "type": "NO_LOCATION",
                "severity": "info",
                "title": "📍 Helyszín nélküli tárgyak",
                "message": f"{len(items_without_location)} tárgynak nincs megadva helyszíne",
                "count": len(items_without_location),
                "created_at": datetime.now().isoformat()
            })
        
        # 4. Régen vásárolt tárgyak (1+ év)
        one_year_ago = datetime.now().date() - timedelta(days=365)
        old_items = db.query(models.Item).filter(
            models.Item.purchase_date != None,
            models.Item.purchase_date < one_year_ago
        ).all()
        
        if len(old_items) > 5:  # Csak ha legalább 5 ilyen van
            notifications.append({
                "id": "old_items",
                "type": "OLD_PURCHASE",
                "severity": "info",
                "title": "📅 Régi tárgyak",
                "message": f"{len(old_items)} tárgy több mint 1 éves",
                "count": len(old_items),
                "created_at": datetime.now().isoformat()
            })
        
        # Rendezés severity szerint (warning > info)
        notifications.sort(key=lambda x: (0 if x["severity"] == "warning" else 1))
        
        logger.info(f"✅ {len(notifications)} értesítés")
        
        return notifications
    
    except Exception as e:
        logger.error(f"❌ Értesítések lekérési hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= STATISZTIKÁK =============

@router.get("/api/stats/dashboard")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Dashboard statisztikák - részletes összesítő
    """
    logger.info("GET /api/stats/dashboard")
    
    try:
        # Alapadatok
        all_items = crud.get_items(db)
        all_categories = crud.get_categories(db)
        all_users = crud.get_users(db)
        all_locations = crud.get_locations(db)
        
        # Összes érték
        total_value = sum([item.purchase_price or 0 for item in all_items])
        
        # Kategóriák szerinti bontás
        items_by_category = {}
        value_by_category = {}
        for item in all_items:
            cat = item.category
            items_by_category[cat] = items_by_category.get(cat, 0) + 1
            value_by_category[cat] = value_by_category.get(cat, 0) + (item.purchase_price or 0)
        
        # Képekkel rendelkező tárgyak
        items_with_image = len([i for i in all_items if i.image_filename])
        
        # QR kóddal rendelkező tárgyak
        items_with_qr = len([i for i in all_items if i.qr_code])
        
        # Alacsony készlet
        low_stock = crud.get_low_stock_items(db)
        
        # Felhasználók szerinti bontás
        items_by_user = {}
        for user in all_users:
            user_items = crud.get_items_by_user(db, user.id)
            if len(user_items) > 0:
                items_by_user[user.display_name] = len(user_items)
        
        # Helyszínek szerinti bontás
        items_by_location = {}
        for location in all_locations:
            loc_items = crud.get_items_by_location(db, location.id)
            if len(loc_items) > 0:
                items_by_location[location.name] = len(loc_items)
        
        # Havi vásárlások (utolsó 12 hónap)
        monthly_purchases = {}
        for item in all_items:
            if item.purchase_date:
                month_key = item.purchase_date.strftime("%Y-%m")
                monthly_purchases[month_key] = monthly_purchases.get(month_key, 0) + 1
        
        # Top 5 legértékesebb tárgy
        top_items = sorted(
            [i for i in all_items if i.purchase_price],
            key=lambda x: x.purchase_price,
            reverse=True
        )[:5]
        
        top_items_data = [
            {
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "price": item.purchase_price,
                "image": item.image_filename
            }
            for item in top_items
        ]
        
        stats = {
            "overview": {
                "total_items": len(all_items),
                "total_categories": len(all_categories),
                "total_users": len(all_users),
                "total_locations": len(all_locations),
                "total_value": round(total_value, 2),
                "items_with_image": items_with_image,
                "items_with_qr": items_with_qr,
                "low_stock_count": len(low_stock)
            },
            "by_category": {
                "items": items_by_category,
                "values": {k: round(v, 2) for k, v in value_by_category.items()}
            },
            "by_user": items_by_user,
            "by_location": items_by_location,
            "monthly_purchases": monthly_purchases,
            "top_items": top_items_data,
            "completion": {
                "with_image": round((items_with_image / len(all_items) * 100) if all_items else 0, 1),
                "with_qr": round((items_with_qr / len(all_items) * 100) if all_items else 0, 1),
                "with_location": round((len([i for i in all_items if i.location_id]) / len(all_items) * 100) if all_items else 0, 1)
            }
        }
        
        logger.info(f"✅ Dashboard stats generálva")
        
        return stats
    
    except Exception as e:
        logger.error(f"❌ Stats hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/stats/summary")
async def get_stats_summary(db: Session = Depends(get_db)):
    """
    Egyszerű összesítő statisztikák (régi kompatibilitás)
    """
    logger.info("GET /api/stats/summary")
    
    try:
        all_items = crud.get_items(db)
        all_categories = crud.get_categories(db)
        
        total_value = sum([item.purchase_price or 0 for item in all_items])
        
        items_by_category = {}
        for item in all_items:
            cat = item.category
            items_by_category[cat] = items_by_category.get(cat, 0) + 1
        
        low_stock = crud.get_low_stock_items(db)
        
        return {
            "total_items": len(all_items),
            "total_categories": len(all_categories),
            "total_value": round(total_value, 2),
            "items_by_category": items_by_category,
            "low_stock_items": len(low_stock)
        }
    
    except Exception as e:
        logger.error(f"❌ Summary stats hiba: {e}")
        raise HTTPException(status_code=500, detail=str(e))
