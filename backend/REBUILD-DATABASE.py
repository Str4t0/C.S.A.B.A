"""
ADATBÁZIS ÚJRAÉPÍTÉS SCRIPT
Törli a régi DB-t és létrehozza az újat az új sémával
"""

import os
import sys

# Backend mappa
backend_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_path)

from app.database import Base, engine

def rebuild_database():
    print("🔄 Adatbázis újraépítése...")
    
    # Töröld a régi DB fájlt
    db_file = os.path.join(backend_path, "inventory.db")
    if os.path.exists(db_file):
        os.remove(db_file)
        print("✅ Régi adatbázis törölve")
    
    # Hozd létre az új DB-t az új sémával
    Base.metadata.create_all(bind=engine)
    print("✅ Új adatbázis létrehozva az új sémával")
    
    print("\n✨ Kész! Most indítsd újra a backend-et!")

if __name__ == "__main__":
    rebuild_database()
