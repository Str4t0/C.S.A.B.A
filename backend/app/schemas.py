"""
Pydantic sémák - API request/response validáció
Backend Developer: Maria Rodriguez
JAVÍTVA: quantity és min_quantity mezők hozzáadva
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime


# ============= ITEM SCHEMAS =============


class ItemImageBase(BaseModel):
    """Kép adatok tárgyhoz."""

    filename: str
    orientation: Optional[str] = None  # portrait | landscape | square


class ItemImageCreate(ItemImageBase):
    pass


class ItemImageResponse(ItemImageBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ItemBase(BaseModel):
    """Item alap séma"""
    name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    purchase_date: Optional[date] = None
    notes: Optional[str] = None
    image_filename: Optional[str] = None
    images: Optional[List[ItemImageCreate]] = []
    user_id: Optional[int] = None
    location_id: Optional[int] = None
    quantity: int = Field(default=1, ge=1)  # JAVÍTVA: kötelező, min 1
    min_quantity: Optional[int] = Field(None, ge=1)  # JAVÍTVA: minimum készlet


class ItemCreate(ItemBase):
    """Új item létrehozása"""
    pass


class ItemUpdate(BaseModel):
    """Item frissítése - minden mező opcionális"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    purchase_date: Optional[date] = None
    notes: Optional[str] = None
    image_filename: Optional[str] = None
    images: Optional[List[ItemImageCreate]] = None
    user_id: Optional[int] = None
    location_id: Optional[int] = None
    quantity: Optional[int] = Field(None, ge=1)  # JAVÍTVA
    min_quantity: Optional[int] = Field(None, ge=0)  # JAVÍTVA


class ItemResponse(ItemBase):
    """Item válasz adatok"""
    id: int
    created_at: datetime
    updated_at: datetime
    qr_code: Optional[str] = None
    images: List[ItemImageResponse] = []
    documents: List["DocumentResponse"] = []

    model_config = ConfigDict(from_attributes=True)


# ============= CATEGORY SCHEMAS =============

class CategoryBase(BaseModel):
    """Kategória alap séma"""
    name: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=20)


class CategoryCreate(CategoryBase):
    """Új kategória létrehozása"""
    pass


class CategoryResponse(CategoryBase):
    """Kategória válasz"""
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= USER SCHEMAS =============

class UserBase(BaseModel):
    """User alap séma"""
    username: str = Field(..., min_length=3, max_length=100)
    first_name: str = Field(..., min_length=1, max_length=100)  # Keresztnév
    last_name: str = Field(..., min_length=1, max_length=100)   # Családnév
    email: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=50)           # Telefonszám
    avatar_color: str = Field(default="#3498db", max_length=20)


class UserCreate(UserBase):
    """Új user létrehozása"""
    pass


class UserUpdate(BaseModel):
    """User frissítése"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=50)
    avatar_color: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """User válasz"""
    id: int
    display_name: str  # Computed property
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= LOCATION SCHEMAS =============

class LocationBase(BaseModel):
    """Helyszín alap séma"""
    country: str = Field(default="Magyarország", max_length=100)  # Ország
    postal_code: Optional[str] = Field(None, max_length=20)       # Irányítószám
    city: str = Field(..., min_length=1, max_length=100)          # Helység
    address: Optional[str] = Field(None, max_length=300)          # Lakcím
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)


class LocationCreate(LocationBase):
    """Új helyszín létrehozása"""
    pass


class LocationUpdate(BaseModel):
    """Helyszín frissítése"""
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)


class LocationResponse(LocationBase):
    """Helyszín válasz"""
    id: int
    name: str       # Computed property (city + address)
    full_path: str  # Computed property (teljes cím)
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= DOCUMENT SCHEMAS =============

class DocumentBase(BaseModel):
    """Dokumentum alap séma"""
    document_type: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None


class DocumentCreate(DocumentBase):
    """Új dokumentum létrehozása"""
    item_id: int


class DocumentUpdate(BaseModel):
    """Dokumentum frissítése"""
    document_type: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None


class DocumentResponse(DocumentBase):
    """Dokumentum válasz"""
    id: int
    item_id: int
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============= QR CODE SCHEMAS =============

class QRCodeResponse(BaseModel):
    """QR kód válasz"""
    item_id: int
    qr_code: str
    qr_url: str
    size: str


# ============= STATISTICS SCHEMAS =============

class StatsResponse(BaseModel):
    """Statisztikák válasz"""
    total_items: int
    total_categories: int
    total_value: float
    items_by_category: dict
    low_stock_items: int = 0  # JAVÍTVA: alapértelmezett érték


class UserStatsResponse(BaseModel):
    """User statisztikák"""
    user_id: int
    total_items: int
    total_value: float
    items_by_category: dict


# ============= IMAGE UPLOAD SCHEMAS =============

class ImageUploadResponse(BaseModel):
    """Kép feltöltés válasz"""
    filename: str
    original_filename: str
    size: int
    content_type: str
    url: str
