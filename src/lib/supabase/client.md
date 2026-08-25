---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\lib\supabase\client.ts
skeleton_hash: 84661defa15293fe
entity_hashes:
  overview: 34e9332f051f8980
generated_at: 2026-08-25T07:28:28Z
---

## Genel Bakış
Bu modül, Supabase veritabanı bağlantısı için bir tarayıcı istemcisi oluşturur. `@supabase/ssr` kütüphanesinden `createBrowserClient` fonksiyonunu kullanarak `SUPABASE_URL` ve `SUPABASE_ANON_KEY` ortam değişkenleriyle bir istemci örneği üretir ve `supabaseBrowserClient` değişkeni aracılığıyla dışa aktarır. Modül ayrıca `../../types/database.types` dosyasından `Database` tipini içe aktararak TypeScript için veritabanı şeması tanımlar.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../../types/database.types::type { Database }
- import: @supabase/ssr::createBrowserClient

---

## SABİTLER
- **SUPABASE_URL** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'`
- **SUPABASE_ANON_KEY** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'`
- **supabaseBrowserClient** (call) — `createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)`

---

## AST POINTERS

Bu dosyada (`src/lib/supabase/client.ts`) tanımlı fonksiyon bulunmamaktadır. Dosya yalnızca modül düzeyinde sabit tanımları (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `supabaseBrowserClient`) ve import deyimleri içermektedir. Analiz edilecek fonksiyon gövdesi olmadığından AST Pointer üretilmemiştir.

---

## NODE ID STANDARD

  file: client.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: supabaseBrowserClient