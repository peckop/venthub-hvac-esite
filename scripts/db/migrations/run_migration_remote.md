---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\run_migration_remote.ts
skeleton_hash: 60039bebfd726bfd
entity_hashes:
  func:run: 587bcac104d97bd8
  overview: 2ab238af1a011bfc
generated_at: 2026-08-27T12:32:13Z
---

## Genel Bakış

Bu modül, uzak veritabanına yönelik migrasyon işlemlerini çalıştırmak için kullanılan bir script dosyasıdır. `scripts/db/migrations` dizininde yer alır ve veritabanı şema değişikliklerinin uzak ortama uygulanmasını tek bir giriş noktasından yönetir.

## Fonksiyon Grupları

### Uzak Migrasyon Yürütücü

Uzak veritabanı üzerinde migrasyon sürecini başlatan ve yürüten ana işlevi sağlar. Modülde tanımlı tek fonksiyon olan `run`, bu sürecin tamamını kapsar.

- run

### Dış Bağımlılıklar

Modülün hangi dış modüllere bağlı olduğu kaynak kodda belirtilmemiştir; bu nedenle bilinmiyor.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### run
**Ne yapar**: Veritabanı migration dosyasını çalıştırmak için PostgreSQL veritabanına bağlanır, belirtilen SQL dosyasını okur ve sorguyu veritabanında yürütür. İşlem sonunda veritabanı bağlantısını kapatır.

**Nasıl yapar**: Fonksiyon öncelikle `client.connect()` ile veritabanına bağlantı kurar. Ardından `process.cwd()` kullanarak çalışma dizininden itibaren `supabase/migrations/20260225_admin_orders_search_view.sql` dosya yolunu oluşturur ve `_fs.readFileSync` ile bu SQL dosyasını UTF-8 formatında okur. Veritabanı notice mesajlarını yakalamak için `client.on('notice', ...)` olay dinleyicisi ekler ve notice'ları konsola yazar. `_path.join` ile oluşturulan yoldan okunan SQL içeriğini `client.query(sql)` ile veritabanında yürütür. `try-catch-finally` yapısı ile hata yönetimi sağlar; hata durumunda `_e` değişkenini `Error` tipine cast ederek hata mesajını konsola yazar. `finally` bloğunda her durumda `client.end()` ile veritabanı bağlantısını sonlandırır. Fonksiyon `async` olarak tanımlı olduğundan, veritabanı işlemleri `await` ile eşzamansız biçimde beklenir.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz.

**Dönüş**: Dönüş tipi belirtilmemiştir. Fonksiyon `async` olduğundan bir `Promise` döndürmesi beklenir ancak açıkça tanımlanmamıştır.

---

## İTHALATLAR (IMPORTS)
- import: _fs::_fs
- import: _path::_path
- import: dotenv
- import: pg::pg

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **connectionString** [env-backed] (member_expression) — `process.env.DATABASE_URL`
- **client** (new_expression) — `new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
})`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/run_migration_remote.ts::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `sqlPath` — `_path.join(process.cwd(), 'supabase/migrations/20260225_admin_orders_search_view.sql')` ile oluşturulan SQL migrasyon dosyasının tam dosya sistemi yolu
  - `sql` — `_fs.readFileSync(sqlPath, 'utf8')` ile okunan SQL dosyasının metin içeriği; `client.query(sql)` ile veritabanında çalıştırılır
  - `err` — catch bloğunda `_e as Error` ile yakalanan hata nesnesi; `err.message` ile hata mesajı konsola yazdırılır
  - `msg` — `client.on('notice', ...)` callback'inde gelen PostgreSQL notice nesnesi; `msg.message` özelliği ile notice metni `console.warn` ile çıktıya yazdırılır
- **Dönüş**: yok (async fonksiyon, `client.connect()`, `client.query(sql)`, `client.end()` gibi await edilen yan etkiler gerçekleştirir; finally bloğunda bağlantı kapatılır)

---

## NODE ID STANDARD

  file: scripts\db\migrations\run_migration_remote.ts
  function: scripts\db\migrations\run_migration_remote.ts::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: run