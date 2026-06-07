---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\middleware.ts
skeleton_hash: 26f9b5f9a3ad6c83
entity_hashes:
  func:detectLocale: 5c19d05a4ba76afe
  func:middleware: 40d52344cd7722d0
  overview: 93d9d476cdaf7bfc
generated_at: 2026-06-07T14:02:24Z
---



---



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
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:...`
- **UUID_REGEX** (regex) — `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- **ADMIN_ROLES** (new_expression) — `new Set(['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'])`
- **LOCALES** (as_expression) — `['tr', 'en'] as const`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/middleware.ts::detectLocale
- **params**: `request: NextRequest` — HTTP isteği nesnesi, cookie ve header bilgilerini içerir
- **ic_degiskenler**:
  - `cookieLocale` — `request.cookies.get('NEXT_LOCALE')?.value` ile okunur; tarayıcıda depolanan dil tercihini tutar, 'tr' veya 'en' olup kontrol edilir
  - `acceptLang` — `request.headers.get('accept-language') || ''` ile okunur; tarayıcının dil tercih header'ını tutar, küçük harfe çevrilerek 'en' içerip içermediği kontrol edilir
- **Dönüş**: `string` — `'en'` veya `'tr'` (varsayılan olarak)

---

### [N2_NASIL] AST Pointer: src/middleware.ts::middleware
- **params**: `request: NextRequest` — Next.js middleware'e gelen HTTP isteği
- **ic_degiskenler**:
  - `host` — `request.headers.get('host') || ''` ile okunur; isteğin geldiği domain bilgisi, tenant çözümlemede kullanılır
  - `tenantId` — `resolveTenant(host)` çağrısından dönen `{ tenantId }` destructured değer; kiracının benzersiz tanımlayıcısıdır, header'a ve cookie'ye yazılır
  - `response` — `NextResponse.next({ request: { headers: request.headers } })` ile oluşturulan temel yanıt nesnesi; middleware zincirinin devamını sağlar, birden fazla yerde yeniden atanır
  - `setTenantCookie` — `(res: NextResponse) => NextResponse` tipinde closure; verilen response'a `tenant_id` cookie'sini `path: '/'`, `sameSite: 'lax'`, `secure: process.env.NODE_ENV === 'production'` seçenekleriyle set eder
  - `redirectResponse` — `(url: URL | string, status: number) => NextResponse` tipinde closure; önce `setTenantCookie(response)` çağırarak tenant cookie'sini ekler, ardından `createRedirectResponse(request, url, response, status)` ile yönlendirme yanıtı döner
  - `pathname` — `request.nextUrl.pathname` ile okunur; URL'nin path kısmı (host dahil değil)
  - `segments` — `pathname.split('/').filter(Boolean)` ile elde edilir; URL path'inin '/' ile bölünüp boş elemanları atılmış hali, dil ve rota segmentlerini tutar
  - `firstSegment` — `segments[0]` olarak atanır; URL'nin ilk anlamlı segmenti, dil kodu mu rota mı olduğunu belirlemede kullanılır
  - `locale` — `DEFAULT_LOCALE` olarak başlatılır; geçerli dil kodunu tutar, `isLocaleInPath` true ise `firstSegment` değerine atanır
  - `effectiveSegments` — `[...segments]` ile kopyalanır, `isLocaleInPath` true ise `segments.slice(1)` ile dil prefix'i çıkarılmış segmentler olarak yeniden atanır; rota analizinde dil kodu olmadan kullanılır
  - `isLocaleInPath` — `LOCALES.includes(firstSegment as typeof LOCALES[number])` ile hesaplanır; ilk segmentin bir dil kodu olup olmadığını boolean olarak tutar
  - `detectedLocale` — `detectLocale(request)` çağrısıyla hesaplanır; cookie veya accept-language'den tespit edilen dil kodu; iki farklı blokta local variable olarak kullanılır (admin redirect ve locale enjeksiyonu için)
  - `isAuthApi` — `firstSegment === 'auth' && (segments[1] === 'callback' || segments[1] === 'signout')` ile hesaplanır; isteğin auth callback/signout API rotası olup olmadığını tutar
  - `isSpecialRoute` — admin, api, auth API, sitemap.xml veya robots.txt rotalarından biri olup olmadığını tutar; bu rotalara dil prefix'i eklenmez
  - `supabaseUrl` — `process.env.NEXT_PUBLIC_SUPABASE_URL!` ile okunur; Supabase bağlantı URL'i, client oluşturmada kullanılır
  - `anonKey` — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` ile okunur; Supabase anonim anahtarı, client oluşturmada ve JWT secret fallback'inde kullanılır
  - `identifier` — `effectiveSegments[1]` olarak atanır; products rotasındaki ikinci segment (UUID veya slug olabilir), `UUID_REGEX.test(identifier)` ile UUID olup olmadığı kontrol edilir
  - `supabase` — `createServerClient(supabaseUrl, anonKey, { cookies: {...} })` ile oluşturulan Supabase istemcisi; iki farklı blokta (UUID→slug redirect ve admin RBAC) ayrı ayrı oluşturulur, `cookies.setAll` callback'inde `response` değişkeni yeniden atanır
  - `data` — `supabase.from('products').select('slug').eq('id', identifier).single()` sorgusunun `data` destructured sonucu; ürünün slug değerini tutar, `data?.slug` kontrolü ile UUID→slug yönlendirmesi yapılır
  - `isDev` — `process.env.NODE_ENV === 'development'` ile hesaplanır; geliştirme modu olup olmadığını tutar
  - `isLocalhost` — `host.startsWith('localhost') || host.startsWith('127.0.0.1')` ile hesaplanır; isteğin localhost'tan gelip gelmediğini tutar; `isDev && isLocalhost`条件ında birlikte kullanılır
  - `secret` — `process.env.JWT_CLAIMS_COOKIE_SECRET || anonKey` olarak atanır; JWT claim'leri imzalamak/doğrulamak için kullanılan gizli anahtar
  - `claims` — `await resolveUserClaims(request, response, supabase, secret)` destructured sonucu; kullanıcının JWT claim bilgilerini (user_role dahil) tutar, `claims?.user_role` erişimi yapılır
  - `error` — `resolveUserClaims` destructured sonucu; hata durumunu tutar, `error || !claims` kontrolü ile auth başarısızlığı tespit edilir
  - `jwtRole` — `claims?.user_role` olarak atanır; kullanıcının rol bilgisini tutar, string veya farklı tipte olabilir
  - `roleString` — `typeof jwtRole === 'string' ? jwtRole : ''` ile atanır; `jwtRole`'ün string olduğundan emin olmak için güvenli çevrim; `ADMIN_ROLES.has(roleString.toLowerCase())` kontrolünde kullanılır
  - `loginUrl` — `request.nextUrl.clone()` ile klonlanan URL; login sayfası yönlendirmesi için kullanılır, `pathname` ve `searchParams` (`from`, `reason`) ile mutate edilir
  - `homeUrl` — `request.nextUrl.clone()` ile klonlanan URL; yetkisiz erişim durumunda ana sayfaya yönlendirme için kullanılır, `pathname: '/'` ve `searchParams: auth_error=unauthorized` olarak ayarlanır
- **Dönüş**: `Response` (NextResponse) — yönlendirme yanıtı, cookie set edilmiş base response veya `NextResponse.next()` döner; fonksiyon asenkron olup her dalda farklı bir Response nesnesi döner

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