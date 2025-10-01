import json
from collections import Counter

# JSON dosyasını yükle
with open('scraped-data/complete_with_categories_2025-09-30T11-49-23-659Z.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Isı Geri Kazanım ürünlerini filtrele
igk_products = [
    p for p in data 
    if 'isi geri kazanim' in p['category'].lower().replace('ı', 'i').replace('İ', 'i') or 
       'isi geri kazanim' in p.get('subcategory', '').lower().replace('ı', 'i').replace('İ', 'i') or
       'isı geri kazanım' in p['category'].lower() or
       'isı geri kazanım' in p.get('subcategory', '').lower()
]

print("\n" + "="*60)
print(f"ISI GERİ KAZANIM CİHAZLARI - TOPLAM: {len(igk_products)} ÜRÜN")
print("="*60)

# Kategori ve alt kategori dağılımı
cat_counts = Counter([
    (p['category'], p.get('subcategory', 'Alt Kategori Yok')) 
    for p in igk_products
])

print("\n=== KATEGORİ DAĞILIMI ===")
for (cat, subcat), count in cat_counts.items():
    print(f"  {cat} > {subcat}: {count} ürün")

# Ürün listesi
print("\n=== ÜRÜN LİSTESİ ===")
for i, p in enumerate(igk_products, 1):
    subcat = p.get('subcategory', '?')
    print(f"{i}. {p['name']}")
    print(f"   Kategori: {p['category']} > {subcat}")
    print(f"   URL: {p['url']}")
    print()

print("="*60)