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

# Hava Perdeleri kategorisini bul
print('=== HAVA PERDELERİ KATEGORİSİ ===')
categories = supabase.table('categories').select('*').ilike('name', '%hava%perde%').execute()
for cat in categories.data:
    cat_id = cat['id']
    cat_name = cat['name']
    parent_id = cat.get('parent_id', 'None')
    slug = cat['slug']
    
    print(f'ID: {cat_id}')
    print(f'İsim: {cat_name}')
    print(f'Parent ID: {parent_id}')
    print(f'Slug: {slug}')
    print()

if categories.data:
    cat_id = categories.data[0]['id']
    cat_name = categories.data[0]['name']
    
    # Bu kategorideki ürünleri kontrol et
    print(f'\n=== {cat_name} KATEGORİSİNDEKİ ÜRÜNLER ===')
    products = supabase.table('products').select('id, name, category_id, subcategory_id').eq('category_id', cat_id).execute()
    print(f'Toplam ürün: {len(products.data)}')
    if products.data:
        for p in products.data[:5]:
            p_name = p['name']
            p_cat = p['category_id']
            p_subcat = p.get('subcategory_id', 'None')
            print(f'- {p_name}: category_id={p_cat}, subcategory_id={p_subcat}')
    
    # Alt kategorileri kontrol et
    print(f'\n=== ALT KATEGORİLER ===')
    subcats = supabase.table('categories').select('*').eq('parent_id', cat_id).execute()
    print(f'Alt kategori sayısı: {len(subcats.data)}')
    for subcat in subcats.data:
        sub_name = subcat['name']
        sub_id = subcat['id']
        print(f'\n- {sub_name} (ID: {sub_id})')
        
        # Bu alt kategorideki ürünler
        subcat_products = supabase.table('products').select('id, name').eq('subcategory_id', sub_id).execute()
        print(f'  Ürün sayısı: {len(subcat_products.data)}')
        if subcat_products.data:
            for sp in subcat_products.data[:3]:
                sp_name = sp['name']
                print(f'    - {sp_name}')

# Tüm Hava Perdesi ürünlerini kontrol et (isimden)
print('\n\n=== TÜM HAVA PERDESİ ÜRÜNLERİ (İSİMDEN) ===')
all_curtain_products = supabase.table('products').select('id, name, category_id, subcategory_id').ilike('name', '%hava%perde%').execute()
print(f'Toplam: {len(all_curtain_products.data)}')
for p in all_curtain_products.data[:10]:
    p_name = p['name']
    p_cat = p['category_id']
    p_subcat = p.get('subcategory_id', 'None')
    print(f'- {p_name}: category_id={p_cat}, subcategory_id={p_subcat}')