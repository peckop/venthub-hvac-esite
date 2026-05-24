---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\sitemap.ts
skeleton_hash: ebc623b3db63a7de
generated_at: 2026-05-23T21:50:36Z
---

## Genel Bakış
Bu modül, Next.js uygulamasının dinamik site haritasını (sitemap) oluşturmaktan sorumludur. Tek bir asenkron fonksiyon içerir; bu fonksiyon, kategoriler ve ürünler gibi dinamik içeriklerin URL’lerini toplayarak arama motoru indekslemesi için gerekli meta veriler (son değişme tarihi, değişim sıklığı, öncelik) ile zenginleştirir ve `MetadataRoute.Sitemap` tipinde bir Promise döndürür.

## Fonksiyon Grupları
### Site Haritası Oluşturma
Bu grup, site haritası verisinin hazırlanmasını üstlenir. Uygulamadaki statik ve dinamik rotaları derleyip her biri için uygun URL ve meta bilgilerini içeren bir yapı oluşturur.
- sitemap

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### sitemap
**Ne yapar**: Next.js projesi için `MetadataRoute.Sitemap` türünde bir sitemap verisi döndürür. Bu veri, uygulamanın sitemap.xml dosyasının oluşturulmasında kullanılır ve arama motorlarına site yapısı hakkında bilgi sağlar.
**Nasıl yapar**: Async fonksiyon olarak tanımlanmış olup `Promise` ile sarılmış bir `MetadataRoute.Sitemap` değeri döndürür. Fonksiyonun iç mantığı docstring içinde belirtilmediğinden hangi kaynaklardan yararlandığı veya hangi sayfaları kapsadığı bu dokümanda açıklanamamaktadır.
**Parametreler**: Yok.
**Dönüş**: `Promise<MetadataRoute.Sitemap>` — site haritası bilgisi içeren bir Promise. Dönen nesne genellikle URL, son değişiklik tarihi, değişim sıklığı gibi metadata alanlarını içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\sitemap.ts::sitemap
- **params**: yok
- **ic_degiskenler**:
  - `baseUrl` — `SITE_URL` sabitinden alınan temel site URL’si
  - `categories` — `getCategories()` çağrısı sonucu dönen kategori dizisi (hata durumunda boş dizi)
  - `products` — `getAllProducts()` çağrısı sonucu dönen ürün dizisi (hata durumunda boş dizi)
  - `staticRoutes` — statik yollar (ana sayfa, `/products`, `/brands`, `/contact`, `/about`, `/destek/merkez`, `/cart`) için sitemap girişlerini içeren dizi
  - `categoryRoutes` — her bir kategori için sitemap girişlerini içeren dizi
  - `brandRoutes` — `HVAC_BRANDS` sabitindeki her marka için sitemap girişlerini içeren dizi
  - `productRoutes` — `slug` değeri olan her ürün için sitemap girişlerini içeren dizi
- **Dönüş**: `staticRoutes`, `categoryRoutes`, `brandRoutes`, `productRoutes` dizilerinin birleşimi (`MetadataRoute.Sitemap`)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\sitemap.ts::staticRoutes callback
- **params**: `route` — statik yolun string değeri
- **ic_degiskenler**:
  - `baseUrl` — closure’dan erişilen temel site URL’si
- **Dönüş**: `{ url: \`${baseUrl}${route}\`, lastModified: new Date(), changefreq: 'daily', priority: route === '' ? 1.0 : 0.8 }` şeklinde sitemap girişi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\sitemap.ts::categoryRoutes callback
- **params**: `cat` — kategori objesi (`slug`, `updated_at` alanları)
- **ic_degiskenler**:
  - `baseUrl` — closure’dan erişilen temel site URL’si
- **Dönüş**: `{ url: \`${baseUrl}${Routes.category(cat.slug)}\`, lastModified: new Date(cat.updated_at || new Date()), changefreq: 'weekly', priority: 0.7 }` şeklinde sitemap girişi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\sitemap.ts::brandRoutes callback
- **params**: `brand` — marka objesi (`slug` alanı)
- **ic_degiskenler**:
  - `baseUrl` — closure’dan erişilen temel site URL’si
- **Dönüş**: `{ url: \`${baseUrl}${Routes.brand(brand.slug)}\`, lastModified: new Date(), changefreq: 'weekly', priority: 0.6 }` şeklinde sitemap girişi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\sitemap.ts::productRoutes callback
- **params**: `prod` — ürün objesi (`slug`, `updated_at` alanları)
- **ic_degiskenler**:
  - `baseUrl` — closure’dan erişilen temel site URL’si
- **Dönüş**: `{ url: \`${baseUrl}${Routes.product(prod.slug!)}\`, lastModified: new Date(prod.updated_at || new Date()), changefreq: 'daily', priority: 0.9 }` şeklinde sitemap girişi

---

## NODE ID STANDARD

  file: src\app\sitemap.ts
  function: src\app\sitemap.ts::sitemap

---

## DISA AKTARILANLAR (EXPORTS)
  export: sitemap