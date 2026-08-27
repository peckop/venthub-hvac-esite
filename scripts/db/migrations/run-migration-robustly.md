---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\run-migration-robustly.mjs
skeleton_hash: b01bb4c9c422ea03
entity_hashes:
  func:loadEnv: 0ac30631794e604c
  func:run: 24f8c80009d8407d
  overview: af39be0dd406e441
generated_at: 2026-08-27T12:30:43Z
---

## Genel Bakış
Bu modül, veritabanı migrasyonlarını sağlam ve dayanıklı bir şekilde çalıştırmak için kullanılan bir betik dosyasıdır. Modül, ortam değişkenlerini yükleyerek gerekli yapılandırmayı hazırlar ve ardından migrasyon işlemini yürütür. "Robustly" ifadesi, hata toleransı ve güvenilir çalıştırma odaklı bir tasarım izlediğini gösterir.

## Fonksiyon Grupları

### Ortam Yapılandırması
Ortam değişkenlerini yükleyerek migrasyon işlemi için gerekli yapılandırma değerlerini hazırlar.
- loadEnv

### Migrasyon Yürütme
Veritabanı migrasyonunu çalıştırır; ana iş akışını başlatan ve yöneten fonksiyondur.
- run

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca mevcut sabit ve imza bilgilerinden çıkarım yapılabilmektedir.

[Aksiyom 1]: Eğer `pg` sabiti yoksa, PostgreSQL veritabanı bağlantısı kurulamaz ve migration çalıştırılamaz.

[Aksiyom 2]: Eğer `__dirname` sabiti yoksa, modülün bulunduğu dizin yolu hesaplanamaz; bu durumda `rootDir` hesaplaması da gerçekleştirilemez.

[Aksiyom 3]: Eğer `rootDir` sabiti yoksa, proje kök dizini belirlenemem; bu durumda migration dosyalarına veya konfigürasyon dosyalarına erişim sağlanamaz.

[Aksiyom 4]: Eğer `loadEnv()` fonksiyonu ortam değişkenlerini başarıyla yüklemezse, veritabanı bağlantı bilgileri (host, port, kullanıcı adı, şifre, veritabanı adı) elde edilemez ve `run()` fonksiyonu çalıştırılamaz.

[Aksiyom 5]: Eğer `run()` fonksiyonu asenkron olarak tanımlanmışken uygun bir await mekanizması yoksa, migration işlemi tamamlanmadan sonraki işlemler başlatılabilir ve veri tutarsızlığı oluşabilir.

**Not:** Fonksiyon gövdeleri sağlanmadığından, modülün içerdiği hata yönetimi stratejisi, retry mekanizması, rollback davranışı veya migration dosyası formatı hakkında bilgi bulunmamaktadır. Bu bilgiler "bilinmiyor" olarak değerlendirilmelidir.

---

## FONKSİYON DETAYLARI

### loadEnv
**Ne yapar**: Proje kök dizinindeki `.env` dosyasını okuyarak ortam değişkenlerini bir nesne (obje) olarak yükler ve döndürür. Dosya mevcut değilse boş bir nesne döner.

**Nasıl yapar**: `rootDir` değişkeni kullanılarak `.env` dosyasının tam yolu oluşturulur. `fs.existsSync` ile dosya varlığı kontrol edilir; yoksa boş nesne döndürülerek işlem sonlandırılır. Dosya mevcutsa `fs.readFileSync` ile UTF-8 formatında okunur. Okunan içerik satır satır ayrıştırılır; her satırdan `\r` karakterleri temizlenir, `#` işaretinden sonraki yorum kısımları atılır ve boş satırlar yok sayılır. Kalan satırlar `=` işaretine göre bölünür; ilk parça anahtar (key), geri kalan parçalar `=` ile birleştirilerek değer (value) olarak alınır. Değerin başındaki ve sonundaki tek/çift tırnak işaretleri kaldırılır. Elde edilen key-value çiftleri bir nesneye eklenir ve bu nesne döndürülür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `env` — Anahtar-değer çiftlerini içeren bir nesne (object). Her anahtar `.env` dosyasındaki değişken adını, her değer ise karşılık gelen string değerini temsil eder.

### run
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: fs::fs
- import: path::path
- import: pg::pg
- import: url::fileURLToPath

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **__dirname** (call) — `path.dirname(fileURLToPath(import.meta.url))`
- **rootDir** (call) — `path.resolve(__dirname, '..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\tmp\vh-t088\scripts\db\migrations\run-migration-robustly.mjs::loadEnv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `envPath` — `path.join(rootDir, '.env')` ile oluşturulan .env dosyasının tam yolu
  - `envContent` — `fs.readFileSync(envPath, 'utf8')` ile okunan .env dosyasının metin içeriği
  - `env` — boş nesne olarak başlatılır, parse edilen key-value çiftlerini tutar
  - `line` — `envContent.split('\n').forEach` callback'inde işlenen her satır
  - `cleanLine` — `line`'dan `\r` karakterleri kaldırıldıktan, `#` sonrasındaki yorumlar atıldıktan ve `trim()` uygulandıktan sonraki satır; boşsa `return` ile atlanır
  - `parts` — `cleanLine.split('=')` ile elde edilen dizi; uzunluğu 2'den küçükse satır atlanır
  - `key` — `parts[0].trim()` ile elde edilen ortam değişkeni adı
  - `value` — `parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '')` ile elde edilen ortam değişkeni değeri; baştaki ve sondaki tırnak işaretleri temizlenir
- **Dönüş**: `env` nesnesi (key-value çiftleri)

### [N2_NASIL] AST Pointer: C:\tmp\vh-t088\scripts\db\migrations\run-migration-robustly.mjs::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `env` — `loadEnv()` çağrısının dönüşü, ortam değişkenlerini içeren nesne
  - `connectionString` — `env.DATABASE_URL` değeri; bulunamazsa hata mesajı yazdırılıp `process.exit(1)` ile çıkılır
  - `tryConnect` — inner async fonksiyon; `url` parametresi alır, `Client` nesnesi oluşturup bağlanmayı dener, başarılıysa `client` döner, başarısızsa `null` döner
  - `client` — `tryConnect` çağrılarının dönüşü, `Client` nesnesi veya `null`
  - `directUrl` — `connectionString`'den `:6543` yerine `:5432`, `.pooler.` yerine `.`, `?pgbouncer=true` kaldırılarak oluşturulan doğrudan bağlantı URL'i
  - `comUrl` — `connectionString`'deki `.supabase.co` yerine `.supabase.com` kullanılan varyasyon
  - `migrationFile` — `'supabase/migrations/20251218_wizard_selections.sql'` sabit dizesi
  - `sqlPath` — `path.join(rootDir, migrationFile)` ile oluşturulan migration dosyasının tam yolu; dosya yoksa hata mesajı yazdırılıp `process.exit(1)` ile çıkılır
  - `sql` — `fs.readFileSync(sqlPath, 'utf8')` ile okunan SQL içeriği
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `err.message` konsola yazdırılır
- **Dönüş**: yok (void)

### [N3_NASIL] AST Pointer: C:\tmp\vh-t088\scripts\db\migrations\run-migration-robustly.mjs::tryConnect (inner fonksiyon)
- **params**: `url` — denenmek istenen veritabanı bağlantı URL'i
- **ic_degiskenler**:
  - `maskedUrl` — `url.replace(/:([^:@]+)@/, ':****@')` ile şifre kısmı maskelenmiş URL; konsola yazdırılır
  - `client` — `new Client({connectionString: url, ssl: {rejectUnauthorized: false}, connectionTimeoutMillis: 10000})` ile oluşturulan PostgreSQL istemci nesnesi
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `err.message` konsola yazdırılır
- **Dönüş**: başarılı bağlantıda `client` nesnesi, hata durumunda `null`

---

## NODE ID STANDARD

  file: scripts\db\migrations\run-migration-robustly.mjs
  function: scripts\db\migrations\run-migration-robustly.mjs::loadEnv
  function: scripts\db\migrations\run-migration-robustly.mjs::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run