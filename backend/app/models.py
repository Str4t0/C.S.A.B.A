"""
SQLAlchemy adatbázis modellek - JAVÍTOTT verzió
Backend Developer: Maria Rodriguez
JAVÍTVA: quantity és min_quantity mezők hozzáadva
"""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    """
    Felhasználó model
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)  # Keresztnév
    last_name = Column(String(100), nullable=False)   # Családnév
    email = Column(String(200), unique=True, nullable=True)
    phone = Column(String(50), nullable=True)         # Telefonszám
    avatar_color = Column(String(20), default="#3498db")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Kapcsolat item-ekhez
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")

    @property
    def display_name(self):
        """Teljes név (Családnév Keresztnév)"""
        return f"{self.last_name} {self.first_name}"

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"


class Location(Base):
    """
    Helyszín/Cím model - lakcím adatokkal
    """
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String(100), nullable=False, default="Magyarország")  # Ország
    postal_code = Column(String(20), nullable=True)   # Irányítószám
    city = Column(String(100), nullable=False)        # Helység/Város
    address = Column(String(300), nullable=True)      # Lakcím/Utca
    description = Column(Text, nullable=True)         # Egyéb leírás
    icon = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Kapcsolat item-ekhez
    items = relationship("Item", back_populates="location")

    @property
    def name(self):
        """Rövid megnevezés"""
        if self.address:
            return f"{self.city}, {self.address}"
        return self.city
    
    @property
    def full_path(self):
        """Teljes cím"""
        parts = []
        if self.country:
            parts.append(self.country)
        if self.postal_code:
            parts.append(self.postal_code)
        if self.city:
            parts.append(self.city)
        if self.address:
            parts.append(self.address)
        return ", ".join(parts) if parts else "Ismeretlen helyszín"

    def __repr__(self):
        return f"<Location(id={self.id}, city='{self.city}')>"


class Item(Base):
    """
    Tárgy model - JAVÍTOTT verzió quantity mezőkkel
    """
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    purchase_price = Column(Float, nullable=True)
    purchase_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    image_filename = Column(String(300), nullable=True)
    
    # JAVÍTVA: quantity mezők
    quantity = Column(Integer, default=1, nullable=False)  # Mennyiség (kötelező, min 1)
    min_quantity = Column(Integer, nullable=True)  # Minimum készlet (opcionális)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    
    # QR kód
    qr_code = Column(String(50), unique=True, nullable=True, index=True)
    
    # Időbélyegek
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Kapcsolatok
    user = relationship("User", back_populates="items")
    location = relationship("Location", back_populates="items")
    documents = relationship("Document", back_populates="item", cascade="all, delete-orphan")
    images = relationship("ItemImage", back_populates="item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Item(id={self.id}, name='{self.name}', quantity={self.quantity})>"


class Category(Base):
    """
    Kategória model
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    icon = Column(String(50), nullable=True)
    color = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"


class Document(Base):
    """
    Dokumentum model - PDF, Word, Excel, etc.
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    filename = Column(String(300), nullable=False)
    original_filename = Column(String(300), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    document_type = Column(String(50), nullable=True)  # pl: "garancia", "számla", "kézikönyv"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Kapcsolat
    item = relationship("Item", back_populates="documents")

    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.filename}')>"


class ItemImage(Base):
    """Több kép támogatása a tárgyakhoz."""

    __tablename__ = "item_images"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    filename = Column(String(300), nullable=False)
    original_filename = Column(String(300), nullable=False)  # JAVÍTVA: hozzáadva
    orientation = Column(String(20), nullable=True)  # portrait, landscape, square
    rotation = Column(Integer, default=0, nullable=True)  # 0, 90, 180, 270
    order_index = Column(Integer, default=0, nullable=True)
    is_primary = Column(Boolean, default=False, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("Item", back_populates="images")

    def __repr__(self):
        return f"<ItemImage(id={self.id}, filename='{self.filename}', orientation='{self.orientation}')>"
