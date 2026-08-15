---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\_shared\tenant_config.ts
skeleton_hash: ae031a376d4afe0c
entity_hashes:
  func:getTenantBranding: bde2d3819c7904af
  func:resolveTenantId: 70b9699dc1e36828
  overview: 0e3d39bd3d5cdaab
generated_at: 2026-08-15T07:33:58Z
---

## Genel Bakış
Bu modül, Supabase edge fonksiyonları arasında paylaşılan kiracı (tenant) yapılandırma yardımcılarını içerir. HTTP isteklerinden kiracı tanımlayıcısının çıkarılması ve ilgili kiracının marka bilgilerinin getirilmesi işlemlerini merkezi olarak sunar.

## Fonksiyon Grupları

### Kiracı Kimlik Çıkarma
HTTP isteklerinden kiracı tanımlayıcısını analiz edip standart bir biçime dönüştürerek diğer fonksiyonların kullanabileceği şekilde hazırlar.
- resolveTenantId

### Kiracı Marka Yapılandırma
Verilen kiracı tanımlayıcısına karşılık gelen marka ve görsel yapılandırma bilgilerini asenkron olarak getirerek kiracıya özel görünümlerin sağlanmasını destekler.
- getTenantBranding

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kiracı kimlik tespiti ve marka bilgisi getirme işlemleri için paylaşımlı yardımcı fonksiyonlar sunar.

**[Aksiyom 1]**: Eğer `resolveTenantId` çağrısında geçerli bir `Request` nesnesi yoksa, kiracı tanımlayıcısı tespit edilemez ve fonksiyon geçerli bir `string` dönemez.

**[Aksiyom 2]**: Eğer `getTenantBranding` çağrısında geçerli bir `tenantId` (string) parametresi yoksa, kiracıya ait marka bilgisi (`TenantBranding`) getirilemez ve Promise başarısız olur.

**[Aksiyom 3]**: Eğer `TenantBranding` tipi (veri yapısı) sistemde tanımlı değilse, `getTenantBranding` fonksiyonunun dönüş tipi geçersiz olur ve çağrı yapan modüller tip hatası alır.

**[Aksiyom 4]**: Eğer `getTenantBranding` fonksiyonunun eriştiği arka veri kaynağı (veritabanı veya servis) erişilebilir değilse, marka bilgisi asenkron olarak getirilemez ve Promise asılı kalır veya hata ile sonuçlanır.

**[Aksiyom 5]**: Eğer `resolveTenantId` isteğinde kiracı tanımlayıcısını çıkarılabilecek bir kaynak (header, URL parametresi, body içeriği vb.) yoksa, `parsedBody` parametresi `undefined` olsa bile fonksiyon varsayılan bir kiracı tanımlayıcısı dönemez.

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

## İTHALATLAR (IMPORTS)
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## INTERFACES

### TenantBranding
- `brandName: string`
- `brandLogoUrl: string`
- `brandPrimaryColor: string`
- `emailFrom: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/_shared/tenant_config.ts::resolveTenantId
- **params**: `(req: Request, parsedBody?: any)`
- **ic_degiskenler**:
  - `url` — req.url'den oluşturulan URL nesnesi, sorgu parametrelerini okumak için kullanılır
  - `queryTenantId` — URL searchParams'tan alınan 'tenant_id' değeri
  - `authHeader` — req.headers'dan alınan Authorization header'ı (Büyük/küçük harf duyarsız)
  - `token` — Authorization header'dan çıkarılan Bearer token'ın kendisi
  - `jwtParts` — JWT token'ın '.' ile split edilmiş parçaları (header, payload, signature)
  - `payload` — JWT payload kısmının decode edilmiş hali (JSON.parse ile)
  - `tenantId` — JWT payload'un app_metadata.tenant_id alanından alınan değer
  - `bodyTenantId` — parsedBody nesnesinden tenant_id veya tenantId alanı
- **Dönüş**: `string` — tenant_id değeri veya DEFAULT_TENANT_ID (hata durumunda)

### [N2_NASIL] AST Pointer: supabase/functions/_shared/tenant_config.ts::getTenantBranding
- **params**: `(tenantId: string)`
- **ic_degiskenler**:
  - `supabaseUrl` — Deno.env'den SUPABASE_URL değerini alan string, Supabase bağlantısı için kullanılır
  - `serviceKey` — Deno.env'den SUPABASE_SERVICE_ROLE_KEY değerini alan string, Supabase servis anahtarı
  - `dbConfig` — Veritabanından çekilen tenant konfigürasyonu (boş obje ile başlar, data.config ile doldurulur)
  - `supabase` — createClient ile oluşturulan Supabase istemcisi (auth persistSession: false ile)
  - `data` — supabase.from('tenants').select('config') sorgusunun sonucu (tenant verisi)
  - `error` — Supabase sorgusu sırasında oluşabilecek hata nesnesi
  - `brandName` — Marka adı: dbConfig.brand_name veya dbConfig.brandName veya BRAND_NAME env veya 'VentHub' fallback
  - `brandLogoUrl` — Marka logo URL'si: dbConfig.brand_logo_url veya dbConfig.brandLogoUrl veya BRAND_LOGO_URL env veya varsayılan logo
  - `brandPrimaryColor` — Marka ana rengi: dbConfig.brand_primary_color veya dbConfig.brandPrimaryColor veya BRAND_PRIMARY_COLOR env veya '#2563eb'
  - `emailFrom` — E-posta gönderen adresi: dbConfig.email_from veya dbConfig.EMAIL_FROM veya EMAIL_FROM env veya varsayılan e-posta
- **Dönüş**: `Promise<TenantBranding>` — brandName, brandLogoUrl, brandPrimaryColor, emailFrom alanlarını içeren nesne

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