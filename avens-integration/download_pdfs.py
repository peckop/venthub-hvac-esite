#!/usr/bin/env python3
"""
AVenS PDF İndirici
Tüm katalog PDF'lerini indirir
"""

import requests
import os
from pathlib import Path
import time

# PDF listesi
PDFS = [
    # 1. Ürün Fiyat Katalogları
    ("https://avensair.com/uploads/avens_fiyat_listesi_2025.pdf", "Fiyat"),
    
    # 2. Konut Tipi Havalandırma
    ("https://avensair.com/uploads/Doc%20Pubblicita%20Residential%20ventilation%20Punto%20Evo%20Flexo_2.pdf", "Konut"),
    ("https://avensair.com/uploads/ResidentialVentilation.pdf", "Konut"),
    ("https://avensair.com/uploads/2022-11-en-ca-rm-es-radon.pdf", "Konut"),
    ("https://avensair.com/uploads/Doc%20Pubblicita%20Residential%20ventilation%20vort%20quadro%20evo_4.pdf", "Konut"),
    ("https://avensair.com/uploads/vortice_vort_mono_range_new.pdf", "Konut"),
    ("https://avensair.com/uploads/vortice-bravo-s.pdf", "Konut"),
    ("https://avensair.com/uploads/vortice-brochure-mev.pdf", "Konut"),
    ("https://avensair.com/uploads/vortice-brochure-radon-en.pdf", "Konut"),
    
    # 3. Ticari Havalandırma
    ("https://avensair.com/uploads/Commercial%20Ventilation%20in%20Line_1.pdf", "Ticari"),
    ("https://avensair.com/uploads/Air%20Conditioning%20Air%20Door_2.pdf", "Ticari"),
    ("https://avensair.com/uploads/Doc_Pubblicita_Industrial_ventilation_vort_jet_fan_system_1.pdf", "Ticari"),
    ("https://avensair.com/uploads/Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf", "Ticari"),
    ("https://avensair.com/uploads/qbk-sal-kc-evo-en-yeni-2025.pdf", "Ticari"),
    ("https://avensair.com/uploads/LINEO%20QUITE%20KATALOG.pdf", "Ticari"),
    
    # 4. Endüstriyel Havalandırma
    ("https://avensair.com/uploads/E_ATEX_Range_yeni%202025.pdf", "Endustriyel"),
    ("https://avensair.com/uploads/industrial_Ventilation.pdf", "Endustriyel"),
    ("https://avensair.com/uploads/heat-master-slimroof-cati-fanlari-yeni.pdf", "Endustriyel"),
    ("https://avensair.com/uploads/nordik-hvls-industrial-ceiling-fans-181471.pdf", "Endustriyel"),
    
    # 5. Isı Geri Kazanım Cihazları
    ("https://avensair.com/uploads/nrg-range-175696-isi-geri-kazanim.pdf", "IsiGeriKazanim"),
    ("https://avensair.com/uploads/vort-hr-w-all-100-df.pdf", "IsiGeriKazanim"),
    
    # 6. Hava Temizleyiciler
    ("https://avensair.com/uploads/Doc_Pubblicita_Air_treatment_Deumido_Range_1.pdf", "HavaTemizleyici"),
]

def download_pdf(url, category, output_dir):
    """Tek bir PDF indir"""
    from urllib.parse import unquote
    
    # Dosya adını URL'den al
    filename = os.path.basename(unquote(url))
    filename = f"{category}_{filename}"
    filepath = os.path.join(output_dir, filename)
    
    try:
        print(f"📥 İndiriliyor: {filename}...", end=" ", flush=True)
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print("✅")
        return True
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        return False

def main():
    print("🚀 AVenS PDF İndirici Başlatılıyor...\n")
    
    # İndirme klasörü
    output_dir = os.path.join(os.path.dirname(__file__), 'pdfs')
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    print(f"📁 İndirme klasörü: {output_dir}")
    print(f"📊 Toplam PDF: {len(PDFS)}\n")
    
    success = 0
    failed = 0
    
    for i, (url, category) in enumerate(PDFS, 1):
        print(f"[{i}/{len(PDFS)}] ", end="")
        
        if download_pdf(url, category, output_dir):
            success += 1
        else:
            failed += 1
        
        # Rate limiting
        time.sleep(0.3)
    
    print("\n" + "=" * 60)
    print("✅ İndirme Tamamlandı!")
    print(f"📊 Başarılı: {success} PDF")
    if failed > 0:
        print(f"❌ Başarısız: {failed} PDF")
    print(f"📁 Konum: {output_dir}")
    print("=" * 60)

if __name__ == "__main__":
    main()
