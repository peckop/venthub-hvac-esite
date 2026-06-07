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
generated_at: 2026-06-07T15:52:28Z
---

## Genel Bakış
Bu modül, Next.js uygulamasında tüm HTTP isteklerini yakalayan ve işleyen merkezi bir middleware bileşenidir. Tenant kimlik çözümlemesi, dil tabanlı yönlendirmeler, SEO uyumlu URL normalleştirmeleri ve admin paneli için

---

## AXIOMS – Mimari Varsayımlar

Bu modül, istek tabanlı dil tespiti ve URL deseni eşleme yapan bir Next.js middleware modülüdür.

---

**[Aksiyom 1 – Geçerli Lokal Kümeleri Tanımlı Olmalı]**: Eğer `LOCALES` sabiti tanımlı değilse veya geçerli bir lokal kümesi içermiyorsa, `detectLocale` fonksiyonunun döndüğü değer `NEXT_LOCALE` cookie'si veya `Accept-Language` header'ı ile eşleşemeyebilir ve fonksiyonun beklenen lokal değerlerinden (`tr`, `en`) birini garantileyemez.

---

**[Aksiyom 2 – NextRequest Nesnesi Geçerli Olmalı]**: Eğer `request` parametresi geçerli bir `NextRequest` nesnesi değilse (örn: `null`, `undefined` veya farklı bir tipteyse), hem `detectLocale` hem de `middleware` fonksiyonu `cookie` ve `headers` erişiminde hata fırlatır.

---

**[Aksiyom 3 – UUID_REGEX Deseni Tanımlı Olmalı]**: Eğer `UUID_REGEX` sabiti tanımlı değilse veya geçerli bir regex ifadesi içermiyorsa, `middleware` fonksiyonunun UUID tabanlı URL eşleme mantığı çalışamaz ve beklenen rotalar tanınamaz.

---

**[Aksiyom 4 – ADMIN_ROLES Tanımlı Olmalı]**: Eğer `ADMIN_ROLES` sabiti tanımlı değilse veya geçerli bir ifade içermiyorsa, middleware içindeki rol bazlı erişim kontrolü (admin sayfaları için) çalışamaz.

---

**[Aksiyom 5 – config Nesnesi Tanımlı Olmalı]**: Eğer `config` nesnesi tanımlı değilse veya Next.js middleware config formatına uymuyorsa (örn: `matcher` alanı eksikse), middleware'in hangi rotalarda tetikleneceği belirsizleşir ve tüm isteklerde veya hiçbir istekte çalışmaz.

---

**[Aksiyom 6 – Cookie Erişilebilirliği]**: Eğer istek cookie'leri içermiyorsa veya tarayıcı/ortam cookie'leri devre dışı bırakmışsa, `detectLocale` fonksiyonu `NEXT_LOCALE` cookie'sinden değer okuyamaz ve doğrudan `Accept-Language` header kontrolüne veya varsayılan locale'e (`tr`) yönelir.

---

**[Aksiyom 7 – Accept-Language Header'ı Opsiyonel]**: Eğer istekte `Accept-Language` header'ı bulunmuyorsa ve ayrıca `NEXT_LOCALE` cookie'si de yoksa veya geçersizse, `detectLocale` varsayılan locale olarak `'tr'` döner. Bu durumda varsayılan dilin Türkçenin olmadığı senaryo desteklenmez.

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
- **params**: `request: NextRequest` — HTTP isteği nesnesi, cookie ve header bilgilerini içerir
- **ic_degiskenler**:
  - `cookieLocale` — `request.cookies.get('NEXT_LOCALE')?.value` ile okunur; tarayıcıda depolanan dil tercihini tutar, 'tr' veya 'en' olup kontrol edilir
  - `acceptLang` — `request.headers.get('accept-language') || ''` ile okunur; tarayıcının dil tercih header'ını tutar, küçük harfe çevrilerek 'en' içerip içermediği kontrol edilir
- **Dönüş**: `string` — `'en'` veya `'tr'` (varsayılan olarak)

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