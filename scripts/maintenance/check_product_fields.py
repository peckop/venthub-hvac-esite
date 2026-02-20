from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase connection
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get all active products
response = supabase.table('products').select('id,name,category_id,subcategory_id').eq('status', 'active').execute()
products = response.data

print(f"Total active products: {len(products)}\n")

# Check products with "Hava" or "VOLCANO" in name
print("Products related to Hava Perdeleri:")
print("-" * 80)
for p in products:
    if 'Hava' in p['name'] or 'VOLCANO' in p['name'] or 'VHC' in p['name']:
        print(f"Name: {p['name']}")
        print(f"  category_id: {p['category_id']}")
        print(f"  subcategory_id: {p['subcategory_id']}")
        print()

# Get statistics
cat_only = [p for p in products if p['category_id'] is not None and p['subcategory_id'] is None]
subcat_only = [p for p in products if p['category_id'] is None and p['subcategory_id'] is not None]
both = [p for p in products if p['category_id'] is not None and p['subcategory_id'] is not None]
neither = [p for p in products if p['category_id'] is None and p['subcategory_id'] is None]

print("\nProduct categorization statistics:")
print(f"Only category_id set: {len(cat_only)}")
print(f"Only subcategory_id set: {len(subcat_only)}")
print(f"Both set: {len(both)}")
print(f"Neither set: {len(neither)}")
