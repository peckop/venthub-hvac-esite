---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\_components\ProductDetailPageView.tsx
skeleton_hash: 342b38f29eeee555
entity_hashes:
  func:ProductDetailPage: e3b845e07eaace73
  overview: b2e31a149bb57a71
  style_tokens: 97bcb7e77cb5d07f
generated_at: 2026-05-29T18:42:54Z
---

## Genel Bakış
`ProductDetailPageView.tsx`, bir HVAC ürününün detay sayfasını görüntüleyen ana React bileşenini tanımlar. Sunucu tarafında veya üst bileşen tarafından sağlanan ilk ürün verisini (`initialProduct`) kullanarak, ürün bilgileri, görseller ve etkileşimli aksiyonları içeren eksiksiz bir inceleme sayfası render eder.

## Fonksiyon Grupları
### Ürün Detayı Görüntüleme
Sayfanın tamamını oluşturan merkezi bileşendir. Verilen ürün verisini alarak başlık, özellikler, görseller ve kullanım arayüzünü tek bir tutarlı sayfa yapısında bir araya getirir.
- ProductDetailPage

---



---

## FONKSİYON DETAYLARI

### ProductDetailPage

**Ne yapar**: Ürün detay sayfasını render eden ana React bileşenidir. Verilen ilk ürün verisini (initialProduct) kullanarak, bir HVAC ürününün detaylı görünümünü kullanıcıya sunar.

**Nasıl yapar**: Bileşen, sunucu tarafında veya üst bileşen tarafından sağlanan `initialProduct` prop'unu alır ve bu veriyi kullanarak ürün detay sayfasının tamamını render eder. Bu yapı, Next.js gibi framework'lerde sayfa yükleme performansını artırmak için sıkça kullanılan bir SSR/SSG desenidir.

**Parametreler**:
- `initialProduct` — İlk yüklemede kullanılacak ürün nesnesini temsil eder. Sayfa ilk render edildiğinde bu veri kullanılarak içerik gösterilir, böylece istemci tarafı bekleme süresi azaltılır.

**Dönüş**: `React.FC<ProductDetailPageProps>` tipinde bir React fonksiyonel bileşeni döndürür. Bileşen, `ProductDetailPageProps` arayüzüne uygun olarak yapılandırılmıştır ve `initialProduct` alanını içermelidir.

**İlişkili Tip Tanımı**:
- `ProductDetailPageProps` — Bileşenin kabul ettiği prop'ların tanımlandığı arayüz. En az `initialProduct` alanını içermelidir.

---

## INTERFACES

### ProductDetailPageProps
- `initialProduct?: Product | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ProductDetailPageView.tsx::categoryLookup
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `sc` — `categories` listesinden `product.subcategory_id` değerine eşleşen alt kategori nesnesi, bulunamazsa null
  - `mc` — `categories` listesinden `product.category_id` değerine eşleşen ana kategori nesnesi, bulunamazsa null
- **Dönüş**: `{ mainCategory: mc, subCategory: sc }` object

### [N2_NASIL] AST Pointer: ProductDetailPageView.tsx::toggleSpecSection
- **params**: `(sectionKey: string)` — açılıp kapatılacak teknik özellik grubu anahtarı
- **ic_degiskenler**:
  - `sectionKey` — kontrol edilecek bölümün anahtarı
- **Dönüş**: yok (state güncelleme: `setOpenSpecSections` ile `openSpecSections` array'ini günceller)

### [N3_NASIL] AST Pointer: ProductDetailPageView.tsx::handleRefreshProjects
- **params**: () — parametre yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (`refreshProjects()` fonksiyonunu çağırır)

### [N4_NASIL] AST Pointer: ProductDetailPageView.tsx::fetchProductEffect
- **params**: () — parametre yok (useEffect callback)
- **ic_degiskenler**:
  - `fetchProduct` — içerde tanımlı asenkron fonksiyon, ürün verisini getirir
- **Dönüş**: yok (yan etki: `setProduct`, `setLoading`, `setImages`, `setRelatedProducts` state günceller)

### [N5_NASIL] AST Pointer: ProductDetailPageView.tsx::fetchProduct
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `productData` — `getProductBySlugOrId(currentSlug)` çağrısından dönen ürün verisi
  - `imgs` — `supabase.from('product_images').select(...)` çağrısından dönen görseller dizisi
  - `list` — `imgs` array'inin tipi normalize edilmiş hali (`{ path: string; alt?: string | null }[]`)
  - `related` — `getProductsEnriched({ categoryIds: [productData.subcategory_id], limit: 10 })` çağrısından dönen ilişkili ürünler dizisi
  - `error` — try-catch bloğundan yakalanan hata nesnesi
- **Dönüş**: yok (yan etki: `setProduct`, `setLoading`, `setImages`, `setRelatedProducts` state günceller)

### [N6_NASIL] AST Pointer: ProductDetailPageView.tsx::handleScrollSetup
- **params**: () — parametre yok (useEffect callback)
- **ic_degiskenler**:
  - `handleScroll` — scroll olayını dinleyen iç fonksiyon, `navTriggerRef.current` offset'ine göre `setIsNavSticky` state'ini günceller
- **Dönüş**: cleanup fonksiyonu (`window.removeEventListener` ile scroll listener'ı kaldırır)

### [N7_NASIL] AST Pointer: ProductDetailPageView.tsx::handleScrollSpySetup
- **params**: () — parametre yok (useEffect callback)
- **ic_degiskenler**:
  - `handleScrollSpy` — scroll pozisyonuna göre aktif bölümü tespit eden iç fonksiyon
  - `navEl` — `document.getElementById('pdp-sticky-nav')` ile bulunan sticky navigation elementi
  - `headerOffset` — `navEl` yüksekliği + 120px, bulunamazsa 200
  - `scrollPosition` — `window.scrollY + headerOffset` hesaplanmış toplam scroll pozisyonu
  - `sectionOffsets` — `sectionRefs.current` object'inin entries'inden oluşan `{ id, top, bottom }` objeleri dizisi
- **Dönüş**: cleanup fonksiyonu (`window.removeEventListener` ile scroll listener'ı kaldırır)

### [N8_NASIL] AST Pointer: ProductDetailPageView.tsx::mapSectionRef
- **params**: `[id, ref]` — Object.entries'den gelen tuple (section ID ve DOM referansı)
- **ic_degiskenler**:
  - `id` — section'ın string ID'si
  - `ref` — section'ın DOM element referansı
- **Dönüş**: `{ id, top: ref.offsetTop, bottom: ref.offsetTop + ref.offsetHeight }` object veya null

### [N9_NASIL] AST Pointer: ProductDetailPageView.tsx::scrollToSection
- **params**: `(sectionId: string)` — kaydırılacak section'ın ID'si
- **ic_degiskenler**:
  - `element` — `sectionRefs.current[sectionId]` ile bulunan DOM elementi
  - `navEl` — `document.getElementById('pdp-sticky-nav')` ile bulunan sticky navigation elementi
  - `currentNavHeight` — `navEl` yüksekliği, bulunamazsa 0
  - `extraGap` — sabit 84px ek boşluk
  - `y` — hesaplanmış hedef scroll pozisyonu
- **Dönüş**: yok (`window.scrollTo` ile smooth scroll yapar)

### [N10_NASIL] AST Pointer: ProductDetailPageView.tsx::handleDownloadPdf
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `error` — try-catch bloğundan yakalanan hata nesnesi
- **Dönüş**: yok (yan etki: `setIsGeneratingPdf` state günceller, `generateProductDatasheet` çağırır, toast bildirimleri gösterir)

### [N11_NASIL] AST Pointer: ProductDetailPageView.tsx::handleShare
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `err` — try-catch bloğundan yakalanan hata nesnesi (AbortError kontrolü yapılır)
- **Dönüş**: yok (yan etki: `navigator.share` veya `navigator.clipboard.writeText` çağırır, toast bildirimi gösterir)

### [N12_NASIL] AST Pointer: ProductDetailPageView.tsx::getCategorySlug
- **params**: `(slug?: string | null)` — kontrol edilecek slug string'i, opsiyonel
- **ic_degiskenler**:
  - `s` — `slug` değerinin küçük harfe çevrilmiş hali
- **Dönüş**: string veya null (slug içeriğine göre kategori slug'ı döndürür)

### [N13_NASIL] AST Pointer: ProductDetailPageView.tsx::handleBack
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `stack` — `sessionStorage.getItem('vh_nav_stack')` JSON parse edilmiş navigasyon geçmişi array'i, parse hatası olursa boş array
  - `lastSafeStop` — `stack[stack.length - 1]` ile erişilen son navigasyon noktası
- **Dönüş**: yok (`router.push` ile navigasyon yapar)

### [N14_NASIL] AST Pointer: ProductDetailPageView.tsx::renderJumpButton
- **params**: `s` — section objesi (id ve title özelliklerine sahip)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<button>` — section'a scroll yapan buton)

### [N15_NASIL] AST Pointer: ProductDetailPageView.tsx::renderStickyNavButton
- **params**: `section` — section objesi (id, icon, title özelliklerine sahip)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<button>` — aktif section durumuna göre stil değişen buton)

### [N16_NASIL] AST Pointer: ProductDetailPageView.tsx::renderSection
- **params**: `section` — section objesi (id, icon, title, bgClass özelliklerine sahip)
- **ic_degiskenler**:
  - `IconComponent` — `section.icon` değerinin JSX bileşeni olarak ataması
- **Dönüş**: JSX element (`<section>` — ürün detayının ana section'ı)

### [N17_NASIL] AST Pointer: ProductDetailPageView.tsx::renderQuickDetailItem
- **params**: `(item, i)` — item: `{ label, value }` objesi, i: index numarası
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<div>` — marka, model, kategori gibi hızlı detay satırı)

### [N18_NASIL] AST Pointer: ProductDetailPageView.tsx::renderVariant
- **params**: `variant` — varyant numarası (1, 2, 3 dizisi elemanı)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<div>` — ürün varyantı kartı)

### [N19_NASIL] AST Pointer: ProductDetailPageView.tsx::renderSpecGroup
- **params**: `[groupKey, group]` — Object.entries'den gelen tuple (grup anahtarı ve grup objesi)
- **ic_degiskenler**:
  - `isOpen` — `openSpecSections.includes(groupKey)` ile kontrol edilen grubun açık olup olmadığı
  - `Icon` — `group.icon` değerinin JSX bileşeni
- **Dönüş**: JSX element (`<div>` — teknik özellik grubu, açılır/kapanır paneller)

### [N20_NASIL] AST Pointer: ProductDetailPageView.tsx::renderSpecItem
- **params**: `[key, val]` — Object.entries'den gelen tuple (özellik anahtarı ve değeri)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<div>` — tek bir teknik özellik satırı)

### [N21_NASIL] AST Pointer: ProductDetailPageView.tsx::renderDiagram
- **params**: `type` — diagram tipi string'i ('mounting' veya 'electrical')
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<div>` — teknik çizim kartı)

### [N22_NASIL] AST Pointer: ProductDetailPageView.tsx::render3DView
- **params**: `(item, i)` — item: `{ icon, label, sub }` objesi, i: index numarası
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<div>` — 3D görünüm veya ölçülü çizim kartı)

### [N23_NASIL] AST Pointer: ProductDetailPageView.tsx::renderDocument
- **params**: `(doc, i)` — doc: document tipi string'i, i: index numarası
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<div>` — belge kartı, indirme butonu ile)

### [N24_NASIL] AST Pointer: ProductDetailPageView.tsx::renderPdf
- **params**: `type` — PDF tipi string'i ('productCatalog' veya 'technicalBrochure')
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<div>` — PDF kataloğu veya broşür kartı)

### [N25_NASIL] AST Pointer: ProductDetailPageView.tsx::renderCertificate
- **params**: `(cert, i)` — cert: sertifika tipi string'i, i: index numarası
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<div>` — sertifika kartı, bilgi ile)

---

## NODE ID STANDARD

  file: src\app\_components\ProductDetailPageView.tsx
  function: src\app\_components\ProductDetailPageView.tsx::ProductDetailPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductDetailPage
  export: ProductDetailPageProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`, `tracking-hvac-snug`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue/30`, `bg-gold-accent/10`, `bg-industrial-gray`, `bg-primary-navy`, `bg-red-50`, `bg-secondary-blue`, `bg-slate-100`, `bg-slate-50`, `bg-slate-50/30`, `bg-slate-900`, `bg-success-green`, `bg-success-green/10`, `bg-warning-orange`, `bg-warning-orange/10`, `bg-white`
- **Layout:** `absolute`, `backdrop-blur-2`, `backdrop-blur-md`, `backdrop-blur-xl`, `col-span-full`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `flex-wrap`, `gap-1.5`, `gap-2`, `gap-2.5`, `gap-4`
- **Varyant/Responsive:** `:`, `active:`, `disabled:`, `group-hover:`, `hover:`, `last:`, `lg:`, `md:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `${activeSection`, `${isNavSticky`, `${isOpen`, `${isWishlisted`, `${section.bgClass`, `${typeof`, `0`, `:`, `===`, `>`, `active:scale-95`, `active:scale-98`, `animate-in`, `animate-ping`, `animate-pulse`