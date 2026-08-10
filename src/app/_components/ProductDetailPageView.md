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
generated_at: 2026-06-19T20:46:14Z
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