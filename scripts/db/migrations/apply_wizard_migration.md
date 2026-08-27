---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\apply_wizard_migration.ts
skeleton_hash: 9f7df006b3f9d8e8
entity_hashes:
  func:run: 673cbacbd4382b2c
  overview: 702e52cb1e9fbfc5
generated_at: 2026-08-27T12:25:15Z
---

## Genel Bakış
Bu modül, veritabanı migrasyonlarını uygulamak için kullanılan bir sihirbaz (wizard) modülüdür. Modül, temel bir çalıştırma fonksiyonu içerir ve migrasyon sürecinin başlatılmasından sorumludur.

## Fonksiyon Grupları
### Migrasyon Uygulama
Modülün ana işlevini yerine getiren bu grup, migrasyon sihirbazının çalıştırılmasını sağlar.
- run

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca modül sabitlerinden çıkarılabilecek sınırlı varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `pg` modülü (PostgreSQL istemci kütüphanesi) mevcut değilse, veritabanı bağlantısı kurulamaz ve migrasyon uygulanamaz.

[Aksiyom 2]: Eğer `connectionString` tanımlı ve erişilebilir değilse, PostgreSQL istemcisi veritabanına bağlanamaz.

[Aksiyom 3]: Eğer `client` nesnesi (new_expression ile oluşturulmuş PostgreSQL client) başarıyla oluşturulamazsa, veritabanı işlemleri yürütülemez.

---

**Not:** Fonksiyon gövdesi (`run()` fonksiyonunun içeriği) verilmediği için; hangi migrasyon tablolarının oluşturulduğu, hata yönetiminin nasıl yapıldığı, transaction kullanılıp kullanılmadığı, hangi SQL ifadelerinin yürütüldüğü gibi detaylı varsayımlar üretilememektedir. Daha kesin mimari varsayımlar için fonksiyon gövdesinin incelenmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### run
**Ne yapar**: Supabase (Postgres) veritabanına bağlanarak `wizard_selections` adlı SQL migration dosyasını okur ve çalıştırır. Bu fonksiyon, veritabanı şemasında wizard_selections tablosuna ilişkin değişiklikleri uygulamak için tasarlanmış bir migration betiğidir.

**Nasıl yapar**: Fonksiyon `async` olarak tanımlanmıştır ve `try-catch-finally` yapısı kullanır. İlk olarak Supabase istemcisine bağlanır, ardından `process.cwd()` dizinindeki `supabase/migrations/20251218_wizard_selections.sql` dosyasını `_fs.readFileSync` ile UTF-8 formatında okur. Okunan SQL içeriğini `client.query` ile veritabanında çalıştırır. Hata oluşması durumunda `console.error` ile hata mesajını yazdırır. `finally` bloğunda ise `client.end()` ile veritabanı bağlantısını kapatır — bu sayede başarılı veya başarısız olsun, bağlantı her durumda sonlandırılır.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: Dönüş tipi belirtilmemiştir. Fonksiyon `async` olduğundan bir `Promise` döndürür, ancak `return` ifadesi içermediğinden resolve edilen değer bilinmiyor.

---

## İTHALATLAR (IMPORTS)
- import: _fs::_fs
- import: _path::_path
- import: pg::pg

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **connectionString** [env-backed] (member_expression) — `process.env.DATABASE_URL`
- **client** (new_expression) — `new Client({ connectionString })`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: apply_wizard_migration.ts::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `sqlPath` — `_path.join(process.cwd(), 'supabase/migrations/20251218_wizard_selections.sql')` ile oluşturulan SQL migration dosyasının tam dosya yolu
  - `sql` — `_fs.readFileSync(sqlPath, 'utf8')` ile okunan SQL dosyasının UTF-8 metin içeriği
  - `_e` — catch bloğunda `console.error` ile loglanan hata nesnesi (catch ifadesinde parametre atanmamış olmasına rağmen kullanılıyor)
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: scripts\db\migrations\apply_wizard_migration.ts
  function: scripts\db\migrations\apply_wizard_migration.ts::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: run