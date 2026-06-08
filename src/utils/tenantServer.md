---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\tenantServer.ts
skeleton_hash: 8a002d69b08c384d
entity_hashes:
  overview: 3d351754b3018bf8
generated_at: 2026-06-08T10:10:58Z
---

## Genel Bakış
Bu yardımcı modül, sunucu tarafında çok kiracılı (multi-tenant) yapılandırma yönetimini merkezileştirir. Next.js istek başlıkları ve React cache mekanizmasını kullanarak, geçerli kiracının yapılandırma nesnesini (`getTenantConfig`) sunar ve eksik durumlarda `DEFAULT_TENANT_CONFIG` sabitini varsayılan değer olarak döndürür. Modül, Supabase ile kiracı verilerini okumak için statik bir istemci kullanır.

## Modül Yapısı
Bu dosya, tanımlı bir sınıf veya modül-içi fonksiyon içermeyen, üst düzey (top-level) ifadelerden oluşur. Temel bileşenleri şunlardır:
- `DEFAULT_TENANT_CONFIG`: Geçerli kiracıya ait yapılandırma bulunamadığında kullanılacak varsayılan yapılandırma nesnesi.
- `getTenantConfig`: Modülün dışa açtığı ana API. Bu bir fonksiyon değil, modülün üst seviyesinde hesaplanan ve dışa aktarılan bir değerdir; muhtemelen bir fonksiyon referansı veya asenkron bir değerdir. Kiracıya özel yapılandırma verilerini (örneğin veritabanı ayarları, özellik bayrakları) temin eder.

## Kullanım Bağlamı
Modül, `next/headers` paketinden `headers` import ederek HTTP istek bağlamını (kiracı tanımlayıcısı gibi bilgiler) çözer. `@/lib/supabase/static` içinden import edilen statik Supabase istemcisi (`supabase`) ile kiracıya ait yapılandırma satırlarını veritabanından sorgular. React'ın `cache` fonksiyonu kullanılarak, aynı istek kapsamında çoklu çağrıların optimize edilmesi ve veri tutarlılığı sağlanır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, çok kiracılı (multi-tenant) mimaride kiracı yapılandırma bilgisini sağlayan bir yardımcı modüldür. Aşağıdaki varsayımlar, mevcut modül sabitlerine dayanarak çıkarılmıştır.

---

## FONKSİYON DETAYLARI

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
- **getTenantConfig** (call) — `cache(async function getTenantConfig(): Promise<TenantConfig> {
  let tenant...`

---

## AST POINTERS

Bu dosyada (`tenantServer.ts`) **fonksiyon gövdesi bulunmamaktadır**. Dosya sadece şunları içermektedir:

- **Import tanımlamaları**: `headers`, `supabase`, `cache`
- **Sabit tanımlamaları**: `DEFAULT_TENANT_CONFIG` (nesne), `getTenantConfig` (çağrı)

Fonksiyon gövdesi verilmediği için AST Pointer üretilememektedir.

---

## NODE ID STANDARD

  file: src\utils\tenantServer.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: DEFAULT_TENANT_CONFIG
  export: TenantConfig
  export: getTenantConfig