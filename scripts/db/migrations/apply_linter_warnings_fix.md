---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\migrations\apply_linter_warnings_fix.js
skeleton_hash: 1202bd4938dd3b44
entity_hashes:
  func:loadEnv: cdc6628f011fa912
  func:run: 9ae5fe202faa10e9
  overview: af39be0dd406e441
generated_at: 2026-06-02T20:21:10Z
---

## Genel Bakış
Bu modül, proje linter uyarılarını otomatik olarak tespit edip düzeltmeleri uygulamak için tasarlanmış bir betik düzeltme yardımcısıdır. Modül, gerekli ortam değişkenlerini yükledikten sonra linter uyarılarını analiz eder ve tanımlı düzeltme kurallarını kod tabanına otomatik olarak yansıtır.

## Fonksiyon Grupları
### Ortam ve Yapılandırma Yönetimi
Uygulamanın çalışması için gerekli ortam değişkenlerini ve yapılandırma parametrelerini yükler.
- loadEnv

### Otomatik Düzeltme İşlemi
Linter uyarılarını tarar, analiz eder ve belirlenen düzeltme stratejilerini kod dosyalarına uygular.
- run

---

## AXIOMS – Mimari Varsayımlar
Bu modül, veritabanı migrasyonlarını uygulayan bir betik olup temel olarak ortam yapılandırması ve dosya sistemi erişimine bağımlıdır.

[Aksiyom 1]: Eğer `pg` nesnesi (muhtemelen veritabanı istemcisi) doğru şekilde tanımlanmamış veya kullanılabilir bir veritabanı bağlantısı nesnesi değilse, `run()` fonksiyonu veritabanına bağlanamaz ve migrasyonlar uygulanamaz.
[Aksiyom 2]: Eğer `loadEnv()` fonksiyonu

---

## FONKSİYON DETAYLARI

### loadEnv

**Ne yapar**: Proje kök dizinindeki `.env` dosyasını okur ve içindeki ortam değişkenlerini bir JavaScript nesnesine dönüştürerek döndürür. Dosya mevcut değilse boş bir nesne döner.

**Nasıl yapar**: `.env` dosyasının varlığını kontrol eder, varsa içeriğini satır satır okur. Her satırda önce yorum satırlarını (`#` ile başlayan kısımları) temizler, sonra `=` karakterinden bölerek anahtar-değer çiftlerini çıkarır. Değerlerdeki tırnak işaretlerini (`'` veya `"`) temizleyerek temiz bir nesne oluşturur.

**Parametreler**:
- Bu fonksiyonun herhangi bir parametresi yoktur.

**Dönüş**: `Object` — Anahtarları ortam değişkeni adları, değerleri ise ilgili değişken değerleri olan bir nesne döndürür. Dosya bulunamazsa `{}` boş nesne döner.

### run
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **__dirname** (call) — `path.dirname(fileURLToPath(import.meta.url))`
- **rootDir** (call) — `path.resolve(__dirname, '../../..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/apply_linter_warnings_fix.js::loadEnv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `envPath` — .env dosyasının tam yolu, `path.join(rootDir, '.env')` ile oluşturulur
  - `envContent` — .env dosyasının string içeriği, `fs.readFileSync()` ile okunur
  - `env` — parse edilmiş .env değişkenlerini tutan boş obje, return edilir
- **Dönüş**: `{ [key: string]: string }` objesi veya boş obje `{}` (dosya yoksa)

### [N2_NASIL] AST Pointer: scripts/db/migrations/apply_linter_warnings_fix.js::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `env` — `loadEnv()` çağrısıyla elde edilen .env değişkenleri objesi
  - `connectionString` — `env.DATABASE_URL` değerinden alınan veritabanı bağlantı URL'si
  - `tryConnect` — async fonksiyon, veritabanına bağlanmayı dener ve client veya null döner
  - `client` — pg.Client instance, veritabanı bağlantısı temsil eder
  - `directUrl` — pooler bağlantısı başarısızsa denenek için değiştirilmiş doğrudan bağlantı URL'si
  - `comUrl` — .supabase.co başarısızsa denenek için .supabase.com variantı URL
  - `migrationFile` — SQL migration dosyasının göreli yolu (sabit string)
  - `sqlPath` — migration dosyasının tam yolu, `path.join(rootDir, migrationFile)` ile oluşturulur
  - `sql` — SQL dosyasının string içeriği, `fs.readFileSync()` ile okunur
- **Dönüş**: yok (process.exit() ile sonlanır veya try-catch-finally ile temizlenir)

---

## NODE ID STANDARD

  file: scripts\db\migrations\apply_linter_warnings_fix.js
  function: scripts\db\migrations\apply_linter_warnings_fix.js::loadEnv
  function: scripts\db\migrations\apply_linter_warnings_fix.js::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run