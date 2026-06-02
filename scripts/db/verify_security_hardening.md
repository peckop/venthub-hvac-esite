---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\verify_security_hardening.js
skeleton_hash: 4971bd9bec2d0169
entity_hashes:
  func:loadEnv: cdc6628f011fa912
  func:run: 4e29576bd5595375
  overview: af39be0dd406e441
generated_at: 2026-06-02T07:49:29Z
---

## Genel Bakış
Bu modül, veritabanı bağlantısı gerektiren güvenlik sertleştirme doğrulama betiklerini çalıştırmakla sorumludur. Ortam değişkenlerini yükleyerek gerekli yapılandırma bilgilerini (veritabanı adresi, kimlik bilgileri vb.) sağlar ve ardından asenkron olarak güvenlik kontrollerini yürütür.

## Fonksiyon Grupları
### Ortam Yönetimi
Uygulamanın çalışması için gerekli olan ortam değişkenlerini (örn. veritabanı bağlantı dizileri, kimlik bilgileri) yükleme ve erişilebilir hale getirme sorumluluğuna sahiptir.
- loadEnv

### Ana Yürütme Akışı
Modülün ana iş mantığını yönetir; gerekli hazırlıkları yapar (örn. ortam değişkenlerini yükler) ve güvenlik sertleştirme doğrulama sürecini asenkron olarak başlatıp yürütür.
- run

---

## AXIOMS – Mimari Varsayımlar

Bu modül için minimum mimari varsayımlar, yalnızca fonksiyon imzaları ve modül sabitleri temelinde tanımlanmıştır. Fonksiyon gövdeleri mevcut olmadığından, detaylı iş mantığı varsayımları çıkarılamamıştır.

---

**[Aksiyom 1]**: Eğer `loadEnv()` fonksiyonu başarılı bir şekilde çalışmazsa, ortam değişkenleri (veritabanı bağlantısı için gerekli olabilecek) yüklenemez ve `run()` fonksiyonunun doğru çalışması garanti edilemez.

**[Aksiyom 2]**: Eğer `pg` (PostgreSQL istemci nesnesi) doğru şekilde yapılandırılmamışsa veya erişilebilir durumda değilse, modül veritabanı bağlantısı kuramaz.

**[Aksiyom 3]**: Eğer `__dirname` veya `rootDir` değerleri çalışma zamanında doğru çözümlenemezse, modül dosya sistemi yolları üzerinde referanslar kullanıyorsa başarısız olur.

**[Aksiyom 4]**: Eğer `loadEnv()` çağrısı `run()` öncesinde çağrılmamışsa veya ortam değişkenleri eksikse, veritabanı bağlantısı için gerekli bilgiler mevcut olmayabilir.

---

> **Not:** Fonksiyon gövdeleri (implementation body) paylaşılmadığından, modülün inner mantığına dair daha spesifik aksiyomlar (eşik değerleri, kabul kriterleri, SQL sorgu beklentileri vb.) tanımlanamamıştır. Daha detaylı aksiyom üretimi için fonksiyon implementasyonlarının sağlanması gereklidir.

---

## FONKSİYON DETAYLARI

### loadEnv
**Ne yapar**: Proje dizinindeki `.env` dosyasını okuyarak ortam değişkenlerini JavaScript nesnesine dönüştürür.

**Nasıl yapar**: Öncelikle `rootDir` dizininde `.env` dosyasının varlığını kontrol eder. Dosya mevcutsa, içeriğini satır satır işler. Her satırda yorum satırlarını (`#` karakterinden sonraki kısım) ve satır sonu karakterlerini temizler. Boş olmayan satırları `=` karakterine göre ikiye böler, anahtar ve değer çiftlerini ayırır. Değerlerin başındaki ve sonundaki tırnak işaretlerini (`'` veya `"`) kaldırarak temiz bir nesne döndürür.

**Parametreler**:
- Parametre almaz.

**Dönüş**: `Object` — Anahtar-değer çiftlerinden oluşan ortam değişkenleri nesnesi. Dosya bulunamazsa boş bir nesne `{}` döner.

### run
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **__dirname** (call) — `path.dirname(fileURLToPath(import.meta.url))`
- **rootDir** (call) — `path.resolve(__dirname, '../..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `scripts/db/verify_security_hardening.js`::loadEnv
- **params**: (yok)
- **ic_degiskenler**:
  - `envPath` — rootDir ile '.env' dosyasının tam yolunu path.join ile oluşturur
  - `envContent` — .env dosyasının fs.readFileSync ile okunan ham string içeriği
  - `env` — anahtar-değer çiftlerini tutan boş nesne, doldurulup return edilir
  - `cleanLine` — forEach callback içinde her satırın \\r temizlenmiş, # yorum kısmı kaldırılmış, trim edilmiş hali
  - `parts` — cleanLine'ın '=' karakterine göre split edilmiş dizi; parts[0] anahtar, geri kalanı değer
  - `key` — parts[0].trim() ile elde edilen ortam değişkeni adı
  - `value` — parts.slice(1).join('=').trim() ile elde edilen, baştaki/sondaki tırnak işaretleri temizlenmiş değer
- **Dönüş**: `{}` objesi (boş sözlük) veya dolu sözlük (ortam değişkenleri)

### [N2_NASIL] AST Pointer: `scripts/db/verify_security_hardening.js`::run
- **params**: (yok)
- **ic_degiskenler**:
  - `env` — loadEnv() çağrısıyla yüklenen .env ortam değişkenleri sözlüğü
  - `connectionString` — env.DATABASE_URL değerinden alınan PostgreSQL bağlantı dizesi; tanımsızsa process.exit(1)
  - `tryConnect` — arrow function, verilen url ile pg.Client oluşturur (ssl: { rejectUnauthorized: false }, 15sn timeout); bağlanabilirse client nesnesini, başarısız olursa null döner
  - `client` — PostgreSQL bağlantısını temsil eden pg Client nesnesi; pooler URL'i başarısız olursa directUrl ile yeniden bağlanmaya çalışır
  - `directUrl` — connectionString üzerinde .replace ile pooler portunu (6543→5432), .pooler. substring'ini ve pgbouncer parametresini kaldırarak doğrudan bağlantıya dönüştürülmüş URL
  - `t1` — test tenant 1 UUID sabiti ('11111111-...')
  - `t2` — test tenant 2 UUID sabiti ('22222222-...')
  - `u1` — test user 1 UUID sabiti ('aaaaaaaa-...')
  - `u2` — test user 2 UUID sabiti ('bbbbbbbb-...')
  - `profileCount` — user_profiles tablosunda u1 ve u2'nin varlığını sayan SELECT count(*) sorgu sonucu; profileCount.rows[0].count ile erişilir
  - `resU1` — U1 kullanıcısının kendi profilini (kendi tenant'ında) sorgulama sonucu; resU1.rows.length ile satır sayısı kontrol edilir
  - `resU2` — U2 kullanıcısının farklı tenant'tan profiline erişim deneme sorgu sonucu; resU2.rows.length ile boş olup olmadığı kontrol edilir
  - `testUserUuid` — rol yükselme/self-promotion testi için kullanılan UUID sabiti ('77777777-...')
  - `resUserAuth` — auth.users tablosundan testUserUuid'nin raw_app_meta_data ve raw_user_meta_data alanlarını çeken sorgu sonucu; resUserAuth.rows[0]?.raw_app_meta_data?.user_role ve resUserAuth.rows[0]?.raw_user_meta_data?.role ile erişilir
  - `resUserProfile` — public.user_profiles tablosundan testUserUuid'nin role ve tenant_id alanlarını çeken sorgu sonucu; resUserProfile.rows[0]?.role ile erişilir
  - `appRole` — resUserAuth.rows[0].raw_app_meta_data.user_role değerinden türetilen; trigger'ın downgrades yapıp yapmadığını test eder
  - `metaRole` — resUserAuth.rows[0].raw_user_meta_data.role değerinden türetilen; trigger'ın raw_user_meta_data'daki rolü düşürüp düşürmediğini test eder
  - `profileRole` — resUserProfile.rows[0].role değerinden türetilen; trigger'ın user_profiles tablosuna yazdığı rolü test eder
  - `rpcFunctions` — test edilecek RPC fonksiyonlarının [{ name, args }] dizisi; set_user_admin_role, adjust_stock, set_stock fonksiyonlarını ve farklı argüman varyasyonlarını içerir
  - `fn` — for...of döngüsünde rpcFunctions dizisinden alınan her bir fonksiyon bilgi nesnesi; fn.name ve fn.args ile SQL sorguları dinamik oluşturulur
  - `err` — try-catch bloklarında yakalanan hata nesnesi; hem bağlantı hatalarında hem de RLS/RLS testlerinde exception mesajını yakalar
- **Dönüş**: yok (process.exit(1) ile sonlanır veya void; yan etki olarak konsola test sonuçları yazdırır, veritabanı transaction'ı ROLLBACK eder, client bağlantısını kapatır)

---

## NODE ID STANDARD

  file: scripts\db\verify_security_hardening.js
  function: scripts\db\verify_security_hardening.js::loadEnv
  function: scripts\db\verify_security_hardening.js::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run