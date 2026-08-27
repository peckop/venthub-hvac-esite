---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminPricePreviewPage.tsx
skeleton_hash: a12890eded5826aa
entity_hashes:
  func:AdminPricePreviewPage: d76022c4c2d70ef6
  overview: c6580e02bc96aa38
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-27T07:20:08Z
---

## Genel Bakış
Bu modül, yönetici panelinde fiyatlandırma verilerinin önizlenmesini sağlayan tek sayfalık bir React bileşenini tanımlar. Sayfa, ürün bazlı fiyat karşılaştırmasını segment, para birimi ve miktar filtreleriyle sunar. Bileşen, PricePreviewPanel alt bileşenini Suspense ile sararak URL query parametrelerine bağlı asenkron veri yüklemesini yönetir.

## Fonksiyon Grupları
### Sayfa Bileşeni
Fiyatlandırma önizleme arayüzünün tamamını oluşturan ana konteyner bileşendir. Sayfa başlığını render eder ve PricePreviewPanel bileşenini Suspense sarmalayıcısı içinde barındırır; bu yapı, useSearchParams hook'u nedeniyle zorunludur.
- AdminPricePreviewPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./PricePreviewPanel::PricePreviewPanel
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminPricePreviewPage.tsx::AdminPricePreviewPage
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `admin.titles.pricingPreview` ve `admin.pricing.preview.subtitle` anahtarlarıyla sayfa başlığı ve alt başlık metinlerini almak için kullanılır
- **Dönüş**: JSX — bir `div` (className `"space-y-6 pb-20"`) içinde `AdminPageHeader` bileşeni (`title` ve `description` prop'ları ile) ve `Suspense` ile sarılmış `PricePreviewPanel` bileşeni döndürür; `Suspense` yüklenirken `AdminSkeleton` (variant `"form"`, fields `4`) fallback olarak gösterilir

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