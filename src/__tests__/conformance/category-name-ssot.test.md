---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\__tests__\conformance\category-name-ssot.test.ts
skeleton_hash: 335625fc2b5ec00a
entity_hashes:
  func:stripComments: a23ddeb5b1e9f087
  func:toRelPath: 5935533af5852617
  overview: 856c01d5ddeac4b0
generated_at: 2026-06-15T11:43:07Z
---

## Genel Bakış
Bu modül, Category Name SSOT (Tekil Kaynak) test altyapısına yardımcı olan temel araç fonksiyonlarını içerir. Genel olarak, test süreçlerinde kaynak kod manipülasyonu ve dosya yolu standartleştirme işlemleri için kullanılır.

## Fonksiyon Grupları
### Kaynak Kod Manipülasyon Araçları
Test senaryolarında kullanılacak kaynak kodların temizlenmesi ve hazırlanmasıyla ilgilidir.
- stripComments

### Dosya Yolu Dönüşüm Araçları
Testlerde kullanılan glob kalıplarını ve referansları, göreli dosya yollarına dönüştürerek standardizasyon sağlar.
- toRelPath

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kaynak dosyalardan yorum satırlarını temizleyen ve glob key'lerini göreli yola dönüştüren bir yardımcı modüldür.

**[Aksiyom 1]:** Eğer `SOURCES` sabiti tanımlı veya çağrılamaz ise, kaynak dosya listesi alınamaz ve `stripComments`/`toRelPath` işlevleri işleyecek ham veri bulamaz.

**[Aksiyom 2]:** Eğer `ALLOWLIST` sabiti bir array olarak tanımlı değilse, hangi glob key'lerinin geçerli olacağı bilinemeyeceğinden `toRelPath` hatalı eşleştirmeler yapabilir.

**[Aksiyom 3]:** Eğer `DIRECT_INDEX` sabiti geçerli bir regex değilse, glob key'lerinin doğrudan indeks eşleştirmesi çalışmayacağından `toRelPath` yanlış veya eksik yollar üretebilir.

**[Aksiyom 4]:** Eğer `source` parametresi geçerli bir string değilse (None, boş, veya beklenmeyen türde ise), `stripComments` yorum ayıklama işlemini düzgün yürütülemez.

**[Aksiyom 5]:** Eğer `globKey` parametresi geçerli bir string değilse, `toRelPath` glob key'ini tanımlayamaz ve göreli yol üretimi başarısız olur.

---

## FONKSİYON DETAYLARI

### stripComments
**Ne yapar**: Verilen kaynak kodu dizisinden yorum satırlarını ve blok yorumlarını kaldırır. Temel amacı, açıklayıcı yorumların içinde yer alan örnek kodların veya desenlerin bir denetim (bekçi) tarafından yanlış tetiklenmesini önlemektir.

**Nasıl yapar**: Fonksiyon, kaynak kodunu iki ardışık regex operasyonu ile işler. İlk olarak, `/* ... */` şeklindeki blok yorumları, yorum içeriğini temsil eden `[\s\S]*?` kalıbı ile eşleşerek (`g` bayrağıyla global olarak) boşluk ile değiştirir. İkinci olarak, `// ...` ile başlayan satır yorumlarını silerken, “http://” veya “https://” gibi şema belirteçlerini (“:” karakteri ile korunan durumları) korumak için bir lookbehind benzeri bir kontrol (`(^|[^:])`) kullanır. Bu, URL’lerin yorum olarak yanlış algılanmasını engeller.

**Parametreler**:
- `source`: `string` — Yorumların kaldırılacağı, ham kaynak kodu dizisi.

**Dönüş**: `string` — Yorumlardan arındırılmış, temizlenmiş kaynak kodu.

### toRelPath
**Ne yapar**: Tam bir glob anahtarını (dosya yolu), proje yapısına göre normalize edilmiş bir göreli yola dönüştürür. Genellikle test yapılandırma dosyalarında veya kaynak haritalamalarda kullanılan bu fonksiyon, yolun `/src/` dizininden sonraki kısmını çıkararak ve yol ayraçlarını standart hale getirerek taşınabilirlik sağlar.

**Nasıl yapar**: Fonksiyon, giriş dizisi içinde `/src/` dizesini (marker) arar. Eğer marker bulunursa, yolu bu marker'ın hemen ardından keser (slice). Marker bulunamazsa, orijinal yolu olduğu gibi kullanır. Elde edilen yoldaki tüm ters eğik çizgi (`\`) karakterleri, Unix tarzı eğik çizgi (`/`) ile değiştirilerek yol tutarlı hale getirilir. Bu, Windows ve Unix tabanlı sistemler arası uyumu garantiler.

**Parametreler**:
- `globKey`: `string` — Tam yolu içerebilecek, `/src/` dizinini barındıran glob kalıbı veya dosya yolu.

**Dönüş**: `string` — `/src/` dizininden sonraki kısmı içeren, ters eğik çizgileri normalize edilmiş göreli dosya yolu.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **SOURCES** (call) — `import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default'...`
- **ALLOWLIST** (array) — `[
  'utils/categoryHelpers.ts',
  'lib/type-converters.ts',
  'i18n/dictionar...`
- **DIRECT_INDEX** (regex) — `/categoryList\w*\s*(\?\.)?\s*\[/`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: category-name-ssot.test.ts::stripComments
- **params**: `source: string` — ham kaynak kod metni (yorumlar dahil)
- **ic_degiskenler**: (yok — doğrudan zincirli replace döndürülür)
  - zincir üzerinde `source.replace(...)` çağrılır: `/* blok */` yorumlarını siler
  - ikinci `source.replace(...)`: `//` satır yorumlarını siler, `http://` gibi şema korumalıdır
- **Dönüş**: `string` — yorumları temizlenmiş kaynak kod metni

---

### [N2_NASIL] AST Pointer: category-name-ssot.test.ts::toRelPath
- **params**: `globKey: string` — tam dosya yolu (glob pattern anahtarı)
- **ic_degiskenler**:
  - `marker` — `'src/'` dizin belirtecini temsil eden sabit string; globKey içindeki kaynak kök dizininin tespit edilmesinde kullanılır
  - `idx` — `globKey.indexOf(marker)` sonucu; `'/src/'` dizgesinin globKey içindeki başlangıç indeksi; `-1` ise bulunamamıştır
- **Dönüş**: `string` — `'/src/'` sonrasından itibaren kesilmiş göreli dosya yolu; ters eğik çizgiler (`\`)eğik çizgilere (`/`) normalize edilmiştir

---

### [N3_NASIL] AST Pointer: category-name-ssot.test.ts::(anonim test callback)
- **params**: (yok — vitest `it()` callback imzası)
- **ic_degiskenler**:
  - `offenders` — `string[]` dizisi; SSOT kuralını ihlal eden (doğrudan `categoryList` indeksleyen) dosya yollarını toplar
  - `key` — `Object.entries(SOURCES)` döngüsündeki her bir entry'nin tam dosya yolu anahtarı
  - `source` — `key` ile eşleşen kaynak kod string'i (SOURCES sözlüğünden gelir)
  - `rel` — `toRelPath(key)` çağrılarak elde edilen göreli dosya yolu; `.d.ts`, `__tests__`, `.test.` filtreleri ve ALLOWLIST kontrolü bu değişken üzerine yapılır
- **Kullanılan dış referanslar**: `SOURCES` (call), `ALLOWLIST` (array), `DIRECT_INDEX` (regex), `stripComments` (fonksiyon çağrısı), `toRelPath` (fonksiyon çağrısı)
- **Dönüş**: yok — `expect(offenders).toEqual([])` assertion ile test sonucunu yan etki olarak üretir; `offenders` dizisinin boş olmasını bekler

---

### [N4_NASIL] AST Pointer: category-name-ssot.test.ts::(anonim test callback — ikinci tekrar)
- **params**: (yok — vitest `it()` callback imzası)
- **ic_degiskenler**:
  - `offenders` — `string[]` dizisi; SSOT kuralını ihlal eden dosya yollarını toplar
  - `key` — `Object.entries(SOURCES)` döngüsünden gelen tam dosya yolu anahtarı
  - `source` — `key` ile eşleşen kaynak kod string'i
  - `rel` — `toRelPath(key)` ile hesaplanan göreli dosya yolu; filtreleme koşulları bu değişken üzerinde test edilir
- **Kullanılan dış referanslar**: `SOURCES` (call), `ALLOWLIST` (array), `DIRECT_INDEX` (regex), `stripComments` (fonksiyon çağrısı), `toRelPath` (fonksiyon çağrısı)
- **Dönüş**: yok — `expect(offenders).toEqual([])` assertion ile test sonucunu yan etki olarak üretir

---

## NODE ID STANDARD

  file: src\__tests__\conformance\category-name-ssot.test.ts
  function: src\__tests__\conformance\category-name-ssot.test.ts::stripComments
  function: src\__tests__\conformance\category-name-ssot.test.ts::toRelPath

---

## DISA AKTARILANLAR (EXPORTS)
  export: stripComments
  export: toRelPath