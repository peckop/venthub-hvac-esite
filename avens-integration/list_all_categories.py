from supabase import create_client
import os
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print('=== TÜM KATEGORİLER ===\n')

# Ana kategorileri çek
main_cats = supabase.table('categories').select('*').eq('level', 0).order('name').execute()

for main_cat in main_cats.data:
    cat_id = main_cat['id']
    cat_name = main_cat['name']
    slug = main_cat['slug']
    
    print(f'📁 {cat_name} (slug: {slug})')
    print(f'   ID: {cat_id}')
    
    # Bu kategorideki ürün sayısı
    products = supabase.table('products').select('id').eq('category_id', cat_id).execute()
    print(f'   Ürün sayısı: {len(products.data)}')
    
    # Alt kategoriler
    sub_cats = supabase.table('categories').select('*').eq('parent_id', cat_id).order('name').execute()
    
    if sub_cats.data:
        print(f'   Alt kategoriler:')
        for sub_cat in sub_cats.data:
            sub_id = sub_cat['id']
            sub_name = sub_cat['name']
            sub_slug = sub_cat['slug']
            
            # Alt kategorideki ürün sayısı
            sub_products = supabase.table('products').select('id').eq('subcategory_id', sub_id).execute()
            
            print(f'      └─ {sub_name} (slug: {sub_slug}) - {len(sub_products.data)} ürün')
    
    print()

print(f'\n=== ÖZET ===')
print(f'Toplam ana kategori: {len(main_cats.data)}')

total_subs = supabase.table('categories').select('id').eq('level', 1).execute()
print(f'Toplam alt kategori: {len(total_subs.data)}')

total_products = supabase.table('products').select('id').eq('status', 'active').execute()
print(f'Toplam aktif ürün: {len(total_products.data)}')