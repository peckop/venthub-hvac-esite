---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\page.tsx
skeleton_hash: c88a25287aa13683
generated_at: 2026-05-23T21:50:38Z
---

## Genel Bakış
Bu modül, uygulamanın ana sayfasını oluşturan React bileşenini ve sayfaya ait dinamik meta verileri üreten yapıyı barındırır. Next.js’in sayfa yönlendirme ve metadata API’leriyle uyumlu olarak, URL sorgu parametrelerine göre hem meta bilgilerini oluşturur hem de sayfa içeriğini render eder.

## Fonksiyon Grupları
### Meta Veri Üretimi
Bu grup, gelen sorgu parametrelerini kullanarak sayfanın SEO ve paylaşım meta etiketlerini dinamik şekilde hazırlar.
- generateMetadata

### Sayfa Renderı
Bu grup, uygulamanın kök sayfa bileşenini oluşturur ve sorgu parametrelerine dayalı olarak kullanıcı arayüzünü döndürür.
- RootPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---



---

## TYPE ALIASES

### Props
```typescript
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
```

---

## SABİTLER
- **getCachedHomeData** (call) — `unstable_cache(
  async () => {
    const [catData, prodData] = await Promi...`

---

## AST POINTERS

### [N1_generateMetadata] AST Pointer: src/app/page.tsx::generateMetadata
- **params**: `searchParams` (Promise ile çözümlenen arama parametreleri nesnesi)
- **ic_degiskenler**:
  - `resolvedParams` — `await searchParams` ile elde edilmiş parametre nesnesi
  - `lang` — dil kodu (`'tr'` veya `'en'`), `resolvedParams.lang` değerine göre belirlenir
  - `dict` — `en` veya `tr` sözlük import'undan seçilen dil sözlüğü
  - `siteUrl` — `SITE_URL` sabitinin değeri (sitenin kök URL’si)
  - `canonical` — mevcut sayfanın kanonik URL’si (`${siteUrl}${lang === 'en' ? '/?lang=en' : '/'}`)
  - (ayrıca dışarıdan `en`, `tr`, `SITE_URL` sabitlerine erişilir)
- **Dönüş**: `Promise<Metadata>` — title, description, alternates, openGraph, twitter, robots alanlarını içeren SEO metadata nesnesi

### [N2_getCachedHomeData] AST Pointer: src/app/page.tsx::getCachedHomeData (anonymous async function)
- **params**: yok (parametresiz arrow function)
- **ic_degiskenler**:
  - `catData` — `getCategories()` çağrısından dönen kategori verisi
  - `prodData` — `getProducts(12)` çağrısından dönen ürün verisi (ilk 12 ürün)
  - (kullanılan dış değişkenler: `getCategories`, `getProducts`, `Promise`)
- **Dönüş**: `{ catData, prodData }` — kategori ve ürün verilerini içeren nesne

### [N3_RootPage] AST Pointer: src/app/page.tsx::RootPage
- **params**: `searchParams` (Promise ile çözümlenen arama parametreleri)
- **ic_degiskenler**:
  - `resolvedParams` — `await searchParams` ile çözümlenmiş parametre nesnesi
  - `lang` — dil kodu (`'tr'` veya `'en'`)
  - `dict` — ilgili dil sözlüğü (`en` veya `tr`)
  - `categories` — `DomainCategory[]`; başlangıçta boş dizi, sonra `toUICategoryList(catData)` ile doldurulur
  - `products` — `Product[]`; başlangıçta boş dizi, sonra `prodData` atanır
  - `catData` — `getCachedHomeData()` çağrısından gelen ham kategori verisi (try bloğu içinde tanımlı)
  - `prodData` — `getCachedHomeData()` çağrısından gelen ham ürün verisi (try bloğu içinde tanımlı)
  - `error` — catch bloğunda yakalanan hata nesnesi (`console.warn` ile loglanır)
  - `displayCategories` — `CategoryViewModelLite[]`; `categories` filtrelenip sıralanıp haritalanarak oluşturulur
  - `siteUrl` — `SITE_URL` sabitinin değeri
  - `jsonLds` — WebSite ve Organization şeması içeren JSON-LD nesneleri dizisi
  - (ayrıca dışarıdan `toUICategoryList`, `getCachedHomeData`, `SITE_URL`, `console` erişilir)
- **Dönüş**: React JSX elemanı (JSON‑LD scriptleri ve `HomePage` bileşeni)

### [N4_RootPage_map_category] AST Pointer: src/app/page.tsx::RootPage.map (category callback)
- **params**: `c` (`DomainCategory` tipinde kategori nesnesi)
- **ic_degiskenler**:
  - `dict` — dış kapsamdaki `RootPage`’in seçili dil sözlüğü (`.common?.categoryList` ve `.sub` erişimi için)
  - `categoryListDict` — `dict.common?.categoryList` ifadesinden elde edilen sözlük (`Record<string,

---

## NODE ID STANDARD

  file: src\app\page.tsx
  function: src\app\page.tsx::generateMetadata
  function: src\app\page.tsx::RootPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: RootPage
  export: generateMetadata