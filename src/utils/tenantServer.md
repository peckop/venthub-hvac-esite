---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\tenantServer.ts
skeleton_hash: e7f4cca016770c0a
entity_hashes:
  overview: 3d351754b3018bf8
generated_at: 2026-06-07T18:03:35Z
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

[Aksiyom 1]: Eğer `DEFAULT_TENANT_CONFIG` sabiti tanımlı değilse veya boş/niteliksiz bir değer içeriyorsa, geçerli kiracı bulunamadığında yapılandırma döndürme işlemi başarısız olur veya tutarsız davranış gözlemlenir.

[Aksiyom 2]: Eğer `getTenantConfig` fonksiyonu çağrılamıyorsa (örn. modül yüklenememişse), uygulama genelinde kiracıya özgü yapılandırma bilgilerine erişilemez ve varsayılan/boş bir yapılandırma kullanılması gerekebilir.

[Aksiyom 3]: Eğer `DEFAULT_TENANT_CONFIG` bir nesne (`object`) olarak tanımlı değilse (örn. `null`, `undefined` veya farklı bir tipte ise), beklenmeyen yapılandırma erişim hataları oluşur.

---

> **Not:** Fonksiyon gövdesi (gövde kodu) elimde mevcut olmadığından, bu aksiyomlar yalnızca modül sabitleri (`DEFAULT_TENANT_CONFIG`, `getTenantConfig`) ve modülün amaç tanımı üzerinden çıkarılmıştır. Fonksiyon imzası parametreleri, hata yönetimi veya asenkron akış detayları hakkında bilinmediği için hüküm verilmemiştir.

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