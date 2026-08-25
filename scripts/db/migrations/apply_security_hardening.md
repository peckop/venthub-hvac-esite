---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\scripts\db\migrations\apply_security_hardening.js
skeleton_hash: b81257f935961570
entity_hashes:
  func:loadEnv: 2234574fdca17aba
  func:run: af6aeb54f3a087c5
  overview: af39be0dd406e441
generated_at: 2026-08-25T07:22:54Z
---

## Genel Bakış

Bu modül, veritabanı güvenlik sertleştirme (security hardening) işlemlerini otomatik olarak uygulamak için kullanılan bir migration scriptidir. Ortam değişkenlerini yükleyerek yapılandırmayı okur ve veritabanı üzerinde güvenlik ayarlarını çalıştırmak üzere tasarlanmıştır.

## Fonksiyon Grupları

### Ortam Yapılandırması

Modülün çalışması için gerekli ortam değişkenlerini ve yapılandırma değerlerini yükler. Bu fonksiyon, güvenlik sertleştirme parametrelerinin doğru kaynaktan okunmasını sağlar.

- loadEnv

### Güvenlik Sertleştirme Uygulaması

Asenkron olarak çalışan ana işlevsellik. Veritabanı üzerinde güvenlik sertleştirme adımlarını sırasıyla uygular ve işlemi tamamlar.

- run

## Bağımlılıklar

**İç Bağımlılıklar:** `run` fonksiyonu, ortam değişkenlerini kullanabilmek için `loadEnv` fonksiyonuna bağlıdır.

**Dış Bağımlılıklar:** Veritabanı bağlantısı ve ortam değişken dosyası (.env benzeri) gerektirir. Modül adından anlaşıldığı üzere, `scripts/db/migrations` dizininde konumlandığı için proje genelindeki veritabanı migration altyapısıyla uyumlu çalışır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### loadEnv
**Ne yapar**: Projenin kök dizinindeki `.env` dosyasını okuyarak ortam değişkenlerini bir nesne (obje) olarak yükler. Dosya mevcut değilse boş bir nesne döndürür.

**Nasıl yapar**: Öncelikle `rootDir` ve `.env` dosya yolunu birleştirir. Dosya mevcut değilse (`fs.existsSync` ile kontrol) boş nesne döndürerek işlemi sonlandırır. Dosya mevcutsa, içeriğini UTF-8 formatında okur. Her satırı tek tek işlerken önce satır sonu karakterlerini (`\r`) temizler, ardından `#` işaretinden sonrasını yorum olarak kabul edip atar. Kalan temiz satırı `=` işaretine göre böler. İlk parça anahtar (key), geri kalan parçalar `=` ile birleştirilerek değer (value) olarak atanır. Değerin başındaki ve sonundaki tek/çift tırnak işaretleri kaldırılır. Sonuçta elde edilen anahtar-değer çiftleri bir nesneye eklenir ve bu nesne döndürülür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `env` — `.env` dosyasındaki anahtar-değer çiftlerini içeren bir nesne (object). Dosya bulunamazsa boş nesne (`{}`) döner.

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

### [N1_NASIL] AST Pointer: scripts/db/migrations/apply_security_hardening.js::loadEnv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `envPath` — `.env` dosyasının tam yolu
  - `envContent` — `.env` dosyasının okunan ham içeriği
  - `env` — ortam değişkenlerini tutan nesne
  - `line` — `.env` dosyasındaki her bir satır
  - `cleanLine` — yorumlardan (`#`) ve satır sonu karakterlerinden (`\r`) arındırılmış satır
  - `parts` — satırın `=` karakteriyle bölünmüş hali
  - `key` — ortam değişkeni adı
  - `value` — ortam değişkeni değeri (tırnak işaretleri temizlenmiş)
- **Dönüş**: `env` nesnesi (anahtar-değer çiftlerini içerir)

### [N2_NASIL] AST Pointer: scripts/db/migrations/apply_security_hardening.js::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `env` — `loadEnv()` fonksiyonundan dönen ortam değişkenleri nesnesi
  - `connectionString` — `env.DATABASE_URL`'den alınan veritabanı bağlantı dizesi
  - `tryConnect` — verilen URL ile bağlantı denemesi yapan async fonksiyon
  - `client` — veritabanı bağlantısı için `pg.Client` nesnesi
  - `directUrl` — pooler içeren URL'den türetilen doğrudan bağlantı URL'si (port 5432)
  - `comUrl` — `.supabase.co` uzantısını `.supabase.com` ile değiştiren URL
  - `migrationFile` — çalıştırılacak SQL migration dosyasının yolu
  - `sqlPath` — SQL dosyasının tam yolu
  - `sql` — okunan SQL dosyasının içeriği
  - `url` — `tryConnect` fonksiyonuna parametre olarak verilen bağlantı URL'si
  - `maskedUrl` — parola kısmı maskelenmiş URL (günlük amaçlı)
  - `err` — yakalanan hata nesnesi
- **Dönüş**: yok (yan etki: veritabanına bağlanır, SQL migration çalıştırır, bağlantıyı kapatır)

---

## NODE ID STANDARD

  file: apply_security_hardening.js
  function: apply_security_hardening.js::loadEnv
  function: apply_security_hardening.js::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run