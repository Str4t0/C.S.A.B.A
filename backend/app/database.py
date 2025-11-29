"""
Adatbázis konfiguráció és session kezelés
Backend Developer: Maria Rodriguez
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os

# SQLite adatbázis használata
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./home_inventory.db"
)

# Engine létrehozása
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Csak SQLite esetén kell
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class a modellekhez
Base = declarative_base()


def get_db():
    """
    Dependency injection funkció FastAPI-hoz
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Adatbázis táblák inicializálása
    """
    # Biztosítsuk, hogy az új mezők (pl. orientation az item_images táblában) is
    # megjelenjenek a meglévő SQLite adatbázisokban.
    with engine.begin() as conn:
        columns = [row[1] for row in conn.execute(text("PRAGMA table_info(item_images);"))]
        # Ha a tábla még nem létezik, a PRAGMA üres listát ad vissza; ilyenkor a
        # create_all hozza létre a megfelelő sémát. Csak meglévő táblán futtatunk ALTER-t.
        if columns and "orientation" not in columns:
            conn.execute(text("ALTER TABLE item_images ADD COLUMN orientation VARCHAR(20)"))
        if columns and "original_filename" not in columns:
            conn.execute(text("ALTER TABLE item_images ADD COLUMN original_filename VARCHAR(300)"))

    Base.metadata.create_all(bind=engine)
