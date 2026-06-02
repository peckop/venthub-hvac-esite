---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\explorer_m1_2\list_all_functions.js
skeleton_hash: 5b0eca5400a962b9
entity_hashes:
  func:main: e5a2c2581a3e4909
  func:parseEnv: 407358888558b46a
  overview: 22751f37d697448e
generated_at: 2026-06-02T07:45:33Z
---

## Genel Bakış

Bu modül, bir proje dizinindeki kaynak dosyaları tarayarak içindeki fonksiyon ve metodların listesini çıkaran bir keşif (discovery) aracıdır. Ortam değişkenlerinden yapılandırma bilgilerini okuyarak hedef dosyaları belirler ve analiz işlemini başlatır.

## Fonksiyon Grupları

### Yapılandırma Okuma
Proje ortamına ait yapılandırma dosyalarını okuyarak çalışma parametrelerini belirler.
- `parseEnv`

### Ana Yürütme Akışı
Modülün giriş noktasıdır; yapılandırma bilgilerini alarak fonksiyon tarama işlemini koordine eder ve sonuçları üretir.
- `main`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, çevre (env) dosyalarını ayrıştırıp işleyen bir yapıya sahiptir.

[Aksiyom 1]: Eğer `parseEnv(filePath)` için geçerli bir dosya yolu (`filePath`) sağlanmazsa, dosya ayrıştırma işlemi başarısız olur veya tanımsız davranış oluşur.

[Aksiyom 2]: Eğer `main()` fonksiyonu çağrılmazsa (modül doğrudan çalıştırılmazsa), modülün ana iş akışı yürütülmez.

[Aksiyom 3]: Eğer modül sabiti `pg` (object_pattern) tanımlı veya erişilebilir değilse, modülün desen eşleme/tanımlama işlemleri çalışamaz.

[Aksiyom 4]: Eğer `parseEnv()` tarafından döndürülen sonuç `main()` tarafından işlenemeyecek formattaysa (örn: null veya geçersiz yapı), ana iş akışı bu veriyle ilerleyemez.

---

**Not:** Fonksiyon gövdelerine erişim olmadığından, iç bağımlılıklar ve veri akışı detayları (örn: `parseEnv`'in `pg` desenini nerede kullandığı) doğrulanamamıştır.

---

## FONKSİYON DETAYLARI

### parseEnv
**Ne yapar**: Belirtilen dosya yolundaki `.env` formatlı bir dosyayı okuyarak değişken adı-değer çiftlerini içeren bir JavaScript nesnesi (sözlük) oluşturur. Dosya mevcut değilse boş bir nesne döndürerek hata oluşmasını engeller.

**Nasıl yapar**: Öncelikle `fs.existsSync` ile dosyanın varlığını kontrol eder. Dosya varsa `fs.readFileSync` ile tüm içeriğini UTF-8 olarak okur. İçeriği satırlara böler ve her satırı işler. Boş satırları ve `#` karakteri ile başlayan yorum satırlarını atlar. Kalan satırları `key=value` formatında düzenli ifade (`/^([^=]+)=(.*)$/`) ile eşleştirir. Eşleşen değerlerin baş ve sonundaki tek (`'`) veya çift (`"`) tırnak işaretlerini `slice` metodu ile temizler. Sonuç olarak anahtar-değer çiftlerinden oluşan bir nesne döndürür.

**Parametreler**:
- `filePath`: string — Okunacak `.env` formatlı dosyanın tam dosya yolu

**Dönüş**: `object` — `{ [key: string]: string }` yapısında anahtar-değer çiftlerini içeren nesne. Dosya bulunamazsa veya okunamazsa `{}` boş nesne döner.

### main
**Ne yapar**: Supabase PostgreSQL veritabanına bağlanarak `public` şemasındaki tüm tanımlı fonksiyonların listesini sorgular ve sonuçları yerel bir JSON dosyasına kalıcı olarak kaydeder. Veritabanı bağlantısı için çoklu şifre ve port kombinasyonlarını otomatik olarak dener.

**Nasıl yapar**: Çalışma dizinindeki `.env` ve `.env.local` dosyalarını `parseEnv` fonksiyonu ile okuyarak ortam değişkenlerini birleştirir. Sabit Supabase bağlantı bilgilerini (kullanıcı adı, host, veritabanı) tanımlar. `.env` dosyalarından `SUPABASE_DB_PASSWORD` değerini ve opsiyonel olarak `DATABASE_URL` bağlantısından parçalanmış şifreyi toplar. Toplanan benzersiz şifrelerin 5432 ve 6543 portlarıyla her kombinasyonunu sırayla dener. Her denemede SSL (`rejectUnauthorized: false`) ile yeni bir `Client` nesnesi oluşturup `connect()` çağrısı yapar. İlk başarılı bağlantıda döngüden çıkar. Bağlantı başarısız olursa mevcut client'ı `end()` ile temizleyerek bir sonraki kombinasyona geçer. Başarılı bağlantıda `pg_proc` ve `pg_namespace` tablolarını birleştirerek `public` şemasındaki tüm fonksiyonların adlarını sorgular. Sonuçları `all_functions.json` dosyasına formatlanmış JSON olarak yazar ve konsola bilgi mesajı basar. İşlem sonunda bağlantıyı `finally` bloğunda kapatır.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz

**Dönüş**: `Promise<void>` — Doğrudan bir değer döndürmez. Sonuçları konsola yazar ve `c:\Users\alize\venthub-hvac\.agents\explorer_m1_2\all_functions.json` dosyasına yazar. Veritabanı bağlantısı hiçbir kombinasyonda sağlanamazsa konsola hata mesajı basar ve `process.exit(1)` ile programı sonlandırır.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: list_all_functions.js::parseEnv
- **params**: `filePath` — .env dosyasının filesystem yolu
- **ic_degiskenler**:
  - `content` — `fs.readFileSync(filePath, 'utf8')` ile okunan dosyanın ham string içeriği
  - `env` — parse edilen KEY=VALUE çiftlerinin tutulduğu boş obje; fonksiyon sonunda return edilir
  - `line` — `content.split('\n')` ile oluşan dizi elemanı; forEach callback parametresi, her bir satır
  - `trimmed` — `line.trim()` ile satır baş/sonundaki boşlukları temizlenmiş hal
  - `match` — `trimmed.match(/^([^=]+)=(.*)$/)` regex eşleşme sonucu; `match[1]` key, `match[2]` value
  - `val` — `match[2].trim()` ile elde edilen değer; çift tekli tırnak varsa `slice(1, -1)` ile temizlenir
  - `env[match[1].trim()]` — regex ile yakalanan key'in trim edilmiş hali, `env` objesine yazılır
- **Dönüş**: `{}` objesi (dosya yoksa) veya `env` objesi (parse edilen değişken sözlüğü)

---

### [N2_NASIL] AST Pointer: list_all_functions.js::main
- **params**: yok
- **ic_degiskenler**:
  - `envPath` — `path.resolve(process.cwd(), '.env')` ile hesaplanan .env dosya yolu
  - `envLocalPath` — `path.resolve(process.cwd(), '.env.local')` ile hesaplanan .env.local dosya yolu
  - `env` — `parseEnv(envPath)` ve `parseEnv(envLocalPath)` sonuçlarının spread ile birleştirilmiş hali; SUPABASE_DB_PASSWORD ve DATABASE_URL bu objeden okunur
  - `user` — Postgres kullanıcı adı, sabit string `'postgres.tnofewwkwlyjsqgwjjga'`
  - `host` — Supabase pooler host adresi, sabit string `'aws-1-eu-central-1.pooler.supabase.com'`
  - `database` — Postgres veritabanı adı, sabit string `'postgres'`
  - `passwords` — `env.SUPABASE_DB_PASSWORD` değerini içeren dizi; `filter(Boolean)` ile boş değerler atılır, veritabanı şifrelerini dene
  - `dbUrl` — `env.DATABASE_URL` varsa onu, yoksa `process.env.DATABASE_URL` değerini alır; URL'den şifre çıkarmak için kullanılır
  - `match` — `dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@/)` regex eşleşme sonucu; `match[2]` dbUrl içinden çıkarılan şifre, `[` içermiyorsa passwords dizisine eklenir
  - `uniquePasswords` — `Array.from(new Set(passwords))` ile tekrarları elenmiş benzersiz şifre listesi
  - `ports` — denenme portları dizisi `[5432, 6543]`
  - `possibleUrls` — her şifre × her port kombinasyonu `{user, password, host, port, database}` objelerinden oluşan dizi
  - `client` — `new pg.Client(...)` ile oluşturulan PostgreSQL istemcisi; döngüde bağlanmaya çalışılır, başarılı olursa break ile çıkılır
  - `connected` — boolean, veritabanına başarıyla bağlanılıp bağlanılmadığını tutar; `false` ise `process.exit(1)` ile çıkılır
  - `config` — `for (const config of possibleUrls)` döngüsü içindeki her bir konfigürasyon objesi `{user, password, host, port, database}`
  - `err` — `client.connect()` hata yakalama; başarısız bağlantıda `client.end()` çağrılır
  - `query` — PostgreSQL sorgusu stringi; `pg_proc` ve `pg_namespace` tablolarından `public` şemasındaki fonksiyon isimlerini çeker
  - `res` — `client.query(query)` sonucu; `res.rows` içinde `{schema_name, function_name}` objeleri bulunur
  - `res.rows.length` — bulunan fonksiyon sayısı, `console.log` ile yazdırılır
  - `err` — `client.query()` hata yakalama; sorgu hatalarında `console.error` ile yazdırılır
- **Dönüş**: yok (yan etki: `all_functions.json` dosyasına `res.rows` JSON olarak yazılır; başarı/hata mesajları `console.log`/`console.error` ile yazdırılır; başarısız bağlantıda `process.exit(1)` ile süreç sonlanır)

---

## NODE ID STANDARD

  file: .agents\explorer_m1_2\list_all_functions.js
  function: .agents\explorer_m1_2\list_all_functions.js::parseEnv
  function: .agents\explorer_m1_2\list_all_functions.js::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main
  export: parseEnv