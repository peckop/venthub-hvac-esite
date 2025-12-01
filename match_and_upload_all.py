"""
Basit yaklaşım: Mevcut scraped data'daki tüm ürünleri veritabanındakilerle eşleştir
ve fotoğrafları yükle.
"""
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

# Load scraped data
with open('avens-integration/scraped-data/all_products.json', 'r', encoding='utf-8') as f:
    scraped_products = json.load(f)

print(f"Scraped products: {len(scraped_products)}")

# Get ALL products from database (no images yet)
response = supabase.table('products').select('id,name,sku,brand,category_id').eq('status', 'active').execute()
db_products = response.data

# Filter products without images
products_without_images = []
for product in db_products:
    img_check = supabase.table('product_images').select('id').eq('product_id', product['id']).execute()
    if not img_check.data:
        products_without_images.append(product)

print(f"Products without images: {len(products_without_images)}")

# Match and upload
matched = 0
uploaded = 0

temp_dir = Path('temp_images')
temp_dir.mkdir(exist_ok=True)

for db_product in products_without_images[:20]:  # İlk 20 ürün
    db_name = db_product['name'].strip().upper()
    
    # Scraped data'da ara
    for scraped in scraped_products:
        scraped_name = scraped.get('name', '').strip().upper()
        
        if scraped_name and (scraped_name in db_name or db_name in scraped_name):
            image_url = scraped.get('image_url')
            if not image_url:
                continue
                
            matched += 1
            print(f"\n✓ Match #{matched}: {db_product['name'][:50]}")
            print(f"  URL: {image_url[:80]}")
            
            try:
                # Fix URL
                fixed_url = image_url.replace('.comuploads/', '.com/uploads/')
                
                # Download
                response = requests.get(fixed_url, timeout=30)
                response.raise_for_status()
                
                # Save temp
                ext = Path(urlparse(fixed_url).path).suffix or '.png'
                temp_file = temp_dir / f"{db_product['id']}{ext}"
                with open(temp_file, 'wb') as f:
                    f.write(response.content)
                
                # Upload to Supabase
                filename = f"{db_product['sku']}-{uuid.uuid4().hex[:8]}{ext}"
                storage_path = f"products/{filename}"
                
                with open(temp_file, 'rb') as f:
                    supabase.storage.from_('product-images').upload(
                        path=storage_path,
                        file=f,
                        file_options={"content-type": f"image/{ext[1:]}", "cache-control": "3600"}
                    )
                
                # Add to product_images
                supabase.table('product_images').insert({
                    'product_id': db_product['id'],
                    'path': storage_path,
                    'alt': db_product['name'],
                    'sort_order': 1
                }).execute()
                
                temp_file.unlink()
                uploaded += 1
                print(f"  ✓ Uploaded")
                time.sleep(0.3)
                break
                
            except Exception as e:
                print(f"  ❌ Error: {e}")
                continue

print(f"\n{'='*80}")
print(f"\nMatched: {matched}")
print(f"Uploaded: {uploaded}")
