---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\middleware.ts
skeleton_hash: b384cc334926dde6
entity_hashes:
  func:detectLocale: 5c19d05a4ba76afe
  func:middleware: 40d52344cd7722d0
  overview: 94128ae24c53fc1c
generated_at: 2026-06-08T10:10:58Z
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

**Ne yapar**: HTTP isteğinden kullanıcı tercihine uygun dil kodunu (`tr` veya `en`) tespit eder. Sırasıyla cookie değerini, ardından `Accept-Language` header'ını kontrol eder; hiçbir eşleşme bulunamazsa varsayılan olarak `'tr'` döner.

**Nasıl yapar**: Öncelikle `NEXT_LOCALE` adlı cookie'den bir dil tercihi okumaya çalışır. Eğer cookie `'tr'` veya `'en'` değerlerinden birine sahipse doğrudan o değeri döner. Cookie'de geçerli bir değer yoksa `Accept-Language` header'ının küçük harfe çevrilmiş halinde `'en'` alt dizesi aranır; bulunursa `'en'`, aksi halde `'tr'` döner. Bu stratejiyle hem tercih bildiren hem de bildirmeyen kullanıcılar için makul bir dil belirlenir.

**Parametreler**:
- `request`: NextRequest — Üzerinden cookie ve header değerlerine erişilen Next.js HTTP istek nesnesi. Fonksiyon bu nesnenin `cookies` ve `headers` API'lerini kullanarak dil bilgisini çıkarır.

**Dönüş**: `string` — Tespit edilen dil kodu. Geçerli değerler `'tr'` veya `'en'` formatındadır.

### middleware

**Ne yapar**: Next.js uygulamasının tüm isteklerini yakalayan merkezi middleware fonksiyonudur. Tenant (kiracı) tespiti, dil tabanlı URL yönlendirmeleri, UUID'den slug'a SEO uyumlu yönlendirmeler ve admin paneli için RBAC (Rol Tabanlı Erişim Kontrolü) koruması gibi çok katmanlı bir istek filtreleme ve yönlendirme mekanizmasını yönetir.

**Nasıl yapar**: Fonksiyonun çalışma mantığı sırasıyla şu adımlardan oluşur: Önce `host` başlığından tenant kimliği çözümlenir ve `x-tenant-id` istek başlığına eklenir. Ardından URL'nin ilk segmenti incelenerek dil (locale) kontrolü yapılır — eğer ilk segment desteklenen dillerden biriyse dil alt dizin olarak kabul edilir ve admin rotası haricinde normal akışa devam edilir; değilse ve rota özel bir rota (admin, API, auth callback, sitemap, robots.txt) değilse, tespit edilen dile göre 307 yönlendirmesi gönderilir. Son olarak, dil segmenti çıkarılmış `effectiveSegments` kullanılarak iki ana dal ele alınır: (1) Ürün UUID'den slug'a 308 yönlendirmesi için Supabase'den sorgulama yapılır, (2) Admin rotaları için JWT claims üzerinden rol doğrulaması gerçekleştirilir ve yetkisiz kullanıcılar oturum sayfasına yönlendirilir. Tüm süreç boyunca `setTenantCookie` ve `redirectResponse` yardımcı fonksiyonları kullanılarak yanıt nesneleri tutarlı şekilde oluşturulur.

**Parametreler**:
- `request`: `NextRequest` — Next.js tarafından middleware'e iletilen HTTP istek nesnesi. İstek başlıkları, URL'si, çerezleri ve diğer meta bilgileri içerir. Fonksiyon bu nesne üzerinden okuma yapar ve yanıt oluştururken header'ları korur.

**Dönüş**: `NextResponse` — Fonksiyon her durumda bir `NextResponse` nesnesi döndürür. Bu yanıt bir yönlendirme (redirect, 302/307/308), normal devam yanıtı (`NextResponse.next()`) veya tenant cookie'si set edilmiş bir yanıt olabilir. Yanıtın `cookies` ve `headers` alanları, istek zincirinin sürekliliğini sağlamak üzere kopyalanır.

---

## SABİTLER
- **config** (object) — `{
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*...`
- **UUID_REGEX** (regex) — `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- **ADMIN_ROLES** (new_expression) — `new Set(['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'])`
- **LOCALES** (as_expression) — `['tr', 'en'] as const`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/middleware.ts::detectLocale
- **params**: (request: NextRequest)
- **ic_degiskenler**: 
  - `cookieLocale` — `request.cookies.get('NEXT_LOCALE')?.value` ifadesinden elde edilen dil tercihi değeridir. 'tr' veya 'en' ise doğrudan kullanılır.
  - `acceptLang` — `request.headers.get('accept-language')` header'ından gelen dil tercihi stringidir, yoksa boş string olarak alınır.
- **Dönüş**: string (hangi dilin kullanılacağını belirler)

### [N2_NASIL] AST Pointer: src/middleware.ts::middleware
- **params**: (request: NextRequest)
- **ic_degiskenler**: 
  - `host` — `request.headers.get('host')` ifadesinden alınan HTTP host header'ı, tenant çözümleme için kullanılır.
  - `tenantId` — `resolveTenant(host)` çağrısı ile elde edilen kiracı identifier'ı, istek header'ına ve cookie'ye eklenir.
  - `response` — `NextResponse.next()` ile oluşturulan temel yanıt nesnesi, middleware süreç boyunca modificar edilir.
  - `setTenantCookie` — Inner function, `response` nesnesine `tenant_id` cookie'sini ekler ve yanıt döner.
  - `redirectResponse` — Inner function, `createRedirectResponse` kullanarak yönlendirme yanıtını oluşturur, önce `setTenantCookie` çağırır.
  - `pathname` — `request.nextUrl.pathname` ifadesinden alınan isteğin URL path'i, yönlendirme mantığında kullanılır.
  - `segments` — `pathname.split('/').filter(Boolean)` ile oluşturulmuş path segmentleri dizisi.
  - `firstSegment` — `segments[0]` ifadesinden elde edilen ilk path segmenti, dil kontrolü ve yönlendirme için kullanılır.
  - `locale` — Varsayılan dil (`DEFAULT_LOCALE`) olarak başlatılır, path'te dil belirtilmişse güncellenir.
  - `effectiveSegments` — `segments` dizisinin kopyası, dil segmenti kaldırılmış hali (gerekirse).
  - `isLocaleInPath` — `firstSegment`'in `LOCALES` dizisi içinde olup olmadığını kontrol eden boolean.
  - `isAuthApi` — `auth/callback` veya `auth/signout` rotası olup olmadığını belirleyen boolean.
  - `isSpecialRoute` — `admin`, `api`, auth API'leri veya statik dosyalar (sitemap.xml, robots.txt) için boolean.
  - `detectedLocale` — `detectLocale(request)` çağrısı ile tespit edilen dil, locale enjeksiyonu için kullanılır.
  - `supabaseUrl` — `process.env.NEXT_PUBLIC_SUPABASE_URL` ortam değişkeninden alınan Supabase URL'i.
  - `anonKey` — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` ortam değişkeninden alınan Supabase anonim anahtarı.
  - `identifier` — `effectiveSegments[1]` ifadesinden elde edilen ürün identifikatörü (UUID kontrolü yapılır).
  - `data` — Supabase `products` tablosundan `slug` alanını seçen sorgudan dönen veri (UUID→SEO slug yönlendirmesi için).
  - `error` — UUID slug lookup sırasında oluşan hata, yakalanıp loglanır.
  - `isDev` — `process.env.NODE_ENV === 'development'` kontrolünden elde edilen boolean.
  - `isLocalhost` — `host`'un `localhost` veya `127.0.0.1` ile başlayıp başlamadığını kontrol eden boolean.
  - `secret` — `process.env.JWT_CLAIMS_COOKIE_SECRET` veya `anonKey` kullanılarak oluşturulan JWT gizli anahtarı.
  - `claims` — `resolveUserClaims()` çağrısı ile elde edilen kullanıcı claim'leri (role bilgisi içerir).
  - `error` — `resolveUserClaims()` çağrısından dönen hata nesnesi.
  - `jwtRole` — `claims?.user_role` ifadesinden elde edilen kullanıcı rolü (string veya undefined).
  - `roleString` — `jwtRole`'ün string olduğundan emin olmak için dönüştürülmüş hali.
  - `loginUrl` — Yetki hatası durumunda yönlendirilecek giriş sayfası URL'i.
  - `homeUrl` — Yetkisiz erişim durumunda yönlendirilecek ana sayfa URL'i.
- **Dönüş**: yok (NextResponse nesnesi yan etki olarak döner)

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