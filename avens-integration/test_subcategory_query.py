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

# Elektrikli Isıtıcılı alt kategorisi
elektrikli_id = '71688089-4e64-4996-ae25-68c76abe23cd'

print('=== TEST: ALT KATEGORİ QUERY ===\n')

# Test 1: subcategory_id ile sorgula
print('Test 1: subcategory_id ile')
products = supabase.table('products').select('id, name').eq('subcategory_id', elektrikli_id).execute()
print(f'Sonuç: {len(products.data)} ürün')
for p in products.data:
    print(f'  - {p["name"]}')

# Test 2: subcategory_id + status = active
print('\nTest 2: subcategory_id + status=active ile')
products2 = supabase.table('products').select('id, name').eq('subcategory_id', elektrikli_id).eq('status', 'active').execute()
print(f'Sonuç: {len(products2.data)} ürün')
for p in products2.data:
    print(f'  - {p["name"]}')

# Test 3: Ana kategori ID'si ile
hava_perdeleri_id = '70ead5c0-b93e-40f0-82ae-951aa45861f5'
print('\nTest 3: Ana kategori (category_id) ile')
products3 = supabase.table('products').select('id, name').eq('category_id', hava_perdeleri_id).eq('status', 'active').execute()
print(f'Sonuç: {len(products3.data)} ürün')
for p in products3.data[:5]:
    print(f'  - {p["name"]}')
if len(products3.data) > 5:
    print(f'  ... ve {len(products3.data) - 5} ürün daha')

# Test 4: Ortam Havalı
ortam_havali_id = '9db7b3c8-db21-422a-9647-9b47a137f719'
print('\nTest 4: Ortam Havalı alt kategorisi')
products4 = supabase.table('products').select('id, name').eq('subcategory_id', ortam_havali_id).eq('status', 'active').execute()
print(f'Sonuç: {len(products4.data)} ürün')
for p in products4.data:
    print(f'  - {p["name"]}')