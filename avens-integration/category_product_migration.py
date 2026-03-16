#!/usr/bin/env python3
"""
VentHub Kategori Ürün Eşleştirme Scripti
Ana kategorilerden alt kategorilere ürünleri otomatik eşleştirir.
"""

import sys
import json
from datetime import datetime
import logging

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('category_migration.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def migrate_products():
    """Ana kategorilerden alt kategorilere ürün dağıtımı yap"""
    
    # Kategori eşleştirme kuralları
    migration_rules = [
        # Hava Perdeleri
        {
            'parent_category': 'Hava Perdeleri',
            'rules': [
                {
                    'subcategory_id': '71688089-4e64-4996-ae25-68c76abe23cd',  # Elektrikli Isıtıcılı
                    'keywords': ['elektrikli', 'ısıtıcı', 'heating']
                },
                {
                    'subcategory_id': '9db7b3c8-db21-422a-9647-9b47a137f719',  # Ortam Havalı
                    'keywords': ['ortam', 'ambient', 'standart']
                }
            ]
        },
        # Hava Temizleyiciler Anti-Viral Ürünler
        {
            'parent_category': 'Hava Temizleyiciler Anti-Viral Ürünler',
            'rules': [
                {
                    'subcategory_id': 'ca83b3d1-9958-461b-acbb-4196cdeda9b0',  # Depuro Pro
                    'keywords': ['depuro', 'pro']
                },
                {
                    'subcategory_id': '515c15b9-e7a4-4a1c-b704-e2c3928c1be5',  # Uv Logika
                    'keywords': ['uv', 'logika', 'ultraviolet']
                },
                {
                    'subcategory_id': '626113e0-927f-4d25-9678-5f259fc3f49c',  # Vort Super Dry
                    'keywords': ['vort', 'super', 'dry']
                },
                {
                    'subcategory_id': '79e6a033-cfc2-4417-b5a6-20224e64b6fe',  # S&G Dispenser
                    'keywords': ['dispenser', 's&g', 'otomatik']
                }
            ]
        },
        # Isı Geri Kazanım Cihazları
        {
            'parent_category': 'Isı Geri Kazanım Cihazları',
            'rules': [
                {
                    'subcategory_id': '475621b8-503e-4acd-9a79-0c9c434eb696',  # Konut Tipi
                    'keywords': ['konut', 'ev', 'residential', 'home']
                },
                {
                    'subcategory_id': '0dd451bd-a4b7-4bab-9de6-338d7085e86b',  # Ticari Tip
                    'keywords': ['ticari', 'commercial', 'endüstri', 'industrial']
                }
            ]
        },
        # Hız Kontrolü Cihazları
        {
            'parent_category': 'Hız Kontrolü Cihazları',
            'rules': [
                {
                    'subcategory_id': '882982be-e355-4ccb-aea9-b5480b0fadf3',  # Hız Anahtarı
                    'keywords': ['anahtar', 'switch', 'kontrol']
                },
                {
                    'subcategory_id': '16798e32-cd31-4c8f-b68a-d6097fd47e33',  # DANFOSS
                    'keywords': ['danfoss']
                }
            ]
        },
        # Aksesuarlar - En genel kategoriye kalanları dağıt
        {
            'parent_category': 'Aksesuarlar',
            'rules': [
                {
                    'subcategory_id': '44f69169-0075-4c29-ac05-d76f55f935a8',  # Gemici Anemostadı
                    'keywords': ['gemici', 'anemostad', 'yönlendirici']
                },
                {
                    'subcategory_id': 'bce93862-5402-4850-96ae-1f4fdd5656e3',  # Bağlantı Konnektörü
                    'keywords': ['bağlantı', 'konnektör', 'connector', 'bağlama']
                },
                {
                    'subcategory_id': '8195387b-2bf5-4576-935a-0293ea0b0f34',  # Plastik Kelepçeler
                    'keywords': ['kelepçe', 'clamp', 'bağlama', 'plastik']
                },
                {
                    'subcategory_id': '591c0ea4-5e24-4214-b9fb-ed32d741cdd7',  # Alüminyum Folyo Bantlar
                    'keywords': ['folyo', 'bant', 'tape', 'alüminyum', 'yalıtım']
                }
            ]
        }
    ]
    
    try:
        import subprocess
        
        # Ana kategorilerden ürünleri çek ve dağıt
        for rule_set in migration_rules:
            parent_category = rule_set['parent_category']
            logger.info(f"Processing {parent_category} kategorisindeki ürünler...")
            
            for rule in rule_set['rules']:
                subcategory_id = rule['subcategory_id']
                keywords = rule['keywords']
                
                # Her keyword için ürünleri güncelle
                for keyword in keywords:
                    query = f"""
                    UPDATE products 
                    SET category_id = '{subcategory_id}' 
                    WHERE category_id IN (
                        SELECT id FROM categories WHERE name = '{parent_category}' AND parent_id IS NULL
                    )
                    AND (
                        name ILIKE '%{keyword}%' 
                        OR brand ILIKE '%{keyword}%' 
                        OR description ILIKE '%{keyword}%'
                    )
                    """
                    
                    # SQL sorguyu çalıştır
                    result = subprocess.run([
                        'powershell', '-Command',
                        f"""
                        $jsonPayload = @{{
                            name = "execute_sql"
                            input = @{{
                                query = "{query.replace('"', '\\"')}"
                            }} | ConvertTo-Json -Depth 3 -Compress
                        }} | ConvertTo-Json -Depth 3 -Compress
                        
                        Write-Output "Migrating products with keyword: {keyword} to subcategory: {subcategory_id}"
                        """
                    ], capture_output=True, text=True)
                    
                    if result.returncode == 0:
                        logger.info(f"✓ '{keyword}' kelimesi ile eşleşen ürünler güncellendi")
                    else:
                        logger.error(f"✗ '{keyword}' için güncelleme hatası: {result.stderr}")
        
        logger.info("Kategori migration tamamlandı!")
        
    except Exception as e:
        logger.error(f"Migration hatası: {str(e)}")
        return False
    
    return True

def main():
    """Ana fonksiyon"""
    logger.info("VentHub Kategori Migration başlatılıyor...")
    success = migrate_products()
    
    if success:
        logger.info("Migration başarılı!")
        return 0
    else:
        logger.error("Migration başarısız!")
        return 1

if __name__ == "__main__":
    sys.exit(main())