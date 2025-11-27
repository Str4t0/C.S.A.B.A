"""
API TESZT SCRIPT
Ellenőrzi hogy minden végpont működik-e
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Health check"""
    print("\n🔍 1. Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Backend működik!")
            print(f"   {response.json()}")
        else:
            print(f"❌ Hiba: {response.status_code}")
    except Exception as e:
        print(f"❌ HIBA: {e}")
        print("   A backend nem fut! Indítsd el: python -m uvicorn app.main:app --reload")
        return False
    return True


def test_categories():
    """Kategóriák lekérése"""
    print("\n🔍 2. Kategóriák...")
    try:
        response = requests.get(f"{BASE_URL}/api/categories")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ {len(categories)} kategória található")
            for cat in categories[:3]:
                print(f"   - {cat['icon']} {cat['name']}")
        else:
            print(f"❌ Hiba: {response.status_code}")
    except Exception as e:
        print(f"❌ HIBA: {e}")


def test_create_item():
    """Új item létrehozása"""
    print("\n🔍 3. Új tárgy létrehozása...")
    
    item_data = {
        "name": "TESZT Laptop",
        "category": "Elektronika",
        "description": "Ez egy teszt tárgy",
        "purchase_price": 100000,
        "quantity": 5,
        "min_quantity": 2,
        "purchase_date": None,
        "notes": "Teszt jegyzetek",
        "image_filename": None,
        "user_id": None,
        "location_id": None
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/items",
            json=item_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            item = response.json()
            print(f"✅ Tárgy létrehozva!")
            print(f"   ID: {item['id']}")
            print(f"   Név: {item['name']}")
            print(f"   Quantity: {item['quantity']}")
            print(f"   Min Quantity: {item['min_quantity']}")
            return item['id']
        else:
            print(f"❌ Hiba: {response.status_code}")
            print(f"   {response.text}")
            return None
    except Exception as e:
        print(f"❌ HIBA: {e}")
        return None


def test_get_items():
    """Összes item lekérése"""
    print("\n🔍 4. Tárgyak listázása...")
    try:
        response = requests.get(f"{BASE_URL}/api/items")
        if response.status_code == 200:
            items = response.json()
            print(f"✅ {len(items)} tárgy található")
            for item in items[:3]:
                print(f"   - {item['name']} (qty: {item.get('quantity', '?')})")
        else:
            print(f"❌ Hiba: {response.status_code}")
    except Exception as e:
        print(f"❌ HIBA: {e}")


def test_search():
    """Keresés teszt"""
    print("\n🔍 5. Keresés ('TESZT')...")
    try:
        response = requests.get(f"{BASE_URL}/api/items/search?q=TESZT")
        if response.status_code == 200:
            results = response.json()
            print(f"✅ {len(results)} találat")
        else:
            print(f"❌ Hiba: {response.status_code}")
    except Exception as e:
        print(f"❌ HIBA: {e}")


def test_update_item(item_id):
    """Item frissítése"""
    print(f"\n🔍 6. Tárgy frissítése (ID: {item_id})...")
    
    update_data = {
        "description": "FRISSÍTETT leírás",
        "quantity": 10
    }
    
    try:
        response = requests.put(
            f"{BASE_URL}/api/items/{item_id}",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            item = response.json()
            print(f"✅ Tárgy frissítve!")
            print(f"   Új quantity: {item['quantity']}")
        else:
            print(f"❌ Hiba: {response.status_code}")
    except Exception as e:
        print(f"❌ HIBA: {e}")


def test_stats():
    """Statisztikák"""
    print("\n🔍 7. Statisztikák...")
    try:
        response = requests.get(f"{BASE_URL}/api/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Statisztikák:")
            print(f"   - Összes tárgy: {stats['total_items']}")
            print(f"   - Összes érték: {stats['total_value']} Ft")
            print(f"   - Low stock: {stats['low_stock_items']}")
        else:
            print(f"❌ Hiba: {response.status_code}")
    except Exception as e:
        print(f"❌ HIBA: {e}")


def test_delete_item(item_id):
    """Item törlése"""
    print(f"\n🔍 8. Teszt tárgy törlése (ID: {item_id})...")
    try:
        response = requests.delete(f"{BASE_URL}/api/items/{item_id}")
        if response.status_code == 200:
            print(f"✅ Teszt tárgy törölve!")
        else:
            print(f"❌ Hiba: {response.status_code}")
    except Exception as e:
        print(f"❌ HIBA: {e}")


def run_all_tests():
    """Összes teszt futtatása"""
    print("=" * 60)
    print("  API TESZT SCRIPT")
    print("=" * 60)
    
    # Health check
    if not test_health():
        print("\n❌ Backend nem fut! Teszt megszakítva.")
        return
    
    # Kategóriák
    test_categories()
    
    # Items
    test_get_items()
    
    # Új item létrehozása
    test_item_id = test_create_item()
    
    # Keresés
    test_search()
    
    # Frissítés
    if test_item_id:
        test_update_item(test_item_id)
    
    # Statisztikák
    test_stats()
    
    # Törlés
    if test_item_id:
        test_delete_item(test_item_id)
    
    print("\n" + "=" * 60)
    print("  TESZT VÉGE")
    print("=" * 60)
    print("\nHa minden zöld pipa (✅) akkor MŰKÖDIK! 🎉")


if __name__ == "__main__":
    run_all_tests()
    print("\nNyomj ENTER-t a kilépéshez...")
    input()
