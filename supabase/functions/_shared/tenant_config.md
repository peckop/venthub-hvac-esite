---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\supabase\functions\_shared\tenant_config.ts
skeleton_hash: 5206c89ec698fe34
entity_hashes:
  func:getTenantBranding: bde2d3819c7904af
  overview: 727819c400487687
generated_at: 2026-08-27T07:09:58Z
---

## Genel Bakış

Bu modül, çok kiracılı (multi-tenant) mimaride kiracıya özel yapılandırma bilgilerini sağlayan bir yardımcı modüldür. Supabase Edge Functions paylaşımlı (_shared) alanında yer alır ve kiracı kimliğine göre marka bilgilerini getirme işlevini üstlenir. Modül, dış sistemlerden veya veritabanından kiracı yapılandırmasını okuyarak üst katmanlara sunar.

## Fonksiyon Grupları

### Kiracı Marka Bilgisi Erişimi

Verilen bir kiracı kimliğine (tenantId) karşılık gelen marka bilgilerini (TenantBranding) asenkron olarak getirir. Bu fonksiyon, kiracıya özel tema, logo, renk gibi marka ayarlarını dış dünyaya açan tek erişim noktasıdır.

- getTenantBranding

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmemiştir. Yalnızca fonksiyon imzası (`getTenantBranding(tenantId: string) -> Promise<TenantBranding>`) mevcuttur. Mimari varsayımlar yalnızca fonksiyon gövdesinden türetilir; imzadan aksiyom çıkarımı yapılamaz.

---

## FONKSİYON DETAYLARI

### getTenantBranding
**Ne yapar**: Verilen `tenantId` için marka (branding) yapılandırma değerlerini dinamik olarak getirir. Sıralı bir geri dönüş (fallback) mekanizması kullanır: önce kiracının veritabanındaki yapılandırmasına bakar, bulamazsa Deno ortam değişkenlerine başvurur, orada da yoksa sabit sistem varsayılanlarını döndürür.

**Nasıl yapar**: Fonksiyon önce `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` ortam değişkenlerini okur. Eğer bu değerler ve `tenantId` mevcutsa, `persistSession: false` seçeneğiyle bir Supabase istemcisi oluşturur ve `tenants` tablosundan ilgili kiracının `config` alanını sorgular. Sorgu başarılı olursa elde edilen yapılandırma `dbConfig` değişkenine atanır; hata oluşursa `console.warn` ile uyarı mesajı yazdırılır. Try-catch bloğu içinde yakalanan beklenmedik hatalar ise `console.error` ile loglanır. Ardından her bir marka değeri (`brandName`, `brandLogoUrl`, `brandPrimaryColor`, `emailFrom`) için hiyerarşik çözümleme yapılır: önce `dbConfig` içindeki snake_case varyantı, sonra camelCase varyantı, ardından ilgili Deno ortam değişkeni, en sonunda da sabit varsayılan değer kullanılır. Bu sayede kiracıya özel yapılandırma, sistem geneli yapılandırma ve varsayılan değerler arasında esnek bir öncelik sırası oluşturulur.

**Parametreler**:
- `tenantId`: `string` — Marka yapılandırması getirilecek kiracının benzersiz kimlik numarası. Boş veya tanımsız olursa veritabanı sorgusu atlanır ve doğrudan ortam değişkenleri veya varsayılan değerlere geçilir.

**Dönüş**: `Promise<TenantBranding>` — Aşağıdaki dört alanı içeren bir nesne döndürür:
- `brandName`: Marka adı. Veritabanında `brand_name` veya `brandName` anahtarı, ortam değişkeninde `BRAND_NAME`, varsayılan olarak `'VentHub'`.
- `brandLogoUrl`: Marka logosunun URL adresi. Veritabanında `brand_logo_url` veya `brandLogoUrl` anahtarı, ortam değişkeninde `BRAND_LOGO_URL`, varsayılan olarak `'https://venthub-hvac-esite.vercel.app/images/logo.png'`.
- `brandPrimaryColor`: Markanın birincil renk kodu. Veritabanında `brand_primary_color` veya `brandPrimaryColor` anahtarı, ortam değişkeninde `BRAND_PRIMARY_COLOR`, varsayılan olarak `'#2563eb'`.
- `emailFrom`: E-posta gönderici adresi ve görünen adı. Veritabanında `email_from` veya `EMAIL_FROM` anahtarı, ortam değişkeninde `EMAIL_FROM`, varsayılan olarak `'VentHub <onboarding@resend.dev>'`.

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

### [N1_NASIL] AST Pointer: supabase/functions/_shared/tenant_config.ts::getTenantBranding
- **params**: `tenantId` — string tipinde, kiraci (tenant) kimligi
- **ic_degiskenler**:
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alinan ortam degiskeni; bos string ile fallback'lenir
  - `serviceKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alinan ortam degiskeni; bos string ile fallback'lenir
  - `dbConfig` — `Record<string, string>` tipinde, veritabanindan gelen kiraci konfigurasyonunu tutan nesne; baslangicta bos obje olarak tanimlanir
  - `supabase` — `createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })` ile olusturulan Supabase istemcisi; oturum kaldirilmasi devre disi
  - `data` — `supabase.from('tenants').select('config').eq('id', tenantId).single()` sorgusundan donen veri; `data?.config` ile `config` alanina erisilir ve `dbConfig`'a atanir
  - `error` — ayni sorgudan donen hata nesnesi; hata varsa `console.warn` ile uyarisi yazdirilir
  - `err` — `catch` blokunda yakalanan genel hata; `console.error` ile yazdirilir
  - `brandName` — hiyerarsik cozumleme: once `dbConfig.brand_name`, sonra `dbConfig.brandName`, sonra `Deno.env.get('BRAND_NAME')`, en son `'VentHub'` varsayilan degeri
  - `brandLogoUrl` — hiyerarsik cozumleme: once `dbConfig.brand_logo_url`, sonra `dbConfig.brandLogoUrl`, sonra `Deno.env.get('BRAND_LOGO_URL')`, en son `'https://venthub-hvac-esite.vercel.app/images/logo.png'` varsayilan degeri
  - `brandPrimaryColor` — hiyerarsik cozumleme: once `dbConfig.brand_primary_color`, sonra `dbConfig.brandPrimaryColor`, sonra `Deno.env.get('BRAND_PRIMARY_COLOR')`, en son `'#2563eb'` varsayilan degeri
  - `emailFrom` — hiyerarsik cozumleme: once `dbConfig.email_from`, sonra `dbConfig.EMAIL_FROM`, sonra `Deno.env.get('EMAIL_FROM')`, en son `'VentHub <onboarding@resend.dev>'` varsayilan degeri
- **Dönüş**: `TenantBranding` tipinde nesne — `{ brandName, brandLogoUrl, brandPrimaryColor, emailFrom }` alanlarini icerir

---

## NODE ID STANDARD

  file: supabase\functions\_shared\tenant_config.ts
  function: supabase\functions\_shared\tenant_config.ts::getTenantBranding

---

## DISA AKTARILANLAR (EXPORTS)
  export: TenantBranding
  export: getTenantBranding