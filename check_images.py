from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

print("Checking Hava Perdeleri product images...\n")

# Get Hava Perdeleri products
category_id = '70ead5c0-b93e-40f0-82ae-951aa45861f5'
response = supabase.table('products').select('id,name,sku,brand').eq('category_id', category_id).eq('status', 'active').execute()
products = response.data

print(f"Found {len(products)} products\n")

for product in products:
    # Check if product has images
    img_response = supabase.table('product_images').select('*').eq('product_id', product['id']).execute()
    images = img_response.data
    
    print(f"Product: {product['name']}")
    print(f"  SKU: {product['sku']}")
    print(f"  Brand: {product['brand']}")
    print(f"  Images: {len(images)}")
    if images:
        for img in images:
            print(f"    - {img['path']} (sort: {img['sort_order']})")
    else:
        print(f"    ❌ NO IMAGES")
    print()

# Check if we have scraped data with image URLs
print("\n" + "="*80)
print("Checking scraped data for image URLs...")

import json
import glob

# Look for scraped data files
data_files = glob.glob('avens-integration/scraped-data/*.json')
print(f"\nFound {len(data_files)} data files")

# Try to find product data with images
for file_path in data_files:
    if 'hava' in file_path.lower() or 'air' in file_path.lower() or 'curtain' in file_path.lower():
        print(f"\nChecking: {file_path}")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    print(f"  Contains {len(data)} items")
                    for item in data[:3]:  # Show first 3
                        if isinstance(item, dict) and 'name' in item:
                            print(f"    - {item.get('name', 'N/A')}")
                            if 'images' in item or 'image' in item or 'imageUrl' in item:
                                print(f"      Has image data: {list(item.keys())}")
        except:
            pass
