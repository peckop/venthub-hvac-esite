---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\utils\routes.ts
skeleton_hash: 15798fbb1ec3f765
entity_hashes:
  func:assertProductSlug: 7cc00756c332a6af
  func:localizedHref: e1a2d461bb32d4d4
  overview: 8cbb4744a23035a6
generated_at: 2026-08-25T07:59:27Z
---

## Genel Bakış
Bu modül, ürün rotaları ve çok dilli URL oluşturma ile ilgili yardımcı fonksiyonları içerir. Ürün slug'larının geçerliliğini kontrol eder ve dil duyarlı bağlantılar üretir.

## Fonksiyon Grupları
### Slug Doğrulama
Ürün slug'larının belirli bir formata uygun olup olmadığını kontrol eder ve geçerli bir slug döndürür.
- assertProductSlug

### Çok Dilli URL Oluşturma
Verilen bir URL'yi ve dili alarak, o dile uygun bir rota nesnesi oluşturur.
- localizedHref

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, gövdeden çıkarım yapılabilecek aksiyom tanımlanamaz.

---

## FONKSİYON DETAYLARI

### assertProductSlug
**Ne yapar**: Ürün slug değerini doğrular. Gelen değerin bir UUID olup olmadığını kontrol eder ve ortama göre farklı bir hata işleme stratejisi uygular.
**Nasıl yapar**: Fonksiyon, öncelikle boş bir `slug` girdisi alırsa boş bir dize döndürür. Ardından, gelen `slug` değerinin bir UUID formatına uyup uymadığını bir regex ile test eder. Eğer değer bir UUID ise, `process.env.NODE_ENV` değişkeninin değerine göre hareket eder. Development (geliştirme) ortamında, performans ve SEO sorunlarına yol açabileceğinden dolayı bir hata fırlatarak hızlıca durumu bildirir (fail-fast). Production (canlı) ortamında ise, kullanıcı arayüzünde bir hata ekranı göstermemek için hatayı yalnızca konsola yazar ve gelen UUID değerini olduğu gibi geri döndürür. Bu sayede, bir Edge Middleware'in bu UUID'yi yakalayıp kalıcı (308) yönlendirme yapabilmesine olanak tanır. Eğer değer bir UUID değilse, doğrudan gelen `slug` değerini geri döndürür.
**Parametreler**:
- slug: string — Doğrulanacak ürün slug değeri.
**Dönüş**: string — Doğrulanmış veya hata durumunda (production) olduğu gibi bırakılmış slug değerini döndürür.

### localizedHref
**Ne yapar**: Dilsiz bir taban URL'e, verilen dile ait öneki ekleyerek lokalize edilmiş bir yol (route) oluşturur. Bu fonksiyon, `useLocalizedRoutes` proxy'sinin sunucu tarafında (RSC) kullanılan saf (side-effect-free) çekirdeğidir.
**Nasıl yapar**: Fonksiyon, gelen `url` parametresini kontrol eder. Eğer URL `/admin` veya `/api` ile başlıyorsa, bu yolların lokalizasyona ihtiyacı olmadığı varsayılarak URL olduğu gibi `Route` tipine dönüştürülerek geri döndürür. Ardından, URL'in zaten bir dil önekine (`/tr`, `/en` veya bunlarla başlayan yollar) sahip olup olmadığını kontrol eder. Bu kontrolde, `/tr` gibi kısa bir önekin yanlışlıkla `/trends` gibi bir yolu lokalize-dışı bırakmaması için tam segment kontrolü (`startsWith('/tr/')` gibi) yapılır. Eğer URL zaten lokalize ise, yine olduğu gibi döndürülür. Diğer tüm durumlarda, URL'in kök (`/`) olup olmadığına bağlı olarak `/${lang}` veya `/${lang}${url}` formatında bir dize oluşturur ve bunu `Route` tipine dönüştürerek geri döndürür.
**Parametreler**:
- url: string — Dil öneki eklenecek taban URL.
- lang: string — Eklenecek dil öneki (örneğin: 'tr', 'en').
**Dönüş**: Route — Dil öneki eklenmiş veya eklenmemiş (gerekli durumlarda) lokalize edilmiş yol.

---

## İTHALATLAR (IMPORTS)
- import: next::type { Route }

---

## SABİTLER
- **Routes** (object) — `{
  home: () => '/' as Route,
  
  // Eşsiz Link Yönetimi — F5-B: slug art...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/routes.ts::assertProductSlug
- **params**: `slug: string`
- **ic_degiskenler**:
  - `uuidRegex` — UUID formatını test etmek için kullanılan regex pattern (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`)
- **Dönüş**: `string` — slug'ın kendisi veya boş string

### [N2_NASIL] AST Pointer: src/utils/routes.ts::Routes anonim fonksiyonu (slug, sku)
- **params**: `slug: string`, `sku?: string`
- **ic_degiskenler**:
  - `validSlug` — `assertProductSlug(slug)` çağrısından dönen doğrulanmış slug değeri
  - `base` — `/products/${encodeURIComponent(validSlug)}` ile oluşturulan temel URL
- **Dönüş**: `Route` — sku varsa query string eklenmiş, yoksa sadece base URL

### [N3_NASIL] AST Pointer: src/utils/routes.ts::Routes anonim fonksiyonu (params)
- **params**: `params?: { brand?: string, limit?: number }`
- **ic_degiskenler**:
  - `query` — `new URLSearchParams()` ile oluşturulan, brand ve limit parametrelerini tutan nesne
  - `qs` — `query.toString()` ile elde edilen query string
- **Dönüş**: `Route` — query string varsa `/products?${qs}`, yoksa `/products`

### [N4_NASIL] AST Pointer: src/utils/routes.ts::Routes anonim fonksiyonu (idOrSlug)
- **params**: `idOrSlug: string`
- **ic_degiskenler**: yok
- **Dönüş**: `Route` — boşsa `/products`, değilse `/products/${encodeURIComponent(idOrSlug)}`

### [N5_NASIL] AST Pointer: src/utils/routes.ts::Routes anonim fonksiyonu (slug, subSlug)
- **params**: `slug: string`, `subSlug?: string`
- **ic_degiskenler**: yok
- **Dönüş**: `Route` — subSlug varsa ve slug'dan farklıysa alt kategori URL'i, değilse sadece kategori URL'i

### [N6_NASIL] AST Pointer: src/utils/routes.ts::Routes anonim fonksiyonu (slug)
- **params**: `slug: string`
- **ic_degiskenler**: yok
- **Dönüş**: `Route` — `/brands/${encodeURIComponent(slug)}`

### [N7_NASIL] AST Pointer: src/utils/routes.ts::Routes anonim fonksiyonu (orderId, status)
- **params**: `orderId?: string`, `status?: string`
- **ic_degiskenler**:
  - `query` — `new URLSearchParams()` ile oluşturulan, orderId ve status parametrelerini tutan nesne
- **Dönüş**: `Route` — orderId yoksa `/payment-success`, varsa query string eklenmiş ödeme başarı URL'i

### [N8_NASIL] AST Pointer: src/utils/routes.ts::Routes anonim fonksiyonu (redirect, error)
- **params**: `redirect?: string`, `error?: string`
- **ic_degiskenler**:
  - `url` — `/auth/login` sabit login sayfası yolu
  - `params` — `new URLSearchParams()` ile oluşturulan, redirect ve error parametrelerini tutan nesne
  - `qs` — `params.toString()` ile elde edilen query string
- **Dönüş**: `Route` — query string varsa `${url}?${qs}`, yoksa sadece `url`

### [N9_NASIL] AST Pointer: src/utils/routes.ts::localizedHref
- **params**: `url: string`, `lang: string`
- **ic_degiskenler**: yok
- **Dönüş**: `Route` — url `/admin` veya `/api` ile başlıyorsa olduğu gibi, zaten `/tr` veya `/en` ile başlıyorsa olduğu gibi, değilse `/${lang}` öneki eklenmiş URL

---

## NODE ID STANDARD

  file: routes.ts
  function: routes.ts::assertProductSlug
  function: routes.ts::localizedHref

---

## DISA AKTARILANLAR (EXPORTS)
  export: Routes
  export: assertProductSlug
  export: localizedHref