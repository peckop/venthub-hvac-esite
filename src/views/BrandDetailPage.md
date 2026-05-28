---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx
skeleton_hash: f49acc31b2df272a
entity_hashes:
  func:BrandDetailPage: 658e62bc6ce56cad
  overview: efd4c98d3115ef5d
  style_tokens: 4208267ad108784f
generated_at: 2026-05-28T22:39:44Z
---

## Genel Bakış
BrandDetailPage modülü, VentHub HVAC platformunda belirli bir markanın detay sayfasını sunan React bileşenidir. Prop olarak aldığı marka slug değerini kullanarak ilgili markanın ürünleri, özellikleri ve içerikleri gibi bilgileri kullanıcıya sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tamamını oluşturan ve yöneten ana React bileşenidir. Gelen marka tanımlayıcısını işleyerek ilgili markanın tüm detay sayfası içeriğini render eder.
- BrandDetailPage

---

## AXIOMS – Mimari Varsayımlar
Bu marka detay görüntüleme sayfası modülünün doğru çalışması için dışarıdan sağlanan girdi prop'unun ve dahili sabit veri nesnesinin eksiksiz, erişilebilir ve geçerli olmasına dayanan temel varsayımlar aşağıdadır.

[Aksiyom 1]: Eğer `initialBrandSlug` prop'u sağlanmazsa veya geçerli bir metin dizesi (string) içermeyip `undefined`/`null`/boş dize olursa, bileşen marka verisini `BRAND_DETAILS` nesnesinden eşleştiremez, bu durum sayfanın marka içeriğini gösterememesine veya hata durumuna yol açar.

[Aksiyom 2]: Eğer `BRAND_DETAILS` modül sabiti tanımlı değilse veya içinde `initialBrandSlug` ile eşleşen bir anahtar (marka kimliği) içermiyorsa, bileşen görüntülenecek marka bilgisini bulamaz ve varsayılan bir hata veya "bulunamadı" durumu göstermek zorunda kalır.

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

### [N1_NASIL] AST Pointer: BrandDetailPage.tsx::BrandDetailPage
- **params**: `(initialBrandSlug)`
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, metin lokalizasyonu için kullanılır
  - `params` — useParams hook'undan gelen URL parametreleri nesnesi
  - `slug` — initialBrandSlug veya params?.slug'dan elde edilen marka slug değeri, string olarak zorunlu dönüşüm yapılmış
  - `heroIconRef` — useScrollAnimation hook'undan dönen hero ikonu için ref nesnesi
  - `heroIconVisible` — useScrollAnimation hook'undan dönen hero ikonunun görünür olup olmadığını belirten boolean
  - `heroTitleRef` — useScrollAnimation hook'undan dönen hero başlığı için ref nesnesi
  - `heroTitleVisible` — useScrollAnimation hook'undan dönen hero başlığının görünür olup olmadığını belirten boolean
  - `heroMetaRef` — useScrollAnimation hook'undan dönen hero meta bilgisi için ref nesnesi
  - `heroMetaVisible` — useScrollAnimation hook'undan dönen hero meta bilgisinin görünür olup olmadığını belirten boolean
  - `brand` — HVAC_BRANDS dizisinde slug'a göre bulunan marka nesnesi veya 'nicotra' slug'ı için özel eşleşme
  - `detail` — brand varsa BRAND_DETAILS[brand.slug] ile elde edilen detaylı marka bilgisi nesnesi, yoksa null
  - `products` — useState ile tanımlanan product dizisi, initial değeri boş dizi
  - `setProducts` — products state'ini güncellemek için kullanılan setter fonksiyonu
  - `loading` — useState ile tanımlanan loading durumu, initial değeri true
  - `setLoading` — loading state'ini güncellemek için kullanılan setter fonksiyonu
  - `breadcrumbItems` — breadcrumb için label ve href değerlerini içeren dizi, t() ile çevrilmiş metinler
- **Dönüş**: JSX elementi (React.FC<BrandDetailPageProps>)

### [N2_NASIL] AST Pointer: BrandDetailPage.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loadProducts` — asenkron ürün yükleme fonksiyonu, brand varsa getProductsEnriched API çağrısı yapar
- **Dönüş**: yok (void)

### [N3_NASIL] AST Pointer: BrandDetailPage.tsx::loadProducts
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — getProductsEnriched API çağrısından dönen ürün dizisi sonucu
  - `e` — try-catch bloğunda yakalanan hata nesnesi, console.error ile loglanır
- **Dönüş**: Promise<void> (asenkron)

### [N4_NASIL] AST Pointer: BrandDetailPage.tsx::detail?.stats?.map callback
- **params**: `(stat, i)`
- **ic_degiskenler**: (yok - sadece parametreler kullanılıyor)
- **Dönüş**: JSX elementi (her bir stat için bir div)

### [N5_NASIL] AST Pointer: BrandDetailPage.tsx::products.map callback
- **params**: `(product)`
- **ic_degiskenler**: (yok - sadece parametre kullanılıyor)
- **Dönüş**: JSX elementi (Link içinde ürün kartı)

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