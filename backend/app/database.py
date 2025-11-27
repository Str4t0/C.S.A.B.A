"""
Adatbázis konfiguráció és session kezelés
Backend Developer: Maria Rodriguez
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
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
    Base.metadata.create_all(bind=engine)
