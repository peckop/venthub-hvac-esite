---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\middleware.ts
skeleton_hash: 17d96593b201eac7
entity_hashes:
  func:detectLocale: 25418ec7d07f6d80
  func:middleware: 869802a18899b914
  overview: 64f7e17620830c7c
generated_at: 2026-06-07T11:02:59Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin Next.js ara katmanıdır ve tüm HTTP isteklerini rota öncesinde yakalayarak merkezi bir işlerlik sağlar. Dil tespiti, JWT tabanlı kimlik doğrulama ve erişim kontrolü gibi ön işlemleri koordineli bir şekilde yöneterek proje genelinde tutarlı ve güvenli bir kullanıcı deneyimi sunar.

## Fonksiyon Grupları

### Dil/Locale Tespiti
Gelen isteklerin başlıkları ve çerezleri analiz edilerek kullanıcının tercih ettiği dil ve bölgesel ayarlar otomatik olarak belirlenir.
- detectLocale

### Güvenlik ve Kimlik Doğrulama
JWT tabanlı token çözümleme ve kimlik doğrulama gibi güvenlik önlemlerini uygulayan yardımcı işlevleri barındırır.
- decodeJwt

### Merkezi Koordinasyon
Tüm gelen istekleri yakalayan ana işleyici; dil tespiti, kimlik doğrulama ve yetkilendirme gibi süreçleri sırayla ve koordineli olarak yürütür.
- middleware

---

## AXIOMS – Mimari Varsayımlar

Bu modül, HTTP isteklerini işleyen bir Next.js ara katmanıdır ve locale tespiti ile erişim kontrolü sağlar.

[Aksiyom 1]: Eğer `detectLocale` fonksiyonuna geçerli bir `NextRequest` nesnesi sağlanmazsa, locale tespiti başarısız olur ve varsayılan bir locale kullanılmalıdır.

[Aksiyom 2]: Eğer tespit edilen locale değeri `LOCALES` kümesinde yer almazsa, istemci için geçersiz bir dil tercihi işlenir ve uygulama tanımlı bir fallback locale'a dönmelidir.

[Aksiyom 3]: Eğer `middleware` fonksiyonuna geçerli bir `NextRequest` nesnesi sağlanmazsa, middleware zinciri kırılır ve istek işlenmeden reddedilir.

[Aksiyom 4]: Eğer istekteki kullanıcının rolü `ADMIN_ROLES` kümesinde tanımlırollerden biri değilse, admin-only rotalara erişim engellenir.

[Aksiyom 5]: Eğer rotada parametre olarak beklenen değer `UUID_REGEX` kalıbına uymazsa, UUID tabanlı rota eşleştirmesi başarısız olur.

[Aksiyom 6]: Eğer `config` nesnesi tanımlı değilse veya geçerli bir Next.js middleware config yapısına sahip değilse, middleware başarıyla register edilmez ve hiçbir istek işlenmez.

---

## FONKSİYON DETAYLARI

### detectLocale

**Ne yapar**: Kullanıcının tercih ettiği dilini (Türkçe veya İngilizce) belirler. Öncelikle cookie değerine, ardından tarayıcı dil tercihine bakarak uygun locale kodunu döndürür.

**Nasıl yapar**: Fonksiyon öncelikle `NEXT_LOCALE` adlı cookie'yi kontrol eder; eğer değeri geçerli bir dil koduysa (`tr` veya `en`) doğrudan bunu kullanır. Cookie'de geçerli bir dil yoksa, isteğin `accept-language` başlığını analiz eder ve İngilizce içeriyorsa `'en'` döndürür. Hiçbir koşul sağlanmazsa varsayılan olarak `'tr'` (Türkçe) değerini döndürür.

**Parametreler**:
- `request`: `NextRequest` — HTTP isteği nesnesi. Cookie değerlerine ve HTTP başlıklarına erişmek için kullanılır.

**Dönüş**: `string` — Belirlenen dil kodu (`'tr'` veya `'en'`).

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
    // Statik varlıklar dışındaki tüm istekleri dinle
    '...`
- **UUID_REGEX** (regex) — `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- **ADMIN_ROLES** (new_expression) — `new Set(['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'])`
- **LOCALES** (as_expression) — `['tr', 'en'] as const`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/middleware.ts::detectLocale
- **params**: (request: NextRequest)
- **ic_degiskenler**: 
  - `cookieLocale` — request'ten alınan 'NEXT_LOCALE' çerez değeri, dil tercihini belirler
  - `acceptLang` — request'ten alınan 'accept-language' başlık değeri, tarayıcı dil tercihini belirler
- **Dönüş**: string (Algılanan dil kodu: 'tr' veya 'en')

### [N2_NASIL] AST Pointer: src/middleware.ts::middleware
- **params**: (request: NextRequest)
- **ic_degiskenler**:
  - `host` — request'ten alınan 'host' başlık değeri, tenant çözümleme için kullanılır
  - `tenantId` — resolveTenant(host) çağrısından elde edilen kiracı ID'si
  - `setTenantCookie` — Inner function: NextResponse'a 'tenant_id' çerezini ayarlar
  - `redirectResponse` — Inner function: URL'e yönlendirme yanıtı oluşturur, tenant çerezini ve mevcut çerezleri/ başlıkları kopyalar
  - `pathname` — request.nextUrl.pathname, istek yol adı
  - `segments` — pathname'i '/' ile bölüp boş olanları filtreleyerek elde edilen yol segmentleri dizisi
  - `firstSegment` — segments[0], ilk yol segmenti
  - `response` — NextResponse.next() ile oluşturulan başlangıç yanıtı
  - `locale` — Başlangıçta DEFAULT_LOCALE, sonradan algılanan dil ile güncellenen dil kodu
  - `effectiveSegments` — Dil segmenti varsa onu çıkarılmış yol segmentleri dizisi
  - `isLocaleInPath` — firstSegment'in LOCALES dizisinde olup olmadığını kontrol eden boolean
  - `isAuthApi` — auth API rotası olup olmadığını kontrol eden boolean (auth/callback veya auth/signout)
  - `isSpecialRoute` — Admin, API, auth API veya sitemap/robots rotası olup olmadığını kontrol eden boolean
  - `detectedLocale` — detectLocale(request) çağrısı ile belirlenen dil (sadece locale redirect durumunda)
  - `identifier` — effectiveSegments[1], products rotasında UUID/_slug tanımlayıcısı
  - `supabase` (products bloğu) — createServerClient ile oluşturulan Supabase istemcisi (products UUID araması için)
  - `data` (products bloğu) — supabase.from('products').select('slug').eq('id', identifier).single() sorgusunun sonucu
  - `isDev` — process.env.NODE_ENV === 'development' kontrolü ile belirlenen development ortamı boolean'ı
  - `isLocalhost` — host'un localhost veya 127.0.0.1 ile başlayıp başlamadığını kontrol eden boolean
  - `supabase` (admin bloğu) — createServerClient ile oluşturulan Supabase istemcisi (admin RBAC için)
  - `data` (admin bloğu) — supabase.auth.getClaims() çağrısının sonucu
  - `error` — supabase.auth.getClaims() çağrısında oluşabilecek hata nesnesi
  - `claims` — data?.claims, JWT claim verileri
  - `jwtRole` — claims?.user_role, JWT'den alınan kullanıcı rolü
- **Dönüş**: yok (void) — Fonksiyon yan etki olarak NextResponse döndürür veya yönlendirme yapar

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