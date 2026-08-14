---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\routes.ts
skeleton_hash: 19d656f32362cddc
entity_hashes:
  func:assertProductSlug: 7cc00756c332a6af
  func:localizedHref: e1a2d461bb32d4d4
  overview: 8cbb4744a23035a6
generated_at: 2026-06-19T20:48:41Z
---

## Genel Bakış
VentHub HVAC projesinin rota yönetimi altyapısını destekleyen yardımcı bir modüldür. Ürün rotalarının temel yapısını ve bütünlüğünü korumak için rota sabitlerini merkezi olarak tanımlar, ürün tanımlayıcılarının (slug) doğrulanması ve çok dilli rotaların oluşturulması gibi kritik rota işlemleri sağlar. Mimari olarak, uygulama genelinde tutarlı rota yapısının sürdürülmesi ve rota ile ilgili hataların önlenmesi için kritik bir katman görevi görür.

## Fonksiyon Grupları
### Ürün Slug Doğrulama İşlevleri
Rotalarda kullanılan ürün benzersiz tanımlayıcılarının (slug) geçerliliğini ve bütünlüğünü kontrol etmekle sorumludur. Bu işlev, rota yapısını korumak için gerekli temel doğrulama adımlarını gerçekleştirir.
- assertProductSlug

### Yerelleştirilmiş Rota Oluşturma İşlevleri
Çok dilli uygulama yapısında, dil koduna göre rota adreslerini (URL'leri) dinamik olarak oluşturmak veya dönüştürmekle sorumludur.
- localizedHref

---

## AXIOMS – Mimari Varsayımlar

Bu modül, uygulama rotalarında kullanılan ürün tanımlayıcılarının doğruluğunu sağlamak ve dil bazlı rota URL'leri üretmek için çalışır.

**[Aksiyom 1 - Slug Doğrulama Zorunluluğu]:** Eğer `assertProductSlug` fonksiyonuna geçirilen `slug` parametresi geçersiz bir ürün tanımlayıcısı Formatındaysa veya rota kurallarına uymuyorsa, fonksiyon bir hata fırlatır — aksi durumda standartlaştırılmış slug döner.

**[Aksiyom 2 - Dil Kodu Gereksinimi]:** Eğer `localizedHref` fonksiyonuna geçirilen `lang` parametresi geçerli bir dil kodu değilse veya desteklenen diller arasında yer almıyorsa, beklenmeyen bir rota sonucu oluşur.

**[Aksiyom 3 - URL Bütünlüğü]:** Eğer `localizedHref` fonksiyonuna geçirilen `url` parametresi geçerli bir rota yolu formatında değilse, oluşturulan `Route` nesnesi geçersiz bir hedefe işaret eder.

**[Aksiyom 4 - Routes Sabit Tanımlılığı]:** Eğer `Routes` objesi modül içerisinde tanımlı değilse veya rota tanımları eksikse, uygulama içi navigasyon işlevleri çalışamaz hale gelir.

---

## FONKSİYON DETAYLARI

### assertProductSlug
**Ne yapar**: Ürün slug değerinin geçerliliğini doğrulayan bir kontrol fonksiyonudur. Gelen tanımlayıcının geçerli bir ürün slug'ı olup olmadığını denetler, eğer gelen değer ID veya UUID formatındaysa çalıştığı ortama özel aksiyonlar alır. Hem geliştirme sürecinde hızlı hata yakalama sağlamak hem de canlı üretim ortamında servis sürekliliğini korumak amacıyla tasarlanmıştır.
**Nasıl yapar**: İlk olarak aldığı string değerinin ID veya UUID formatında olup olmadığını tespit eder, ardından çalıştığı ortamı (geliştirme/üretim) ortam değişkenleri üzerinden okur. Geliştirme (Development) ortamında doğrulama başarısız olursa fail-fast prensibi gereği hemen hata fırlatarak geliştiricinin sorunu erken aşamada fark etmesini sağlar. Üretim (Production) ortamında ise sistemi kesintiye uğratmamak için hatalı durumu sadece loglar, orijinal değeri Middleware'in entegre 308 kalıcı yönlendirme mekanizmasını kullanabilmesi için olduğu gibi geri döndürür.
**Parametreler**:
- name: slug, type: string — Doğrulanması gereken ürün odaklı URL tanımlayıcısı (slug) değeri; hatalı kullanım durumunda ID veya UUID formatında da fonksiyona iletilebilir.
**Dönüş**: string tipi değer döndürür. Doğrulama başarılı olursa orijinal geçerli slug değerini her ortamda iletir. Doğrulama başarısız olsa bile üretim ortamında orijinal gelen değeri, Middleware'in yönlendirme mekanizmasını tetikleyebilmesi için geri iletir.

### localizedHref

**Ne yapar**: Dilsiz bir taban URL'e aktif dil önekini ekleyen saf (pure) fonksiyondur. `useLocalizedRoutes` proxy'sinin sunucu-güvenli (React Server Component) çekirdeğini oluşturur; böylece hook kullanamayan Server Component'ler, route handler'lar ve paylaşılan render bileşenleri (ör. Breadcrumb) tarafından dil öneki eklenmesi için kullanılır.

**Nasıl yapar**: Fonksiyon, gelen URL'in durumuna göre üç aşamalı bir karar süreci izler. Öncelikle `/admin` veya `/api` ile başlayan yolları hiçbir dönüşüme uğratmadan doğrudan `Route` tipine dönüştürerek geri döner — çünkü bu yollar dil öneki gerektirmez. Ardından URL'in zaten bir dil öneki içerip içermediğini kontrol eder; bunu yaparken yalnızca tam segment eşleşmeleri (`/tr`, `/en`, `/tr/...`, `/en/...`) dikkate alınır. Burada `startsWith('/tr')` tek başına kullanılmaz; çünkü bu durumda `/trends` gibi tamamen farklı yollar yanlışlıkla localize-dışı kalmaz, ancak localizer-dışı da kalmaz — sorun şudur ki `startsWith('/tr')` kullanılsaydı `/trends` gibi yolların localize edilmesi engellenemezdi. Kontrollerin hiçbirisi eşleşmediğinde ise `/${lang}` önekini URL'in başına ekler; eğer URL `/` ise yalnızca dil öneki döner, aksi halde dil önekinin ardından orijinal URL eklenir. Dönüş değeri her durumda `Route` tipine (`as Route`) dönüştürülür.

**Parametreler**:
- `url`: `string` — Dilsiz taban URL. Örneğin `/`, `/dashboard`, `/admin/settings`, `/api/health` gibi değerler alabilir. Fonksiyon bu URL'e göre dil öneki eklenip eklenmeyeceğine karar verir.
- `lang`: `string` — Aktif dil kodu. Fonksiyonun URL başına ekleyeceği dil öneki olarak kullanılır (ör. `"tr"`, `"en"`). Zaten lokalize edilmiş URL'lerde kullanılmaz因为 kontrollerden erken dönüş yapılır.

**Dönüş**: `Route` — Dil öneki eklenmiş (veya gerekli durumlarda aynen bırakılmış) tam URL string'i. Return type olarak `Route` tipi belirtilmiştir ve her dönüş değerinde `as Route` ile tip güvenliği sağlanmıştır. Fonksiyon saf olduğundan (same input → same output), herhangi bir yan etkisi yoktur.

---

## İTHALATLAR (IMPORTS)
- import: next::type { Route }

---

## SABİTLER
- **Routes** (object) — `{
  home: () => '/' as Route,
  
  // Eşsiz Link Yönetimi
  product: (slu...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `utils/routes.ts::assertProductSlug`
- **params**: `(slug: string)`
- **ic_degiskenler**:
  - `uuidRegex` — UUID formatını eşleştiren RegExp nesnesi (`/^[0-9a-f]{8}-...$/i`), slug'ın geçerli bir UUID olup olmadığını test etmek için kullanılır
- **Dis erisimleri**:
  - `process.env.NODE_ENV` — Ortam değişkeni, production olup olmadığını kontrol eder; production dışıysa hata fırlatır, production'daysa graceful fallback yapar
- **Yan etkiler**: Production dışı ortamda `throw new Error(...)` ile istisna fırlatır; production'da `console.error(...)` ile log basar
- **Dönüş**: `string` — slug'ı olduğu gibi veya boş string döner

---

### [N2_NASIL] AST Pointer: `utils/routes.ts::Routes.product`
- **params**: `(slug: string)`
- **ic_degiskenler**:
  - `validSlug` — `assertProductSlug(slug)` çağrısının dönüş değeri; UUID tespit edildiyse hata/log yapan ve slug'ı doğrulayan ara tampon
- **Dönüş**: `Route` — `/products/{validSlug}` formatında URL, `encodeURIComponent` ile encode edilmiş

---

### [N3_NASIL] AST Pointer: `utils/routes.ts::Routes.products`
- **params**: `(params?: { brand?: string, limit?: number })`
- **ic_degiskenler**:
  - `query` — `URLSearchParams` nesnesi; `brand` ve `limit` parametrelerini query string'e eklemek için biriktirici olarak kullanılır
  - `qs` — `query.toString()` sonucu; oluşturulan query string'in ham halidir, boşsa `/products` döner, doluysa `?` eklenir
- **Dönüş**: `Route` — `/products` veya `/products?brand=...&limit=...` formatında URL

---

### [N4_NASIL] AST Pointer: `utils/routes.ts::Routes.productDetail`
- **params**: `(idOrSlug: string)`
- **ic_degiskenler**: yok
- **Dönüş**: `Route` — `/products/{idOrSlug}` formatında URL, `encodeURIComponent` ile encode edilmiş; boşsa `/products` döner

---

### [N5_NASIL] AST Pointer: `utils/routes.ts::Routes.category`
- **params**: `(slug: string, subSlug?: string)`
- **ic_degiskenler**: yok
- **Koşul mantığı**: `subSlug` varsa, `slug`'dan farklıysa ve `'undefined'` string'ine eşleşmiyorsa alt kategori URL'i üretir
- **Dönüş**: `Route` — `/category/{slug}` veya `/category/{slug}/{subSlug}` formatında URL, her segment `encodeURIComponent` ile encode edilmiş

---

### [N6_NASIL] AST Pointer: `utils/routes.ts::Routes.brand`
- **params**: `(slug: string)`
- **ic_degiskenler**: yok
- **Dönüş**: `Route` — `/brands/{slug}` formatında URL, `encodeURIComponent` ile encode edilmiş

---

### [N7_NASIL] AST Pointer: `utils/routes.ts::Routes.paymentSuccess`
- **params**: `(orderId?: string, status?: string)`
- **ic_degiskenler**:
  - `query` — `URLSearchParams` nesnesi; `orderId` zorunlu olarak, `status` ise opsiyonel olarak query string'e eklenir
- **Dönüş**: `Route` — `/payment-success?orderId=...&status=...` formatında URL; `orderId` yoksa doğrudan `/payment-success` döner

---

### [N8_NASIL] AST Pointer: `utils/routes.ts::Routes.login`
- **params**: `(redirect?: string, error?: string)`
- **ic_degiskenler**:
  - `url` — Sabit string `'/auth/login'`, login sayfasının temel yolu
  - `params` — `URLSearchParams` nesnesi; `redirect` ve `error` opsiyonel parametreleri query string'e eklemek için kullanılır
  - `qs` — `params.toString()` sonucu; oluşturulan query string'in ham halidir
- **Dönüş**: `Route` — `/auth/login` veya `/auth/login?redirect=...&error=...` formatında URL

---

### [N9_NASIL] AST Pointer: `utils/routes.ts::localizedHref`
- **params**: `(url: string, lang: string)`
- **ic_degiskenler**: yok
- **Koşul mantığı**: URL `/admin` veya `/api` ile başlıyorsa olduğu gibi döner; zaten `/tr`, `/en`, `/tr/...` veya `/en/...` ile başlıyorsa locale eklenmeden döner; aksi halde `/{lang}` prefix'i eklenir
- **Dönüş**: `Route` — Locale-önekli veya öneksiz URL string'i

---

## NODE ID STANDARD

  file: src\utils\routes.ts
  function: src\utils\routes.ts::assertProductSlug
  function: src\utils\routes.ts::localizedHref

---

## DISA AKTARILANLAR (EXPORTS)
  export: Routes
  export: assertProductSlug
  export: localizedHref