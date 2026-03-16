#!/usr/bin/env python3
import json
from collections import Counter

# Scraped data'yı yükle
with open('scraped-data/fixed_products_2025-09-29T10-49-48-208Z.json', 'r', encoding='utf-8') as f:
    scraped = json.load(f)

print("="*60)
print("SCRAPED VERİ ANALİZİ")
print("="*60)
print(f"\nToplam ürün: {len(scraped)}\n")

print("Kategori Dağılımı:")
cats = Counter([p['category'] for p in scraped])
for cat, count in sorted(cats.items(), key=lambda x: x[1], reverse=True):
    print(f"  {cat}: {count}")

print("\n" + "="*60)
print("SORUN TESPİTİ")
print("="*60)

# 1 ürünlü kategoriler
single_product_cats = [cat for cat, count in cats.items() if count == 1]
print(f"\nSADECE 1 ÜRÜNÜ OLAN KATEGORİLER ({len(single_product_cats)} adet):")
for cat in sorted(single_product_cats):
    print(f"  - {cat}")

# Beklenen vs gerçek
expected_products = {
    'Konut Tipi Fanlar': '50+',
    'Santrifüj Fanlar': '100+',
    'Kanal Tipi Fanlar': '50+',
    'Çatı Tipi Fanlar': '30+',
    'Hava Perdeleri': '10+',
    'Aksesuarlar': '20+'
}

print("\n" + "="*60)
print("BEKLENTİ VS GERÇEK")
print("="*60)
for cat, expected in expected_products.items():
    actual = cats.get(cat, 0)
    print(f"{cat}:")
    print(f"  Beklenen: {expected}")
    print(f"  Gerçek: {actual}")
    print()

print("="*60)
print("SONUÇ: Scraping eksik! Birçok kategori sadece 1 ürün içeriyor.")
print("="*60)