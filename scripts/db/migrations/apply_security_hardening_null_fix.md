---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\scripts\db\migrations\apply_security_hardening_null_fix.js
skeleton_hash: ffc974185b4761bc
entity_hashes:
  func:loadEnv: 2234574fdca17aba
  func:run: b350b4246e72283c
  overview: af39be0dd406e441
generated_at: 2026-08-25T07:23:32Z
---

## Genel Bakış

Bu modül, veritabanı güvenlik sertleştirme (security hardening) kapsamında null değer düzeltmelerini uygulayan bir migration script'idir. `db/migrations` dizininde yer alır ve asenkron çalıştırma desteği sunar.

## Fonksiyon Grupları

### Ortam Yapılandırması
Ortam değişkenlerini yükleyerek modülün çalışması için gerekli yapılandırma değerlerini hazırlar.
- loadEnv

### Migration İşlemi
Güvenlik sertleştirme ile ilgili null değer düzeltme işlemini asenkron olarak çalıştırır.
- run

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### loadEnv
**Ne yapar**: Proje kök dizinindeki `.env` dosyasını okuyarak ortam değişkenlerini bir nesne (object) olarak döndürür. Dosya mevcut değilse boş bir nesne döner.

**Nasıl yapar**: Öncelikle `rootDir` ve `.env` dosya adını birleştirerek tam dosya yolunu oluşturur. Dosya mevcut değilse boş nesne döner ve işlemi sonlandırır. Dosya mevcutsa, içeriğini UTF-8 formatında okur. Her satırı satır sonu karakterine göre böler, ardından her satır için önce satır sonu `\r` karakterlerini temizler, `#` işaretinden sonrasını yorum olarak kabul edip atar ve kalan kısmı boşluklardan arındırır. Boş satırları atlar. Kalan satırları `=` işaretine göre böler; eğer en az iki parça varsa, ilk parçayı anahtar (`key`), geri kalan parçaları `=` ile birleştirerek değer (`value`) olarak alır. Değerin başındaki ve sonundaki tek/çift tırnak işaretlerini kaldırır. Sonuçta elde edilen key-value çiftlerini bir nesneye ekleyerek döndürür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `env` — `.env` dosyasındaki anahtar-değer çiftlerini içeren bir nesne. Dosya bulunamazsa boş nesne (`{}`) döner.

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
- **rootDir** (call) — `path.resolve(__dirname, '../../..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/apply_security_hardening_null_fix.js::loadEnv
- **params**: yok
- **ic_degiskenler**:
  - `envPath` — `path.join(rootDir, '.env')` ile oluşturulan .env dosyasının tam dosya yolu
  - `envContent` — `fs.readFileSync(envPath, 'utf8')` ile okunan .env dosyasının ham metin içeriği
  - `env` — parse edilen ortam değişkenlerini key-value çiftleri olarak tutan boş obje; fonksiyon sonunda dönüş değeri olarak döner
  - `line` — `envContent.split('\n').forEach` içindeki callback parametresi; .env dosyasının her bir satırını temsil eder
  - `cleanLine` — `line` değerinden `\r` karakteri kaldırıldıktan, `#` sonrasındaki yorum atıldıktan ve `trim()` uygulandıktan sonra elde edilen temizlenmiş satır metni
  - `parts` — `cleanLine.split('=')` ile elde edilen, `=` işaretine göre bölünmüş dizi
  - `key` — `parts[0].trim()` ile elde edilen ortam değişkeni adı; sadece `parts.length >= 2` koşulu sağlandığında atanır
  - `value` — `parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '')` ile elde edilen ortam değişkeni değeri; baştaki ve sondaki tırnak işaretleri kaldırılır
- **Dönüş**: `env` objesi (key-value çiftlerini içeren nesne)

### [N2_NASIL] AST Pointer: scripts/db/migrations/apply_security_hardening_null_fix.js::run
- **params**: yok
- **ic_degiskenler**:
  - `env` — `loadEnv()` çağrısının dönüşü; ortam değişkenlerini içeren obje
  - `connectionString` — `env.DATABASE_URL` erişimiyle elde edilen veritabanı bağlantı URL'si; bulunamazsa `process.exit(1)` ile çıkılır
  - `tryConnect` — `async (url) => { ... }` şeklinde tanımlanan ok fonksiyonu; verilen URL ile veritabanına bağlanmayı dener, başarılıysa `client` nesnesi, başarısızsa `null` döner
  - `url` — `tryConnect` fonksiyonunun parametresi; denenilecek veritabanı bağlantı URL'si
  - `maskedUrl` — `url.replace(/:([^:@]+)@/, ':****@')` ile elde edilen, şifre kısmı maskelenmiş URL; konsola uyarı mesajı olarak yazdırılır
  - `client` — `new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 })` ile oluşturulan `pg.Client` nesnesi; `tryConnect` içinde tanımlanır
  - `err` — `tryConnect` içindeki `catch` bloğunda yakalanan hata nesnesi; `err.message` ile hata mesajı konsola yazdırılır
  - `client` (dış kapsam) — `await tryConnect(connectionString)` ile elde edilen bağlantı nesnesi; başarısız olursa alternatif protokoller denenir
  - `directUrl` — `connectionString` üzerinde `.replace(':6543', ':5432').replace('.pooler.', '.').replace('?pgbouncer=true', '')` zincir uygulanarak oluşturulan doğrudan bağlantı URL'si; pooler protokolü başarısız olduğunda denenir
  - `comUrl` — `connectionString.replace('.supabase.co', '.supabase.com')` ile elde edilen .com varyasyonu URL'si; ikincil protokol başarısız olduğunda denenir
  - `migrationFile` — `'supabase/migrations/20260602090000_security_hardening_null_fix.sql'` sabit string değeri; çalıştırılacak SQL migration dosyasının göreli yolu
  - `sqlPath` — `path.join(rootDir, migrationFile)` ile elde edilen migration SQL dosyasının tam dosya yolu
  - `sql` — `fs.readFileSync(sqlPath, 'utf8')` ile okunan SQL dosyasının metin içeriği
  - `err` (son catch bloğu) — migration çalıştırma sırasında yakalanan hata nesnesi; konsola yazdırılır ve `process.exit(1)` ile çıkılır
- **Dönüş**: yok (void); yan etkileri: veritabanına bağlanır, SQL migration dosyasını çalıştırır, başarılı/başarısız durumda konsola mesaj yazar, başarısızlıkta `process.exit(1)` ile süreci sonlandırır, `finally` bloğunda `client.end()` ile bağlantıyı kapatır

---

## NODE ID STANDARD

  file: apply_security_hardening_null_fix.js
  function: apply_security_hardening_null_fix.js::loadEnv
  function: apply_security_hardening_null_fix.js::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run