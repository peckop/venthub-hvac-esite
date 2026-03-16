#!/usr/bin/env python3
"""
AVenS Smart Merge Script
Merges AVenS scraped data with existing Supabase products
Based on analysis report from analyze_merge.py
"""

import json
import os
import argparse
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
from datetime import datetime

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_SERVICE_ROLE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("VITE_SUPABASE_URL and SUPABASE_KEY are required!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def load_analysis_report():
    """Load the merge analysis report"""
    report_file = os.path.join(os.path.dirname(__file__), 'merge_analysis_report.json')
    
    if not os.path.exists(report_file):
        logger.error(f"Analysis report not found: {report_file}")
        logger.error("Please run analyze_merge.py first!")
        exit(1)
    
    with open(report_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def backup_products():
    """Backup current products to JSON"""
    logger.info("Creating backup of current products...")
    
    response = supabase.table('products').select('*').execute()
    backup_data = response.data
    
    backup_file = os.path.join(
        os.path.dirname(__file__), 
        f'products_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    )
    
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"✓ Backup saved: {backup_file}")
    return backup_file

def update_products(matches, dry_run=True):
    """Update existing products based on matches"""
    logger.info(f"\n{'[DRY RUN] ' if dry_run else ''}Updating {len(matches)} existing products...")
    
    updated_count = 0
    
    for match in matches:
        product_id = match['db_product_id']
        avens_name = match['avens_name']
        
        # Prepare update data
        update_data = {}
        
        # Add description if available
        # Add description if available
        if match.get('avens_description'):
            update_data['description'] = match['avens_description']
            
        # Add technical_specs if available
        if match.get('avens_technical_specs'):
            update_data['technical_specs'] = match['avens_technical_specs']
        
        # Only update if there's something to update
        if not update_data:
            logger.debug(f"Skipping {avens_name} - no update needed")
            continue
        
        if dry_run:
            logger.info(f"[DRY RUN] Would update: {avens_name} (ID: {product_id[:8]}...)")
            logger.debug(f"  Update data: {update_data}")
        else:
            try:
                supabase.table('products').update(update_data).eq('id', product_id).execute()
                logger.info(f"✓ Updated: {avens_name}")
                updated_count += 1
            except Exception as e:
                logger.error(f"✗ Error updating {avens_name}: {e}")
    
    logger.info(f"\n{'[DRY RUN] Would update' if dry_run else 'Updated'}: {updated_count if not dry_run else len(matches)} products")
    return updated_count if not dry_run else 0

def add_products(new_products, category_map, dry_run=True):
    """Add new products"""
    logger.info(f"\n{'[DRY RUN] ' if dry_run else ''}Adding {len(new_products)} new products...")
    
    added_count = 0
    batch = []
    BATCH_SIZE = 50
    
    for prod in new_products:
        name = prod['name']
        brand = prod.get('brand', 'AVenS')
        price = prod.get('price', 0)
        category_name = prod.get('category', '')
        
        # Try to map category
        category_id = None
        if category_name:
            category_id = category_map.get(category_name.lower().strip())
        
        if not category_id:
            logger.warning(f"No category mapping for '{category_name}' - using default")
            # Use first available category as fallback
            if category_map:
                category_id = list(category_map.values())[0]
        
        if not category_id:
            logger.error(f"Cannot add {name} - no valid category_id")
            continue
        
        # Generate SKU
        import re
        brand_part = re.sub(r'[^A-Z]', '', brand.upper())[:3] or 'AVN'
        name_part = re.sub(r'[^A-Z0-9]', '', name.upper())[:3]
        sku = f"{brand_part}-{name_part}-{datetime.now().strftime('%H%M%S')}{added_count:03d}"
        
        product_data = {
            'name': name,
            'brand': brand,
            'price': price if price else 0,
            'sku': sku,
            'category_id': category_id,
            'status': 'active',
            'category_id': category_id,
            'status': 'active',
            'description': prod.get('description', f"{name} - AVenS Product"),
            'technical_specs': prod.get('technical_specs')
        }
        
        if dry_run:
            logger.info(f"[DRY RUN] Would add: {name}")
            logger.debug(f"  Data: {product_data}")
        else:
            batch.append(product_data)
            
            # Insert batch when full
            if len(batch) >= BATCH_SIZE:
                try:
                    supabase.table('products').insert(batch).execute()
                    added_count += len(batch)
                    logger.info(f"✓ Added batch of {len(batch)} products")
                    batch = []
                except Exception as e:
                    logger.error(f"✗ Error adding batch: {e}")
                    batch = []
    
    # Insert remaining batch
    if batch and not dry_run:
        try:
            supabase.table('products').insert(batch).execute()
            added_count += len(batch)
            logger.info(f"✓ Added final batch of {len(batch)} products")
        except Exception as e:
            logger.error(f"✗ Error adding final batch: {e}")
    
    logger.info(f"\n{'[DRY RUN] Would add' if dry_run else 'Added'}: {len(new_products) if dry_run else added_count} products")
    return added_count if not dry_run else 0

def main():
    parser = argparse.ArgumentParser(description='AVenS Smart Merge - Merge scraped data with database')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without committing')
    parser.add_argument('--update', action='store_true', help='Update existing products')
    parser.add_argument('--add', action='store_true', help='Add new products')
    parser.add_argument('--full', action='store_true', help='Full merge (update + add)')
    
    args = parser.parse_args()
    
    # Default to dry-run if no mode specified
    if not (args.update or args.add or args.full):
        args.dry_run = True
        args.full = True
    
    logger.info("="*60)
    logger.info(f"AVenS SMART MERGE {'[DRY RUN MODE]' if args.dry_run else '[LIVE MODE]'}")
    logger.info("="*60)
    
    # Load analysis report
    report = load_analysis_report()
    
    logger.info(f"\nAnalysis Report Summary:")
    logger.info(f"  Total AVenS Products: {report['total_avens_valid']}")
    logger.info(f"  To Update: {report['to_update']}")
    logger.info(f"  To Add: {report['to_add']}")
    
    # Load categories for mapping
    logger.info("\nLoading categories...")
    response = supabase.table('categories').select('*').execute()
    categories = response.data
    
    category_map = {}
    for cat in categories:
        name_lower = cat['name'].lower().strip()
        category_map[name_lower] = cat['id']
    
    logger.info(f"✓ Loaded {len(categories)} categories")
    
    # Backup if not dry-run
    if not args.dry_run:
        backup_file = backup_products()
        logger.info(f"✓ Backup created: {backup_file}")
    
    # Execute merge
    stats = {
        'updated': 0,
        'added': 0
    }
    
    if args.update or args.full:
        stats['updated'] = update_products(report['matches'], dry_run=args.dry_run)
    
    if args.add or args.full:
        stats['added'] = add_products(report['new_products'], category_map, dry_run=args.dry_run)
    
    # Final summary
    logger.info("\n" + "="*60)
    logger.info(f"MERGE {'PREVIEW' if args.dry_run else 'COMPLETE'}")
    logger.info("="*60)
    
    if args.dry_run:
        logger.info(f"[DRY RUN] Would update: {report['to_update']} products")
        logger.info(f"[DRY RUN] Would add: {report['to_add']} products")
        logger.info(f"\nTo execute for real, run:")
        logger.info(f"  python avens-integration/smart_merge.py --full")
    else:
        logger.info(f"✓ Updated: {stats['updated']} products")
        logger.info(f"✓ Added: {stats['added']} products")
    
    logger.info("="*60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("\n\nMerge cancelled by user")
        exit(0)
    except Exception as e:
        logger.error(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
