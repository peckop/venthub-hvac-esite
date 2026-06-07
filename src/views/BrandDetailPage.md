---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx
skeleton_hash: fd12542b7daeb278
entity_hashes:
  func:BrandDetailPage: 658e62bc6ce56cad
  overview: 68ae513578edc20b
  style_tokens: 4208267ad108784f
generated_at: 2026-06-07T20:34:41Z
---

## Genel Bakış
BrandDetailPage modülü, VentHub HVAC platformunda belirli bir markanın detay sayfasını sunan React bileşenidir. Prop olarak aldığı initialBrandSlug değerini kullanarak ilgili markanın ürünleri, özellikleri ve içerikleri gibi bilgileri kullanıcıya sunar. Sayfa, dinamik olarak marka verisine göre oluşturulur ve marka bazlı bir tüketici deneyimi sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tamamını oluşturan ve yöneten ana React bileşenidir. Gelen marka tanımlayıcısını işleyerek ilgili markanın tüm detay sayfası içeriğini render eder.
- BrandDetailPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel mimari varsayımlar, bileşenin props yapısı ve statik veri yapısı üzerine kurulmuştur.

[Aksiyom 1]: Eğer `initialBrandSlug` prop'u verilmezse, bileşen hangi markanın detayını göstereceğini bilemez ve bileşen düzgün çalışamaz.

[Aksiyom 2]: Eğer `BRAND_DETAILS` nesnesi, `initialBrandSlug` ile eşleşen bir marka anahtarı içermiyorsa, bileşen gösterilecek marka verisini bulamaz ve hata oluşur.

[Aksiyom 3]: Eğer `BRAND_DETAILS` nesnesi boş veya tanımsız olursa, bileşen hiç bir marka verisi kullanamaz ve render edilemez.

---

## FONKSİYON DETAYLARI

### BrandDetailPage

**Ne yapar**: Bu bileşen, belirli bir markanın detay sayfasını render eden üst düzey React görünüm bileşenidir. Verilen marka slug'ı kullanarak marka bilgilerini göstermek üzere tasarlanmıştır.

**Nasıl yapar**: `initialBrandSlug` prop'unu alarak başlangıç marka tanımlayıcısını işler. Bu değer sunucu tarafında render (SSR) veya başlangıç verisi olarak kullanılmak üzere bileşene iletilir. Bileşen, bu slug değerini kullanarak ilgili markanın detaylarını yükler ve sayfada görüntüler.

**Parametreler**:
- `initialBrandSlug`: `string` — Sayfa yüklendiğinde görüntülenecek markanın başlangıç slug değerini (URL dostu tanımlayıcı) taşır. Bu değer genellikle sunucu tarafı yönlendirmelerden veya URL parametrelerinden gelir.

**Dönüş**: `React.FC<BrandDetailPageProps>` — BrandDetailPageProps arabirimini implemente eden bir React fonksiyonel bileşeni döndürür. Bileşen, marka detay sayfasının tüm içeriğini render eder.

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

### [N1_NASIL] AST Pointer: BrandDetailPage.tsx::BrandDetailPage (main component)
- **params**: `(initialBrandSlug)` — prop olarak gelen marka slug'ı, URL'den veya sunucu tarafından sağlanır
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu, tüm UI metinleri için kullanılır
  - `params` — useParams() hook'undan dönen URL parametreleri nesnesi
  - `slug` — normalleştirilmiş marka slug'ı string, initialBrandSlug veya params.slug'dan elde edilir; `as string` ile tip genişletmesi yapılır
  - `heroIconRef` — useScrollAnimation<HTMLDivElement> hook'undan dönen ref, hero ikonu için DOM referansı tutar (scroll tetikleme eşiği 0.2)
  - `heroIconVisible` — useScrollAnimation hook'undan dönen boolean, hero ikonunun görünür olup olmadığını belirler
  - `heroTitleRef` — useScrollAnimation<HTMLHeadingElement> hook'undan dönen ref, hero başlık için DOM referansı tutar (eşik 0.2)
  - `heroTitleVisible` — useScrollAnimation hook'undan dönen boolean, hero başlığın görünür olup olmadığını belirler
  - `heroMetaRef` — useScrollAnimation<HTMLDivElement> hook'undan dönen ref, hero meta alanı için DOM referansı tutar (eşik 0.2)
  - `heroMetaVisible` — useScrollAnimation hook'undan dönen boolean, hero meta alanının görünür olup olmadığını belirler
  - `brand` — HVAC_BRANDS.find() ile slug'a eşleşen marka nesnesi; `b.slug === slug` veya nicotra özel eşleşmesi ile bulunur; eşleşme yoksa undefined kalır
  - `detail` — brand varsa `BRAND_DETAILS[brand.slug]` ile erişilen marka detay nesnesi; brand yoksa null atanır
  - `products` — useState<Product[]> ile oluşturulan state, yüklenecek ürün dizisi tutar
  - `loading` — useState(true) ile oluşturulan boolean state, ürün yükleme durumunu takip eder
  - `breadcrumbItems` — breadcrumb navigasyon öğeleri dizisi, her biri `{ label, href }` yapısındadır; home, brands ve mevcut marka adını içerir
- **Dönüş**: JSX element (JSX — conditional: brand yoksa "not found" sayfası, varsa ana marka detay sayfası JSX'i döner)

### [N2_NASIL] AST Pointer: BrandDetailPage.tsx::useEffect callback (loadProducts trigger)
- **params**: yok
- **ic_degiskenler**:
  - `loadProducts` — async inner fonksiyon, ürünleri supabase'den yükler; useEffect içinde tanımlanıp hemen çağrılır
- **Dönüş**: yok (useEffect callback, side effect tetikler)

### [N3_NASIL] AST Pointer: BrandDetailPage.tsx::loadProducts (async inner function)
- **params**: yok (closure ile dış kapsamdan `brand` ve `setProducts`, `setLoading` erişilir)
- **ic_degiskenler**:
  - `data` — getProductsEnriched() async çağrısından dönen Product[] dizisi; supabaseBrowserClient ve `{ brand: brand.name, limit: 8 }` parametreleri ile çağrılır
  - `e` — try-catch bloğundaki hata nesnesi; console.error ile loglanır
- **Dönüş**: Promise<void> (explicit return yok, state set edilir)

### [N4_NASIL] AST Pointer: BrandDetailPage.tsx::stat map callback
- **params**: `(stat, i)` — `stat`: detail.stats dizisindeki tek bir istatistik nesnesi (label ve value özellikleri taşır); `i`: dizi indeksi, React key olarak kullanılır
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (div — label ve value içeren satır)

### [N5_NASIL] AST Pointer: BrandDetailPage.tsx::product map callback
- **params**: `(product)` — tek bir Product nesnesi; product.id, product.slug, product.name, product.image_url, product.sku özellikleri erişilir
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (Link component — ürün kartı, VentImage ile görsel, ürün adı ve SKU gösterimi)

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