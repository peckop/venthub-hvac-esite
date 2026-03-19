# Brainstorm: 005-pdp-gateway-architecture

## 🎯 Hedef
`ProductDetailPage.tsx` monolitini parçalayarak; veri yönetimi (Product Gateway) ve bileşen katmanlarını (Gallery, Specs, Actions) birbirinden ayırmak.

## 🛡️ Risk Analizi & Teknik Bariyerler
- **3D & Interactive Models:** Bazı kategorilerde (Hava Perdesi) özel 3D modeller render ediliyor. Bu mantık, yeni `useProductGateway` içinde soyutlanmalı.
- **PDF Generation:** PDP içinde `jsPDF` bağımlılığı olan ağır bir PDF üretim mantığı var. Bu, performansı etkilememesi için `dynamic import` veya ayrı bir servise taşınmalı.
- **Client vs Server:** PDP şu an Client Component. Next.js 15'te bazı metadata ve SEO kısımlarını Server Component'e çekebilir miyiz? (Gelecek planı).
- **Complexity:** Teknik özelliklerin (Specs) gruplanması (`technical_specs` JSON) çok karmaşık.

## 💡 Mimari Çözüm
- **Hook:** `useProductGateway` (Ürün verisi, kategori ilişkisi, SEO hazırlığı, sepet aksiyonları).
- **Sub-Components:**
  - `ProductHeaderSection`: Ekmek kırıntısı (Breadcrumbs) ve Paylaş butonu.
  - `ProductVisualSection`: Galeri ve 3D görünümler.
  - `ProductBuySection`: Fiyat, Stok, Sepete Ekle, Projeye Ekle.
  - `ProductDetailSections`: Teknik özellikler, Tablolar, Varyantlar.

## ✅ Başarı Kriterleri
- `ProductDetailPage.tsx` dosyası < 150 satır olmalı.
- Tüm `any` dökümleri temizlenmeli.
- LCP (Largest Contentful Paint) skoru iyileşmeli (Galeri ve Hero optimizasyonu ile).
