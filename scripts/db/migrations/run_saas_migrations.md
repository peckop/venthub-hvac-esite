---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\run_saas_migrations.cjs
skeleton_hash: aa5fe0f05fd7eeaa
entity_hashes:
  func:run: 96143986ca0951d3
  overview: 7bbc3e177f564266
generated_at: 2026-08-27T12:33:23Z
---

## Genel Bakış

Bu modül, SaaS veritabanı migrasyonlarını çalıştırmak için kullanılan bir betiktir. Modülde yalnızca tek bir asenkron fonksiyon (`run`) bulunur ve tüm migrasyon sürecini başlatıp yönetir.

## Fonksiyon Grupları

### Migrasyon Yürütme

SaaS veritabanı migrasyonlarını çalıştırmaktan sorumludur. Modülün tek fonksiyonu olan `run`, çağrıldığında migrasyon işlemlerini başlatır ve yürütür.

- run

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### run
**Ne yapar**: Uzak Supabase pooler veritabanına (port 6543) bağlanarak, tanımlı tüm veritabanı migrasyon dosyalarını tek bir transaction içinde atomik biçimde çalıştıran asenkron bir fonksiyondur. İşlem başarılı olursa transaction commit edilir; herhangi bir hata oluşursa tüm değişiklikler geri alınır ve süreç sonlandırılır.

**Nasıl yapar**: Fonksiyon önce `client.connect()` ile uzak veritabanına bağlantı kurar. Ardından `BEGIN` komutuyla bir transaction başlatır. Transaction başladıktan sonra, `order_refund_events` tablosunun varlığını güvence altına almak amacıyla `CREATE TABLE IF NOT EXISTS` ifadesiyle bu tabloyu kontrol eder; tablo yoksa oluşturur ve satır düzeyi güvenlik (ROW LEVEL SECURITY) politikasını etkinleştirir. Daha sonra dışarıdan sağlanan `migrationFiles` dizisindeki her bir dosya adı için `path.resolve` kullanarak tam dosya yolunu oluşturur, `fs.existsSync` ile dosyanın mevcut olup olmadığını denetler (dosya bulunamazsa hata fırlatır), `fs.readFileSync` ile SQL içeriğini okur ve `client.query` ile veritabanında çalıştırır. Tüm migrasyonlar başarıyla tamamlandığında `COMMIT` ile transaction sonlandırılır. Herhangi bir hata yakalandığında `ROLLBACK` ile transaction geri alınır ve `process.exit(1)` ile süreç sonlandırılır. `finally` bloğunda ise `client.end()` ile veritabanı bağlantısı her durumda kapatılır.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz. Kullandığı `client`, `migrationFiles`, `path`, `__dirname`, `fs` ve `process` gibi nesneler fonksiyonun kapsamı dışında tanımlıdır.

**Dönüş**: Dönüş tipi belirtilmemiştir. Fonksiyon başarılı olduğunda `undefined` döner; hata durumunda `process.exit(1)` çağrısıyla süreç sonlandırıldığından normal bir dönüş gerçekleşmez.

---

## SABİTLER
- **fs** (call) — `require('fs')`
- **path** (call) — `require('path')`
- **connectionString** [env-backed] (member_expression) — `process.env.DATABASE_URL`
- **client** (new_expression) — `new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
})`
- **migrationFiles** (array) — `[
  '20260530220000_tenant_schema_setup.sql',
  '20260530221000_tenant_auth...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/run_saas_migrations.cjs::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `filename` — `migrationFiles` dizisi üzerindeki for-of döngüsünde her iterasyonda alınan dosya adı
  - `filepath` — `path.resolve(__dirname, '../../../supabase/migrations', filename)` ile üretilen tam dosya yolu; `fs.existsSync` ve `fs.readFileSync` çağrılarında kullanılır
  - `sql` — `fs.readFileSync(filepath, 'utf8')` ile okunan migration dosyasının SQL metin içeriği; `client.query(sql)` ile veritabanında çalıştırılır
  - `err` — try bloğunda oluşan hata; catch bloğunda `err.message` olarak loglanır
  - `rollbackErr` — `client.query('ROLLBACK')` çağrısı sırasında oluşabilecek hata; iç catch bloğunda loglanır
- **Dönüş**: yok (async fonksiyon, `return` ifadesi içermez; yan etki odaklıdır)

**Yan Etkiler / Dış Kaynak Erişimleri**:
  - `client.connect()` — veritabanına bağlantı kurar
  - `client.query('BEGIN')` — transaction başlatır
  - `client.query(...)` — `CREATE TABLE IF NOT EXISTS public.order_refund_events` ve `ENABLE ROW LEVEL SECURITY` SQL'ini çalıştırır
  - `client.query(sql)` — her migration dosyasının SQL içeriğini çalıştırır
  - `client.query('COMMIT')` — transaction'ı onaylar
  - `client.query('ROLLBACK')` — hata durumunda transaction'ı geri alır
  - `client.end()` — finally bloğunda bağlantıyı kapatır
  - `fs.existsSync(filepath)` — migration dosyasının varlığını kontrol eder
  - `fs.readFileSync(filepath, 'utf8')` — migration dosyasını UTF-8 olarak okur
  - `console.log(...)` / `console.error(...)` — ilerleme ve hata mesajlarını loglar
  - `process.exit(1)` — hata durumunda prosesi sonlandırır
  - `migrationFiles` — dışarıdan gelen migration dosya adları dizisi (for-of döngüsünde tüketilir)
  - `__dirname` — mevcut dosyanın bulunduğu dizin yolu (path.resolve içinde kullanılır)

---

## NODE ID STANDARD

  file: scripts\db\migrations\run_saas_migrations.cjs
  function: scripts\db\migrations\run_saas_migrations.cjs::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: run