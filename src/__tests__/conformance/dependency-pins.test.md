---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\__tests__\conformance\dependency-pins.test.ts
skeleton_hash: 5b2bae40a61f62d6
entity_hashes:
  func:isFloating: 5add3b10596b93e9
  overview: 7dc0df13dce57515
generated_at: 2026-08-25T07:33:21Z
---

## Genel Bakış
Bu modül, bağımlılık versiyon sabitlemelerinin (dependency pins) uyumluluğunu test eden bir test dosyasıdır. Proje genelinde kullanılan bağımlılık versiyon aralıklarının sabitlenmiş (pinlenmiş) olup olmadığını doğrulamayı amaçlar.

## Fonksiyon Grupları

### Yardımcı Test Fonksiyonları
Verilen bir bağımlılık versiyon aralığının sabitlenmiş olup olmadığını belirleyen yardımcı fonksiyonları içerir. Bu fonksiyon, test senaryolarında versiyon aralıklarının "floating" (sabitlenmemiş, hareketli) yapıda olup olmadığını saptamak için kullanılır.
- isFloating

## Bağımlılıklar
- **İç bağımlılıklar**: Bilinmiyor — modülde yalnızca tek bir fonksiyon tanımlı olup, bu fonksiyonun başka bir yerden çağrılıp çağrılmadığı verilen kaynaktan anlaşılamıyor.
- **Dış bağımlılıklar**: Bilinmiyor — dış modül import'larına dair bilgi verilmemiştir.
- **Dinamik/lazy yüklenen modül**: Bilinmiyor.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### isFloating
**Ne yapar**: Verilen bir versiyon aralığı (range) string'inin "yüzen" (floating) olup olmadığını belirler. Yüzen aralıklar, zamanla değişebilecek sonuçlar üreten, üst sınırı belirsiz veya sabit bir versiyona bağlı olmayan aralıklardır.

**Nasıl yapar**: Fonksiyon öncelikle girdi string'ini baştaki ve sondaki boşluklardan arındırır. Ardından üç aşamalı bir kontrol uygular: İlk olarak `NON_RANGE_PROTOCOLS` deseni ile eşleşme kontrolü yapılır; bu desene uyan protokoller aralık olarak değerlendirilmediğinden false döner. İkinci olarak `FLOATING` kümesinde aranır; bu küme içinde tanımlı değerler doğrudan yüzen aralık kabul edilir ve true döner. Üçüncü olarak `>=?` regex deseni ile eşleşme kontrolü yapılır; `>=2.0.0` gibi üst sınırsız aralıklar da zamana bağlı olduğundan true döner. Bu kontrollerin hiçbiri eşleşmezse fonksiyon false döner.

**Parametreler**:
- range: string — Yüzen aralık olup olmadığı kontrol edilecek versiyon aralığı ifadesi. Örneğin `">=2.0.0"` veya `"^1.0.0"` gibi değerler alabilir.

**Dönüş**: boolean — Verilen aralık yüzen (zamana bağlı/değişken) ise `true`, sabit bir versiyona bağlı veya aralık dışı bir protokol ise `false` döner.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **PKG_FILES** (call) — `import.meta.glob('/package.json', {
  query: '?raw',
  import: 'default',
...`
- **EDGE_SOURCES** (call) — `import.meta.glob(
  '/supabase/functions/**/*.ts',
  { query: '?raw', impor...`
- **NON_RANGE_PROTOCOLS** (regex) — `/^(workspace|catalog|link|file|npm|github|git\+|https?):/`
- **FLOATING** (new_expression) — `new Set(['latest', '*', '', 'x', 'X', 'next', 'canary'])`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\__tests__\conformance\dependency-pins.test.ts::isFloating
- **params**: `range: string`
- **ic_degiskenler**:
  - `v` — `range.trim()` sonucu, baştaki ve sondaki boşlukları temizlenmiş versiyon aralığı string'i; `NON_RANGE_PROTOCOLS` regex'ine ve `FLOATING` set'ine karşı test edilir
- **Dönüş**: boolean — aralık "yüzen" (zamana bağlı) ise `true`, sabitlenmiş ise `false`
- **sabit_baglantilari**: `NON_RANGE_PROTOCOLS` (regex, `.test(v)` ile kullanılır), `FLOATING` (Set, `.has(v)` ile kullanılır)
- **dahili_regex**: `/^>=?\s*\d/` — `>=` veya `>` ile başlayan, ardından opsiyonel boşluk ve rakam gelen üst-sınırsız aralıkları yakalar

### [N2_NASIL] AST Pointer: src\__tests__\conformance\dependency-pins.test.ts::anonim (it callback — "package.json okunabiliyor")
- **params**: yok
- **ic_degiskenler**:
  - `pkgPath` — `Object.keys(PKG_FILES)[0]` ile alınan ilk dosya yolu anahtarı; `PKG_FILES` dict'inin ilk key'i
  - `pkgRaw` — `PKG_FILES[pkgPath]` değeri; dosya ham içeriği veya `pkgPath` yoksa `undefined`
- **Dönüş**: yok (test bloğu; `expect(pkgRaw).toBeTruthy()` çağrısı yapar)
- **sabit_baglantilari**: `PKG_FILES` (dict, `Object.keys()` ve indeks erişimi ile kullanılır)

### [N3_NASIL] AST Pointer: src\__tests__\conformance\dependency-pins.test.ts::anonim (it callback — "hiçbir bağımlılık latest/*/üst-sınırsız aralık kullanmaz")
- **params**: yok
- **ic_degiskenler**:
  - `pkg` — `JSON.parse(pkgRaw as string)` sonucu; `dependencies`, `devDependencies`, `optionalDependencies` alanları olan nesne
  - `offenders` — ihlal eden bağımlılıkları toplayan boş `string[]` dizisi; her ihlalde `"${field}.${name} = \"${range}\"" formatında eleman eklenir
  - `field` — `for` döngüsündeki alan adı; `'dependencies'`, `'devDependencies'`, `'optionalDependencies'` değerlerini alır
  - `block` — `pkg[field]` değeri; mevcut bağımlılık bloğu (`Record<string, string>`) veya tanımsız
  - `name` — `Object.entries(block)` döngüsündeki bağımlılık paket adı
  - `range` — `Object.entries(block)` döngüsündeki versiyon aralığı string'i; `isFloating(range)` ile test edilir
- **Dönüş**: yok (test bloğu; `expect(offenders).toEqual([])` çağrısı yapar)
- **sabit_baglantilari**: yok (sadece `isFloating` fonksiyonu çağrılır)

### [N4_NASIL] AST Pointer: src\__tests__\conformance\dependency-pins.test.ts::anonim (it callback — "edge CDN importları tam sürüm taşır")
- **params**: yok
- **ic_degiskenler**:
  - `offenders` — pinsiz CDN importlarını toplayan boş `string[]` dizisi; her ihlalde `"${file}: ${url}"` formatında eleman eklenir
  - `cdnImport` — CDN import pattern'ini yakalayan global regex (`/from\s+['"`](https:\/\/(?:esm\.sh|cdn\.skypack\.dev|deno\.land\/x)\/[^'"`]+)['"`]/g`)
  - `file` — `Object.entries(EDGE_SOURCES)` döngüsündeki dosya adı anahtarı
  - `src` — `Object.entries(EDGE_SOURCES)` döngüsündeki dosya kaynak içeriği string'i
  - `m` — `src.matchAll(cdnImport)` döngüsündeki regex eşleşme sonucu
  - `url` — `m[1]` değeri; eşleşen CDN URL'si
  - `hasFullVersion` — `url` içinde tam sürüm damgası olup olmadığını gösteren boolean; `/@\d+\.\d+\.\d+/` veya `/@v\d+\.\d+\.\d+/` regex'lerinden biriyle test edilir
- **Dönüş**: yok (test bloğu; `expect(offenders).toEqual([])` çağrısı yapar)
- **sabit_baglantilari**: `EDGE_SOURCES` (dict, `Object.entries()` ile kullanılır)

### [N5_NASIL] AST Pointer: src\__tests__\conformance\dependency-pins.test.ts::anonim (it callback — "kendi kendini doğrular")
- **params**: yok
- **ic_degiskenler**:
  - `pinsiz` — pinsiz CDN import örneği string'i (`"import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'"`)
  - `pinli` — pinli CDN import örneği string'i (`"import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'"`)
  - `re` — tam sürüm pattern'ini yakalayan regex (`/@\d+\.\d+\.\d+/`); `pinsiz` ve `pinli` üzerinde `.test()` ile kullanılır
- **Dönüş**: yok (test bloğu; `isFloating` ve `re.test` ile sentetik doğrulamalar, `expect(Object.keys(EDGE_SOURCES).length).toBeGreaterThan(20)` çağrısı yapar)
- **sabit_baglantilari**: `EDGE_SOURCES` (dict, `Object.keys()` ile kullanılır), `isFloating` fonksiyonu (çeşitli string'lerle çağrılır)

---

## NODE ID STANDARD

  file: dependency-pins.test.ts
  function: dependency-pins.test.ts::isFloating

---

## DISA AKTARILANLAR (EXPORTS)
  export: isFloating