---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\views\category\SeriesLandingView.tsx
skeleton_hash: 658f0d9ea0a2cfc5
entity_hashes:
  func:SeriesLandingView: 7629549fe574b94e
  overview: afaf8b46a24bca9d
  style_tokens: 168d57f94026ba47
generated_at: 2026-08-27T07:37:45Z
---

## Genel Bakış

Bu modül, bir HVAC ürün serisinin açılış sayfasını (landing page) görüntülemekten sorumlu bir React bileşenidir. Bileşen, seri bilgilerini, seriye ait modelleri ve dil tercihini alarak kullanıcıya sunar. Modül, kategori yapısı altında yer alır ve tek bir bileşen fonksiyonundan oluşur.

## Fonksiyon Grupları

### Ana Görünüm Bileşeni

Seri sayfasının tüm render mantığını tek bir bileşen üzerinde toplar. Dışarıdan gelen seri verisi, model listesi ve dil bilgisini alarak sayfayı oluşturur.

- SeriesLandingView

## Bağımlılıklar

Modül, `series` ve `models` verilerini dışarıdan props olarak alır; bu verilerin nasıl elde edildiği bu dosyada tanımlı değildir. `lang` parametresi çok dilli desteği işaret eder. Modülün iç yapısı hakkında verilen kaynakta ek bilgi bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca fonksiyon imzasından çıkarım yapılabilmektedir. Fonksiyon gövdesi olmadan davranışsal varsayım üretmek mümkün değildir.

[Aksiyom 1]: Eğer `series` parametresi sağlanmazsa, bileşenin nasıl davranacağı bilinmiyor — fonksiyon gövdesi incelenmeden null/undefined kontrolü yapılıp yapılmadığı belirlenemez.

[Aksiyom 2]: Eğer `models` parametresi sağlanmazsa, bileşenin nasıl davranacağı bilinmiyor — fonksiyon gövdesi incelenmeden null/undefined kontrolü yapılıp yapılmadığı belirlenemez.

[Aksiyom 3]: Eğer `lang` parametresi sağlanmazsa, bileşenin nasıl davranacağı bilinmiyor — fonksiyon gövdesi incelenmeden null/undefined kontrolü yapılıp yapılmadığı belirlenemez.

**Not:** Bu modülün gerçek mimari varsayımlarını belirlemek için `SeriesLandingView` fonksiyonunun gövdesi gereklidir. Mevcut bilgiyle yalnızca imzadaki parametrelerin varlığı tespit edilebilmektedir.

---

## FONKSİYON DETAYLARI

### SeriesLandingView
**Ne yapar**: Bir serinin (series) detay sayfasını görüntüleyen bir React bileşenidir. Seriye ait modelleri (models) ve dil bilgisini (lang) alarak ilgili sayfa görünümünü render eder.

**Nasıl yapar**: Fonksiyon, destructuring yöntemiyle `series`, `models` ve `lang` parametrelerini alır ve bir React fonksiyonel bileşeni olarak çalışır. `SeriesLandingViewProps` tipi, bileşenin kabul ettiği propların yapısını tanımlar. Fonksiyonun dönüş tipi `React.FC<SeriesLandingViewProps>` olarak belirtilmiştir, bu bileşenin bir React fonksiyonel bileşeni olduğunu gösterir.

**Parametreler**:
- series: SeriesLandingViewProps["series"] — Görüntülenecek serinin verilerini içerir. Kesin tip bilgisi verilmemiştir.
- models: SeriesLandingViewProps["models"] — Seriye ait modellerin listesini içerir. Kesin tip bilgisi verilmemiştir.
- lang: SeriesLandingViewProps["lang"] — Kullanıcının dil tercihini belirtir. Kesin tip bilgisi verilmemiştir.

**Dönüş**: `React.FC<SeriesLandingViewProps>` — `SeriesLandingViewProps` tipinde props alan bir React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/categoryHelpers::getCategoryDisplayName
- import: ../../utils/categoryHelpers::getLocalizedCategorySlug
- import: @/components/category/sections::BottomCTA
- import: @/components/category/sections::TrustSignals
- import: @/components/navigation/Breadcrumb::Breadcrumb
- import: @/components/products/FamilyCard::FamilyCard
- import: @/components/ui/VentImage::VentImage
- import: @/lib/images/productImage::productImagePlaceholder
- import: @/lib/images/productImage::resolveProductImageUrl
- import: @/lib/services/family.service::type { SeriesLanding }
- import: lucide-react::Info
- import: react::React

---

## INTERFACES

### SeriesLandingViewProps
T138-VH K1 — SERİ LANDING görünümü. "KART = MODEL, SERİ = LANDING" kararının (2026-08-21, Recep) görünen yüzü: seri kendi sayfasında satılmaz, altındaki MODELLERİ tanıtır. Kullanıcı kapasiteyi karttan seçer — piyasadaki (avensair/seat/vortice/danfoss) alışkanlık budur. KABUK YENİDEN KULLANILIR, yeni
- `series: SeriesLanding['series']`
- `models: SeriesLanding['models']`
- `lang: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: SeriesLandingView.tsx::SeriesLandingView
- **params**: `series` — serinin tüm verilerini taşıyan nesne (name, description, category, subcategory, brand_name, series_code, slug), `models` — seriye ait model dizisi, `lang` — geçerli dil kodu ('en' veya 'tr')
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; metinleri dile göre çözümlemek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen yönlendirme rotaları nesnesi; `Routes.category()` ile kategori URL'leri oluşturulur
  - `description` — serinin açıklaması; önce dile göre (`lang === 'en'` ise `series.description?.en`, değilse `series.description?.tr`), bulunamazsa Türkçe, o da yoksa İngilizce açıklama, hiçbiri yoksa `t('category.landing.descriptionFallback')` kullanılır
  - `heroImage` — serinin kapağı; `models[0]?.cover_image_path` null değilse `resolveProductImageUrl({ cover_image_path: ... })` ile çözümlenir, null ise `productImagePlaceholder(series.slug)` ile placeholder kullanılır
  - `categorySlug` — `series.category` varsa `getLocalizedCategorySlug(series.category, lang)` ile hesaplanan yerelleştirilmiş kategori slug'ı, yoksa `null`
  - `subcategorySlug` — `series.subcategory` varsa `getLocalizedCategorySlug(series.subcategory, lang)` ile hesaplanan yerelleştirilmiş alt kategori slug'ı, yoksa `null`
  - `breadcrumbItems` — breadcrumb navigasyon öğeleri dizisi; ilk eleman ana sayfa (`'/'`), ardından `series.category` varsa kategori öğesi (`Routes.category(categorySlug!)`), ardından `series.subcategory` varsa alt kategori öğesi (`categorySlug` varsa `Routes.category(categorySlug, subcategorySlug!)`, yoksa `Routes.category(subcategorySlug!)`), son eleman seri adı (`series.name`, href boş)
- **Dönüş**: JSX — `div.bg-clean-white` kök elemanı; hero bölümü (Breadcrumb, Info ikonu, `series.brand_name`, `series.name` başlığı, `description` paragrafı, `series.series_code`, VentImage), modeller bölümü (`models.map` ile FamilyCard listesi), TrustSignals ve BottomCTA bileşenleri içerir

### [N2_NASIL] AST Pointer: SeriesLandingView.tsx::(model, index) => FamilyCard
- **params**: `model` — dizideki tek bir model nesnesi (id, cover_image_path vb. alanlar içerir), `index` — modelin dizideki sıfır tabanlı indeks numarası
- **ic_degiskenler**: yok
- **Dönüş**: JSX — `FamilyCard` bileşeni; `key` olarak `model.id`, `family` olarak `model`, `layout` olarak `"grid"`, `priority` olarak `index < 4` (ilk 4 model için `true`) gönderilir

---

## NODE ID STANDARD

  file: src\views\category\SeriesLandingView.tsx
  function: src\views\category\SeriesLandingView.tsx::SeriesLandingView

---

## DISA AKTARILANLAR (EXPORTS)
  export: SeriesLandingView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-sm`, `rounded-hvac-xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-clean-white`, `bg-light-gray/40`, `bg-primary-navy/5`, `bg-secondary-blue/5`, `border-b`, `border-light-gray`, `border-primary-navy/10`, `md:text-7xl`, `text-3xl`, `text-5xl`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-steel-gray/70`
- **Layout:** `absolute`, `flex`, `flex-col`, `gap-16`, `gap-3`, `gap-4`, `gap-8`, `grid`, `grid-cols-1`, `items-center`, `justify-between`, `lg:grid-cols-2`, `lg:grid-cols-3`, `max-w-page`, `max-w-prose`
- **Varyant/Responsive:** `lg:`, `md:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `-inset-10`, `aspect-square`, `blur-3xl`, `border`, `content-auto`, `font-bold`, `font-medium`, `leading-hvac-11`, `leading-relaxed`, `lg:px-8`, `mb-10`, `mb-12`, `mb-6`, `mb-8`, `md:py-24`