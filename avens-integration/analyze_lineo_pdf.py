#!/usr/bin/env python3
"""
PDF Analiz Script'i
Lineo Quiet katalogunu analiz eder ve teknik özellikleri çıkarır
"""

import pdfplumber
import json
import re
from pathlib import Path

def analyze_pdf(pdf_path):
    """PDF'i analiz et ve yapıyı incele"""
    print(f"📄 PDF Analizi: {pdf_path}\n")
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Toplam Sayfa: {len(pdf.pages)}\n")
        
        # İlk birkaç sayfayı analiz et
        for i, page in enumerate(pdf.pages[:5], 1):
            print(f"{'='*60}")
            print(f"SAYFA {i}")
            print(f"{'='*60}\n")
            
            # Metin içeriği
            text = page.extract_text()
            if text:
                lines = text.split('\n')[:20]  # İlk 20 satır
                print("📝 Metin İçeriği (İlk 20 satır):")
                for line in lines:
                    if line.strip():
                        print(f"  {line}")
                print()
            
            # Tablolar
            tables = page.extract_tables()
            if tables:
                print(f"📊 {len(tables)} Tablo bulundu:")
                for j, table in enumerate(tables, 1):
                    print(f"\n  Tablo {j}:")
                    if table:
                        # İlk birkaç satırı göster
                        for row in table[:3]:
                            print(f"    {row}")
                print()
            
            print("\n")

def extract_lineo_products(pdf_path):
    """Lineo Quiet ürünlerini ve teknik özelliklerini çıkar"""
    products = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
            
            # Lineo model isimlerini bul (100, 125, 150, 200, 250, 315)
            pattern = r'Lineo\s+(\d+)\s+Quiet'
            matches = re.finditer(pattern, text, re.IGNORECASE)
            
            for match in matches:
                model = match.group(1)
                product_name = f"Vortice Lineo {model} Quiet"
                
                # Bu ürün için teknik özellikleri ara
                specs = extract_specs_for_model(text, model)
                
                products.append({
                    'name': product_name,
                    'model': model,
                    'specs': specs
                })
    
    return products

def extract_specs_for_model(text, model):
    """Bir model için teknik özellikleri çıkar"""
    specs = {}
    
    # Debi/Airflow (m³/h) ara
    airflow_pattern = r'(\d+)\s*m³/h'
    airflow_matches = re.findall(airflow_pattern, text)
    if airflow_matches:
        specs['airflow'] = airflow_matches
    
    # Güç (W) ara
    power_pattern = r'(\d+)\s*W'
    power_matches = re.findall(power_pattern, text)
    if power_matches:
        specs['power'] = power_matches
    
    # Gürültü (dB) ara
    noise_pattern = r'(\d+)\s*dB'
    noise_matches = re.findall(noise_pattern, text)
    if noise_matches:
        specs['noise'] = noise_matches
    
    # Basınç (Pa) ara
    pressure_pattern = r'(\d+)\s*Pa'
    pressure_matches = re.findall(pressure_pattern, text)
    if pressure_matches:
        specs['pressure'] = pressure_matches
    
    return specs

def main():
    pdf_path = Path(__file__).parent / 'pdfs' / 'Ticari_LINEO QUITE KATALOG.pdf'
    
    if not pdf_path.exists():
        print(f"❌ PDF bulunamadı: {pdf_path}")
        return
    
    print("=" * 60)
    print("LINEO QUIET KATALOG ANALİZİ")
    print("=" * 60)
    print()
    
    # Önce PDF yapısını analiz et
    analyze_pdf(pdf_path)
    
    print("\n" + "=" * 60)
    print("ÜRÜN ÇIKARIMI")
    print("=" * 60)
    print()
    
    # Ürünleri çıkar
    products = extract_lineo_products(pdf_path)
    
    print(f"✅ {len(products)} ürün bulundu:\n")
    for prod in products:
        print(f"📦 {prod['name']}")
        if prod['specs']:
            for key, values in prod['specs'].items():
                print(f"   - {key}: {values}")
        print()
    
    # JSON olarak kaydet
    output_file = Path(__file__).parent / 'lineo_extracted_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Veri kaydedildi: {output_file}")

if __name__ == "__main__":
    main()
