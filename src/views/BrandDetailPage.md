---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx
skeleton_hash: 5ebfbc255d93d723
entity_hashes:
  func:BrandDetailPage: 658e62bc6ce56cad
  overview: fe818cee1b9d8c5f
  style_tokens: 4208267ad108784f
generated_at: 2026-06-06T21:58:12Z
---

## Genel Bakış
BrandDetailPage modülü, VentHub HVAC platformunda belirli bir markanın detay sayfasını sunan React bileşenidir. Prop olarak aldığı marka slug değerini kullanarak ilgili markanın ürünleri, özellikleri ve içerikleri gibi bilgileri kullanıcıya sunar. Sayfa, dinamik olarak marka verisine göre oluşturulur ve marka bazlı bir tüketici deneyimi sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tamamını oluşturan ve yöneten ana React bileşenidir. Gelen marka tanımlayıcısını işleyerek ilgili markanın tüm detay sayfası içeriğini render eder.
- BrandDetailPage

---



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
- **params**: `initialBrandSlug` — sayfa yüklenirken dışarıdan verilen marka slug'ı
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, sayfadaki metinlerin çok dilli çevirisini sağlar
  - `params` — useParams hook'undan gelen URL parametreleri nesnesi
  - `slug` — URL'den veya initialBrandSlug'tan gelen normalize edilmiş marka tanımlayıcısı
  - `heroIconRef` — useScrollAnimation hook'undan gelen hero ikonu için referans, animasyon tetikleme için kullanılır
  - `heroIconVisible` — hero ikonunun görünür olup olmadığını belirten boolean flag
  - `heroTitleRef` — useScrollAnimation hook'undan gelen hero başlığı için referans
  - `heroTitleVisible` — hero başlığının görünür olup olmadığını belirten boolean flag
  - `heroMetaRef` — useScrollAnimation hook'undan gelen hero meta bilgileri için referans
  - `heroMetaVisible` — hero meta bilgilerinin görünür olup olmadığını belirten boolean flag
  - `brand` — HVAC_BRANDS dizisinde slug ile eşleşen marka nesnesi, yoksa null
  - `detail` — BRAND_DETAILS nesnesinden brand.slug ile erişilen marka detay bilgileri
  - `products` — useState ile yönetilen Product tipinde ürün listesi state'i
  - `loading` — useState ile yönetilen yükleme durumu boolean state'i
  - `breadcrumbItems` — sayfa içi navigasyon içinBreadcrumb bileşenine geçirilen öğeler dizisi
- **Dönüş**: JSX bileşeni (sayfanın tam HTML yapısı)

### [N2_NASIL] AST Pointer: BrandDetailPage.tsx::useEffect Callback
- **params**: yok
- **ic_degiskenler**:
  - `loadProducts` — iç içe tanımlı asenkron fonksiyon, markaya ait ürünleri yükler
- **Dönüş**: yok (yan etki: useEffect ile loadProducts fonksiyonunu çağırır)

### [N3_NASIL] AST Pointer: BrandDetailPage.tsx::loadProducts
- **params**: yok (dış kapsamdan brand, setLoading, setProducts değişkenlerini kullanır)
- **ic_degiskenler**:
  - `data` — getProductsEnriched API çağrısından dönen ürün dizisi
- **Dönüş**: yok (yan etki: products ve loading state'lerini günceller, hata durumunda konsola yazdırır)

### [N4_NASIL] AST Pointer: BrandDetailPage.tsx::Stats Mapping Callback
- **params**: `stat` — tek bir istatistik nesnesi (label ve value alanları), `i` — dizi içindeki indeks numarası
- **ic_degiskenler**: yok (sadece parametreleri kullanarak JSX döndürür)
- **Dönüş**: JSX bileşeni (tek bir istatistik satırı)

### [N5_NASIL] AST Pointer: BrandDetailPage.tsx::Products Mapping Callback
- **params**: `product` — tek bir Product nesnesi (id, name, slug, image_url, sku alanları)
- **ic_degiskenler**: yok (sadece parametreyi kullanarak JSX döndürür)
- **Dönüş**: JSX bileşeni (ürün kartı)

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