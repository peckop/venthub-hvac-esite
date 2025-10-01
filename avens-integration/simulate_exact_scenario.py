from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print('=== TAM SENARYO SİMÜLASYONU: HAVA PERDELERİ ===\n')
print('URL: /category/hava-perdeleri\n')

# 1. Kategorileri çek
print('1️⃣  Kategorileri getir...')
categories = supabase.table('categories').select('*').execute().data
print(f'   ✅ {len(categories)} kategori yüklendi\n')

# 2. URL'den kategori bul
slug = 'hava-perdeleri'
parentSlug = None

print(f'2️⃣  URL\'den kategori bul (slug: {slug})...')
targetCategory = None

if parentSlug and slug:
    print('   Alt kategori sayfası algılandı')
    targetParentCategory = next((c for c in categories if c['slug'] == parentSlug and c['level'] == 0), None)
    targetCategory = next((c for c in categories if c['slug'] == slug and c['level'] == 1), None)
elif slug:
    print('   Ana kategori sayfası algılandı')
    targetCategory = next((c for c in categories if c['slug'] == slug and c['level'] == 0), None)

if not targetCategory:
    print('   ❌ KATEGORİ BULUNAMADI!')
    exit(1)

print(f'   ✅ Kategori bulundu: {targetCategory["name"]}')
print(f'      ID: {targetCategory["id"]}')
print(f'      Level: {targetCategory["level"]}\n')

# 3. Alt kategorileri bul
print('3️⃣  Alt kategorileri bul...')
subs = [c for c in categories if c.get('parent_id') == targetCategory['id']]
print(f'   ✅ {len(subs)} alt kategori bulundu')
for sub in subs:
    print(f'      - {sub["name"]} ({sub["slug"]})')
print()

# 4. Ürün query'si
print('4️⃣  Ürün query mantığı:')
print(f'   targetCategory.level = {targetCategory["level"]}')
print(f'   len(subs) = {len(subs)}')
print()

if targetCategory['level'] == 0 and len(subs) > 0:
    print('   ✅ Koşul: Ana kategori + alt kategoriler var')
    print(f'   QUERY: category_id = {targetCategory["id"]}')
    print()
    
    print('5️⃣  Ürünleri getir...')
    products = supabase.table('products').select('id, name, category_id, subcategory_id, status').eq('category_id', targetCategory['id']).eq('status', 'active').execute()
    
    print(f'   📦 SONUÇ: {len(products.data)} ürün bulundu\n')
    
    if products.data:
        print('   Ürünler:')
        for i, p in enumerate(products.data, 1):
            print(f'   {i}. {p["name"]}')
            print(f'      category_id: {p["category_id"]}')
            print(f'      subcategory_id: {p.get("subcategory_id", "None")}')
            print(f'      status: {p["status"]}')
            print()
    else:
        print('   ❌ ÜRÜN YOK!\n')
        
        # Debug
        print('   🔍 DEBUG:')
        all_products = supabase.table('products').select('id, name, category_id, status').execute()
        hava_products = [p for p in all_products.data if p['category_id'] == targetCategory['id']]
        
        print(f'      Toplam ürün: {len(all_products.data)}')
        print(f'      Bu category_id ile ürün: {len(hava_products)}')
        
        if hava_products:
            print(f'      İlk 3 ürün:')
            for p in hava_products[:3]:
                print(f'         - {p["name"]} (status: {p["status"]})')
        
        active = [p for p in hava_products if p['status'] == 'active']
        inactive = [p for p in hava_products if p['status'] != 'active']
        print(f'      Active: {len(active)}, Inactive: {len(inactive)}')

elif targetCategory['level'] == 1:
    print('   ✅ Koşul: Alt kategori')
    print(f'   QUERY: subcategory_id = {targetCategory["id"]}')
else:
    print('   ✅ Koşul: Diğer (getProductsByCategory)')

print('\n' + '='*60)
print('SİMÜLASYON TAMAMLANDI')
print('='*60)