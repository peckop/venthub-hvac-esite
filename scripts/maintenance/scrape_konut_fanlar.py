"""
Scrape Konut Tipi Fanlar products with multiple images from AVenS website.
This script will:
1. Get product list from category page
2. Scrape each product detail page to get ALL images
3. Save the data with multiple images per product
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from pathlib import Path

BASE_URL = "https://www.avensair.com"
CATEGORY_URL = f"{BASE_URL}/konut-tipi-fanlar"

print("=== Scraping Konut Tipi Fanlar from AVenS ===\n")

# Create output directory
output_dir = Path('avens-integration/scraped-data/konut-fanlar')
output_dir.mkdir(parents=True, exist_ok=True)

# Step 1: Get product list from category page
print(f"Fetching category page: {CATEGORY_URL}")
response = requests.get(CATEGORY_URL, timeout=30)
response.raise_for_status()

soup = BeautifulSoup(response.content, 'html.parser')

# Find product links
# AVenS site structure: products are in divs with class 'product-item' or similar
product_links = []
for link in soup.find_all('a', href=True):
    href = link['href']
    # Filter for product pages
    if '/urun/' in href or '/product/' in href:
        full_url = href if href.startswith('http') else f"{BASE_URL}{href}"
        if full_url not in product_links:
            product_links.append(full_url)

print(f"Found {len(product_links)} product links\n")

if not product_links:
    print("❌ No product links found. Let's check the page structure...")
    # Save HTML for inspection
    with open(output_dir / 'category_page.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    print(f"Saved HTML to {output_dir / 'category_page.html'}")
    
    # Show all links for debugging
    print("\nAll links on page:")
    for link in soup.find_all('a', href=True)[:20]:
        print(f"  - {link['href']}")
    exit(1)

# Step 2: Scrape each product page
products = []

for i, url in enumerate(product_links, 1):
    print(f"[{i}/{len(product_links)}] Scraping: {url}")
    
    try:
        time.sleep(1)  # Rate limiting
        
        prod_response = requests.get(url, timeout=30)
        prod_response.raise_for_status()
        
        prod_soup = BeautifulSoup(prod_response.content, 'html.parser')
        
        # Extract product data
        product = {
            'url': url,
            'images': []
        }
        
        # Get product name
        title_elem = prod_soup.find('h1') or prod_soup.find('title')
        if title_elem:
            product['name'] = title_elem.get_text(strip=True)
        
        # Get all images (look for product gallery, sliders, etc.)
        img_selectors = [
            'img[src*="uploads"]',  # Images in uploads folder
            '.product-image img',
            '.gallery img',
            '.slider img',
            'img[data-src*="uploads"]'
        ]
        
        seen_images = set()
        for selector in img_selectors:
            for img in prod_soup.select(selector):
                src = img.get('src') or img.get('data-src')
                if src and 'uploads' in src:
                    # Make absolute URL
                    if not src.startswith('http'):
                        src = f"{BASE_URL}/{src.lstrip('/')}"
                    
                    if src not in seen_images:
                        seen_images.add(src)
                        product['images'].append({
                            'url': src,
                            'alt': img.get('alt', '')
                        })
        
        if product['images']:
            products.append(product)
            print(f"  ✓ Found {len(product['images'])} images for: {product.get('name', 'Unknown')}")
        else:
            print(f"  ⚠️ No images found for: {product.get('name', 'Unknown')}")
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        continue

# Save results
output_file = output_dir / 'products_with_images.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"\n{'='*80}")
print(f"\n✓ Scraping complete!")
print(f"  Products scraped: {len(products)}")
print(f"  Total images: {sum(len(p['images']) for p in products)}")
print(f"  Saved to: {output_file}")
