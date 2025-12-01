import json

# Load category products
with open('avens-integration/scraped-data/category_products.json', 'r', encoding='utf-8') as f:
    cat_data = json.load(f)

konut_products = cat_data.get('Konut Tipi Fanlar', [])
print(f"Found {len(konut_products)} Konut Tipi Fanlar products\n")

# Check first few products for image data
print("Sample products with image data:\n")
for i, product in enumerate(konut_products[:5], 1):
    print(f"{i}. {product}")
    print(f"   Type: {type(product)}")
    print()

# If products are strings (URLs), we need to scrape individual pages
# If they're dicts with image data, we can use them directly
if konut_products and isinstance(konut_products[0], str):
    print("Products are URLs - need to scrape individual product pages")
    print("\nSample URLs:")
    for url in konut_products[:5]:
        print(f"  - {url}")
else:
    print("Products have structured data")
    if konut_products:
        sample = konut_products[0]
        print(f"\nSample product keys: {list(sample.keys())}")
        
        # Check for image fields
        image_fields = ['image', 'images', 'imageUrl', 'image_url', 'imageUrls', 'photos', 'gallery']
        for field in image_fields:
            if field in sample:
                print(f"  ✓ Has '{field}': {sample[field]}")
