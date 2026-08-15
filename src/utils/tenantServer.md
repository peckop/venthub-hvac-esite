---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\tenantServer.ts
skeleton_hash: 69eb81e10061f69f
entity_hashes:
  overview: 5ef2b4c70f7b5fe7
generated_at: 2026-06-19T20:48:40Z
---

## Genel Bakış
Bu yardımcı modül, sunucu tarafında çok kiracılı (multi-tenant) yapılandırma yönetimini merkezileştirir. Next.js istek başlıkları ve React cache mekanizmasını kullanarak, geçerli kiracının yapılandırma nesnesini sunar. Eksik durumlarda `DEFAULT_TENANT_CONFIG` sabitini varsayılan değer olarak döndürür ve kiracı verilerini okumak için statik bir Supabase istemcisi kullanır.

## Modülün Kullanım Bağlamı ve Bağımlılıklar
Modül, `next/headers` paketinden gelen `headers` fonksiyonu ile HTTP istek bağlamını (kiracı tanımlayıcısı gibi bilgileri) çözer. `react` kütüphanesinden alınan `cache` fonksiyonu ile aynı istek kapsamında performans optimizasyonu ve veri tutarlılığı sağlanır. `@/lib/supabase/static` içinden import edilen statik Supabase istemcisi (`supabase`) ile `tenant_config` veya benzeri bir veritabanı tablosunda kiracıya ait yapılandırma satırları sorgulanır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./tenantConstants::DEFAULT_TENANT_ID
- import: @/lib/supabase/static::supabaseStaticClient
- import: next/headers::headers
- import: react::cache

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

Bu dosyada (`src/utils/tenantServer.ts`) **fonksiyon gövdesi bulunmamaktadır**. Dosya sadece şu bileşenleri içerir:

- **Import'lar**: `headers`, `cache`, `supabaseStaticClient`, `DEFAULT_TENANT_ID`
- **Sabit/Tanımlar**: `DEFAULT_TENANT_CONFIG` (object), `getTenantConfig` (call)

Hiçbir fonksiyon imzası veya gövdesi sağlanmadığından, AST Pointer üretilemez.

---

## NODE ID STANDARD

  file: src\utils\tenantServer.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: DEFAULT_TENANT_CONFIG
  export: TenantConfig
  export: getTenantConfig