---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\tenantServer.ts
skeleton_hash: aa5b1627dbd47e55
entity_hashes:
  func:getTenantConfig: 1921adc85b5a5888
  overview: 66487cd4d320af10
generated_at: 2026-05-30T21:36:05Z
---

## Genel Bakış
Bu yardımcı modül, çok kiracılı (multi-tenant) bir sistemde kiracılara özgü yapılandırma bilgilerini merkezi bir noktadan almayı sağlar. Tek bir asenkron fonksiyon sunarak uygulama genelinde geçerli olan kiracı yapılandırmasına erişimi basitleştirir.

## Fonksiyon Grupları
### Yapılandırma Sağlama
Bu grup, belirli bir kiracının yapılandırma verilerini almakla sorumludur.
- `getTenantConfig`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesine erişilemediği için yalnızca imza ve sabit bilgisinden türetilebilecek minimal varsayımlar sunulmaktadır.

[Aksiyom 1]: Eğer `DEFAULT_TENANT_CONFIG` sabiti modül kapsaminda tanımlı ve geçerli bir object değilse, `getTenantConfig()` fonksiyonunun hangi değeri döndüreceği **bilinmiyor** (fonksiyon gövdesi mevcut olmadığından fallback davranışı doğrulanamamaktadır).

[Aksiyom 2]: Eğer `getTenantConfig()` fonksiyonu çağrıldığında dahili bir tenant bilgi kaynağı (örn. database, dosya, request context) erişilemez durumdaysa, fonksiyonun `DEFAULT_TENANT_CONFIG` döndürüp döndürmeyeceği **bilinmiyor** (fallback mekanizması fonksiyon gövdesinde tanımlı olmadığından doğrulanamamaktadır).

---

## FONKSİYON DETAYLARI

### getTenantConfig
**Ne yapar**: Fonksiyon, sunucu tarafında çalışan bir isteği işleyen tenant (kiracı) yapılandırmasını asenkron olarak getirir. Verilen tenant ID'sine karşılık gelen aktif tenant'ın temel bilgilerini, özelliklerini ve stil ayırt edicilerini bir nesne olarak döndürür.

**Nasıl yapar**: Fonksiyon öncelikle HTTP istek başlıklarından (`x-tenant-id`) tenant ID'sini okumaya çalışır. Okuma başarısız olursa veya geçerli bir ID gelmezse, sistemin varsayılan `DEFAULT_TENANT_ID` değerini kullanır. Ardından Supabase veritabanındaki `tenants` tablosunda bu ID ile bir sorgulama yapar. Sorgulama sonucunda tenant bulunamazsa veya tenant pasif (`is_active: false`) ise, yine varsayılan `DEFAULT_TENANT_CONFIG` nesnesini döndürerek hatayı yönetir. Veritabanından başarıyla çekilen `features` ve `styles` alanları JSON formatında string olarak saklanıyorsa otomatik olarak parse edilerek JavaScript nesnesine dönüştürülür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `Promise<TenantConfig>` - Asenkron bir işlem sonucunda `TenantConfig` tipinde bir nesne döndürür. Bu nesne, tenant'a ait `id`, `name`, `subdomain`, `custom_domain`, `is_active` ve parse edilmiş `features` ve `styles` nesnelerini içerir. Hata veya eksik durumlarda `DEFAULT_TENANT_CONFIG` nesnesi döner.

---

## INTERFACES

### TenantConfig
- `id: string`
- `name: string`
- `subdomain: string | null`
- `custom_domain: string | null`
- `is_active: boolean`
- `features: {`
- `styles: {`

### SupabaseClientOverride
- `from: (table: string) => {`

---

## SABİTLER
- **DEFAULT_TENANT_CONFIG** (object) — `{
  id: DEFAULT_TENANT_ID,
  name: 'Default Tenant',
  subdomain: 'default...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/tenantServer.ts::getTenantConfig
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `tenantId` — Header'dan okunan kiracı (tenant) ID'si. Başlangıçta `null`'dır. Header okunamazsa, `DEFAULT_TENANT_ID`'ye veya `'default'` stringine eşitse, `DEFAULT_TENANT_ID`'ye normalize edilir.
  - `headersList` — Next.js `headers()` async fonksiyonuyla elde edilen HTTP request header nesnesi. Üzerinden `'x-tenant-id'` header değeri okunur.
  - `data` — Supabase `'tenants'` tablosundan `id`, `name`, `subdomain`, `custom_domain`, `is_active`, `features`, `styles` sütunlarıyla yapılan `.maybeSingle()` sorgusundan dönen tek satırlık veri nesnesi.
  - `error` — Supabase sorgusu sırasındaki hata nesnesi. truthy ise veya `data` null/undefined ise varsayılan config'e dönülür.
  - `features` — Kiracının özellik haritası. `data.features` string ise `JSON.parse` ile parsed, aksi halde doğrudan kullanılır; null/undefined ise boş obje `{}` fallback edilir.
  - `styles` — Kiracının stil/theme haritası. `data.styles` string ise `JSON.parse` ile parsed, aksi halde doğrudan kullanılır; null/undefined ise boş obje `{}` fallback edilir.
  - `err` — Outer try-catch bloğu tarafından yakalanan beklenmedik hata nesnesi. `console.error` ile loglanır.
- **Dönüş**: `Promise<TenantConfig>` — `{ id, name, subdomain, custom_domain, is_active, features, styles }` alanlarını içeren konfigürasyon nesnesi. Hata, veri bulunamama veya kiracı pasif (`is_active === false`) durumlarında `DEFAULT_TENANT_CONFIG` sabit değeri döner. Yan etki olarak `console.warn` / `console.error` ile loglama yapar.

---

## NODE ID STANDARD

  file: src\utils\tenantServer.ts
  function: src\utils\tenantServer.ts::getTenantConfig

---

## DISA AKTARILANLAR (EXPORTS)
  export: DEFAULT_TENANT_CONFIG
  export: TenantConfig
  export: getTenantConfig