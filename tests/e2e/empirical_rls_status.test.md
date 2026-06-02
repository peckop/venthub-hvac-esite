---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\tests\e2e\empirical_rls_status.test.ts
skeleton_hash: d6092f24f2931eb0
entity_hashes:
  func:getDatabaseUrl: af4a6b6385f9a9b1
  overview: 7a888f9d41d18719
generated_at: 2026-06-02T07:54:43Z
---

## Genel Bakış
Bu modül, test süreçleri için gerekli olan veritabanı bağlantı URL'sini sağlayan basit bir yardımcı modüldür. Genellikle uçtan uca (e2e) testlerde veritabanı bağlantısının yapılandırılmasında ve test ortamının hazırlanmasında kullanılır.

## Fonksiyon Grupları
### Yardımcı Fonksiyonlar
Test ortamı yapılandırmasına ilişkin temel bilgileri sağlar.
- getDatabaseUrl

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen fonksiyon imzası ve sabitlere dayanan varsayımlar:

[Aksiyom 1]: Eğer `DATABASE_URL` ortam değişkeni yoksa, `getDatabaseUrl()` fonksiyonu hata döndürür veya `undefined` döner (bilinmiyor).
[Aksiyom 2]: Eğer `DATABASE_URL` geçerli bir veritabanı URL’si formatında değilse (örn. `postgresql://...`), `getDatabaseUrl()` tarafından döndürülen URL veritabanı bağlantısı kurulamaz.
[Aksiyom 3]: Eğer `getDatabaseUrl()` bir varsayılan değer döndürüyorsa (örn. test ortamı için), bu değerin `DATABASE_URL` ortam değişkenine eşit olmadığı veya ortam değişkeninin tanımlı olmadığı varsayılır.
[Aksiyom 4]: Eğer `DATABASE_URL` ortam değişkeni tanımlıysa, `getDatabaseUrl()` bu değeri olduğu gibi döndürür (ek bir işleme tabi tutulmaz).

**Not:** Fonksiyon gövdesine erişilemediği için, `getDatabaseUrl()`'in iç mantığı (hata yönetimi, varsayılan değer üretimi, ortam değişkeni okuma mekanizması) bilinmemektedir. Yukarıdaki varsayımlar, fonksiyon adı ve imzasından çıkan genel beklentilere dayanmaktadır.

---

## FONKSİYON DETAYLARI

### getDatabaseUrl
**Ne yapar**: Proje kök dizinindeki `.env` dosyasından `DATABASE_URL` değişkeninin değerini okur ve döndürür. Bu fonksiyon, veritabanı bağlantısı için gerekli olan URL bilgisini uygulama başlatma sürecinde yapılandırmak amacıyla kullanılır.

**Nasıl yapar**: Fonksiyon önce `process.cwd()` metodunu kullanarak mevcut çalışma dizinini belirler ve bu dizin üzerine `.env` dosyasının tam yolunu `path.resolve` ile oluşturur. Ardından `fs.readFileSync` ile bu dosyanın içeriği senkron olarak okunur. Okunan içerik üzerinde bir düzenli ifade (regex) kullanılarak, herhangi bir satırda başlayan `DATABASE_URL=` kalıbı aranır ve eşleşen grubun birinci elemanı (yani `=` işaretinden sonraki tüm değer) çıkarılır. Bulunan değer `trim()` metodu ile baştaki ve sondaki boşluklardan temizlendikten sonra döndürülür.

**Parametreler**: Fonksiyon parametre almaz.

**Dönüş**: `string` — `.env` dosyasından okunan ve temizlenmiş `DATABASE_URL` değeri.

**Hata Durumları**:
- `.env` dosyası okunamazsa veya belirtilen yolda yoksa `fs.readFileSync` bir hata fırlatır.
- Dosya içeriğinde `DATABASE_URL=(.+)$` kalıbıyla eşleşen bir satır bulunamazsa, `DATABASE_URL not found in .env` mesajıyla bir `Error` nesnesi fırlatılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/empirical_rls_status.test.ts::getDatabaseUrl
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `envPath` — Proje kök dizinindeki `.env` dosyasının mutlak yolu
  - `envContent` — `.env` dosyasının tüm içeriği (string)
  - `match` — Dosya içeriği üzerindeki regex eşleşmesinin sonucu (match[1] ile DATABASE_URL değeri alınır)
- **Dönüş**: `string` (.env dosyasındaki DATABASE_URL değeri)

### [N2_NASIL] AST Pointer: tests/e2e/empirical_rls_status.test.ts::it('should find any table with RLS disabled') (arrow fonksiyon)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `connectionString` — getDatabaseUrl() çağrısından elde edilen veritabanı bağlantı adresi
  - `client` — pg.Client örneği, veritabanı bağlantısı için kullanılır
  - `res` — client.query() çağrısının sonucu, pg_class tablosundaki sütun bilgilerini içerir
  - `disabled` — RLS'i devre dışı olan tablo adlarının dizisi (res.rows filtrelenip dönüştürülerek oluşturulur)
  - `criticalTables` — Kritik tabloların adlarını içeren dizi (RLs Kontrolü için kullanılır)
  - `table` — for döngüsünde her bir kritik tablo adını temsil eder
- **Dönüş**: yok (test asserciónlarını çalıştırır, yan etki olarak konsola çıktı yazdırır)

### [N3_NASIL] AST Pointer: tests/e2e/empirical_rls_status.test.ts::async () => (async arrow fonksiyon)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `connectionString` — getDatabaseUrl() çağrısından elde edilen veritabanı bağlantı adresi
  - `client` — pg.Client örneği, veritabanı bağlantısı için kullanılır
  - `res` — client.query() çağrısının sonucu, pg_class tablosundaki sütun bilgilerini içerir
  - `disabled` — RLS'i devre dışı olan tablo adlarının dizisi (res.rows filtrelenip dönüştürülerek oluşturulur)
  - `criticalTables` — Kritik tabloların adlarını içeren dizi (RLS Kontrolü için kullanılır)
  - `table` — for döngüsünde her bir kritik tablo adını temsil eder
- **Dönüş**: yok (test asserciónlarını çalıştırır, yan etki olarak konsola çıktı yazdırır)

---

## NODE ID STANDARD

  file: tests\e2e\empirical_rls_status.test.ts
  function: tests\e2e\empirical_rls_status.test.ts::getDatabaseUrl

---

## DISA AKTARILANLAR (EXPORTS)
  export: getDatabaseUrl