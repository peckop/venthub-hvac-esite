import requests
from bs4 import BeautifulSoup
import json

# Test URL
url = "https://www.avensair.com/vortice-me-100-4-ll-giallo-yellow-gold"

print(f"Fetching: {url}\n")

response = requests.get(url, timeout=30)
response.raise_for_status()

soup = BeautifulSoup(response.content, 'html.parser')

# Get product name
product_name = None
h1 = soup.find('h1')
if h1:
    product_name = h1.get_text(strip=True)

print(f"Product Name: {product_name}\n")

# Find all images
all_images = []
seen = set()

# Look for images in various locations
selectors = [
    'img[src*="uploads"]',
    'img[data-src*="uploads"]',
    '.product-images img',
    '.gallery img',
    '#productImages img',
    '.owl-carousel img'
]

for selector in selectors:
    for img in soup.select(selector):
        src = img.get('src') or img.get('data-src') or img.get('data-lazy')
        if src and 'uploads' in src:
            # Fix relative URLs
            if not src.startswith('http'):
                src = f"https://www.avensair.com/{src.lstrip('/')}"
            
            if src not in seen:
                seen.add(src)
                all_images.append({
                    'url': src,
                    'alt': img.get('alt', '')
                })

print(f"Found {len(all_images)} unique images:\n")
for i, img in enumerate(all_images, 1):
    print(f"{i}. {img['url']}")
    if img['alt']:
        print(f"   Alt: {img['alt']}")
    print()

# Save to JSON
output = {
    'url': url,
    'name': product_name,
    'images': all_images
}

with open('product_images_test.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Saved to product_images_test.json")
