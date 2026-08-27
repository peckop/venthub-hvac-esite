---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\run-direct-migration.ts
skeleton_hash: 518e508bbfed32a4
entity_hashes:
  func:runMigration: ccbe1c54fbccee17
  overview: b7983cadbaf8942b
generated_at: 2026-08-27T12:29:36Z
---

## Genel Bakış
Bu modül, veritabanı migrasyonlarını doğrudan çalıştırmak için kullanılan bir betiktir. Modül adından anlaşılacağı üzere, ara bir migrasyon yönetim aracı kullanmadan migrasyon işlemlerini doğrudan yürütmeyi amaçlar. Modülde yalnızca tek bir asenkron fonksiyon tanımlıdır.

##

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, mimari varsayım üretilememektedir. Mevcut bilgiler yalnızca fonksiyon imzası (`async def runMigration()`) ve modül sabitlerinin (`pg`, `connectionString`, `client`) varlığını doğrulamaktadır; ancak bu sabitlerin fonksiyon içinde nasıl kullanıldığı, hangi sırayla çağrıldığı, hata yönetimi olup olmadığı veya hangi koşulların kontrol edildiği bilinmemektedir.

Fonksiyon gövdesi sağlanmadıkça aksiyom yazılamaz.

---

## FONKSİYON DETAYLARI

### runMigration
**Ne yapar**: Veritabanına bağlanarak `categories` tablosuna `metadata` adında yeni bir JSONB sütunu ekleyen bir veritabanı migrasyonu (şema değişikliği) gerçekleştirir. Sütun zaten mevcutsa tekrar eklemeye çalışmaz ve sütuna açıklayıcı bir yorum (COMMENT) ekler.

**Nasıl yapar**: Fonksiyon önce `client.connect()` ile veritabanına bağlantı kurar. Bağlantı başarılı olduktan sonra, `IF NOT EXISTS` koşuluyla `categories` tablosuna varsayılan değeri `'{}'::jsonb` olan bir `metadata` sütunu ekleyen SQL komutunu çalıştırır. Ardından `COMMENT ON COLUMN` ifadesiyle bu sütuna "Stores rich content for landing pages: display_mode, showcase_images, features, technical_summary" açıklamasını ekler. İşlem sırasında bir hata oluşursa `catch` bloğunda hata konsola yazdırılır. İşlem başarılı olsun ya da olmasın, `finally` bloğunda `client.end()` çağrılarak veritabanı bağlantısı kapatılır. Fonksiyon, `client` adında harici bir veritabanı istemci nesnesi kullanır; bu nesne fonksiyonun tanımlandığı kapsamda dışarıdan sağlanmalıdır.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Fonksiyon `async` olarak tanımlıdır ve açık bir dönüş değeri yoktur. İşlem sonucu konsola yazdırılan uyarı ve hata mesajlarıyla bildirilir.

---

## İTHALATLAR (IMPORTS)
- import: pg::pg

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **connectionString** [env-backed] (member_expression) — `process.env.DATABASE_URL`
- **client** (new_expression) — `new Client({
    connectionString,
})`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/run-direct-migration.ts::runMigration
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `sql` — `categories` tablosuna `metadata` (JSONB, varsayılan `'{}'::jsonb`) sütunu ekleyen ALTER TABLE komutunu ve bu sütuna açıklama ekleyen COMMENT ON komutunu içeren SQL sorgu metni
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `console.error` ile "Migration failed:" mesajıyla birlikte yazdırılır
- **Dönüş**: yok

**Dış kaynak erişimleri:**
- `client` — modül seviyesinde tanımlı `pg` istemcisi; `client.connect()` ile veritabanına bağlanır, `client.query(sql)` ile SQL çalıştırır, `client.end()` ile bağlantıyı kapatır
- `console.warn` — ilerleme mesajları ("Connecting to database...", "Connected.", "Running migration...", "Migration successful: Column added!")
- `console.error` — hata mesajı ("Migration failed:", err)

**Yan etkiler:**
- Veritabanına bağlanır, `categories` tablosuna `metadata` sütunu ekler (IF NOT EXISTS ile), sütuna COMMENT ekler ve bağlantıyı kapatır

---

## NODE ID STANDARD

  file: scripts\db\migrations\run-direct-migration.ts
  function: scripts\db\migrations\run-direct-migration.ts::runMigration

---

## DISA AKTARILANLAR (EXPORTS)
  export: runMigration