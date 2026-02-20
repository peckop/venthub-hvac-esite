import json

print("Checking scraped data for image URLs...\n")

# Load all_products.json
with open('avens-integration/scraped-data/all_products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total products in scraped data: {len(data)}\n")

# Find AIR DOOR products
air_door_products = [p for p in data if 'AIR DOOR' in p.get('name', '').upper() or 'HAVA PERDE' in p.get('name', '').upper()]

print(f"Found {len(air_door_products)} AIR DOOR / Hava Perdesi products\n")

if air_door_products:
    print("Sample products:")
    for product in air_door_products[:3]:
        print(f"\nName: {product.get('name', 'N/A')}")
        print(f"SKU: {product.get('sku', 'N/A')}")
        print(f"Keys: {list(product.keys())}")
        
        # Check for image fields
        image_fields = ['image', 'images', 'imageUrl', 'image_url', 'imageUrls', 'productImage', 'foto', 'gorsel']
        for field in image_fields:
            if field in product:
                print(f"  ✓ Has field '{field}': {product[field]}")
else:
    print("❌ No AIR DOOR products found in scraped data")

# Also check category_products.json
print("\n" + "="*80)
print("\nChecking category_products.json...")
try:
    with open('avens-integration/scraped-data/category_products.json', 'r', encoding='utf-8') as f:
        cat_data = json.load(f)
    
    if isinstance(cat_data, dict):
        print(f"Categories: {list(cat_data.keys())}")
        for cat_name, products in cat_data.items():
            if 'hava' in cat_name.lower() or 'air' in cat_name.lower():
                print(f"\nCategory: {cat_name}")
                print(f"  Products: {len(products)}")
                if products:
                    sample = products[0]
                    print(f"  Sample keys: {list(sample.keys())}")
                    for field in ['image', 'images', 'imageUrl', 'image_url']:
                        if field in sample:
                            print(f"    ✓ Has field '{field}': {sample[field]}")
except FileNotFoundError:
    print("  File not found")
except Exception as e:
    print(f"  Error: {e}")
