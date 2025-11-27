"""
ADATBÁZIS MIGRÁCIÓ - Quantity mezők hozzáadása
FONTOS: Ez a script hozzáadja a quantity és min_quantity mezőket
         a meglévő items táblához ANÉLKÜL hogy törölné az adatokat!
"""

import sqlite3
import os

def migrate_database():
    """
    Migrálja a meglévő adatbázist az új séma szerint
    """
    # Adatbázis fájl útvonala
    db_path = os.path.join(os.path.dirname(__file__), "..", "inventory.db")
    
    if not os.path.exists(db_path):
        print("❌ Nem található adatbázis fájl:", db_path)
        print("   Futtasd először a backend-et hogy létrejöjjön az DB!")
        return False
    
    print("📊 Adatbázis migráció indítása...")
    print(f"   DB fájl: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Ellenőrizd hogy van-e már quantity mező
        cursor.execute("PRAGMA table_info(items)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print(f"   Jelenlegi oszlopok: {', '.join(columns)}")
        
        # Quantity mező hozzáadása ha nincs
        if 'quantity' not in columns:
            print("   ➕ quantity mező hozzáadása...")
            cursor.execute("ALTER TABLE items ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1")
            print("   ✅ quantity mező hozzáadva!")
        else:
            print("   ℹ️  quantity mező már létezik")
        
        # Min_quantity mező hozzáadása ha nincs
        if 'min_quantity' not in columns:
            print("   ➕ min_quantity mező hozzáadása...")
            cursor.execute("ALTER TABLE items ADD COLUMN min_quantity INTEGER")
            print("   ✅ min_quantity mező hozzáadva!")
        else:
            print("   ℹ️  min_quantity mező már létezik")
        
        # Győződj meg róla hogy minden item-nek van quantity értéke
        cursor.execute("UPDATE items SET quantity = 1 WHERE quantity IS NULL OR quantity < 1")
        updated_rows = cursor.rowcount
        if updated_rows > 0:
            print(f"   🔄 {updated_rows} item quantity mezője frissítve 1-re")
        
        conn.commit()
        print("\n✅ MIGRÁCIÓ SIKERES!")
        print("   Most újraindíthatod a backend-et.")
        
        # Ellenőrzés
        cursor.execute("SELECT COUNT(*) FROM items")
        item_count = cursor.fetchone()[0]
        print(f"\n📦 Összes item az adatbázisban: {item_count}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"\n❌ HIBA a migráció során: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print(" ADATBÁZIS MIGRÁCIÓ - Quantity mezők")
    print("=" * 60)
    print()
    
    success = migrate_database()
    
    print()
    print("=" * 60)
    
    if success:
        print(" KÉSZ! Backend újraindítható.")
    else:
        print(" HIBA történt! Ellenőrizd az üzeneteket.")
    
    print("=" * 60)
    print()
    input("Nyomj ENTER-t a kilépéshez...")
