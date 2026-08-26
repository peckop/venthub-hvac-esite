---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\scripts\setup_webhooks_cli.js
skeleton_hash: c4cd084f814cdb68
entity_hashes:
  func:main: d2e56e744a90c49f
  func:parseEnv: 3a18851b9f2b7450
  func:updateEnvFile: 2beb941c71e8f6b1
  overview: 5af45188729abaa0
generated_at: 2026-08-25T07:23:16Z
---

## Genel Bakış

Bu modül, komut satırı arayüzü üzerinden web hook'ların kurulumunu gerçekleştiren bir CLI betiğidir. Ortam değişkenlerini içeren `.env` dosyasını okuyarak mevcut yapılandırmayı analiz eder ve gerekli web hook bilgilerini bu dosyaya yazar.

## Fonksiyon Grupları

### Ortam Dosyası İşlemleri
`.env` dosyasının okunması ve güncellenmesinden sorumludur. Dosya içeriğini ayrıştırarak anahtar-değer çiftlerine dönüştürür ve yeni değerlerin dosyaya yazılmasını sağlar.
- parseEnv, updateEnvFile

### Ana İşlem Akışı
Modülün CLI üzerinden çalıştırıldığında yürüttüğü ana akışı yönetir. Ortam dosyası işlemlerini çağırarak web hook kurulum sürecini koordine eder.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri verilmediğinden, yalnızca fonksiyon imzalarından güvenilir aksiyom üretilemez. Fonksiyon gövdeleri sağlanırsa aksiyomlar yeniden değerlendirilebilir.

---

## FONKSİYON DETAYLARI

### parseEnv
**Ne yapar**: Verilen dosya yolundaki `.env` formatındaki dosyayı okuyarak anahtar-değer çiftlerinden oluşan bir nesne döndürür. Dosya mevcut değilse boş nesne döndürür.

**Nasıl yapar**: Önce `fs.existsSync` ile dosya varlığını kontrol eder; yoksa boş nesne döndürür. Dosya varsa `fs.readFileSync` ile UTF-8 olarak okur. İçeriği satırlara böler, her satırı `trim` ile temizler. Boş satırları ve `#` ile başlayan yorum satırlarını atlar. Kalan satırları `^([^=]+)=(.*)$` regex deseniyle eşleştirir. Eşleşme başarılıysa, değer kısmının başındaki ve sonundaki tırnak işaretlerini (çift veya tek) kaldırır. Sonuç olarak anahtar ve değer çiftlerini bir nesneye ekler ve bu nesneyi döndürür.

**Parametreler**:
- filePath: string — Okunacak `.env` dosyasının dosya yolu.

**Dönüş**: `env` — Anahtar-değer çiftlerini içeren düz bir nesne (object). Dosya mevcut değilse boş nesne döner.

### updateEnvFile
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### main
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: child_process::execSync
- import: crypto::crypto
- import: fs::fs
- import: node:url::fileURLToPath
- import: path::path

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/setup_webhooks_cli.js::parseEnv
- **params**: filePath
- **ic_degiskenler**:
  - `content` — `filePath` yolundaki dosyanın UTF-8 formatında okunan tam metin içeriği
  - `env` — çözümleme sonucu oluşturulan, anahtar-değer çiftlerini tutan boş nesne
  - `trimmed` — `content`'in satırlarının başındaki ve sonundaki boşlukları temizlenmiş hali
  - `match` — satırın `anahtar=değer` kalıbına uyup uymadığını kontrol eden regex eşleşmesi
  - `val` — eşleşen değer kısmının başındaki ve sonundaki boşlukları temizlenmiş, varsa çevresindeki tırnak işaretleri kaldırılmış hali
- **Dönüş**: `env` nesnesi (çözümlenmiş çevre değişkenlerini içerir)

### [N2_NASIL] AST Pointer: scripts/setup_webhooks_cli.js::updateEnvFile
- **params**: filePath, key, value
- **ic_degiskenler**:
  - `content` — `filePath` yolundaki dosyanın UTF-8 formatında okunan tam metin içeriği
  - `lines` — `content`'in satırlara ayrılmış dizisi
  - `found` — güncellenecek anahtarın (`key`) dosyada mevcut olup olmadığını gösteren boolean
  - `updatedLines` — satırların `key` ile başlayan satırı `key=value` ile değiştirilerek oluşturulan yeni dizi
  - `trimmed` — satırların başındaki ve sonundaki boşlukları temizlenmiş hali
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: scripts/setup_webhooks_cli.js::main
- **params**: yok
- **ic_degiskenler**:
  - `envPath` — betiğe göreli `../.env` dosyasının mutlak yolu
  - `envLocalPath` — betiğe göreli `../.env.local` dosyasının mutlak yolu
  - `env` — `envPath` ve `envLocalPath` dosyalarından çözümlenmiş çevre değişkenlerinin birleşimi
  - `webhookPrefix` — `'whsec_'` sabit dizesi
  - `secret` — `env.SUPABASE_WEBHOOK_SECRET` veya `process.env.SUPABASE_WEBHOOK_SECRET` değerinden okunan, yoksa yeni üretilen webhook gizli anahtarı
  - `setupSqlPath` — betiğe göreli `webhook_setup.sql` dosyasının mutlak yolu
  - `sqlContent` — `setupSqlPath` dosyasının içeriğindeki `REPLACE_WITH_ENV_SECRET` yer tutucusunun `secret` ile değiştirilmiş hali
  - `tempSqlFile` — betiğe göreli `temp_setup.sql` dosyasının mutlak yolu
  - `passwords` — `env.SUPABASE_DB_PASSWORD` değerini içeren, boş olmayan değerlerden oluşan dizi
  - `dbUrl` — `env.DATABASE_URL` veya `process.env.DATABASE_URL` değerinden okunan veritabanı bağlantı dizesi
  - `match` — `dbUrl` içindeki `postgresql://kullanıcı:şifre@host` kalıbını yakalayan regex eşleşmesi
  - `uniquePasswords` — `passwords` dizisindeki tekrar eden şifrelerin kaldırılmış hali
  - `possibleConfigs` — farklı kullanıcı, host, port ve şifre kombinasyonlarını içeren yapılandırma nesneleri dizisi
  - `pw` — `uniquePasswords` dizisi üzerinde döngüdeki her bir şifre değeri
  - `config` — `possibleConfigs` dizisi üzerinde döngüdeki her bir yapılandırma nesnesi
  - `encUser` — `config.user` değerinin URL kodlamasından geçirilmiş hali
  - `encPass` — `config.password` değerinin URL kodlamasından geçirilmiş hali
  - `dbUrl` (ikinci kapsam) — `encUser`, `encPass`, `config.host` ve `config.port` kullanılarak oluşturulan PostgreSQL bağlantı dizesi
  - `cmd` — `npx supabase db query` komutunu çalıştırmak için kullanılan tam komut dizesi
  - `success` — SQL kurulumunun başarılı olup olmadığını gösteren boolean
  - `err` — `execSync` komutu başarısız olduğunda yakalanan hata nesnesi
- **Dönüş**: yok

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    setup_webhooks_cli_js__main["main"]
    setup_webhooks_cli_js__parseEnv["parseEnv"]
    setup_webhooks_cli_js__updateEnvFile["updateEnvFile"]
    setup_webhooks_cli_js__main --> setup_webhooks_cli_js__parseEnv
    setup_webhooks_cli_js__main --> setup_webhooks_cli_js__updateEnvFile
```

## NODE ID STANDARD

  file: setup_webhooks_cli.js
  function: setup_webhooks_cli.js::parseEnv
  function: setup_webhooks_cli.js::updateEnvFile
  function: setup_webhooks_cli.js::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main
  export: parseEnv
  export: updateEnvFile