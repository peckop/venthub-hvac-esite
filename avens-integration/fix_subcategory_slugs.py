from supabase import create_client
import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

logger.info("=== ALT KATEGORİ SLUG'LARINI DÜZELTİYORUZ ===\n")

# Hava Perdeleri alt kategorileri
fixes = [
    {
        'id': '71688089-4e64-4996-ae25-68c76abe23cd',
        'old_slug': 'elektrikli-isitici-hava-perdeleri',
        'new_slug': 'elektrikli-isitici',
        'name': 'Elektrikli Isıtıcılı'
    },
    {
        'id': '9db7b3c8-db21-422a-9647-9b47a137f719',
        'old_slug': 'ortam-havali-hava-perdeleri',
        'new_slug': 'ortam-havali',
        'name': 'Ortam Havalı'
    }
]

for fix in fixes:
    logger.info(f"Düzeltiliyor: {fix['name']}")
    logger.info(f"  Eski slug: {fix['old_slug']}")
    logger.info(f"  Yeni slug: {fix['new_slug']}")
    
    try:
        result = supabase.table('categories').update({
            'slug': fix['new_slug']
        }).eq('id', fix['id']).execute()
        
        logger.info(f"  ✅ Başarılı!")
    except Exception as e:
        logger.error(f"  ❌ Hata: {e}")
    
    print()

logger.info("=== TAMAMLANDI ===")
logger.info("Artık URL'ler doğru çalışmalı!")
logger.info("  - /category/hava-perdeleri/elektrikli-isitici")
logger.info("  - /category/hava-perdeleri/ortam-havali")