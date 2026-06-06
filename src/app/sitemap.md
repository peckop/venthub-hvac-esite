---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\sitemap.ts
skeleton_hash: fa7c2b0046492944
entity_hashes:
  func:sitemap: 07414dd0bcd23791
  overview: fbb6fde2da42ac38
generated_at: 2026-06-06T21:54:28Z
---

## Genel Bakış
Bu modül, Next.js uygulaması için site haritasını (sitemap) dinamik olarak oluşturmaktan sorumludur. Statik sayfalar, kategoriler, markalar ve ürünler gibi tüm içerik türlerinin URL'lerini toplayarak arama motorları için yapılandırılmış bir site haritası üretir. Türkçe ve İngilizce çoklu dil desteğiyle, her URL için son değişiklik tarihi, değişim sıklığı ve öncelik gibi meta verileri içerir.

## Fonksiyon Grupları
### Site Haritası Oluşturma
Uygulamanın tüm rotalarını tarayarak arama motoru dostu site haritası verisini hazırlar.
- sitemap

---



---

## FONKSİYON DETAYLARI

### sitemap
**Ne yapar**: Bu fonksiyon, web sitesinin tüm sayfalarını (statik sayfalar, kategoriler, markalar ve ürünler) arama motorları için yapılandırılmış bir site haritası formatında, çoklu dil desteğiyle (Türkçe ve İngilizce) oluşturur.
**Nasıl yapar**: Fonksiyon, site URL'sini ve desteklenen dilleri temel alır. Asenkron olarak kategori ve ürün verilerini çeker. Ardından, tanımlanmış statik rotaları, çekilen kategori verilerine göre kategori rotalarını, önceden tanımlı `HVAC_BRANDS` dizisinden marka rotalarını ve geçerli bir `slug` değeri olan ürünler için ürün rotalarını, her biri için yerelleştirilmiş URL'ler, son güncellenme tarihi, değişim sıklığı ve öncelik gibi meta verilerle birleştirip döndürür.
**Parametreler**:
Bu fonksiyon parametre almaz.
**Dönüş**: `Promise<MetadataRoute.Sitemap>` - Tüm sayfaları (statik, kategori, marka ve ürün) ve bunların dil alternatiflerini içeren, arama motoru optimizasyonu için hazırlanmış bir site haritası dizisi.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/app/sitemap.ts::sitemap`
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `baseUrl` — SITE_URL sabitinden alınan site kök URL'si, tüm sitemap URL'lerinin başına eklenir
  - `locales` — Desteklenen dil kodlarının dizisi `['tr', 'en']`, her sayfanın çok dilli versiyonunu oluşturmak için kullanılır
  - `categories` — `getCategories()` API çağrısının sonucu; kategori listesi, categoryRoutes oluşturmak için kullanılır; hata durumunda boş diziye düşer
  - `products` — `getAllProducts()` API çağrısının sonucu; ürün listesi, productRoutes oluşturmak için kullanılır; hata durumunda boş diziye düşer
  - `staticRoutesList` — Statik sayfa yollarının dizisi (örn. `/products`, `/brands`), her dil için sitemap girdileri üretmek kullanılır
  - `staticRoutes` — `locales.flatMap` ile üretilen statik sayfaların sitemap objeleri dizisi; her route için dil bazlı URL, lastModified, changefreq, priority ve alternates içerir
  - `categoryRoutes` — `locales.flatMap` ile üretilen kategori sayfalarının sitemap objeleri dizisi; `cat.slug` ve `cat.updated_at` değerlerinden URL ve meta bilgileri türetilir
  - `brandRoutes` — `locales.flatMap` ile üretilen marka sayfalarının sitemap objeleri dizisi; `HVAC_BRANDS` dizisindeki her markanın `slug` değeri kullanılarak üretilir
  - `productRoutes` — `locales.flatMap` ile üretilen ürün sayfalarının sitemap objeleri dizisi; sadece `slug` değeri olan ürünler (`!!prod.slug` filtresi) dahil edilir, `prod.slug!` ile non-null assertion kullanılır
- **Dönüş**: `Promise<MetadataRoute.Sitemap>` — statik, kategori, marka ve ürün rotalarının birleşik dizisi

---

### [N2_NASIL] AST Pointer: `src/app/sitemap.ts::sitemap → (lang) =>` (static routes flatMap callback)
- **params**: `lang` — şu anki dil kodu (`'tr'` veya `'en'`)
- **ic_degiskenler**: (yok)
- **Dönüş**: `staticRoutesList` dizisi üzerinde `map` ile üretilen sitemap objeleri dizisi; her biri `${baseUrl}/${lang}${route}` formatında URL, `new Date()` lastModified, `daily` changefreq, priority (ana sayfa `1.0`, diğerleri `0.8`) ve `alternates.languages` alanlarını içerir

---

### [N3_NASIL] AST Pointer: `src/app/sitemap.ts::sitemap → (lang) => → (route) =>` (static route map callback)
- **params**: `route` — `staticRoutesList` dizisindeki tek bir statik yol stringi (örn. `''`, `'/products'`, `'/brands'`)
- **ic_degiskenler**:
  - `baseUrl` — kapama yoluyla erişilen üst kapsamdaki site kök URL'si
  - `lang` — kapama yoluyla erişilen üst kapsamdaki dil kodu
- **Dönüş**: `{ url, lastModified, changefreq, priority, alternates }` objesi; `url` `${baseUrl}/${lang}${route}`, `priority` `route === '' ? 1.0 : 0.8` koşuluyla belirlenir, `alternates.languages` her iki dil için de sabit URL üretir

---

### [N4_NASIL] AST Pointer: `src/app/sitemap.ts::sitemap → (lang) =>` (category routes flatMap callback)
- **params**: `lang` — şu anki dil kodu (`'tr'` veya `'en'`)
- **ic_degiskenler**:
  - `categories` — kapama yoluyla erişilen üst kapsamdaki kategori dizisi
  - `baseUrl` — kapama yoluyla erişilen üst kapsamdaki site kök URL'si
- **Dönüş**: `categories` dizisi üzerinde `map` ile üretilen sitemap objeleri dizisi; her biri `${baseUrl}/${lang}${Routes.category(cat.slug)}` formatında URL, `cat.updated_at` veya fallback `new Date()` ile `lastModified`, `weekly` changefreq, `0.7` priority ve `alternates.languages` içerir

---

### [N5_NASIL] AST Pointer: `src/app/sitemap.ts::sitemap → (lang) => → (cat) =>` (category map callback)
- **params**: `cat` — tek bir kategori objesi; `.slug` ve `.updated_at` özellikleri kullanılır
- **ic_degiskenler**:
  - `baseUrl` — kapama yoluyla erişilen üst kapsamdaki site kök URL'si
  - `lang` — kapama yoluyla erişilen üst kapsamdaki dil kodu
- **Dönüş**: `{ url, lastModified, changefreq, priority, alternates }` objesi; `url` `Routes.category(cat.slug)` kullanılarak, `lastModified` `new Date(cat.updated_at || new Date())` ile, `alternates.languages` her iki dil için `Routes.category(cat.slug)` kullanılarak üretilir

---

### [N6_NASIL] AST Pointer: `src/app/sitemap.ts::sitemap → (lang) =>` (brand routes flatMap callback)
- **params**: `lang` — şu anki dil kodu (`'tr'` veya `'en'`)
- **ic_degiskenler**:
  - `HVAC_BRANDS` — kapama yoluyla erişilen üst kapsamdaki marka sabit dizisi
  - `baseUrl` — kapama yoluyla erişilen üst kapsamdaki site kök URL'si
- **Dönüş**: `HVAC_BRANDS` dizisi üzerinde `map` ile üretilen sitemap objeleri dizisi; her biri `${baseUrl}/${lang}${Routes.brand(brand.slug)}` formatında URL, `new Date()` lastModified, `weekly` changefreq, `0.6` priority ve `alternates.languages` içerir

---

### [N7_NASIL] AST Pointer: `src/app/sitemap.ts::sitemap → (lang) => → (brand) =>` (brand map callback)
- **params**: `brand` — tek bir marka objesi; `.slug` özelliği kullanılır
- **ic_degiskenler**:
  - `baseUrl` — kapama yoluyla erişilen üst kapsamdaki site kök URL'si
  - `lang` — kapama yoluyla erişilen üst kapsamdaki dil kodu
- **Dönüş**: `{ url, lastModified, changefreq, priority, alternates }` objesi; `url` `Routes.brand(brand.slug)` kullanılarak, `lastModified` `new Date()`, `alternates.languages` her iki dil için `Routes.brand(brand.slug)` kullanılarak üretilir

---

### [N8_NASIL] AST Pointer: `src/app/sitemap.ts::sitemap → (lang) =>` (product routes flatMap callback)
- **params**: `lang` — şu anki dil kodu (`'tr'` veya `'en'`)
- **ic_degiskenler**:
  - `products` — kapama yoluyla erişilen üst kapsamdaki ürün dizisi; önce `.filter((prod) => !!prod.slug)` ile slug değeri olanlar filtrelenir
  - `baseUrl` — kapama yoluyla erişilen üst kapsamdaki site kök URL'si
- **Dönüş**: Filtrelenmiş `products` dizisi üzerinde `map` ile üretilen sitemap objeleri dizisi; her biri `${baseUrl}/${lang}${Routes.product(prod.slug!)}` formatında URL, `prod.updated_at` veya fallback `new Date()` ile `lastModified`, `daily` changefreq, `0.9` priority ve `alternates.languages` içerir

---

### [N9_NASIL] AST Pointer: `src/app/sitemap.ts::sitemap → (lang) => → (prod) =>` (product map callback)
- **params**: `prod` — tek bir ürün objesi; `.slug` (non-null assertion ile `!`) ve `.updated_at` özellikleri kullanılır; filtre tarafından `slug`'ı tanımlı olanlar ile sınırlıdır
- **ic_degiskenler**:
  - `baseUrl` — kapama yoluyla erişilen üst kapsamdaki site kök URL'si
  - `lang` — kapama yoluyla erişilen üst kapsamdaki dil kodu
- **Dönüş**: `{ url, lastModified, changefreq, priority, alternates }` objesi; `url` `Routes.product(prod.slug!)` kullanılarak, `lastModified` `new Date(prod.updated_at || new Date())` ile, `alternates.languages` her iki dil için `Routes.product(prod.slug!)` kullanılarak üretilir

---

## NODE ID STANDARD

  file: src\app\sitemap.ts
  function: src\app\sitemap.ts::sitemap

---

## DISA AKTARILANLAR (EXPORTS)
  export: sitemap