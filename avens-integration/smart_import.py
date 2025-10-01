#!/usr/bin/env python3
"""
Akıllı Kategori Eşleştirme ile Temiz Import
Ürün isimlerine bakarak doğru alt kategorilere yerleştirir
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
        logging.FileHandler(f'smart_import_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# .env yükle
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Global counter for unique SKU
sku_counter = 0

def generate_sku(name, brand):
    """SKU kodu oluştur"""
    global sku_counter
    sku_counter += 1
    
    brand_part = re.sub(r'[^A-Z]', '', brand.upper())[:3] or 'AVN'
    name_part = re.sub(r'[^A-Z0-9]', '', name.upper())[:3]
    
    return f"{brand_part}-{name_part}-{sku_counter:05d}"

def get_smart_category_id(product_name, scraped_category, category_map):
    """
    Ürün ismine ve scraped kategoriye bakarak en uygun kategori ID'sini bul
    """
    name_lower = product_name.lower()
    scraped_lower = scraped_category.lower().strip()
    
    # Hava Perdeleri için özel mantık
    if 'hava perdeleri' in scraped_lower or 'hava perdesi' in name_lower:
        # Elektrikli ısıtıcılı mı?
        # Türkçe karakterleri normalize et
        name_normalized = name_lower.replace('ı', 'i').replace('İ', 'i').replace('ğ', 'g').replace('ş', 's').replace('ç', 'c').replace('ü', 'u').replace('ö', 'o')
        
        if any(k in name_normalized for k in ['elektrik', 'isitici', 'electric', 'heater']):
            # Normalize edilmiş halde ara
            cat_id = category_map.get('elektrikli isiticili')
            if cat_id:
                logger.info(f"[SMART] '{product_name}' -> Elektrikli Isıtıcılı")
                return cat_id
            else:
                logger.warning(f"[SMART] Elektrikli Isıtıcılı kategorisi bulunamadı!")
        
        # Su ısıtmalı mı?
        if any(k in name_normalized for k in ['su isitici', 'water', 'sicak su']):
            cat_id = category_map.get('su ısıtıcılı')
            if cat_id:
                logger.info(f"[SMART] '{product_name}' -> Su Isıtıcılı")
                return cat_id
        
        # Varsayılan: Ortam Havalı
        cat_id = category_map.get('ortam havalı')
        if cat_id:
            logger.info(f"[SMART] '{product_name}' -> Ortam Havalı (default)")
            return cat_id
    
    # Aksesuarlar için özel mantık
    if 'aksesuar' in scraped_lower:
        # Gemici anemostadı mı?
        if 'gemici' in name_lower or 'anemosta' in name_lower:
            cat_id = category_map.get('gemici anemostadı')
            if cat_id:
                logger.debug(f"'{product_name}' -> Gemici Anemostadı")
                return cat_id
        
        # Bağlantı konnektörü mü?
        if 'konnektör' in name_lower or 'bağlantı' in name_lower:
            cat_id = category_map.get('bağlantı konnektörü')
            if cat_id:
                return cat_id
        
        # Plastik kelepçe mi?
        if 'kelepçe' in name_lower:
            cat_id = category_map.get('plastik kelepçeler')
            if cat_id:
                return cat_id
        
        # Folyo bant mı?
        if 'folyo' in name_lower or 'bant' in name_lower:
            cat_id = category_map.get('alüminyum folyo bantlar')
            if cat_id:
                return cat_id
    
    # Flexible Kanallar
    if 'flexible' in scraped_lower or 'kanal' in scraped_lower:
        if 'flexible' in name_lower:
            cat_id = category_map.get('flexible hava kanalları')
            if cat_id:
                logger.debug(f"'{product_name}' -> Flexible Hava Kanalları")
                return cat_id
    
    # Isı Geri Kazanım için özel mantık
    if 'ısı geri kazanım' in scraped_lower or 'heat recovery' in scraped_lower:
        # Konut tipi mi, ticari tip mi?
        if any(k in name_lower for k in ['konut', 'residential', 'ev']):
            cat_id = category_map.get('konut tipi')
            if cat_id:
                logger.debug(f"'{product_name}' -> Konut Tipi (IGK)")
                return cat_id
        else:
            cat_id = category_map.get('ticari tip')
            if cat_id:
                logger.debug(f"'{product_name}' -> Ticari Tip (IGK)")
                return cat_id
    
    # Hız Kontrolü Cihazları
    if 'hız kontrol' in scraped_lower:
        # Hız anahtarı mı, DANFOSS mu?
        if 'danfoss' in name_lower:
            cat_id = category_map.get('danfoss')
            if cat_id:
                return cat_id
        else:
            cat_id = category_map.get('hız anahtarı')
            if cat_id:
                return cat_id
    
    # Standart kategori eşleştirmeleri
    CATEGORY_MAPPINGS = {
        'konut tipi fanlar': 'Konut Tipi Fanlar',
        'santrifüj fanlar': 'Santrifüj Fanlar',
        'kanal tipi fanlar': 'Kanal Tipi Fanlar',
        'çatı tipi fanlar': 'Çatı Tipi Fanlar',
        'endüstriyel fanlar': 'Endüstriyel Fanlar',
        'nicotra gebhardt': 'Nicotra Gebhardt Fanlar',
        'plug fanlar': 'Plug Fanlar',
        'sessiz fanlar': 'Sessiz Kanal Tipi Fanlar',
        'jet fanlar': 'Otopark Jet Fanları',
        'duvar tipi fanlar': 'Duvar Tipi Kompakt Aksiyal Fanlar',
        'duman egzoz fanları': 'Duman Egzoz Fanları',
        'basınçlandırma fanları': 'Basınçlandırma Fanları',
        'sığınak fanları': 'Sığınak Havalandırma Fanları',
        'ex-proof fanlar': 'Ex-Proof Fanlar (Patlama Karşı ATEX Fanlar)',
    }
    
    normalized = scraped_lower
    mapped_category = CATEGORY_MAPPINGS.get(normalized, scraped_category)
    
    return category_map.get(mapped_category.lower().strip())

def smart_import():
    """Akıllı kategori eşleştirme ile import"""
    
    logger.info("="*60)
    logger.info("AKILLI KATEGORI EŞLEŞTIRME İLE İMPORT")
    logger.info("="*60)
    
    # 1. ORDER ITEMS SİL
    logger.info("\n1. Order items siliniyor...")
    try:
        supabase.table('venthub_order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        logger.info("OK Order items silindi")
    except Exception as e:
        logger.warning(f"Order items silme hatası (devam): {e}")
    
    # 2. TÜM ÜRÜNLERİ SİL
    logger.info("\n2. Mevcut ürünler siliniyor...")
    try:
        supabase.table('products').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        logger.info("OK Tüm ürünler silindi")
    except Exception as e:
        logger.error(f"Ürün silme hatası: {e}")
        return False
    
    # 3. KATEGORİLERİ YÜKLE
    logger.info("\n3. Kategoriler yükleniyor...")
    response = supabase.table('categories').select('*').execute()
    categories = response.data
    
    # Kategori map'i oluştur - Türkçe karakterleri normalize et
    category_map = {}
    for cat in categories:
        # Hem orijinal hem de normalize edilmiş versiyonları ekle
        name_lower = cat['name'].lower().strip()
        name_normalized = name_lower.replace('ı', 'i').replace('i̇', 'i').replace('ğ', 'g').replace('ş', 's').replace('ç', 'c').replace('ü', 'u').replace('ö', 'o')
        
        category_map[name_lower] = cat['id']
        category_map[name_normalized] = cat['id']
    
    logger.info(f"OK {len(categories)} kategori yüklendi")
    
    # 4. SCRAPED PRODUCTS YÜKLE
    logger.info("\n4. Scraped ürünler yükleniyor...")
    json_file = 'scraped-data/complete_with_categories_2025-09-30T11-49-23-659Z.json'
    
    with open(json_file, 'r', encoding='utf-8') as f:
        scraped_products = json.load(f)
    
    logger.info(f"OK {len(scraped_products)} ürün yüklendi")
    
    # 5. ÜRÜNLERİ İMPORT ET
    logger.info("\n5. Ürünler import ediliyor (AKILLI EŞLEŞTİRME)...")
    
    stats = {
        'total': 0,
        'imported': 0,
        'skipped': 0,
        'errors': 0,
        'by_category': {}
    }
    
    batch = []
    BATCH_SIZE = 50
    
    for product in scraped_products:
        stats['total'] += 1
        
        name = product.get('name', '').strip()
        category = product.get('category', '').strip()
        subcategory = product.get('subcategory', '').strip()
        brand = product.get('brand', 'AVenS').strip()
        price_str = product.get('price', '')
        
        # Geçersiz ürünleri atla
        if not name or '@' in name or name == 'satis@avensair.com':
            stats['skipped'] += 1
            continue
        
        # ÖNCE SUBCATEGORY İLE EŞLEŞTİRMEYİ DENE
        category_id = None
        if subcategory:
            # Önce alt kategoriyi dene (orijinal)
            category_id = category_map.get(subcategory.lower().strip())
            
            # Eğer bulunamadıysa normalize edilmiş versiyonu dene
            if not category_id:
                subcat_normalized = subcategory.lower().strip().replace('ı', 'i').replace('İ', 'i').replace('ğ', 'g').replace('ş', 's').replace('ç', 'c').replace('ü', 'u').replace('ö', 'o')
                category_id = category_map.get(subcat_normalized)
            
            if category_id:
                logger.debug(f"Subcategory ile eşleşti: {subcategory}")
        
        # Eğer subcategory ile eşleşmedi ise akıllı eşleştirme yap
        if not category_id:
            category_id = get_smart_category_id(name, category, category_map)
        
        if not category_id:
            logger.warning(f"Kategori bulunamadı: {category} (Ürün: {name})")
            stats['skipped'] += 1
            continue
        
        # İstatistik için kategori say
        cat_name = next((c['name'] for c in categories if c['id'] == category_id), 'Unknown')
        stats['by_category'][cat_name] = stats['by_category'].get(cat_name, 0) + 1
        
        # Fiyat parse et
        price = None
        if price_str and ('TL' in price_str or '₺' in price_str):
            try:
                price_clean = re.sub(r'[^\d,.]', '', price_str).replace('.', '').replace(',', '.')
                price = float(price_clean) if price_clean else None
            except:
                pass
        
        if price is None:
            price = 0
        
        # Ürün objesi oluştur
        product_data = {
            'name': name,
            'brand': brand,
            'category_id': category_id,
            'price': price,
            'sku': generate_sku(name, brand),
            'description': f"{name} - Smart category mapping",
            'status': 'active',
            'stock_qty': 0
        }
        
        batch.append(product_data)
        
        # Batch dolduğunda insert et
        if len(batch) >= BATCH_SIZE:
            try:
                supabase.table('products').insert(batch).execute()
                stats['imported'] += len(batch)
                logger.info(f"OK {stats['imported']} ürün import edildi...")
                batch = []
            except Exception as e:
                logger.error(f"Batch import hatası: {e}")
                stats['errors'] += len(batch)
                batch = []
    
    # Kalan batch
    if batch:
        try:
            supabase.table('products').insert(batch).execute()
            stats['imported'] += len(batch)
            logger.info(f"OK {stats['imported']} ürün import edildi")
        except Exception as e:
            logger.error(f"Son batch hatası: {e}")
            stats['errors'] += len(batch)
    
    # ÖZET
    logger.info("\n" + "="*60)
    logger.info("AKILLI IMPORT TAMAMLANDI")
    logger.info("="*60)
    logger.info(f"Toplam Ürün: {stats['total']}")
    logger.info(f"OK Import Edilen: {stats['imported']}")
    logger.info(f"-> Atlanan: {stats['skipped']}")
    logger.info(f"X Hata: {stats['errors']}")
    
    logger.info("\n=== KATEGORİ DAĞILIMI ===")
    for cat_name, count in sorted(stats['by_category'].items(), key=lambda x: x[1], reverse=True):
        logger.info(f"  {cat_name}: {count}")
    
    logger.info("="*60)
    
    return True

if __name__ == "__main__":
    try:
        success = smart_import()
        if success:
            logger.info("\nOK Akıllı import başarıyla tamamlandı!")
        else:
            logger.error("\nX Import başarısız!")
            exit(1)
    except Exception as e:
        logger.error(f"\nX Fatal error: {e}")
        exit(1)