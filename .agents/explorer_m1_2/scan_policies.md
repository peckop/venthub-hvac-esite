---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\explorer_m1_2\scan_policies.js
skeleton_hash: 193d724a9a4f14c0
entity_hashes:
  func:main: e08720da8b1c5bbf
  func:parseEnv: 407358888558b46a
  overview: 22751f37d697448e
generated_at: 2026-06-02T07:47:16Z
---

## Genel Bakış
Bu modül, HVAC projesinin yapılandırma ve politika dosyalarını tarayan bir keşif (exploration) bileşenidir. Ortam değişkenlerini ve politika tanımlarını okuyarak sistem için gerekli yapılandırma bilgilerini çıkarır.

## Fonksiyon Grupları
### Yapılandırma Okuma
Ortam değişkenlerini ve yapılandırma dosyalarını işleyerek proje için gerekli ayarları ayrıştırır.
- `parseEnv` — Belirtilen dosya yolundaki yapılandırma dosyasını okur ve değişkenleri ayrıştırır.

### Koordinasyon
Modülün ana giriş noktasını oluşturarak tarama sürecini başlatır ve bileşenler arası akışı yönetir.
- `main` — Asenkron olarak modülün temel iş mantığını yürütür ve yapılandırma okuma işlemini tetikler.

---



---

## FONKSİYON DETAYLARI

### parseEnv
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### main
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scan_policies.js::parseEnv
- **params**: `filePath` — .env dosyasının tam dosya yolu (string)
- **ic_degiskenler**:
  - `content` — `fs.readFileSync(filePath, 'utf8')` ile okunan dosyaham metin içeriği
  - `env` — parse edilen environment değişkenlerini tutan key-value nesnesi
  - `line` — `content.split('\n')` ile elde edilen her bir satır (forEach callback parametresi)
  - `trimmed` — `line.trim()` ile baş/son boşlukları temizlenmiş satır
  - `match` — `trimmed.match(/^([^=]+)=(.*)$/)` regex eşleşmesi; `match[1]` key, `match[2]` value
  - `val` — `match[2].trim()` ile elde edilen değer; çift tek/çift tırnak varsa `slice(1, -1)` ile temizlenir
- **Dönüş**: `env` nesnesi (key: trimlenmiş satır adı, value: temizlenmiş değer); dosya yoksa boş `{}`

---

### [N2_NASIL] AST Pointer: scan_policies.js::main
- **params**: (yok)
- **ic_degiskenler**:
  - `envPath` — `path.resolve(process.cwd(), '.env')` ile hesaplanan `.env` dosyasının mutlak yolu
  - `envLocalPath` — `path.resolve(process.cwd(), '.env.local')` ile hesaplanan `.env.local` dosyasının mutlak yolu
  - `env` — `parseEnv(envPath)` ve `parseEnv(envLocalPath)` sonuçlarının spread ile birleştirilmesi; `.env.local` öncelikli
  - `user` — PostgreSQL bağlantı kullanıcı adı, sabit `'postgres.tnofewwkwlyjsqgwjjga'`
  - `host` — Supabase connection pooler host adresi, sabit `'aws-1-eu-central-1.pooler.supabase.com'`
  - `database` — veritabanı adı, sabit `'postgres'`
  - `passwords` — `env.SUPABASE_DB_PASSWORD` değerini içeren dizi; `filter(Boolean)` ile falsy değerler temizlenmiş
  - `dbUrl` — `env.DATABASE_URL || process.env.DATABASE_URL` ile elde edilen database connection URL'i
  - `match` — `dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@/)` regex eşleşmesi; `match[2]` URL içindeki parola
  - `uniquePasswords` — `Array.from(new Set(passwords))` ile tekrarları kaldırılmış benzersiz şifre listesi
  - `ports` — denenmesi gereken port numaraları dizisi `[5432, 6543]`
  - `possibleUrls` — tüm `user/password/host/port/database` kombinasyonlarını tutan konfigürasyon nesneleri dizisi
  - `client` — `new Client({...})` ile oluşturulan `pg.Client` örneği; veritabanı bağlantısı ve sorgu yürütme için
  - `connected` — veritabanı bağlantısının başarılı olup olmadığını belirten boolean bayrak
  - `config` — for döngüsündeki mevcut deneme konfigürasyonu (`user`, `password`, `host`, `port`, `database`, `ssl` alanları)
  - `query` — `pg_policies` tablosundan `public` şemasındaki politikaları seçen SQL sorgu stringi (`schemaname`, `tablename`, `policyname`, `roles`, `cmd`, `qual`, `with_check` alanları)
  - `res` — `client.query(query)` sonucu; `res.rows` politika_satırları dizisi
  - `err` — catch bloklarında yakalanan hata nesnesi (bağlantı hatası ve sorgu hatası için ayrı bloklarda)
- **Dönüş**: (yok) — yan etki olarak `c:\Users\alize\venthub-hvac\.agents\explorer_m1_2\policies_scan.json` dosyasına `res.rows` JSON formatında yazılır; `console.log` ile başarı mesajı basılır; bağlantı başarısızsa `process.exit(1)` ile program sonlanır

---

## NODE ID STANDARD

  file: .agents\explorer_m1_2\scan_policies.js
  function: .agents\explorer_m1_2\scan_policies.js::parseEnv
  function: .agents\explorer_m1_2\scan_policies.js::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main
  export: parseEnv