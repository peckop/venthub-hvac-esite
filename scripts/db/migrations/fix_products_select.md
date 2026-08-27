---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\fix_products_select.ts
skeleton_hash: d20b03fa4793fa57
entity_hashes:
  func:run: f868a9122e6cd7db
  overview: f2debb0ae54b6368
generated_at: 2026-08-27T12:27:54Z
---

## Genel Bakış

Bu modül, veritabanı migrasyonu amaçlı bir scripttir. Modül adından anlaşıldığı üzere products tablosuna ilişkin bir SELECT sorgusunu düzeltmeye yöneliktir. Migrasyon sürecinin tek bir asenkron giriş noktası (`run`) üzerinden yürütülmesi amaçlanmıştır.

## Fonksiyon Grupları

### Migrasyon Yürütme
Migrasyonun çalıştırılmasından sorumludur. Modülün tek fonksiyonu olan `run`, çağrıldığında ilgili veritabanı düzeltme işlemini başlatır ve tamamlar.
- run

## Bağımlılıklar ve Mimari Notlar

- **İç bağımlılıklar:** Modülde yalnızca tek bir fonksiyon (`run`) tanımlıdır; dolayısıyla iç fonksiyon çağrısı yoktur.
- **Dış bağımlılıklar:** Kaynak kodda açıkça belirtilmemiştir; bilinmiyor.
- **Dinamik/lazy yükleme:** Kaynak kodda belirtilmemiştir; bilinmiyor.
- **Mimari önem:** Bu modül, veritabanı şeması veya sorgu katmanında yapılmış bir düzeltmeyi temsil eder. Migrasyon scriptleri tipik olarak tek seferlik çalıştırılır ve geriye dönük uyumluluğu korumak amacıyla tasarlanır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca mevcut sabitlerden çıkarılabilecek varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `pg` nesnesi erişilebilir değilse, veritabanı bağlantısı kurulamaz ve modül çalışamaz.

[Aksiyom 2]: Eğer `connectionString` tanımlı değilse, PostgreSQL istemcisi oluşturulamaz ve modül çalışamaz.

[Aksiyom 3]: Eğer `client` nesnesi oluşturulamazsa (new ifadesi başarısız olursa), veritabanı işlemleri gerçekleştirilemez.

---

**Not:** Fonksiyon gövdesi (`run()` içeriği) sağlanmadığından, modülün gerçek iş mantığına (hangi tablolar, hangi sorgular, hangi düzeltmeler yapıldığı) dair aksiyomlar üretilememektedir. Daha detaylı mimari varsayımlar için fonksiyon gövdesinin incelenmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### run
**Ne yapar**: `public.products` tablosu üzerinde PostgreSQL Row Level Security (RLS) SELECT politikasını uygulayan asenkron bir veritabanı migrasyon fonksiyonudur. Mevcut `prod_public_read_opt` politikasını kaldırır ve yerine herkesin (public rolü) tüm satırları okuyabilmesine izin veren yeni bir SELECT politikası oluşturur.

**Nasıl yapar**: Fonksiyon önce `client.connect()` ile veritabanına bağlanır. Bağlantı kurulduktan sonra tek bir SQL sorgusu çalıştırarak iki işlem gerçekleştirir: `DROP POLICY IF EXISTS` ile aynı ada sahip mevcut politika varsa kaldırır, ardından `CREATE POLICY` ile `prod_public_read_opt` adında yeni bir SELECT politikası tanımlar. Bu politika `USING (true)` koşuluyla tüm satırların okunabilir olmasını sağlar. İşlem başarılı olursa konsola başarı mesajı yazar. `catch` bloğunda hata yakalanır ve `_e` değişkeni `Error` tipine dönüştürülerek hata mesajı konsola yazdırılır. `finally` bloğunda her durumda `client.end()` çağrılarak veritabanı bağlantısı kapatılır.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz.

**Dönüş**: Dönüş tipi belirtilmemiştir; fonksiyon `async` olduğundan bir `Promise` döndürür ancak `return` ifadesi içermez, bu nedenle çözüm değeri yoktur.

---

## İTHALATLAR (IMPORTS)
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

### [N1_NASIL] AST Pointer: scripts/db/migrations/fix_products_select.ts::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `client` — `pg` modülünden oluşturulan PostgreSQL istemcisi; `connect()`, `query()` ve `end()` metotları çağrılarak veritabanı bağlantısı açılır, SQL sorgusu çalıştırılır ve bağlantı kapatılır
  - `_e` — `catch` bloğunda yakalanan ham hata nesnesi; `as Error` ile `Error` tipine dönüştürülerek `err` değişkenine atanır
  - `err` — `_e as Error` ifadesiyle oluşturulan, yakalanan hatayı tutan `Error` tipinde değişken; `err.message` özelliği `console.error` ile yazdırılır
- **Dönüş**: yok (async fonksiyon, `void` döndürür; yan etki olarak veritabanında `"prod_public_read_opt"` SELECT policy'si DROP edilip yeniden CREATE edilir)

---

## NODE ID STANDARD

  file: scripts\db\migrations\fix_products_select.ts
  function: scripts\db\migrations\fix_products_select.ts::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: run