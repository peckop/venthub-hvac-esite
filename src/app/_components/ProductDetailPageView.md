---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\_components\ProductDetailPageView.tsx
skeleton_hash: 0d8296b1f4164019
entity_hashes:
  func:ProductDetailPage: e3b845e07eaace73
  overview: aead2e3636ef4e98
  style_tokens: 97bcb7e77cb5d07f
generated_at: 2026-06-19T11:43:36Z
---

## Genel Bakış
`ProductDetailPageView.tsx` modülü, bir HVAC ürününün detay sayfasını oluşturan merkezi ve bağımsız bir React bileşenini tanımlar. Dışarıdan sağlanan başlangıç ürün verisine (`initialProduct`) tamamen bağlı olarak çalışır ve bu veriyi kullanarak ürünün temel bilgileri, görselleri ve özelliklerini içeren eksiksiz bir arayüz oluşturur. Bileşen, veri akışının son halkasıdır ve üst bileşenler veya sunucu tarafı tarafından doğrudan çağrılır.

## Fonksiyon Grupları
### Ürün Detay Sayfası Bileşeni
Modülün tek ve temel sorumluluğu, gelen `initialProduct` verisini işleyerek kullanıcının görebileceği interaktif bir ürün inceleme sayfası oluşturmaktır. Bileşen, tüm sayfa düzenini (başlık, fiyat, özellikler, galeri vb.) kendi içinde yönetir.
- `ProductDetailPage`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React bileşenidir ve fonksiyon gövdesi doğrudan sunulmadığından, yalnızca fonksiyon imzası ve yapısal ipuçlarından türetilen mimari varsayımlar aşağıdadır.

**[Aksiyom 1]**: Eğer `initialProduct` prop'u sağlanmazsa, bileşen geçerli bir ürün detayı sayfası oluşturamaz; React render sürecinde `undefined` değer üzerinde çalışacağı için hata fırlatır veya eksik/boş bir sayfa render eder.

**[Aksiyom 2]**: Eğer `initialProduct` nesnesi beklenen alanları (isim, fiyat, özellikler, görseller) içermiyorsa, bileşen ilgili bölümleri render ederken `undefined` erişim hataları ile karşılaşır veya eksik bölümlerle hatalı bir sayfa oluşturur.

**[Aksiyom 3]**: Eğer bileşen bir React render bağlamı (React application context) dışında çağrılırsa, React bileşen mekanizması çalışmayacağından bileşen doğru sonuç üretmez.

**[Aksiyom 4]**: Eğer `initialProduct` geçerli bir JavaScript nesnesi (`object` türü) yerine `null`, `string`, `number` gibi farklı bir türde sağlanırsa, bileşen prop destructuring (`{ initialProduct }`) sırasında beklenmeyen davranışı gösterir ve sayfa hatalı render edilir.

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

## İTHALATLAR (IMPORTS)
- import: ../../components/HVACIcons::BrandIcon
- import: ../../components/ImageGallery::ImageGallery
- import: ../../components/LeadModal::LeadModal
- import: ../../components/ProductCard::ProductCard
- import: ../../components/Seo::Seo
- import: ../../components/product/ProductSmartInference::ProductSmartInference
- import: ../../components/products/RichTextRenderer::RichTextRenderer
- import: ../../components/products::AddToProjectModal
- import: ../../contexts/CategoryContext::useCategories
- import: ../../hooks/useCartHook::useCart
- import: ../../hooks/useProjectLists::useProjectLists
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/format::formatCurrency
- import: ../../lib/services/product.service::getProductBySlug
- import: ../../lib/services/product.service::getProductsEnriched
- import: ../../lib/supabase/client::supabaseBrowserClient
- import: ../../types/db-rows::type { CategoryMetadata }
- import: ../../types/ui-models::type { Product }
- import: ../../utils/routes::Routes
- import: ../../utils/routes::localizedHref
- import: next/link::Link
- import: next/navigation::useParams
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### ProductDetailPageProps
- `initialProduct?: Product | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::getCategoryContext`
- **params**: 无
- **ic_degiskenler**:
  - `sc` — `categories` dizisi içinde `product.subcategory_id` eşleşen alt kategori nesnesi; bulunamazsa `null`
  - `mc` — `categories` dizisi içinde `product.category_id` eşleşen ana kategori nesnesi; bulunamazsa `null`
- **Dönüş**: `{ mainCategory: mc, subCategory: sc }` — ürünün ait olduğu ana ve alt kategoriyi döndürür; `product` yoksa `{ mainCategory: null, subCategory: null }`

---

### [N2_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::toggleSpecSection`
- **params**: `(sectionKey: string)` — açılıp kapatılacak teknik özellik bölümünün anahtarı
- **ic_degiskenler**:
  - `sectionKey` — hangi spec bölümünün toggle edileceğini belirten string (ör: `"boyutlar"`, `"elektrik"`)
- **Dönüş**: yok (state setter çağrısı ile `openSpecSections` state'ini günceller)
- **Notlar**: İçeride `setOpenSpecSections` çağrılır; state updater `prev` parametresi ile mevcut listede `sectionKey` varsa kaldırır, yoksa ekler

---

### [N3_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::toggleSpecSection/stateUpdater`
- **params**: `prev` — mevcut `openSpecSections` string dizisi
- **ic_degiskenler**:
  - `prev` — bir önceki state değeri; `sectionKey` listede varsa `filter` ile çıkarılır, yoksa spread ile eklenir
  - `sectionKey` — toggle edilen bölüm anahtarı (closure'dan gelir)
- **Dönüş**: yeni state dizisi (`string[]`)

---

### [N4_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::refreshProjects`
- **params**: 无
- **ic_degiskenler**: 无
- **Dönüş**: yok
- **Notlar**: Sadece `refreshProjects()` fonksiyonunu çağırır; proje listesini yenilemek için tetikleyici

---

### [N5_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::useEffect_productFetch`
- **params**: 无
- **ic_degiskenler**:
  - `fetchProduct` — async inner fonksiyon; ürün verisini slug'a göre çeker, görselleri ve ilgili ürünleri yükler
- **Dönüş**: yok (useEffect side-effect)
- **Notlar**: `currentSlug` değişmezliğine bağlı olarak çalışır; bağımlılık dizisi verilmemiş (muhtemelen `[currentSlug]` olmalı)

---

### [N6_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::fetchProduct`
- **params**: 无 (inner async function)
- **ic_degiskenler**:
  - `productData` — `getProductBySlug(supabase, currentSlug)` çağrısıyla dönen ürün nesnesi; `null` olabilir
  - `imgs` — `supabase.from('product_images').select(...)` çağrısından dönen görsel verisi (`{ path, alt, sort_order }[]`)
  - `list` — `imgs` dizisinin `null`安全 cast'i; `{ path: string; alt?: string | null }[]` tipine dönüştürülür
  - `related` — `getProductsEnriched(supabase, { categoryIds, limit: 10 })` ile çekilen ilgili ürünler dizisi
  - `error` — `catch` bloğunda yakalanan hata nesnesi
- **Dönüş**: yok
- **Erişilen outer değişkenler**: `currentSlug`, `product`, `initialProduct`, `setProduct`, `setLoading`, `supabase`, `setImages`, `setRelatedProducts`
- **API çağrıları**: `getProductBySlug`, `supabase.from('product_images')`, `getProductsEnriched`

---

### [N7_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::useEffect_scrollListener`
- **params**: 无
- **ic_degiskenler**:
  - `handleScroll` — inner fonksiyon; `navTriggerRef.current`'in offset-top değerine göre scroll pozisyonunu kontrol eder
- **Dönüş**: cleanup fonksiyonu (`removeEventListener`)
- **Erişilen outer değişkenler**: `navTriggerRef`, `setIsNavSticky`

---

### [N8_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::handleScroll`
- **params**: 无
- **ic_degiskenler**:
  - `triggerTop` — `navTriggerRef.current.offsetTop` referans elemanın sayfadaki dikey pozisyonu
  - `scrollY` — `window.scrollY` mevcut scroll mesafesi piksel cinsinden
- **Dönüş**: yok (state günceller: `setIsNavSticky`)
- **Mantık**: `scrollY > (triggerTop - 80)` ise sticky nav aktif olur

---

### [N9_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::useEffect_scrollSpy`
- **params**: 无
- **ic_degiskenler**:
  - `handleScrollSpy` — inner fonksiyon; hangi bölümün visible olduğunu tespit eder
- **Dönüş**: cleanup fonksiyonu (`removeEventListener`)
- **Erişilen outer değişkenler**: `sectionRefs`, `setActiveSection`

---

### [N10_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::handleScrollSpy`
- **params**: 无
- **ic_degiskenler**:
  - `navEl` — `document.getElementById('pdp-sticky-nav')` ile bulunan sticky navigasyon elemanı
  - `headerOffset` — sticky nav yüksekliği + 120px ek boşluk; nav bulunamazsa varsayılan 200
  - `scrollPosition` — `window.scrollY + headerOffset` hesaplanan pozisyon
  - `sectionOffsets` — `Object.entries(sectionRefs.current)` ile her bölümün `{ id, top, bottom }` bilgisi; `null` olanlar `filter(Boolean)` ile elenir
  - `section` — döngüdeki mevcut bölüm nesnesi; `scrollPosition` bu aralıktaysa `setActiveSection(section.id)` çağrılır
- **Dönüş**: yok (state günceller: `setActiveSection`)

---

### [N11_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::sectionOffsetMapper`
- **params**: `[id, ref]` — tuple, `sectionRefs.current` entry'si
- **ic_degiskenler**:
  - `id` — bölüm ID'si string
  - `ref` — DOM elemanı referansı; `null` ise `null` döner
- **Dönüş**: `{ id: string, top: number, bottom: number } | null` — elemanın `offsetTop` ve `offsetTop + offsetHeight` değerlerini hesaplar

---

### [N12_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::scrollToSection`
- **params**: `(sectionId: string)` — kaydırılacak bölümün ID'si
- **ic_degiskenler**:
  - `element` — `sectionRefs.current[sectionId]` ile erişilen DOM elemanı
  - `navEl` — `document.getElementById('pdp-sticky-nav')` sticky nav elemanı
  - `currentNavHeight` — sticky nav'ın yüksekliği; eleman bulunamazsa 0
  - `extraGap` — sabit değer `84` piksel ek boşluk
  - `y` — `element.getBoundingClientRect().top + window.pageYOffset - currentNavHeight - extraGap` hesaplanan hedef scroll pozisyonu
- **Dönüş**: yok (`window.scrollTo` ile smooth scroll)
- **API çağrıları**: `window.scrollTo({ top: y, behavior: 'smooth' })`

---

### [N13_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::handleDownloadPdf`
- **params**: 无
- **ic_degiskenler**:
  - `generateProductDatasheet` — `await import('../../lib/pdfGenerator')` ile dinamik import edilen PDF üretim fonksiyonu (lazy import)
- **Dönüş**: yok
- **Erişilen outer değişkenler**: `product`, `isGeneratingPdf`, `setIsGeneratingPdf`, `translateSpecKey`, `lang`, `t`
- **API çağrıları**: `generateProductDatasheet(product, product.image_url, translateSpecKey, lang)`, `toast.success()`, `toast.error()`
- **Yan etkiler**: PDF üretimi başlatır, kullanıcıya toast bildirimi gösterir

---

### [N14_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::handleShare`
- **params**: 无
- **ic_degiskenler**: 无
- **Dönüş**: yok
- **Erişilen outer değişkenler**: `product`, `t`
- **API çağrıları**: `navigator.share({ title, text, url })` — Web Share API; desteklenmiyorsa `navigator.clipboard.writeText(window.location.href)` ile linki panoya kopyalar
- **Yan etkiler**: Paylaşım veya clipboard kopyalama; toast bildirimi

---

### [N15_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::getHvacType`
- **params**: `(slug?: string | null)` — ürün slug'u
- **ic_degiskenler**:
  - `s` — `slug`'ın `toLowerCase()` ile küçük harfe dönüştürülmüş hali
- **Dönüş**: `string | null` — slug içeriğine göre `'hava-perdesi'`, `'jet-fan'`, `'hrv'` veya `null`

---

### [N16_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::handleBackNavigation`
- **params**: 无
- **ic_degiskenler**:
  - `stack` — `sessionStorage.getItem('vh_nav_stack')` okunan JSON navigation geçmişi dizisi; parse hatasında boş dizi
  - `lastSafeStop` — `stack[stack.length - 1]` navigasyon geçmişindeki son güvenli durak URL'i
- **Dönüş**: yok
- **Erişilen outer değişkenler**: `router`, `localizedHref`, `subCategory`, `mainCategory`, `lang`, `Routes`
- **Yan etkiler**: `sessionStorage.setItem('vh_is_pop', 'true')` yazarak popup modunu işaretler; `router.push()` ile navigasyon yapar

---

### [N17_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderSectionJumpButtons`
- **params**: `(s)` — section nesnesi; `{ id, title }` beklenir
- **ic_degiskenler**: 无
- **Dönüş**: `<button>` JSX elementi — tıklama ile `scrollToSection(s.id)` çağrılır
- **Erişilen outer değişkenler**: `scrollToSection`, `t`

---

### [N18_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderStickyNavButtons`
- **params**: `(section)` — section nesnesi; `{ id, title, icon }` beklenir
- **ic_degiskenler**: 无
- **Dönüş**: `<button>` JSX elementi — `activeSection === section.id` koşuluna göre aktif/pasif stil uygulanır
- **Erişilen outer değişkenler**: `scrollToSection`, `activeSection`, `section.icon`

---

### [N19_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderMainSections`
- **params**: `(section)` — section nesnesi; `{ id, bgClass, title, icon }` beklenir
- **ic_degiskenler**:
  - `IconComponent` — `section.icon` referansının yerel adlandırması
- **Dönüş**: `<section>` JSX elementi — section.id'e göre farklı içerik blokları render eder (`genel`, `models`, `specs`, `diagrams`, `documents`, `pdf`, `certificates`)
- **Erişilen outer değişkenler**: `sectionRefs`, `openSpecSections`, `toggleSpecSection`, `product`, `mainCategory`, `subCategory`, `lang`, `t`, `formatCurrency`, `formatSpecValue`, `translateSpecKey`, `groupTechnicalSpecs`, `handleDownloadPdf`, `RichTextRenderer`, `BrandIcon`, `SPEC_SORT_ORDER`, `Routes`
- **Yan etkiler**: `ref={(el) => { sectionRefs.current[section.id] = el }}` ile section DOM referanslarını kaydeder

---

### [N20_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderQuickDetailItem`
- **params**: `(item, i)` — `{ label: string, value: string | number }` ve index
- **ic_degiskenler**: 无
- **Dönüş**: `<div>` JSX elementi — label-value çiftini border ile render eder

---

### [N21_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderVariantCard`
- **params**: `(variant)` — number, 1'den 3'e kadar varyant indeksi
- **ic_degiskenler**: 无
- **Dönüş**: `<div>` JSX elementi — ürün varyant kartı (görsel, SKU, fiyat bilgisi)
- **Erişilen outer değişkenler**: `product`, `formatCurrency`, `lang`, `t`, `BrandIcon`

---

### [N22_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderSpecGroup`
- **params**: `([groupKey, group])` — `Object.entries()` destructuring'inden gelen `[string, SpecGroup]` tuple
- **ic_degiskenler**:
  - `groupKey` — spec grubu anahtarı (ör: `"boyutlar"`, `"performans"`)
  - `group` — spec grubu nesnesi; `{ icon: React.ComponentType, specs: Record<string, any> }` yapısında
  - `isOpen` — `openSpecSections.includes(groupKey)` grubun açık olup olmadığını belirler
  - `Icon` — `group.icon` bileşeni
- **Dönüş**: `<div>` JSX elementi — accordion yapısında spec grubu; openSpecSections'te varsa içerik görünür
- **Erişilen outer değişkenler**: `openSpecSections`, `toggleSpecSection`, `t`, `SPEC_SORT_ORDER`, `translateSpecKey`, `formatSpecValue`

---

### [N23_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderSpecItem`
- **params**: `([key, val])` — spec anahtar-değer tuple'ı
- **ic_degiskenler**: 无
- **Dönüş**: `<div>` JSX elementi — tek bir spec satırı (anahtar ve değeri yan yana)
- **Erişilen outer değişkenler**: `t`, `translateSpecKey`, `formatSpecValue`

---

### [N24_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderDiagramPlaceholder`
- **params**: `(type)` — `'mounting'` veya `'electrical'` string
- **ic_degiskenler**: 无
- **Dönüş**: `<div>` JSX elementi — teknik çizim placeholder kartı (indirme ikonu, hover efekti)
- **Erişilen outer değişkenler**: `t`

---

### [N25_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::render3DViewItem`
- **params**: `(item, i)` — `{ icon: React.ComponentType, label: string, sub: string }` ve index
- **ic_degiskenler**: 无
- **Dönüş**: `<div>` JSX elementi — 3D görünüm/CAD çizim kartı
- **Erişilen outer değişkenler**: `t`

---

### [N26_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderDocumentCard`
- **params**: `(doc, i)` — document type string ve index
- **ic_degiskenler**: 无
- **Dönüş**: `<div>` JSX elementi — doküman indirme kartı (ikon, başlık, indirme butonu)
- **Erişilen outer değişkenler**: `t`

---

### [N27_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderPdfCard`
- **params**: `(type)` — `'productCatalog'` veya `'technicalBrochure'` string
- **ic_degiskenler**: 无
- **Dönüş**: `<div>` JSX elementi — PDF katalog/broşür kartı; `type === 'technicalBrochure'` ise `handleDownloadPdf` tetiklenir
- **Erişilen outer değişkenler**: `t`, `handleDownloadPdf`

---

### [N28_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::renderCertificateCard`
- **params**: `(cert, i)` — sertifika tipi string ve index
- **ic_degiskenler**: 无
- **Dönüş**: `<div>` JSX elementi — sertifika kartı (ikon, sertifika adı, numara ve standart bilgisi)
- **Erişilen outer değişkenler**: `t`

---

### [N29_NASIL] AST Pointer: `_components/ProductDetailPageView.tsx::ProductDetailPage`
- **params**: `(initialProduct)` — initial veri olarak gelen ürün nesnesi
- **ic_degiskenler**:
  - `product` — `useState` ile yönetilen mevcut ürün verisi
  - `images` — `useState` ile yönetilen ürün görselleri dizisi
  - `relatedProducts` — `useState` ile yönetilen ilgili ürünler dizisi
  - `loading` — `useState` ile yönetilen yükleme durumu boolean
  - `openSpecSections` — `useState` ile yönetilen açık spec bölümleri dizisi
  - `activeSection` — `useState` ile yönetilen aktif bölüm ID'si (scroll spy)
  - `isNavSticky` — `useState` ile yönetilen sticky nav durumu boolean
  - `isGeneratingPdf` — `useState` ile yönetilen PDF üretim durumu boolean
  - `currentSlug` — `useParams()` ile URL'den alınan ürün slug'u
  - `navTriggerRef` — `useRef` ile yönetilen sticky nav tetikleme elemanı referansı
  - `sectionRefs` — `useRef` ile yönetilen bölüm DOM referansları sözlüğü
  - `categories` — `useMemo` ile hesaplanan kategori listesi
  - `mainCategory` — `getCategoryContext()` ile elde edilen ana kategori nesnesi
  - `subCategory` — `getCategoryContext()` ile elde edilen alt kategori nesnesi
  - `t` — `useTranslation()` internationalization fonksiyonu
  - `lang` — mevcut dil kodu
  - `supabase` — Supabase istemcisi
  - `router` — `useRouter()` Next.js navigasyon nesnesi
- **Dönüş**: JSX — `ProductDetailPageProps` tipinde React fonksiyon bileşeni
- **Dış bağımlılıklar**: `Link`, `useParams`, `useRouter`, `useState`, `useEffect`, `useMemo`, `useRef`, `toast`, `BrandIcon`, `ImageGallery`, `LeadModal`, `ProductSmartInference`, `ProductCard`, `getProductBySlug`, `getProductsEnriched`, `groupTechnicalSpecs`, `formatCurrency`, `formatSpecValue`, `translateSpecKey`, `localizedHref`, `Routes`, `RichTextRenderer`, `SPEC_SORT_ORDER`, `CategoryMetadata`

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