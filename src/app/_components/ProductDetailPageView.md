---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\_components\ProductDetailPageView.tsx
skeleton_hash: dd30c877f434d69a
entity_hashes:
  func:ProductDetailPage: e3b845e07eaace73
  overview: 13dd8be9bcbca1c9
  style_tokens: 97bcb7e77cb5d07f
generated_at: 2026-06-06T21:54:37Z
---

## Genel Bakış
`ProductDetailPageView.tsx`, bir HVAC ürününün detay sayfasını render eden ana React bileşenini barındırır. Sunucu tarafında veya üst bileşen tarafından sağlanan ilk ürün verisini alarak, ürün bilgileri, görseller ve etkileşimli unsurları içeren eksiksiz bir inceleme sayfası oluşturur.

## Fonksiyon Grupları
### Ürün Detayı Sayfası
Sayfanın tamamını oluşturan merkezi bileşendir. Verilen ürün verisini kullanarak başlık, özellikler, görseller ve kullanım arayüzünü tek bir tutarlı yapıda sunar.
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

### [N1_NASIL] AST Pointer: ProductDetailPageView.tsx::() => { if (!product) ... }
- **params**: ()
- **ic_degiskenler**: 
  - `sc` — `categories` dizisi içinde `product.subcategory_id` eşleşen kategoriyi bulur veya null döner
  - `mc` — `categories` dizisi içinde `product.category_id` eşleşen kategoriyi bulur veya null döner
- **Dönüş**: `{ mainCategory: mc, subCategory: sc }` objesi veya `{ mainCategory: null, subCategory: null }`

### [N2_NASIL] AST Pointer: ProductDetailPageView.tsx::(sectionKey: string) => { ... }
- **params**: `(sectionKey: string)` — toggle edilecek bölüm anahtarı
- **ic_degiskenler**:
  - `setOpenSpecSections` — açık teknik özellik bölümlerini güncelleyen state setter
  - `prev` — önceki açık bölüm listesi (setOpenSpecSections callback parametresi)
- **Dönüş**: yok (state güncelleme)

### [N3_NASIL] AST Pointer: ProductDetailPageView.tsx::prev => { ... }
- **params**: `prev` — önceki açık bölüm listesi
- **ic_degiskenler**: yok
- **Dönüş**: Güncellenmiş açık bölüm listesi (sectionKey varsa çıkar, yoksa ekler)

### [N4_NASIL] AST Pointer: ProductDetailPageView.tsx::() => { refreshProjects() }
- **params**: ()
- **ic_degiskenler**:
  - `refreshProjects` — projeleri yenileyen fonksiyon
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: ProductDetailPageView.tsx::() => { async function fetchProduct() { ... } }
- **params**: ()
- **ic_degiskenler**:
  - `currentSlug` — mevcut URL slug'ı
  - `product` — mevcut ürün state'i
  - `initialProduct` — başlangıçta verilen ürün verisi
  - `setProduct` — ürün state'ini güncelleyen setter
  - `setLoading` — yükleme durumunu güncelleyen setter
  - `productData` — getProductBySlug ile çekilen ürün verisi
  - `imgs` — supabase'den çekilen ürün resimleri verisi
  - `list` — filtrelenmiş resim listesi
  - `setImages` — resimler state'ini güncelleyen setter
  - `related` — getProductsEnriched ile çekilen ilgili ürünler
  - `setRelatedProducts` — ilgili ürünler state'ini güncelleyen setter
  - `error` — yakalanan hata nesnesi
- **Dönüş**: yok (side-effect: product, images, relatedProducts state'lerini günceller)

### [N6_NASIL] AST Pointer: ProductDetailPageView.tsx::async function fetchProduct() { ... }
- **params**: ()
- **ic_degiskenler**: (N5 ile aynı değişkenler)
- **Dönüş**: yok (asenkron yan etkiler: product, images, relatedProducts state'lerini günceller)

### [N7_NASIL] AST Pointer: ProductDetailPageView.tsx::() => { const handleScroll = () => { ... } }
- **params**: ()
- **ic_degiskenler**:
  - `handleScroll` — scroll olayını işleyen iç fonksiyon
  - `navTriggerRef` — navigasyon tetikleyicisi referansı
  - `setIsNavSticky` — yapışkan navigasyon durumunu güncelleyen setter
- **Dönüş**: Temizleme fonksiyonu (scroll event listener'ı kaldırır)

### [N8_NASIL] AST Pointer: ProductDetailPageView.tsx::() => { if (navTriggerRef.current) { ... } }
- **params**: ()
- **ic_degiskenler**:
  - `navTriggerRef` — navigasyon tetikleyicisi referansı
  - `triggerTop` — tetikleyicinin dikey pozisyonu
  - `scrollY` — mevcut scroll pozisyonu
  - `setIsNavSticky` — yapışkan navigasyon durumunu güncelleyen setter
- **Dönüş**: yok (state güncelleme)

### [N9_NASIL] AST Pointer: ProductDetailPageView.tsx::() => { const handleScrollSpy = () => { ... } }
- **params**: ()
- **ic_degiskenler**:
  - `handleScrollSpy` — scroll izleme fonksiyonu
  - `navEl` — pdp-sticky-nav DOM elementi
  - `headerOffset` — hesaplama için ofset değeri
  - `scrollPosition` — hesaplanmış scroll pozisyonu
  - `sectionOffsets` — bölüm offset bilgileri dizisi
  - `setActiveSection` — aktif bölümü güncelleyen setter
- **Dönüş**: Temizleme fonksiyonu (scroll event listener'ı kaldırır)

### [N10_NASIL] AST Pointer: ProductDetailPageView.tsx::() => { const navEl = ... }
- **params**: ()
- **ic_degiskenler**: (N9 ile aynı değişkenler, handleScrollSpy içindeki mantık)
- **Dönüş**: yok (aktif bölümü günceller)

### [N11_NASIL] AST Pointer: ProductDetailPageView.tsx::([id, ref]) => { ... }
- **params**: `[id, ref]` — bölüm ID ve DOM referansı çifti
- **ic_degiskenler**: yok
- **Dönüş**: `{ id, top: ref.offsetTop, bottom: ref.offsetTop + ref.offsetHeight }` veya null

### [N12_NASIL] AST Pointer: ProductDetailPageView.tsx::(sectionId: string) => { ... }
- **params**: `(sectionId: string)` — kaydırılacak bölüm ID'si
- **ic_degiskenler**:
  - `element` — sectionRefs.current[sectionId] DOM elementi
  - `navEl` — pdp-sticky-nav DOM elementi
  - `currentNavHeight` — navigasyon yüksekliği
  - `extraGap` — ek boşluk miktarı (84px)
  - `y` — hesaplanmış hedef Y pozisyonu
- **Dönüş**: yok (pencereyi smooth scroll ile kaydırır)

### [N13_NASIL] AST Pointer: ProductDetailPageView.tsx::async () => { ... }
- **params**: ()
- **ic_degiskenler**:
  - `product` — mevcut ürün verisi
  - `isGeneratingPdf` — PDF üretim durumu
  - `setIsGeneratingPdf` — PDF üretim durumunu güncelleyen setter
  - `generateProductDatasheet` — dinamik import edilen PDF üretici fonksiyon
  - `translateSpecKey` — teknik özellik çevirisi yapan fonksiyon
  - `lang` — mevcut dil
  - `error` — yakalanan hata nesnesi
- **Dönüş**: yok (yan etki: PDF üretimi başlatır, toast mesajı gösterir)

### [N14_NASIL] AST Pointer: ProductDetailPageView.tsx::async () => { ... }
- **params**: ()
- **ic_degiskenler**:
  - `product` — mevcut ürün verisi (navigator.share için)
  - `window.location.href` — mevcut sayfa URL'i
  - `err` — yakalanan hata nesnesi
- **Dönüş**: yok (yan etki: paylaşım API'si veya clipboard kopyalama, toast mesajı)

### [N15_NASIL] AST Pointer: ProductDetailPageView.tsx::(slug?: string | null): string | null => { ... }
- **params**: `(slug?: string | null)` — kontrol edilecek slug
- **ic_degiskenler**:
  - `s` — slug'ın küçük harfli hali
- **Dönüş**: `string | null` — slug'a karşılık gelen model tipi veya null

### [N16_NASIL] AST Pointer: ProductDetailPageView.tsx::() => { ... }
- **params**: ()
- **ic_degiskenler**:
  - `stack` — sessionStorage'dan okunan navigasyon yığıtı
  - `lastSafeStop` — yığıttaki son güvenli durak
  - `subCategory` — alt kategori verisi
  - `mainCategory` — ana kategori verisi
  - `router` — Next.js router
- **Dönüş**: yok (sayfa yönlendirme)

### [N17_NASIL] AST Pointer: ProductDetailPageView.tsx::(s) => { ... }
- **params**: `s` — bölüm nesnesi (id ve title içerir)
- **ic_degiskenler**: yok
- **Dönüş**: JSX button elementi (bölüm başlığını gösterir, tıklanınca scrollToSection çağırır)

### [N18_NASIL] AST Pointer: ProductDetailPageView.tsx::(section) => { ... }
- **params**: `section` — bölüm nesnesi (id, icon, title, bgClass içerir)
- **ic_degiskenler**:
  - `IconComponent` — section.icon bileşeni
  - `activeSection` — aktif bölüm ID'si
  - `sectionRefs` — bölüm referansları objesi
- **Dönüş**: JSX section elementi (tam bölüm içeriğini render eder)

### [N19_NASIL] AST Pointer: ProductDetailPageView.tsx::(item, i) => { ... }
- **params**: `item` — { label, value } çifti, `i` — indeks
- **ic_degiskenler**: yok
- **Dönüş**: JSX div elementi (hızlı detay satırı)

### [N20_NASIL] AST Pointer: ProductDetailPageView.tsx::(variant) => { ... }
- **params**: `variant` — varyant numarası (1, 2 veya 3)
- **ic_degiskenler**:
  - `product` — mevcut ürün verisi
- **Dönüş**: JSX div elementi (ürün varyantı kartı)

### [N21_NASIL] AST Pointer: ProductDetailPageView.tsx::([groupKey, group]) => { ... }
- **params**: `[groupKey, group]` — teknik özellik grubu anahtarı ve grubun kendisi
- **ic_degiskenler**:
  - `openSpecSections` — açık teknik özellik bölümleri listesi
  - `groupKey` — grubun anahtarı
  - `group` — grubun kendisi (icon ve specs içerir)
  - `isOpen` — bu grubun açık olup olmadığı
  - `Icon` — grubun ikonu
- **Dönüş**: JSX div elementi (katlanabilir teknik özellik grubu)

### [N22_NASIL] AST Pointer: ProductDetailPageView.tsx::([key, val]) => { ... }
- **params**: `[key, val]` — teknik özellik anahtarı ve değeri
- **ic_degiskenler**: yok
- **Dönüş**: JSX div elementi (tek bir teknik özellik satırı)

### [N23_NASIL] AST Pointer: ProductDetailPageView.tsx::(type) => { ... }
- **params**: `type` — diyagram tipi ('mounting' veya 'electrical')
- **ic_degiskenler**: yok
- **Dönüş**: JSX div elementi (teknik diyagram kartı)

### [N24_NASIL] AST Pointer: ProductDetailPageView.tsx::(item, i) => { ... }
- **params**: `item` — { icon, label, sub } nesnesi, `i` — indeks
- **ic_degiskenler**: yok
- **Dönüş**: JSX div elementi (3D görünüm kartı)

### [N25_NASIL] AST Pointer: ProductDetailPageView.tsx::(doc, i) => { ... }
- **params**: `doc` — doküman tipi stringi, `i` — indeks
- **ic_degiskenler**: yok
- **Dönüş**: JSX div elementi (doküman kartı)

### [N26_NASIL] AST Pointer: ProductDetailPageView.tsx::(type) => { ... }
- **params**: `type` — PDF tipi ('productCatalog' veya 'technicalBrochure')
- **ic_degiskenler**: yok
- **Dönüş**: JSX div elementi (PDF kartı, technicalBrochure için handleDownloadPdf bağlanır)

### [N27_NASIL] AST Pointer: ProductDetailPageView.tsx::(cert, i) => { ... }
- **params**: `cert` — sertifika tipi stringi, `i` — indeks
- **ic_degiskenler**: yok
- **Dönüş**: JSX div elementi (sertifika kartı)

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