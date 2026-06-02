---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\tests\e2e\empirical_db_audit_2.test.ts
skeleton_hash: d165f931485962cc
entity_hashes:
  func:getDatabaseUrl: af4a6b6385f9a9b1
  overview: 7a888f9d41d18719
generated_at: 2026-06-02T07:53:30Z
---

## Genel Bakış
Bu modül, uygulamanın empirik veritabanı denetim testlerini (audit) çalıştırmak için kullanılan bir uçtan uca test modülüdür. Modül, test ortamının veritabanı bağlantısını sağlamakla yükümlüdür.

## Fonksiyon Grupları
### Veritabanı Yapılandırma Yardımcıları
Testlerin çalıştırılacağı veritabanı bağlantısını sağlayan yardımcı fonksiyonları içerir.
- getDatabaseUrl

---



---

## FONKSİYON DETAYLARI

### getDatabaseUrl
**Ne yapar**: Uygulamanın çalışma dizinindeki `.env` dosyasını okuyarak `DATABASE_URL` ortam değişkeninin değerini bulur ve döndürür.

**Nasıl yapar**: Fonksiyon, `process.cwd()` metodunu kullanarak proje dizinini belirler ve `path.resolve` ile tam dosya yolunu oluşturur. Ardından `fs.readFileSync` ile `.env` dosyasının tüm içeriğini okur. Düzenli ifade (regex) kullanarak `DATABASE_URL=` ile başlayan ve satır sonuna kadar olan kısmı eşleştirir. Eşleşme bulunamazsa hata fırlatır, bulunursa value kısmını (`trim()` ile boşluklardan arındırarak) döndürür.

**Parametreler**:
- Fonksiyon parametre almaz.

**Dönüş**: `string` — `.env` dosyasından okunan `DATABASE_URL` değeri.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/empirical_db_audit_2.test.ts::getDatabaseUrl
- **params**: (yok)
- **ic_degiskenler**:
  - `envPath` — `.env` dosyasının mutlak yolu; `path.resolve(process.cwd(), '.env')` ile hesaplanır
  - `envContent` — `.env` dosyasının ham string içeriği; `fs.readFileSync` ile okunur
  - `match` — `DATABASE_URL` pattern'ine uyan regex eşleşme sonucu; `[1]` ile değerin kendisi alınır; eşleşme yoksa `null` döner
- **Dönüş**: `string` — `match[1].trim()` ile temizlenmiş DATABASE_URL değeri

### [N2_NASIL] AST Pointer: tests/e2e/empirical_db_audit_2.test.ts::(dış_arrow_function)
- **params**: (yok)
- **ic_degiskenler**:
  (hiçbir değişken tanımlamaz, sadece `it(...)` çağrısı yapar)
- **Dönüş**: yok — sadece `it` bloğunu tetikleyen dış sarmalayıcı arrow function

### [N3_NASIL] AST Pointer: tests/e2e/empirical_db_audit_2.test.ts::it_callback_async
- **params**: (yok) — `it('dump remaining admin functions', async () => { ... })` callback'i
- **ic_degiskenler**:
  - `connectionString` — `getDatabaseUrl()` dönüşünden elde edilen PostgreSQL bağlantı URL'i
  - `client` — `new pg.Client({ connectionString })` ile oluşturulan PostgreSQL istemcisi; bağlantıyı temsil eder
  - `targetFunctions` — `string[]` array; incelenmesi istenen PostgreSQL fonksiyon isimleri: `admin_list_users`, `admin_list_all_users`, `get_admin_users`, `get_products_enriched`
  - `name` — `for...of` döngüsü içindeki mevcut fonksiyon adı; her iterasyonda `targetFunctions`'dan bir değer alır
  - `res` — `client.query(...)` dönüşü; PostgreSQL sorgu sonucu nesnesi, `rows` alanı taşır
  - `row` — `res.rows` içindeki tek bir satır nesnesi (her iterasyonda bir satır)
    - `row.name` — `p.proname` sütunundan gelen fonksiyon adı
    - `row.arguments` — `pg_get_function_identity_arguments` ile elde edilen fonksiyon argüman listesi
    - `row.definition` — `pg_get_functiondef` ile elde edilen fonksiyonun tam SQL tanımı
- **Dönüş**: yok — `console.log` ile fonksiyon tanımlarını ekrana yazdırır, yan etkisi konsol çıktısıdır; `finally` bloğunda `client.end()` ile bağlantıyı kapatır

### [N4_NASIL] AST Pointer: tests/e2e/empirical_db_audit_2.test.ts::async_standalone_arrow
- **params**: (yok)
- **ic_degiskenler**:
  - `connectionString` — `getDatabaseUrl()` dönüşünden elde edilen PostgreSQL bağlantı URL'i
  - `client` — `new pg.Client({ connectionString })` ile oluşturulan PostgreSQL istemcisi
  - `targetFunctions` — `string[]` array; incelenmesi istenen PostgreSQL fonksiyon isimleri: `admin_list_users`, `admin_list_all_users`, `get_admin_users`, `get_products_enriched`
  - `name` — `for...of` döngüsü içindeki mevcut fonksiyon adı
  - `res` — `client.query(...)` dönüşü; sorgu sonucu nesnesi
  - `row` — `res.rows` içindeki tek bir satır nesnesi
    - `row.name` — fonksiyon adı
    - `row.arguments` — fonksiyon argüman listesi
    - `row.definition` — fonksiyonun tam SQL tanımı
- **Dönüş**: yok — N3 ile aynı mantığı çalıştırır; `console.log` ile fonksiyon tanımlarını yazdırır, `finally` bloğunda `client.end()` ile bağlantıyı sonlandırır

---

## NODE ID STANDARD

  file: tests\e2e\empirical_db_audit_2.test.ts
  function: tests\e2e\empirical_db_audit_2.test.ts::getDatabaseUrl

---

## DISA AKTARILANLAR (EXPORTS)
  export: getDatabaseUrl