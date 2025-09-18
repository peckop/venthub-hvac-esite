# SEO ve i18n Standartları (VentHub)

Son güncelleme: 2025-09-18

Bu belge; dil ve SEO metadatalarının uygulama genelinde nasıl üretildiğini ve geliştirici rehberini içerir.

## 1) HTML lang ve yön
- I18nProvider, `document.documentElement.lang` özniteliğini anlık dile göre günceller (`tr` veya `en`).
- `dir` LTR olarak sabitlenmiştir.

## 2) Hreflang Alternates
- Seo bileşeni her sayfa render’ında (başlık/açıklama/canonical değişiminde) şu link etiketlerini üretir:
  - `rel="alternate" hreflang="tr-TR"` → URL + `?lang=tr`
  - `rel="alternate" hreflang="en-US"` → URL + `?lang=en`
  - `rel="alternate" hreflang="x-default"` → dil parametresi olmadan canonical URL
- İleride /tr, /en yol ön eki stratejisine geçilirse aynı mantık base path’lerle uygulanır.

## 3) Open Graph / Twitter
- `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name` ve `og:locale` dinamik.
- `og:locale:alternate`: mevcut dil dışındaki diller (tr_TR/en_US) meta olarak eklenir.
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` dinamik.

## 4) Para ve Tarih Formatı
- Para: `formatCurrency(value, lang, options)` TRY bazlı; dil sadece biçim içindir.
- Tarih/Saat: `formatDate(input, lang)`, `formatDateTime(input, lang)`, `formatTime(input, lang)`.
- Kullanım rehberi:
  - Görsel UI: her yerde helper kullanın; `toLocaleString`/`Intl.NumberFormat` çağrılarını bırakın.
  - Export (CSV/XLS): Görsel uyum için locale‑aware kalabilir; analitik/işlem için ham değer gerekiyorsa ek kolon ekleyin (ör. `amount_raw`).

## 5) Sayfalar ve Bileşenler
- Seo bileşeni: HomePage, ProductsPage, CategoryPage, ProductDetailPage, BrandsPage, BrandDetailPage’de aktif.
- Admin ve Hesap sayfalarında tüm tutar/tarih alanları helper’larla yönetilir.

## 6) Geliştirici Notları
- Yeni stringler için i18n sözlüğüne anahtar ekleyin (tr/en).
- Tarih/saat için backend ISO 8601 tercih edilir; helper’lar Date’e dönüştürüp güvenli biçimler.
- OG görseli verilmezse `/images/hvac_heat_recovery_7.png` varsayılanıdır.