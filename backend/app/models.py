"""
SQLAlchemy adatbázis modellek - Frissített verzió
Backend Developer: Maria Rodriguez
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
    display_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=True)
    avatar_color = Column(String(20), default="#3498db")  # Avatar szín
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Kapcsolat item-ekhez
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"


class Location(Base):
    """
    Helyszín/Cím model - hierarchikus struktúra
    """
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("locations.id"), nullable=True)  # Hierarchia
    icon = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Hierarchikus kapcsolat
    parent = relationship("Location", remote_side=[id], backref="children")
    
    # Kapcsolat item-ekhez
    items = relationship("Item", back_populates="location")

    def __repr__(self):
        return f"<Location(id={self.id}, name='{self.name}')>"
    
    @property
    def full_path(self):
        """Teljes elérési út (pl: Lakás > Nappali > Polc)"""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name


class Item(Base):
    """
    Tárgy model - reprezentálja a háztartási eszközöket
    """
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    purchase_price = Column(Float, nullable=True)
    purchase_date = Column(Date, nullable=True)
    quantity = Column(Integer, default=1)  # Mennyiség
    min_quantity = Column(Integer, nullable=True)  # Minimális mennyiség (low stock alert)
    notes = Column(Text, nullable=True)
    image_filename = Column(String(300), nullable=True)
    qr_code = Column(String(100), unique=True, nullable=True, index=True)  # QR kód
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Kapcsolatok
    user = relationship("User", back_populates="items")
    location = relationship("Location", back_populates="items")
    documents = relationship("Document", back_populates="item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Item(id={self.id}, name='{self.name}', category='{self.category}')>"
    
    @property
    def is_low_stock(self):
        """Alacsony készlet ellenőrzés"""
        if self.min_quantity is not None:
            return self.quantity <= self.min_quantity
        return False


class Document(Base):
    """
    Dokumentum model - garanciák, számlák, kézikönyvek stb.
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False, index=True)
    filename = Column(String(300), nullable=False)  # Egyedi fájlnév a szerveren
    original_filename = Column(String(300), nullable=False)  # Eredeti fájlnév
    document_type = Column(String(50), nullable=True)  # pl. "garancia", "számla", "kézikönyv"
    file_size = Column(Integer, nullable=True)  # Fájl méret byte-ban
    description = Column(Text, nullable=True)  # Opcionális leírás
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Kapcsolat item-hez
    item = relationship("Item", back_populates="documents")

    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.original_filename}', item_id={self.item_id})>"


class Category(Base):
    """
    Kategória model
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), nullable=True)
    color = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"
