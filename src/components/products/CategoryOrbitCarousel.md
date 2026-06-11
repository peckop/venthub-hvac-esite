---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\CategoryOrbitCarousel.tsx
skeleton_hash: 6345d7dff2b12337
entity_hashes:
  func:CategoryOrbitCarousel: f55930f20c5ff8c5
  func:getModelTypeForCategory: d5b53316e0d1f0a0
  overview: df42b4715b1e78f0
  style_tokens: 47138b5b4fa0854f
generated_at: 2026-06-11T16:15:47Z
---

## Genel Bakış
Ürün kategorilerini interaktif dairesel karusel formatında görüntüleyen bir React bileşeni modülüdür. Kullanıcıların alt kategorilere tıklayarak ilgili ürünlere erişmesini sağlar ve hem standart hem de kompakt olmak üzere iki farklı görünüm modunu destekler. Modül, kategori kimliklerini model tiplerine dönüştüren yardımcı fonksiyon aracılığıyla karuselin içerik yapısını dinamik olarak belirler.

## Fonksiyon Grupları

### Kategori-Dönüşüm Yardımcısı
Kategori benzersiz adres değerini alarak uygun model tipini belirleyen yardımcı fonksiyondur. Ana bileşenin içerik yükleme ve sınıflandırma mantığını destekler.
- getModelTypeForCategory

### Ana Karusel Bileşeni
Kullanıcı etkileşimlerini yöneten, görünüm modunu uygulayan ve alt kategori seçimlerini üst bileşene bildiren ana React bileşenidir.
- CategoryOrbitCarousel

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kategori karuseli bileşeninin çalışması için aşağıdaki mimari varsayımlara dayanır:

[Aksiyom 1]: Eğer `onSubcategorySelect` prop'u sağlanmazsa veya geçerli bir fonksiyon değilse, kullanıcı alt kategorilere tıklayamaz ve navigasyon işlevselliği çalışmaz.

[Aksiyom 2]: Eğer `slug` parametresi `getModelTypeForCategory` için tanımsız (undefined) gelirse, uygun model tipi belirlenemez ve karusel içeriği varsayılan veya boş duruma düşer.

[Aksiyom 3]: Eğer `compact` prop'u `false` olarak başlamazsa (örn: invalid değer gelirse), karuselin standart görünüm modu yanlış render edilir.

[Aksiyom 4]: Eğer `OrbitalProductsShowcase` modülde çağrılmazsa, karousel bileşeni ürünleri gösteremez.

[Aksiyom 5]: Eğer `CategoryOrbitCarouselProps` yapısında `onSubcategorySelect` alanı zorunlu olarak tanımlanmamışsa, bileşen alt kategori seçim olayını tetikleyemez.

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

## SABİTLER
- **OrbitalProductsShowcase** (call) — `dynamic(() => import('./OrbitalProductsShowcase'), { ssr: false })`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::getModelTypeForCategory
- **params**: `slug?: string` — kategori slug'u, model tipi belirlemek için kullanılır
- **ic_degiskenler**:
  - `s` — slug'un küçük harfe çevrilmiş hali, keyword eşleştirmeleri için kullanılır
- **Dönüş**: `string | undefined` — slug eşleşmesine göre model tipi dizesi (ör. 'AxialFanModel') veya eşleşme yoksa undefined, hiçbir eşleşme tutmazsa 'AxialFanModel'

---

### [N2_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::CategoryOrbitCarousel
- **params**: `{ onSubcategorySelect, compact = false }` — onSubcategorySelect: alt kategori seçildiğinde çağrılan callback, compact: kompakt görünüm flag'i
- **ic_degiskenler**:
  - `router` — next/navigation'dan gelen yönlendirme nesnesi, sayfa geçişleri için kullanılır
  - `categories` — useCategories hook'undan gelen tüm kategori listesi
  - `categoriesLoading` — kategorilerin yüklenme durumu flag'i
  - `wrapCategory` — useCategoryViewModel hook'undan gelen, ham kategoriyi view model'e dönüştüren fonksiyon
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `level` — mevcut görünüm seviyesi: 'main' veya 'subcategory'
  - `setLevel` — level durumunu güncelleyen setter
  - `activeMainCategorySlug` — seçili ana kategorinin slug'u, alt kategori seviyesinde kullanılır
  - `setActiveMainCategorySlug` — activeMainCategorySlug setter'ı
  - `isTransitioning` — animasyon geçiş durumu flag'i
  - `setIsTransitioning` — isTransitioning setter'ı
  - `focusedItemTitle` — şu an odaklanan kartin başlığı, header'da gösterilir
  - `setFocusedItemTitle` — focusedItemTitle setter'ı
  - `frontCardTitle` — ön plandaki kartın başlığı, header'da fallback olarak gösterilir
  - `setFrontCardTitle` — frontCardTitle setter'ı
  - `hintIndex` — dönen ipucu metinlerindeki mevcut indeks
  - `setHintIndex` — hintIndex setter'ı
  - `ROTATING_HINTS` — sabit ipucu metinleri dizisi: 'Tut Çevir', 'Ürüne Tıkla', 'Sol-Sağ Çevir', 'Kategoriyi Seç'
  - `mainCategories` — useMemo: parent_id olmayan kategorilerin view model listesi
  - `activeMainCategory` — useMemo: aktif ana kategorinin view model'i veya null
  - `subcategories` — useMemo: aktif ana kategorinin alt kategorilerinin view model listesi
  - `mainCategoriesMap` — useMemo: ana kategorilerin slug'a göre Map yapısı
  - `subcategoriesMap` — useMemo: alt kategorilerin slug'a göre Map yapısı
  - `handleFocusedItemChange` — useCallback: odaklanan kart değiştiğinde başlığı güncelleyen handler
  - `handleFrontCardChange` — useCallback: ön kart değiştiğinde başlığı ve hint indeksini güncelleyen handler
  - `displayItems` — useMemo: carousel'de gösterilecek item dizisi (id, title, image, categorySlug, modelType)
  - `handleCardClick` — useCallback: karta tıklandığında alt kategoriye geçiş veya sayfa yönlendirmesi yapan handler
  - `handleBack` — useCallback: ana kategori seviyesine geri dönen handler
  - `handleViewAllProducts` — useCallback: aktif kategorinin tüm ürünlerini gösteren handler
  - `isMobile` — responsive tasarım için mobil kontrol flag'i
  - `setIsMobile` — isMobile setter'ı
  - `responsiveHeight` — compact/isMobile durumuna göre hesaplanan yükseklik (220|280|380|500)
  - `responsiveModelScale` — compact/isMobile durumuna göre hesaplanan model ölçeği (0.7|0.9|1.1|1.5)
- **Dönüş**: JSX element (section yapısı) veya yükleme durumunda boş div

---

### [N3_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::mainCategories (useMemo)
- **params**: yok (closure'dan `categories`, `wrapCategory` kullanılır)
- **ic_degiskenler**: yok
- **Dönüş**: category view model dizisi — parent_id olmayan kategorilerin wrapCategory ile dönüştürülmüş hali

---

### [N4_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::activeMainCategory (useMemo)
- **params**: yok (closure'dan `mainCategories`, `activeMainCategorySlug` kullanılır)
- **ic_degiskenler**: yok
- **Dönüş**: tek bir category view model veya null — slug eşleşen ana kategoriyi bulur

---

### [N5_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::subcategories (useMemo)
- **params**: yok (closure'dan `categories`, `activeMainCategory`, `wrapCategory` kullanılır)
- **ic_degiskenler**: yok
- **Dönüş**: category view model dizisi — aktif ana kategorinin alt kategorileri veya boş dizi

---

### [N6_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::mainCategoriesMap (useMemo)
- **params**: yok (closure'dan `mainCategories` kullanılır)
- **ic_degiskenler**:
  - `map` — Map nesnesi, slug anahtar ile category view model eşleştirmesi yapar
- **Dönüş**: `Map<string, CategoryViewModel>` — slug'a göre ana kategorilerin haritası

---

### [N7_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::subcategoriesMap (useMemo)
- **params**: yok (closure'dan `subcategories` kullanılır)
- **ic_degiskenler**:
  - `map` — Map nesnesi, slug anahtar ile subcategory view model eşleştirmesi yapar
- **Dönüş**: `Map<string, CategoryViewModel>` — slug'a göre alt kategorilerin haritası

---

### [N8_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleFocusedItemChange (useCallback)
- **params**: `itemId: string | null` — odaklanan kartın ID'si veya odak kalktığında null
- **ic_degiskenler**:
  - `title` — odaklanan kartın görünür başlığı, main veya subcategory seviyesine göre Map'ten çekilir
  - `cat` — mainCategoriesMap'ten bulunan ana kategori view model'i (level === 'main' dalında)
  - `sub` — subcategoriesMap'ten bulunan alt kategori view model'i (level === 'subcategory' dalında)
- **Dönüş**: yok — yan etki: setFocusedItemTitle ve setHintIndex ile durum günceller

---

### [N9_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleFrontCardChange (useCallback)
- **params**: `itemId: string` — ön plandaki kartın ID'si
- **ic_degiskenler**:
  - `title` — ön kartın görünür başlığı, main veya subcategory seviyesine göre Map'ten çekilir
  - `cat` — mainCategoriesMap'ten bulunan ana kategori view model'i (level === 'main' dalında)
  - `sub` — subcategoriesMap'ten bulunan alt kategori view model'i (level === 'subcategory' dalında)
- **Dönüş**: yok — yan etki: setFrontCardTitle ve setHintIndex(prev => (prev + 1) % 4) ile durum günceller

---

### [N10_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::useEffect_levelChange
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: level değiştiğinde setFocusedItemTitle(null) ve setFrontCardTitle(null) çağırarak başlıkları sıfırlar

---

### [N11_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::displayItems (useMemo)
- **params**: yok (closure'dan `level`, `mainCategories`, `subcategories`, `categories` kullanılır)
- **ic_degiskenler**: yok (map callback içindeki değişkenler aşağıda ayrı olarak listelenir)
- **Dönüş**: `{ id, title, image, categorySlug, modelType }[]` — carousel'de gösterilecek item nesneleri dizisi; level 'main' ise mainCategories'den, 'subcategory' ise subcategories'den üretilir, boş dizi fallback

---

### [N12_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::displayItems_mainMapCallback
- **params**: `vm` — category view model nesnesi (mainCategories.map callback parametresi)
- **ic_degiskenler**:
  - `rawCat` — categories dizisinde slug eşleşmesiyle bulunan ham kategori nesnesi
  - `dbModelType` — rawCat.metadata.model_type değerinden çıkarılan model tipi string'i veya undefined
- **Dönüş**: `{ id, title, image, categorySlug, modelType }` — carousel item nesnesi

---

### [N13_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::displayItems_subcategoryMapCallback
- **params**: `vm` — category view model nesnesi (subcategories.map callback parametresi)
- **ic_degiskenler**:
  - `rawCat` — categories dizisinde slug eşleşmesiyle bulunan ham kategori nesnesi
  - `dbModelType` — rawCat.metadata.model_type değerinden çıkarılan model tipi string'i veya undefined
- **Dönüş**: `{ id, title, image, categorySlug, modelType }` — carousel item nesnesi

---

### [N14_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleCardClick (useCallback)
- **params**: `itemId: string` — tıklanan kartın ID'si
- **ic_degiskenler**:
  - `categoryVm` — mainCategoriesMap'ten bulunan ana kategori view model'i (level === 'main' dalında)
  - `hasSubs` — categories.some ile kontrol edilen, kategorinin alt kategorisi olup olmadığı boolean
  - `subVm` — subcategoriesMap'ten bulunan alt kategori view model'i (level === 'subcategory' dalında)
- **Dönüş**: yok — yan etki: level 'main' ve alt kategorisi varsa subcategory seviyesine geçiş yapar; yoksa onSubcategorySelect callback veya router.push ile sayfa yönlendirmesi yapar

---

### [N15_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleBack (useCallback)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: setIsTransitioning(true), 400ms timeout içinde setLevel('main'), setActiveMainCategorySlug(null), setIsTransitioning(false)

---

### [N16_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleViewAllProducts (useCallback)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: activeMainCategorySlug varsa router.push(Routes.category(activeMainCategorySlug)) ile tüm ürünler sayfasına yönlendirir

---

### [N17_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::useEffect_mobileDetection
- **params**: yok
- **ic_degiskenler**:
  - `checkMobile` — fonksiyon: window.innerWidth < 768 kontrolü yaparak isMobile state'ini günceller
- **Dönüş**: yok — yan etki: component mount'ta checkMobile çağırır, resize event listener ekler, unmount'ta listener'ı kaldırır

---

### [N18_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleCardClick_subcategoryTimeout
- **params**: yok (setTimeout callback)
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: setLevel('subcategory') ve setIsTransitioning(false) ile alt kategori görünümüne geçişi tamamlar

---

### [N19_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::handleBack_timeoutCallback
- **params**: yok (setTimeout callback)
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: setLevel('main'), setActiveMainCategorySlug(null), setIsTransitioning(false) ile ana seviyeye dönüşü tamamlar

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