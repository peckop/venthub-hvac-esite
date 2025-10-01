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

print('=== TÜM KATEGORİ HİYERARŞİSİ ANALİZİ ===\n')

# Tüm kategorileri çek
all_cats = supabase.table('categories').select('*').order('name').execute()

# Ana kategorileri grupla
main_categories = [c for c in all_cats.data if c.get('level') == 0 or c.get('parent_id') is None]
sub_categories = [c for c in all_cats.data if c.get('level') == 1 or c.get('parent_id') is not None]

print(f"TOPLAM: {len(all_cats.data)} kategori")
print(f"Ana Kategoriler: {len(main_categories)}")
print(f"Alt Kategoriler: {len(sub_categories)}")
print()

# Hiyerarşiyi göster
for main in main_categories:
    main_id = main['id']
    main_name = main['name']
    main_slug = main['slug']
    
    # Bu ana kategorinin alt kategorileri
    subs = [c for c in sub_categories if c.get('parent_id') == main_id]
    
    # Ürün sayısı
    products = supabase.table('products').select('id').eq('category_id', main_id).execute()
    
    print(f"📁 {main_name}")
    print(f"   Slug: {main_slug}")
    print(f"   ID: {main_id}")
    print(f"   Direkt ürün sayısı: {len(products.data)}")
    
    if subs:
        print(f"   Alt kategoriler ({len(subs)}):")
        for sub in subs:
            sub_products = supabase.table('products').select('id').eq('subcategory_id', sub['id']).execute()
            print(f"      ├─ {sub['name']}")
            print(f"      │  Slug: {sub['slug']}")
            print(f"      │  ID: {sub['id']}")
            print(f"      │  Ürün: {len(sub_products.data)}")
    print()

# Yanlış parent_id olanları bul
print("\n=== YANLIŞLIK KONTROLÜ ===\n")

orphans = []
wrong_parents = []

for sub in sub_categories:
    parent_id = sub.get('parent_id')
    if not parent_id:
        orphans.append(sub)
        continue
    
    # Parent gerçekten ana kategori mi?
    parent = next((c for c in all_cats.data if c['id'] == parent_id), None)
    if not parent:
        wrong_parents.append((sub, "Parent bulunamadı!"))
    elif parent.get('level') != 0:
        wrong_parents.append((sub, f"Parent '{parent['name']}' ana kategori değil (level={parent.get('level')})"))

if orphans:
    print(f"⚠️  Parent ID'si olmayan alt kategoriler ({len(orphans)}):")
    for o in orphans:
        print(f"   - {o['name']} ({o['slug']})")

if wrong_parents:
    print(f"\n❌ Yanlış parent'a sahip kategoriler ({len(wrong_parents)}):")
    for cat, reason in wrong_parents:
        print(f"   - {cat['name']} ({cat['slug']}): {reason}")

if not orphans and not wrong_parents:
    print("✅ Hiyerarşi doğru görünüyor!")