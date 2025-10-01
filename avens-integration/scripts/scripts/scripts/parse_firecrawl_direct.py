import json
import re
import uuid
from typing import List, Dict, Optional
from dataclasses import dataclass

# Firecrawl sonucu burada (MCP çıktısından alınmış)
FIRECRAWL_RESPONSE = {
  "status": "completed",
  "completed": 200,
  "total": 200,
  "creditsUsed": 1455,
  "expiresAt": "2025-09-28T17:15:00.000Z",
  "next": None,
  "data": [
    {
      "markdown": """# Nicotra Gebhardt Fanlar

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

9.217,08₺""",
      "metadata": {
        "sourceURL": "https://www.avensair.com/nicotra-gebhardt-fanlar",
        "title": " Nicotra Gebhardt Fanlar | Avens Havalandırma "
      }
    },
    {
      "markdown": """# ENKELFAN 250 EEC

1. [Ürünler](https://www.avensair.com/urunler "Ürünler")
2. Fanlar
3. [Plug Fanlar](https://www.avensair.com/plug-fanlar "Plug Fanlar")
4. ENKELFAN 250 EEC

![ENKELFAN 250 EEC](https://www.avensair.com/uploads/160922105842632456e207865_ENKELFAN-EEC-250-450-detay.jpg)

ENKELFAN 250 EEC

**Kategori :** [Plug Fanlar](https://www.avensair.com/plug-fanlar)
**Ürün Kodu :** ENKEC250

#### (KDV DAHİL)
28.480,28 ₺""",
      "metadata": {
        "sourceURL": "https://www.avensair.com/enkelfan-250-eec",
        "title": " Casals Plug Fan, Ec Plug Fan, klima santrali fanı, oem fan, "
      }
    },
    {
      "markdown": """# NICOTRA GEBHARDT AT 9-9 ÇİFT EMİŞLİ RADYAL FAN

1. [Ürünler](https://www.avensair.com/urunler "Ürünler")
2. Fanlar
3. [Nicotra Gebhardt Fanlar](https://www.avensair.com/nicotra-gebhardt-fanlar "Nicotra Gebhardt Fanlar")
4. NICOTRA GEBHARDT AT 9-9 ÇİFT EMİŞLİ RADYAL FAN

![NICOTRA GEBHARDT AT 9-9 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/uploads/27052111560360af88d394581_nicotra-gebhardt-at-serisi-cift-emisli-radyal-fanlar-072649-1056.png)

NICOTRA GEBHARDT AT 9-9 ÇİFT EMİŞLİ RADYAL FAN

**Kategori :** [Nicotra Gebhardt Fanlar](https://www.avensair.com/nicotra-gebhardt-fanlar)
**Ürün Kodu :** 18011932

#### (KDV DAHİL)
8.436,79 ₺""",
      "metadata": {
        "sourceURL": "https://www.avensair.com/nicotra-gebhardt-at-9-9-cift-emisli-radyal-fan",
        "title": " NICOTRA GEBHARDT AT 9-9 ÇİFT EMİŞLİ RADYAL FAN | Avens Havalandırma "
      }
    },
    {
      "markdown": """# NICOTRA GEBHARDT AT 10-8 ÇİFT EMİŞLİ RADYAL FAN

1. [Ürünler](https://www.avensair.com/urunler "Ürünler")
2. Fanlar
3. [Nicotra Gebhardt Fanlar](https://www.avensair.com/nicotra-gebhardt-fanlar "Nicotra Gebhardt Fanlar")
4. NICOTRA GEBHARDT AT 10-8 ÇİFT EMİŞLİ RADYAL FAN

![NICOTRA GEBHARDT AT 10-8 ÇİFT EMİŞLİ RADYAL FAN](https://www.avensair.com/uploads/27052112084360af8bcb72adf_nicotra-gebhardt-at-serisi-cift-emisli-radyal-fanlar-072649-1056.png)

NICOTRA GEBHARDT AT 10-8 ÇİFT EMİŞLİ RADYAL FAN

**Kategori :** [Nicotra Gebhardt Fanlar](https://www.avensair.com/nicotra-gebhardt-fanlar)
**Ürün Kodu :** 18011933

#### (KDV DAHİL)
9.460,91 ₺""",
      "metadata": {
        "sourceURL": "https://www.avensair.com/nicotra-gebhardt-at-10-8-cift-emisli-radyal-fan",
        "title": " NICOTRA GEBHARDT AT 10-8 ÇİFT EMİŞLİ RADYAL FAN | Avens Havalandırma "
      }
    }
  ]
}

@dataclass
class Product:
    id: str
    name: str
    price: Optional[float]
    currency: str
    category: str
    brand: str
    image_url: Optional[str]
    product_url: str
    product_code: Optional[str]
    description: Optional[str]
    source_url: str
    specifications: Dict[str, str]

def clean_price(price_text: str) -> Optional[float]:
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

def extract_category_from_url(url: str) -> str:
    """URL'den kategori çıkar"""
    category_patterns = {
        'nicotra-gebhardt': 'Nicotra Gebhardt Fanlar',
        'konut-tipi': 'Konut Tipi Fanlar', 
        'kanal-tipi': 'Kanal Tipi Fanlar',
        'cati-tipi': 'Çatı Tipi Fanlar',
        'ex-proof': 'Ex-Proof Fanlar',
        'duvar-tipi': 'Duvar Tipi Fanlar',
        'santrifuj': 'Santrifüj Fanlar',
        'duman-egzoz': 'Duman Egzoz Fanları',
        'basinclandirma': 'Basınçlandırma Fanları',
        'otopark-jet': 'Otopark Jet Fanları',
        'siginak': 'Sığınak Havalandırma Fanları',
        'sessiz-kanal': 'Sessiz Kanal Tipi Fanlar',
        'isi-geri-kazanim': 'Isı Geri Kazanım Cihazları',
        'hava-perdesi': 'Hava Perdeleri',
        'nem-alma': 'Nem Alma Cihazları',
        'hava-temizleyici': 'Hava Temizleyiciler',
        'flexible': 'Flexible Hava Kanalları',
        'hiz-kontrolu': 'Hız Kontrolü Cihazları',
        'plug-fanlar': 'Plug Fanlar'
    }
    
    url_lower = url.lower()
    for pattern, category in category_patterns.items():
        if pattern in url_lower:
            return category
    
    return 'Diğer'

def extract_brand_from_name(name: str) -> str:
    """Ürün isminden marka çıkar"""
    brands = ['Vortice', 'Casals', 'Nicotra', 'Gebhardt', 'AVenS', 'Danfoss', 'ENKELFAN']
    
    name_upper = name.upper()
    for brand in brands:
        if brand.upper() in name_upper:
            return brand
    
    return 'AVenS'

def parse_product_from_markdown(markdown: str, source_url: str) -> List[Product]:
    """Markdown içeriğinden ürünleri ayrıştır"""
    products = []
    
    # Ürün pattern'ları
    product_patterns = [
        # Pattern 1: Kategori sayfalarındaki ürün listeleri - ### linkli başlık + fiyat
        r'### \[([^\]]+)\]\([^)]+\)\s*\n\s*([0-9.,]+)₺',
        # Pattern 2: Tek ürün sayfaları - # başlık + fiyat (KDV dahil altında)
        r'# ([^#\n]+)\s*\n.*?([0-9.,]+)\s*₺',
        # Pattern 3: Link'li ürün isimleri + fiyat
        r'\[([^\]]+)\]\(([^)]+\.com[^)]+)\).*?([0-9.,]+)₺',
        # Pattern 4: Ürün kodu + fiyat birlikte
        r'Ürün Kodu.*?([A-Z0-9]+).*?([0-9.,]+)\s*₺'
    ]
    
    # Görsel URL'leri bul
    image_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    images = re.findall(image_pattern, markdown)
    image_urls = {alt: url for alt, url in images}
    
    # Başlıktan direkt ürün ismi al
    title_match = re.search(r'^# ([^#\n]+)', markdown, re.MULTILINE)
    if title_match:
        main_title = title_match.group(1).strip()
        
        # Fiyat ara
        price_patterns = [
            r'([0-9.,]+)\s*₺',
            r'₺\s*([0-9.,]+)',
            r'Fiyat[:\s]*([0-9.,]+)'
        ]
        
        price = None
        for pattern in price_patterns:
            price_matches = re.findall(pattern, markdown)
            if price_matches:
                price = clean_price(price_matches[0])
                break
        
        if price and price > 100:  # Anlamlı bir fiyat varsa
            # Ürün kodu ara
            product_code = None
            code_match = re.search(r'Ürün Kodu.*?([A-Z0-9]+)', markdown)
            if code_match:
                product_code = code_match.group(1)
            
            brand = extract_brand_from_name(main_title)
            category = extract_category_from_url(source_url)
            
            # Ana resmi bul
            image_url = None
            if images:
                image_url = images[0][1]  # İlk resmi kullan
            
            product = Product(
                id=str(uuid.uuid4()),
                name=main_title,
                price=price,
                currency='TRY',
                category=category,
                brand=brand,
                image_url=image_url,
                product_url=source_url,
                product_code=product_code,
                description=None,
                source_url=source_url,
                specifications={}
            )
            
            products.append(product)
    
    # Diğer pattern'lar için kontrol et
    for pattern in product_patterns:
        matches = re.finditer(pattern, markdown, re.DOTALL | re.MULTILINE)
        
        for match in matches:
            if len(match.groups()) >= 2:
                name = match.group(1).strip()
                
                # Fiyat grup indeksi belirle
                if len(match.groups()) == 2:
                    price_text = match.group(2)
                elif len(match.groups()) >= 3:
                    price_text = match.groups()[-1]  # Son grup fiyat
                else:
                    continue
                
                # Çok kısa isimler veya genel kategoriler atla
                if len(name) < 5 or any(skip in name.lower() for skip in ['daha fazla', 'kategori', 'ürünler', 'kdv dahil']):
                    continue
                
                price = clean_price(price_text)
                if not price or price < 100:  # Çok düşük fiyatları atla
                    continue
                
                brand = extract_brand_from_name(name)
                category = extract_category_from_url(source_url)
                
                # Ürün URL'si varsa al
                product_url = source_url
                if len(match.groups()) >= 3 and 'avensair.com' in str(match.group(2)):
                    product_url = match.group(2)
                
                # Görsel bul
                image_url = None
                for alt, url in image_urls.items():
                    if any(word in alt.lower() for word in name.lower().split()[:3]):
                        image_url = url
                        break
                
                # Aynı isimde ürün eklenmişse atla
                if any(p.name.lower() == name.lower() for p in products):
                    continue
                
                product = Product(
                    id=str(uuid.uuid4()),
                    name=name,
                    price=price,
                    currency='TRY',
                    category=category,
                    brand=brand,
                    image_url=image_url,
                    product_url=product_url,
                    product_code=None,
                    description=None,
                    source_url=source_url,
                    specifications={}
                )
                
                products.append(product)
    
    return products

def process_firecrawl_data() -> List[Product]:
    """Firecrawl JSON verisini işle"""
    all_products = []
    pages = FIRECRAWL_RESPONSE.get('data', [])
    
    print(f"Toplam {len(pages)} sayfa işleniyor...")
    
    for i, page in enumerate(pages):
        markdown = page.get('markdown', '')
        source_url = page.get('metadata', {}).get('sourceURL', '')
        
        if not markdown or not source_url:
            continue
        
        # Bu sayfadan ürünleri çıkar
        page_products = parse_product_from_markdown(markdown, source_url)
        all_products.extend(page_products)
        
        if page_products:
            print(f"Sayfa {i+1}: {len(page_products)} ürün bulundu - {source_url}")
    
    print(f"\nToplam {len(all_products)} ürün bulundu")
    
    # Duplicateları temizle (aynı isim + benzer fiyat)
    unique_products = []
    seen_products = set()
    
    for product in all_products:
        key = f"{product.name.lower()}_{product.price}"
        if key not in seen_products:
            unique_products.append(product)
            seen_products.add(key)
    
    print(f"Temizleme sonrası: {len(unique_products)} benzersiz ürün")
    return unique_products

def save_products_to_json(products: List[Product], output_file: str):
    """Ürünleri JSON formatında kaydet"""
    products_dict = []
    
    for product in products:
        products_dict.append({
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'currency': product.currency,
            'category': product.category,
            'brand': product.brand,
            'image_url': product.image_url,
            'product_url': product.product_url,
            'product_code': product.product_code,
            'description': product.description,
            'source_url': product.source_url,
            'specifications': product.specifications
        })
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(products_dict, f, ensure_ascii=False, indent=2)
    
    print(f"Ürünler {output_file} dosyasına kaydedildi")

def main():
    output_file = 'avens_products_sample.json'
    
    print("Firecrawl verisi işleniyor...")
    products = process_firecrawl_data()
    
    if products:
        print(f"\nÜrün dağılımı:")
        categories = {}
        brands = {}
        
        for product in products:
            categories[product.category] = categories.get(product.category, 0) + 1
            brands[product.brand] = brands.get(product.brand, 0) + 1
        
        print("\nKategoriler:")
        for category, count in sorted(categories.items()):
            print(f"  {category}: {count}")
        
        print("\nMarkalar:")
        for brand, count in sorted(brands.items()):
            print(f"  {brand}: {count}")
        
        save_products_to_json(products, output_file)
        
        # Örnek ürünleri göster
        print(f"\nÖrnek ürünler:")
        for i, product in enumerate(products[:10]):
            print(f"{i+1}. {product.name}")
            print(f"   Fiyat: {product.price} {product.currency}")
            print(f"   Kategori: {product.category}")
            print(f"   Marka: {product.brand}")
            print(f"   Kod: {product.product_code or 'N/A'}")
            print(f"   URL: {product.product_url}")
            print()
    
    else:
        print("Hiç ürün bulunamadı!")

if __name__ == "__main__":
    main()