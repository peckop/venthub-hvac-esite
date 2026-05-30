---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\tenantServer.ts
skeleton_hash: f973d01c4edd5c7d
entity_hashes:
  func:getTenantConfig: 486fffe5b634e46f
  overview: 66487cd4d320af10
generated_at: 2026-05-30T20:25:25Z
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
**Ne yapar**: Mevcut HTTP request'in header'larından tenant (kiracı) bilgisini çıkartarak, ilgili tenant'ın yapılandırma verisini veritabanından çeken bir fonksiyondur. Tenant ID geçerli değilse veya tenant pasif durumdaysa varsayılan yapılandırma değerlerini döndürür.

**Nasıl yapar**: Fonksiyon öncelikle request header'larından `x-tenant-id` değerini okumayı dener. Header okuma başarısız olursa veya geçerli bir tenant ID gelmezse (`null`, boş string, `DEFAULT_TENANT_ID` veya `'default'`), varsayılan tenant ID kullanılır. Ardından Supabase istemcisi aracılığıyla `tenants` tablosunda `id`, `name`, `subdomain`, `custom_domain`, `is_active`, `features` ve `styles` alanlarını sorgular. Sorgu sonucunda veri bulunamazsa veya tenant pasif (`is_active: false`) ise `DEFAULT_TENANT_CONFIG` nesnesi döndürülür. `features` ve `styles` alanları string formatındaysa JSON.parse ile nesneye dönüştürülür. Tüm adımlarda oluşan hatalar konsola loglanarak uygulamanın çökmesi engellenir.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almamaktadır.

**Dönüş**: `Promise<TenantConfig>` — Tenant yapılandırma nesnesi döndürür. Bu nesne şu alanları içerir:
- `id`: Tenant'ın benzersiz tanımlayıcısı
- `name`: Tenant'ın görünen adı
- `subdomain`: Alt alan adı bilgisi (yoksa `null`)
- `custom_domain`: Özel alan adı bilgisi (yoksa `null`)
- `is_active`: Tenant'ın aktif olup olmadığı boolean değeri
- `features`: Tenant'a özgü özellikler nesnesi
- `styles`: Tenant'a özgü stil yapılandırması nesnesi

---

## INTERFACES

### TenantConfig
- `id: string`
- `name: string`
- `subdomain: string | null`
- `custom_domain: string | null`
- `is_active: boolean`
- `features: {`
- `styles: {`

### SupabaseClientOverride
- `from: (table: string) => {`

---

## SABİTLER
- **DEFAULT_TENANT_CONFIG** (object) — `{
  id: DEFAULT_TENANT_ID,
  name: 'Default Tenant',
  subdomain: 'default',
...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/tenantServer.ts::getTenantConfig
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `tenantId` — HTTP header'dan okunan veya varsayılan olarak ayarlanan tenant identifier string'i; null ile başlatılır, header okunamazsa veya geçersizse `DEFAULT_TENANT_ID`'ye düşer
  - `headersList` — `await headers()` çağrısından dönen Next.js request header listesi objesi; `get()` metoduyla `'x-tenant-id'` header değeri okunur
  - `error` (outer try-catch) — `headers()` çağrısı sırasında oluşabilecek istisna nesnesi; yakalanıp `console.warn` ile loglanır
  - `data` — Supabase `'tenants'` tablosundan `.maybeSingle()` ile dönen tek satır verisi; `id`, `name`, `subdomain`, `custom_domain`, `is_active`, `features`, `styles` alanlarını içerir
  - `error` (inner try-catch) — Supabase sorgusundan dönen hata nesnesi; `data` ile birlikte `||` ile kontrol edilir, hata varsa veya veri yoksa `DEFAULT_TENANT_CONFIG` döner
  - `features` — `data.features` alanı string ise `JSON.parse()` ile parse edilmiş, değilse doğrudan (`|| {}` fallback ile) kullanılmış özellikler objesi
  - `styles` — `data.styles` alanı string ise `JSON.parse()` ile parse edilmiş, değilse doğrudan (`|| {}` fallback ile) kullanılmış stil objesi
  - `err` — inner try-catch bloğunda yakalanan istisna nesnesi; `console.error` ile loglanır
- **Dönüş**: `TenantConfig` objesi — `{ id, name, subdomain, custom_domain, is_active, features, styles }` alanlarından oluşur; hata durumlarında veya tenant inactive/pass bulunamazsa `DEFAULT_TENANT_CONFIG` döner

**Yan Etkiler / Taraf Ürünler:**
- `console.warn` ile header okunamadığında, tenant bulunamadığında ve tenant inactive olduğunda uyarı logları basılır
- `console.error` ile Supabase sorgu hatası loglanır
- Tenant geçerli ve aktif ise Supabase tablosundan aktif veri okunur

---

## NODE ID STANDARD

  file: src\utils\tenantServer.ts
  function: src\utils\tenantServer.ts::getTenantConfig

---

## DISA AKTARILANLAR (EXPORTS)
  export: DEFAULT_TENANT_CONFIG
  export: TenantConfig
  export: getTenantConfig