"""
Pydantic sémák API request/response validációhoz
Backend Developer: Maria Rodriguez
"""

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import date, datetime


class ItemBase(BaseModel):
    """
    Alap Item séma
    """
    name: str = Field(..., min_length=1, max_length=200, description="Tárgy neve")
    category: str = Field(..., min_length=1, max_length=100, description="Kategória")
    description: Optional[str] = Field(None, description="Leírás")
    purchase_price: Optional[float] = Field(None, ge=0, description="Vásárlási ár")
    purchase_date: Optional[date] = Field(None, description="Vásárlás dátuma")
    quantity: int = Field(default=1, ge=0, description="Mennyiség")
    min_quantity: Optional[int] = Field(None, ge=0, description="Minimális készlet")
    user_id: Optional[int] = Field(None, description="Tulajdonos user ID")
    location_id: Optional[int] = Field(None, description="Helyszín ID")
    notes: Optional[str] = Field(None, description="Jegyzetek")
    image_filename: Optional[str] = Field(None, max_length=300, description="Kép fájlnév")

    # Engedjük a plusz mezőket (pl. location), hogy ne dobjon hibát a backend
    model_config = ConfigDict(extra="ignore")

    # ---------- Normalizáló validátorok blank stringekhez és típusokhoz ----------
    @field_validator(
        "description",
        "notes",
        "image_filename",
        mode="before",
    )
    def empty_string_to_none(cls, v):
        """Üres stringeket konvertáljunk None-ra az opcionális mezőknél."""
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

    @field_validator("purchase_price", "quantity", "min_quantity", mode="before")
    def numbers_from_strings(cls, v, info):
        """
        Űrlapokból érkező string számok (vagy üres stringek) normalizálása.

        - Üres string -> None (opcionális mezőknél)
        - Quantity üresen vagy hibásan -> 1 alapértelmezett
        - Vesszővel megadott ár -> ponttal parse-oljuk
        """
        if v is None:
            return v
        if isinstance(v, str):
            if v.strip() == "":
                return 1 if info.field_name == "quantity" else None
            v = v.replace(",", ".")
        try:
            if info.field_name in {"purchase_price"}:
                return float(v)
            # quantity / min_quantity
            return int(v)
        except (TypeError, ValueError):
            # Quantity esetén biztosítsunk nemnegatív alapértéket, különben hagyjuk a nyers értéket
            if info.field_name == "quantity":
                return 1
            return v

    @field_validator("purchase_date", mode="before")
    def date_from_string(cls, v):
        """
        Üres string -> None, ISO formátumú string -> date.
        """
        if v is None:
            return None
        if isinstance(v, str):
            stripped = v.strip()
            if stripped == "":
                return None
            try:
                return date.fromisoformat(stripped)
            except ValueError:
                return v
        return v

    @field_validator("user_id", "location_id", mode="before")
    def ids_from_strings(cls, v):
        """ID mezők esetén az üres string legyen None, a szám string konvertálódjon int-re."""
        if v is None:
            return None
        if isinstance(v, str):
            if v.strip() == "":
                return None
            try:
                return int(v)
            except ValueError:
                return v
        return v


class ItemCreate(ItemBase):
    """
    Item létrehozási séma
    """
    pass


class ItemUpdate(BaseModel):
    """
    Item frissítési séma - minden mező opcionális
    """
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    purchase_date: Optional[date] = None
    quantity: Optional[int] = Field(None, ge=0)
    min_quantity: Optional[int] = Field(None, ge=0)
    user_id: Optional[int] = None
    location_id: Optional[int] = None
    notes: Optional[str] = None
    image_filename: Optional[str] = Field(None, max_length=300)

    # Külső kliensek extra mezőit ignoráljuk (pl. location objektum)
    model_config = ConfigDict(extra="ignore")

    # Ugyanazok a normalizálások, mint az alap sémánál
    @field_validator(
        "description",
        "notes",
        "image_filename",
        mode="before",
    )
    def empty_string_to_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

    @field_validator("purchase_price", "quantity", "min_quantity", mode="before")
    def numbers_from_strings(cls, v, info):
        if v is None:
            return v
        if isinstance(v, str):
            if v.strip() == "":
                return 1 if info.field_name == "quantity" else None
            v = v.replace(",", ".")
        try:
            if info.field_name in {"purchase_price"}:
                return float(v)
            return int(v)
        except (TypeError, ValueError):
            if info.field_name == "quantity":
                return 1
            return v

    @field_validator("user_id", "location_id", mode="before")
    def ids_from_strings(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            if v.strip() == "":
                return None
            try:
                return int(v)
            except ValueError:
                return v
        return v

    @field_validator("purchase_date", mode="before")
    def date_from_string(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            stripped = v.strip()
            if stripped == "":
                return None
            try:
                return date.fromisoformat(stripped)
            except ValueError:
                return v
        return v


class ItemResponse(ItemBase):
    """
    Item response séma
    """
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    documents: List['DocumentResponse'] = []  # Forward reference

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    """
    Kategória alap séma
    """
    name: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=20)


class CategoryCreate(CategoryBase):
    """
    Kategória létrehozás
    """
    pass


class CategoryResponse(CategoryBase):
    """
    Kategória response
    """
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ImageUploadResponse(BaseModel):
    """
    Képfeltöltés response
    """
    filename: str
    original_filename: str
    size: int
    content_type: str
    url: str


class DocumentBase(BaseModel):
    """
    Dokumentum alap séma
    """
    document_type: Optional[str] = Field(None, max_length=50, description="Dokumentum típusa (garancia, számla, stb.)")
    description: Optional[str] = Field(None, description="Dokumentum leírása")


class DocumentCreate(DocumentBase):
    """
    Dokumentum létrehozás séma
    """
    item_id: int = Field(..., description="Tárgy ID")


class DocumentResponse(DocumentBase):
    """
    Dokumentum response séma
    """
    id: int
    item_id: int
    filename: str
    original_filename: str
    file_size: Optional[int] = None
    uploaded_at: datetime
    url: str  # Letöltési URL

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    """
    Dokumentum feltöltés response
    """
    id: int
    filename: str
    original_filename: str
    file_size: int
    url: str
    document_type: Optional[str] = None


class MessageResponse(BaseModel):
    """
    Általános üzenet response
    """
    message: str
    detail: Optional[str] = None


# ============= USER SCHEMAS =============

class UserBase(BaseModel):
    """
    User alap séma
    """
    username: str = Field(..., min_length=3, max_length=100)
    display_name: str = Field(..., min_length=1, max_length=200)
    email: Optional[str] = Field(None, max_length=200)
    avatar_color: str = Field(default="#3498db", max_length=20)


class UserCreate(UserBase):
    """
    User létrehozás
    """
    pass


class UserUpdate(BaseModel):
    """
    User frissítés - minden opcionális
    """
    display_name: Optional[str] = None
    email: Optional[str] = None
    avatar_color: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """
    User response
    """
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============= LOCATION SCHEMAS =============

class LocationBase(BaseModel):
    """
    Location alap séma
    """
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    icon: Optional[str] = Field(None, max_length=50)


class LocationCreate(LocationBase):
    """
    Location létrehozás
    """
    pass


class LocationUpdate(BaseModel):
    """
    Location frissítés
    """
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None
    icon: Optional[str] = None


class LocationResponse(LocationBase):
    """
    Location response
    """
    id: int
    created_at: datetime
    full_path: str  # Teljes elérési út

    class Config:
        from_attributes = True


# ============= QR CODE SCHEMAS =============

class QRCodeGenerate(BaseModel):
    """
    QR kód generálás request
    """
    item_id: int
    size: str = Field(default="medium", pattern="^(small|medium|large)$")


class QRCodeResponse(BaseModel):
    """
    QR kód response
    """
    qr_code_id: str
    qr_image_url: str
    printable_label_url: str


# Forward reference frissítése
ItemResponse.model_rebuild()
