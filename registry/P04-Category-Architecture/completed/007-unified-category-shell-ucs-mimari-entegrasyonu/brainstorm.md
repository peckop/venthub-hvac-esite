# 🧠 Brainstorming: Unified Category Shell (UCS)

## 🚩 Sorun Tanımı
Kullanıcı deneyiminde (UX) ana kategori, alt kategori ve seri sayfaları arasında keskin bir görsel ve yapısal uçurum var. Bu, markanın "bütünlük" algısını zayıflatıyor ve kullanıcının sitede kaybolmuş hissetmesine neden oluyor.

## 🏗️ Mimari Çözüm (UCS Vizyonu)
1.  **Tek Tip Kabuk (The Shell):** Seviye ne olursa olsun sayfa iskeleti (Hero alanı, Side-Filtre konumu, Breadcrumb stili) sabitlenmeli.
2.  **Dinamik Diferansiyasyon:** Sayfa seviyesi arttıkça (Ana -> Alt -> Seri) içerik bloklarının yoğunluğu ve tipi değişmeli.
    - Ana: Showcase ağırlıklı.
    - Alt: Ürün Grid ağırlıklı.
    - Seri: Teknik Karşılaştırma ağırlıklı.
3.  **Kesintisiz Geçiş:** Sayfa yenilenme hissi yerine, bir katman alta inme (Deep-Dive) animasyonları kurgulanmalı.

## 🛠️ Stratejik Adımlar
- `CategoryMasterView` bileşeni oluşturulacak.
- Tüm `CategoryPage.tsx` akışı bu merkezi bileşene delege edilecek.
- P01-017 (Page Builder) blokları bu kabuğa "Premium" kalitede enjekte edilecek.
