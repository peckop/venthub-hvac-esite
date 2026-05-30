---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\middleware.ts
skeleton_hash: 9fa8fb6e40fdda0f
entity_hashes:
  func:detectLocale: 25418ec7d07f6d80
  func:middleware: f6cf2fc6e14b421a
  overview: 907778dc8cf8e103
generated_at: 2026-05-28T22:38:44Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kaynak kodunda yer alan Next.js ara katman (middleware) dosyasıdır. Gelen tüm HTTP isteklerini hedeflenen rotaya ulaşmadan önce yakalayıp gerekli ön işlemleri gerçekleştirmek amacıyla geliştirilmiştir. Next.js'in standart istek nesnesini kullanarak proje genelinde tutarlı ara katman mantıklarını tek merkezde yönetir.

## Fonksiyon Grupları
### Ana Orta Katman İstek İşleyicisi
Tüm gelen platform isteklerini yakalayan, rotalama öncesi kimlik doğrulama, izin kontrolü, yönlendirme gibi tüm ortak ön işlem adımlarını yürüten tek merkezli fonksiyondur. Projedeki tüm ara katman sorumluluklarını tek bir noktada toplar.
- middleware

---

## AXIOMS – Mimari Varsayımlar
Bu Venthub HVAC projesine ait Next.js ara katman (middleware) modülü, gelen isteklerin doğrulama, yetkilendirme ve yönlendirme işlemlerini gerçekleştirmek için tanımlı sabitlerinin ve Next.js çalışma zamanı bağımlılıklarının varlığını zorunlu kılar.

[Aksiyom 1]: Eğer proje genel yapılandırmalarını içeren sabit `config` nesnesi mevcut değilse, modül rota kuralları, erişim izinleri ve sistem ayarlarına erişemeyeceği için tüm gelen istekler başarısız olur.
[Aksiyom 2]: Eğer kimlik/varlık formatını doğrulamak için tanımlanan `UUID_REGEX` sabiti mevcut değilse, kullanıcı ve kaynak kimliklerinin geçerliliğini kontrol edemeyen modül yetkilendirme işlemlerini yapamaz, bu durum ya yetkisiz erişimlerin açığa çıkmasına ya da meşru kullanıcı isteklerinin yanlışlıkla reddedilmesine neden olur.
[Aksiyom 3]: Eğer yönetici erişimine sahip rolleri içeren `ADMIN_ROLES` koleksiyonu tanımlı değilse, yönetici özelindeki rotalara erişim kontrolleri yapılamaz, ya tüm yönetici istekleri reddedilir ya da tüm kullanıcılar yetki sahibi olmadan yönetici işlevlerine erişebilir.
[Aksiyom 4]: Eğer Next.js framework'ünün `NextRequest` sınıfı modülün çalıştığı çalışma zamanında desteklenmiyorsa, modül gelen isteklerin path, header, sorgu parametresi gibi temel niteliklerini okuyamadığı için hiçbir isteği doğru şekilde işleyemez.

---

## FONKSİYON DETAYLARI

### detectLocale

**Ne yapar**: Kullanıcının tercih ettiği dilini (Türkçe veya İngilizce) belirler. Öncelikle cookie değerine, ardından tarayıcı dil tercihine bakarak uygun locale kodunu döndürür.

**Nasıl yapar**: Fonksiyon öncelikle `NEXT_LOCALE` adlı cookie'yi kontrol eder; eğer değeri geçerli bir dil koduysa (`tr` veya `en`) doğrudan bunu kullanır. Cookie'de geçerli bir dil yoksa, isteğin `accept-language` başlığını analiz eder ve İngilizce içeriyorsa `'en'` döndürür. Hiçbir koşul sağlanmazsa varsayılan olarak `'tr'` (Türkçe) değerini döndürür.

**Parametreler**:
- `request`: `NextRequest` — HTTP isteği nesnesi. Cookie değerlerine ve HTTP başlıklarına erişmek için kullanılır.

**Dönüş**: `string` — Belirlenen dil kodu (`'tr'` veya `'en'`).

### middleware
**Ne yapar**: VentHub HVAC projesinin src dizininde yer alan middleware.ts dosyasında tanımlı, Next.js tabanlı uygulama için orta katman görevi gören fonksiyondur. Uygulamaya gelen tüm istekleri hedef rotaya ulaşmadan önce yakalar, istek üzerinden gerekli tüm ön işlemleri gerçekleştirmek üzere tasarlanmıştır. Genel amaçlı yapılandırması sayesinde kimlik doğrulama, erişim kontrolü, header düzenleme, istek loglama gibi orta katman ihtiyaçlarını karşılamak için kullanılır.
**Nasıl yapar**: Next.js framework'ünün runtime mekanizması tarafından otomatik olarak tetiklenir, uygulama tarafından tanımlanmış rota eşleşme kurallarına uyan istekler için çalıştırılır. Gelen isteği temsil eden NextRequest nesnesini alır, üzerinde tanımlı tüm ön işlem adımlarını sırasıyla yürüttükten sonra bir yanıt nesnesi döndürerek isteğin akışını yönetir. Gerekli durumunda orijinal isteği hedef rota için yönlendirebilir, ya da özel bir yanıt üreterek isteğin rotaya ulaşmasını engelleyebilir.
**Parametreler**:
- name: request — type: NextRequest — Uygulamaya gelen HTTP isteğinin tüm detaylarını barındıran, Next.js tarafından sağlanan standart istek nesnesidir. İsteğin URL'si, HTTP header'ları, çerezleri, sorgu parametreleri ve istemciye ait tüm bilgiler gibi verilere güvenli erişim imkanı sunar.
**Dönüş**: Response — İşlenmiş isteğe ait standart HTTP yanıt nesnesini döndürür. Bu yanıt, orijinal isteğin hedef rotası tarafından oluşturulan doğal yanıt olabileceği gibi, middleware içindeki işlemler sonucunda üretilen özel yönlendirme, hata bildirimi veya erişim engelleme yanıtı da olabilir.

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
  - `cookieLocale` — 'NEXT_LOCALE' çerezinin değeri (varsa 'tr' veya 'en', yoksa undefined)
  - `acceptLang` — 'accept-language' istek başlığının değeri (yoksa boş string)
- **Dönüş**: string (her durumda 'tr' veya 'en' döner)

### [N2_NASIL] AST Pointer: src/middleware.ts::middleware
- **params**: (request: NextRequest)
- **ic_degiskenler**:
  - `pathname` — request'in URL yol adı (örn: '/tr/products/abc123')
  - `segments` — pathname'in '/' ile bölünüp boş olmayan parçaları
  - `firstSegment` — segments'in ilk elemanı (yoksa undefined)
  - `response` — NextResponse nesnesi (ilk olarak NextResponse.next() ile oluşturulur, admin setAll'da güncellenebilir)
  - `locale` — tespit edilen veya varsayılan dil kodu (DEFAULT_LOCALE ile başlatılır)
  - `effectiveSegments` — dil ön eki kaldırılmış segmentler dizisi
  - `isLocaleInPath` — firstSegment'in LOCALES dizisinde olup olmadığı (boolean)
  - `detectedLocale` — detectLocale() çağrısı ile tespit edilen dil (sadece else bloğunda)
  - `url` — farklı bloklarda yeniden yönlendirme için oluşturulan klonlanmış URL (bloklarda farklı scopelarda)
  - `supabaseUrl` — process.env.NEXT_PUBLIC_SUPABASE_URL değeri (undefined olamaz)
  - `anonKey` — process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY değeri (undefined olamaz)
  - `identifier` — products rotasının ikinci segmenti (ürün ID'si)
  - `supabase` — createServerClient ile oluşturulan Supabase istemcisi (products ve admin bloklarında farklı)
  - `host` — istek başlığındaki host değeri (yoksa boş string)
  - `isDev` — process.env.NODE_ENV'in 'development' olup olmadığı (boolean)
  - `isLocalhost` — host'un 'localhost' veya '127.0.0.1' ile başlayıp başlamadığı (boolean)
  - `user` — supabase.auth.getUser() sonucundaki kullanıcı nesnesi (yoksa undefined)
  - `error` — supabase.auth.getUser() hatası (yoksa undefined)
  - `jwtRole` — kullanıcının user_metadata.role değeri (yoksa undefined)
  - `loginUrl` — /auth/login rotasına yönlendirme için oluşturulan URL
  - `homeUrl` – kök rotaya (/) yönlendirme için oluşturulan URL
- **Dönüş**: yok (async fonksiyon, farklı durumlarda NextResponse.redirect veya NextResponse.next() döner)

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