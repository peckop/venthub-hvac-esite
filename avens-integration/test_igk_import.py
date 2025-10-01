import os
import json
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

print("\n" + "="*60)
print("ISI GERİ KAZANIM TEST İMPORT")
print("="*60)

# 1. Kategorileri kontrol et
print("\n1. Kategorileri kontrol ediyorum...")
response = supabase.table('categories').select('*').execute()
categories = response.data

# Kategori map'i oluştur
category_map = {}
for cat in categories:
    name_lower = cat['name'].lower().strip()
    name_normalized = name_lower.replace('ı', 'i').replace('İ', 'i').replace('ğ', 'g').replace('ş', 's').replace('ç', 'c').replace('ü', 'u').replace('ö', 'o')
    
    category_map[name_lower] = cat['id']
    category_map[name_normalized] = cat['id']

print(f"  Toplam {len(categories)} kategori yüklendi")

# IGK kategorilerini göster
igk_cats = [c for c in categories if 'ısı' in c['name'].lower() or 'ticari' in c['name'].lower() or 'konut tipi' in c['name'].lower()]
print(f"\n  Isı Geri Kazanım ile ilgili kategoriler:")
for cat in igk_cats:
    print(f"    - {cat['name']} (ID: {cat['id'][:8]}...)")
    # Bu kategori map'te var mı?
    if cat['name'].lower().strip() in category_map:
        print(f"      ✓ Map'te mevcut")
    else:
        print(f"      ✗ Map'te YOK!")

# 2. JSON'dan IGK ürünlerini yükle
print("\n2. Scraped data'dan IGK ürünleri yükleniyor...")
with open('scraped-data/complete_with_categories_2025-09-30T11-49-23-659Z.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

igk_products = [
    p for p in data 
    if 'isi geri kazanim' in p['category'].lower().replace('ı', 'i').replace('İ', 'i') or 
       'isi geri kazanim' in p.get('subcategory', '').lower().replace('ı', 'i').replace('İ', 'i') or
       'isı geri kazanım' in p['category'].lower() or
       'isı geri kazanım' in p.get('subcategory', '').lower()
]

print(f"  {len(igk_products)} IGK ürün bulundu")

# 3. Her ürün için eşleştirme testi
print("\n3. Kategori eşleştirme testi...")
for i, prod in enumerate(igk_products, 1):
    name = prod['name']
    category = prod['category']
    subcategory = prod.get('subcategory', '')
    
    print(f"\n  [{i}] {name}")
    print(f"      Category: {category}")
    print(f"      Subcategory: {subcategory}")
    
    # Subcategory ile eşleştir
    category_id = None
    if subcategory:
        # Önce orijinal
        category_id = category_map.get(subcategory.lower().strip())
        if not category_id:
            # Normalized dene
            subcat_norm = subcategory.lower().strip().replace('ı', 'i').replace('İ', 'i').replace('ğ', 'g').replace('ş', 's').replace('ç', 'c').replace('ü', 'u').replace('ö', 'o')
            category_id = category_map.get(subcat_norm)
    
    if category_id:
        cat_name = next((c['name'] for c in categories if c['id'] == category_id), 'Unknown')
        print(f"      ✓ Eşleşti: {cat_name}")
    else:
        print(f"      ✗ EŞLEŞMEDİ!")
        print(f"      Map'te aranacak: '{subcategory.lower().strip()}'")
        print(f"      Map'te mevcut mu? {subcategory.lower().strip() in category_map}")

print("\n" + "="*60)