---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx
skeleton_hash: 56adefc5e6c04a09
entity_hashes:
  func:BrandDetailPage: 658e62bc6ce56cad
  overview: 7d5e530ae391a667
  style_tokens: 4208267ad108784f
generated_at: 2026-06-15T17:04:46Z
---

## Genel Bakış
BrandDetailPage modülü, VentHub HVAC platformunda belirli bir markanın detay sayfasını sunan React bileşenidir. Prop olarak aldığı `initialBrandSlug` değerini kullanarak marka bilgilerini `BRAND_DETAILS` sabit objesinden çeker ve kullanıcıya sunar. Bileşen, sunucu tarafı render (SSR) uyumlu olacak şekilde tasarlanmıştır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Marka detay sayfasının ana React görünüm bileşenini içerir. Verilen marka slug'ına göre ilgili markanın bilgilerini render eder.
- BrandDetailPage

## Dış Bağımlılıklar
- `BRAND_DETAILS` sabit objesi (marka verilerinin tanımlı olduğu yerel sabit)
- React framework (SSR ve bileşen yapısı için)
- Sayfa yönlendirme/bileşen sistemi (Next.js veya benzeri bir SSR çerçeve)

## Mimari Notlar
Bu modül, marka bazlı sayfaların temel yapı taşlarından biridir. Dinamik bir API çağrısı yerine statik/sabit bir veri objesine bağımlı olması, performans ve SEO açısından avantaj sağlar ancak marka verilerinin güncellenmesinde dış bağımlılık oluşturur.

---

## AXIOMS – Mimari Varsayımlar

Bu bileşen, bir markanın detay sayfasını initialBrandSlug prop'u ile render eder ve module-level BRAND_DETAILS sabitinden marka bilgisini çözümler.

**[Aksiyom 1]:** Eğer `initialBrandSlug` prop'u yoksa veya undefined传则, bileşen hangi markanın detayının gösterileceğini bilemez ve doğru marka içeriği render edilemez.

**[Aksiyom 2]:** Eğer `BRAND_DETAILS` modül sabiti yoksa veya boş/undefined ise, verilen `initialBrandSlug` değerine karşılık gelen marka bilgisi bulunamaz ve bileşen içerik üretemez.

**[Aksiyom 3]:** Eğer `initialBrandSlug` değeri `BRAND_DETAILS` objesindeki anahtarlardan biriyle eşleşmiyorsa, bileşen geçersiz bir marka ile karşılaşır ve uygun bir durum (404 veya boş sayfa) sergilemelidir.

**[Aksiyom 4]:** Eğer `BRAND_DETAILS` objesi `{}` (boş obje) ise, hiçbir marka slug'ı için içerik bulunamaz ve bileşen tüm markalar için aynı boş durumu gösterir.

---

## FONKSİYON DETAYLARI

### BrandDetailPage

**Ne yapar**: Bu bileşen, belirli bir markanın detay sayfasını render eden üst düzey React görünüm bileşenidir. Verilen marka slug'ı kullanarak marka bilgilerini göstermek üzere tasarlanmıştır.

**Nasıl yapar**: `initialBrandSlug` prop'unu alarak başlangıç marka tanımlayıcısını işler. Bu değer sunucu tarafında render (SSR) veya başlangıç verisi olarak kullanılmak üzere bileşene iletilir. Bileşen, bu slug değerini kullanarak ilgili markanın detaylarını yükler ve sayfada görüntüler.

**Parametreler**:
- `initialBrandSlug`: `string` — Sayfa yüklendiğinde görüntülenecek markanın başlangıç slug değerini (URL dostu tanımlayıcı) taşır. Bu değer genellikle sunucu tarafı yönlendirmelerden veya URL parametrelerinden gelir.

**Dönüş**: `React.FC<BrandDetailPageProps>` — BrandDetailPageProps arabirimini implemente eden bir React fonksiyonel bileşeni döndürür. Bileşen, marka detay sayfasının tüm içeriğini render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../components/HVACIcons::BrandIcon
- import: ../components/Seo::Seo
- import: ../components/navigation/Breadcrumb::Breadcrumb
- import: ../data/brands::HVAC_BRANDS
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../hooks/useScrollAnimation::scrollAnimationClasses
- import: ../hooks/useScrollAnimation::useScrollAnimation
- import: ../i18n/I18nProvider::useI18n
- import: ../lib/services/product.service::getProductsEnriched
- import: ../types/ui-models::type { Product }
- import: @/components/ui/VentImage::VentImage
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::ArrowRight
- import: lucide-react::ExternalLink
- import: lucide-react::Package
- import: next/image::Image
- import: next/link::Link
- import: next/navigation::useParams
- import: react::React
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### BrandDetailPageProps
- `initialBrandSlug?: string`

---

## SABİTLER
- **BRAND_DETAILS** (object) — `{
  vortice: {
    founded: 1954,
    headquarters: 'Tribiano, İtalya',
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/BrandDetailPage.tsx`::BrandDetailPage
- **params**: `{ initialBrandSlug }` — URL'den veya üst bileşenden gelen marka slug'ı (opsiyonel)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, sayfa genelinde anahtar tabanlı metin çevirileri için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen dil-önekli rota proxy nesnesi; `Routes.home()`, `Routes.brands()`, `Routes.contact()`, `Routes.products()`, `Routes.product()` çağrıları yapılır
  - `params` — `useParams()` hook'undan dönen URL parametreleri nesnesi
  - `slug` — `(initialBrandSlug || params?.slug) as string` ifadesinden türeyen, normalize edilmiş marka slug'ı; `brand` aramasında ve `detail` erişiminde kullanılır
  - `heroIconRef` — `useScrollAnimation<HTMLDivElement>()` hook'undan dönen ref, hero ikon bölümü için scroll tetikleme referansı
  - `heroIconVisible` — `useScrollAnimation()` hook'undan dönen boolean, hero ikonunun viewport'a girip girmediğini belirtir
  - `heroTitleRef` — `useScrollAnimation<HTMLHeadingElement>()` hook'undan dönen ref, hero başlık için scroll referansı
  - `heroTitleVisible` — `useScrollAnimation()` hook'undan dönen boolean, hero başlığının görünürlük durumu
  - `heroMetaRef` — `useScrollAnimation<HTMLDivElement>()` hook'undan dönen ref, hero meta bölümü için scroll referansı
  - `heroMetaVisible` — `useScrollAnimation()` hook'undan dönen boolean, hero meta bölümünün görünürlük durumu
  - `brand` — `HVAC_BRANDS.find()` ile `slug` eşleşmesiyle bulunan marka nesnesi (特殊: `slug === 'nicotra'` ise `nicotra-gebhardt` eşlemesi yapılır); tüm JSX render'ında `brand.name`, `brand.country`, `brand.founded`, `brand.specialty`, `brand.description`, `brand.headquarters`, `brand.website` alanları kullanılır
  - `detail` — `BRAND_DETAILS[brand.slug]` ile erişilen marka detay nesnesi; `detail.story` ve `detail.stats` alanları JSX'te kullanılır
  - `products` — `useState<Product[]>([])` ile tanımlı state; `getProductsEnriched` API çağrısından dönen ürün listesi tutulur
  - `loading` — `useState(true)` ile tanımlı state; ürün yükleme durumunu tutar, JSX'te skeleton/loading gösterimi için kontrol edilir
  - `breadcrumbItems` — Breadcrumb bileşenine geçirilen öğeler dizisi; `Routes.home()`, `Routes.brands()` href'leri ve `brand?.name` label'ı içerir
- **Dönüş**: JSX element (React.ReactNode) — Marka bulunamazsa "not found" fallback JSX, bulunursa tam sayfa JSX'i (Seo, Breadcrumb, Hero, Identity/Vision, Products Grid bölümleri dahil)

### [N2_NASIL] AST Pointer: `src/views/BrandDetailPage.tsx`::useEffect callback (loadProducts trigger)
- **params**: yok
- **ic_degiskenler**:
  - `loadProducts` — inner async fonksiyon; `brand` mevcutsa `getProductsEnriched` API'sini çağırıp `products` state'ini günceller
- **Dönüş**: yok (yan etki: useEffect içinde `loadProducts()` çağrılır; `brand` dependency değiştiğinde tetiklenir)

### [N3_NASIL] AST Pointer: `src/views/BrandDetailPage.tsx`::loadProducts (async inner)
- **params**: yok
- **ic_degiskenler**:
  - `data` — `getProductsEnriched(supabaseBrowserClient, { brand: brand.name, limit: 8 })` async çağrısından dönen zenginleştirilmiş ürün verisi; `setProducts(data)` ile products state'ine yazılır
  - `e` — catch bloğu yakaladığı hata nesnesi; `console.error('Error loading brand products:', e)` ile loglanır
- **Dönüş**: yok (yan etkiler: `setLoading(true)` → API çağrısı → `setProducts(data)` → `setLoading(false)`)
- **not**: `brand` objesi closure ile erişilir (`brand.name`), `supabaseBrowserClient` import'tan gelen Supabase istemcisi, `setLoading` ve `setProducts` React state setter'ları closure ile erişilir

### [N4_NASIL] AST Pointer: `src/views/BrandDetailPage.tsx`::stats map callback `(stat, i)`
- **params**: `stat, i`
  - `stat` — `detail?.stats` dizisindeki tek bir istatistik nesnesi; `stat.label` (üst bilgi etiketi) ve `stat.value` (değer) alanları JSX'te render edilir
  - `i` — dizi indeksi; React `key={i}` prop'u olarak kullanılır
- **ic_degiskenler**: yok
- **Dönüş**: JSX element — `<div>` içinde `stat.label` ve `stat.value` gösterimi

### [N5_NASIL] AST Pointer: `src/views/BrandDetailPage.tsx`::products map callback `(product)`
- **params**: `product` — `products` dizisindeki tek bir `Product` nesnesi; `product.id` (React key), `product.slug!` (Routes.product href), `product.name` (aria-label ve h3), `product.image_url` (VentImage src), `product.sku` (alt bilgi metni) alanları JSX'te kullanılır
- **ic_degiskenler**: yok
- **Dönüş**: JSX element — `<Link>` içinde `VentImage`, ürün adı ve SKU gösterimi; hover animasyonları ile ürün kartı

---

## NODE ID STANDARD

  file: src\views\BrandDetailPage.tsx
  function: src\views\BrandDetailPage.tsx::BrandDetailPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: BrandDetailPage
  export: BrandDetailPageProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-3xl`, `rounded-hvac-xl`, `shadow-glow-sm`, `tracking-hvac-loose`, `tracking-hvac-relaxed`, `tracking-hvac-wide`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-brand-detail-radial`, `bg-cyan-500`, `bg-cyan-500/10`, `bg-gradient-to-b`, `bg-slate-200`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `border-white`, `border-white/10`, `border-y`
- **Layout:** `absolute`, `block`, `flex`, `flex-col`, `flex-wrap`, `from-transparent`, `gap-12`, `gap-2`, `gap-24`, `gap-3`, `gap-8`, `grid`, `grid-cols-1`, `grid-cols-2`, `h-1.5`
- **Varyant/Responsive:** `active:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `active:scale-95`, `animate-pulse`, `aspect-square`, `blur-3xl`, `border`, `brightness-50`, `duration-700`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `grayscale`, `group`, `group-hover:grayscale-0`