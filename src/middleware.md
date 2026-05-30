---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\middleware.ts
skeleton_hash: 17d96593b201eac7
entity_hashes:
  func:detectLocale: 25418ec7d07f6d80
  func:middleware: 727b020498df2387
  overview: 64f7e17620830c7c
generated_at: 2026-05-30T21:36:03Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin Next.js ara katmanıdır. Gelen tüm HTTP isteklerini rotalama öncesi yakalayarak locale tespiti, kimlik doğrulama, erişim kontrolü ve yönlendirme gibi ön işlemleri merkezi olarak yönetir. Proje genelinde tutarlı istek işleme mantığını tek bir noktadan kontrol ederek security ve kullanıcı deneyimi standartlarını uygular.

## Fonksiyon Grupları
### Dil/Locale Tespiti
Gelen isteklerden kullanıcının tercih ettiği dil ve bölgesel ayarları algılayarak yerelleştirme süreçlerini destekler.
- detectLocale

### Ana Ara Katman İşleyicisi
Tüm gelen istekleri yakalayan, locale tespiti dahil olmak üzere kimlik doğrulama, yetkilendirme ve yönlendirme gibi rota öncesi tüm ön işlemleri koordine eden merkezi fonksiyondur.
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

**Ne yapar**: Bu fonksiyon, Next.js uygulaması için merkezi bir middleware görevi üstlenir. Her isteği işleyerek tenant çözümlenmesi, dil tabanlı yönlendirme, UUID'den slug'a SEO dostu yönlendirme ve admin paneli için rol tabanlı erişim kontrolü (RBAC) işlemlerini gerçekleştirir. Fonksiyon, tüm bu süreçlerin ardından tenant bilgisini çerez olarak yanıt nesnesine ekler.

**Nasıl yapar**: Fonksiyon, isteğin host başlığından tenant'ı çözer ve `x-tenant-id` başlığını ayarlar. Ardından URL'in ilk segmentini analiz ederek dil kodu içerip içermediğini belirler. Dil segmenti varsa ve admin rotasıysa dil olmadan kök `/admin` rotasına yönlendirme yapar. Dil segmenti yoksa ve özel bir rota (admin, api, sitemap, robots) değilse tarayıcı dilini algılayarak dil segmenti eklenmiş bir URL'ye yönlendirme yapar. UUID formatlı ürün identifikasyonları için Supabase üzerinden slug sorgulaması yaparak 308 kalıcı yönlendirme ile SEO uyumlu URL oluşturur. Admin rotaları için Supabase auth kontrolü yaparak kullanıcı girişini ve JWT'deki rol bilgisini doğrular, yetkisiz erişimleri giriş sayfasına veya ana sayfaya yönlendirir.

**Parametreler**:

- `request`: NextRequest — Next.js tarafından middleware'e iletilen HTTP istek nesnesi. İstek başlıkları, URL bilgisi, çerezler ve diğer istek meta verilerini içerir.

**Dönüş**: NextResponse — Middleware sonucunda dönen HTTP yanıt nesnesi. Bu nesne yönlendirme (redirect) veya isteği sonraki aşamaya geçirme (NextResponse.next) işlemiyle oluşturulur. Tüm yanıt nesnelerine `setTenantCookie` fonksiyonu aracılığıyla `tenant_id` çerezi eklenir.

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
- **params**: `(request: NextRequest)` — mevcut HTTP isteği
- **ic_degiskenler**:
  - `cookieLocale` — `request.cookies.get('NEXT_LOCALE')?.value` ile okunan tarayıcı cookie değerinden dil tercihi; 'tr' veya 'en' olup olmadığı kontrol edilir
  - `acceptLang` — `request.headers.get('accept-language') || ''` ile alınan HTTP Accept-Language header'ı; cookie yoksa bu başlıkta 'en' aranarak dil belirlenir
- **Dönüş**: `string` — tespit edilen locale kodu ('tr' veya 'en'); cookie varsa o, yoksa header'dan 'en' içeriği varsa 'en', aksi halde varsayılan 'tr'

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