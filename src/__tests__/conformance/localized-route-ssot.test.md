---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\__tests__\conformance\localized-route-ssot.test.ts
skeleton_hash: 24e14938ce6603b7
entity_hashes:
  func:stripComments: 5898506cb94c3dd3
  func:toRelPath: af61e4aa40b87630
  overview: 856c01d5ddeac4b0
generated_at: 2026-08-25T07:49:56Z
---

## Genel Bakış
Bu modül, localized-route-ssot (tek doğru kaynak) ile ilgili testleri barındıran bir test dosyasıdır. Dosya kapsamında iki yardımcı fonksiyon tanımlıdır ve bu fonksiyonlar test senaryolarında veri hazırlama/dönüştürme işlemleri için kullanılır.

## Fonksiyon Grupları

### Test Yardımcıları
Test süreçlerinde girdi verilerini dönüştürmek ve hazırlamak için kullanılan yardımcı fonksiyonlardır. Bu fonksiyonlar, test mantığını destekleyerek kaynak metinlerden yorum temizleme ve glob anahtarlarını göreceli dosya yollarına çevirme işlevlerini yerine getirir.
- stripComments, toRelPath

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### stripComments
**Ne yapar**: Kaynak kod metnindeki JavaScript/TypeScript yorumlarını kaldırır. Amaç, açıklayıcı yorumlardaki örnek desenlerin bekçi (guard) mantığını tetiklemesini önlemektir.

**Nasıl yapar**: İki aşamalı regex değiştirme uygular. İlk olarak `/* ... */` biçimindeki blok yorumları, `[\s\S]*?` ile çok satırlı olacak şekilde ve mümkün olduğunca kısa eşleşecek (lazy) biçimde boş dizeyle değiştirir. İkinci olarak `//` ile başlayan satır içi yorumları kaldırırken, `http://` gibi URL şemalarını korumak amacıyla `//` öncesinde `:` olmayan durumları hedefler; eşleşmenin başındaki yakalanan grubu (`$1`) koruyarak şema işaretini silmez.

**Parametreler**:
- source: string — Yorumları kaldırılacak kaynak kod metni

**Dönüş**: string — Yorumlardan arındırılmış kaynak kod metni

### toRelPath
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **SOURCES** (call) — `import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'defaul...`
- **LITERAL_LANG_PREFIX** (regex) — `/['"`]\/(?:tr|en)\//`
- **INFRA_ALLOWLIST** (new_expression) — `new Set<string>([
  // Dil önekini KURAN altyapının kendisi.
  'utils/route...`
- **MANUAL_LANG_PREFIX** (regex) — `/\/\$\{\s*(?:lang|locale)\s*\}/`
- **HARDCODED_APP_PATH** (regex) — `/\b(?:href|to)\s*[:=]\s*\{?\s*['"`]\/(?:category|products|account|legal|brand...`
- **RAW_ROUTES_IMPORT** (regex) — `/import\s*\{[^}]*\bRoutes\b[^}]*\}\s*from\s*['"][^'"]*utils\/routes['"]/`
- **HAS_LOCALIZER** (regex) — `/\b(?:localizedHref|useLocalizedRoutes)\b/`
- **RAW_ROUTES_ALLOWLIST** (array) — `[
  'components/admin/',
  'views/admin/',
  'components/products/BentPlan...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/__tests__/conformance/localized-route-ssot.test.ts::stripComments
- **params**: `source: string` — yorumlardan arındırılacak kaynak kod metni
- **ic_degiskenler**: yok
- **Dönüş**: `string` — blok yorumları (`/* ... */`) ve satır yorumları (`// ...`) kaldırılmış kaynak kod; `http://` gibi URL şemalarındaki `//` korunur

### [N2_NASIL] AST Pointer: src/__tests__/conformance/localized-route-ssot.test.ts::toRelPath
- **params**: `globKey: string` — dosya glob anahtarı (tam yol)
- **ic_degiskenler**:
  - `marker` — `/src/` string sabiti; globKey içinde aranacak yol ayırıcı işaretçi
  - `idx` — `globKey.indexOf(marker)` sonucu; marker'ın globKey içindeki karakter pozisyonu (-1 ise bulunamadı)
- **Dönüş**: `string` — globKey'ten `/src/` sonrası çıkarılmış, ters eğik çizgiler (`\`) düz eğik çizgiye (`/`) dönüştürülmüş göreceli dosya yolu

### [N3_NASIL] AST Pointer: src/__tests__/conformance/localized-route-ssot.test.ts::(anonim — birinci `it` callback: navigasyon URL'leri SSOT ile localize edilmeli)
- **params**: yok
- **ic_degiskenler**:
  - `manualPrefix` — `string[]`; `MANUAL_LANG_PREFIX` regex'ine uyan dosya yollarını toplar (elle dil öneki kullanan dosyalar)
  - `hardcodedPath` — `string[]`; `HARDCODED_APP_PATH` regex'ine uyan dosya yollarını toplar (sabit app-yolu kullanan dosyalar)
  - `key` — `Object.entries(SOURCES)` döngüsündeki dosya glob anahtarı
  - `source` — `Object.entries(SOURCES)` döngüsündeki dosya kaynak kodu
  - `rel` — `toRelPath(key)` sonucu; dosyanın göreceli yolu
  - `clean` — `stripComments(source)` sonucu; yorumlardan arındırılmış kaynak kod
- **Dönüş**: yok — `expect({ manualPrefix, hardcodedPath }).toEqual({ manualPrefix: [], hardcodedPath: [] })` ile assertion yapar

### [N4_NASIL] AST Pointer: src/__tests__/conformance/localized-route-ssot.test.ts::(anonim — ikinci `it` callback: altyapı katmanında elle dil öneki yalnız ADLA muaf dosyalarda olabilir)
- **params**: yok
- **ic_degiskenler**:
  - `offenders` — `string[]`; `INFRA_SCOPE` kapsamına girip `INFRA_ALLOWLIST`'te bulunmayan ve `MANUAL_LANG_PREFIX` veya `LITERAL_LANG_PREFIX` regex'ine uyan dosya yollarını toplar
  - `key` — `Object.entries(SOURCES)` döngüsündeki dosya glob anahtarı
  - `source` — `Object.entries(SOURCES)` döngüsündeki dosya kaynak kodu
  - `rel` — `toRelPath(key)` sonucu; dosyanın göreceli yolu
  - `clean` — `stripComments(source)` sonucu; yorumlardan arındırılmış kaynak kod
- **Dönüş**: yok — `expect(offenders).toEqual([])` ile assertion yapar

### [N5_NASIL] AST Pointer: src/__tests__/conformance/localized-route-ssot.test.ts::(anonim — üçüncü `it` callback: INFRA_ALLOWLIST bayat değil)
- **params**: yok
- **ic_degiskenler**:
  - `stale` — `string[]`; bayat (artık geçerli olmayan) muafiyet kayıtlarını toplar
  - `allowed` — `INFRA_ALLOWLIST` set'indeki her bir muaf dosya göreceli yolu
  - `entry` — `Object.entries(SOURCES).find(([k]) => toRelPath(k) === allowed)` sonucu; eşleşen `[key, source]` çifti veya `undefined` (dosya artık yoksa)
  - `clean` — `stripComments(entry[1])` sonucu; yorumlardan arındırılmış kaynak kod
- **Dönüş**: yok — `expect(stale).toEqual([])` ile assertion yapar

### [N6_NASIL] AST Pointer: src/__tests__/conformance/localized-route-ssot.test.ts::(anonim — dördüncü `it` callback: client/RSC nav bileşeni ham Routes değil localize SSOT kullanmalı)
- **params**: yok
- **ic_degiskenler**:
  - `offenders` — `string[]`; `SCOPE` kapsamına girip `RAW_ROUTES_ALLOWLIST`'te bulunmayan ve `RAW_ROUTES_IMPORT` regex'ine uyan ama `HAS_LOCALIZER` regex'ine uymayan dosya yollarını toplar
  - `key` — `Object.entries(SOURCES)` döngüsündeki dosya glob anahtarı
  - `source` — `Object.entries(SOURCES)` döngüsündeki dosya kaynak kodu
  - `rel` — `toRelPath(key)` sonucu; dosyanın göreceli yolu
  - `clean` — `stripComments(source)` sonucu; yorumlardan arındırılmış kaynak kod
- **Dönüş**: yok — `expect(offenders).toEqual([])` ile assertion yapar

---

## NODE ID STANDARD

  file: localized-route-ssot.test.ts
  function: localized-route-ssot.test.ts::stripComments
  function: localized-route-ssot.test.ts::toRelPath

---

## DISA AKTARILANLAR (EXPORTS)
  export: stripComments
  export: toRelPath