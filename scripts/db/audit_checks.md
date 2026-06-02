---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\audit_checks.js
skeleton_hash: 78abd59adc4f48dc
entity_hashes:
  func:loadEnv: cdc6628f011fa912
  func:run: b6031923f9769de9
  overview: af39be0dd406e441
generated_at: 2026-06-02T07:47:39Z
---

## Genel Bakış
Bu modül, HVAC sistem veritabanı üzerinde denetim kontrolleri gerçekleştirmekten sorumludur. Veritabanı bütünlüğü, veri kalitesi veya uygunluk durumunu doğrulayan kontrolleri merkezi bir şekilde yönetir.

## Fonksiyon Grupları
### Ortam Hazırlığı
Uygulamanın çalıştırılacağı çevre değişkenlerini ve yapılandırma değerlerini yükler.
- loadEnv

### Denetim Kontrollerinin Çalıştırılması
Tüm veritabanı denetim kontrollerini orkestra ederek ana iş akışını başlatır.
- run

---

## AXIOMS – Mimari Varsayımlar

Bu modül, proje kök dizininde belirli dosya ve yapılandırma varsayımlarına dayanır.

**[Aksiyom 1]:** Eğer `config/audit-checks.yaml` dosyası proje kök dizininde (`../../` relative to `__dirname`) yoksa, modül `process.exit(1)` ile sonlanır ve denetim çalıştırılamaz.

**[Aksiyom 2]:** Eğer `yaml` npm paketi (`require('yaml')`) yüklü değilse, modül başlatılamaz ve `require` aşamasında hata fırlatılır.

**[Aksiyom 3]:** Eğer `.env` dosyası proje kök dizininde (`../../` relative to `__dirname`) yoksa, `loadEnv()` `null` döner ve tüm veritabanı/supabase bağlantı değerleri default fallback'lere (DB_HOST=`'localhost'`, DB_PORT=`5432`, DB_NAME=`'venthub_hvac'`, DB_USER=`'postgres'`, DB_PASS=`''`, SUPABASE_URL=`''`, SUPABASE_SERVICE_ROLE_KEY=`''`) düşer.

**[Aksiyom 4]:** Modülün çalışması için `__dirname` değerinin `scripts/db/` dizinine karşılık gelmesi gerekir; çünkü tüm dosya yolları (`../../.env`, `../../audit-report.md`, `../../config/audit-checks.yaml`) bu dizinsel konuma göre hesaplanır. Eğer `__dirname` farklı bir konumdaysa, dosya yolları yanlış hedeflere yönelir.

**[Aksiyom 5]:** `.env` dosyası mevcutsa, içindeki değişkenlerin `KEY=VALUE` formatında ve her birinin satır başında `#` ile başlamayan satırlarda olması gerekir; aksi halde parse edilemez satırlar sessizce atlanır.

**[Aksiyom 6]:** `audit-checks.yaml` dosyasının geçerli bir YAML formatında olması gerekir; aksi halde `yaml.parse()` hata fırlatır ve denetim raporu üretilmez.

---

## FONKSİYON DETAYLARI

### loadEnv
**Ne yapar**: Proje kök dizinindeki `.env` dosyasını okuyarak ortam değişkenlerini bir JavaScript nesnesine dönüştürür. Dosya mevcut değilse boş bir nesne döndürür. Bu fonksiyon, veritabanı bağlantı bilgisi gibi kritik yapılandırma değerlerinin programın geri kalanına sunulmasını sağlar.



**Nasıl yapar**: `.env` dosyasının tam yolunu `path.join` ile oluşturur ve dosyanın varlığını `fs.existsSync` ile kontrol eder. Dosya mevcutsa `readFileSync` ile okunur, ardından her satır ayrı ayrı işlenir: satır başı/sonu `\r` karakterleri temizlenir, yorum satırları (`#` ile başlayan bölümler) kaldırılır, boşluklar trim edilir ve `=` karakterine göre ayrıştırılır. Değer kısmındaki tek veya çift tırnak işaretleri regex ile temizlenerek temiz bir key-value çifti elde edilir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `Object` — Anahtarları `.env` dosyasındaki değişken isimleri, değerleri ise karşılık gelen değerler olan bir JavaScript nesnesi döndürür. Dosya bulunamazsa boş bir nesne `{}` döner.

### run
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`
- **__dirname** (call) — `path.dirname(fileURLToPath(import.meta.url))`
- **rootDir** (call) — `path.resolve(__dirname, '../..')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `scripts/db/audit_checks.js::loadEnv`
- **params**: (yok)
- **ic_degiskenler**:
  - `envPath` — `.env` dosyasının `rootDir` referansıyla birleştirilmiş tam yolu
  - `envContent` — `envPath` dosyasının `'utf8'` encoding ile okunmuş ham string içeriği
  - `env` — `{}` boş obje; parse edilen ortam değişkeni key-value çiftlerini depolar
  - `line` — `envContent.split('\n')` sonrası `.forEach()` callback'i içinde dolaşılan her bir satır stringi
  - `cleanLine` — `line`'dan `\r` karakterleri temizlendi, `#` sonrasında gorumeler atıldı, trimmed hali; boşsa `return` ile atlanır
  - `parts` — `cleanLine.split('=')` sonucu oluşan array; `[0]` key, geri kalanı value
  - `key` — `parts[0].trim()` ile elde edilen ortam değişkeni adı
  - `value` — `parts.slice(1).join('=').trim()` ile birleştirilmiş, baş/son tırnak işaretleri `.replace(/^['"]|['"]$/g, '')` ile kaldırılmış değer
- **Dönüş**: `env` objesi (key-value sözlüğü); `.env` dosyası yoksa `{}` boş obje

---

### [N2_NASIL] AST Pointer: `scripts/db/audit_checks.js::run`
- **params**: (yok)
- **ic_degiskenler**:
  - `disabledTables` — `string[]`; GraphQL `{"disabled": true}` annotation'u içeren tabloların `relname` değerlerini toplayan dizi
  - `r3Pass` — `boolean`; `product_images_select_tenant` politikasının `authenticated` rolüne, tenant izolasyonuna ve `jwt_tenant_id()`/`split_part` koşullarına sahip olup olmadığını belirleyen bayrak
  - `r` — (callback parametresi) `pg` sorgu sonucu döndürdüğü tekil satır objesi; `r.policyname`, `r.roles`, `r.cmd`, `r.qual`, `r.relname`, `r.description` alanlarına erişilir
  - `desc` — `r.description`'ın fallback olarak `''` boş string ile alınmış hali; `@graphql({"disabled": true})` araması için kullanılır
  - `isDisabled` — `boolean`; `desc.includes('@graphql({"disabled": true})')` kontrolü; `true` ise tablo GraphQL'den devre dışıdır
  - `p` — (callback parametresi) Politika satırı objesi; `p.policyname`, `p.roles`, `p.cmd`, `p.qual` alanlarına erişilir; `p.roles.includes('authenticated')`, `p.roles.includes('public')`, `p.roles.includes('anon')`, `p.qual.includes('jwt_tenant_id()')`, `p.qual.includes('split_part')` kontrolleri yapılır
- **Dönüş**: fonksiyon gövdesinin tamamı görünmediğinden kesin return belirlenemez; yan etkiler: `console.log()` ile politika ve tablo raporlama çıktısı basar, `pg` üzerinden veritabanı sorguları çalıştırır

---

## NODE ID STANDARD

  file: scripts\db\audit_checks.js
  function: scripts\db\audit_checks.js::loadEnv
  function: scripts\db\audit_checks.js::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadEnv
  export: run