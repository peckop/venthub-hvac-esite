---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\explorer_m1_2\check_migration_version.js
skeleton_hash: c57dc06663315e0a
entity_hashes:
  func:main: b845fd0bbbd8973d
  func:parseEnv: 407358888558b46a
  overview: 22751f37d697448e
generated_at: 2026-06-02T07:44:44Z
---

## Genel Bakış
Bu modül, veritabanı geçiş (migration) süreçlerinde sürüm uyumluluğunu kontrol eden bir araçtır. Temel olarak ortam değişkenlerinden gerekli yapılandırma bilgilerini okuyarak, geçerli bir sürüm aralığında olup olmadığınızı doğrulamanızı sağlar.

## Fonksiyon Grupları
### Ortam Yapısığrması
Bu grup, programın çalışması için gerekli olan ortam değişkenlerini ve yapılandırma parametrelerini dış bir dosyadan okuyup ayrıştırma sorumluluğuna sahiptir.
- parseEnv

### Ana Kontrol ve Orkestrasyon
Bu grup, programın akışını yöneten ve asıl kontrol mantığını yürüten ana işlevleri içerir. Diğer fonksiyonları çağırarak nihai sonucu üretir.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül, migration versiyonunu kontrol eden bir araçtır. Aşağıdaki mimari varsayımlar fonksiyon imzaları ve modül sabitlerinden türetilmiştir:

---

**[Aksiyom 1]:** Eğer `parseEnv` fonksiyonuna geçerli bir `filePath` parametresi verilmezse, ortam değişkenlerinin (env) okunması başarısız olur.

**[Aksiyom 2]:** Eğer `parseEnv` fonksiyonuna verilen `filePath` dosyası mevcut değilse veya okunamıyorsa, parse işlemi hata ile sonuçlanır.

**[Aksiyom 3]:** Eğer `main` fonksiyonu çağrılmazsa, modül herhangi bir iş yapmaz (entry point tetiklenmez).

**[Aksiyom 4]:** `pg` sabiti bir `object_pattern` olarak tanımlıdır; eğer `pg` modül seviyesinde başlatılamazsa (ör. bağımlılık eksik), pattern eşleştirme işlemleri çalışmaz.

**[Aksiyom 5]:** Eğer `parseEnv`返回 ettiği veri içinde migration versiyonu ile ilgili anahtar yoksa veya format uygun değilse, `main` fonksiyonu versiyon karşılaştırmasını doğru yapamaz.

---

> **Not:** Fonksiyon gövdeleri ve docstring'ler analiz edilemediği için, `parseEnv`'in ne döndürdüğü ve `main`'in `pg`'yi nasıl kullandığı hakkında kesin bilgi mevcut değildir. Bu aksiyomlar yalnızca fonksiyon imzalarına ve sabit tanımlarına dayanmaktadır.

---

## FONKSİYON DETAYLARI

### parseEnv

**Ne yapar**: Belirtilen dosya yolundaki `.env` formatındaki bir dosyayı okuyarak içindeki ortam değişkenlerini JavaScript nesnesine dönüştürür. Dosya mevcut değilse boş bir nesne döner.

**Nasıl yapar**: Dosya içeriğini satır satır okur, her satırda前三boşluk ve yorum satırlarını ( `#` ile başlayan ) atlar. Kalan satırları `key=value` formatında regex ile ayrıştırır. Değerlerin tırnak işaretleri ile sarılı olup olmadığını kontrol eder ve varsa tırnak işaretlerini kaldırarak temiz bir değer elde eder. Sonuç olarak anahtar-değer çiftlerinden oluşan bir nesne döner.

**Parametreler**:
- `filePath`: string — Okunacak `.env` dosyasının tam dosya yolu

**Dönüş**: `object` — Ayrıştırılmış ortam değişkenlerini içeren nesne. Dosya bulunamazsa `{}` boş nesne döner. Anahtarlar temizlenmiş (trim edilmiş) ortam değişkeni adları, değerler ise temizlenmiş string değerlerdir.

### main
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: check_migration_version.js::parseEnv
- **params**: `filePath` — .env dosyasının dosya yolu
- **ic_degiskenler**:
    - `content` — Dosyanın `filePath` konumundan okunan tüm metin içeriği (string)
    - `env` — Satırlardan çıkarılan anahtar-değer çiftlerini saklayacak boş nesne
    - `line` — `content.split('\n')` tarafından oluşturulan mevcut satır (string)
    - `trimmed` — `line.trim()` ile baş/son boşlukları temizlenmiş satır
    - `match` — `trimmed` üzerinde `/^([^=]+)=(.*)$/`正则 eşleşmesi sonucu dizi; `match[1]` anahtar, `match[2]` değer portion'u
    - `val` — `match[2].trim()` ile elde edilen ve olası tırnak işaretleri (`"`, `'`) kırpılmış değer (string)
- **Dönüş**: `{}` (boş nesne) veya `env` nesnesi (Object)

### [N1_NASIL] AST Pointer: check_migration_version.js::main
- **params**: (yok)
- **ic_degiskenler**:
    - `envPath` — `process.cwd()` dizinindeki `.env` dosyasının mutlak yolu (`path.resolve` ile oluşturulur)
    - `envLocalPath` — `process.cwd()` dizinindeki `.env.local` dosyasının mutlak yolu
    - `env` — `parseEnv` ile okunan `.env` ve `.env.local` nesnelerinin birleşimi (dağıtılmış)
    - `user` — Veritabanı bağlantı kullanıcı adı, sabit `'postgres.tnofewwkwlyjsqgwjjga'` atanmış
    - `host` — Veritabanı sunucu adresi, sabit `'aws-1-eu-central-1.pooler.supabase.com'` atanmış
    - `database` — Veritabanı adı, sabit `'postgres'` atanmış
    - `passwords` — `env.SUPABASE_DB_PASSWORD` değerini içeren dizi; `env.DATABASE_URL`'den çıkarsanan şifre de `push` ile eklenir
    - `dbUrl` — `env.DATABASE_URL` veya `process.env.DATABASE_URL` değeri (string veya undefined)
    - `match` — `dbUrl` üzerinde `/postgresql:\/\/([^:]+):([^@]+)@/`正则 eşleşmesi sonucu dizi; `match[2]` şifre portion'u
    - `uniquePasswords` — `passwords` dizisindeki benzersiz elemanları içeren Set'ten oluşturulmuş dizi
    - `ports` — Denenecek portları `[5432, 6543]` olarak tutan dizi
    - `possibleUrls` — Tüm olası şifre ve port kombinasyonlarını (`user, password, host, port, database` nesnesi olarak) tutan dizi
    - `client` — `pg.Client` örneği, döngüde başarılı bağlantı için oluşturulur
    - `connected` — Bağlantı durumunu izleyen boolean bayrak
    - `config` — `possibleUrls` dizisi üzerindeki `for...of` döngüsündeki mevcut bağlantı yapılandırma nesnesi
    - `res` — `client.query` çağrısından dönen sorgu sonucu nesnesi (`rows` dizisini içerir)
- **Dönüş**: Yok (fonksiyon bir değer dönmez; başarılı sorgulama sonucunda `console.log` ile çıktı basar veya bağlantı hatası/sonuç yoksa `process.exit(1)` ile sonlanır)

---

## NODE ID STANDARD

  file: .agents\explorer_m1_2\check_migration_version.js
  function: .agents\explorer_m1_2\check_migration_version.js::parseEnv
  function: .agents\explorer_m1_2\check_migration_version.js::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main
  export: parseEnv