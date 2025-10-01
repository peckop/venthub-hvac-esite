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

print('=== DEBUG: KATEGORİ QUERY SİMÜLASYONU ===\n')

# Senaryoları simüle et
scenarios = [
    {
        'name': 'Ana Sayfa → Hava Perdeleri',
        'parentSlug': None,
        'slug': 'hava-perdeleri'
    },
    {
        'name': 'Hava Perdeleri → Elektrikli Isıtıcılı',
        'parentSlug': 'hava-perdeleri',
        'slug': 'elektrikli-isitici'
    },
    {
        'name': 'Hava Perdeleri → Ortam Havalı',
        'parentSlug': 'hava-perdeleri',
        'slug': 'ortam-havali'
    }
]

for scenario in scenarios:
    print(f"\n{'='*60}")
    print(f"SENARYO: {scenario['name']}")
    print(f"{'='*60}")
    print(f"parentSlug: {scenario['parentSlug']}")
    print(f"slug: {scenario['slug']}")
    
    # Kategorileri çek
    categories_response = supabase.table('categories').select('*').execute()
    categories = categories_response.data
    
    targetCategory = None
    targetParentCategory = None
    
    if scenario['parentSlug'] and scenario['slug']:
        # Alt kategori sayfası
        print("\n→ Alt kategori sayfası algılandı")
        targetParentCategory = next((c for c in categories if c['slug'] == scenario['parentSlug'] and c['level'] == 0), None)
        targetCategory = next((c for c in categories if c['slug'] == scenario['slug'] and c['level'] == 1), None)
        print(f"  Parent kategori bulundu: {targetParentCategory['name'] if targetParentCategory else 'YOK!'}")
        print(f"  Alt kategori bulundu: {targetCategory['name'] if targetCategory else 'YOK!'}")
    elif scenario['slug']:
        # Ana kategori sayfası
        print("\n→ Ana kategori sayfası algılandı")
        targetCategory = next((c for c in categories if c['slug'] == scenario['slug'] and c['level'] == 0), None)
        print(f"  Ana kategori bulundu: {targetCategory['name'] if targetCategory else 'YOK!'}")
    
    if not targetCategory:
        print("\n❌ KATEGORİ BULUNAMADI!")
        continue
    
    print(f"\n✅ Kategori: {targetCategory['name']} (Level: {targetCategory['level']})")
    print(f"   ID: {targetCategory['id']}")
    
    # Alt kategorileri bul
    subs = [c for c in categories if c.get('parent_id') == targetCategory['id']]
    print(f"   Alt kategori sayısı: {len(subs)}")
    
    # Ürün query'sini belirle
    print("\n→ Ürün query'si:")
    
    if targetCategory['level'] == 0 and len(subs) > 0:
        print("  TİP: Ana kategori + alt kategoriler var")
        print(f"  QUERY: category_id = '{targetCategory['id']}'")
        
        products = supabase.table('products').select('id, name, category_id, subcategory_id, status').eq('category_id', targetCategory['id']).eq('status', 'active').execute()
        
    elif targetCategory['level'] == 1:
        print("  TİP: Alt kategori")
        print(f"  QUERY: subcategory_id = '{targetCategory['id']}'")
        
        products = supabase.table('products').select('id, name, category_id, subcategory_id, status').eq('subcategory_id', targetCategory['id']).eq('status', 'active').execute()
    else:
        print("  TİP: Diğer")
        products = supabase.table('products').select('id, name, category_id, subcategory_id, status').or_(f"category_id.eq.{targetCategory['id']},subcategory_id.eq.{targetCategory['id']}").eq('status', 'active').execute()
    
    print(f"\n📦 SONUÇ: {len(products.data)} ürün bulundu")
    
    if products.data:
        print("\nÜrünler:")
        for i, p in enumerate(products.data[:5], 1):
            print(f"  {i}. {p['name']}")
            print(f"     category_id: {p['category_id']}")
            print(f"     subcategory_id: {p.get('subcategory_id', 'None')}")
            print(f"     status: {p['status']}")
        
        if len(products.data) > 5:
            print(f"  ... ve {len(products.data) - 5} ürün daha")
    else:
        print("\n❌ HİÇ ÜRÜN BULUNAMADI!")
        print("\nOlası sorunlar:")
        print("  - Ürünlerin category_id'si yanlış")
        print("  - Ürünlerin status'ü 'active' değil")
        print("  - Query mantığı hatalı")

print(f"\n\n{'='*60}")
print("DEBUG TAMAMLANDI")
print(f"{'='*60}")