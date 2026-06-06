---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\supabase\static.ts
skeleton_hash: d527b4d5606a49af
entity_hashes:
  overview: cb63656e8f0a9199
generated_at: 2026-06-06T21:55:49Z
---

## Genel Bakış

Bu modül, Statik Supabase istemcisini yapılandırarak dış kaynak bağımlılığı olmadan çalışabilen bir veritabanı bağlantısı sağlar. Ortam değişkenlerinden `SUPABASE_URL` ve `SUPABASE_ANON_KEY` değerlerini okuyarak tip güvenli (`Database` türü ile) bir Supabase istemcisi oluşturur. Oluşturulan `supabaseStaticClient` nesnesi, uygulama genelinde statik veya sunucu tarafı veri erişimi gereken senaryolarda kullanılmak üzere dışa aktarılır.

---



---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **SUPABASE_URL** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'`
- **SUPABASE_ANON_KEY** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'`
- **supabaseStaticClient** (call) — `createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
...`

---

## AST POINTERS

Bu dosyada herhangi bir **fonksiyon gövdesi** bulunmamaktadır. Dosya yalnızca：

- **Sabit tanımlamalar**: `SUPABASE_URL` ve `SUPABASE_ANON_KEY` (binary expression ile değer ataması)
- **Modül düzeyi client oluşturma**: `supabaseStaticClient` (fonksiyon gövedesi olmayan, doğrudan `createClient` çağrısı)

---

### [N1_NASIL] AST Pointer: `src/lib/supabase/static.ts`::(modül_düzeyi)
- **params**: yok (fonksiyon değil, modül düzeyi kod)
- **ic_degiskenler**:
  - `SUPABASE_URL` — `binary_expression` ile hesaplanan Supabase proje URL'i sabiti
  - `SUPABASE_ANON_KEY` — `binary_expression` ile hesaplanan Supabase anon anahtarı sabiti
  - `supabaseStaticClient` — `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` çağrısı ile oluşturulan ve `Database` tipi ile типlendirilmiş statik Supabase istemcisi; modül dışına export edilerek其他 dosyalar tarafından kullanılır
- **Dönüş**: yok (modül düzeyi; `supabaseStaticClient` export edilir)

---

## NODE ID STANDARD

  file: src\lib\supabase\static.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: supabaseStaticClient