---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\check_auth_functions.js
skeleton_hash: 4a26eb9d9b5f8e45
entity_hashes:
  func:loadEnv: e8b70dc21c38af9c
  func:run: 9519b1b021777543
  overview: af39be0dd406e441
generated_at: 2026-06-02T07:48:02Z
---



---

## AXIOMS – Mimari Varsayımlar

Bu modül veritabanı yetkilendirme fonksiyonlarını kontrol eden bir Node.js modülüdür ve PostgreSQL bağlantısı gerektirir.

**[Aksiyom 1]:** Eğer `pg` nesnesi (PostgreSQL istemcisi) tanımlı değilse, veritabanı bağlantısı kurulamaz ve modül hiç bir veritabanı işlemi yapamaz.

**[Aksiyom 2]:** Eğer `__dirname` çağrılamıyorsa, mevcut dosyanın dizin yolu belirlenemez ve dosyaya bağlı kaynaklar (örn: SQL dosyaları, yapılandırma dosyaları) yüklenemez.

**[Aksiyom 3]:** Eğer `rootDir` çağrılamıyorsa, proje kök dizini belirlenemez ve mutlak yollara dayalı dosya erişimleri başarısız olur.

**[Aksiyom 4]:** Eğer `loadEnv()` çağrılmadan önce çevre değişkenleri (`.env` dosyası veya sistem değişkenleri) tanımlı değilse, veritabanı bağlantı bilgileri (host, port, kullanıcı, şifre, veritabanı adı) eksik kalır.

**[Aksiyom 5]:** Eğer `run()` fonksiyonu çağrıldığında `pg` bağlantısı henüz kurulmamışsa (bağlama havuzu başlatılmamışsa), yetkilendirme fonksiyonu kontrolü yapılamaz.

---

## FONKSİYON DETAYLARI

### loadEnv

**Ne yapar**: Proje kök dizinindeki `.env` dosyasını okuyarak ortam değişkenlerini bir JavaScript nesnesine dönüştürür ve döndürür.

**Nasıl yapar**: Öncelikle `.env` dosyasının varlığını kontrol eder, eğer yoksa boş bir nesne döndürür. Dosya varsa içeriğini satır satır okur, her satırdaki yorum satırlarını (`#` ile başlayan kısımları) temizler, boşlukları trim eder ve `=` karakterine göre anahtar-değer çiftlerine ayırır. Değerlerdeki baştaki ve sondaki tırnak işaretlerini (`'` veya `"`) kaldırarak temiz bir nesne oluşturur.

**Parametreler**:
- Bu fonksiyonun parametresi yoktur.

**Dönüş**: `object` — `.env` dosyasından okunan anahtar-değer çiftlerini içeren nesne. Dosya bulunamazsa boş bir nesne `{}` döner.

### run
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **__dirname** (call) — `path.dirname(fileURLToPath(import.meta.url))`
- **rootDir** (call) — `path.resolve(__dirname, '../..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: db\check_auth_functions.js::loadEnv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `envPath` — .env dosyasının tam yolu, rootDir ve '.env' parçalarının path.join ile birleşmesiyle oluşur
  - `envContent` — .env dosyasının tüm içeriği, fs.readFileSync ile okunur
  - `env` — parse edilmiş ortam değişkenlerini tutan boş nesne, sonuç olarak döner
  - `line` — forEach döngüsündeki her satır, envContent.split('\n') ile elde edilen dizi elemanı
  - `cleanLine` — satırın temizlenmiş hali, \r karakterleri temizlenip # sonrasında yorum satırı kaldırılıp trim edilir
  - `parts` — cleanLine'in '=' karakterine göre split edilmesiyle oluşan dizi
- **Dönüş**: `env` nesnesi (boş nesne veya {anahtar: değer} çiftleri içeren nesne)

### [N2_NASIL] AST Pointer: db\check_auth_functions.js::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `env` — loadEnv() çağrısıyla elde edilen ortam değişkenleri nesnesi
  - `client` — pg.Client nesnesi, env.DATABASE_URL connection string'i ve SSL ayarlarıyla oluşturulur
  - `res` — client.query() çağrısının sonucu, pg_get_functiondef fonksiyonunun tanımını içeren satırları barındırır
  - `err` — catch bloğu içinde yakalanan hata nesnesi
- **Dönüş**: yok (async fonksiyon, promise döner ancak fonksiyon içinde return değeri yok)

---

## NODE ID STANDARD

  file: scripts\db\check_auth_functions.js
  function: scripts\db\check_auth_functions.js::loadEnv
  function: scripts\db\check_auth_functions.js::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run