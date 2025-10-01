import os
from dotenv import load_dotenv
from supabase import create_client
from collections import Counter

load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

print("\n" + "="*60)
print("KATEGORİ VE ÜRÜN DAĞILIMI KONTROLÜ")
print("="*60)

# Kategorileri al
result = supabase.table('categories').select('id, name, parent_id').execute()
categories = result.data

# Kategori haritası
cat_map = {c['id']: c for c in categories}

print("\n=== TÜM KATEGORİLER ===")
for cat in sorted(categories, key=lambda x: x['name']):
    parent_name = cat_map.get(cat['parent_id'], {}).get('name', '-') if cat['parent_id'] else '-'
    print(f"  {cat['name']:<40} (Parent: {parent_name})")

# Ürünleri al
result2 = supabase.table('products').select('id, name, category_id').execute()
products = result2.data

# Kategori bazında ürün sayıları
cat_counts = Counter()
products_by_cat = {}

for p in products:
    cat_id = p['category_id']
    if cat_id:
        cat_name = cat_map.get(cat_id, {}).get('name', 'Bilinmeyen')
        cat_counts[cat_name] += 1
        
        if cat_name not in products_by_cat:
            products_by_cat[cat_name] = []
        products_by_cat[cat_name].append(p['name'])

print("\n=== ÜRÜN DAĞILIMI (KATEGORİYE GÖRE) ===")
for cat_name, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
    print(f"  {cat_name:<40}: {count} ürün")

# Isı Geri Kazanım kategorilerini detaylı göster
print("\n=== ISI GERİ KAZANIM CİHAZLARI DETAYLI ===")
igk_categories = [c for c in categories if 'ısı geri kazanım' in c['name'].lower() or 'konut tipi' in c['name'].lower() or 'ticari tip' in c['name'].lower()]

for cat in igk_categories:
    print(f"\n{cat['name']} (ID: {cat['id'][:8]}...):")
    if cat['name'] in products_by_cat:
        for prod in products_by_cat[cat['name']]:
            print(f"  - {prod}")
    else:
        print("  (Ürün yok)")

print("\n" + "="*60)