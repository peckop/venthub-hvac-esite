---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\CategoryOrbitCarousel.tsx
skeleton_hash: 2e5179f1f31499e7
entity_hashes:
  func:CategoryOrbitCarousel: f55930f20c5ff8c5
  func:getModelTypeForCategory: d5b53316e0d1f0a0
  overview: 4895145f61e69bc3
  style_tokens: 47138b5b4fa0854f
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
VentHub HVAC platformunda ürün kategorilerini interaktif dairesel karusel formatında sunan bir React bileşeni modülüdür. Kullanıcıların alt kategorilere tıklayarak ilgili ürünlere erişmesini sağlar ve standart ile kompakt olmak üzere iki farklı görünüm modunu destekler. Modül, kategori kimliklerini model tiplerine dönüştüren yardımcı fonksiyon aracılığıyla karuselin içerik yapısını dinamik olarak belirler.

## Fonksiyon Grupları

### Kategori Yardımcı Fonksiyonu
Kategori benzersiz adres değerini alarak uygun model tipini belirleyen ve ana bileşenin içerik yükleme mantığını destekleyen yardımcı fonksiyondur.
- getModelTypeForCategory

### Ana Karusel Bileşeni
Alt kategori seçim olaylarını yöneten, görünüm modunu (kompakt/standart) uygulayan ve karusel etkileşimlerini sağlayan ana React bileşenidir.
- CategoryOrbitCarousel

---

## AXIOMS – Mimari Varsayımlar
Bu modül, ürün kategorilerini dairesel karusel olarak göstermek ve alt kategori seçimlerini üst bileşene bildirmek için tasarlan

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

## INTERFACES

### CategoryOrbitCarouselProps
- `onSubcategorySelect?: (categorySlug: string, subcategorySlug?: string) => void`
- `compact?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/CategoryOrbitCarousel.tsx::getModelTypeForCategory
- **params**: (slug?: string)
- **ic_degiskenler**:
  - `slug` — Seçeneksel kategori slug string'i, model tipini belirlemek için kullanılır
  - `s` — Slug'un küçük harfe dönüştürülmüş hali, eşleştirmeler için kullanılır
- **Dönüş**: string | undefined

### [N2_NASIL] AST Pointer: src/components/products/CategoryOrbitCarousel.tsx::CategoryOrbitCarousel
- **params**: ({ onSubcategorySelect, compact = false }: CategoryOrbitCarouselProps)
- **ic_degiskenler**:
  - `onSubcategorySelect` — Alt kategori seçildiğinde çağrılan callback fonksiyonu
  - `compact` — Kompakt görünüm modu için boolean flag, varsayılan false
  - `router` — Next.js router instance, sayfa yönlendirmeleri için
  - `categories` — Tüm kategorilerin listesi, Context'ten gelen veri
  - `categoriesLoading` — Kategorilerin yükleme durumunu belirten boolean
  - `wrapCategory` — Kategori verilerini ViewModel'e dönüştüren fonksiyon
  - `t` — Çeviri fonksiyonu, uluslararası metinler için
  - `level` — Mevcut navigasyon seviyesi ('main' veya 'subcategory')
  - `activeMainCategorySlug` — Aktif ana kategorinin slug'u, null ise ana seviyede
  - `isTransitioning` — Animasyon geçişi sırasında true olan boolean flag
  - `focusedItemTitle` — Odaklanan kartın başlık metni
  - `frontCardTitle` — Öndeki kartın başlık metni
  - `hintIndex` — Dönen ipuçları için indeks
  - `ROTATING_HINTS` — Kullanıcıya gösterilen ipucu metinleri dizisi
  - `mainCategories` — Ana kategorilerin ViewModel listesi, memoized
  - `activeMainCategory` — Seçili ana kategorinin ViewModel'i, memoized
  - `subcategories` — Seçili ana kategorinin alt kategorilerinin ViewModel listesi, memoized
  - `mainCategoriesMap` — Ana kategorilerin slug'a göre eşleştirilmiş Map objesi, memoized
  - `subcategoriesMap` — Alt kategorilerin slug'a göre eşleştirilmiş Map objesi, memoized
  - `displayItems` — OrbitalProductsShowcase bileşenine verilen ürün listesi, memoized
  - `handleFocusedItemChange` — Odaklanan kart değiştiğinde çağrılan callback
  - `handleFrontCardChange` — Öndeki kart değiştiğinde çağrılan callback
  - `handleCardClick` — Kart tıklaması işleme fonksiyonu
  - `handleBack` — Geri dönüş butonu için fonksiyon
  - `handleViewAllProducts` — Tüm ürünleri görme fonksiyonu
  - `isMobile` — Mobil cihaz kontrolü için boolean flag
  - `responsiveHeight` — Duyarlı yükseklik değeri, compact ve isMobile'a göre hesaplanır
  - `responsiveModelScale` — Duyarlı model ölçeği, compact ve isMobile'a göre hesaplanır
- **Dönüş**: JSX (React bileşeni)

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