---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\_shared\tenant_config.ts
skeleton_hash: 9da745ddb0a89b81
entity_hashes:
  func:getTenantBranding: bde2d3819c7904af
  func:resolveTenantId: 70b9699dc1e36828
  overview: 0aa8d7ed1d1b17a6
generated_at: 2026-05-30T21:36:11Z
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
**Ne yapar**: Bir HTTP isteğinden kiracı kimliğini (tenant_id) çıkarmaya çalışır. Bu işlem, istek URL'si, Yetkilendirme başlığındaki JWT veya istek gövdesindeki veriler kullanılarak sırasıyla kontrol edilir. Eğer hiçbir kaynakta geçerli bir kiracı kimliği bulunamazsa, tanımlı bir varsayılan değer döndürür.

**Nasıl yapar**: Fonksiyon, kiracı kimliğini belirlemek için üç aşamalı bir arama stratejisi uygular. Öncelikle URL sorgu parametrelerinde `tenant_id` arar. Bulamazsa, `Authorization` başlığındaki Bearer token'ı ayrıştırarak JWT payload'ındaki `app_metadata.tenant_id` claim'ini kontrol eder. Hâlâ bulamazsa, opsiyonel olarak verilen `parsedBody` nesnesinde `tenant_id` veya `tenantId` alanlarını inceler. Tüm denemeler başarısız olursa, module seviyesinde tanımlı olan `DEFAULT_TENANT_ID` sabitini döndürür. Herhangi bir ayrıştırma hatası oluşursa hatayı konsola kaydeder.

**Parametreler**:
- `req`: Request — Kiracı kimliğini çıkarmak için analiz edilecek HTTP istek nesnesi. URL, başlıklar ve gövde erişimi için kullanılır.
- `parsedBody`: any (opsiyonel) — Önceden ayrıştırılmış bir istek gövdesi nesnesi. `tenant_id` alanı için kontrol edilir.

**Dönüş**: string — Bulunan veya varsayılan kiracı kimliği. Geçerli bir kiracı kimliği bulunamazsa module sabiti olan `DEFAULT_TENANT_ID` döndürülür.

### getTenantBranding
**Ne yapar**: Belirli bir kiracı için marka yapılandırma bilgilerini (logo, ad, renk, e-posta adresi gibi) dinamik olarak getirir. Veri kaynağı olarak sırasıyla kiracının veritabanı kaydını, ortam değişkenlerini ve son olarak kod içi varsayılan değerleri kullanarak bir fallback mekanizması uygular.

**Nasıl yapar**: Fonksiyon, istenen kiracının marka ayarlarını bulmak için hiyerarşik bir çözümleme yapar. İlk adım olarak, Supabase istemcisi oluşturarak `tenants` tablosundaki `config` alanını sorgular. Veritabanından başarılı bir veri alınırsa, bu yapılandırma nesnesi temel alınır; alınmazsa veya hata oluşursa konsola bir uyarı yazılır. Daha sonra, her bir marka özelliği (`brandName`, `brandLogoUrl`, vb.) için, veritabanı yapılandırmasındaki anahtar isimleri (hem snake_case hem camelCase varyantları) kontrol eder. Bu anahtarlar bulunamazsa, ilgili ortam değişkenine (ör. `BRAND_NAME`) bakar. Ortam değişkeni de yoksa, fonksiyon içi tanımlı nihai hardcoded varsayılan değeri kullanır. Bu süreç, dört ana marka özelliğinin her biri için tekrarlanarak nihai `TenantBranding` nesnesi oluşturulur.

**Parametreler**:
- `tenantId`: string — Marka yapılandırması getirilecek olan kiracının benzersiz tanımlayıcısı. Veritabanı sorgusu için kullanılır.

**Dönüş**: Promise<TenantBranding> — Aşağıdaki alanları içeren bir marka yapılandırma nesnesi:
- `brandName`: string — Markanın Görünen Adı (Ör: "VentHub")
- `brandLogoUrl`: string — Markanın Logo Görselinin Tam URL'i
- `brandPrimaryColor`: string — Markanın Ana Renk Kodu (HEX formatında, Ör: "#2563eb")
- `emailFrom`: string — Sistem e-postalarında kullanılacak "Gönderen" adresi (Ör: "VentHub <onboarding@resend.dev>")

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
  - `url` — İstek URL'sini temsil eden URL nesnesi, sorgu parametrelerini okumak için kullanılır
  - `queryTenantId` — URL'deki `tenant_id` sorgu parametresinden gelen string değer
  - `authHeader` — Authorization veya authorization header'ından gelen token string'i
  - `token` — Bearer prefix'i去除ılmış JWT token string'i
  - `jwtParts` — JWT token'ının '.' karakteriyle ayrılmış parçalarını içeren array
  - `payload` — JWT payload'unun Base64 decode edilmiş JSON objesi
  - `tenantId` — JWT payload'unun `app_metadata.tenant_id` alanından gelen tenant ID string'i
  - `bodyTenantId` — parsedBody objesinden gelen `tenant_id` veya `tenantId` alanı
  - `err` — try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: string — Çözümlenmiş tenant ID'si veya DEFAULT_TENANT_ID

### [N2_NASIL] AST Pointer: _shared/tenant_config.ts::getTenantBranding
- **params**: (tenantId: string)
- **ic_degiskenler**:
  - `supabaseUrl` — SUPABASE_URL ortam değişkeninden gelen Supabase URL string'i
  - `serviceKey` — SUPABASE_SERVICE_ROLE_KEY ortam değişkeninden gelen service role key string'i
  - `dbConfig` — Veritabanından çekilen tenant konfigürasyon objesi (Record<string, string>)
  - `supabase` — createClient ile oluşturulan Supabase istemcisi nesnesi
  - `data` — Veritabanı sorgusundan dönen tenant verisi (config alanını içerir)
  - `error` — Veritabanı sorgusundan dönen hata nesnesi
  - `brandName` — Hiyerarşik resolved marka adı (DB config, alternatif key, ortam değişkeni veya varsayılan)
  - `brandLogoUrl` — Hiyerarşik resolved marka logosu URL'i
  - `brandPrimaryColor` — Hiyerarşik resolved marka ana rengi
  - `emailFrom` — Hiyerarşik resolved e-posta gönderici adresi
- **Dönüş**: Promise<TenantBranding> — {brandName, brandLogoUrl, brandPrimaryColor, emailFrom} objesi

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