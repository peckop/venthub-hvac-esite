---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminPricePreviewPage.tsx
skeleton_hash: 6ce858d9d2374d34
entity_hashes:
  func:AdminPricePreviewPage: d76022c4c2d70ef6
  overview: fc36ebf0837e0537
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-14T09:17:41Z
---

## Genel Bakış
Bu modül, yönetici panelinde fiyatlandırma verilerinin önizlenmesini sağlayan tek sayfalık bir React bileşenini tanımlar. Sayfa, muhtemelen fiyat listelerini, filtreleme seçeneklerini ve düzenlemeye yönelik arayüz elemanlarını bir araya getirerek yöneticilerin fiyatlandırma politikalarını görsel olarak kontrol etmesine olanak tanır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Fiyatlandırma önizleme arayüzünün tamamını oluşturan ana konteyner bileşeni. Kullanıcı etkileşimlerini yönetir ve alt bileşenleri düzenler.
- AdminPricePreviewPage

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### AdminPricePreviewPage

**Ne yapar**: Admin fiyat önizleme sayfasını render eden React fonksiyonel bileşenidir. Sayfa, üst kısımda bir başlık ve alt kısımda Suspense sarıcı içinde PricePreviewPanel bileşenini barındırır. Kullanıcıya ürün bazlı fiyat karşılaştırmasını segment, para birimi ve miktar filtreleriyle sunar.

**Nasıl yapar**: Fonksiyon, React.FC türünde bir fonksiyonel bileşen olup parametre almaz. Bileşen içinde önce sayfa başlığını render eder, ardından PricePreviewPanel bileşenini Suspense ile sarar. Suspense kullanımı CLAUDE.md Kural 5 gereği zorunludur; çünkü PricePreviewPanel içindeki useSearchParams hook'u URL query parametrelerini (`productId`, `segment`, `currency`, `qty`) client-side'da okur. Bu durum SSR sırasında useSearchParams'ın erişemeyeceği durumlara yol açabilir, bu yüzden Suspense ile sarmalanarak SSR zehirlenmesi (hydration mismatch) önlenir.

**Parametreler**:
- Bu bileşen props almamaktadır (React.FC olarak tanımlıdır)
- URL query parametreleri doğrudan bu bileşen tarafından değil, alt bileşen PricePreviewPanel tarafından useSearchParams hook'u ile tüketilir:
  - `productId` — string — Önizlenecek ürünün kimliği
  - `segment` — string — Fiyat segmenti filtresi
  - `currency` — string — Para birimi filtresi
  - `qty` — string — Miktar filtresi

**Dönüş**: `React.FC` — Başlık elemanı ve Suspense ile sarılmış PricePreviewPanel bileşenini içeren JSX yapısı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./PricePreviewPanel::PricePreviewPanel
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminPricePreviewPage.tsx::AdminPricePreviewPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('admin.titles.pricingPreview')` ve `t('admin.pricing.preview.subtitle')` çağrılarıyla başlık ve alt başlık metinlerini uluslararası dilde döndürür
- **Dönüş**: JSX döndürür — `<div>` wrapper içinde `<header>` (başlık ve alt başlık) ve `<Suspense>` ile sarılmış `<PricePreviewPanel />` bileşeni; Suspense fallback olarak `<AdminSkeleton variant="form" fields={4} />` gösterir

---

## NODE ID STANDARD

  file: src\views\admin\AdminPricePreviewPage.tsx
  function: src\views\admin\AdminPricePreviewPage.tsx::AdminPricePreviewPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminPricePreviewPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `pb-20`, `space-y-6`