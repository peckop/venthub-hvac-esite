#!/usr/bin/env python3
"""
Ürünlerdeki category ve subcategory ilişkisini düzelt.
Şu anda category_id alt kategoriye işaret ediyor, ama olması gereken:
- category_id → üst kategori
- subcategory_id → alt kategori
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
from datetime import datetime

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
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

def fix_hierarchy():
    """Kategori hiyerarşisini düzelt"""
    
    logger.info("="*60)
    logger.info("KATEGORİ HİYERARŞİSİ DÜZELTİLİYOR")
    logger.info("="*60)
    
    # 1. Tüm kategorileri yükle
    logger.info("\n1. Kategoriler yükleniyor...")
    response = supabase.table('categories').select('*').execute()
    categories = response.data
    
    # Kategori map'leri oluştur
    cat_by_id = {cat['id']: cat for cat in categories}
    
    logger.info(f"OK {len(categories)} kategori yüklendi")
    
    # 2. Tüm ürünleri yükle
    logger.info("\n2. Ürünler yükleniyor...")
    response = supabase.table('products').select('id, name, category_id, subcategory_id').execute()
    products = response.data
    
    logger.info(f"OK {len(products)} ürün yüklendi")
    
    # 3. Düzeltmeleri hazırla
    logger.info("\n3. Düzeltmeler hazırlanıyor...")
    
    updates = []
    stats = {
        'total': len(products),
        'needs_fix': 0,
        'already_ok': 0,
        'no_parent': 0
    }
    
    for product in products:
        current_category_id = product['category_id']
        current_subcategory_id = product['subcategory_id']
        
        if not current_category_id:
            continue
            
        current_category = cat_by_id.get(current_category_id)
        
        if not current_category:
            logger.warning(f"Kategori bulunamadı: {current_category_id} (Ürün: {product['name']})")
            continue
        
        parent_id = current_category.get('parent_id')
        
        # Eğer mevcut kategori bir alt kategori ise (parent_id varsa)
        if parent_id:
            # subcategory_id boşsa veya yanlışsa düzelt
            if current_subcategory_id != current_category_id:
                updates.append({
                    'id': product['id'],
                    'category_id': parent_id,  # Üst kategori
                    'subcategory_id': current_category_id  # Mevcut (alt) kategori
                })
                stats['needs_fix'] += 1
                
                parent_cat = cat_by_id.get(parent_id)
                logger.debug(f"Düzeltilecek: {product['name']}")
                logger.debug(f"  {current_category['name']} → üst: {parent_cat['name'] if parent_cat else 'Unknown'}")
            else:
                stats['already_ok'] += 1
        else:
            # Üst kategori zaten, subcategory_id boş olmalı
            if current_subcategory_id:
                updates.append({
                    'id': product['id'],
                    'category_id': current_category_id,
                    'subcategory_id': None
                })
                stats['needs_fix'] += 1
            else:
                stats['already_ok'] += 1
    
    logger.info(f"OK {stats['needs_fix']} ürün düzeltilecek")
    logger.info(f"OK {stats['already_ok']} ürün zaten doğru")
    
    # 4. Güncellemeleri uygula
    if updates:
        logger.info(f"\n4. {len(updates)} ürün güncelleniyor...")
        
        BATCH_SIZE = 50
        updated_count = 0
        
        for i in range(0, len(updates), BATCH_SIZE):
            batch = updates[i:i+BATCH_SIZE]
            
            try:
                for update in batch:
                    supabase.table('products').update({
                        'category_id': update['category_id'],
                        'subcategory_id': update['subcategory_id']
                    }).eq('id', update['id']).execute()
                    updated_count += 1
                
                logger.info(f"  {updated_count}/{len(updates)} ürün güncellendi...")
            except Exception as e:
                logger.error(f"Güncelleme hatası: {e}")
        
        logger.info(f"OK Tüm güncellemeler tamamlandı")
    else:
        logger.info("\n4. Güncelleme gerekmiyor, tüm ürünler zaten doğru!")
    
    # 5. Sonuçları kontrol et
    logger.info("\n5. Sonuçlar kontrol ediliyor...")
    
    response = supabase.table('products').select('category_id, subcategory_id').execute()
    products_after = response.data
    
    with_subcategory = sum(1 for p in products_after if p['subcategory_id'])
    without_subcategory = sum(1 for p in products_after if not p['subcategory_id'])
    
    logger.info(f"  Alt kategorili ürünler: {with_subcategory}")
    logger.info(f"  Alt kategorisiz ürünler: {without_subcategory}")
    
    # ÖZET
    logger.info("\n" + "="*60)
    logger.info("KATEGORİ HİYERARŞİSİ DÜZELTMESİ TAMAMLANDI")
    logger.info("="*60)
    logger.info(f"Toplam Ürün: {stats['total']}")
    logger.info(f"Düzeltilen: {stats['needs_fix']}")
    logger.info(f"Zaten Doğru: {stats['already_ok']}")
    logger.info("="*60)
    
    return True

if __name__ == "__main__":
    try:
        success = fix_hierarchy()
        if success:
            logger.info("\nOK Hiyerarşi düzeltmesi başarıyla tamamlandı!")
        else:
            logger.error("\nX Düzeltme başarısız!")
            exit(1)
    except Exception as e:
        logger.error(f"\nX Fatal error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)