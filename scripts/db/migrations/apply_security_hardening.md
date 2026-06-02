---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\migrations\apply_security_hardening.js
skeleton_hash: 286dac39d6297c4c
entity_hashes:
  func:loadEnv: cdc6628f011fa912
  func:run: fd679bba8501db22
  overview: af39be0dd406e441
generated_at: 2026-06-02T07:48:34Z
---

## Genel Bakış
Bu modül, veritabanı güvenliğini artırmak için gerekli olan yapılandırma ve izin ayarlarını otomatik olarak uygulayan bir migrasyon scriptidir. Ortam değişkenlerini yükleyerek veritabanı bağlantısını kurar ve güvenlik sertleştirme adımlarını sırasıyla çalıştırır.

## Fonksiyon Grupları
### Ortam Yönetimi
Veritabanı bağlantısı ve other configurations için gerekli ortam değişkenlerinin yüklenmesini sağlar.
- loadEnv

### Güvenlik Uygulama
Güvenlik sertleştirme işlemlerini asenkron olarak yürütür ve veritabanı üzerindeki izin, rol veya yapılandırma değişikliklerini hayata geçirir.
- run

---



---

## FONKSİYON DETAYLARI

### loadEnv
**Ne yapar**: Projenin kök dizinindeki `.env` dosyasını okuyarak ortam değişkenlerini bir JavaScript nesnesine dönüştürür. Dosya mevcut değilse boş bir nesne döner, böylece çağrııcı tarafında güvenli bir şekilde kullanılabilir.

**Nasıl yapar**: `.env` dosyasını UTF-8 olarak okuduktan sonra satır satır ayrıştırır. Her satırda önce `\r` karakterlerini temizler, ardından `#` ile başlayan yorum satırlarını atlar. Boş olmayan satırlarda `=` karakterine göre anahtar-değer ayrımı yapar; değerin başındaki ve sonundaki tekli veya çiftli tırnak işaretlerini kaldırır. Bu sayede `"value"`, `'value'` veya `value` formatındaki tüm değerler düzgün şekilde ayrıştırılır. Eşittir karakteri içeren değerlerde (örn. connection string'ler) `parts.slice(1).join('=')` yaklaşımı ile değer portionunun tamamı korunur.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `Object` — `.env` dosyasındaki anahtar-değer çiftlerini içeren bir nesne. Dosya yoksa `{}` boş nesne döner.

### run
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **__dirname** (call) — `path.dirname(fileURLToPath(import.meta.url))`
- **rootDir** (call) — `path.resolve(__dirname, '../../..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/apply_security_hardening.js::loadEnv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `envPath` — `.env` dosyasının tam dosya yolu (`rootDir` ile `path.join` ile birleştirilmiş)
  - `envContent` — `.env` dosyasının `utf8` olarak okunmuş ham string içeriği
  - `env` — parse edilmiş environment değişkenlerini `{key: value}` formatında tutan boş obje
  - `line` — `envContent.split('\n')` ile elde edilen her bir satır (forEach callback parametresi)
  - `cleanLine` — `\r` karakterleri temizlenmiş, `#` ile başlayan yorum kısımları çıkarılmış, trimmed edilmiş satır
  - `parts` — `cleanLine.split('=')` ile `=` karakterine göre bölünmüş array; `parts[0]` key, `parts[1..]` value katmanları
  - `key` — `parts[0].trim()` ile elde edilen environment değişkeninin adı
  - `value` — `parts.slice(1).join('=').trim()` ile birleştirilmiş, baştaki/sondaki tırnak işaretleri `replace(/^['"]|['"]$/g, '')` ile kaldırılmış değişken değeri
- **Dönüş**: `env` objesi — `{key: value}` çiftlerinden oluşan parse edilmiş environment sözlüğü; `.env` dosyası yoksa boş obje `{}` döner

---

### [N2_NASIL] AST Pointer: scripts/db/migrations/apply_security_hardening.js::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `env` — `loadEnv()` çağrı sonucu dönen environment değişkenleri sözlüğü
  - `connectionString` — `env.DATABASE_URL` erişimi ile elde edilen PostgreSQL bağlantı URL'si; `env` dict subscript access
  - `tryConnect` — iç içe tanımlanmış async fonksiyon; parametresi `url`, veritabanı bağlantısı denemesi yapar, başarılıysa `client` nesnesi, başarısızsa `null` döner
    - *tryConnect内部変数*:
      - `url` — tryConnect parametresi, bağlanılacak veritabanı URL'si
      - `maskedUrl` — `url.replace(/:([^:@]+)@/, ':****@')` ile parolası maskelenmiş URL (loglama amaçlı)
      - `client` — `new Client({connectionString: url, ssl: {rejectUnauthorized: false}, connectionTimeoutMillis: 15000})` ile oluşturulmuş `pg.Client` nesnesi
      - `err` — `client.connect()` sırasında yakalanan hata nesnesi
  - `client` — `tryConnect(connectionString)` çağrı sonucu; başarılıysa `pg.Client` nesnesi, başarısızsa `null`
  - `directUrl` — pooler bağlantısı başarısızsa denenen alternatif URL; `:6543` → `:5432`, `.pooler.` → `.`, `?pgbouncer=true` → kaldırılmış hali
  - `comUrl` — `.supabase.co` başarısızsa denenen `.supabase.com` varyasyonu
  - `migrationFile` — `'supabase/migrations/20260602080000_security_hardening_fixes.sql'` sabit string, uygulanacak SQL dosyasının göreli yolu
  - `sqlPath` — `path.join(rootDir, migrationFile)` ile elde edilen migration dosyasının tam yolu
  - `sql` — `fs.readFileSync(sqlPath, 'utf8')` ile okunmuş SQL migration içeriği
  - `err` — `client.query(sql)` veya `tryConnect` içinde yakalanan hata nesnesi
- **Dönüş**: yok — fonksiyon success durumunda migration'ı çalıştırıp sessizce biter; hata durumunda `process.exit(1)` ile sürecin sonlanmasını tetikler (yan etkiler: DB bağlantısı, SQL migration yürütülmesi, konsol loglama)

---

## NODE ID STANDARD

  file: scripts\db\migrations\apply_security_hardening.js
  function: scripts\db\migrations\apply_security_hardening.js::loadEnv
  function: scripts\db\migrations\apply_security_hardening.js::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run