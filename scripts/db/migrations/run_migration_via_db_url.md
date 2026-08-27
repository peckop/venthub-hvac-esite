---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\run_migration_via_db_url.ts
skeleton_hash: a11f4f24d7180f05
entity_hashes:
  func:run: cd75b786ce69d425
  overview: 44886300baeaa3ad
generated_at: 2026-08-27T12:32:49Z
---

## Genel Bakış

Bu modül, bir veritabanı bağlantı URL'si aracılığıyla veritabanı migration (şema geçişi) işlemini çalıştırmakla sorumludur. Modül, dışarıya tek bir asenkron giriş noktası sunar ve migration sürecinin başlatılmasını sağlar.

## Fonksiyon Grupları

### Migration Çalıştırma
Veritabanı URL'si üzerinden migration işlemini başlatır ve yürütür. Modülün dış dünyaya açılan tek işlevsel arayüzüdür.

- run

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### run
**Ne yapar**: Veritabanına bağlanır, belirtilen SQL migration dosyasını okur ve çalıştırır. İşlem sonunda veritabanı bağlantısını kapatır. Başarılı ve başarısız durumları konsola bildirir.

**Nasıl yapar**: Fonksiyon önce `client.connect()` ile veritabanına bağlantı kurar. Bağlantı başarılı olduktan sonra `supabase/migrations/20251218_wizard_selections.sql` dosyasının varlığını `_fs.existsSync` ile kontrol eder; dosya bulunamazsa hata fırlatır. Dosya mevcutsa `_fs.readFileSync` ile SQL içeriğini okur. `client.on('notice', ...)` ile veritabanından gelen notice mesajlarını dinler ve konsola yazar. Ardından `client.query(sql)` ile SQL sorgusunu çalıştırır. `try-catch-finally` bloğu kullanılır: `catch` bloğunda hata yakalandığında `_e?.message || _e` ifadesiyle hata mesajı konsola yazdırılır; `finally` bloğunda ise her durumda `client.end()` ile veritabanı bağlantısı sonlandırılır. `_path` modülü dosya yolu birleştirmede, `_fs` modülü dosya okuma ve varlık kontrolünde kullanılır.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: Return tipi belirtilmemiştir; fonksiyon gövdesinde herhangi bir `return` ifadesi bulunmamaktadır.

---

## İTHALATLAR (IMPORTS)
- import: _fs::_fs
- import: _path::_path
- import: dotenv::dotenv
- import: pg::pg

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **DATABASE_URL** [env-backed] (member_expression) — `process.env.DATABASE_URL`
- **client** (new_expression) — `new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthori...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/run_migration_via_db_url.ts::run
- **params**: yok
- **ic_degiskenler**:
  - `migrationFile` — `'supabase/migrations/20251218_wizard_selections.sql'` sabit string; çalıştırılacak SQL migration dosyasının göreceli yolunu tutar
  - `sqlPath` — `_path.join(process.cwd(), migrationFile)` ile elde edilen tam dosya yolu; migration dosyasının mutlak konumunu temsil eder
  - `sql` — `_fs.readFileSync(sqlPath, 'utf8')` ile okunan SQL dosyasının tam içeriği; `client.query(sql)` ile veritabanına gönderilir
  - `_e` — catch bloğunda erişilen hata nesnesi; `_e?.message || _e` ile hata mesajı konsola yazdırılır
  - `msg` — `client.on('notice', ...)` callback'inde yakalanan notice mesajı; `msg.message` ile konsola yazdırılır
- **Dönüş**: yok (async fonksiyon, `await client.connect()`, `await client.query(sql)`, `await client.end()` yan etkileriyle çalışır)

### [N2_NASIL] AST Pointer: scripts/db/migrations/run_migration_via_db_url.ts::(anonim notice callback)
- **params**: `msg` (unknown) — veritabanından gelen notice mesajı nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: yok (konsola `'NOTICE:', msg.message` yazar)

---

## NODE ID STANDARD

  file: scripts\db\migrations\run_migration_via_db_url.ts
  function: scripts\db\migrations\run_migration_via_db_url.ts::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: run