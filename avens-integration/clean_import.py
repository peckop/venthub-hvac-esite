#!/usr/bin/env python3
"""
Temiz Avens Import - Tüm ürünleri sil ve scraped data'dan yeniden import et
"""

import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
from datetime import datetime
import re

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'clean_import_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# .env yükle (parent directory'den)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Kategori eşleşmeleri
CATEGORY_MAPPINGS = {
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
    'aksesuar': 'Gemici Anemostadı',
    'aksesuarlar': 'Gemici Anemostadı',
    'flexible hava kanalları': 'Flexible Hava Kanalları',
    'hava perdeleri': 'Ortam Havalı',
    'nem alma cihazları': 'Nem Alma Cihazları',
    'ısı geri kazanım cihazları': 'Ticari Tip',
    'hız kontrolü cihazları': 'Hız Anahtarı'
}

# Global counter for unique SKU generation
sku_counter = 0

def generate_sku(name, brand):
    """SKU kodu oluştur"""
    global sku_counter
    sku_counter += 1
    
    # İlk 3 harf brand'den
    brand_part = re.sub(r'[^A-Z]', '', brand.upper())[:3] or 'AVN'
    
    # İlk 3 harf ürün adından
    name_part = re.sub(r'[^A-Z0-9]', '', name.upper())[:3]
    
    # Unique counter
    return f"{brand_part}-{name_part}-{sku_counter:05d}"

def normalize_category(category_name):
    """Kategori ismini normalize et"""
    normalized = category_name.lower().strip()
    return CATEGORY_MAPPINGS.get(normalized, category_name)

def clean_import():
    """Temiz import işlemi"""
    
    logger.info("="*60)
    logger.info("TEMİZ AVENS IMPORT BAŞLIYOR")
    logger.info("="*60)
    
    # 1. ORDER ITEMS SİL (foreign key constraint için)
    logger.info("\n1. Order items siliniyor (foreign key için)...")
    try:
        supabase.table('venthub_order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        logger.info("✓ Order items silindi")
    except Exception as e:
        logger.warning(f"Order items silme hatası (devam ediliyor): {e}")
    
    # 2. TÜM ÜRÜNLERİ SİL
    logger.info("\n2. Mevcut ürünler siliniyor...")
    try:
        response = supabase.table('products').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        logger.info("✓ Tüm ürünler silindi")
    except Exception as e:
        logger.error(f"Ürün silme hatası: {e}")
        return False
    
    # 3. KATEGORİLERİ YÜKLE
    logger.info("\n3. Kategoriler yükleniyor...")
    response = supabase.table('categories').select('*').execute()
    categories = response.data
    
    category_map = {}
    for cat in categories:
        category_map[cat['name'].lower().strip()] = cat['id']
    
    logger.info(f"✓ {len(categories)} kategori yüklendi")
    
    # 4. SCRAPED PRODUCTS YÜKLE
    logger.info("\n4. Scraped ürünler yükleniyor...")
    json_file = 'scraped-data/fixed_products_2025-09-29T10-49-48-208Z.json'
    
    with open(json_file, 'r', encoding='utf-8') as f:
        scraped_products = json.load(f)
    
    logger.info(f"✓ {len(scraped_products)} ürün yüklendi")
    
    # 5. ÜRÜNLERİ İMPORT ET
    logger.info("\n5. Ürünler import ediliyor...")
    
    stats = {
        'total': 0,
        'imported': 0,
        'skipped': 0,
        'errors': 0
    }
    
    batch = []
    BATCH_SIZE = 50
    
    for product in scraped_products:
        stats['total'] += 1
        
        name = product.get('name', '').strip()
        category = product.get('category', '').strip()
        brand = product.get('brand', 'AVenS').strip()
        price_str = product.get('price', '')
        
        # Geçersiz ürünleri atla
        if not name or '@' in name or name == 'satis@avensair.com':
            logger.debug(f"Geçersiz ürün atlandı: {name}")
            stats['skipped'] += 1
            continue
        
        # Kategori eşleştir
        normalized_category = normalize_category(category)
        category_id = category_map.get(normalized_category.lower().strip())
        
        if not category_id:
            logger.warning(f"Kategori bulunamadı: {category} → {normalized_category} (Ürün: {name})")
            stats['skipped'] += 1
            continue
        
        # Fiyat parse et
        price = None
        if price_str and ('TL' in price_str or '₺' in price_str):
            try:
                price_clean = re.sub(r'[^\\d,.]', '', price_str).replace('.', '').replace(',', '.')
                price = float(price_clean) if price_clean else None
            except:
                pass
        
        # Eğer fiyat yoksa varsayılan 0 kullan (NOT NULL constraint için)
        if price is None:
            price = 0
        
        # Ürün objesi oluştur
        product_data = {
            'name': name,
            'brand': brand,
            'category_id': category_id,
            'price': price,
            'sku': generate_sku(name, brand),
            'description': f"{name} - Comprehensive Avens import",
            'status': 'active',
            'stock_qty': 0
        }
        
        batch.append(product_data)
        
        # Batch dolduğunda insert et
        if len(batch) >= BATCH_SIZE:
            try:
                supabase.table('products').insert(batch).execute()
                stats['imported'] += len(batch)
                logger.info(f"✓ {stats['imported']} ürün import edildi...")
                batch = []
            except Exception as e:
                logger.error(f"Batch import hatası: {e}")
                stats['errors'] += len(batch)
                batch = []
    
    # Kalan batch'i insert et
    if batch:
        try:
            supabase.table('products').insert(batch).execute()
            stats['imported'] += len(batch)
            logger.info(f"✓ {stats['imported']} ürün import edildi")
        except Exception as e:
            logger.error(f"Son batch import hatası: {e}")
            stats['errors'] += len(batch)
    
    # ÖZET
    logger.info("\n" + "="*60)
    logger.info("TEMİZ İMPORT TAMAMLANDI")
    logger.info("="*60)
    logger.info(f"Toplam Ürün: {stats['total']}")
    logger.info(f"✓ Import Edilen: {stats['imported']}")
    logger.info(f"→ Atlanan: {stats['skipped']}")
    logger.info(f"✗ Hata: {stats['errors']}")
    logger.info("="*60)
    
    return True

if __name__ == "__main__":
    try:
        success = clean_import()
        if success:
            logger.info("\n✅ Temiz import başarıyla tamamlandı!")
        else:
            logger.error("\n❌ Import başarısız!")
            exit(1)
    except Exception as e:
        logger.error(f"\n❌ Fatal error: {e}")
        exit(1)