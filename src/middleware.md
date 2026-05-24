---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\middleware.ts
skeleton_hash: d12b2fcb776c1189
generated_at: 2026-05-23T22:33:17Z
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

## FONKSIYON DETAYLARI

### middleware
**Ne yapar**: VentHub HVAC projesinin src dizininde yer alan middleware.ts dosyasında tanımlı, Next.js tabanlı uygulama için orta katman görevi gören fonksiyondur. Uygulamaya gelen tüm istekleri hedef rotaya ulaşmadan önce yakalar, istek üzerinden gerekli tüm ön işlemleri gerçekleştirmek üzere tasarlanmıştır. Genel amaçlı yapılandırması sayesinde kimlik doğrulama, erişim kontrolü, header düzenleme, istek loglama gibi orta katman ihtiyaçlarını karşılamak için kullanılır.
**Nasıl yapar**: Next.js framework'ünün runtime mekanizması tarafından otomatik olarak tetiklenir, uygulama tarafından tanımlanmış rota eşleşme kurallarına uyan istekler için çalıştırılır. Gelen isteği temsil eden NextRequest nesnesini alır, üzerinde tanımlı tüm ön işlem adımlarını sırasıyla yürüttükten sonra bir yanıt nesnesi döndürerek isteğin akışını yönetir. Gerekli durumunda orijinal isteği hedef rota için yönlendirebilir, ya da özel bir yanıt üreterek isteğin rotaya ulaşmasını engelleyebilir.
**Parametreler**:
- name: request — type: NextRequest — Uygulamaya gelen HTTP isteğinin tüm detaylarını barındıran, Next.js tarafından sağlanan standart istek nesnesidir. İsteğin URL'si, HTTP header'ları, çerezleri, sorgu parametreleri ve istemciye ait tüm bilgiler gibi verilere güvenli erişim imkanı sunar.
**Dönüş**: Response — İşlenmiş isteğe ait standart HTTP yanıt nesnesini döndürür. Bu yanıt, orijinal isteğin hedef rotası tarafından oluşturulan doğal yanıt olabileceği gibi, middleware içindeki işlemler sonucunda üretilen özel yönlendirme, hata bildirimi veya erişim engelleme yanıtı da olabilir.

---

## SABİTLER
- **config** (object) — `{
  matcher: ['/products/:path*', '/admin/:path*']
}`
- **UUID_REGEX** (regex) — `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- **ADMIN_ROLES** (new_expression) — `new Set(['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'])`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\middleware.ts::middleware
- **params**: [request: NextRequest]
- **ic_degiskenler**:
  - `request.nextUrl` — isteğin URL nesnesi, yol ve parametreleri okumak için kullanılır
  - `pathname` — request.nextUrl'den çıkarılan istek yolu parçası
  - `segments` — pathname'i / ile ayırıp boş değerleri filtreleyen yol segmentleri dizisi
  - `segments[0]` — segments dizisinin ilk elemanı, yolun ilk katmanını (products/admin vb.) belirtmek için kullanılır
  - `segments[1]` — segments dizisinin ikinci elemanı, /products/ altındaki tanımlayıcıyı tutar
  - `request.headers` — isteğin başlıkları, yanıt oluştururken aktarılır
  - `response` — NextResponse tarafından oluşturulan varsayılan izin yanıtı, yetkilendirmeler geçerse döndürülür
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` — ortam değişkeninden alınan Supabase proje URL'i
  - `supabaseUrl` — process.env'den alınan Supabase URL'i, istemci oluşturmak için kullanılır
  - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` — ortam değişkeninden alınan Supabase anonim anahtarı
  - `anonKey` — process.env'den alınan anonim anahtar, Supabase istemcisi oluşturmak için kullanılır
  - `UUID_REGEX` — tanımlayıcının UUID formatında olup olmadığını kontrol etmek için kullanılan regex
  - `identifier` — /products/ altındaki segment değeri, UUID kontrolüne tabi tutulur
  - `createServerClient` — Supabase sunucu istemcisi oluşturmak için kullanılan fonksiyon
  - `request.cookies.getAll()` — istekteki tüm çerezleri getiren metod, Supabase istemcisine aktarılır
  - `supabase` (UUID yönlendirme bloğunda) — SEO yönlendirmesi için oluşturulan salt okunur Supabase istemcisi
  - `data` — Supabase ürün sorgusundan dönen veri, içindeki slug değeri yönlendirme için kullanılır
  - `data?.slug` — ürün verisindeki slug alanı, varsa yönlendirme tetiklenir
  - `request.nextUrl.clone()` — orijinal URL'i kopyalayan metod, yönlendirme URL'i oluşturmak için kullanılır
  - `url` — UUID'den sluga yönlendirme için oluşturulan URL nesnesi
  - `Routes.product(data.slug)` — rota yardımcısı ile slug'dan ürün sayfası yolu oluşturan fonksiyon
  - `error` (try-catch bloğundaki) — UUID slug araması sırasında oluşan hatayı tutan değişken
  - `console.error` — hatayı konsola loglayan metod
  - `request.headers.get('host')` — istek başlığından host bilgisini alan metod
  - `host` — sunucu host adı, localhost olup olmadığını kontrol etmek için kullanılır
  - `process.env.NODE_ENV` — ortam değişkeninden alınan çalışma ortamı değeri
  - `isDev` — uygulamanın geliştirme ortamında olup olmadığını belirten boolean
  - `isLocalhost` — host'un localhost/127.0.0.1 ile başlayıp başlamadığını kontrol eden boolean
  - `supabase` (admin RBAC bloğunda) — oturum senkronizasyonu için oluşturulan tam yetkili Supabase istemcisi
  - `supabase.auth.getUser()` — oturum açmış kullanıcıyı getiren Supabase auth metodu
  - `user` — dönen kullanıcı nesnesi, yetkilendirme kontrollerinde kullanılır
  - `error` (auth bloğundaki) — kullanıcı getirilirken oluşan hatayı tutan değişken
  - `loginUrl` — yetkisiz kullanıcıları girişe yönlendirmek için oluşturulan URL nesnesi
  - `loginUrl.searchParams.set('from', pathname)` — giriş sonrası dönülecek yolu ayarlayan metod
  - `loginUrl.searchParams.set('reason', 'expired')` — oturum süresi dolduysa hata nedenini ayarlayan metod
  - `user.user_metadata` — kullanıcı meta verileri, rol bilgisini içerir
  - `jwtRole` — kullanıcı meta verilerinden alınan JWT'deki rol değeri
  - `ADMIN_ROLES` — yetkili admin rollerini içeren Set nesnesi, erişim kontrolünde kullanılır
  - `jwtRole.toLowerCase()` — rol değerini küçük harfe çeviren metod, duyarsız kontrol için kullanılır
  - `homeUrl` — yetkisiz erişimde ana sayfaya yönlendirmek için oluşturulan URL nesnesi
  - `homeUrl.searchParams.set('auth_error', 'unauthorized')` — yetkisiz erişim hata parametresini ayarlayan metod
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\middleware.ts::getAll
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `request.cookies.getAll()` — isteğe ait tüm çerezleri getiren metod, Supabase istemcisine çerezleri aktarmak için kullanılır
- **Dönüş**: İstek çerezleri listesi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\middleware.ts::setAll
- **params**: [cookiesToSet: Array<{name: string, value: string, options?: object}>]
- **ic_degiskenler**:
  - `cookiesToSet` — ayarlanması gereken tüm çerezleri içeren nesne dizisi
  - `{ name, value }` — döngüdeki her çerezin adı ve değeri, istek çerezlerini güncellemek için kullanılır
  - `request.cookies.set(name, value)` — mevcut isteğin çerezlerini güncelleyen metod
  - `request` — orijinal NextRequest nesnesi, yeni yanıt oluştururken aktarılır
  - `response` — yeni oluşturulan NextResponse nesnesi, çerezler bu yanıta eklenir
  - `{ name, value, options }` — döngüdeki her çerezin adı, değeri ve ayarları, yanıt çerezlerini ayarlamak için kullanılır
  - `response.cookies.set(name, value, options)` — yanıta çerezi ekleyen metod, istemciye kaydedilmesi için gönderilir
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\middleware.ts
  function: src\middleware.ts::middleware

---

## DISA AKTARILANLAR (EXPORTS)
  export: config
  export: middleware