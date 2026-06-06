---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\middleware.ts
skeleton_hash: 17d96593b201eac7
entity_hashes:
  func:detectLocale: 25418ec7d07f6d80
  func:middleware: fab8e08b31b0004b
  overview: 64f7e17620830c7c
generated_at: 2026-06-06T21:56:12Z
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



---

## FONKSİYON DETAYLARI

### detectLocale

**Ne yapar**: Kullanıcının tercih ettiği dilini (Türkçe veya İngilizce) belirler. Öncelikle cookie değerine, ardından tarayıcı dil tercihine bakarak uygun locale kodunu döndürür.

**Nasıl yapar**: Fonksiyon öncelikle `NEXT_LOCALE` adlı cookie'yi kontrol eder; eğer değeri geçerli bir dil koduysa (`tr` veya `en`) doğrudan bunu kullanır. Cookie'de geçerli bir dil yoksa, isteğin `accept-language` başlığını analiz eder ve İngilizce içeriyorsa `'en'` döndürür. Hiçbir koşul sağlanmazsa varsayılan olarak `'tr'` (Türkçe) değerini döndürür.

**Parametreler**:
- `request`: `NextRequest` — HTTP isteği nesnesi. Cookie değerlerine ve HTTP başlıklarına erişmek için kullanılır.

**Dönüş**: `string` — Belirlenen dil kodu (`'tr'` veya `'en'`).

### middleware
**Ne yapar**: Next.js uygulamasında her isteği yakalayan merkezi middleware fonksiyonudur. Tenant çözümlemesi, dil yönlendirmesi, UUID'den slug'a SEO dostu yönlendirme ve admin paneli için Rol Tabanlı Erişim Kontrolü (RBAC) görevlerini tek bir akışta yürütür.

**Nasıl yapar**: Fonksiyon, isteğin `host` başlığını alarak `resolveTenant` ile tenant'ı belirler ve `x-tenant-id` başlığını isteğe ekler. Ardından URL'in ilk segmentini analiz ederek dil alt dizini (locale) varlığını kontrol eder; dil yoksa kullanıcı tarayıcısının dil tercihine göre algılanan dile 307 yönlendirmesi yapar. Dil içinde admin rotası tespit edilirse locale'siz kök `/admin` rotasına yönlendirir. Yolun `/products/{identifier}` formatında olup UUID_regex'e uyduğunu tespit ettiğinde Supabase üzerinden `slug` sorgulayarak 308 kalıcı yönlendirme üretir. `/admin` rotasına erişimde development ortamı ve localhost kontrolü sonrası Supabase auth claims'inden JWT rolünü okur; rol `ADMIN_ROLES` kümesinde yoksa veya auth başarısızsa uygun hata yönlendirmesi yapar. Her yanıt nesnesine `tenant_id` çerezi eklenerek döndürülür.

**Parametreler**:
- `request`: NextRequest — Gelen HTTP isteği nesnesi. URL bilgileri, başlıklar ve çerezler bu nesne üzerinden okunur.

**Dönüş**: NextResponse — Middleware her durumda bir `NextResponse` nesnesi döndürür. Bu yanıt `NextResponse.next()` ile devam eden bir istek, `NextResponse.redirect()` ile bir yönlendirme veya tenant çerezi set edilmiş bir yanıt olabilir. Her dönen yanıtda `tenant_id` çerezi bulunur.

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
- **params**: `(request: NextRequest)`
- **ic_degiskenler**:
  - `cookieLocale` — `NEXT_LOCALE` çerezinin değerini tutar, dil tercihini belirler
  - `acceptLang` — `accept-language` header değerini tutar, varsayılan boş string
- **Dönüş**: `string` - algılanan dil kodu ('tr' veya 'en')

### [N2_NASIL] AST Pointer: src/middleware.ts::middleware
- **params**: `(request: NextRequest)`
- **ic_degiskenler**:
  - `host` — istek header'ındaki host değerini tutar, varsayılan boş string
  - `tenantId` — `resolveTenant(host)` çağrısından elde edilen kiraci ID'si
  - `setTenantCookie` — anonim fonksiyon, response'a tenant_id çerezini ekler
  - `redirectResponse` — anonim fonksiyon, URL ve status ile redirect response oluşturur
  - `pathname` — `request.nextUrl.pathname` değerinden alınan yol
  - `segments` — pathname'i '/' karakterine göre ayırıp boş olmayan parçaları tutar
  - `firstSegment` — segments dizisinin ilk elemanını tutar
  - `response` — `NextResponse.next()` çağrısıyla oluşturulan temel response nesnesi
  - `locale` — algılanan dil kodunu tutar, başlangıçta `DEFAULT_LOCALE`
  - `effectiveSegments` — segments dizisinin kopyasını tutar, locale offsetsine göre düzenlenir
  - `isLocaleInPath` — firstSegment'in LOCALES dizisinde olup olmadığını tutar (boolean)
  - `supabaseUrl` — `NEXT_PUBLIC_SUPABASE_URL` ortam değişkenini tutar
  - `anonKey` — `NEXT_PUBLIC_SUPABASE_ANON_KEY` ortam değişkenini tutar
  - `identifier` — products rotasında ürün tanımlayıcısını tutar (UUID veya slug)
  - `supabase` — `createServerClient` ile oluşturulan Supabase istemcisi (iki farklı blokta oluşturulur)
  - `data` — Supabase sorgusundan dönen veriyi tutar (products rotasında)
  - `error` — Supabase auth sorgusundan dönen hatayı tutar (admin rotasında)
  - `claims` — JWT claimlerini tutar (admin rotasında)
  - `jwtRole` — JWT'deki user_role değerini tutar (admin rotasında)
  - `loginUrl` — login yönlendirmesi için URL nesnesini tutar (admin rotasında)
  - `homeUrl` — ana sayfa yönlendirmesi için URL nesnesini tutar (admin rotasında)
- **Dönüş**: `NextResponse | void` - middleware sonucu olarak response döner veya void

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