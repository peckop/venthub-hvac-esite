#!/usr/bin/env python3
"""
Extract and update product brands from product names
Fixes the issue where all products have brand='AVenS' but actual brand is in product name
"""

import os
import re
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("VITE_SUPABASE_URL and SUPABASE_KEY required!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Known brands (from src/lib/supabase.ts HVAC_BRANDS)
KNOWN_BRANDS = [
    'Vortice',
    'Casals',
    'Nicotra Gebhardt',
    'Nicotra',  # Also check short form
    'Gebhardt',
    'Danfoss',
    'Flexiva',
    'AVenS',
    'SLIMROOF',  # Seen in data
    'VORTICEL',   # Seen in data
]

def extract_brand_from_name(product_name):
    """
    Extract brand from product name
    Returns (brand, confidence) tuple
    """
    name_upper = product_name.upper()
    
    # Check each known brand
    for brand in KNOWN_BRANDS:
        brand_upper = brand.upper()
        
        # Check if brand is at start of name (most common)
        if name_upper.startswith(brand_upper):
            return (brand, 1.0)  # High confidence
        
        # Check if brand appears anywhere in name
        if brand_upper in name_upper:
            return (brand, 0.8)  # Medium confidence
    
    # If no match, keep AVenS
    return ('AVenS', 0.5)

def main():
    logger.info("="*60)
    logger.info("EXTRACTING BRANDS FROM PRODUCT NAMES")
    logger.info("="*60)
    
    # Fetch all products
    logger.info("\n1. Fetching all products...")
    response = supabase.table('products').select('id,name,brand').execute()
    products = response.data
    logger.info(f"✓ Loaded {len(products)} products")
    
    # Analyze and prepare updates
    logger.info("\n2. Analyzing product names...")
    updates = []
    stats = {
        'total': len(products),
        'to_update': 0,
        'already_correct': 0,
        'by_brand': {}
    }
    
    for product in products:
        product_id = product['id']
        name = product['name']
        current_brand = product['brand']
        
        detected_brand, confidence = extract_brand_from_name(name)
        
        # Count by brand
        stats['by_brand'][detected_brand] = stats['by_brand'].get(detected_brand, 0) + 1
        
        if detected_brand != current_brand:
            updates.append({
                'id': product_id,
                'name': name,
                'current_brand': current_brand,
                'new_brand': detected_brand,
                'confidence': confidence
            })
            stats['to_update'] += 1
        else:
            stats['already_correct'] += 1
    
    # Show summary
    logger.info(f"\n✓ Analysis complete")
    logger.info(f"  Total products: {stats['total']}")
    logger.info(f"  To update: {stats['to_update']}")
    logger.info(f"  Already correct: {stats['already_correct']}")
    
    logger.info(f"\n📊 Brand distribution (after update):")
    for brand, count in sorted(stats['by_brand'].items(), key=lambda x: x[1], reverse=True):
        logger.info(f"  {brand}: {count}")
    
    # Show sample updates
    if updates:
        logger.info(f"\n📝 Sample updates (first 10):")
        for update in updates[:10]:
            logger.info(f"\n  Product: {update['name'][:50]}...")
            logger.info(f"  Current: {update['current_brand']} → New: {update['new_brand']}")
            logger.info(f"  Confidence: {update['confidence']:.0%}")
    
    # Confirm before updating
    logger.info(f"\n{'='*60}")
    logger.info(f"Ready to update {stats['to_update']} products")
    logger.info(f"{'='*60}")
    
    response = input("\nProceed with update? (yes/no): ")
    
    if response.lower() != 'yes':
        logger.info("Update cancelled by user")
        return
    
    # Execute updates
    logger.info("\n3. Updating products...")
    updated_count = 0
    
    for update in updates:
        try:
            supabase.table('products').update({
                'brand': update['new_brand']
            }).eq('id', update['id']).execute()
            updated_count += 1
            
            if updated_count % 50 == 0:
                logger.info(f"  Updated {updated_count}/{stats['to_update']}...")
        except Exception as e:
            logger.error(f"Error updating {update['name']}: {e}")
    
    logger.info(f"\n✓ Update complete: {updated_count} products updated")
    logger.info("="*60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("\n\nCancelled by user")
        exit(0)
    except Exception as e:
        logger.error(f"\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
