---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\apply-stock-fix.mjs
skeleton_hash: 6c701c914df80e65
entity_hashes:
  func:loadEnv: a815ed170b76bf9a
  func:run: 59c657f31c15c2a2
  overview: 92dcae38b22cbabf
generated_at: 2026-08-27T12:19:51Z
---

## Genel Bakış
Bu modül, stok düzeltme (stock fix) işlemini uygulamak için tasarlanmış bir betiktir. Ortam değişkenlerini yükleyerek ve ana işlemi çalıştırarak belirli bir stok düzeltme senaryosunu otomatikleştirir.

## Fonksiyon Grupları
### Ortam Yapılandırması
Modülün çalışması için gerekli olan ortam değişkenlerini ve yapılandırma değerlerini yükler.
- loadEnv

### Ana İşlem Mantığı
Stok düzeltme işleminin asıl uygulama mantığını çalıştıran ana fonksiyondur.
- run

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri verilmediğinden, davranışa dayalı özel aksiyom tanımlanamaz. Ancak imzalardan çıkarılabilen temel bağımlılıklar aşağıdadır.

[Aksiyom 1]: Eğer `__dirname` sabiti tanımlı değilse, `rootDir` hesaplanamaz ve modül çalışamaz.

[Aksiyom 2]: Eğer `rootDir` sabiti tanımlı değilse, `run()` fonksiyonu çalışırken dosya yolu çözümlemesi yapılamaz.

[Aksiyom 3]: Eğer `loadEnv()` fonksiyonu çağrılmadan önce ortam değişkenleri yüklenmemişse, `run()` fonksiyonu gerekli konfigürasyon değerlerine erişemez.

[Aksiyom 4]: Eğer `run()` fonksiyonu bir Promise döndüremezse (async yapı bozuksa), çağıran taraf asenkron işlemi bekleyemez.

---

**Not:** Fonksiyon gövdeleri verilmediği için modülün iş mantığına (örneğin hangi stok düzeltmesinin uygulandığı, hangi dosyaların okunduğu/yazıldığı, hata toleransı, eşik değerleri) ilişkin aksiyomlar üretilememiştir. Daha detaylı mimari varsayımlar için fonksiyon gövdesi gereklidir.

---

## FONKSİYON DETAYLARI

### loadEnv
**Ne yapar**: Proje kök dizinindeki `.env` dosyasını okuyarak ortam değişkenlerini bir nesneye dönüştürür. Dosya mevcut değilse boş bir nesne döndürür.

**Nasıl yapar**: Öncelikle `rootDir` ve `.env` dosya adını birleştirerek tam dosya yolunu oluşturur. Dosya mevcut değilse boş nesne döndürerek sonlanır. Dosya mevcutsa, içeriğini UTF-8 formatında okur ve satır satır işler. Her satır için önce satır sonu karakterlerini (`\r`) temizler, `#` işaretinden sonrasını yorum olarak kabul edip atar ve kalan kısmı boşluklardan arındırır. Boş satırları atlar. Kalan satırları `=` işaretine göre böler; en az iki parça varsa, sol tarafı anahtar olarak alır, sağ tarafı değer olarak alır. Birden fazla `=` işareti varsa sağ tarafı birleştirir. Değerin başındaki ve sonundaki tek/çift tırnak işaretlerini kaldırır. Sonuçta elde edilen anahtar-değer çiftlerini bir nesneye ekleyerek döndürür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `env` — Anahtar-değer çiftlerini içeren bir nesne. Anahtarlar `.env` dosyasındaki değişken adları, değerler ise karşılık gelen ortam değişkeni değerleridir. Dosya mevcut değilse boş nesne (`{}`) döner.

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

### [N1_NASIL] AST Pointer: scripts/apply-stock-fix.mjs::loadEnv
- **params**: yok
- **ic_degiskenler**:
  - `envPath` — `path.join(rootDir, '.env')` ile oluşturulan .env dosyasının tam dosya yolu
  - `envContent` — `fs.readFileSync(envPath, 'utf8')` ile okunan .env dosyasının ham metin içeriği
  - `env` — çevre değişkenlerini tutan boş nesne; satır satır parse edilerek anahtar-değer çiftleriyle doldurulur
  - `line` — `envContent.split('\n').forEach` içindeki her satırı temsil eder
  - `cleanLine` — `line` değerinden `\r` karakterlerini kaldırıp `#` ile başlayan yorum kısmını atıp `trim()` ile boşlukları temizleyerek elde edilen satır
  - `parts` — `cleanLine` değerinin `=` karakteriyle bölünmesiyle oluşan dizi; `parts[0]` anahtar, `parts.slice(1).join('=')` değer kısmıdır
- **Dönüş**: `env` nesnesi (anahtar-değer çiftlerinden oluşan dict); .env dosyası yoksa boş nesne `{}` döner

### [N2_NASIL] AST Pointer: scripts/apply-stock-fix.mjs::run
- **params**: yok
- **ic_degiskenler**:
  - `env` — `loadEnv()` çağrısından dönen çevre değişkenleri nesnesi
  - `url` — `env.NEXT_PUBLIC_SUPABASE_URL` değeri varsa o, yoksa `env.SUPABASE_URL` değeri; Supabase proje URL'si
  - `key` — `env.SUPABASE_SERVICE_ROLE_KEY` değeri; Supabase servis rol anahtarı
  - `migrationFile` — çalıştırılacak SQL migration dosyasının göreceli yolu (`'supabase/migrations/20260524_idempotent_stock_reduction.sql'`)
  - `sqlPath` — `path.join(rootDir, migrationFile)` ile oluşturulan SQL dosyasının tam dosya yolu
  - `sql` — `fs.readFileSync(sqlPath, 'utf8')` ile okunan SQL dosyasının metin içeriği
  - `response` — `${url}/rest/v1/rpc/exec` adresine POST isteğiyle gönderilen `fetch` çağrısının yanıt nesnesi
  - `result` — `response.ok` olduğunda `response.text()` ile alınan başarılı yanıt metni
  - `errorText` — `response.ok` olmadığında `response.text()` ile alınan hata yanıt metni
  - `response2` — ilk RPC `exec` 404 döndüğünde `${url}/rest/v1/rpc/execute_sql` adresine gönderilen alternatif `fetch` çağrısının yanıt nesnesi
  - `result2` — `response2.ok` olduğunda `response2.text()` ile alınan başarılı yanıt metni
  - `errorText2` — `response2.ok` olmadığında `response2.text()` ile alınan alternatif hata yanıt metni
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `err.message` ile hata mesajı yazdırılır
- **Dönüş**: yok (async fonksiyon; yan etki olarak konsola bilgi yazar, hata durumunda `process.exit(1)` ile çıkar)

---

## NODE ID STANDARD

  file: scripts\apply-stock-fix.mjs
  function: scripts\apply-stock-fix.mjs::loadEnv
  function: scripts\apply-stock-fix.mjs::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run