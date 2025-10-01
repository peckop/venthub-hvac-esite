#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

categories = supabase.table('categories').select('*').execute().data

print("=== KATEGORİLER (lower) ===")
for cat in sorted(categories, key=lambda x: x['name']):
    name_lower = cat['name'].lower().strip()
    name_normalized = name_lower.replace('ı', 'i').replace('İ', 'i').replace('ğ', 'g').replace('ş', 's').replace('ç', 'c').replace('ü', 'u').replace('ö', 'o')
    
    if 'elektrik' in name_lower or 'ısıtıcı' in name_lower or 'isitici' in name_normalized:
        print(f"  {cat['name']}")
        print(f"    lower: '{name_lower}'")
        print(f"    normalized: '{name_normalized}'")
        print()

print("\nARAMA: 'elektrikli ısıtıcılı'")
print("ARAMA: 'elektrikli isitici'")