---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\category\CategoryShowcase.tsx
skeleton_hash: fddf0fc033224749
entity_hashes:
  func:CategoryShowcase: 27f451ff64c2aa4f
  overview: 246937774a458600
  style_tokens: 74c7a2fe586c3948
generated_at: 2026-08-27T07:00:10Z
---

## Genel Bakış
`CategoryShowcase` modülü, bir kategori ve ona bağlı alt kategorileri görsel bir vitrin içinde sunan bir React bileşenidir. Bileşen, dışarıdan sağlanan `category`, `subCategories` ve `parentCategory` prop'larını alarak kategori kartı, alt kategori listesi ve üst kategori navigasyonu gibi UI bileşenlerini oluşturur. Doğru çalışması için bu prop'ların geçerli ve beklenen tiplerde olması gerekir; aksi takdirde bileşen hatalı render edilir veya hata oluşur.

## Fonksiyon Grupları
### Ana Bileşen – UI Oluşturma
Bu grup, dışarıdan sağlanan ver

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır. Fonksiyon gövdesi sağlanmadığından, bileşenin çalışma koşulları hakkında fonksiyon gövdesine dayalı bir varsayımda bulunulamaz.

---

## FONKSİYON DETAYLARI

### CategoryShowcase
**Ne yapar**:  
Kategori gösterimini sağlayan bir React bileşeni oluşturur. Bu bileşen, üst kategori bilgisi, alt kategoriler ve ilgili kategori verilerini alarak, kullanıcıya görsel olarak çekici bir kategori galerisini sunar.  

**Nasıl yapar**:  
Fonksiyon, `CategoryShowcaseProps` tipinde bir nesne alır ve bu nesnenin `category`, `subCategories` ve `parentCategory` alanlarını kullanarak JSX döndürür. İçerik, kategori başlığı, açıklama, görsel ve alt kategori bağlantıları gibi öğeleri içerir. Bileşen, stil ve layout için CSS sınıfları veya stil bileşenleri kullanır.  

**Parametreler**:
- category: object — Gösterilecek ana kategori bilgilerini içerir (örneğin, ad, açıklama, görsel URL).
- subCategories: array — Ana kategoriye ait alt kategorilerin listesini tutar; her öğe alt kategori nesnesidir.
- parentCategory: object — Ana kategorinin üst kategorisi hakkında bilgi sağlar (örneğin, ad, link).

**Dönüş**:  
React.FC<CategoryShowcaseProps> tipinde bir fonksiyon bileşeni döndürür. Bu bileşen, JSX ile kategori galerisini render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/type-converters::DomainCategory
- import: ../../utils/breadcrumbUtils::buildCategoryBreadcrumb
- import: ../../utils/getCategoryIcon::getCategoryIcon
- import: ../navigation/Breadcrumb::Breadcrumb
- import: ./EnhancedNeedsWizard::EnhancedNeedsWizard
- import: ./sections::BottomCTA
- import: @/components/ui/VentImage::VentImage
- import: framer-motion::motion
- import: next/image::Image
- import: next/link::Link
- import: react::React
- import: react::useState

---

## INTERFACES

### CategoryShowcaseProps
- `category: DomainCategory`
- `subCategories: DomainCategory[]`
- `parentCategory?: DomainCategory | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/CategoryShowcase.tsx::(sub) => Link
- **params**: `sub` — alt kategori nesnesi
- **ic_degiskenler**:
  - `sub.id` — Link bileşeninin `key` prop'u olarak kullanılır
  - `sub.image_url` — koşullu render kontrolü; varsa VentImage ile görsel gösterilir, yoksa getCategoryIcon ile ikon gösterilir
  - `sub.slug` — getCategoryIcon fonksiyonuna slug parametresi olarak iletilir
  - `sub.description` — alt kategori açıklaması; p etiketinde gösterilir
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` — Supabase depolama URL'si; boş string ile fallback yapılır
  - `Routes.category(categoryUrlSlug, getLocalizedCategorySlug(sub, lang))` — Link'in `href` değeri; dışarıdan gelen `Routes`, `categoryUrlSlug`, `getLocalizedCategorySlug`, `lang` kullanılır
  - `getCategoryDisplayName(sub)` — alt kategori görünen adı; `alt` attribute ve `h3` içinde kullanılır
  - `getCategoryIcon(sub.slug, { size: 64, className: "..." })` — görsel yokken gösterilen ikon bileşeni; dışarıdan gelen fonksiyon
  - `t('category.inspectSeries')` — çeviri anahtarı; "serileri incele" metni; dışarıdan gelen `t` fonksiyonu
- **Dönüş**: JSX — `<Link>` bileşeni; alt kategori kartı render eder

### [N2_NASIL] AST Pointer: src/components/category/CategoryShowcase.tsx::(feature, i) => div
- **params**: `feature` — özellik nesnesi, `i` — dizi indeksi
- **ic_degiskenler**:
  - `i` — div bileşeninin `key` prop'u olarak kullanılır
  - `feature.title` — h3 etiketinde gösterilen özellik başlığı
  - `feature.desc` — p etiketinde gösterilen özellik açıklaması
- **Dönüş**: JSX — `<div>` bileşeni; özellik kartı render eder

---

## NODE ID STANDARD

  file: src\components\category\CategoryShowcase.tsx
  function: src\components\category\CategoryShowcase.tsx::CategoryShowcase

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryShowcase

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-hero`, `rounded-hvac-2xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-50`, `bg-gradient-to-r`, `bg-gradient-to-t`, `bg-gray-50`, `bg-light-gray`, `bg-orange-50`, `bg-primary-navy`, `bg-primary-navy/10`, `bg-secondary-blue/20`, `bg-slate-50`, `bg-slate-900/50`, `bg-white`, `border-4`, `border-b`, `border-gray-100`
- **Layout:** `absolute`, `backdrop-blur-sm`, `bottom-4`, `bottom-8`, `flex`, `flex-col`, `flex-shrink-0`, `from-black/60`, `from-primary-navy/80`, `from-secondary-blue`, `from-slate-950/80`, `gap-16`, `gap-2`, `gap-6`, `gap-8`
- **Varyant/Responsive:** `focus-visible:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-translate-x-1/2`, `animate-bounce`, `animate-fadeIn`, `aspect-4/3`, `aspect-4/5`, `aspect-video`, `border`, `cursor-pointer`, `duration-300`, `duration-700`, `duration-hvac-glacial`, `focus-ring`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `font-bold`