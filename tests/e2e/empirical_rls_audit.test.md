---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\tests\e2e\empirical_rls_audit.test.ts
skeleton_hash: b4db3d39c41cdf3a
entity_hashes:
  func:getDatabaseUrl: af4a6b6385f9a9b1
  overview: 7a888f9d41d18719
generated_at: 2026-06-02T07:54:27Z
---

## Genel Bakış
Bu modül, uygulama veritabanı bağlantısının test ortamında doğru şekilde yapılandırılıp yapılandırılmadığını doğrulamak için kullanılan bir e2e test modülüdür. Modül, veritabanı URL'sinin erişilebilir ve geçerli olduğunu test ederek Row Level Security (RLS) politikalarının empirik denetimi için temel hazırlık işlevini görür.

## Fonksiyon Grupları
### Veritabanı Bağlantı Doğrulama
Test senaryolarının çalıştırılabilmesi için gerekli veritabanı bağlantı adresinin sağlanmasından ve doğrulanmasından sorumludur.
- `getDatabaseUrl`

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### getDatabaseUrl
**Ne yapar**: Bu fonksiyon, proje kök dizinindeki `.env` dosyasını okuyarak `DATABASE_URL` değerini döndürür. Uygulamanın çalıştırıldığı ortamda veritabanı bağlantısı için gerekli olan bu URL, yapılandırma amaçlı bir yardımcıdır.

**Nasıl yapar**: Fonksiyon önce `process.cwd()` metoduyla mevcut çalışma dizinini belirler ve `.env` dosyasının mutlak yolunu `path.resolve` kullanarak oluşturur. Ardından `fs.readFileSync` ile dosyanın tüm içeriğini senkron olarak okur. `DATABASE_URL` satırını bulmak için bir regular expression (`/^DATABASE_URL=(.+$/m)`) kullanarak çoklu satır (`m` flag) modunda arama yapar. Eşleşme bulunamazsa bir `Error` fırlatır; bulunursa eşleşen grubun (`match[1]`) baş ve sondaki boşluklarını (`trim()`) temizleyerek URL'yi döndürür.

**Parametreler**:
- Fonksiyonun herhangi bir parametresi yoktur.

**Dönüş**:
- `string`: `.env` dosyasından okunan ve temizlenmiş haldeki `DATABASE_URL` değerini döndürür.
- Fonksiyon, `.env` dosyası okunamazsa veya içinde `DATABASE_URL` satırı bulunamazsa bir `Error` fırlatır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/empirical_rls_audit.test.ts::getDatabaseUrl
- **params**: (yok)
- **ic_degiskenler**:
  - `envPath` — `.env` dosyasının proje kökünden çözümlenmiş mutlak dosya yolu (`path.resolve` ile)
  - `envContent` — `.env` dosyasının tüm içeriği, UTF-8 string olarak okunmuş ham metin
  - `match` — `DATABASE_URL=(.+)$` regex eşleşmesinin sonucu; eşleşme yoksa `null`, varsa `RegExpMatchArray` — `match[1]` ile URL değeri alınır
- **Dönüş**: `string` — `.env` içindeki `DATABASE_URL` değerinin trimmed hali (`match[1].trim()`)

---

### [N2_NASIL] AST Pointer: tests/e2e/empirical_rls_audit.test.ts::it('should inspect all tables and verify RLS and policy configurations') callback
- **params**: (yok — vitest `it()` callback)
- **ic_degiskenler**:
  - `connectionString` — `getDatabaseUrl()` çağrısından dönen PostgreSQL bağlantı URL'i
  - `client` — `new pg.Client({ connectionString })` ile oluşturulan PostgreSQL istemcisi
  - `tablesRes` — `pg_catalog.pg_class` + `pg_namespace` birleşik sorgusunun sonucu; public schema'daki tüm tabloları ve RLS durumlarını içerir (`QueryResult` nesnesi)
  - `nonRlsTables` — `string[]`, RLS'i devre dışı olan tablo adlarını toplayan dizi
  - `row` (ilk döngü) — `tablesRes.rows` üzerindeki her bir satır; her biri bir tabloyu temsil eder
  - `row.table_name` — tablonun adı (ör. `user_profiles`)
  - `row.rls_enabled` — tablonun RLS durumu (boolean)
  - `row.rls_forced` — tablonun zorunlu RLS durumu (boolean)
  - `policiesRes` — `pg_catalog.pg_policies` sorgusunun sonucu; public schema'daki tüm RLS politikalarını içerir (`QueryResult` nesnesi)
  - `suspiciousPolicies` — `any[]`, şüpheli politikaları tutan dizi; `{ table, policy, reason }` nesneleri eklenir
  - `row` (ikinci döngü) — `policiesRes.rows` üzerindeki her bir satır; her biri bir politikayı temsil eder
  - `row.tablename` — politikanın ait olduğu tablo adı
  - `row.policyname` — politikanın adı
  - `row.cmd` — politikanın uygulandığı komut türü (INSERT, SELECT, UPDATE, DELETE, ALL)
  - `row.roles` — politikanın izin verdiği PostgreSQL rolleri (array)
  - `row.using_expr` — USING (qual) ifadesi; politikanın mevcut satırları filtreleme koşulu
  - `row.check_expr` — WITH CHECK (with_check) ifadesi; politikanın yeni eklenen/ Güncellenen satırları doğrulama koşulu
  - `expr` — `row.using_expr` ve `row.check_expr` değerlerinin birleştirilmiş, küçük harfli hali; `auth.role()` ve `coalesce` aramaları için kullanılır
  - `isPermissiveToPublic` — `row.roles.includes('public')` sonucu; politikanın tüm rollere (anon dahil) açık olup olmadığını belirtir (boolean, atanmış ancak koşul içinde okunmamış)
  - `checksUid` — `expr.includes('auth.uid()')` sonucu; politikanın `auth.uid()` kullanıp kullanmadığını belirtir (boolean, atanmış ancak koşul içinde okunmamış)
- **Dönüş**: yok — `expect()` ile assert yapılır; `user_profiles` ve `products` tablolarının `nonRlsTables` içinde olmaması doğrulanır; `finally` bloğunda `client.end()` ile bağlantı kapatılır

---

### [N3_NASIL] AST Pointer: tests/e2e/empirical_rls_audit.test.ts::anonymous async function
- **params**: (yok)
- **ic_degiskenler**:
  - `connectionString` — `getDatabaseUrl()` çağrısından dönen PostgreSQL bağlantı URL'i
  - `client` — `new pg.Client({ connectionString })` ile oluşturulan PostgreSQL istemcisi
  - `tablesRes` — `pg_catalog.pg_class` + `pg_namespace` birleşik sorgusunun sonucu; public schema'daki tablolar ve RLS durumları
  - `nonRlsTables` — `string[]`, RLS'i devre dışı olan tabloların adlarını tutan dizi
  - `row` (ilk döngü) — `tablesRes.rows` üzerindeki her bir satır
  - `row.table_name` — tablonun adı
  - `row.rls_enabled` — tablonun RLS etkinlik durumu
  - `row.rls_forced` — tablonun zorunlu RLS durumu
  - `policiesRes` — `pg_catalog.pg_policies` sorgusunun sonucu; public schema'daki tüm RLS politikaları
  - `suspiciousPolicies` — `any[]`, şüpheli politikaları tutan dizi
  - `row` (ikinci döngü) — `policiesRes.rows` üzerindeki her bir satır
  - `row.tablename` — politikanın ait olduğu tablo adı
  - `row.policyname` — politika adı
  - `row.cmd` — politika komutu
  - `row.roles` — politika rolleri dizisi
  - `row.using_expr` — USING ifadesi
  - `row.check_expr` — WITH CHECK ifadesi
  - `expr` — `using_expr` ve `check_expr`'in birleşik küçük harfli hali
  - `isPermissiveToPublic` — `row.roles.includes('public')` sonucu (boolean, atanmış ancak koşulda okunmamış)
  - `checksUid` — `expr.includes('auth.uid()')` sonucu (boolean, atanmış ancak koşulda okunmamış)
- **Dönüş**: yok — `expect()` ile assert yapılır; `finally` bloğunda `client.end()` ile bağlantı kapatılır

---

## NODE ID STANDARD

  file: tests\e2e\empirical_rls_audit.test.ts
  function: tests\e2e\empirical_rls_audit.test.ts::getDatabaseUrl

---

## DISA AKTARILANLAR (EXPORTS)
  export: getDatabaseUrl