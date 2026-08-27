---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\apply-sql-via-rpc.mjs
skeleton_hash: 5c7a3f4ea4711207
entity_hashes:
  func:loadEnv: a815ed170b76bf9a
  func:run: 96610af1c43f5518
  overview: 92dcae38b22cbabf
generated_at: 2026-08-27T12:24:51Z
---

## Genel Bakış
Bu modül, veritabanı migrasyonlarını RPC (Remote Procedure Call) aracılığıyla SQL komutları kullanarak uygulamak için tasarlanmış bir araçtır. Ortam değişkenlerini yükleyerek ve asenkron bir ana işlem çalıştırarak migrasyon sürecini yönetir.

## Fonksiyon Grupları
### Ortam Yapılandırması
Modülün çalışması için gerekli ortam değişkenlerini yükler ve yapılandırır.
- loadEnv

### Ana Migrasyon İşlemi
SQL komutlarını RPC üzerinden çalıştırarak veritabanı migrasyonlarını uygular. Bu fonksiyon, modülün asenkron ana işlevini yerine getirir.
- run

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri verilmemiştir; yalnızca `loadEnv()` ve `async def run()` imzaları ile `__dirname` ve `rootDir` sabitleri mevcuttur. Aksiyomlar yalnızca fonksiyon gövdelerinden üretilebilir.

---

## FONKSİYON DETAYLARI

### loadEnv
**Ne yapar**: Projenin kök dizinindeki `.env` dosyasını okuyarak ortam değişkenlerini bir nesne (object) olarak döndürür. Dosya mevcut değilse boş bir nesne döndürür.

**Nasıl yapar**: Öncelikle `rootDir` ile `.env` dosyasının tam yolunu oluşturur ve dosyanın varlığını `fs.existsSync` ile kontrol eder. Dosya yoksa boş nesne döndürerek işlemi sonlandırır. Dosya mevcutsa, `fs.readFileSync` ile UTF-8 formatında okur. Her satırı sırasıyla; satır sonu karakterlerini (`\r`) temizleme, `#` işaretinden sonrasını yorum olarak atma ve boşlukları kırpma işlemlerinden geçirir. Temizlenmiş satırı `=` işaretine göre böler; en az iki parça varsa, sol tarafı anahtar (key), sağ tarafı değer (value) olarak kaydeder. Birden fazla `=` işareti varsa sağ tarafın tamamı değer olarak alınır. Değerin başındaki ve sonundaki tek/çift tırnak işaretleri kaldırılır.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `env` — Anahtar-değer çiftlerinden oluşan bir nesne (object). Anahtarlar `.env` dosyasındaki değişken adları, değerler ise karşılık gelen string değerlerdir. Dosya bulunamazsa boş nesne (`{}`) döner.

### run
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: fs::fs
- import: path::path
- import: url::fileURLToPath

---

## SABİTLER
- **__dirname** (call) — `path.dirname(fileURLToPath(import.meta.url))`
- **rootDir** (call) — `path.resolve(__dirname, '..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: db/migrations/apply-sql-via-rpc.mjs::loadEnv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `envPath` — `rootDir` ile `.env` dosya adının `path.join` ile birleştirilmesiyle oluşan tam dosya yolu
  - `envContent` — `.env` dosyasının `fs.readFileSync` ile UTF-8 formatında okunan ham içeriği
  - `env` — parse edilen key-value çiftlerini tutan boş nesne; fonksiyon sonunda dönüş değeri olarak döndürülür
  - `line` — `envContent.split('\n').forEach` callback'inde işlenen her bir satır
  - `cleanLine` — `line`'dan `\r` karakteri kaldırıldıktan, `#` ile başlayan yorum kısmı atıldıktan ve `trim()` edildikten sonraki temizlenmiş satır
  - `parts` — `cleanLine`'ın `=` karakterine göre `split` edilmesiyle oluşan dizi
- **Dönüş**: `env` nesnesi (key-value çiftleri); `.env` dosyası yoksa boş nesne `{}`

### [N2_NASIL] AST Pointer: db/migrations/apply-sql-via-rpc.mjs::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `env` — `loadEnv()` çağrısının dönüş değeri; `.env` dosyasından parse edilen key-value çiftleri
  - `url` — `env.VITE_SUPABASE_URL` erişimiyle okunan Supabase proje URL'si
  - `key` — `env.SUPABASE_SERVICE_ROLE_KEY` erişimiyle okunan servis rol anahtarı
  - `migrationFile` — çalıştırılacak SQL migration dosyasının göreli yolu (sabit değer: `'supabase/migrations/20251218_wizard_selections.sql'`)
  - `sqlPath` — `rootDir` ile `migrationFile`'ın `path.join` ile birleştirilmesiyle oluşan tam dosya yolu
  - `sql` — `sqlPath` dosyasının `fs.readFileSync` ile UTF-8 formatında okunan SQL içeriği
  - `response` — `${url}/rest/v1/rpc/exec` adresine `fetch` ile yapılan POST isteğinin yanıt nesnesi
  - `result` — başarılı yanıt (`response.ok`) durumunda `response.text()` ile okunan metin
  - `errorText` — başarısız yanıt durumunda `response.text()` ile okunan hata metni
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `err.message` ile hata mesajı konsola yazdırılır
- **Dönüş**: yok (async void; yan etki olarak konsola çıktı yazar ve gerektiğinde `process.exit(1)` ile sonlandırır)

---

## NODE ID STANDARD

  file: scripts\db\migrations\apply-sql-via-rpc.mjs
  function: scripts\db\migrations\apply-sql-via-rpc.mjs::loadEnv
  function: scripts\db\migrations\apply-sql-via-rpc.mjs::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run