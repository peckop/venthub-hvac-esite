from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Use admin key to check RLS status
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Direct test: Try to query with anon key
print("\n" + "="*80)
print("Testing query with ANON key (like frontend)...\n")

anon_supabase = create_client(
    os.getenv('VITE_SUPABASE_URL'),
    os.getenv('VITE_SUPABASE_ANON_KEY')
)

response = anon_supabase.table('products').select('count', count='exact').eq('status', 'active').execute()
print(f"Total active products visible to ANON: {response.count}")

# Try specific category
response2 = anon_supabase.table('products').select('count', count='exact').eq('category_id', '70ead5c0-b93e-40f0-82ae-951aa45861f5').eq('status', 'active').execute()
print(f"Hava Perdeleri products visible to ANON: {response2.count}")
