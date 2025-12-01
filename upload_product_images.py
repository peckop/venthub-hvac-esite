from supabase import create_client
import os
from dotenv import load_dotenv
import json
import requests
from pathlib import Path
import time
from urllib.parse import urlparse
import uuid

load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

print("=== Product Image Upload Script ===\n")

# Load scraped data
with open('avens-integration/scraped-data/all_products.json', 'r', encoding='utf-8') as f:
    scraped_products = json.load(f)

print(f"Loaded {len(scraped_products)} products from scraped data\n")

# Get Hava Perdeleri products from database
category_id = '70ead5c0-b93e-40f0-82ae-951aa45861f5'
response = supabase.table('products').select('id,name,sku,brand').eq('category_id', category_id).eq('status', 'active').execute()
db_products = response.data

print(f"Found {len(db_products)} Hava Perdeleri products in database\n")

# Match products by name
matched = []
for db_product in db_products:
    # Normalize name for matching
    db_name = db_product['name'].strip().upper()
    
    for scraped in scraped_products:
        scraped_name = scraped.get('name', '').strip().upper()
        
        # Match by name similarity
        if scraped_name in db_name or db_name in scraped_name:
            if scraped.get('image_url'):
                matched.append({
                    'db_product': db_product,
                    'image_url': scraped['image_url'],
                    'scraped_name': scraped.get('name')
                })
                print(f"✓ Matched: {db_product['name']}")
                print(f"  Image URL: {scraped['image_url']}")
                break

print(f"\nMatched {len(matched)} products with images\n")

if not matched:
    print("❌ No matches found. Exiting...")
    exit(0)

# Create temp directory for downloads
temp_dir = Path('temp_images')
temp_dir.mkdir(exist_ok=True)

# Download and upload images
for i, match in enumerate(matched, 1):
    product = match['db_product']
    image_url = match['image_url']
    
    print(f"\n[{i}/{len(matched)}] Processing: {product['name']}")
    
    try:
        # Fix malformed URLs (missing slash after .com)
        fixed_url = image_url.replace('.comuploads/', '.com/uploads/')
        
        # Download image
        print(f"  Downloading from: {fixed_url}")
        response = requests.get(fixed_url, timeout=30)
        response.raise_for_status()
        
        # Get file extension from URL
        parsed_url = urlparse(image_url)
        ext = Path(parsed_url.path).suffix or '.png'
        
        # Save temporarily
        temp_file = temp_dir / f"{product['id']}{ext}"
        with open(temp_file, 'wb') as f:
            f.write(response.content)
        
        print(f"  Downloaded {len(response.content)} bytes")
        
        # Generate unique filename for Supabase
        filename = f"{product['sku']}-{uuid.uuid4().hex[:8]}{ext}"
        storage_path = f"products/{filename}"
        
        # Upload to Supabase Storage
        print(f"  Uploading to: {storage_path}")
        with open(temp_file, 'rb') as f:
            upload_response = supabase.storage.from_('product-images').upload(
                path=storage_path,
                file=f,
                file_options={
                    "content-type": f"image/{ext[1:]}",
                    "cache-control": "3600",
                    "upsert": "false"
                }
            )
        
        print(f"  ✓ Uploaded to storage")
        
        # Add entry to product_images table
        image_record = {
            'product_id': product['id'],
            'path': storage_path,
            'alt': product['name'],
            'sort_order': 1
        }
        
        insert_response = supabase.table('product_images').insert(image_record).execute()
        print(f"  ✓ Added to product_images table")
        
        # Clean up temp file
        temp_file.unlink()
        
        # Rate limiting
        time.sleep(0.5)
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        continue

# Clean up temp directory
try:
    temp_dir.rmdir()
except:
    pass

print(f"\n{'='*80}")
print(f"\n✓ Image upload complete!")
print(f"  Processed: {len(matched)} products")
