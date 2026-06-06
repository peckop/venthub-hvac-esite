---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\tenantServer.ts
skeleton_hash: 0198838f215103bf
entity_hashes:
  func:getTenantConfig: 1921adc85b5a5888
  overview: 604cff3e726efa10
generated_at: 2026-06-06T21:56:19Z
---

## Genel Bakış
Bu yardımcı modül, çok kiracılı (multi-tenant) sistem mimarisinde kiracı bazlı yapılandırma bilgilerinin merkezi erişim noktasını sunar. Tek bir asenkron fonksiyon aracılığıyla, istek bağlamından kiracı tanımlayıcısını çıkararak ilgili kiracının yapılandırma nesnesini döndürür.

## Fonksiyon Grupları
### Yapılandırma Sağlama
Modülün tek sorumluluğu, geçerli kiracının yapılandırma verilerini asenkron olarak temin etmektir. Bu, uygulama genelinde kiracıya özgü ayarlara tutarlı bir erişim sağlar.
- `getTenantConfig`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, çok kiracılı (multi-tenant) sistemde kiracı yapılandırma bilgisini sağlayan bir yardımcı (utility) modülüdür. Aşağıdaki varsayımlar, fonksiyon imzası ve modül sabitlerine dayanarak türetilmiştir.

---

**[Aksiyom 1]:** Eğer `DEFAULT_TENANT_CONFIG` sabiti modül kapsaminda tanımlı ve geçerli bir yapılandırma nesnesi (object) değilse, `getTenantConfig()` fonksiyonu geçerli bir yapılandırma döndüremeyebilir veya hata/falsy değer ile sonuçlanabilir.

**[Aksiyom 2]:** Eğer `getTenantConfig()` çağrıldığında geçerli bir kiracı bağlamı (context) veya ortam değişkeni (environment variable) mevcut değilse, fonksiyon `DEFAULT_TENANT_CONFIG` değerine geri dönebilir (fallback mekanizması).

**[Aksiyom 3]:** Eğer `getTenantConfig()` fonksiyonu asenkron ise ve alt sistemlerde (veritabanı, API vb.) bir kesinti yaşanıyorsa, fonksiyon zaman aşımı (timeout) hatası ile karşılaşabilir.

**[Aksiyom 4]:** Eğer fonksiyon parametre almıyorsa, kiracı tanımlaması (tenant identification) dış bir kaynaktan (global state, HTTP request context, ortam değişkeni vb.) çözülmelidir; aksi halde hangi kiracının yapılandırılacağı belirsizdir.

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
  - `tenantId` — Header'dan okunan kiracının benzersiz ID'si; `null` ile başlatılır, header okunamazsa veya geçersizse `DEFAULT_TENANT_ID`'ye düşer
  - `headersList` — `await headers()` çağrısından dönen Next.js HTTP header listesi; `x-tenant-id` header'ını içerir
  - `data` — Supabase `tenants` tablosundan sorgulanan satır; alanları: `data.id` (kiracı UUID), `data.name` (kiracı adı), `data.subdomain` (kiracı alt alan adı, opsiyonel), `data.custom_domain` (özel alan adı, opsiyonel), `data.is_active` (kiracı aktiflik durumu boolean), `data.features` (JSON string veya nesne — kiracının özellikler sözlüğü), `data.styles` (JSON string veya nesne — kiracının stil tanımları)
  - `error` — Supabase `.maybeSingle()` sorgusundan dönen hata nesnesi; sorgu başarısız olduğunda dolu olur
  - `features` — `data.features` değerinden türetilen nesne; string ise `JSON.parse()` ile ayrıştırılır, değilse doğrudan kullanılır veya boş nesne `{}` fallback alır
  - `styles` — `data.styles` değerinden türetilen nesne; string ise `JSON.parse()` ile ayrıştırılır, değilse doğrudan kullanılır veya boş nesne `{}` fallback alır
  - `err` — outer `try/catch` bloğunun yakaladığı genel hata nesnesi; `console.error` ile loglanır
- **Dönüş**: `Promise<TenantConfig>` — Kiracının konfigürasyon nesnesini (`id`, `name`, `subdomain`, `custom_domain`, `is_active`, `features`, `styles` alanlarını) döner; header okunamazsa, kiracı bulunamazsa veya kiracı aktif değilse `DEFAULT_TENANT_CONFIG` döner

---

## NODE ID STANDARD

  file: src\utils\tenantServer.ts
  function: src\utils\tenantServer.ts::getTenantConfig

---

## DISA AKTARILANLAR (EXPORTS)
  export: DEFAULT_TENANT_CONFIG
  export: TenantConfig
  export: getTenantConfig