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

print('=== KATEGORİ LEVEL KONTROLÜ ===\n')

# Hava Perdeleri kategorisi
hava_perdeleri = supabase.table('categories').select('*').eq('slug', 'hava-perdeleri').execute()

if hava_perdeleri.data:
    cat = hava_perdeleri.data[0]
    print(f'Hava Perdeleri:')
    print(f'  ID: {cat["id"]}')
    print(f'  Slug: {cat["slug"]}')
    print(f'  Level: {cat.get("level", "LEVEL YOK!")}')
    print(f'  Parent ID: {cat.get("parent_id", "None")}')
    
    # Alt kategoriler
    print(f'\n  Alt Kategoriler:')
    subs = supabase.table('categories').select('*').eq('parent_id', cat['id']).execute()
    for sub in subs.data:
        print(f'    - {sub["name"]}')
        print(f'      Slug: {sub["slug"]}')
        print(f'      Level: {sub.get("level", "LEVEL YOK!")}')
        print(f'      ID: {sub["id"]}')
        print()

# Tüm kategorilerin level değerlerini kontrol et
print('\n=== TÜM KATEGORİLER LEVEL DURUMU ===\n')
all_cats = supabase.table('categories').select('id, name, slug, level, parent_id').order('name').execute()

level_0 = [c for c in all_cats.data if c.get('level') == 0]
level_1 = [c for c in all_cats.data if c.get('level') == 1]
no_level = [c for c in all_cats.data if c.get('level') is None]

print(f'Level 0 (Ana Kategoriler): {len(level_0)}')
for c in level_0:
    print(f'  - {c["name"]} ({c["slug"]})')

print(f'\nLevel 1 (Alt Kategoriler): {len(level_1)}')
for c in level_1:
    print(f'  - {c["name"]} ({c["slug"]})')

if no_level:
    print(f'\nLEVEL OLMAYAN: {len(no_level)}')
    for c in no_level:
        print(f'  - {c["name"]} ({c["slug"]}) - parent_id: {c.get("parent_id", "None")}')