---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx
skeleton_hash: 56adefc5e6c04a09
entity_hashes:
  func:BrandDetailPage: 658e62bc6ce56cad
  overview: c3e73e1bcf4512a9
  style_tokens: 4208267ad108784f
generated_at: 2026-06-14T22:21:39Z
---

## Genel Bakış
BrandDetailPage modülü, VentHub HVAC platformunda belirli bir markanın detay sayfasını sunan React bileşenidir. Prop olarak aldığı initialBrandSlug değerini kullanarak ilgili markanın ürünleri, özellikleri ve içerikleri gibi bilgileri kullanıcıya sunar. Sayfa, dinamik olarak marka verisine göre oluşturulur ve marka bazlı bir tüketici deneyimi sağlar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Bu grup, marka detay sayfasının ana bileşenini içerir. Kullanıcıya belirli bir markanın detaylarını göstermek için gerekli olan içeriği render eder.
- BrandDetailPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayımlar, bileşenin prop bağımlılığı ve sabit veri yapısı üzerine kuruludur.

**[Aksiyom 1]:** Eğer `initialBrandSlug` prop'u sağlanmazsa, bileşen geçerli bir marka sayfası oluşturamaz.

**[Aksiyom 2]:** Eğer `BRAND_DETAILS` sabit objesi boş veya tanımsız ise, sayfa içerikleri kullanıcıya gösterilemez.

**[Aksiyom 3]:** Eğer `initialBrandSlug` değeri `BRAND_DETAILS` objesindeki hiçbir marka ile eşleşmiyorsa, bileşen geçerli bir marka detayı sunamaz.

**[Aksiyom 4]:** Eğer `initialBrandSlug` boş string veya geçersiz bir değer olarak gelirse, bileşen anlamlı bir marka adı display edemez.

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
- import: ../hooks/useScrollAnimation::scrollAnimationClasses
- import: ../hooks/useScrollAnimation::useScrollAnimation
- import: ../i18n/I18nProvider::useI18n
- import: ../lib/services/product.service::getProductsEnriched
- import: ../types/ui-models::type { Product }
- import: ../utils/routes::Routes
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

### [N1_NASIL] AST Pointer: BrandDetailPage.tsx::BrandDetailPage
- **params**: `(initialBrandSlug)` — URL'den gelen veya üst bileşenden verilen marka slug'ı
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, sayfa içindeki tüm metinlerin lokalizasyonunda kullanılır
  - `params` — `useParams()` hook'undan dönen URL parametreleri nesnesi
  - `slug` — `initialBrandSlug` veya `params?.slug` değerinden elde edilen normalized marka tanımlayıcı string
  - `heroIconRef` — `useScrollAnimation<HTMLDivElement>` ile oluşturulan scroll tetikleme reference'ı, hero ikonunun DOM referansını tutar
  - `heroIconVisible` — hero ikonunun scroll animasyonu görünürlük durumu (boolean), scroll animasyon sınıflarını tetikler
  - `heroTitleRef` — `useScrollAnimation<HTMLHeadingElement>` ile oluşturulan scroll tetikleme reference'ı, hero başlığının DOM referansını tutar
  - `heroTitleVisible` — hero başlığının scroll animasyonu görünürlük durumu (boolean)
  - `heroMetaRef` — `useScrollAnimation<HTMLDivElement>` ile oluşturulan scroll tetikleme reference'ı, hero meta section'ının DOM referansını tutar
  - `heroMetaVisible` — hero meta section'ının scroll animasyonu görünürlük durumu (boolean)
  - `brand` — `HVAC_BRANDS` array'inde `slug` ile eşleşen (veya `'nicotra'` özel durumunda `'nicotra-gebhardt'` eşlemesi ile) marka objesi; tüm sayfa veri kaynağı olarak kullanılır
  - `detail` — `BRAND_DETAILS[brand.slug]` erişiminden elde edilen marka detay nesnesi (story, stats içerir), `brand` mevcutsa tanımlıdır
  - `products` — `useState<Product[]>` ile yönetilen markaya ait zenginleştirilmiş ürün listesi, `getProductsEnriched` API çağrısıyla doldurulur
  - `loading` — `useState<boolean>` ile yönetilen ürün yükleme durumu flag'i, true iken skeleton placeholder gösterilir
  - `loadProducts` — `useEffect` içinde tanımlanan async fonksiyon; `getProductsEnriched(supabaseBrowserClient, { brand: brand.name, limit: 8 })` çağrısıyla ürünleri yükler, `setProducts` ile state'i günceller, hata durumunda `console.error` loglar
  - `breadcrumbItems` — breadcrumb navigasyon dizisi; ev (`/`), markalar listesi (`/brands`), mevcut marka adı olmak üzere üç öğe içerir
  - `e` — `loadProducts` içindeki `catch` bloğu tarafından yakalanan hata nesnesi
  - `data` — `getProductsEnriched` API çağrısının başarıyla döndürülen ürün verisi dizisi
- **Dönüş**: JSX — `brand` bulunamazsa "Marka bulunamadı" hata sayfası, bulunursa tam marka detay sayfası (Seo, Breadcrumb, Hero section, Marka vizyonu & kurumsal bilgi paneli, Ürün grid'i)

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