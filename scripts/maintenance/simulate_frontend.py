from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv('VITE_SUPABASE_URL'),
    os.getenv('VITE_SUPABASE_ANON_KEY')  # Frontend uses ANON key
)

print("=== Simulating Frontend Behavior ===\n")

# Step 1: Get all categories (like getCategories() does)
print("Step 1: Fetching categories...")
response = supabase.table('categories').select('*').order('level').order('name').execute()
categories = response.data
print(f"  Found {len(categories)} categories\n")

# Step 2: Find target category by slug (like frontend does)
slug = 'hava-perdeleri'
print(f"Step 2: Finding category with slug '{slug}' and level=0...")
target_category = None
for cat in categories:
    if cat['slug'] == slug and cat['level'] == 0:
        target_category = cat
        break

if not target_category:
    print("  ERROR: Category not found!")
    exit(1)

print(f"  Found category:")
print(f"    ID: {target_category['id']}")
print(f"    Name: {target_category['name']}")
print(f"    Slug: {target_category['slug']}")
print(f"    Level: {target_category['level']}")
print()

# Step 3: Get subcategories
print(f"Step 3: Finding subcategories with parent_id={target_category['id']}...")
subs = [c for c in categories if c['parent_id'] == target_category['id']]
print(f"  Found {len(subs)} subcategories:")
for sub in subs:
    print(f"    - {sub['name']} (id: {sub['id']}, slug: {sub['slug']})")
print()

# Step 4: Query products (exactly like frontend does)
print(f"Step 4: Querying products with category_id={target_category['id']} and status=active...")
response = supabase.table('products').select('*').eq('category_id', target_category['id']).eq('status', 'active').execute()
products = response.data

print(f"  ✅ Found {len(products)} products\n")

if products:
    print("Products:")
    for p in products[:5]:  # Show first 5
        print(f"  - {p['name']}")
        print(f"    category_id: {p['category_id']}")
        print(f"    subcategory_id: {p['subcategory_id']}")
        print()
else:
    print("❌ NO PRODUCTS FOUND!")
    print("\nDebugging: Let's check what category_ids the products actually have...")
    
    # Get all active products and their category_ids
    all_products = supabase.table('products').select('id,name,category_id').eq('status', 'active').limit(10).execute()
    print(f"\nFirst 10 active products in database:")
    for p in all_products.data:
        print(f"  {p['name']}: category_id={p['category_id']}")
