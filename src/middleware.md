---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\middleware.ts
skeleton_hash: 5e65c9cd5d3a2482
entity_hashes:
  func:detectLocale: 25418ec7d07f6d80
  func:middleware: b40999d29f07691e
  overview: 94128ae24c53fc1c
generated_at: 2026-08-27T13:26:07Z
---

## Genel Bakış
Bu modül, Next.js uygulamasında gelen tüm HTTP isteklerini yöneten merkezi bir middleware bileşenidir. Temel olarak isteklerin dilini tespit ederek uygun yönlendirmeleri yapar, SEO dostu URL normalleştirmelerini yönetir ve admin paneli için erişim kontrolü uygular.

## Fonksiyon Grupları
### Dil Tespiti ve Yönlendirme
Bu grup, isteğin dilini belirleyen ve kullanıcıları doğru dil sürümüne yönlendiren temel dil işlevlerini içerir.
- detectLocale, middleware

### URL Normalleştirme ve Eşleme
Bu grup, istek URL'lerini analiz eden, UUID tabanlı desenleri eşleştiren ve SEO uyumlu yapılandırma kurallarını uygulayan mantığı kapsar.
- middleware

### Erişim Kontrolü ve Koruma
Bu grup, belirli rotalar için kullanıcı rolü kontrolü yapan ve admin gibi korumalı sayfalara erişimi düzenleyen güvenlik işlevlerini barındırır.
- middleware

---

## AXIOMS – Mimari Varsayımlar

Bu modül, dil tespiti ve yönlendirme ile UUID tabanlı URL eşleme ve erişim kontrolü yapan bir Next.js middleware'idir. Aşağıdaki varsayımlar modülün doğru çalışması için zorunludur.

[Aksiyom 1]: Eğer `LOCALES` sabiti tanımlı değilse veya desteklenen dil kodlarını içeren geçerli bir dizi içermiyorsa, `detectLocale` istekten geçerli bir dil tespit edemez ve yönlendirme kararı sağlıklı alınamaz.

[Aksiyom 2]: Eğer `UUID_REGEX` sabiti tanımlı değilse veya geçerli bir düzenli ifade (RegExp) içermiyorsa, `middleware` UUID tabanlı URL desenlerini eşleyemez ve SEO normalleştirmesi çalışamaz.

[Aksiyom 3]: Eğer `request` parametresi `NextRequest` türünde değilse veya `nextUrl` (URL nesnesi), `headers` (HTTP başlıkları) gibi gerekli özelliklere sahip değilse, hem `detectLocale` hem `middleware` fonksiyonları hata ile karşılaşır.

[Aksiyom 4]: Eğer `ADMIN_ROLES` sabiti tanımlı değilse veya geçerli bir rol listesi (dizi/küme) içermiyorsa, admin paneli erişim kontrolü çalışamaz veYetkilendirme kararı verilemez.

[Aksiyom 5]: Eğer `config` nesnesi tanımlı değilse veya yönlendirme/normalleştirme parametrelerini içermiyorsa, middleware yönlendirme ve yapılandırma kararları alamaz.

[Aksiyom 6]: Eğer `LOCALES` boş bir dizi ise, hiçbir dil kodu desteklenmediğinden `detectLocale` herhangi bir eşleşme yapamaz ve istek yönlendirilemez.

---

## FONKSİYON DETAYLARI

### detectLocale
**Ne yapar**: Gelen HTTP isteğinden kullanıcının tercih ettiği dili tespit eder ve `'tr'` ya da `'en'` olarak döndürür. Cookie öncelikli, ardından `accept-language` başlığı kontrol edilir; hiçbir eşleşme bulunamazsa varsayılan olarak Türkçe (`'tr'`) seçilir.

**Nasıl yapar**: Önce isteğin cookie'leri arasından `NEXT_LOCALE` adlı çerezin değerini okur. Eğer bu değer `'tr'` veya `'en'` ise doğrudan o değeri döndürür. Cookie geçerli bir dil içermiyorsa, HTTP istek başlıklarından `accept-language` başlığını alır ve küçük harfe çevirerek `'en'` içerip içermediğini kontrol eder; içeriyorsa `'en'` döndürür. Hiçbir koşul sağlanmazsa varsayılan olarak `'tr'` döner.

**Parametreler**:
- request: NextRequest — Dil tespiti yapılacak olan gelen HTTP isteği nesnesi. Cookie ve başlık bilgilerine erişim sağlar.

**Dönüş**: string — Tespit edilen dil kodu. `'tr'` veya `'en'` değerlerinden birini alır.

### middleware

**Ne yapar**: Next.js uygulamasının tüm isteklerini yakalayan merkezi middleware fonksiyonudur. Tenant (kiracı) tespiti, dil tabanlı URL yönlendirmeleri, UUID'den slug'a SEO uyumlu yönlendirmeler ve admin paneli için RBAC (Rol Tabanlı Erişim Kontrolü) koruması gibi çok katmanlı bir istek filtreleme ve yönlendirme mekanizmasını yönetir.

**Nasıl yapar**: Fonksiyonun çalışma mantığı sırasıyla şu adımlardan oluşur: Önce `host` başlığından tenant kimliği çözümlenir ve `x-tenant-id` istek başlığına eklenir. Ardından URL'nin ilk segmenti incelenerek dil (locale) kontrolü yapılır — eğer ilk segment desteklenen dillerden biriyse dil alt dizin olarak kabul edilir ve admin rotası haricinde normal akışa devam edilir; değilse ve rota özel bir rota (admin, API, auth callback, sitemap, robots.txt) değilse, tespit edilen dile göre 307 yönlendirmesi gönderilir. Son olarak, dil segmenti çıkarılmış `effectiveSegments` kullanılarak iki ana dal ele alınır: (1) Ürün UUID'den slug'a 308 yönlendirmesi için Supabase'den sorgulama yapılır, (2) Admin rotaları için JWT claims üzerinden rol doğrulaması gerçekleştirilir ve yetkisiz kullanıcılar oturum sayfasına yönlendirilir. Tüm süreç boyunca `setTenantCookie` ve `redirectResponse` yardımcı fonksiyonları kullanılarak yanıt nesneleri tutarlı şekilde oluşturulur.

**Parametreler**:
- `request`: `NextRequest` — Next.js tarafından middleware'e iletilen HTTP istek nesnesi. İstek başlıkları, URL'si, çerezleri ve diğer meta bilgileri içerir. Fonksiyon bu nesne üzerinden okuma yapar ve yanıt oluştururken header'ları korur.

**Dönüş**: `NextResponse` — Fonksiyon her durumda bir `NextResponse` nesnesi döndürür. Bu yanıt bir yönlendirme (redirect, 302/307/308), normal devam yanıtı (`NextResponse.next()`) veya tenant cookie'si set edilmiş bir yanıt olabilir. Yanıtın `cookies` ve `headers` alanları, istek zincirinin sürekliliğini sağlamak üzere kopyalanır.

---

## İTHALATLAR (IMPORTS)
- import: ./lib/tenantResolver::resolveTenant
- import: ./utils/routes::Routes
- import: @/utils/router::createRedirectResponse
- import: @/utils/router::resolveUserClaims
- import: @supabase/ssr::createServerClient
- import: next/server::NextResponse
- import: next/server::type { NextRequest }

---

## SABİTLER
- **config** (object) — `{
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|...`
- **UUID_REGEX** (regex) — `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- **ADMIN_ROLES** (new_expression) — `new Set(['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'])`
- **LOCALES** (as_expression) — `['tr', 'en'] as const`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/middleware.ts::detectLocale
- **params**: `request: NextRequest`
- **ic_degiskenler**:
  - `cookieLocale` — `request.cookies.get('NEXT_LOCALE')?.value` ile alınan çerez değeri; `'tr'` veya `'en'` ise doğrudan döndürülür
  - `acceptLang` — `request.headers.get('accept-language') || ''` ile alınan Accept-Language başlığı; `'en'` içeriyorsa `'en'` döndürülür
- **Dönüş**: `string` — `'tr'` veya `'en'`

### [N2_NASIL] AST Pointer: src/middleware.ts::middleware
- **params**: `request: NextRequest`
- **ic_degiskenler**:
  - `host` — `request.headers.get('host') || ''` ile alınan Host başlığı; kiracı çözümleme ve localhost kontrolü için kullanılır
  - `tenantId` — `resolveTenant(host)` çağrısından dönen kiracı kimliği; `x-tenant-id` başlığına ve `tenant_id` çerezine yazılır
  - `response` — `NextResponse.next({ request: { headers: request.headers } })` ile oluşturulan temel yanıt nesnesi; çerez ve başlık eklemelerinde kullanılır
  - `setTenantCookie` — `(res: NextResponse) => NextResponse` tipinde iç fonksiyon; verilen yanıt nesnesine `tenant_id` çrezi ekler (`path: '/'`, `sameSite: 'lax'`, `secure` ortama bağlı)
  - `redirectResponse` — `(url: URL | string, status: number) => NextResponse` tipinde iç fonksiyon; önce `setTenantCookie` çağırır, ardından `createRedirectResponse` ile yönlendirme yanıtı üretir
  - `pathname` — `request.nextUrl.pathname` ile alınan URL yolu
  - `segments` — `pathname.split('/').filter(Boolean)` ile elde edilen yol parçaları dizisi
  - `firstSegment` — `segments[0]` ile alınan ilk yol parçası
  - `locale` — dil değişkeni; `DEFAULT_LOCALE` ile başlatılır, yol içinde dil öneki varsa `firstSegment` atanır
  - `effectiveSegments` — `[...segments]` ile oluşturulan kopya dizi; dil öneki varsa `segments.slice(1)` atanır
  - `isLocaleInPath` — `LOCALES.includes(firstSegment)` ile hesaplanan boolean; yolun geçerli bir dil öneki içerip içermediğini belirtir
  - `isAuthApi` — `firstSegment === 'auth' && (segments[1] === 'callback' || segments[1] === 'signout')` koşulu; auth API rotalarını tanımlar
  - `isSpecialRoute` — `firstSegment === 'admin' || firstSegment === 'api' || isAuthApi || pathname.endsWith('sitemap.xml') || pathname.endsWith('robots.txt')` koşulu; dil yönlendirmesi atlanacak özel rotaları belirtir
  - `detectedLocale` — `detectLocale(request)` çağrısından dönen dil değeri; dil öneki olmayan rotalarda yönlendirme için kullanılır
  - `url` — `request.nextUrl.clone()` ile oluşturulan klonlanmış URL nesnesi; yönlendirme hedefi olarak kullanılır (birden fazla yerde yeniden atanır)
  - `supabaseUrl` — `process.env.NEXT_PUBLIC_SUPABASE_URL!` ile alınan Supabase proje URL'si
  - `anonKey` — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` ile alınan anonim anahtar
  - `identifier` — `effectiveSegments[1]` ile alınan ürün tanımlayıcısı; UUID ise slug'a yönlendirme yapılır
  - `supabase` — `createServerClient(supabaseUrl, anonKey, { cookies: { getAll, setAll } })` ile oluşturulan Supabase istemcisi; cookie yönetimi `request.cookies` ve `response` üzerinden yapılır
  - `data` — `supabase.from('products').select('slug').eq('id', identifier).single()` sorgusundan dönen veri; `data?.slug` varsa 308 yönlendirmesi yapılır
  - `isDev` — `process.env.NODE_ENV === 'development'` kontrolü
  - `isLocalhost` — `host.startsWith('localhost') || host.startsWith('127.0.0.1')` kontrolü; yerel geliştirme ortamında auth bypass için kullanılır
  - `claimsSecret` — `process.env.JWT_CLAIMS_COOKIE_SECRET` ile alınan JWT çerez sırrı; üretim ortamında tanımlı değilse admin erişimi reddedilir (fail-closed)
  - `secret` — `claimsSecret || 'dev-only-insecure-claims-cache-key'` ile belirlenen nihai sır; `resolveUserClaims`'e iletilir
  - `claims` — `resolveUserClaims(request, response, supabase, secret)` çağrısından dönen kullanıcı talepleri nesnesi
  - `error` — `resolveUserClaims` çağrısından dönen hata; varsa login sayfasına `reason=expired` parametresiyle yönlendirilir
  - `jwtRole` — `claims?.user_role` ile alınan kullanıcı rolü değeri
  - `roleString` — `typeof jwtRole === 'string' ? jwtRole : ''` ile elde edilen rol dizesi; `ADMIN_ROLES` setinde kontrol edilir
  - `loginUrl` — `request.nextUrl.clone()` ile oluşturulan giriş sayfası URL'si; `/{detectedLocale}/auth/login` yoluna `from` ve opsiyonel `reason` parametreleri eklenir
  - `detectedLocale` — admin rotasında `detectLocale(request)` ile algılanan dil; login yönlendirmesi için kullanılır
  - `homeUrl` — `request.nextUrl.clone()` ile oluşturulan ana sayfa URL'si; yetkisiz erişimde `'/'` yoluna `auth_error=unauthorized` parametresi eklenir
  - `misconfigUrl` — `request.nextUrl.clone()` ile oluşturulan yapılandırma hatası URL'si; `'/'` yoluna `auth_error=server_misconfigured` parametresi eklenir
- **Dönüş**: yok — yan etkilerle çalışır: `response` nesnesine çerezler ve başlıklar ekler, `NextResponse.redirect` döndürür veya `setTenantCookie(response)` ile devam eder

### [N3_NASIL] AST Pointer: src/middleware.ts::setAll (UUID→Slug bloğundaki Supabase cookie callback)
- **params**: `cookiesToSet`, `headers`
- **ic_degiskenler**:
  - `name` — `cookiesToSet.forEach` içindeki her çerez nesnesinin adı
  - `value` — `cookiesToSet.forEach` içindeki her çerez nesnesinin değeri
  - `options` — `cookiesToSet.forEach` içindeki her çerez nesnesinin seçenekleri
  - `key` — `Object.entries(headers)` içindeki başlık anahtarı
  - `value` — `Object.entries(headers)` içindeki başlık değeri
- **Dönüş**: yok — `request.cookies` ve `response` nesneleri üzerinde çerez/başlık eklemesi yapar

### [N4_NASIL] AST Pointer: src/middleware.ts::setAll (Admin RBAC bloğundaki Supabase cookie callback)
- **params**: `cookiesToSet`, `headers`
- **ic_degiskenler**:
  - `name` — `cookiesToSet.forEach` içindeki her çerez nesnesinin adı
  - `value` — `cookiesToSet.forEach` içindeki her çerez nesnesinin değeri
  - `options` — `cookiesToSet.forEach` içindeki her çerez nesnesinin seçenekleri
  - `key` — `Object.entries(headers)` içindeki başlık anahtarı
  - `value` — `Object.entries(headers)` içindeki başlık değeri
- **Dönüş**: yok — `request.cookies` ve `response` nesneleri üzerinde çerez/başlık eklemesi yapar

---

## NODE ID STANDARD

  file: src\middleware.ts
  function: src\middleware.ts::detectLocale
  function: src\middleware.ts::middleware

---

## DISA AKTARILANLAR (EXPORTS)
  export: config
  export: detectLocale
  export: middleware