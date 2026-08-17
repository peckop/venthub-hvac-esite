---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\__tests__\conformance\githooks-integrity.test.ts
skeleton_hash: 3ba0841079117940
entity_hashes:
  func:kodSatirlari: 8d03fb3659e310f1
  func:normalize: 193691aa2b60f258
  overview: fcf8c5d4d737d64f
generated_at: 2026-08-15T13:54:18Z
---

## Genel Bakış
Bu modül, Git hook dosyalarının içeriğiyle ilgili test senaryolarında kullanılan yardımcı fonksiyonları tanımlayan bir test yardımcı modülüdür. Temel olarak, kaynak kod dizelerini standart bir formata dönüştürmek ve satır bazında analiz etmek için gerekli işlevleri sağlar. Modül, test süreçlerinde veri hazırlama ve doğrulama adımlarını destekleyerek testlerin tutarlı ve güvenilir olmasını amaçlar.

## Fonksiyon Grupları
### Kaynak Kod Dönüştürme ve Analiz Fonksiyonları
Bu grup, verilen kaynak kod dizelerini testler için uygun forma getiren ve üzerinde inceleme yapılmasını sağlayan temel yardımcı fonksiyonları kapsar.
- normalize, kodSatırları

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Git hook dosyalarının bütünlüğünü test eden bir conformans test modülüdür. Aşağıdaki mimari varsayımlar fonksiyon imzaları ve modül sabitlerinden çıkarılmıştır.

---

**[Aksiyom 1]:** Eğer `normalize` fonksiyonuna `Record<string, string>` tipinde geçerli bir sözlük verilmezse (örn: `None`, farklı tipte veri), fonksiyonun dönüş davranışı tanımsız olur.

**[Aksiyom 2]:** Eğer `normalize` fonksiyonuna boş sözlük `{}` verilirse, sonuç boş sözlük `{}` olmalıdır (boş girdinin normalizasyonu değişiklik üretmez).

**[Aksiyom 3]:** Eğer `kodSatirlari` fonksiyonuna boş string `""` verilirse, sonuç boş string olmalıdır.

**[Aksiyom 4]:** Eğer `HOOK_SOURCES`, `PACKAGE_JSON`, `hookEntries` veya `hookNames` sabitleri doğru çağrılamazsa (None dönerse veya tanımsız kalırsa), hook bütünlük doğrulaması yapılamaz ve testler başarısız olur.

**[Aksiyom 5]:** Eğer `normalize` fonksiyonu bir sözlüğün değerlerini normalize ediyorsa, sonuç sözlüğünün anahtar sayısı girdi sözlüğünün anahtar sayısına eşit olmalıdır (anahtar kaybı yaşanmamalıdır).

**[Aksiyom 6]:** Eğer `kodSatirlari` fonksiyonu kaynak kod satırlarını ayrıştırıyorsa, girdi string'inin sonunda newline karakteri varsa veya yoksa, fonksiyon her iki durumda da çalışabilir olmalıdır.

**[Aksiyom 7]:** Eğer `hookNames` bir dizi/küme döndürüyorsa, bu isimler `HOOK_SOURCES` içindeki anahtarların alt kümesi olmalıdır; aksi halde eşleştirme yapılamaz.

---

## FONKSİYON DETAYLARI

### normalize

**Ne yapar**: Verilen `sources` sözlüğündeki tüm dosya yollarının başındaki `/` karakterini kaldırarak yolları standartlaştırır. Bu normalizasyon, glob paternleri ile elde edilen anahtarların (`/src/**` gibi eğik çizgiyle başlayan) `.githooks/README.md` gibi eğik çizgisiz yollarla tutarlı olmasını sağlar. Aksi takdirde `SOURCES['/.githooks/README.md']` gibi bir erişim sessizce `undefined` döner ve bekçi kontrolü hatalı biçimde yeşil ışık yakar.

**Nasıl yapar**: Fonksiyon, `Object.entries` ile sözlüğün tüm anahtar-değer çiftlerini iterate eder. Her bir yol (`p`) üzerinde `p.replace(/^\//, '')` düzenli ifadesi uygulanarak yolun en başındaki opsiyonel `/` karakteri (`^` ile ifade edilen baş konumu, `/` ile eşleşen ve `` ile opsiyonel kılınan) silinir. Sonuç olarak `Object.fromEntries` ile temizlenmiş `[yol, kaynak]` çiftlerinden yeni bir sözlük oluşturulur ve bu sözlük döndürülür.

**Parametreler**:
- `sources`: `Record<string, string>` — Anahtarları dosya yolları, değerleri ise bu dosyaların içerikleri olan sözlük. Anahtarlar glob paternleriyle (`/src/**`) elde edildiği için başlarında `/` bulunabilir.

**Dönüş**: `Record<string, string>` — Başındaki `/` karakteri kaldırılmış normalize edilmiş anahtarların bulunduğu yeni sözlük. Değerler (kaynak kod içerikleri) olduğu gibi korunur.

### kodSatirlari
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **HOOK_SOURCES** (call) — `normalize(
  import.meta.glob('/.githooks/*', { query: '?raw', import: 'defa...`
- **PACKAGE_JSON** (call) — `normalize(
  import.meta.glob('/package.json', { query: '?raw', import: 'def...`
- **hookEntries** (call) — `Object.entries(HOOK_SOURCES).filter(([p]) => !p.endsWith('.md'))`
- **hookNames** (call) — `hookEntries.map(([p]) => p.split('/').pop() as string).sort()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::normalize
- **params**: `sources: Record<string, string>` — dosya yollarının (key) kaynak kodlarının (value) eşlendiği sözlük
- **ic_degiskenler**:
  - `Object.entries(sources).map(([p, src]) => ...)` — entries ile dönen her eleman `[p, src]` olarak destructured:
    - `p` — dosya yolu (ör: `.githooks/pre-commit`)
    - `src` — o dosyanın kaynak kodu içeriği
- **Dönüş**: `Record<string, string>` — yolların başındaki `/` karakteri kaldırılmış yeni sözlük

---

### [N2_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::kodSatirlari
- **params**: `src: string` — bir kanca dosyasının ham kaynak kodu
- **ic_degiskenler**:
  - `l` — `.filter()` callback'inde her bir satır; `#` ile başlayan yorum/satırları eler
- **Dönüş**: `string` — yorum satırları çıkarılmış temiz kaynak kodu

---

### [N3_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::(it callback — stale-guard)
- **params**: (yok — vitest `it` callback'i)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — `hookEntries.length` değerinin `0`'dan büyük olduğunu doğrular; `.githooks/` dizininin okunabilir olduğunu guarantee eder

---

### [N4_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::(it callback — zorunlu kancalar)
- **params**: (yok — vitest `it` callback'i)
- **ic_degiskenler**:
  - `ad` — `ZORUNLU` dizisi üzerindeki for-of döngüsünün her adımındaki zorunlu kanca adı
- **Dönüş**: void — her `ad` değerinin `hookNames` içinde bulunduğunu doğrular

---

### [N5_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::(it callback — .git/ yasağı)
- **params**: (yok — vitest `it` callback'i)
- **ic_degiskenler**:
  - `YASAK` — `/\$\{?[A-Za-z_][A-Za-z0-9_]*\}?\/\.git\//` regular expression; `${PATH}/.git/` kalıbını yakalar
  - `ihlal` — `hookEntries` dizisinin `.filter()` ile `YASAK.test(kodSatirlari(src))` koşulunu sağlayan, `.map()` ile sadece yolların (`[p]`) alındığı dizi
  - `[p, src]` — `.filter()` callback'inde destructured: `p` kanca yolu, `src` kanca kaynak kodu
- **Dönüş**: void — `ihlal` dizisinin boş olduğunu doğrular

---

### [N6_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::(it callback — log yönlendirmesi)
- **params**: (yok — vitest `it` callback'i)
- **ic_degiskenler**:
  - `LOG_YONLENDIRMESI` — `/>>?\s*"[^"]*\.log"/` regular expression; log dosyasına yönlendiren `>> "file.log"` kalıbını yakalar
  - `p` — for-of döngüsünde her kanca dosyasının yolu
  - `src` — for-of döngüsünde her kanca dosyasının kaynak kodu
- **Dönüş**: void — `LOG_YONLENDIRMESI` eşleşen kanca kaynak kodunda `rev-parse --absolute-git-dir` bulunmasını doğrular

---

### [N7_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::(it callback — shebang kontrolü)
- **params**: (yok — vitest `it` callback'i)
- **ic_degiskenler**:
  - `p` — for-of döngüsünde her kanca dosyasının yolu
  - `src` — for-of döngüsünde her kanca dosyasının kaynak kodu
- **Dönüş**: void — her `src` değerinin `#!/bin/sh` ile başladığını doğrular

---

### [N8_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::(it callback — README tablosu)
- **params**: (yok — vitest `it` callback'i)
- **ic_degiskenler**:
  - `readme` — `HOOK_SOURCES['.githooks/README.md']` ile erişilen README dosyasının içeriği
  - `ad` — `hookNames` dizisi üzerindeki for-of döngüsünün her adımındaki kanca adı
- **Dönüş**: void — her `ad` değerinin `readme` içinde `` `${ad}` `` formatında bulunduğunu doğrular

---

### [N9_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::(it callback — core.hooksPath uyarısı)
- **params**: (yok — vitest `it` callback'i)
- **ic_degiskenler**:
  - `readme` — `HOOK_SOURCES['.githooks/README.md']` ile erişilen README dosyasının içeriği
  - `kurulumBolumu` — `readme.slice(0, readme.indexOf('## Kancalar'))` ile elde edilen; `## Kancalar` başlığından önceki kurulum bölümü
  - `uyariVar` — `/⛔[^\n]*core\.hooksPath/.test(kurulumBolumu)` sonucu; kurulum bölümünde `core.hooksPath` için ⛔ uyarısı olup olmadığını belirten boolean
- **Dönüş**: void — `uyariVar` değerinin `true` olduğunu doğrular

---

### [N10_NASIL] AST Pointer: `__tests__/conformance/githooks-integrity.test.ts`::(it callback — prepare script)
- **params**: (yok — vitest `it` callback'i)
- **ic_degiskenler**:
  - `pkg` — `PACKAGE_JSON['package.json']` ile okunan `package.json` dosyasınınham içeriği (string)
- **Dönüş**: void — `pkg` değerinin `"prepare"` script'inin `setup-hooks.mjs` çağırdığını eşleştiğini doğrular

---

## NODE ID STANDARD

  file: src\__tests__\conformance\githooks-integrity.test.ts
  function: src\__tests__\conformance\githooks-integrity.test.ts::normalize
  function: src\__tests__\conformance\githooks-integrity.test.ts::kodSatirlari

---

## DISA AKTARILANLAR (EXPORTS)
  export: kodSatirlari
  export: normalize