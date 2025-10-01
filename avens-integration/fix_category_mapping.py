#!/usr/bin/env python3
"""
Avens Ürün-Kategori Eşleştirme Düzeltme Scripti
Avens'ten çekilen ürünleri orijinal kategori bilgilerine göre doğru kategorilere eşleştirir.
"""

import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
from datetime import datetime

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'category_mapping_fix_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Ortam değişkenlerini yükle
load_dotenv()

# Supabase bağlantısı
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ortam değişkenleri gerekli!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def load_scraped_products():
    """Scraped product data'yı yükle"""
    json_file = 'scraped-data/fixed_products_2025-09-29T10-49-48-208Z.json'
    
    if not os.path.exists(json_file):
        logger.error(f"{json_file} bulunamadı!")
        return []
    
    with open(json_file, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    logger.info(f"{len(products)} ürün yüklendi")
    return products

def get_all_categories():
    """Veritabanındaki tüm kategorileri al"""
    response = supabase.table('categories').select('*').execute()
    categories = response.data
    
    # Kategori isminden ID'ye mapping oluştur
    category_map = {}
    for cat in categories:
        category_map[cat['name'].lower().strip()] = cat['id']
    
    logger.info(f"{len(categories)} kategori yüklendi")
    return category_map

def normalize_category_name(category_name):
    """Kategori ismini normalize et"""
    # Özel karakterleri temizle
    normalized = category_name.lower().strip()
    
    # Bilinen eşleşmeler
    mappings = {
        'konut tipi fanlar': 'Konut Tipi Fanlar',
        'santrifüj fanlar': 'Santrifüj Fanlar',
        'kanal tipi fanlar': 'Kanal Tipi Fanlar',
        'çatı tipi fanlar': 'Çatı Tipi Fanlar',
        'endüstriyel fanlar': 'Endüstriyel Fanlar',
        'nicotra gebhardt fanlar': 'Nicotra Gebhardt Fanlar',
        'plug fanlar': 'Plug Fanlar',
        'sessiz kanal tipi fanlar': 'Sessiz Kanal Tipi Fanlar',
        'otopark jet fanları': 'Otopark Jet Fanları',
        'duvar tipi kompakt aksiyal fanlar': 'Duvar Tipi Kompakt Aksiyal Fanlar',
        'duman egzoz fanları': 'Duman Egzoz Fanları',
        'basınçlandırma fanları': 'Basınçlandırma Fanları',
        'sığınak havalandırma fanları': 'Sığınak Havalandırma Fanları',
        'ex-proof fanlar (patlama karşı atex fanlar)': 'Ex-Proof Fanlar (Patlama Karşı ATEX Fanlar)',
        'aksesuar': 'Aksesuarlar',
        'aksesuarlar': 'Aksesuarlar',
        'gemici anemostadı': 'Gemici Anemostadı',
        'flexible hava kanalları': 'Flexible Hava Kanalları',
        'hava perdeleri': 'Hava Perdeleri',
        'elektrikli isıtıcılı': 'Elektrikli Isıtıcılı',
        'ortam havalı': 'Ortam Havalı',
        'nem alma cihazları': 'Nem Alma Cihazları',
        'ısı geri kazanım cihazları': 'Isı Geri Kazanım Cihazları',
        'konut tipi': 'Konut Tipi',
        'ticari tip': 'Ticari Tip',
        'hız kontrolü cihazları': 'Hız Kontrolü Cihazları',
        'danfoss': 'DANFOSS',
        'hız anahtarı': 'Hız Anahtarı'
    }
    
    return mappings.get(normalized, category_name)

def fix_category_mappings():
    """Ürün-kategori eşleştirmelerini düzelt"""
    
    # Scraped products ve kategorileri yükle
    scraped_products = load_scraped_products()
    category_map = get_all_categories()
    
    stats = {
        'total': 0,
        'updated': 0,
        'not_found': 0,
        'errors': 0
    }
    
    missing_categories = set()
    
    for product in scraped_products:
        stats['total'] += 1
        
        product_name = product.get('name', '')
        avens_category = product.get('category', '')
        
        if not avens_category:
            logger.warning(f"Ürün kategorisi yok: {product_name}")
            stats['not_found'] += 1
            continue
        
        # Kategoriyi normalize et
        normalized_category = normalize_category_name(avens_category)
        category_key = normalized_category.lower().strip()
        
        # VentHub'da kategoriyi bul
        if category_key not in category_map:
            missing_categories.add(normalized_category)
            logger.warning(f"Kategori bulunamadı: {normalized_category} (Ürün: {product_name})")
            stats['not_found'] += 1
            continue
        
        category_id = category_map[category_key]
        
        # Veritabanındaki ürünü bul ve güncelle
        try:
            # URL bazında ürünü bul
            product_url = product.get('url', '')
            
            # Ürünü description'a göre bul (Comprehensive Avens import içeriyor)
            response = supabase.table('products')\
                .select('id, name, category_id')\
                .ilike('name', f"%{product_name}%")\
                .execute()
            
            if response.data and len(response.data) > 0:
                db_product = response.data[0]
                current_category_id = db_product.get('category_id')
                
                # Eğer kategori farklıysa güncelle
                if current_category_id != category_id:
                    update_response = supabase.table('products')\
                        .update({'category_id': category_id})\
                        .eq('id', db_product['id'])\
                        .execute()
                    
                    logger.info(f"✓ Güncellendi: {product_name} → {normalized_category}")
                    stats['updated'] += 1
                else:
                    logger.debug(f"Zaten doğru kategoride: {product_name}")
            else:
                logger.warning(f"Ürün DB'de bulunamadı: {product_name}")
                stats['not_found'] += 1
                
        except Exception as e:
            logger.error(f"Hata - {product_name}: {str(e)}")
            stats['errors'] += 1
    
    # Özet
    logger.info("\n" + "="*60)
    logger.info("KATEGORI EŞLEŞTİRME DÜZELTMESİ TAMAMLANDI")
    logger.info("="*60)
    logger.info(f"Toplam Ürün: {stats['total']}")
    logger.info(f"Güncellenen: {stats['updated']}")
    logger.info(f"Bulunamayan: {stats['not_found']}")
    logger.info(f"Hata: {stats['errors']}")
    
    if missing_categories:
        logger.warning("\nEksik Kategoriler:")
        for cat in sorted(missing_categories):
            logger.warning(f"  - {cat}")
    
    return stats

if __name__ == "__main__":
    logger.info("Kategori Eşleştirme Düzeltmesi başlatılıyor...")
    try:
        stats = fix_category_mappings()
        logger.info("İşlem tamamlandı!")
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        exit(1)