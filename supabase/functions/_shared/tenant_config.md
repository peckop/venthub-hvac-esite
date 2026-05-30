---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\_shared\tenant_config.ts
skeleton_hash: 9da745ddb0a89b81
entity_hashes:
  func:getTenantBranding: 6ae9f5f873d6872c
  func:resolveTenantId: 0e5af2f2539b0210
  overview: 0aa8d7ed1d1b17a6
generated_at: 2026-05-30T20:26:53Z
---

## Genel Bakış

Bu modül, kiracı (tenant) bazlı yapılandırma ve kimlik tespitini sağlamak için ortak yardımcı fonksiyonlar içerir. Supabase edge fonksiyonları arasında paylaşılan bir yapı olarak, HTTP isteklerinden kiracı tanımlayıcısının çıkarılması ve kiracıya özel marka bilgilerinin getirilmesi işlemlerini merkezi olarak yönetir.

## Fonksiyon Grupları

### Kiracı Kimlik Tespiti
HTTP isteklerinden kiracı tanımlayıcısını çıkarıp standart bir biçime dönüştürerek diğer fonksiyonların kullanabileceği şekilde sunar.
- resolveTenantId

### Kiracı Marka Bilgisi
Verilen kiracı tanımlayıcısına karşılık gelen marka ve görsel yapılandırma bilgilerini asenkron olarak getirir.
- getTenantBranding

---

## AXIOMS – Mimari Varsayımlar

Bu modül, HTTP isteklerinden tenant (kiracı) tanımlayıcısını çıkaran ve ilgili tenant'ın marka bilgisini getiren yardımcı fonksiyonlar içerir.

**[Aksiyom 1]**: Eğer `resolveTenantId` fonksiyonuna geçirilen `req` parametresi geçerli bir HTTP Request nesnesi değilse, fonksiyon tenant ID'sini başarıyla çıkaramaz.

**[Aksiyom 2]**: Eğer `resolveTenantId` fonksiyonuna geçirilen `parsedBody` parametresi `undefined` ise ve request body'den tenant ID çıkarımı bu parametreye bağımlıysa, çözümleme başarısız olur.

**[Aksiyom 3]**: Eğer `getTenantBranding` fonksiyonuna geçirilen `tenantId` boş string (`""`) ise veya geçerli bir tenant temsil etmiyorsa, fonksiyon geçerli marka bilgisi dönemez.

**[Aksiyom 4]**: Eğer `getTenantBranding` fonksiyonu için veritabanında veya yapılandırma kaynağında `tenantId`'ye karşılık gelen bir kayıt yoksa, fonksiyon geçerli marka bilgisi dönemez.

---

## FONKSİYON DETAYLARI

### resolveTenantId
**Ne yapar**: Bu fonksiyon, bir HTTP isteğinden (`Request` nesnesi) `tenant_id` değerini çıkarmak için kullanılan merkezi bir çözümleyicidir. İşlevi, çoklu kaynaklardan (URL parametresi, JWT claim'i, istek gövdesi) tenant belirleyicisini bulmak ve tutarlı bir şekilde sunmaktır.

**Nasıl yapar**: Fonksiyon, tanımlanmış bir hiyerarşiye göre arama yapar. İlk olarak URL'nin arama parametrelerinde `tenant_id` anahtarını kontrol eder. Bulamazsa, `Authorization` başlığındaki Bearer JWT'yi ayrıştırarak `app_metadata.tenant_id` claim'ini arar. Üçüncü olarak, zaten ayrıştırılmış olan istek gövdesinde `tenant_id` veya `tenantId` alanını inceler. Bu denemelerin hiçbiri başarılı olmazsa veya herhangi bir ayrıştırma hatası oluşursa, önceden tanımlanmış sabit bir `DEFAULT_TENANT_ID` değerini döndürür. Bu sayede sistem, eksik veya hatalı bir tenant belirleyicisi durumunda bile çalışmaya devam edebilir.

**Parametreler**:
- `req`: Request — İşlenmemiş HTTP istek nesnesi. URL, başlıklar ve gövde gibi verileri içerir.
- `parsedBody?`: any — Opsiyonel. Daha önce ayrıştırılmış olan istek gövdesi nesnesi. Eğer sağlandığında, fonksiyon bunu üçüncü bir kaynak olarak kullanır.

**Dönüş**: string — Çıkarılmış veya belirlenmiş olan `tenant_id` değerini döndürür.

### getTenantBranding
**Ne yapar**: Bu fonksiyon, belirli bir `tenant_id` için marka kimliği ve iletişim ayarları gibi yapılandırma detaylarını dinamik olarak getirir. Çeşitli kaynaklardan gelen verileri birleştirerek tutarlı bir `TenantBranding` nesnesi oluşturur.

**Nasıl yapar**: Fonksiyon, bir hata toleransı ve fallback (yedekleme) mantığıyla çalışır. İlk olarak, Supabase servis anahtarını ve URL'sini kullanarak veritabanındaki `tenants` tablosundan ilgili tenant'ın `config` alanını çeker. Veritabanından gelen config nesnesi, yerel bir `dbConfig` değişkenine atanır. Ardından, her bir marka alanı (ad, logo, renk, e-posta göndereni) için çok katmanlı bir arama ve birleştirme işlemi uygulanır: Önce veritabanından gelen config'de snake_case ve camelCase anahtarlarını kontrol eder, bulamazsa ortam değişkenlerine (Deno.env) bakar, son olarak systemVars`daki hardcoded (kodda sabitlenmiş) varsayılan değerleri kullanır. Bu hiyerarşi, her alan için sırasıyla veritabanı > ortam değişkeni > sistem varsayılanı şeklinde çalışır.

**Parametreler**:
- `tenantId`: string — Branding yapılandırması getirilmek istenen kiracının (tenant) benzersiz tanımlayıcısı.

**Dönüş**: Promise<TenantBranding> — Asenkron olarak, `brandName`, `brandLogoUrl`, `brandPrimaryColor` ve `emailFrom` alanlarını içeren bir `TenantBranding` nesnesi ile çözülen bir Promise döndürür.

---

## INTERFACES

### TenantBranding
- `brandName: string`
- `brandLogoUrl: string`
- `brandPrimaryColor: string`
- `emailFrom: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: _shared/tenant_config.ts::resolveTenantId
- **params**: (req: Request, parsedBody?: any)
- **ic_degiskenler**: 
  - `url` — req.url'den oluşturulan URL nesnesi, query parametrelerine erişim sağlar
  - `queryTenantId` — URL search params'dan alınan tenant_id değeri, birincil kaynaktır
  - `authHeader` — Authorization header'ı, Bearer token içeriğini taşır
  - `token` — Bearer prefix'inden sonra gelen JWT token string'i
  - `jwtParts` — JWT token'ın noktalarla ayrılmış üç parçalı array'i (header, payload, signature)
  - `payload` — JWT payload JSON nesnesi, app_metadata içeriğini barındırır
  - `tenantId` — payload.app_metadata.tenant_id değerinden alınan tenant identifier
  - `bodyTenantId` — parsedBody parametresinden tenant_id veya tenantId alanından alınan değer
- **Dönüş**: string (tenant_id değeri veya DEFAULT_TENANT_ID)

### [N2_NASIL] AST Pointer: _shared/tenant_config.ts::getTenantBranding
- **params**: (tenantId: string)
- **ic_degiskenler**: 
  - `supabaseUrl` — Deno.env'den SUPABASE_URL değişkeninin değeri, Supabase bağlantısı için kullanılır
  - `serviceKey` — Deno.env'den SUPABASE_SERVICE_ROLE_KEY değişkeninin değeri, service role yetkisi sağlar
  - `dbConfig` — Veritabanından çekilen veya boş dizi olarak başlayan tenant konfigürasyon nesnesi
  - `supabase` — createClient ile oluşturulan Supabase istemcisi, veritabanı sorguları yapar
  - `data` — tenants tablosundan select('config') ile dönen satır verisi
  - `error` — Supabase sorgusu sırasında oluşan hata nesnesi
  - `brandName` — Marka adı için hiyerarşik çözümleme: dbConfig.brand_name -> dbConfig.brandName -> Deno.env.BRAND_NAME -> 'VentHub'
  - `brandLogoUrl` — Marka logosu URL'i için hiyerarşik çözümleme: dbConfig.brand_logo_url -> dbConfig.brandLogoUrl -> Deno.env.BRAND_LOGO_URL -> varsayılan Vercel URL
  - `brandPrimaryColor` — Marka ana rengi için hiyerarşik çözümleme: dbConfig.brand_primary_color -> dbConfig.brandPrimaryColor -> Deno.env.BRAND_PRIMARY_COLOR -> '#2563eb'
  - `emailFrom` — E-posta gönderim adresi için hiyerarşik çözümleme: dbConfig.email_from -> dbConfig.EMAIL_FROM -> Deno.env.EMAIL_FROM -> 'VentHub <onboarding@resend.dev>'
- **Dönüş**: Promise<TenantBranding> (brandName, brandLogoUrl, brandPrimaryColor, emailFrom alanlarını içeren nesne)

---

## NODE ID STANDARD

  file: supabase\functions\_shared\tenant_config.ts
  function: supabase\functions\_shared\tenant_config.ts::resolveTenantId
  function: supabase\functions\_shared\tenant_config.ts::getTenantBranding

---

## DISA AKTARILANLAR (EXPORTS)
  export: TenantBranding
  export: getTenantBranding
  export: resolveTenantId