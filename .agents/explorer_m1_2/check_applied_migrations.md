---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\explorer_m1_2\check_applied_migrations.js
skeleton_hash: 888e60b56155c25b
entity_hashes:
  func:main: 02c21e6708680182
  func:parseEnv: 407358888558b46a
  overview: 22751f37d697448e
generated_at: 2026-06-02T07:44:01Z
---

## Genel Bakış
Bu modül, veritabanı migration'larının uygulanma durumunu kontrol etmekten sorumludur. Ortam değişkenlerini (.env dosyasından) okuyarak hangi migration'ların uygulandığını doğrular ve gerekirse migrate sürecini yönetir.

## Fonksiyon Grupları

### Ortam Yapılandırması
Proje dizinindeki .env dosyasını okuyarak gerekli yapılandırma değerlerini ayrıştırır.
- parseEnv

### Kontrol ve Orkestrasyon
Modülün ana iş akışını yönetir; ortam değerlerini okur, mevcut migration durumunu kontrol eder ve gerekli işlemleri tetikler.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesinden çıkarılabilir belirli bir aksiyom tanımlanamamıştır; zira verilen bilgiler (fonksiyon imzaları ve sabit pg) modülün dahili mantığı hakkında yeterli ipucu içermemektedir. Dolayısıyla, yalnızca function signature'lardan türeyen genel ve kaçınılmaz varsayımlar aşağıda listelenmiştir.

**[Aksiyom 1]:** Eğer `parseEnv` fonksiyonuna geçilen `filePath` parametresi geçerli (mevcut ve okunabilir) bir dosya yolunu temsil etmiyorsa, fonksiyon hata fırlatır veya beklenmeyen bir sonuç döner.

**[Aksiyom 2]:** Eğer `parseEnv` fonksiyonu, ortam değişkenlerini içeren bir dosya (örn. `.env`) ile başarılı bir şekilde etkileşime geçemezse, `main` fonksiyonunun beklediği yapılandırma değerleri eksik kalır ve modülün genel amacı olan "uygulanmış migrasyonları kontrol etme" işlemi hatalı veya eksik bilgiyle yürütülür.

**[Aksiyom 3]:** Eğer `pg` sabiti (bir nesne kalıbı) modül içinde bir veritabanı bağlantısı/istemcisi olarak kullanılıyor ve bu nesne başlatılmamış veya yapılandırılmamışsa, `main` fonksiyonunun veritabanı ile iletişim kurmaya çalıştığı herhangi bir yerde bağlantı hatası oluşur.

---

## FONKSİYON DETAYLARI

### parseEnv
**Ne yapar**: Belirtilen dosya yolunda bir `.env` formatındaki yapılandırma dosyasını okur ve içindeki değişkenleri bir JavaScript nesnesine dönüştürerek döndürür. Dosya mevcut değilse boş bir nesne döner.

**Nasıl yapar**: Fonksiyon, dosya varlığını kontrol ettikten sonra tüm içeriği okur. Her satırı baştan sona işleyerek boş satırları ve yorum satırlarını atlar. Kalan satırlarda `=` karakteri ile değişken adı ve değerini ayıran bir regex eşleştirmesi yapar. Eşleşen değerin başındaki ve sonundaki tek veya çift tırnak işaretlerini kaldırarak temizler ve sonuç nesnesine ekler.

**Parametreler**:
- filePath: string — Okunacak `.env` dosyasının mutlak veya göreceli dosya yolu.

**Dönüş**: object — Dosyadaki tüm değişken-ad çiftlerini içeren bir JavaScript nesnesi. Dosya bulunamazsa boş bir nesne `{}` döner.

### main
**Ne yapar**: Uygulamanın kök dizinindeki `.env` ve `.env.local` dosyalarını birleştirerek Supabase veritabanına bağlanmaya çalışır ve en son uygulanmış veritabanı migrasyonlarını sorgulayarak konsola yazdırır.

**Nasıl yapar**: Fonksiyon, önce `parseEnv` kullanarak iki farklı `.env` dosyasını birleştirerek ortam değişkenlerini toplar. Sabit bir kullanıcı adı ve host ile `SUPABASE_DB_PASSWORD` ve `DATABASE_URL` içindeki olası parolaları toplar. Bu parolaların ve iki farklı portun (5432, 6543) tüm kombinasyonlarını dener. İlk başarılı bağlantıyı kurduktan sonra `supabase_migrations.schema_migrations` tablosundan son 20 migrasyonu sorgular ve sonuçları konsola yazdırır. İşlem sonunda veritabanı bağlantısını kapatır.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: void — Fonksiyon doğrudan bir değer döndürmez. İşlemin sonucunu (başarı/hata ve migrasyon listesi) konsola yazdırır. Bağlantı kurulamazsa `process.exit(1)` ile programı sonlandırır.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: check_applied_migrations.js::parseEnv
- **params**: `filePath` — okunacak .env dosyasının tam yolu
- **ic_degiskenler**:
  - `content` — `fs.readFileSync` ile okunan dosyanın ham string içeriği
  - `env` — parse edilmiş key-value çiftlerini tutan nesne, sonuç olarak döndürülür
  - `line` — `content.split('\n').forEach` döngüsündeki her bir satır
  - `trimmed` — `line.trim()` ile boşlukları temizlenmiş satır; boş satır ve yorum satırı kontrolü için kullanılır
  - `match` — `trimmed.match(/^([^=]+)=(.*)$/)` regex eşleşme sonucu; match[1] key, match[2] value olarak kullanılır
  - `val` — `match[2].trim()` değerinin trim edilmiş hali; tırnak işaretleri varsa `slice(1,-1)` ile temizlenir
- **Dönüş**: `env` nesnesi — `{key: value}` formatında parse edilmiş değişkenler

---

### [N2_NASIL] AST Pointer: check_applied_migrations.js::main
- **params**: (yok)
- **ic_degiskenler**:
  - `envPath` — `path.resolve(process.cwd(), '.env')` ile hesaplanan .env dosyasının mutlak yolu
  - `envLocalPath` — `path.resolve(process.cwd(), '.env.local')` ile hesaplanan .env.local dosyasının mutlak yolu
  - `env` — `parseEnv` çağrılarının spread edilmesiyle oluşturulmuş birleşik ortam değişkenleri nesnesi
  - `user` — PostgreSQL bağlantı kullanıcı adı, sabit `'postgres.tnofewwkwlyjsqgwjjga'`
  - `host` — PostgreSQL host adresi, sabit `'aws-1-eu-central-1.pooler.supabase.com'`
  - `database` — PostgreSQL veritabanı adı, sabit `'postgres'`
  - `passwords` — `env.SUPABASE_DB_PASSWORD` değerini içeren dizi; `.filter(Boolean)` ile boş değerlere göre filtrelenir
  - `dbUrl` — `env.DATABASE_URL` veya `process.env.DATABASE_URL` değerinden gelen PostgreSQL connection string'i
  - `match` — `dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@/)` ile connection string'den user:password kısmını çeken regex eşleşme sonucu; `match[2]` şifreyi temsil eder
  - `uniquePasswords` — `Array.from(new Set(passwords))` ile tekrarları giderilmiş benzersiz şifre listesi
  - `ports` — denecek port numaraları dizisi `[5432, 6543]`
  - `possibleUrls` — tüm şifre-port kombinasyonlarından oluşan `{user, password, host, port, database}` nesneleri dizisi
  - `client` — `new pg.Client(...)` ile oluşturulmuş PostgreSQL istemcisi
  - `connected` — veritabanına başarıyla bağlanılıp bağlanılmadığını belirten boolean bayrak
  - `config` — `for...of` döngüsündeki mevcut bağlantı yapılandırması nesnesi (`{user, password, host, port, database}`)
  - `res` — `client.query(...)` sorgusunun döndürdüğü sonuç nesnesi; `.rows` dizisi applied migration'ları içerir
  - `r` — `res.rows.forEach` döngüsündeki tek bir migration satırı; `r.version` ile version değeri okunur
  - `err` — `try/catch` bloklarında yakalanan hata nesnesi (bağlantı hatası, sorgu hatası)
  - `e` — iç içe `try/catch` bloklarında `client.end()` sırasında oluşabilecek hata nesnesi; sessizce yutulur
- **Dönüş**: yok — fonksiyon `process.exit(1)` ile başarısızlıkta veya doğal olarak başarıyla sonlanır; yan etki olarak konsola migration listesi basılır

---

## NODE ID STANDARD

  file: .agents\explorer_m1_2\check_applied_migrations.js
  function: .agents\explorer_m1_2\check_applied_migrations.js::parseEnv
  function: .agents\explorer_m1_2\check_applied_migrations.js::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main
  export: parseEnv