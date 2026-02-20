from supabase import create_client
import os
from dotenv import load_dotenv
import json
import requests
from pathlib import Path
import uuid

load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Load extracted images
with open('product_images_test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

product_name = data['name']
images = data['images']

print(f"Product: {product_name}")
print(f"Images to upload: {len(images)}\n")

# Find product in database
search_name = product_name.upper()
response = supabase.table('products').select('id,name,sku,brand').eq('status', 'active').execute()
products = response.data

# Try to find by name match
db_product = None
for p in products:
    if 'GIALLO' in p['name'].upper() or 'YELLOW' in p['name'].upper():
        if 'PUNTO' in p['name'].upper() or 'ME 100' in p['name'].upper():
            db_product = p
            break

if not db_product:
    print("❌ Product not found in database")
    print(f"Search term: {search_name}")
    print("\nTrying to create it...")
    
    # Create product if not exists
    new_product = {
        'name': product_name,
        'sku': 'AVE-VOR-TEMP-' + uuid.uuid4().hex[:6].upper(),
        'brand': 'AVenS',
        'price': '7043.36',
        'category_id': 'f3a75c19-256a-44bb-a816-9379881f1346',  # Konut Tipi Fanlar
        'status': 'active'
    }
    
    insert_response = supabase.table('products').insert(new_product).execute()
    db_product = insert_response.data[0]
    print(f"✓ Created product: {db_product['id']}")

else:
    print(f"✓ Found product in DB: {db_product['name']}")
    print(f"  ID: {db_product['id']}\n")

# Download and upload images
temp_dir = Path('temp_images')
temp_dir.mkdir(exist_ok=True)

uploaded = 0
for i, img_data in enumerate(images, 1):
    img_url = img_data['url']
    
    # Skip certificate images
    if any(cert in img_url.lower() for cert in ['ce-', 'imq-', 'sertifika']):
        print(f"[{i}/{len(images)}] Skipping certificate: {img_url.split('/')[-1]}")
        continue
    
    print(f"[{i}/{len(images)}] Uploading: {img_url.split('/')[-1][:50]}")
    
    try:
        # Download
        response = requests.get(img_url, timeout=30)
        response.raise_for_status()
        
        # Get extension
        ext = Path(img_url).suffix or '.png'
        
        # Save temp
        temp_file = temp_dir / f"{uuid.uuid4().hex}{ext}"
        with open(temp_file, 'wb') as f:
            f.write(response.content)
        
        # Upload to Supabase
        filename = f"{db_product['sku']}-{i:02d}{ext}"
        storage_path = f"products/{filename}"
        
        with open(temp_file, 'rb') as f:
            supabase.storage.from_('product-images').upload(
                path=storage_path,
                file=f,
                file_options={
                    "content-type": f"image/{ext[1:]}",
                    "cache-control": "3600",
                    "upsert": "false"
                }
            )
        
        # Add to product_images table
        supabase.table('product_images').insert({
            'product_id': db_product['id'],
            'path': storage_path,
            'alt': img_data.get('alt') or product_name,
            'sort_order': i
        }).execute()
        
        temp_file.unlink()
        uploaded += 1
        print(f"  ✓ Uploaded as {filename}")
        
    except Exception as e:
        print(f"  ❌ Error: {e}")

print(f"\n{'='*80}")
print(f"✓ Uploaded {uploaded} images for {product_name}")
