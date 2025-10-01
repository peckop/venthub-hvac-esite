import json
import re
import uuid
from typing import List, Dict, Optional
from dataclasses import dataclass

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
        'hiz-kontrolu': 'Hız Kontrolü Cihazları'
    }
    
    url_lower = url.lower()
    for pattern, category in category_patterns.items():
        if pattern in url_lower:
            return category
    
    return 'Diğer'

def extract_brand_from_name(name: str) -> str:
    """Ürün isminden marka çıkar"""
    brands = ['Vortice', 'Casals', 'Nicotra', 'Gebhardt', 'AVenS', 'Danfoss']
    
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
        # Pattern 1: Kategori sayfalarındaki ürün listeleri
        r'### \[([^\]]+)\]\([^)]+\)\s*\n\s*([0-9.,]+)₺',
        # Pattern 2: Tek ürün sayfaları
        r'# ([^#\n]+)\n.*?Ürün Kodu.*?([A-Z0-9]+).*?([0-9.,]+)\s*₺',
        # Pattern 3: Link'li ürün isimleri
        r'\[([^\]]+)\]\(([^)]+\.com[^)]+)\).*?([0-9.,]+)₺'
    ]
    
    # Görsel URL'leri bul
    image_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    images = re.findall(image_pattern, markdown)
    image_urls = {alt: url for alt, url in images}
    
    # Her pattern için kontrol et
    for pattern in product_patterns:
        matches = re.finditer(pattern, markdown, re.DOTALL | re.MULTILINE)
        
        for match in matches:
            if len(match.groups()) >= 2:
                name = match.group(1).strip()
                price_text = match.groups()[-1]  # Son grup fiyat
                
                # Çok kısa isimler veya genel kategoriler atla
                if len(name) < 5 or any(skip in name.lower() for skip in ['daha fazla', 'kategori', 'ürünler']):
                    continue
                
                price = clean_price(price_text)
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

def process_firecrawl_data(file_path: str) -> List[Product]:
    """Firecrawl JSON verisini işle"""
    all_products = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # JSON parse et - çok büyük olabilir, ayrıştırma hatası olabilir
        data = json.loads(content)
        crawl_data = data.get('text_result', [{}])[0]
        
        if isinstance(crawl_data, str):
            crawl_data = json.loads(crawl_data)
        
        pages = crawl_data.get('data', [])
        
        print(f"Toplam {len(pages)} sayfa bulundu")
        
        for i, page in enumerate(pages):
            if i % 20 == 0:
                print(f"İşlenen sayfa: {i}/{len(pages)}")
            
            markdown = page.get('markdown', '')
            source_url = page.get('metadata', {}).get('sourceURL', '')
            
            if not markdown or not source_url:
                continue
            
            # Bu sayfadan ürünleri çıkar
            page_products = parse_product_from_markdown(markdown, source_url)
            all_products.extend(page_products)
        
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
        
    except Exception as e:
        print(f"Hata oluştu: {e}")
        return []

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
    input_file = 'firecrawl_full_crawl_200_pages.json'
    output_file = 'avens_products_200_pages.json'
    
    print("Firecrawl verisi işleniyor...")
    products = process_firecrawl_data(input_file)
    
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
        
        # İlk 5 ürünü örnek olarak göster
        print(f"\nÖrnek ürünler (ilk 5):")
        for i, product in enumerate(products[:5]):
            print(f"{i+1}. {product.name}")
            print(f"   Fiyat: {product.price} {product.currency}")
            print(f"   Kategori: {product.category}")
            print(f"   Marka: {product.brand}")
            print(f"   URL: {product.product_url}")
            print()
    
    else:
        print("Hiç ürün bulunamadı!")

if __name__ == "__main__":
    main()