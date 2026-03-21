---
id: "000"
title: "Roadmap"
status: "Active"
---

# P04 - Category Architecture Reform

## 🎯 Projenin Amacı
Mevcut parçalı ve karmaşık Kategori/Ürün listeleme mimarisini (Category vs DomainCategory, CategoryShowcase vs CategoryLanding, ProductsPage vs CategoryPage) tek tip, server-side-driven, %100 tip güvenliği olan ve konfigürasyonunu sadece Supabase DB'den alan profesyonel bir Gateway mimarisi etrafında birleştirmek.

## 🚧 Yol Haritası (Roadmap)
- [x] Aşama 1: Tip Birleştirme (DomainCategory)
- [x] Aşama 2: DB Migration (Category Metadata)
- [x] Aşama 3: Gateway Mimarisi (CategoryPage)
- [x] Aşama 4: ProductsPage Birleştirme
- [x] Aşama 5: PDP Gateway Mimarisi (ProductDetailPage)
- [ ] Aşama 6: Global Mimari Mühürleme (Navigasyon & Menü Entegrasyonu)

## 🛠 Teknik Odak Noktaları
- **Single Source of Truth (Tip):** UI tarafında `DomainCategory` tek modeldir.
- **Single Source of Truth (Config):** Tüm gösterim kararları DB'deki `metadata` sütunundan alınır.
- **Gateway Pattern:** Sayfalar ve global bileşenler (Header, Menu) aynı merkezi mantığı kullanır.
- **Centralized Logic:** `MegaMenu` ve `CategoryHubOverlay` artık bağımsız veri çekmeyi bırakıp, merkezi mimariyi kullanır.

## 📈 Başarı Kriterleri (Definitions of Done)
1. `import { Category } from 'supabase.ts'` kullanımı tamamen temizlenmiş olmalı.
2. `MegaMenu` ve `CategoryHubOverlay` merkezi `CategoryGateway` mantığına bağlanmış olmalı.
3. Kategori Sayfası mimarisi (Gateway, Hero, View) tüm uygulamaya (skelet dahil) yayılmış olmalı.
4. `tsc` ve `lint` sorunsuz geçmeli.
