---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-altyapi\src\components\products\CategoryOrbitCarousel.tsx
skeleton_hash: 07a0c8fab9650bb4
entity_hashes:
  func:CategoryOrbitCarousel: f55930f20c5ff8c5
  func:getModelTypeForCategory: d5b53316e0d1f0a0
  overview: 351b8690efcfb1fc
  style_tokens: 47138b5b4fa0854f
generated_at: 2026-08-18T07:05:23Z
---

## Genel Bakış
Ürün kategorilerini interaktif ve görsel olarak sunan dairesel bir karusel bileşenini barındıran React modülüdür. Modül, kategori verilerini bileşenin içeriğini belirleyen anlamlı model tiplerine dönüştürmek için bir yardımcı fonksiyon kullanır ve kullanıcının alt kategorileri COMPACT veya detaylı modda keşfetmesini sağlar.

## Fonksiyon Grupları
### Veri Dönüştürme ve Yapılandırma
Kategori tanımlayıcısını, karusel bileşeninin içeriğini ve davranışını belirleyen bir model türüne dönüştüren yardımcı mantığı yönetir.
- getModelTypeForCategory

### Ana UI Bileşeni ve Etkileşim
Kullanıcı arayüzünü oluşturur, dairesel dolaşım düzenini render eder ve yapılan alt kategori seçimlerini üst bileşene raporlayan kontrollü React bileşenini tanımlar.
- CategoryOrbitCarousel

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

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
- import: ../../utils/categoryHelpers::getLocalizedCategorySlug
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

### [N1_NASIL] AST Pointer: src/components/products/CategoryOrbitCarousel.tsx::getModelTypeForCategory
- **params**: `(slug?: string)`
- **ic_degiskenler**:
  - `slug` — Kategori slug'u, model tipini belirlemek için kullanılır
  - `s` — Slug'un küçük harfli hali, karşılaştırma için normalize edilir
- **Dönüş**: `string | undefined` — Kategori slug'una karşılık gelen model tipi string'i veya eşleşme yoksa undefined

### [N2_NASIL] AST Pointer: src/components/products/CategoryOrbitCarousel.tsx::CategoryOrbitCarousel
- **params**: `({ onSubcategorySelect, compact = false })`
- **ic_degiskenler**:
  - `onSubcategorySelect` — Prop: Alt kategori seçildiğinde çağrılan callback fonksiyonu
  - `compact` — Prop: Compact modda mı gösterileceği (varsayılan: false)
  - `router` — Next.js useRouter hook'u, sayfa yönlendirmeleri için kullanılır
  - `categories` — useCategories hook'undan gelen tüm kategoriler dizisi
  - `categoriesLoading` — useCategories hook'undan gelen yükleme durumu flag'i
  - `wrapCategory` — useCategoryViewModel hook'undan gelen kategori sarmalama fonksiyonu
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `lang` — useI18n hook'undan gelen aktif dil kodu
  - `Routes` — useLocalizedRoutes hook'undan gelen lokalize route üretici nesnesi
  - `level` — State: Ana menüde mi yoksa alt kategorilerde mi olduğunu belirten state ('main' | 'subcategory')
  - `setLevel` — level state'inin setter fonksiyonu
  - `activeMainCategorySlug` — State: Seçili ana kategorinin slug'u (null ise hiçbir ana kategori seçili değil)
  - `setActiveMainCategorySlug` — activeMainCategorySlug state'inin setter fonksiyonu
  - `isTransitioning` — State: Geçiş animasyonu sırasında true olan flag
  - `setIsTransitioning` — isTransitioning state'inin setter fonksiyonu
  - `focusedItemTitle` — State: Odaklanan kartın başlığı (hover/focus durumunda)
  - `setFocusedItemTitle` — focusedItemTitle state'inin setter fonksiyonu
  - `frontCardTitle` — State: Ön plandaki kartın başlığı (ilk görünen kart)
  - `setFrontCardTitle` — frontCardTitle state'inin setter fonksiyonu
  - `hintIndex` — State: Dönen ipucu mesajlarının indeksi
  - `setHintIndex` — hintIndex state'inin setter fonksiyonu
  - `ROTATING_HINTS` — Kullanıcıya gösterilen dönen ipucu mesajları dizisi
  - `mainCategories` — useMemo: Ana kategorilerin (parent_id olmayan) view model dizisi
  - `activeMainCategory` — useMemo: Seçili ana kategorinin view model nesnesi veya null
  - `activeMainUrlSlug` — useMemo: Seçili ana kategorinin lokalize URL slug'u
  - `subcategories` — useMemo: Seçili ana kategorinin alt kategorilerinin view model dizisi
  - `mainCategoriesMap` — useMemo: Ana kategorilerin slug -> view model eşleme haritası
  - `subcategoriesMap` — useMemo: Alt kategorilerin slug -> view model eşleme haritası
  - `handleFocusedItemChange` — useCallback: Kart odaklandığında/focus kaybettiğinde çağrılan handler
  - `handleFrontCardChange` — useCallback: Ön plandaki kart değiştiğinde çağrılan handler
  - `displayItems` — useMemo: OrbitalProductsShowcase bileşenine geçirilecek öğe listesi
  - `handleCardClick` — useCallback: Kart tıklandığında çağrılan handler (geçiş ve yönlendirme mantığı)
  - `handleBack` — useCallback: Geri tuşuna basıldığında çağrılan handler
  - `handleViewAllProducts` — useCallback: Tüm ürünleri görüntüle butonu için handler
  - `isMobile` — State: Ekranın mobil boyutta olup olmadığını belirten flag
  - `setIsMobile` — isMobile state'inin setter fonksiyonu
  - `checkMobile` — useEffect içinde tanımlı: Pencere genişliğine göre mobil durumunu kontrol eden fonksiyon
  - `responsiveHeight` — Local: Compact mod ve ekran boyutuna göre hesaplanan контейн yüksekliği
  - `responsiveModelScale` — Local: Compact mod ve ekran boyutuna göre hesaplanan model ölçeği
- **Dönüş**: JSX (React bileşeni) — Carousel UI'ını render eden React bileşeni

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