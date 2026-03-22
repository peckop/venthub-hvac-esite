# 🧠 Brainstorming: Master Prototype - Fanlar (P04-008)

## 🎯 Hedef
Fanlar sayfasını, VentHub'ın tüm kategorileri için "Altın Standart" (Master Prototype) haline getirmek. Hava Perdeleri'ndeki eğitimsel başarıyı, 13+ alt kategoriye sahip kompleks bir yapıya (Fanlar) uyarlayarak ölçeklenebilir bir mimari kurmak.

## 🏗️ Mimari Kurgu: "Discovery vs Expert"
1.  **Discovery (Keşif) Modu:**
    - Hava Perdeleri tadında "Otorite" odaklı sunum.
    - "Neden Doğru Fan Seçimi Önemli?", "Sessizlik ve Verimlilik (ErP 2024)" blokları.
    - 13 Alt Kategori için "Akıllı Hub" (İkonik seçim kartları).
2.  **Expert (Uzman) Modu:**
    - Hızlı ürün tarama için tam ekran Teknik Izgara (Grid).
    - Agresif filtreleme (Debi, Basınç, Marka).
    - Minimum pazarlama içeriği, maksimum veri yoğunluğu.

## 🛠️ Veri Temizliği (Data Linkage)
- Casals ve diğer markaların Santrifüj, Aksiyal vb. kategorilerine ait ama şu an "boşta" (null subcategory) duran ürünlerin SQL üzerinden otonom mühürlenmesi.

## 🎨 Geçiş Deneyimi (Morphing)
- Kullanıcı bir alt kategoriye (Örn: Santrifüj Fanlar) tıkladığında, sayfa yenilenmeden UCS kabuğu içinde "Discovery"den "Expert" görünümüne yumuşak bir geçiş yapacak.

## 🚨 Önemli Tespit ve Kararlar (22.03.2026 Konuşması)
- **Hava Perdesi Hatası:** Mevcut Hava Perdesi sayfası UCS (Unified Category Shell) tarafından "fazla standardize" edildiği için ruhunu ve özel renk paletini kaybetmiştir. 
- **Fanlar İçin Yeni Standart:** Fanlar sayfasında bu hata yapılmayacak. Sayfa moduna göre (Discovery vs Expert) UCS kabuğunu (Hero, Arka Plan, Renkler) bile modifiye edebilen **Esnek Hybrid Morphing** mimarisi kurulacak.
- **Karar Mekanizması:** Fanlar prototipi tamamlandığında, ortaya çıkan hibrit mimari beğenilirse Hava Perdeleri de bu yeni standarda (Hybrid 2.0) taşınacak.
- **İlk Harekat:** SQL üzerinden "null" kategoriye sahip fan ürünlerinin (Casals vb.) atomik mühürlenmesi ile veri disiplini sağlanacak.

