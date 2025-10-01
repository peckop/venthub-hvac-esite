from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Check the category ID used by Hava Perdesi products
category_id = '70ead5c0-b93e-40f0-82ae-951aa45861f5'

response = supabase.table('categories').select('*').eq('id', category_id).execute()
if response.data:
    cat = response.data[0]
    print(f"Category found:")
    print(f"  ID: {cat['id']}")
    print(f"  Name: {cat['name']}")
    print(f"  Slug: {cat['slug']}")
    print(f"  Level: {cat['level']}")
    print(f"  Parent ID: {cat['parent_id']}")
else:
    print("Category not found!")

# Also check Hava Perdeleri category
print("\n" + "="*80 + "\n")
response2 = supabase.table('categories').select('*').eq('slug', 'hava-perdeleri').execute()
if response2.data:
    for cat in response2.data:
        print(f"Hava Perdeleri category:")
        print(f"  ID: {cat['id']}")
        print(f"  Name: {cat['name']}")
        print(f"  Slug: {cat['slug']}")
        print(f"  Level: {cat['level']}")
        print(f"  Parent ID: {cat['parent_id']}")
else:
    print("Hava Perdeleri category not found!")
