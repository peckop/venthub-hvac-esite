#!/usr/bin/env python3
"""
Hava Perdeleri kategorisindeki ürünleri analiz et
"""
import json

# Scraped data'yı yükle
with open('scraped-data/fixed_products_2025-09-29T10-49-48-208Z.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Hava Perdeleri kategorisindeki ürünleri bul
air_curtain_products = [p for p in data if 'Hava Perdeleri' in p.get('category', '')]

print(f"=== HAVA PERDELERİ KATEGORİSİ ===")
print(f"Toplam {len(air_curtain_products)} ürün bulundu:\n")

for i, product in enumerate(air_curtain_products, 1):
    name = product.get('name', '')
    category = product.get('category', '')
    
    # Elektrikli ısıtıcılı mı kontrol et
    is_electric_heated = any(keyword in name.lower() for keyword in [
        'elektrik', 'ısıtıcı', 'ısıtıcılı', 'electric', 'heater'
    ])
    
    # Su ısıtmalı mı kontrol et
    is_water_heated = any(keyword in name.lower() for keyword in [
        'su ısıtıcı', 'water', 'sıcak su'
    ])
    
    suggested_subcategory = "Ortam Havalı"  # Default
    if is_electric_heated:
        suggested_subcategory = "Elektrikli Isıtıcılı"
    elif is_water_heated:
        suggested_subcategory = "Su Isıtıcılı"
    
    print(f"{i}. {name}")
    print(f"   Önerilen Alt Kategori: {suggested_subcategory}")
    print()