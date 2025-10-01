#!/usr/bin/env python3
"""
İki scraped data'yı birleştir:
1. Eski veri (168 ürün) - Kategorileri var
2. Yeni veri (334 ürün) - Kategorileri "Genel"

Yeni verideki ürünlerin kategorilerini, eski verideki aynı ürünlere bakarak belirle.
"""

import json
from collections import defaultdict

# Veriyi yükle
print("📂 Veriler yükleniyor...")

with open('scraped-data/fixed_products_2025-09-29T10-49-48-208Z.json', 'r', encoding='utf-8') as f:
    old_data = json.load(f)

with open('scraped-data/all_products_2025-09-30T10-47-25.905Z.json', 'r', encoding='utf-8') as f:
    new_data = json.load(f)

print(f"✓ Eski veri: {len(old_data)} ürün")
print(f"✓ Yeni veri: {len(new_data)} ürün")

# Eski verideki ürünleri isme göre map'le
old_products_by_name = {}
for p in old_data:
    name = p.get('name', '').strip().lower()
    if name:
        old_products_by_name[name] = p

print(f"\n🔍 Kategori eşleştirme yapılıyor...")

matched = 0
unmatched = 0

for product in new_data:
    name = product.get('name', '').strip().lower()
    
    # Eski veride bu ürün var mı?
    if name in old_products_by_name:
        old_product = old_products_by_name[name]
        product['category'] = old_product.get('category', 'Genel')
        matched += 1
    else:
        unmatched += 1
        # URL'den kategori tahmini yap
        url = product.get('url', '').lower()
        
        # URL pattern matching
        if 'casals' in url or 'casals' in name:
            product['category'] = 'Santrifüj Fanlar'
        elif 'vortice' in url or 'vortice' in name:
            # Vortice ürünleri farklı kategorilerde olabilir
            if 'quadro' in name or 'me ' in name or 'punto' in name:
                product['category'] = 'Konut Tipi Fanlar'
            elif 'lineo' in name:
                product['category'] = 'Kanal Tipi Fanlar'
            elif 'nord' in name or 'ca ' in name:
                product['category'] = 'Çatı Tipi Fanlar'
            else:
                product['category'] = 'Konut Tipi Fanlar'  # Default
        elif 'enkelfan' in url or 'enkelfan' in name:
            product['category'] = 'Kanal Tipi Fanlar'
        else:
            product['category'] = 'Genel'

print(f"✓ {matched} ürün eşleştirildi")
print(f"→ {unmatched} ürün yeni (tahmin edildi)")

# Kategori dağılımı
print(f"\n📊 Kategori Dağılımı:")
from collections import Counter
cats = Counter([p['category'] for p in new_data])
for cat, count in sorted(cats.items(), key=lambda x: x[1], reverse=True):
    print(f"  {cat}: {count}")

# Kaydet
output_file = 'scraped-data/merged_products_final.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

print(f"\n✅ Birleştirilmiş veri kaydedildi: {output_file}")
print(f"📊 Toplam {len(new_data)} ürün")
print("="*60)