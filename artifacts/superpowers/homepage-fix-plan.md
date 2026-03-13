# Superpowers Implementation Plan: Homepage Fix (v1.0)

## 📋 Hedef ve Kapsam
Anasayfadaki mimari, SEO ve i18n sorunlarını (Raporlanan 5.9/10 skorunu 9+/10'a çıkarmak) çözmek.

## 🛠 Adım Adım Uygulama Planı

### ADIM 1: SEO ve Metadata Konsolidasyonu (Arch-Sentinel)
- **Problem:** Mükerrer SEO yönetimi (Server vs Client).
- **Eylem:** 
  1. `src/app/page.tsx` dosyasını `generateMetadata` (dinamik) ve `jsonLds` (server) ile güncelle.
  2. `src/views/HomePage.tsx` içinden `<Seo />` bileşenini ve client-side JSON-LD scriptlerini kaldır.
- **Doğrulama:** Tarayıcıda `view-source` yaparak metadata ve JSON-LD'nin tekil ve doğru olduğunu teyit et.

### ADIM 2: i18n Sözlük ve Bileşen Senkronizasyonu (i18n-Linguist)
- **Problem:** Eksik/Uyumsuz anahtarlar (`featured/newArrivals/bestSellers`) ve hardcoded metinler.
- **Eylem:**
  1. `src/i18n/dictionaries/en.ts` ve `tr.ts` dosyalarındaki `featuredCommercial.tabs` ve ilgili bölümleri güncelle.
  2. `ApplicationSolutions`, `KnowledgeBlock`, `FeaturedCommercialBlocks`, `FinalCTA` bileşenlerindeki tüm sabit metinleri `t()` fonksiyonuna bağla.
- **Doğrulama:** Dil değişiminde (TR/EN) tüm metinlerin doğru çevrildiğini kontrol et.

### ADIM 3: Performans ve Tip Güvenliği (Perf-Optimizer)
- **Problem:** TypeScript `any` kullanımı, Next.js `<Image />` yerine `<img>` kullanımı, eksik `aria-label`.
- **Eylem:**
  1. `ApplicationSolutions.tsx`, `FeaturedCommercialBlocks.tsx`, `KnowledgeBlock.tsx` içindeki `any` tiplerini kaldır, gerçek tipleri (`Variants`, `Product`, vb.) kullan.
  2. `<img>` etiketlerini `<Image />` bileşenine çevir ve `priority` ayarlarını (LCP için) optimize et.
  3. Slider indikatorlerine ve butonlara açıklayıcı `aria-label` ekle.
- **Doğrulama:** `npm run build` komutuyla tip hatalarının sıfırlandığını gör.

## ✅ Kabul Kriterleri (KPK)
1. SEO metadata'sı sadece sunucu tarafında (`page.tsx`) üretilmeli.
2. Anasayfada hiçbir hardcoded Türkçe/İngilizce metin kalmamalı (hepsi `t()` ile gelmeli).
3. Google Lighthouse SEO skoru 90+ olmalı.
4. Hiçbir bileşende `any` tipi kalmamalı (kritik alanlarda).

## 🚀 Uygulama Talimatı
Bu planı onaylıyorsanız lütfen şu komutu çalıştırın:
`/superpowers-execute-plan`
