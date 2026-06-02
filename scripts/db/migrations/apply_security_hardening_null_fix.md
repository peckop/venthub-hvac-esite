---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\migrations\apply_security_hardening_null_fix.js
skeleton_hash: a99acb55102acf8b
entity_hashes:
  func:loadEnv: cdc6628f011fa912
  func:run: 98cd85a3cc55432b
  overview: af39be0dd406e441
generated_at: 2026-06-02T07:49:00Z
---

## Genel Bakış
Bu modül, veritabanı tablolarındaki güvenlikle ilgili null değer sorunlarını düzeltmek için tasarlanmış bir migration scriptidir. Veritabanı bağlantısı için gerekli ortam değişkenlerini yükleyerek güvenlik sertleştirmesi (hardening) işlemlerini yürütür.

## Fonksiyon Grupları
### Yapılandırma Yönetimi
Ortam değişkenlerini ve veritabanı bağlantı bilgilerini yükleyerek scriptin çalışması için gerekli yapılandırma değerlerini hazırlar.
- loadEnv

### Migration İşlemleri
Güvenlik sertleştirmesi ile ilgili null düzeltmelerini veritabanına uygulayan asenkron ana işlemi yönetir.
- run

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediği için spesifik mimari varsayımlar üretilememektedir. Fonksiyon imzaları (`loadEnv()` ve `run()`) yalnızca imza bilgisi içeriyor; parametre, default değer veya geri dönüş tipi hakkında bilgi sunmuyor.

Genel olarak bir `apply_security_hardening_null_fix.js` migrasyonu için **beklenen** aksiyomlar şunlardır:

- **[Aksiyom 1]:** Eğer `pg` (PostgreSQL istemcisi) bağlantısı mevcut veya erişilebilir değilse, veritabanı bağlantısı başarısız olur ve migrasyon çalıştırılamaz.

- **[Aksiyom 2]:** Eğer `rootDir` doğru bir dizin referansı döndürmüyor (örn. geçersiz `__dirname` çağrısı) veya migrasyon dosyası o dizinde değilse, dosya okuma/çalıştırma hatası oluşur.

> **Not:** Bu aksiyomlar modülün **adı ve parametrelerinden** genel olarak türetilmiştir; `pg` ve `rootDir`/`__dirname` sabitlerinin varlığı fonksiyon gövdesi olmadan doğrulanamaz. Kesin aksiyom üretimi için fonksiyon gövdesine ihtiyaç vardır.

---

## FONKSİYON DETAYLARI

### loadEnv

**Ne yapar**: Proje kök dizinindeki `.env` dosyasını okuyarak içindeki tüm ortam değişkenlerini bir JavaScript nesnesine dönüştürür. Dosya mevcut değilse boş bir nesne döner.

**Nasıl yapar**: Önce `.env` dosyasının varlığını `fs.existsSync` ile kontrol eder. Dosya varsa, içeriğini UTF-8 olarak okur ve satır satır işler. Her satırda önce `\r` karakterlerini temizler, ardından `#` ile başlayan yorum satırlarını `split('#')[0]` ifadesiyle atar. Boş olmayan satırlarda `=` karakterine göre ayrıştırma yaparak anahtar-değer çiftlerini çıkarır. Değerlerdeki tırnak işaretlerini (`'` ve `"`) temizleyerek temiz bir nesne döndürür.

**Parametreler**:
- Parametre yoktur.

**Dönüş**: `object` — Anahtarları ortam değişkeni adları, değerleri ise对应的 değerler olan bir JavaScript nesnesi döndürür. `.env` dosyası yoksa boş bir nesne (`{}`) döner.

### run
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **__dirname** (call) — `path.dirname(fileURLToPath(import.meta.url))`
- **rootDir** (call) — `path.resolve(__dirname, '../../..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/apply_security_hardening_null_fix.js::loadEnv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `envPath` — `.env` dosyasının disk üzerindeki mutlak yolu; `rootDir` ile `'.env'` adının `path.join` ile birleştirilmesiyle oluşur
  - `envContent` — `.env` dosyasının ham string içeriği; `fs.readFileSync` ile UTF-8 olarak okunur
  - `env` — parse edilmiş `{ key: value }` çiftlerini tutan başlangıçta boş obje; fonksiyonun dönüş değeridir
  - `line` — `envContent.split('\n').forEach` callback parametresi; `.env` dosyasının her bir satırını temsil eder
  - `cleanLine` — `line` üzerinde `\r` temizleme, `#` ile yorum kırpma ve `trim` uygulanmış hali; boşsa `return` ile atlanır
  - `parts` — `cleanLine`'ın `'='` karakterine göre `split` edilmiş hali; en az 2 elemanlı olmalı
  - `key` — `parts[0].trim()`; ortam değişkeni adı (ör. `DATABASE_URL`)
  - `value` — `parts.slice(1).join('=').trim()` ile birleştirilmiş, baş/son tırnak işaretleri (`replace(/^['"]|['"]$/g, '')`) temizlenmiş ortam değişkeni değeri
- **Dict Erişimleri**: `env[key] = value` — parsed değişkenleri `env` objesine yazma
- **Dönüş**: `env` objesi (boş obje `{}` veya `{ [key: string]: string }`)

---

### [N2_NASIL] AST Pointer: scripts/db/migrations/apply_security_hardening_null_fix.js::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `env` — `loadEnv()` çağrısının dönüşünden elde edilen `.env` ortam değişkenleri objesi
  - `connectionString` — `env.DATABASE_URL` değerinden alınan veritabanı bağlantı stringi; tanımsızsa script `process.exit(1)` ile sonlanır
  - `tryConnect` — `run()` içinde tanımlı inner async arrow function; verilen URL ile PostgreSQL bağlantısı kurmayı dener
  - `client` — `pg.Client` nesnesi; `tryConnect` çağrısıyla elde edilen veritabanı bağlantısı; başarısız olursa `null` kalır
  - `directUrl` — `connectionString` üzerinde port (`:6543` → `:5432`), alan adı (`.pooler.` → `.`) ve parametre (`?pgbouncer=true` → silme) düzeltmeleri yapılmış alternatif URL
  - `comUrl` — `connectionString` üzerinde `.supabase.co` → `.supabase.com` dönüşümü yapılmış ikinci alternatif URL
  - `migrationFile` — SQL migration dosyasının göreli yolu (`'supabase/migrations/20260602090000_security_hardening_null_fix.sql'`)
  - `sqlPath` — `rootDir` ile `migrationFile`'ın `path.join` ile birleştirilmesiyle elde edilen tam dosya yolu
  - `sql` — SQL migration dosyasının ham içeriği; `fs.readFileSync` ile UTF-8 olarak okunur
  - `err` — `try/catch` bloklarından yakalanan hata nesnesi
- **Dict Erişimleri**: `env.DATABASE_URL` — ortam değişkeninden veritabanı URL değerini okuma
- **İç Fonksiyonlar**: `tryConnect` → `[N3_NASIL]`
- **Dönüş**: yok (yan etki: veritabanına bağlanıp SQL migration'ı çalıştırır; başarısız olursa `process.exit(1)` ile sonlanır)

---

### [N3_NASIL] AST Pointer: scripts/db/migrations/apply_security_hardening_null_fix.js::run::tryConnect
- **params**: `url` — PostgreSQL veritabanı bağlantı URL'i (string)
- **ic_degiskenler**:
  - `maskedUrl` — `url` içindeki parola portionını (`:password@` → `:****@`) maskelenmiş hali; loglama için güvenli gösterim sağlar
  - `client` — `new pg.Client(...)` ile oluşturulan PostgreSQL istemci nesnesi; `ssl: { rejectUnauthorized: false }`, `connectionTimeoutMillis: 15000` yapılandırmasıyla başlatılır
  - `err` — `client.connect()` sırasında yakalanan hata nesnesi; hata mesajı loglanır
- **Dönüş**: başarılıysa `client` (pg.Client nesnesi), başarısızsa `null`

---

## NODE ID STANDARD

  file: scripts\db\migrations\apply_security_hardening_null_fix.js
  function: scripts\db\migrations\apply_security_hardening_null_fix.js::loadEnv
  function: scripts\db\migrations\apply_security_hardening_null_fix.js::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run