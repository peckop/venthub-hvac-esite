---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\explorer_m1_2\scan_functions.js
skeleton_hash: 56b89373e1d90f4b
entity_hashes:
  func:main: e6923f0407cf86a3
  func:parseEnv: 407358888558b46a
  overview: 22751f37d697448e
generated_at: 2026-06-02T07:46:56Z
---

## Genel Bakış
Bu modül, belirtilen dosya yollarındaki ortam değişkeni tanımlarını (`.env` benzeri dosyaları) okuyup ayrıştırma sürecini yönetir. Modül, asenkron bir iş akışıyla dosya okuma ve ayrıştırma işlemlerini gerçekleştirilerek ortam yapılandırmasını uygulama için kullanılabilir hale getirir.

## Fonksiyon Grupları
### Ortam Dışı Ayrıştırma
Bu grup, dosya sisteminden ortam değişkenlerini okuyarak anahtar-değer çiftlerine dönüştürme sorumluluğunu taşır.
- `parseEnv`, `main`

### İş Akışı Yönetimi
Modülün genel iş akışını koordine eden üst düzey kontrol mekanizmasını temsil eder. Fonksiyonların çağrılma sırasını ve hata yönetimini organize eder.
- `main`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, dosya tabanlı yapılandırma (.env) okuma ve ana program akışı çalıştırma sorumluluğuna sahiptir.

**[Aksiyom 1]:** Eğer `parseEnv` fonksiyonuna geçerli bir `filePath` parametresi sağlanmazsa, ortam değişkenlerinin (environment) parse edilmesi başarısız olur.

**[Aksiyom 2]:** Eğer `pg` sabiti (object_pattern) modül dahilinde tanımlı değilse, modülün beklenen yapısal deseni karşılanamaz ve fonksiyonların beklediği desen eşleştirmesi çalışamaz.

**[Aksiyom 3]:** Eğer `main()` fonksiyonu çalıştırılmadan önce `parseEnv` tarafından ortam değişkenleri başarıyla yüklenmemişse, ana program akışı beklenmeyen değerlerle (eksik/boş) devam eder.

---

## FONKSİYON DETAYLARI

### parseEnv
**Ne yapar**: Belirtilen dosya yolundaki `.env` formatındaki yapılandırma dosyasını okur ve içindeki ortam değişkenlerini anahtar-değer çiftleri olarak bir JavaScript nesnesine dönüştürür. Dosya mevcut değilse boş bir nesne döndürerek programın hata vermeden devam etmesini sağlar.

**Nasıl yapar**: Dosya varlığını kontrol eder, yoksa boş nesne döndürür. Dosya içeriğini okuyarak satır satır işler. Her satırı temizler, boş satırları ve '#' ile başlayan yorum satırlarını atlar. Düzenli ifade kullanarak satırı eşitlik işaretinden ikiye böler. Elde ettiği değerin başındaki ve sonundaki tırnak işaretlerini (hem tek hem çift) temizler. Anahtar-değer çiftlerini topladığı nesneyi döndürür.

**Parametreler**:
- filePath: string — Okunacak `.env` dosyasının dosya yolu.

**Dönüş**: object — Anahtarları ortam değişkeni adları, değerleri ise bu değişkenlerin string karşılıkları olan bir nesne. Dosya bulunamazsa boş bir nesne (`{}`) döndürülür.

### main
**Ne yapar**: Veritabanı bağlantı bilgilerini ortam değişkenlerinden alarak bir Supabase PostgreSQL veritabanına bağlanmaya çalışır. Başarılı bir bağlantı sağlandığında, veritabanının `public` şemasındaki tüm `SECURITY DEFINER` fonksiyonlarının detaylarını sorgular ve sonuçları belirli bir JSON dosyasına yazar.

**Nasıl yapar**: Önce çalıştığı dizindeki `.env` ve `.env.local` dosyalarını parse ederek ortam değişkenlerini birleştirir (`.env.local` öncelikli). Veritabanı kullanıcısını, sunucusunu ve veritabanı adını sabit olarak atar. Şifreleri, ortam değişkenlerinden (`SUPABASE_DB_PASSWORD`, `DATABASE_URL`) toplar, benzersiz olanları belirler. Farklı şifreler ve portlar (5432, 6543) ile olası bağlantıları dener. İlk başarılı bağlantıda durur. Sorgu çalıştırarak fonksiyon bilgilerini çeker, sonuçları JSON formatında dosyaya yazar ve konsola başarı mesajı basar. Bağlantı hatası durumunda programı sonlandırır.

**Parametreler**: Yok

**Dönüş**: Yok (void). Fonksiyon asinçron çalışır ve işlemleri tamamladığında veya kritik bir hata oluştuğunda (`process.exit(1)`) sonlanır.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scan_functions.js::parseEnv
- **params**: `filePath` — okunacak .env dosyasının yolu
- **ic_degiskenler**:
  - `content` — fs.readFileSync ile okunan dosyanın ham string içeriği
  - `env` — parse edilen key-value çiftlerini tutanaccumulator sözlük nesnesi
  - `line` — content.split('\n') ile elde edilen her bir satır (forEach callback parametresi)
  - `trimmed` — line.trim() ile baş/son boşlukları temizlenmiş satır
  - `match` — trimmed'i /^([^=]+)=(.*)$/ regex'i ile eşleştiren sonuç dizisi; match[1]=key, match[2]=value
  - `val` — match[2]'den elde edilen değer, baştaki/sondaki tek veya çift tırnak işaretleri varsa slice ile kaldırılmış hali
- **Dönüş**: `env` sözlüğü (dosya yoksa boş `{}` döner; dosya varsa parse edilmiş key-value çiftleri)

### [N2_NASIL] AST Pointer: scan_functions.js::main
- **params**: (yok)
- **ic_degiskenler**:
  - `envPath` — process.cwd() üzerine path.resolve ile mutlak yolu hesaplanan `.env` dosya yolu
  - `envLocalPath` — process.cwd() üzerine path.resolve ile mutlak yolu hesaplanan `.env.local` dosya yolu
  - `env` — parseEnv() çağrılarından gelen iki sözlüğün spread ile birleştirilmesiyle oluşan birleşik ortam değişkenleri sözlüğü
  - `user` — Supabase PostgreSQL kullanıcı adı string sabiti (`'postgres.tnofewwkwlyjsqgwjjga'`)
  - `host` — Supabase PostgreSQL host adresi string sabiti
  - `database` — PostgreSQL veritabanı adı string sabiti (`'postgres'`)
  - `passwords` — env.SUPABASE_DB_PASSWORD değerini içeren, filter(Boolean) ile falsy değerleri elenmiş aday şifre dizisi
  - `dbUrl` — env.DATABASE_URL varsa onu, yoksa process.env.DATABASE_URL değerini alan değişken
  - `match` — dbUrl'i /postgresql:\/\/([^:]+):([^@]+)@/ regex'i ile eşleştiren sonuç; match[1]=kullanıcı, match[2]=şifre
  - `e` — DATABASE_URL regex parse işlemindeki boş catch bloğu tarafından yakalanan ve sessizce yok sayılan hata nesnesi
  - `uniquePasswords` — Array.from(new Set(passwords)) ile tekrarları elenmiş benzersiz şifre dizisi
  - `ports` — denenecek PostgreSQL port numaraları dizisi [5432, 6543]
  - `possibleUrls` — her şifre ve port kombinasyonu için bir {user, password, host, port, database} nesnesi içeren dizi
  - `pw` — for döngüsünde uniquePasswords dizisi üzerinde iterasyon yapan mevcut şifre
  - `port` — iç içe for döngüsünde ports dizisi üzerinde iterasyon yapan mevcut port numarası
  - `client` — pg.Client instance'ı; veritabanı bağlantısı için kullanılır, döngüde her denemede yeniden oluşturulur
  - `connected` — boolean bayrak, en az bir bağlantı denemesi başarılı olduysa true olur
  - `config` — possibleUrls dizisi üzerinde iterasyon yapan mevcut bağlantı yapılandırma nesnesi
  - `err` — connection loop'taki try-catch'te yakalanan bağlantı hatası nesnesi
  - `e` — client.end() çağrısındaki try-catch'te yakalanan ve sessizce yok sayılan hata nesnesi (bağlantı kapatma hatası)
  - `query` — pg_proc ve pg_namespace tablolarından SECURITY DEFINER fonksiyonları tarayan SQL sorgu stringi
  - `res` — client.query(query) çağrısının döndüğü sonuç nesnesi; rows dizisi Security Definer fonksiyonların bilgilerini içerir
  - `err` — query try-catch'inde yakalanan sorgu hata nesnesi (konsola yazdırılır)
- **Dönüş**: yok — yan etki olarak `functions_scan.json` dosyasına res.rows JSON olarak yazılır; bağlantı başarısızsa process.exit(1) ile sonlanır

---

## NODE ID STANDARD

  file: .agents\explorer_m1_2\scan_functions.js
  function: .agents\explorer_m1_2\scan_functions.js::parseEnv
  function: .agents\explorer_m1_2\scan_functions.js::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main
  export: parseEnv