#!/usr/bin/env python3
"""
Performance Data Çıkarıcı - Lineo Quiet
PDF'deki performance tablolarını (debi, güç, gürültü) bulur
"""

import pdfplumber
import json
import re
from pathlib import Path

def find_performance_tables(pdf_path):
    """Performance/technical data içeren sayfaları bul"""
    print(f"📄 Performance tabloları aranıyor...\n")
    
    performance_pages = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, 1):
            text = page.extract_text()
            if not text:
                continue
            
            # Performance ile ilgili keywords
            keywords = ['performance', 'technical data', 'air flow', 'airflow', 
                       'm³/h', 'm3/h', 'speed', 'rpm', 'power', 'consumption',
                       'sound', 'noise', 'db', 'pa', 'pressure']
            
            if any(kw in text.lower() for kw in keywords):
                tables = page.extract_tables()
                if tables:
                    print(f"✓ Sayfa {i}: Performance data bulundu ({len(tables)} tablo)")
                    performance_pages.append({
                        'page': i,
                        'tables': tables,
                        'text_sample': text[:500]
                    })
    
    return performance_pages

def extract_performance_specs(pdf_path):
    """Her model için performance specs çıkar"""
    specs_by_model = {}
    models = ['100', '125', '150', '160', '200', '250', '315']
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text()
            if not text:
                continue
            
            # Teknik özellik tablolarını ara
            tables = page.extract_tables()
            
            for table_idx, table in enumerate(tables):
                if not table or len(table) < 2:
                    continue
                
                # Tablo içinde model numarası + spec data ara
                for row in table:
                    if not row:
                        continue
                    
                    row_text = ' '.join([str(cell) if cell else '' for cell in row])
                    
                    # Her model için kontrol et
                    for model in models:
                        # Model numarası bu satırda mı?
                        if model in row_text or f"LINEO {model}" in row_text or f"{model} QUIET" in row_text:
                            
                            if model not in specs_by_model:
                                specs_by_model[model] = {
                                    'airflow_data': [],
                                    'power_data': [],
                                    'noise_data': [],
                                    'pressure_data': [],
                                    'raw_rows': []
                                }
                            
                            # Bu satırdaki sayısal değerleri çıkar
                            for cell in row:
                                if not cell:
                                    continue
                                cell_str = str(cell).strip()
                                
                                # Debi (m³/h)
                                if 'm³/h' in cell_str or 'm3/h' in cell_str.lower():
                                    nums = re.findall(r'\d+(?:[.,]\d+)?', cell_str)
                                    specs_by_model[model]['airflow_data'].extend(nums)
                                
                                # Güç (W)
                                elif 'w' in cell_str.lower() and 'kw' not in cell_str.lower():
                                    nums = re.findall(r'\d+(?:[.,]\d+)?', cell_str)
                                    specs_by_model[model]['power_data'].extend(nums)
                                
                                # Gürültü (dB)
                                elif 'db' in cell_str.lower():
                                    nums = re.findall(r'\d+(?:[.,]\d+)?', cell_str)
                                    specs_by_model[model]['noise_data'].extend(nums)
                                
                                # Basınç (Pa)
                                elif 'pa' in cell_str.lower():
                                    nums = re.findall(r'\d+(?:[.,]\d+)?', cell_str)
                                    specs_by_model[model]['pressure_data'].extend(nums)
                            
                            # Raw satırı kaydet
                            specs_by_model[model]['raw_rows'].append({
                                'page': page_num,
                                'table': table_idx,
                                'row': row,
                                'text': row_text[:200]
                            })
    
    return specs_by_model

def main():
    pdf_path = Path(__file__).parent / 'pdfs' / 'Ticari_LINEO QUITE KATALOG.pdf'
    
    if not pdf_path.exists():
        print(f"❌ PDF bulunamadı: {pdf_path}")
        return
    
    print("=" * 70)
    print("LINEO QUIET - PERFORMANCE DATA EXTRACTION")
    print("=" * 70)
    print()
    
    # Performance sayfalarını bul
    perf_pages = find_performance_tables(pdf_path)
    print(f"\n✅ {len(perf_pages)} sayfa performance data içeriyor\n")
    
    # İlk birkaç sayfanın sample'ını göster
    for page_info in perf_pages[:3]:
        print(f"\n--- Sayfa {page_info['page']} Sample ---")
        print(page_info['text_sample'])
        print()
    
    # Specs çıkar
    print("\n" + "=" * 70)
    print("TEKNIK ÖZELLİK ÇIKARIMI")
    print("=" * 70)
    print()
    
    specs = extract_performance_specs(pdf_path)
    
    # Sonuçları göster
    for model, data in sorted(specs.items()):
        print(f"\n📦 Model {model}:")
        print(f"   Airflow verisi: {len(data['airflow_data'])} değer")
        print(f"   Power verisi: {len(data['power_data'])} değer")
        print(f"   Noise verisi: {len(data['noise_data'])} değer")
        print(f"   Pressure verisi: {len(data['pressure_data'])} değer")
        print(f"   Toplam veri satırı: {len(data['raw_rows'])}")
        
        # İlk birkaç değeri göster
        if data['airflow_data']:
            print(f"   → Airflow örnekleri: {data['airflow_data'][:5]}")
        if data['power_data']:
            print(f"   → Power örnekleri: {data['power_data'][:5]}")
        if data['noise_data']:
            print(f"   → Noise örnekleri: {data['noise_data'][:5]}")
    
    # JSON olarak kaydet
    output_file = Path(__file__).parent / 'lineo_performance_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(specs, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Performance data kaydedildi: {output_file}")
    
    # Performance sayfaları detayını da kaydet
    perf_file = Path(__file__).parent / 'lineo_performance_pages.json'
    with open(perf_file, 'w', encoding='utf-8') as f:
        json.dump(perf_pages, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Performance sayfaları kaydedildi: {perf_file}")

if __name__ == "__main__":
    main()
