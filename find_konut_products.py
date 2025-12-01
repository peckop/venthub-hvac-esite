import json
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Load scraped data
with open('avens-integration/scraped-data/all_products.json', 'r', encoding='utf-8') as f:
    scraped_products = json.load(f)

print(f"Total scraped products: {len(scraped_products)}\n")

# Get Konut Tipi Fanlar category from database
response = supabase.table('categories').select('id,name,slug').ilike('name', '%konut%').execute()
categories = response.data

print("Konut categories in database:")
for cat in categories:
    print(f"  - {cat['name']} (slug: {cat['slug']}, id: {cat['id']})")

if not categories:
    print("❌ No Konut category found in database")
    exit(1)

konut_category = categories[0]
print(f"\nUsing category: {konut_category['name']}\n")

# Get products in this category from database
prod_response = supabase.table('products').select('id,name,sku,brand').eq('category_id', konut_category['id']).eq('status', 'active').execute()
db_products = prod_response.data

print(f"Found {len(db_products)} products in database\n")

# Show sample products
print("Sample products in database:")
for p in db_products[:5]:
    print(f"  - {p['name']} (SKU: {p['sku']})")

# Check which scraped products might match
print(f"\n{'='*80}\n")
print("Looking for matches in scraped data...\n")

# Try to find products with "konut" or similar keywords
konut_related = [p for p in scraped_products if any(keyword in p.get('name', '').lower() for keyword in ['punto', 'quadro', 'vario', 'ghost', 'linea'])]

print(f"Found {len(konut_related)} potentially related products in scraped data\n")

if konut_related:
    print("Sample scraped products:")
    for p in konut_related[:5]:
        print(f"\n  Name: {p.get('name', 'N/A')}")
        print(f"  Brand: {p.get('brand', 'N/A')}")
        if 'image_url' in p:
            print(f"  Image: {p['image_url'][:80]}...")
