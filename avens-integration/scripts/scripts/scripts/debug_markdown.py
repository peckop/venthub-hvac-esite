import re

# Test markdown'ı
markdown_sample = """# Nicotra Gebhardt Fanlar

1. [Ana Sayfa](https://www.avensair.com/)
2. [Ürünler](https://www.avensair.com/urunler)
3. Fanlar
4. Nicotra Gebhardt Fanlar

[![NICOTRA GEBHARDT AT 7-7 ÇİFT EMİŞLİ RADYAL FANLAR](https://www.avensair.com/uploads/27052111210460af80a0de36d_1.png)](https://www.avensair.com/nicotra-gebhardt-at-7-7-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 7-7 ÇİFT EMİŞLİ RADYAL FAN")

### [NICOTRA GEBHARDT AT 7-7 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/nicotra-gebhardt-at-7-7-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 7-7 ÇİFT EMİŞLİ RADYAL FAN")

7.851,58₺

[![NICOTRA GEBHARDT AT 9-7 ÇİFT EMİŞLİ RADYAL FANLAR](https://www.avensair.com/uploads/27052111422560af85a1f12c7_1.png)](https://www.avensair.com/nicotra-gebhardt-at-9-7-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 9-7 ÇİFT EMİŞLİ RADYAL FAN")

### [NICOTRA GEBHARDT AT 9-7 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/nicotra-gebhardt-at-9-7-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 9-7 ÇİFT EMİŞLİ RADYAL FAN")

8.144,19₺

[![NICOTRA GEBHARDT AT 9-9 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/uploads/27052111560660af88d666011_1.png)](https://www.avensair.com/nicotra-gebhardt-at-9-9-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 9-9 ÇİFT EMİŞLİ RADYAL FAN")

### [NICOTRA GEBHARDT AT 9-9 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/nicotra-gebhardt-at-9-9-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 9-9 ÇİFT EMİŞLİ RADYAL FAN")

8.436,79₺

[![NICOTRA GEBHARDT AT 10-8 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/uploads/27052112084660af8bce07447_1.png)](https://www.avensair.com/nicotra-gebhardt-at-10-8-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 10-8 ÇİFT EMİŞLİ RADYAL FAN")

### [NICOTRA GEBHARDT AT 10-8 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/nicotra-gebhardt-at-10-8-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 10-8 ÇİFT EMİŞLİ RADYAL FAN")

9.460,91₺

[![NICOTRA GEBHARDT AT 10-10 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/uploads/27052112241560af8f6f188c1_1.png)](https://www.avensair.com/nicotra-gebhardt-at-10-10-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 10-10 ÇİFT EMİŞLİ RADYAL FAN")

### [NICOTRA GEBHARDT AT 10-10 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/nicotra-gebhardt-at-10-10-cift-emisli-radyal-fan "NICOTRA GEBHARDT AT 10-10 ÇİFT EMİŞLİ RADYAL FAN")

9.217,08₺"""

markdown_sample2 = """# ENKELFAN 250 EEC

1. [Ürünler](https://www.avensair.com/urunler "Ürünler")
2. Fanlar
3. [Plug Fanlar](https://www.avensair.com/plug-fanlar "Plug Fanlar")
4. ENKELFAN 250 EEC

![ENKELFAN 250 EEC](https://www.avensair.com/uploads/160922105842632456e207865_ENKELFAN-EEC-250-450-detay.jpg)

ENKELFAN 250 EEC

**Kategori :** [Plug Fanlar](https://www.avensair.com/plug-fanlar)
**Ürün Kodu :** ENKEC250

#### (KDV DAHİL)
28.480,28 ₺"""

def test_patterns():
    print("=== MARKDOWN SAMPLE 1 TEST ===")
    print("Markdown length:", len(markdown_sample))
    print("\n--- Pattern Test 1: ### [title] + price ---")
    
    pattern1 = r'### \[([^\]]+)\]\([^)]+\)\s*\n\s*([0-9.,]+)₺'
    matches1 = re.findall(pattern1, markdown_sample)
    print(f"Pattern 1 matches: {len(matches1)}")
    for i, match in enumerate(matches1):
        print(f"  {i+1}. Name: {match[0]}")
        print(f"      Price: {match[1]}")
    
    print("\n--- Pattern Test 2: # title + any price ---")
    pattern2 = r'# ([^#\n]+).*?([0-9.,]+)\s*₺'
    matches2 = re.findall(pattern2, markdown_sample, re.DOTALL)
    print(f"Pattern 2 matches: {len(matches2)}")
    for i, match in enumerate(matches2):
        print(f"  {i+1}. Name: {match[0]}")
        print(f"      Price: {match[1]}")
    
    print("\n--- Pattern Test 3: Simple price search ---")
    pattern3 = r'([0-9.,]+)₺'
    matches3 = re.findall(pattern3, markdown_sample)
    print(f"Pattern 3 matches: {len(matches3)}")
    for i, match in enumerate(matches3):
        print(f"  {i+1}. Price: {match}")
    
    print("\n=== MARKDOWN SAMPLE 2 TEST ===")
    print("Markdown length:", len(markdown_sample2))
    
    print("\n--- Pattern Test 4: Main title + price ---")
    title_match = re.search(r'^# ([^#\n]+)', markdown_sample2, re.MULTILINE)
    if title_match:
        print(f"Title found: {title_match.group(1).strip()}")
        
    price_matches = re.findall(r'([0-9.,]+)\s*₺', markdown_sample2)
    print(f"Prices found: {price_matches}")
    
    print("\n--- Product Code Test ---")
    code_match = re.search(r'Ürün Kodu.*?([A-Z0-9]+)', markdown_sample2)
    if code_match:
        print(f"Product code found: {code_match.group(1)}")
    
    print("\n--- Image Test ---")
    image_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    images = re.findall(image_pattern, markdown_sample2)
    print(f"Images found: {len(images)}")
    for i, (alt, url) in enumerate(images):
        print(f"  {i+1}. Alt: {alt}")
        print(f"      URL: {url}")

def clean_price(price_text: str) -> float:
    """Fiyat metnini temizleyip float'a çevir"""
    if not price_text:
        return None
    
    # Türk Lirası sembolü ve nokta/virgül temizliği
    price_clean = re.sub(r'[₺\s]', '', price_text)
    price_clean = price_clean.replace(',', '.')
    
    try:
        return float(price_clean)
    except:
        return None

def extract_products():
    print("\n=== PRODUCT EXTRACTION TEST ===")
    
    # Sample 1: Kategori sayfası
    print("--- Sample 1: Category page ---")
    pattern = r'### \[([^\]]+)\]\([^)]+\)\s*\n\s*([0-9.,]+)₺'
    matches = re.findall(pattern, markdown_sample)
    
    for i, (name, price_text) in enumerate(matches):
        price = clean_price(price_text)
        print(f"{i+1}. {name} - {price} TL")
    
    # Sample 2: Tek ürün sayfası
    print("\n--- Sample 2: Single product page ---")
    title_match = re.search(r'^# ([^#\n]+)', markdown_sample2, re.MULTILINE)
    if title_match:
        title = title_match.group(1).strip()
        
        price_matches = re.findall(r'([0-9.,]+)\s*₺', markdown_sample2)
        if price_matches:
            price = clean_price(price_matches[0])
            
            code_match = re.search(r'Ürün Kodu.*?([A-Z0-9]+)', markdown_sample2)
            product_code = code_match.group(1) if code_match else "N/A"
            
            print(f"Product: {title}")
            print(f"Price: {price} TL") 
            print(f"Code: {product_code}")
            
            images = re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', markdown_sample2)
            if images:
                print(f"Image: {images[0][1]}")

if __name__ == "__main__":
    test_patterns()
    extract_products()