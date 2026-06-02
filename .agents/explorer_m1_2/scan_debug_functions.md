---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\explorer_m1_2\scan_debug_functions.js
skeleton_hash: c29539840f0938ce
entity_hashes:
  func:main: f761ac5dc92fe607
  func:parseEnv: 407358888558b46a
  overview: 22751f37d697448e
generated_at: 2026-06-02T07:46:22Z
---

## Genel Bakış
Bu modül, bir YAML dosyasından yapılandırma bilgilerini okuyup işleyen ve ardından belirli bir tarama veya hata ayıklama iş akışını başlatan basit bir_betik입니다. Temel işlevi, bir dosya yolundan yapılandırma verisini ayrıştırıp programa sunmaktır.

## Fonksiyon Grupları
### Yapılandırma Okuma ve Ayrıştırma
Bu grup, harici bir YAML dosyasından yapılandırma verisini okuyup program tarafından kullanılabilir hale getirmekten sorumludur.
- parseEnv

### Ana İş Akışı ve Koordinasyon
Bu grup, modülün temel iş akışını başlatır ve gerekli yapılandırma bilgisini alarak ilgili işlemleri koordine eder.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül, dosya tabanlı yapılandırma (env) okuma ve veritabanı bağlantısı içeren bir tarama modülüdür.

**[Aksiyom 1]:** Eğer `filePath` parametresi `parseEnv()` fonksiyonuna sağlanmazsa, ortam değişkenleri dosyası okunamaz ve parse işlemi başarısız olur. (Parametre zorunludur, default değer tanımı yoktur.)

**[Aksiyom 2]:** Eğer `pg` (PostgreSQL bağlantısı/nesnesi) modül düzeyinde doğru şekilde başlatılmamış veya bağlantı kopuk/geçersiz ise, veritabanı bağlantısı gerektiren hiçbir işlem çalıştırılamaz.

**[Aksiyom 3]:** Eğer `main()` fonksiyonu çağrılmazsa, modülün tarama ve ortam değişkeni okuma işlemleri tetiklenmez; modül pasif kalır.

**[Aksiyom 4]:** Eğer `parseEnv()` tarafından döndürülen sonuç `main()` tarafından işlenemez hale gelirse (ör. geçersiz dosya içeriği,bozuk format), ana iş akışı devam edemez.

---

> **Not:** Bu modül için yalnızca fonksiyon imzaları ve modül sabiti (`pg`) esas alınmıştır. Fonksiyon gövdeleri, docstring'ler veya yorum satırları erişilebilir olmadığından,parseEnv'in tam olarak hangi formatı beklediği ve pg'nin hangi operasyonlarda kullanıldığı **bilinmiyor** olarak işaretlenmiştir.

---

## FONKSİYON DETAYLARI

### parseEnv
**Ne yapar**: Belirtilen dosya yolundaki bir `.env` formatlı dosyası okuyarak içindeki anahtar-değer çiftlerini bir JavaScript nesnesine dönüştürür. Bu, uygulama yapılandırma değişkenlerini yüklemek için kullanılan temel bir yardımcı fonksiyondur.
**Nasıl yapar**: Fonksiyon, önce dosyanın varlığını kontrol eder. Dosya mevcutsa, içeriğini UTF-8 olarak okur ve satır satır işler. Her satırı budar, boş satırları ve `#` ile başlayan yorum satırlarını atlar. Kalan satırları eşitlik (`=`) karakterine göre ayırarak anahtar-değer çiftlerini çıkarır. Değerdeki baştaki ve sondaki tekli (`'`) veya çiftli (`"`) tırnak işaretlerini temizler. Sonuç olarak bir anahtar-değer nesnesi döndürür.
**Parametreler**:
- filePath: string — Okunacak `.env` dosyasının mutlak veya göreli dosya yolu.
**Dönüş**: object — Dosyadan çıkarılan anahtar-değer çiftlerini içeren bir nesne. Dosya bulunamazsa veya okunamazsa boş bir nesne (`{}`) döner.

### main
**Ne yapar**: Bir PostgreSQL veritabanına (özellikle Supabase) bağlanmaya çalışarak `public` şemasındaki belirli hata ayıklama fonksiyonlarının (`debug_context` ve `debug_policies_product_images`) meta bilgilerini sorgular ve sonuçları konsola yazdırır. Bu bir keşif ve hata ayıklama betiğidir.
**Nasıl yapar**: Fonksiyon, çalışma dizinindeki `.env` ve `.env.local` dosyalarını `parseEnv` kullanarak okur. Sabit Supabase kullanıcı, host ve veritabanı bilgileriyle birlikte okunan dosyalardaki (`SUPABASE_DB_PASSWORD`) ve `DATABASE_URL`'den ayrıştırılan olası şifreleri toplar. Bu şifreler ile iki farklı port (`5432`, `6543`) kombinasyonu oluşturarak denenir. SSL ile ilk başarılı bağlantıyı kurar. Bağlantı sonrası, hedeflenen iki debug fonksiyonunun adını, parametrelerini, `SECURITY DEFINER` özelliğini ve erişim izinlerini getiren bir SQL sorgusu çalıştırır. İşlem sonunda veritabanı bağlantısını kapatır.
**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: Fonksiyon doğrudan bir değer döndürmez (`void`). Sonuçları `console.log` ve `console.error` ile konsola yazdırır. Veritabanına bağlanamazsa `process.exit(1)` ile programı sonlandırır.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scan_debug_functions.js::parseEnv
- **params**: `filePath` — okunacak .env dosyasının tam yolu
- **ic_degiskenler**:
  - `content` — fs.readFileSync(filePath, 'utf8') ile okunan dosyanın tam string içeriği
  - `env` — parse edilmiş key-value çiftlerini tutan nesne, başlangıçta `{}`
  - `line` — forEach callback parametresi, dosyanın her bir satırı
  - `trimmed` — `line.trim()`, baş/son boşlukları temizlenmiş satır
  - `match` — `trimmed.match(/^([^=]+)=(.*)$/)` sonucu, regex eşleşme arrayi; `match[1]` key, `match[2]` value
  - `val` — `match[2].trim()`, değerin temizlenmiş hali; tırnak işaretleri varsa `slice(1, -1)` ile kırpılır
- **Dönüş**: `{}` (dosya yoksa) veya `env` (key-value nesnesi)

---

### [N2_NASIL] AST Pointer: scan_debug_functions.js::main
- **params**: yok
- **ic_degiskenler**:
  - `envPath` — `path.resolve(process.cwd(), '.env')`, ana .env dosyasının mutlak yolu
  - `envLocalPath` — `path.resolve(process.cwd(), '.env.local')`, yerel .env dosyasının mutlak yolu
  - `env` — iki parseEnv çağrısının spread ile birleştirilmesiyle oluşan birleşik environment nesnesi
  - `user` — PostgreSQL bağlantı kullanıcı adı, sabit `'postgres.tnofewwkwlyjsqgwjjga'`
  - `host` — PostgreSQL host adresi, sabit `'aws-1-eu-central-1.pooler.supabase.com'`
  - `database` — PostgreSQL veritabanı adı, sabit `'postgres'`
  - `passwords` — `[env.SUPABASE_DB_PASSWORD].filter(Boolean)`, başlangıçta tek elemanlı dizi
  - `dbUrl` — `env.DATABASE_URL || process.env.DATABASE_URL`, veritabanı connection URL'si
  - `match` — `dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@/)` sonucu, URL'den user:password ayrıştırması
  - `uniquePasswords` — `Array.from(new Set(passwords))`, tekrar eden şifreleri temizlenmiş benzersiz şifre dizisi
  - `ports` — `[5432, 6543]`, denenacak portlar dizisi
  - `possibleUrls` — tüm şifre×port kombinasyonlarını `{user, password, host, port, database}` objesi olarak tutan dizi
  - `pw` — for...of döngü değişkeni, uniquePasswords'teki her bir şifre stringi
  - `config` — for...of döngü değişkeni, possibleUrls'teki her bir bağlantı konfigürasyonu objesi
  - `client` — `new Client(...)` ile oluşturulan pg.Client örneği, veritabanı bağlantısı
  - `connected` — boolean, veritabanına başarıyla bağlanılıp bağlanılmadığını tutar
  - `query` — SQL sorgu stringi, pg_proc tablosundan debug fonksiyonlarını seçen SELECT sorgusu
  - `res` — `client.query(query)` sonucu, `res.rows` dizisi sorgu sonuç satırlarını tutar
  - `r` — res.rows.forEach callback parametresi, her bir sonuç satırı objesi; `r.schema_name`, `r.function_name`, `r.arguments`, `r.is_security_definer`, `r.access_privileges` alanlarına erişilir
- **Dönüş**: yok; konsola debug fonksiyon bilgilerini yazdırır, bağlantı başarısızsa `process.exit(1)` ile sonlanır

---

## NODE ID STANDARD

  file: .agents\explorer_m1_2\scan_debug_functions.js
  function: .agents\explorer_m1_2\scan_debug_functions.js::parseEnv
  function: .agents\explorer_m1_2\scan_debug_functions.js::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main
  export: parseEnv