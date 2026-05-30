---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\tests\e2e\resolution.test.ts
skeleton_hash: 5408173b56731116
entity_hashes:
  func:resolutionMiddleware: c73c86b904ae0f2c
  func:resolveTenant: 4cfdd29908363a4f
  overview: 4384ea4c05f2d639
generated_at: 2026-05-30T20:37:52Z
---

## Genel Bakış
Bu modül, Next.js uygulamasında kiracı (tenant) çözümlemesi ve isteklerin işlenmesi için bir middleware sunar. Ana işlevi, gelen HTTP isteklerinden kiracı bilgisini çıkararak uygulamanın çoklu kiracı (multi-tenant) yapısını desteklemek ve istekleri buna göre yönlendirmektir.

## Fonksiyon Grupları
### Kiracı Çözümleme (Tenant Resolution)
Kiracı çözümleme mantığını içerir ve isteklerden kiracı tanımlayıcısını çıkarmaktan sorumludur.
- resolveTenant

### Middleware İşleme
Ana middleware işlevini sunar, istekleri işler ve kiracı çözümlemesini kullanarak uygun yanıtları döndürür.
- resolutionMiddleware

---

## AXIOMS – Mimari Varsayımlar

Bu modül, HTTP isteklerinden tenant bilgisini çözümleme (resolution) ve middleware aracılığıyla isteklere tenant bağlama işlemlerini yönetir.

**[Aksiyom 1]**: Eğer `TENANT_REGISTRY` boş bir array ise veya tenant domain ile eşleşen bir kayıt içermiyorsa, `resolveTenant` fonksiyonu `null` döner veya bir hata fırlatır (fonksiyon gövdesinde tanımlandığı şekilde). *Sonuç*: İstek için geçerli bir tenant çözümlenemez.

**[Aksiyom 2]**: Eğer `req` (NextRequest) nesnesi `null` veya `undefined` ise, hem `resolveTenant` hem de `resolutionMiddleware` fonksiyonları hata fırlatır. *Sonuç*: Geçersiz istek nesnesi ile çalışılamaz.

**[Aksiyom 3]**: Eğer `resolutionMiddleware` çalıştırıldığında, `resolveTenant` sonucu `null` ise ve middleware bu duruma göre bir tepki (hata yanıtı veya yönlendirme) dönmüyorsa, istek sonraki middleware veya handler'a tenant bilgisi olmadan devam eder. *Sonuç*: Tenant bilgisi olmayan istekler uygulamanın diğer katmanlarına ulaşabilir.

**[Aksiyom 4]**: Eğer `TENANT_REGISTRY` içindeki herhangi bir kaydın `domain` alanı tanımsız (undefined) veya boş string ise, `resolveTenant` bu kaydı hiçbir istekle eşleştiremez. *Sonuç*: Tanımsız domain alanına sahip kayıtlar kullanılamaz.

**[Aksiyom 5]**: Eğer `resolutionMiddleware` bir sonraki middleware'a `next()` ile devam ettiğinde ve `resolveTenant` başarısız olduğunda, middleware isteği engellemiyorsa (örn. bir 401/403 yanıtı dönmüyorsa), uygulama genelinde tenant-bağımlı işlevsellik (örn. veritabanı şeması seçimi) eksik kalır. *Sonuç*: Tenant-bağımlı mantık doğru çalışmayabilir.

---

## FONKSİYON DETAYLARI

### resolveTenant
**Ne yapar**: Bu fonksiyon, gelen bir HTTP isteğinin `host` header'ını analiz ederek ilgili kiracının (tenant) belirlenmesini sağlar. Temel amacı, isteğin hangi kiracıya ait olduğunu tespit edip bir kiracı kimliği (tenant ID) veya hata durumu döndürmektir. Kiracı belirleme mantığı, geliştirme ortamı bypass'ı, özel alan adı eşleştirmesi ve alt alan adı (subdomain) çıkarma adımlarını içerir.

**Nasıl yapar**: Fonksiyon, önce istekten `host` header'ını alır. Geliştirme modunda ve localhost’tan geliyorsa doğrudan `'default'` kiracısını döner. Host boşsa bir hata mesajı ile `null` bir kiracı kimliği döner. Ardından host’u küçük harflere çevirip boşlukları temizleyerek normalize eder. `TENANT_REGISTRY` adlı bir dizide, host'un özel bir alan adı (`customDomain`) ile eşleşip eşleşmediğini kontrol eder. Eşleşme bulunursa, kiracının askıya alınıp alınmadığına bakarak kiracı kimliğini veya askıya alma hatasını döner. Eğer özel alan adı eşleşmesi yoksa, host'u nokta ve iki nokta üst üste karakterlerine göre bölerek ilk parçayı potansiyel bir alt alan adı olarak çıkarır. Alt alan adı, `[a-zA-Z0-9\-]` karakter kümesi dışında bir karakter içeriyorsa hata döner. Aksi takdirde, bu alt alan adı `TENANT_REGISTRY` içinde aranır. Eşleşme bulunursa yine askıya alma kontrolü ile kiracı kimliği döner. Hiçbir eşleşme sağlanamazsa varsayılan olarak `'default'` kiracısını döner.

**Parametreler**:
- `req`: `NextRequest` — Kiracı belirleme işleminin yapılacağı HTTP istek nesnesi. İstek header'larından `host` değeri bu nesneden alınır.

**Dönüş**: `{ tenantId: string | null; error?: string }` — Başarılı olduğunda `tenantId` olarak kiracının benzersiz kimliğini (ör. `'default'`, bir UUID) ve `error` alanı olmadan bir nesne; hata durumunda `tenantId: null` ve ilgili hata mesajını (`'Empty Host Header'`, `'Tenant Suspended'`, `'Malformed Subdomain'`) içeren bir nesne döner.

### resolutionMiddleware
**Ne yapar**: Bu fonksiyon, bir Next.js middleware olarak çalışarak her gelen istek için kiracı çözümlemesi (tenant resolution) yapar ve sonucu istek akışı boyunca taşır. Kiracı bilgisini hem istek başlıklarına (`x-tenant-id`) hem de yanıt çerezlerine (`tenant_id`) ekleyerek sonraki işlemlere aktarır. Hata durumunda ise uygun HTTP durum koduyla bir hata yanıtı üretir.

**Nasıl yapar**: Fonksiyon, `resolveTenant` yardımcısını çağırarak mevcut istek için `tenantId` ve `error` değerlerini alır. Bir hata varsa, hata türüne göre 403 (Yasak, `'Tenant Suspended'` için) veya 400 (Kötü İstek, diğer tüm hatalar için) durum koduyla JSON formatında bir hata yanıtı döner. Hata yoksa, mevcut istek başlıklarını kopyalar ve `x-tenant-id` başlığını bulunan kiracı kimliği ile ayarlar. Ardından `MockNextResponse.next` methodunu kullanarak, güncellenmiş başlıklarla sonraki middleware'e veya nihai sayfa işleyicisine geçiş yapar. Ek olarak, oluşan yanıt nesnesinin çerezlerine `tenant_id` adıyla kiracı kimliğini ekleyerek kiracı bilgisinin istemci tarafında da tutulmasını sağlar.

**Parametreler**:
- `req`: `NextRequest` — Middleware tarafından işlenen HTTP istek nesnesi. Kiracı çözümlemesi ve başlık manipülasyonu bu nesne üzerine yapılır.

**Dönüş**: `Promise<NextResponse>` — Asenkron olarak bir `NextResponse` nesnesi döner. Hata durumunda JSON içerikli ve uygun HTTP durum koduna sahip bir yanıt; başarı durumunda ise bir sonraki adıma iletilmek üzere güncellenmiş başlıklara ve çerezlere sahip bir yanıt nesnesi döner.

---

## INTERFACES

### TenantConfig
- `id: string`
- `subdomain: string`
- `customDomain?: string`
- `status: 'active' | 'suspended'`

---

## SABİTLER
- **TENANT_REGISTRY** (array) — `[
  { id: 'tenant-eng-123', subdomain: 'engineering', status: 'active' },
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/resolution.test.ts::resolveTenant
- **params**: `(req: NextRequest)`
- **ic_degiskenler**:
  - `host` — `req.headers.get('host') || ''` ile alınan host header değeri; boşsa empty string fallback
  - `isDev` — `process.env.NODE_ENV === 'development'` sonucu; development modunda olup olmadığın belirler
  - `isLocalhost` — host'un `'localhost'` veya `'127.0.0.1'` ile başlayıp başlamadığını kontrol eder
  - `cleanHost` — `host.toLowerCase().trim()` ile küçük harfe normalize ve trim edilmiş host; büyük/küçük harf duyarsız eşleşme için
  - `customMatch` — `TENANT_REGISTRY.find(t => t.customDomain && cleanHost === t.customDomain)` ile custom domain eşleşmesi; `customMatch.id` ve `customMatch.status` erişimi yapılır
  - `parts` — `cleanHost.split(':')` ile port ayrıştırması; `parts[0]` hostname olarak kullanılır
  - `hostname` — `parts[0]` ile port'tan arındırılmış hostname değeri
  - `domainParts` — `hostname.split('.')` ile noktalara göre bölünmüş domain parçaları; `domainParts.length` ve `domainParts[0]` erişimi yapılır
  - `subdomain` — `domainParts[0]` ile çok seviyeli domain'den çıkarılan ilk alt domain parçası
  - `subMatch` — `TENANT_REGISTRY.find(t => t.subdomain === subdomain)` ile subdomain eşleşmesi; `subMatch.id` ve `subMatch.status` erişimi yapılır
- **Dönüş**: `{ tenantId: string | null; error?: string }` — tenantId成功li çözümlemede string, bulunamazsa 'default' veya null; errorvarsa hata açıklaması

### [N2_NASIL] AST Pointer: tests/e2e/resolution.test.ts::resolutionMiddleware
- **params**: `(req: NextRequest)`
- **ic_degiskenler**:
  - `tenantId` — `resolveTenant(req)` destructuring'inden gelen tenant ID'si; header ve cookie yayını için kullanılır
  - `error` — `resolveTenant(req)` destructuring'inden gelen hata mesajı; varsa 403 veya 400 döner
  - `headers` — `new Headers(req.headers)` ile mevcut header'lardan klonlanmış Headers nesnesi; `'x-tenant-id'` header'ı eklenir
  - `res` — `MockNextResponse.next({ request: { headers } })` ile oluşturulan yanıt nesnesi; `res.cookies.set('tenant_id', tenantId)` ile cookie eklenir
- **Dönüş**: `Promise<NextResponse>` — tenant bilgisini header ve cookie'ye yayarak ilerleyen middleware yanıtı

---

## NODE ID STANDARD

  file: tests\e2e\resolution.test.ts
  function: tests\e2e\resolution.test.ts::resolveTenant
  function: tests\e2e\resolution.test.ts::resolutionMiddleware

---

## DISA AKTARILANLAR (EXPORTS)
  export: resolutionMiddleware
  export: resolveTenant