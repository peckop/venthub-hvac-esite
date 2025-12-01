#!/usr/bin/env python3
"""
Gelişmiş PDF Tablo Çıkarıcı
Lineo Quiet katalogundaki tabloları parse eder
"""

import pdfplumber
import json
import re
from pathlib import Path

def extract_tables_from_pdf(pdf_path):
    """PDF'den tüm tabloları çıkar"""
    print(f"📄 PDF'den tablolar çıkarılıyor: {pdf_path}\n")
    
    all_tables = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, 1):
            tables = page.extract_tables()
            if tables:
                print(f"📊 Sayfa {i}: {len(tables)} tablo bulundu")
                for j, table in enumerate(tables, 1):
                    if table and len(table) > 0:
                        print(f"   Tablo {j}: {len(table)} satır x {len(table[0]) if table[0] else 0} sütun")
                        all_tables.append({
                            'page': i,
                            'table_index': j,
                            'data': table
                        })
    
    print(f"\n✅ Toplam {len(all_tables)} tablo çıkarıldı\n")
    return all_tables

def parse_lineo_specs(tables):
    """Lineo Quiet teknik özelliklerini tablolardan parse et"""
    products = {}
    
    # Lineo model isimleri
    models = ['100', '125', '150', '160', '200', '250', '315']
    
    for table_info in tables:
        table = table_info['data']
        
        # Tablo başlıklarını bul
        if not table or len(table) < 2:
            continue
        
        # İlk satırı header olarak al
        headers = table[0] if table[0] else []
        
        # Satırları işle
        for row in table[1:]:
            if not row:
                continue
            
            # Satırda model numarası var mı kontrol et
            row_text = ' '.join([str(cell) if cell else '' for cell in row])
            
            for model in models:
                # Model numarasını ara (Lineo 100, 100 Quiet, vb.)
                if model in row_text or f"Lineo {model}" in row_text or f"{model} Quiet" in row_text:
                    product_name = f"Vortice Lineo {model} Quiet"
                    
                    if product_name not in products:
                        products[product_name] = {
                            'model': model,
                            'specs': {}
                        }
                    
                    # Teknik özellikleri çıkar
                    for idx, cell in enumerate(row):
                        if cell and str(cell).strip():
                            cell_str = str(cell).strip()
                            
                            # Sayısal değerleri bul
                            numbers = re.findall(r'\d+(?:[.,]\d+)?', cell_str)
                            
                            if numbers:
                                # Header varsa kullan
                                if idx < len(headers) and headers[idx]:
                                    key = str(headers[idx]).strip().lower()
                                    
                                    # Debi/Airflow
                                    if 'm³/h' in cell_str or 'm3/h' in cell_str or 'debi' in key:
                                        products[product_name]['specs']['airflow'] = cell_str
                                    # Güç/Power
                                    elif 'w' in cell_str.lower() and 'kw' not in cell_str.lower():
                                        products[product_name]['specs']['power'] = cell_str
                                    # Gürültü/Noise
                                    elif 'db' in cell_str.lower():
                                        products[product_name]['specs']['noise'] = cell_str
                                    # Basınç/Pressure
                                    elif 'pa' in cell_str.lower():
                                        products[product_name]['specs']['pressure'] = cell_str
    
    return products

def smart_parse_lineo_tables(tables):
    """Daha akıllı parsing - farklı tablo formatlarını handle et"""
    products = {}
    models = ['100', '125', '150', '160', '200', '250', '315']
    
    for table_info in tables:
        table = table_info['data']
        page = table_info['page']
        
        if not table or len(table) < 2:
            continue
        
        print(f"\n🔍 Sayfa {page}, Tablo {table_info['table_index']} analiz ediliyor...")
        print(f"   Boyut: {len(table)} satır")
        
        # İlk birkaç satırı göster
        for i, row in enumerate(table[:3]):
            print(f"   Satır {i}: {row}")
        
        # Her satırı kontrol et
        for row_idx, row in enumerate(table):
            if not row:
                continue
            
            # Satırı string'e çevir
            row_text = ' '.join([str(cell) if cell else '' for cell in row])
            
            # Model numarası var mı?
            for model in models:
                pattern = rf'\b{model}\b'
                if re.search(pattern, row_text):
                    product_name = f"Vortice Lineo {model} Quiet"
                    
                    if product_name not in products:
                        products[product_name] = {
                            'model': model,
                            'specs': {},
                            'raw_data': []
                        }
                    
                    # Bu satırı kaydet
                    products[product_name]['raw_data'].append({
                        'page': page,
                        'row': row,
                        'text': row_text
                    })
                    
                    print(f"      ✓ {product_name} bulundu: {row_text[:80]}...")
    
    return products

def main():
    pdf_path = Path(__file__).parent / 'pdfs' / 'Ticari_LINEO QUITE KATALOG.pdf'
    
    if not pdf_path.exists():
        print(f"❌ PDF bulunamadı: {pdf_path}")
        return
    
    print("=" * 70)
    print("LINEO QUIET KATALOG - GELİŞMİŞ TABLO ANALİZİ")
    print("=" * 70)
    print()
    
    # Tabloları çıkar
    tables = extract_tables_from_pdf(pdf_path)
    
    # Akıllı parsing
    print("\n" + "=" * 70)
    print("ÜRÜN VE TEKNİK ÖZELLİK ÇIKARIMI")
    print("=" * 70)
    
    products = smart_parse_lineo_tables(tables)
    
    print(f"\n✅ {len(products)} benzersiz ürün bulundu:\n")
    for name, data in sorted(products.items()):
        print(f"📦 {name}")
        print(f"   Model: {data['model']}")
        print(f"   Veri satırları: {len(data['raw_data'])}")
        if data['specs']:
            for key, value in data['specs'].items():
                print(f"   {key}: {value}")
        print()
    
    # JSON olarak kaydet
    # Raw data çok büyük olabilir, sadece özet kaydet
    summary_data = {
        name: {
            'model': data['model'],
            'specs': data['specs'],
            'data_count': len(data['raw_data'])
        }
        for name, data in products.items()
    }
    
    output_file = Path(__file__).parent / 'lineo_table_extraction.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Özet kaydedildi: {output_file}")
    
    # Detaylı veriyi de kaydet
    detailed_file = Path(__file__).parent / 'lineo_detailed_extraction.json'
    with open(detailed_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Detaylı veri kaydedildi: {detailed_file}")

if __name__ == "__main__":
    main()
