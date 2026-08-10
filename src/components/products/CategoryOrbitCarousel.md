---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\CategoryOrbitCarousel.tsx
skeleton_hash: e5a77fb93eacd45b
entity_hashes:
  func:CategoryOrbitCarousel: f55930f20c5ff8c5
  func:getModelTypeForCategory: d5b53316e0d1f0a0
  overview: f0a53dd9fcdced1d
  style_tokens: 47138b5b4fa0854f
generated_at: 2026-06-19T20:47:59Z
---

## Genel Bakış
Ürün kategorilerini interaktif, dairesel bir karusel bileşeni aracılığıyla sunan bir React modülüdür. Kullanıcıların alt kategorileri keşfetmesine olanak tanır ve hem detaylı hem de kompakt olmak üzere iki farklı görünüm modunu destekler. Modül, kategori verilerini model tiplerine dönüştüren bir yardımcı fonksiyon ile dinamik içerik oluşturmayı sağlar.

## Fonksiyon Grupları
### Kategori Model Dönüşümü
Kategori tanımlayıcısını (slug) uygun model tipine dönüştürerek bileşenin içeriğini yapılandıran yardımcı mantığı içerir.
- getModelTypeForCategory

### Karusel Görüntüleme ve Etkileşim
Kullanıcı arayüzünü oluşturur, kategori dolaşımını yönetir ve yapılan seçimleri üst bileşene raporlayan ana React bileşenidir.
- CategoryOrbitCarousel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için tanımlanan mimari varsayımlar, verilen fonksiyon imzaları ve modül yapısına dayanmaktadır.

[Aksiyom 1]: Eğer `getModelTypeForCategory` fonksiyonuna geçersiz veya tanımsız bir `slug` parametresi verilirse, `undefined` değeri döner ve karusel bileşeni (`CategoryOrbitCarousel`) içeriği dinamik olarak belirlenemez; bu durumda bileşenin hangi alt kategorileri göstereceği bilinmez.

[Aksiyom 2]: Eğer `CategoryOrbitCarousel` bileşeni `onSubcategorySelect` prop'u olmadan çağrılırsa, kullanıcı bir alt kategoriye tıkladığında tetiklenecek bir işlev olmadığı için ilgili ürünlere yönlendirme yapılamaz.

[Aksiyom 3]: Eğer `compact` prop'u `true` olarak ayarlanırsa, karusel kompakt görünüm modunda render edilir; bu durumda bileşenin layout ve boyutları `FADE_IN_DOWN_CSS`, `FADE_IN_CSS`, `SCALE_IN_CSS` template sabitlerine veya `OrbitalProductsShowcase` çağrılarına bağlı olarak daha küçük/sıkıştırılmış bir yapıya geçebilir.

[Aksiyom 4]: Eğer `getModelTypeForCategory` fonksiyonu geçerli bir `slug` girdisi için beklenmeyen bir model tipi (örn. bilinmeyen bir kategori) döndürürse, `OrbitalProductsShowcase` bileşeninin içeriği uyumsuz olabilir veya boş kalabilir.

---

## FONKSİYON DETAYLARI

### getModelTypeForCategory
**Ne yapar**: İsteğe bağlı olarak gelen kategori slug değerine göre uygun ürün model tipini eşleştirip döndürür, kategori bazlı ürün sınıflandırması işlemini gerçekleştirir. Sadece tanımlı ve geçerli slug değerleri için geçerli bir model tipi sonucu üretir.
**Nasıl yapar**: Gelen slug parametresini önceden tanımlanmış kategori-model eşleşmeleri ile karşılaştırır, eşleşme bulunduğunda ilgili model tipini iletir. Eğer slug tanımsız ise veya hiçbir eşleşme sağlanamaz ise tanımsız değerini döndürür.
**Parametreler**:
- slug: string | undefined — İşlem yapılacak kategorinin benzersiz, URL yapısına uygun kısa kimliği, isteğe bağlı olarak tanımlanabilir
**Dönüş**: string | undefined — Geçerli ve eşleşen slug durumunda ilgili ürün model tipini, geçersiz veya tanımsız slug durumunda undefined değerini döndürür

### CategoryOrbitCarousel
**Ne yapar**: VentHub HVAC platformu ürünlerini kategorilere göre dairesel yörünge karusel formatında sunan React bileşenidir, kullanıcıların listedeki alt kategoriler arasında gezinmesini ve seçim yapmasını sağlar. Farklı ekran boyutları ve kullanım senaryolarına uygun olarak kompakt modda çalışma desteği sunar.
**Nasıl yapar**: Aldığı yapılandırma parametrelerine göre arayüzünü düzenler, kullanıcı tarafından bir alt kategori seçimi yapıldığında üst bileşene seçim bilgisini iletmek için tanımlanan callback fonksiyonunu tetikler. Varsayılan olarak standart boyutlu düzeni kullanır, compact parametresi true olarak iletildiğinde daha küçük ölçekli arayüzü render eder.
**Parametreler**:
- onSubcategorySelect: CategoryOrbitCarouselProps tipinde tanımlı callback fonksiyonu — Kullanıcı tarafından bir alt kategori seçildiğinde tetiklenir, seçilen kategori bilgilerini üst bileşene iletmek için kullanılır
- compact: boolean — Bileşenin kompakt küçük boyutlu modda çalışmasını sağlayan isteğe bağlı parametre, varsayılan değeri false olarak tanımlanmıştır
**Dönüş**: Void veya bilinmeyen türde değer, React bileşeni olarak ekrana karusel arayüzünü render eder, dönüş tipi açıkça tanımlanmamıştır

---

## İTHALATLAR (IMPORTS)
- import: ../../contexts/CategoryContext::useCategories
- import: ../../hooks/useCategoryViewModel::useCategoryViewModel
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: lucide-react::ArrowLeft
- import: lucide-react::ChevronRight
- import: next/dynamic::dynamic
- import: next/navigation::useRouter
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useState

---

## INTERFACES

### CategoryOrbitCarouselProps
- `onSubcategorySelect?: (categorySlug: string, subcategorySlug?: string) => void`
- `compact?: boolean`

---

## SABİTLER
- **FADE_IN_DOWN_CSS** (template) — ``@keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } t...`
- **FADE_IN_CSS** (template) — ``@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { o...`
- **SCALE_IN_CSS** (template) — ``@keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opaci...`
- **OrbitalProductsShowcase** (call) — `dynamic(() => import('./OrbitalProductsShowcase'), { ssr: false })`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::getModelTypeForCategory
- **params**: `(slug?: string)`
- **ic_degiskenler**:
  - `slug` — Kategori slug'ı, model tipini belirlemek için kullanılır
  - `s` — slug'ın lowercase hali, kontrol işlemleri için
- **Dönüş**: `string | undefined` — Model tipi adı veya undefined

### [N2_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::CategoryOrbitCarousel
- **params**: `({ onSubcategorySelect, compact = false }: CategoryOrbitCarouselProps)`
- **ic_degiskenler**:
  - `router` — Next.js router instance, navigasyon işlemleri için
  - `categories` — Tüm kategorilerin listesi
  - `categoriesLoading` — Kategorilerin yüklenme durumu
  - `wrapCategory` — Kategorileri view model'e dönüştüren fonksiyon
  - `t` — Çeviri fonksiyonu
  - `Routes` — Localize edilmiş rotalar
  - `level` — Aktif görünüm seviyesi ('main' veya 'subcategory')
  - `activeMainCategorySlug` — Aktif ana kategorinin slug'ı
  - `isTransitioning` — Geçiş animasyonu durumu
  - `focusedItemTitle` — Odaklanan öğenin başlığı
  - `frontCardTitle` — Ön kartın başlığı
  - `hintIndex` — İpucu metni indeksi
  - `ROTATING_HINTS` — Dönen ipucu metinleri dizisi
  - `mainCategories` — Ana kategoriler (viewModel formatında)
  - `activeMainCategory` — Aktif ana kategori view model
  - `subcategories` — Alt kategoriler (viewModel formatında)
  - `mainCategoriesMap` — Ana kategorilerin slug -> view model haritası
  - `subcategoriesMap` — Alt kategorilerin slug -> view model haritası
  - `handleFocusedItemChange` — Odak değişikliği handler'ı
  - `handleFrontCardChange` — Ön kart değişikliği handler'ı
  - `displayItems` — OrbitalProductsShowcase'a geçirilecek öğeler
  - `handleCardClick` — Kart tıklama handler'ı
  - `handleBack` — Geri gitme handler'ı
  - `handleViewAllProducts` — Tüm ürünleri görüntüleme handler'ı
  - `isMobile` — Mobil görünüm kontrolü
  - `responsiveHeight` — Responsive yükseklik
  - `responsiveModelScale` — Responsive model ölçeği
- **Dönüş**: JSX element (React component)

### [N3_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::mainCategories useMemo
- **params**: `[]` (useMemo callback)
- **ic_degiskenler**: yok
- **Dönüş**: Array — Ana kategorilerin view model listesi

### [N4_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::activeMainCategory useMemo
- **params**: `[]` (useMemo callback)
- **ic_degiskenler**: yok
- **Dönüş**: Object | null — Aktif ana kategori view model

### [N5_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::subcategories useMemo
- **params**: `[]` (useMemo callback)
- **ic_degiskenler**: yok
- **Dönüş**: Array — Alt kategorilerin view model listesi

### [N6_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::mainCategoriesMap useMemo
- **params**: `[]` (useMemo callback)
- **ic_degiskenler**:
  - `map` — Slug -> view model haritası
- **Dönüş**: Map — Ana kategorilerin haritası

### [N7_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::subcategoriesMap useMemo
- **params**: `[]` (useMemo callback)
- **ic_degiskenler**:
  - `map` — Slug -> view model haritası
- **Dönüş**: Map — Alt kategorilerin haritası

### [N8_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleFocusedItemChange useCallback
- **params**: `(itemId: string | null)`
- **ic_degiskenler**:
  - `itemId` — Odaklanan öğenin ID'si
  - `title` — Odaklanan öğenin başlığı
- **Dönüş**: void

### [N9_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleFrontCardChange useCallback
- **params**: `(itemId: string)`
- **ic_degiskenler**:
  - `itemId` — Ön karttaki öğenin ID'si
  - `title` — Ön karttaki öğenin başlığı
- **Dönüş**: void

### [N10_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::level useEffect
- **params**: `[]` (useEffect callback)
- **ic_degiskenler**: yok
- **Dönüş**: void

### [N11_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::displayItems useMemo
- **params**: `[]` (useMemo callback)
- **ic_degiskenler**:
  - `rawCat` — Ham kategori verisi (DB'den gelen)
  - `dbModelType` — DB'den gelen model tipi
- **Dönüş**: Array — OrbitalProductsShowcase için öğe listesi

### [N12_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::displayItems map callback (main)
- **params**: `(vm)` — View model parametresi
- **ic_degiskenler**:
  - `rawCat` — Ham kategori verisi
  - `dbModelType` — DB'den gelen model tipi
- **Dönüş**: Object — Görünüm öğesi

### [N13_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::displayItems map callback (subcategory)
- **params**: `(vm)` — View model parametresi
- **ic_degiskenler**:
  - `rawCat` — Ham kategori verisi
  - `dbModelType` — DB'den gelen model tipi
- **Dönüş**: Object — Görünüm öğesi

### [N14_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleCardClick useCallback
- **params**: `(itemId: string)`
- **ic_degiskenler**:
  - `itemId` — Tıklanan kartın ID'si
  - `categoryVm` — Ana kategori view model (level='main' durumunda)
  - `hasSubs` — Alt kategorilerin varlığı kontrolü
  - `subVm` — Alt kategori view model (level='subcategory' durumunda)
- **Dönüş**: void

### [N15_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::setTimeout callback (handleCardClick)
- **params**: `[]` (setTimeout callback)
- **ic_degiskenler**: yok
- **Dönüş**: void

### [N16_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleBack useCallback
- **params**: `[]`
- **ic_degiskenler**: yok
- **Dönüş**: void

### [N17_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::setTimeout callback (handleBack)
- **params**: `[]` (setTimeout callback)
- **ic_degiskenler**: yok
- **Dönüş**: void

### [N18_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleViewAllProducts useCallback
- **params**: `[]`
- **ic_degiskenler**: yok
- **Dönüş**: void

### [N19_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::isMobile useEffect
- **params**: `[]` (useEffect callback)
- **ic_degiskenler**:
  - `checkMobile` — Mobil görünüm kontrol fonksiyonu
- **Dönüş**: void

---

## NODE ID STANDARD

  file: src\components\products\CategoryOrbitCarousel.tsx
  function: src\components\products\CategoryOrbitCarousel.tsx::getModelTypeForCategory
  function: src\components\products\CategoryOrbitCarousel.tsx::CategoryOrbitCarousel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryOrbitCarousel
  export: getModelTypeForCategory

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-panel`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-r`, `bg-orbit-radial-1`, `bg-orbit-radial-2`, `bg-surface-darker`, `bg-white/10`, `border-white/20`, `from-cyan-500`, `hover:bg-white/20`, `md:text-3xl`, `sm:text-sm`, `text-center`, `text-cyan-400`, `text-sm`, `text-white`, `text-white/50`
- **Layout:** `absolute`, `backdrop-blur-md`, `flex`, `flex-col`, `from-cyan-500`, `gap-2`, `gap-3`, `h-4`, `hover:shadow-cyan-500/30`, `hover:shadow-lg`, `items-center`, `justify-between`, `justify-center`, `left-0`, `max-w-150px`
- **Varyant/Responsive:** `:`, `active:`, `group-hover:`, `hover:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${level`, `:`, `===`, `active:scale-98`, `border`, `container`, `duration-1000`, `duration-300`, `ease-in-out`, `font-bold`, `font-medium`, `group`, `group-hover:-translate-x-1`, `hover:scale-102`, `inset-0`