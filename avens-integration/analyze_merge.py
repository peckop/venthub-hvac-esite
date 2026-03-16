#!/usr/bin/env python3
"""
AVenS Product Merge Analysis
Compares scraped AVenS data with existing Supabase products
Generates a merge strategy report
"""

import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from difflib import SequenceMatcher
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
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

import re

def clean_html_content(text):
    """
    Clean HTML and CSS content from text
    1. Remove CSS blocks (between { and })
    2. Remove HTML tags
    3. Clean up whitespace
    """
    if not text:
        return None
        
    # Remove CSS style blocks (content between {})
    # We do this iteratively to handle multiple blocks
    cleaned = re.sub(r'\{[^}]*\}', '', text)
    
    # Remove CSS selectors (lines starting with . or # and ending with {)
    cleaned = re.sub(r'^\s*[.#][^\{]*\{', '', cleaned, flags=re.MULTILINE)
    
    # Remove HTML tags
    cleaned = re.sub(r'<[^>]+>', ' ', cleaned)
    
    # Remove multiple spaces and newlines
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    # Remove common CSS artifacts that might remain
    cleaned = cleaned.replace('.sepetuyari', '').replace('.tabloduzen', '')
    
    return cleaned if len(cleaned) > 10 else None

def normalize_string(s):
    """Normalize Turkish characters for comparison"""
    if not s:
        return ""
    s = s.lower().strip()
    replacements = {
        'ı': 'i', 'İ': 'i', 'ğ': 'g', 'Ğ': 'g',
        'ş': 's', 'Ş': 's', 'ç': 'c', 'Ç': 'c',
        'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o'
    }
    for tr_char, en_char in replacements.items():
        s = s.replace(tr_char, en_char)
    return s

def calculate_similarity(str1, str2):
    """Calculate similarity ratio between two strings"""
    norm1 = normalize_string(str1)
    norm2 = normalize_string(str2)
    return SequenceMatcher(None, norm1, norm2).ratio()

def is_valid_product(product):
    """Check if product data is valid"""
    name = product.get('name', '').strip()
    
    # Skip if name is empty
    if not name:
        return False
    
    # Skip if name contains email
    if '@' in name:
        return False
    
    # Skip if name is an email address
    if name.endswith('.com') or name.endswith('.tr'):
        return False
    
    # Skip if name is too short (likely invalid)
    if len(name) < 3:
        return False
    
    return True

def find_match(avens_product, db_products, similarity_threshold=0.85):
    """
    Find matching product in database
    Returns: (match_product, match_type, similarity_score) or (None, None, 0)
    """
    avens_name = avens_product.get('name', '').strip()
    avens_sku = avens_product.get('sku', '').strip()
    
    # First try exact SKU match
    if avens_sku:
        for db_prod in db_products:
            if db_prod.get('sku', '').strip() == avens_sku:
                return (db_prod, 'sku_exact', 1.0)
    
    # Then try fuzzy name match
    best_match = None
    best_score = 0
    
    for db_prod in db_products:
        db_name = db_prod.get('name', '').strip()
        score = calculate_similarity(avens_name, db_name)
        
        if score > best_score and score >= similarity_threshold:
            best_score = score
            best_match = db_prod
    
    if best_match:
        return (best_match, 'name_fuzzy', best_score)
    
    return (None, None, 0)

def analyze_merge():
    """Analyze AVenS data and generate merge report"""
    logger.info("="*60)
    logger.info("AVenS PRODUCT MERGE ANALYSIS")
    logger.info("="*60)
    
    # 1. Load scraped AVenS products
    logger.info("\n1. Loading AVenS scraped data...")
    json_file = os.path.join(os.path.dirname(__file__), 'scraped-data', 'all_products.json')
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            avens_products = json.load(f)
    except FileNotFoundError:
        logger.error(f"File not found: {json_file}")
        return False
    
    logger.info(f"✓ Loaded {len(avens_products)} AVenS products")
    
    # 2. Load current Supabase products
    logger.info("\n2. Loading current Supabase products...")
    response = supabase.table('products').select('*').execute()
    db_products = response.data
    logger.info(f"✓ Loaded {len(db_products)} products from database")
    
    # 3. Analyze matches
    logger.info("\n3. Analyzing matches...")
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "total_avens_products": len(avens_products),
        "total_avens_valid": 0,
        "total_avens_invalid": 0,
        "current_db_products": len(db_products),
        "to_update": 0,
        "to_add": 0,
        "to_skip": 0,
        "matches": [],
        "new_products": [],
        "invalid_products": []
    }
    
    for avens_prod in avens_products:
        # Validate product
        if not is_valid_product(avens_prod):
            report['invalid_products'].append({
                "name": avens_prod.get('name', ''),
                "reason": "Invalid name (email, too short, etc.)"
            })
            report['total_avens_invalid'] += 1
            report['to_skip'] += 1
            continue
        
        report['total_avens_valid'] += 1
        
        # Find match
        match, match_type, similarity = find_match(avens_prod, db_products)
        
        if match:
            # Existing product - will update
            report['to_update'] += 1
            report['matches'].append({
                "avens_name": avens_prod.get('name'),
                "avens_price": avens_prod.get('price'),
                "avens_category": avens_prod.get('category'),
                "avens_description": clean_html_content(avens_prod.get('description')),
                "avens_technical_specs": avens_prod.get('technical_specs'),
                "db_product_id": match['id'],
                "db_name": match['name'],
                "db_price": match['price'],
                "db_sku": match['sku'],
                "match_type": match_type,
                "similarity_score": round(similarity, 3),
                "action": "update"
            })
        else:
            # New product - will add
            report['to_add'] += 1
            report['new_products'].append({
                "name": avens_prod.get('name'),
                "brand": avens_prod.get('brand', 'AVenS'),
                "price": avens_prod.get('price'),
                "category": avens_prod.get('category'),
                "subcategory": avens_prod.get('subcategory'),
                "description": clean_html_content(avens_prod.get('description')),
                "technical_specs": avens_prod.get('technical_specs'),
                "action": "add"
            })
    
    # 4. Save report
    report_file = os.path.join(os.path.dirname(__file__), 'merge_analysis_report.json')
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, indent=2, ensure_ascii=False, fp=f)
    
    # 5. Print summary
    logger.info("\n" + "="*60)
    logger.info("ANALYSIS COMPLETE")
    logger.info("="*60)
    logger.info(f"Total AVenS Products: {report['total_avens_products']}")
    logger.info(f"  ✓ Valid: {report['total_avens_valid']}")
    logger.info(f"  ✗ Invalid/Skipped: {report['total_avens_invalid']}")
    logger.info(f"\nCurrent DB Products: {report['current_db_products']}")
    logger.info(f"\nProposed Actions:")
    logger.info(f"  🔄 UPDATE (existing): {report['to_update']}")
    logger.info(f"  ➕ ADD (new): {report['to_add']}")
    logger.info(f"  ⏭️  SKIP (invalid): {report['to_skip']}")
    logger.info(f"\nReport saved to: {report_file}")
    logger.info("="*60)
    
    # 6. Show sample matches (first 5)
    if report['matches']:
        logger.info("\n📋 Sample Matches (first 5):")
        for match in report['matches'][:5]:
            logger.info(f"\n  AVenS: {match['avens_name']}")
            logger.info(f"  DB:    {match['db_name']}")
            logger.info(f"  Match: {match['match_type']} ({match['similarity_score']:.1%})")
            logger.info(f"  Action: {match['action']}")
    
    # 7. Show sample new products (first 5)
    if report['new_products']:
        logger.info("\n📦 Sample New Products (first 5):")
        for prod in report['new_products'][:5]:
            logger.info(f"\n  Name: {prod['name']}")
            logger.info(f"  Category: {prod['category']}")
            logger.info(f"  Action: {prod['action']}")
    
    return True

if __name__ == "__main__":
    try:
        success = analyze_merge()
        if success:
            logger.info("\n✓ Analysis completed successfully!")
        else:
            logger.error("\n✗ Analysis failed!")
            exit(1)
    except Exception as e:
        logger.error(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
