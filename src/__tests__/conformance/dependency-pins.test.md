---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\__tests__\conformance\dependency-pins.test.ts
skeleton_hash: 11719f479b98c0a9
entity_hashes:
  func:isFloating: 5add3b10596b93e9
  overview: 7dc0df13dce57515
generated_at: 2026-08-15T13:52:41Z
---

## Genel Bakış
Bu modül, bağımlılık versiyon pinleme kurallarının uygunluğunu test eden bir conformance test modülüdür. Bağımlılıkların doğru şekilde sabitlenip sabitlenmediğini doğrulamak için versiyon aralıklarının "floating" (belirsiz/yüzen) olup olmadığını tespit eden yardımcı fonksiyonlar içerir.

## Fonksiyon Grupları
### Yardımcı Fonksiyonlar
Test senaryolarında kullanılan yardımcı fonksiyonları tanımlar. Bu fonksiyonlar, versiyon aralıklarının belirsiz (floating) olup olmadığını belirleyerek test mantığını destekler.
- isFloating

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bağımlılık sürüm aralıklarının "floating" (belirsiz/sabitlenmemiş) olup olmadığını tespit eder.

**[Aksiyom 1]:** `isFloating` fonksiyonu `range` parametresi olarak bir `string` alır. Eğer `range` parametresi bir `string` değilse, fonksiyonun davranışı tanımsız olur.

**[Aksiyom 2]:** `FLOATING` sabiti bir `new_expression` ile oluşturulur. Bu ifadenin, geçerli bir regex pattern olarak derlenebilir olması gerekir; eğer `FLOATING` geçerli bir regex oluşturmayan bir değerden türetilmişse, `isFloating` her çağrıda hata verir.

**[Aksiyom 3]:** `NON_RANGE_PROTOCOLS` bir regex olarak tanımlıdır. Bu regex, sürüm aralığı içermeyen protokol前缀lerini (örn. `file:`, `git:`, `http:` vb.) eşleştirmelidir. Eğer bir `range` string'i bu regex ile eşleşiyorsa, bu aralık "floating" olarak değerlendirilmemelidir — protokol tabanlı kaynaklar sürüm aralığı formatına uymaz.

**[Aksiyom 4]:** `PKG_FILES` ve `EDGE_SOURCES` çağrı ile (fonksiyon olarak) invok edilir. Bu fonksiyonların, test edilmesi gereken bağımlılık dosyaları ve kenar kaynakları hakkında bilgi döndürmesi gerekir; eğer bu çağrılar başarısız olursa veya boş/yanlış tipte veri döndürürse, bağımlılık pin conformans kontrolü çalışamaz.

**[Aksiyom 5]:** `isFloating` fonksiyonu, `range` string'inin `FLOATING` ifadesiyle eşleşip eşleşmediğine göre `boolean` döndürür. Fonksiyon sadece `True`/`False` döndürebilir; başka bir değer döndürmesi beklenmez.

**[Aksiyom 6]:** `NON_RANGE_PROTOCOLS` regex'i `isFloating` kontrolünden *önce* uygulanmalıdır. Eğer bu filtreleme yapılmazsa, protokol前fixli aralıklar (örn. `git://...`) yanlışlıkla "floating" olarak işaretlenir.

---

## FONKSİYON DETAYLARI

### isFloating
**Ne yapar**: Bu fonksiyon, verilen bir version aralığı (range) dizgesinin zamana bağlı (floating) olup olmadığını belirler. Zamana bağlı aralıklar, zaman ilerledikçe otomatik olarak değişen veya güncellenen aralıklar olarak tanımlanır.

**Nasıl yapar**: Fonksiyon, girdi dizgesindeki boşlukları temizleyerek başlar. Ardından, `NON_RANGE_PROTOCOLS` adlı bir regular expression ile test edilir; bu test eşleşirse, aralık zamana bağlı değildir ve `false` döner. Daha sonra, `FLOATING` adlı bir Set yapısında bu değer aranır; eğer bulunursa `true` döner. Ek olarak, `"^>=?\s*\d"` kalıbı ile test yapılarak, örneğin `">=2.0.0"` gibi belirli bir sürümün üzerindeki tüm sürümleri kapsayan üst sınırsız aralıkların da zamana bağlı olduğu kabul edilir ve `true` döner. Hiçbir koşul sağlanmazsa, aralık sabittir ve `false` değerini döndürür.

**Parametreler**:
- `range`: string — Kontrol edilecek version aralığı dizgesi. Bu aralık, semver formatında olabilir veya özel protokoller içerebilir.

**Dönüş**: boolean — Fonksiyon, aralığın zamana bağlı olup olmadığını belirten bir boolean değer döndürür. `true` dönüşü, aralığın zaman içinde değişebileceğini; `false` dönüşü ise aralığın sabit ve değişmez olduğunu gösterir.

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

### [N1_NASIL] AST Pointer: `__tests__/conformance/dependency-pins.test.ts::isFloating`
- **params**: `(range: string)` — test edilecek versiyon aralığı stringi
- **ic_degiskenler**:
  - `v` — `range.trim()` ile baş/son boşlukları temizlenmiş versiyon aralığı
- **Dönüş**: `boolean` — aralığın-floating (zamana bağlı/sürümü belli olmayan) olup olmadığı

---

### [N2_NASIL] AST Pointer: `__tests__/conformance/dependency-pins.test.ts::describe_callback` (anonim, `beforeAll` + `it` bloklarını barındırır)
- **params**: `()` — parametre yok
- **ic_degiskenler**:
  - `pkgPath` — `Object.keys(PKG_FILES)[0]` ile elde edilen ilk package.json dosya yolu; globbdan dönen dosya listesinin ilk elemanı
  - `pkgRaw` — `pkgPath` varsa `PKG_FILES[pkgPath]` değerinden okunan package.json ham string içeriği; yoksa `undefined`
- **Dönüş**: yok — yan etki olarak `pkgPath` ve `pkgRaw` değişkenlerini tanımlar, alt `it` bloklarının kapanış alanı tarafından erişilir

---

### [N3_NASIL] AST Pointer: `__tests__/conformance/dependency-pins.test.ts::it_packageJsonOkunabiliyor` (anonim)
- **params**: `()` — parametre yok
- **ic_degiskenler**: (değişken yok — doğrudan `expect` çağrısı)
- **Dönüş**: yok — `expect(pkgRaw).toBeTruthy()` ile glob ile okunan package.json'ın varlığını doğrular; başarısız olursa test hatası fırlatır

---

### [N4_NASIL] AST Pointer: `__tests__/conformance/dependency-pins.test.ts::it_suruSablonlari` (anonim)
- **params**: `()` — parametre yok
- **ic_degiskenler**:
  - `pkg` — `JSON.parse(pkgRaw as string)` ile parse edilmiş package.json nesnesi; `dependencies`, `devDependencies`, `optionalDependencies` alanlarını opsiyonel olarak barındırır
  - `offenders` — `string[]` dizisi; floating (zamana bağlı) aralığa sahip bağımlılıkların `"alan.isim = \"aralık\""` formatında listelendiği toplama dizisi
  - `field` — döngüde sırasıyla `'dependencies'`, `'devDependencies'`, `'optionalDependencies'` değerini alan `const` dizesi
  - `block` — `pkg[field]` erişiminden elde edilen bağımlılık bloğu (isim→aralık mapping'i); `undefined` olabilir, `continue` ile atlanır
  - `name` — `Object.entries(block)` döngüsünden gelen bağımlılık paket ismi (ör. `"express"`)
  - `range` — `Object.entries(block)` döngüsünden gelen bağımlılık versiyon aralığı (ör. `"^4.18.0"`); `isFloating(range)` ile test edilir
- **Dönüş**: yok — `expect(offenders).toEqual([])` ile hiçbir bağımlılığın floating aralık kullanmadığını doğrular

---

### [N5_NASIL] AST Pointer: `__tests__/conformance/dependency-pins.test.ts::it_edgeCdnImportlari` (anonim)
- **params**: `()` — parametre yok
- **ic_degiskenler**:
  - `offenders` — `string[]` dizisi; tam sürüm içermeyen edge CDN importlarının `"dosya: url"` formatında listelendiği toplama dizisi
  - `cdnImport` — `/from\s+['"`](https:\/\/(?:esm\.sh|cdn\.skypack\.dev|deno\.land\/x)\/[^'"`]+)['"`]/g` global regex'i; edge kaynaklarındaki CDN import ifadelerini eşler
  - `file` — `Object.entries(EDGE_SOURCES)` döngüsünden gelen kaynak dosya adı/anahtarı
  - `src` — `Object.entries(EDGE_SOURCES)` döngüsünden gelen kaynak dosyanın içeriği (kod stringi)
  - `m` — `src.matchAll(cdnImport)` iterator'ünden dönen tek bir regex eşleşme sonucu (match object)
  - `url` — `m[1]` erişiminden elde edilen CDN URL'si (1. yakalama grubu); eşleşen import'un kaynak adresi
  - `hasFullVersion` — `boolean`; URL'de `@digit.digit.digit` veya `@v.digit.digit.digit` kalıbı olup olmadığını gösteren bayrak
- **Dönüş**: yok — `expect(offenders).toEqual([])` ile tüm edge CDN importlarının tam sürüm pin'i içerdiğini doğrular

---

### [N6_NASIL] AST Pointer: `__tests__/conformance/dependency-pins.test.ts::itKendiKendiniDogrular` (anonim)
- **params**: `()` — parametre yok
- **ic_degiskenler**:
  - `pinsiz` — backtick string; `"latest"` veya `"@2"` gibi tam sürüm içermeyen sahte bir edge CDN import ifadesi (test düzeltme/koruma amaçlı)
  - `pinli` — backtick string; `"@2.45.4"` gibi tam sürüm içeren sahte bir edge CDN import ifadesi (test düzeltme/koruma amaçlı)
  - `re` — `/@\d+\.\d+\.\d+/` regex'i; URL'de tam sürüm damgası olup olmadığını test eden kalıp; `pinsiz` üzerinde `false`, `pinli` üzerinde `true` dönmeli
- **Dönüş**: yok — sentetik örneklerle `isFloating` ve CDN regex'inin yanlış negative vermediğini doğrular; `expect(...).toBe(true/false)` ile 6 adet `isFloating` çağrısı, 2 adet regex testi ve `EDGE_SOURCES` uzunluk doğrulaması yapar

---

## NODE ID STANDARD

  file: src\__tests__\conformance\dependency-pins.test.ts
  function: src\__tests__\conformance\dependency-pins.test.ts::isFloating

---

## DISA AKTARILANLAR (EXPORTS)
  export: isFloating