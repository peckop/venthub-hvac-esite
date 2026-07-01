---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\routes.ts
skeleton_hash: 19d656f32362cddc
entity_hashes:
  func:assertProductSlug: 7cc00756c332a6af
  func:localizedHref: db9bfc84894b2a32
  overview: 8cbb4744a23035a6
generated_at: 2026-06-15T17:04:15Z
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

**Ne yapar**: Dilsiz bir taban URL'e aktif dil önekini ekleyen saf (pure) bir yardımcı fonksiyondur. `useLocalizedRoutes` hook'unun sunucu-güvenli (RSC) çekirdeği olarak çalışır ve dil önekini URL'e dinamik olarak ekler.

**Nasıl yapar**: Fonksiyon, gelen URL'in zaten belirli bir dil öneki (`/tr` veya `/en`) veya özel bir yol (`/admin`, `/api`) ile başlayıp başlamadığını kontrol eder. Eğer URL bu özel yollardan biriyle başlıyorsa, URL doğrudan olduğu gibi döndürülerek dil ekleme işlemi atlanır. Aksi halde, verilen `lang` parametresini URL'in başına ekler; eğer URL kök dizin (`/`) ise sadece dil öneki, aksi halde dil öneki ile birlikte mevcut URL yolu döndürülür. Bu yaklaşım, sunucu taraflı render süreçlerinde (Server Components, route handler'lar) ve hook kullanılamayan bileşenlerde (Breadcrumb gibi paylaşılan render bileşenleri) güvenli bir şekilde dil önekini eklemeyi sağlar.

**Parametreler**:
- `url`: `string` — Dil öneki eklenmesi gereken taban yol. Genellikle `/` veya `/dashboard` gibi bir rota yolu olarak verilir.
- `lang`: `string` — Eklenecek dil kodu. Genellikle `tr` veya `en` değerlerinden biri olur.

**Dönüş**: `Route` — Dil öneki eklenmiş veya olduğu gibi bırakılmış güvenli rota dizesi. Dönüş tipi `Route` olarak tip güvenliği sağlanmıştır ve `as Route` ile assert edilerek döndürülür.

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

### [N1_NASIL] AST Pointer: src/utils/routes.ts::assertProductSlug
- **params**: `slug: string`
- **ic_degiskenler**:
  - `uuidRegex` — UUID formatını doğrulan RegExp nesnesi (`/^[0-9a-f]{8}-...$/i`), slug'ın geçerli bir UUID olup olmadığını test etmek için kullanılır
- **Erişimler**:
  - `process.env.NODE_ENV` — Ortam değişkeni okunur, production olup olmadığı kontrol edilir
- **Dönüş**: `string` — slug aynen geri döner; UUID tespit edilirse production'da fallback ile aynı slug döner,非production'da Error fırlatır

---

### [N2_NASIL] AST Pointer: src/utils/routes.ts::Routes.productSlug *(anonim arrow)*
- **params**: `slug: string`
- **ic_degiskenler**:
  - `validSlug` — `assertProductSlug(slug)` çağrısının sonucu; slug'ın doğrulanmış/temizlenmiş hali
- **Cagri**: `assertProductSlug(slug)` → iç fonksiyon çağrısı
- **Cagri**: `encodeURIComponent(validSlug)` → URL-safe encode
- **Dönüş**: `Route` — `/products/{validSlug}` formatında rota stringi

---

### [N3_NASIL] AST Pointer: src/utils/routes.ts::Routes.productList *(anonim arrow)*
- **params**: `params?: { brand?: string, limit?: number }`
- **ic_degiskenler**:
  - `query` — `new URLSearchParams()` instance'ı, query string birleştirmek için kullanılır
  - `qs` — `query.toString()` sonucu; birleştirilmiş query string
- **Dönüş**: `Route` — params yoksa `/products`, varsa `/products?brand=...&limit=...` formatında rota

---

### [N4_NASIL] AST Pointer: src/utils/routes.ts::Routes.productDetail *(anonim arrow)*
- **params**: `idOrSlug: string`
- **ic_degiskenler**: *(yok)*
- **Cagri**: `encodeURIComponent(idOrSlug)` → parametre URL-safe encode edilir
- **Dönüş**: `Route` — boşsa `/products` fallback, doluysa `/products/{idOrSlug}` formatında rota

---

### [N5_NASIL] AST Pointer: src/utils/routes.ts::Routes.categoryPage *(anonim arrow)*
- **params**: `slug: string, subSlug?: string`
- **ic_degiskenler**: *(yok)*
- **Cagri**: `encodeURIComponent(slug)` ve `encodeURIComponent(subSlug)` → her iki parametre URL-safe encode edilir
- **Kosul**: `subSlug && subSlug !== slug && subSlug !== 'undefined'` — subSlug geçerli ve slug'dan farklıysa alt kategori rotası oluşturulur
- **Dönüş**: `Route` — subSlug varsa `/category/{slug}/{subSlug}`, yoksa `/category/{slug}` formatında rota

---

### [N6_NASIL] AST Pointer: src/utils/routes.ts::Routes.brandPage *(anonim arrow)*
- **params**: `slug: string`
- **ic_degiskenler**: *(yok)*
- **Cagri**: `encodeURIComponent(slug)` → parametre URL-safe encode edilir
- **Dönüş**: `Route` — `/brands/{slug}` formatında rota

---

### [N7_NASIL] AST Pointer: src/utils/routes.ts::Routes.paymentSuccess *(anonim arrow)*
- **params**: `orderId?: string, status?: string`
- **ic_degiskenler**:
  - `query` — `new URLSearchParams()` instance'ı, orderId ve status bilgilerini query string'e eklemek için kullanılır
- **Dönüş**: `Route` — orderId yoksa `/payment-success` fallback, varsa `/payment-success?orderId=...&status=...` formatında rota

---

### [N8_NASIL] AST Pointer: src/utils/routes.ts::Routes.login *(anonim arrow)*
- **params**: `redirect?: string, error?: string`
- **ic_degiskenler**:
  - `url` — Sabit login rotası, değeri `'/auth/login'`
  - `params` — `new URLSearchParams()` instance'ı, redirect ve error parametrelerini eklemek için kullanılır
  - `qs` — `params.toString()` sonucu; birleştirilmiş query string
- **Dönüş**: `Route` — params yoksa `/auth/login`, varsa `/auth/login?redirect=...&error=...` formatında rota

---

### [N9_NASIL] AST Pointer: src/utils/routes.ts::localizedHref
- **params**: `url: string, lang: string`
- **ic_degiskenler**: *(yok)*
- **Dönüş**: `Route` — `/admin` veya `/api` ile başlıyorsa url aynen döner; `/tr` veya `/en` ile başlıyorsa url aynen döner; aksi halde `/{lang}{url}` formatında locale prefix eklenmiş rota döner

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