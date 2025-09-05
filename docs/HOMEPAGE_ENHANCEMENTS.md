# HOMEPAGE_ENHANCEMENTS.md — Ana Sayfa Geliştirmeleri ve Etkileşimli Bileşenler (VentHub)

Son güncelleme: 2025-09-05

Bu doküman, VentHub ana sayfası için uygulanmış geliştirmeleri ve sıradaki etkileşimli bileşen önerilerini tek yerde toplar. Amaç: Kurumsallık, bilgi ve güveni öne çıkaran; React’in etkileşim gücünü gösteren modern bir deneyim.

## 1) Uygulanan Geliştirmeler (2025-09-05)

Uygulama odaklı kurgu, ürün satışına zorlamadan bilgilendirici bir akış sağlar. Uygulanan başlıca değişiklikler:

- VisualShowcase (Hero altında)
  - Parallax katmanlar (fare hareketine duyarlı, reduced‑motion’a saygılı)
  - Canvas parçacık arka planı (hafif, RAF tabanlı)
  - Play/Pause, klavye (← →, Space) ve basit swipe desteği
- ProductFlow (Uygulamaya Göre Çözümler’in üstünde)
  - Ürün görsellerinden 3 şerit halinde kesintisiz akış (RAF tabanlı)
  - image_url yoksa tıklanabilir fallback kartları (BrandIcon + ad + SKU)
  - prefers‑reduced‑motion açık ise statik grid/iskelet gösterimi
- TrustSection (Güven/Sertifikalar)
  - KVKK Uyumlu, Güvenli Ödeme (iyzico), İade/Değişim Kolaylığı (Cloudflare kartı çıkarıldı)
- FAQShortSection (SSS kısa şerit)
  - 3 temel soru‑cevap; Support sayfalarına linkler
- ResourcesSection (Kaynaklar/Kılavuzlar)
  - Destek içeriklerine köprü kartları
- Navigasyon ve SEO/IA
  - ProductsPage breadcrumb dinamik: Keşfet / Tüm Ürünler / Arama Sonuçları
  - Analitik: Header’da nav_click (Kategoriler/Ürünler), MegaMenu’de category_click (ana/alt) ve ProductsPage Popüler Kategoriler’de category_click
  - Scroll davranışı: Yenilemede sayfa başı (history.scrollRestoration = 'manual') + mevcut ScrollToTop
- CaseStudySection kaldırıldı (kurumsal bloklar ve görsel vitrinlerle dengelendi)

Kaynak dosyalar (özet):
- src/components/VisualShowcase.tsx (yeni)
- src/components/ProductFlow.tsx (yeni)
- src/components/TrustSection.tsx (yeni)
- src/components/FAQShortSection.tsx (yeni)
- src/components/ResourcesSection.tsx (mevcut, ana sayfaya konumlandı)
- src/pages/HomePage.tsx (bölümler eklendi/konumlandırıldı)
- src/components/StickyHeader.tsx + src/components/MegaMenu.tsx (analitik event’ler)
- src/pages/ProductsPage.tsx (breadcrumb + kategori tıklama analitiği)
- src/main.tsx (scrollRestoration)

## 2) Tasarım İlkeleri

- Kurumsal öncelik: Satışa zorlamadan güven ve bilgi.
- Erişilebilirlik: prefers‑reduced‑motion, klavye ile kontrol, kontrast ve odak durumları.
- Performans: RAF tabanlı akış, lazy görseller, in‑view başlatma (opsiyonel geliştirme), minimal hesaplama.
- Analitik: Tıklama ve niyet sinyalleri (nav_click, category_click, faq_click, resources_click).

## 3) Sıradaki Etkileşimli Bileşen Önerileri (Backlog)

Öneriler etkisine göre gruplandı. Her biri hafif (kütüphanesiz) başlayıp gerekirse animasyon kütüphanesi ile zenginleştirilebilir.

A) Hızlı Etki (Önerilen ilk dalga)
- Spotlight Hero (imleç takipli ışık/spot etkisi)
- In‑view Sayaçlar (Proje sayısı, tasarruf, memnuniyet)
- Before/After Slider (öncesi/sonrası kıyas)

B) Görsel Zenginlik
- Bento Grid (hover’da kısa video/gif önizleme)
- 3D Tilt Card (parallax kartlar)
- Masonry/Gallery (yoğun görsel mozaik)

C) Mikro Etkileşim / Bilgi Mimarisi
- Magnetic CTA (manyetik buton geri bildirimi)
- Scroll‑Linked Process (sticky stepper “Nasıl çalışırız?”)
- Spotlight List (mask‑hover ile odaklı liste)
- Soft‑Particles/Noise Background (hafif doku)

## 4) Uygulama Sırası (Öneri)

1. Spotlight Hero + In‑view Sayaçlar + Before/After Slider
2. Bento Grid + 3D Tilt Card
3. Scroll‑Linked Process + Magnetic CTA + Spotlight List
4. Masonry/Gallery + Soft‑Particles arka plan varyasyonları

Her adımda Lighthouse/a11y kontrolü ve basit QA yapılır; beğenilmeyen değişiklikler kolayca geri alınır.

## 5) Yapılacaklar (Kısa Liste)

- [ ] VisualShowcase ve ProductFlow metin/içeriklerini i18n’e taşı
- [ ] TrustSection rozetlerine detay bağlantıları ekle (KVKK → /legal/kvkk, İade → /support/iade-degisim)
- [ ] ProductFlow: Görseli olanlar görsel, olmayanlar marka kartı (melez akış)
- [ ] ProductFlow: Akış hızlarını ve boyutları marka stiline göre ince ayar
- [ ] (Opsiyonel) IntersectionObserver ile VisualShowcase/ProductFlow’u viewport’a girince başlat
- [ ] Öneri 1. dalga: Spotlight Hero + Sayaçlar + Before/After Slider uygulaması

## 6) QA Kontrol Başlıkları

- Görsel akışlar (VisualShowcase/ProductFlow) hareket azaltmada saygılı mı?
- Akışlar hover’da duruyor mu, mobilde akıcı mı?
- Trust/FAQ/Resources kartları klavye ile erişilebilir, odak görünür mü?
- Breadcrumb doğru mod başlıklarını gösteriyor mu?
- Analitik event’leri tetikleniyor mu (nav_click/category_click/faq_click/resources_click)?

---

Referanslar:
- docs/ROADMAP.md — stratejik yol haritası (bu dosyaya güncelleme düşüldü)
- NEXT_STEPS.md — kısa vadeli görevler (bu dosyaya takip maddeleri eklendi)

