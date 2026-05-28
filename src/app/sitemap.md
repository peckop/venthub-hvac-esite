---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\sitemap.ts
skeleton_hash: ebc623b3db63a7de
entity_hashes:
  func:sitemap: a12c36cfd19cfa1a
  overview: 1f20e97deb68e19e
generated_at: 2026-05-28T22:35:27Z
---

## Genel Bakış
Bu modül, Next.js uygulaması için site haritasını (sitemap) dinamik olarak oluşturmaktan sorumludur. Asenkron bir fonksiyon kullanarak uygulamadaki kategoriler ve ürünler gibi farklı içerik türlerinin URL'lerini toplar ve arama motorları için gerekli olan son değişiklik tarihi, değişim sıklığı ve öncelik gibi meta verilerle zenginleştirerek standart bir site haritası yapısı üretir.

## Fonksiyon Grupları
### Site Haritası Oluşturma
Bu grup, uygulamanın tüm rotalarının (hem statik hem de dinamik) taranarak arama motoru dostu bir site haritası verisi hazırlanmasını yönetir.
- sitemap

---



---

## FONKSİYON DETAYLARI

### sitemap
**Ne yapar**: Bu fonksiyon, web sitesi için tüm sayfaları (statik sayfalar, kategoriler, markalar ve ürünler) içeren bir XML sitemap dosyası oluşturur. Fonksiyon, sitenin arama motorları tarafından doğru ve eksiksiz bir şekilde indekslenmesini sağlar.

**Nasıl yapar**: Fonksiyon asenkrondur ve `Promise.all` kullanarak kategori ve ürün verilerini paralel olarak çeker. Ardından, her bir rota türü (statik, kategori, marka, ürün) için bir dizi URL nesnesi oluşturur. Her URL nesnesi; mutlak URL, son güncellenme tarihi, güncelleme sıklığı, öncelik sırası ve alternatif dil versiyonları (hreflang) bilgilerini içerir. Tüm rota dizileri birleştirilerek ana sitemap dizisi döndürülür.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz. Verileri kendi içindeki sabit değerlerden (`SITE_URL`, `HVAC_BRANDS`) ve asenkron çağrılarla (`getCategories`, `getAllProducts`) elde eder.

**Dönüş**: `Promise<MetadataRoute.Sitemap>` tipinde bir değer döndürür. Bu, her bir sayfa için gerekli SEO meta verilerini taşıyan bir nesne dizisidir (`url`, `lastModified`, `changefreq`, `priority`, `alternates`).

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\sitemap.ts::sitemap
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `baseUrl` — SITE_URL sabit değerini tutar, sitemap URL'lerinin temelini oluşturur
  - `locales` — Dil kodlarını içeren dizi ['tr', 'en'], her rotanın çok dilli versiyonlarını oluşturmak için kullanılır
  - `categories` — Veritabanından getCategories() ile çekilen tüm kategorilerin dizisi, Promise.all ile await edilir
  - `products` — Veritabanından getAllProducts() ile çekilen tüm ürünlerin dizisi, Promise.all ile await edilir
  - `staticRoutesList` — Statik sayfa rotalarının dizisi (anasayfa, ürünler, markalar vb.)
  - `staticRoutes` — Statik rotalar için oluşturulan MetadataRoute.Sitemap dizisi, her dil için haritalama yapar
  - `categoryRoutes` — Kategoriler için oluşturulan MetadataRoute.Sitemap dizisi, dinamik kategori rotalarını temsil eder
  - `brandRoutes` — Markalar için oluşturulan MetadataRoute.Sitemap dizisi, HVAC_BRANDS sabitinden gelen marka rotalarını temsil eder
  - `productRoutes` — Ürünler için oluşturulan MetadataRoute.Sitemap dizisi, sadece slug değeri olan ürünleri filtreler ve haritalandırır
- **Dönüş**: Promise<MetadataRoute.Sitemap> — Tüm rotaları (statik, kategori, marka, ürün) birleştirip döner

---

## NODE ID STANDARD

  file: src\app\sitemap.ts
  function: src\app\sitemap.ts::sitemap

---

## DISA AKTARILANLAR (EXPORTS)
  export: sitemap