---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\payment-money-move.test.ts
skeleton_hash: f2bf6639b18f8d93
entity_hashes:
  func:stripComments: 45ff160a2c958389
  overview: b9d311ad6dc9a2cc
generated_at: 2026-08-17T11:00:39Z
---

## Genel Bakış
Bu modül, ödemeler ve para hareketleriyle ilgili davranışların test edildiği bir test dosyasıdır. Temel işlevi, test senaryoları sırasında gerekli olan verileri hazırlamak ve doğrulama süreçlerini kolaylaştırmaktır. Modül, test altyapısının bir parçası olarak işlev görür.

## Fonksiyon Grupları
### Yardımcı Fonksiyonlar
Bu fonksiyon, test süreçlerinde kullanılacak kod stringlerinin temizlenmesi ve hazırlanması gibi destekleyici bir görevi yerine getirir. Genellikle test senaryoları içinde doğrudan kullanılmaz, ancak veri hazırlama aşamasında yararlıdır.
- stripComments

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ödeme/hareket (payment-money-move) analizine ilişkin kod inceleme ve yorum temizleme işlemleri için kullanılır.

[Aksiyom 1]: Eğer `stripComments` fonksiyonuna `code` parametresi olarak string dışındaki bir değer verilirse, fonksiyon beklenmeyen sonuç döndürür veya hata fırlatır.

[Aksiyom 2]: Eğer `PSP_CALL_RE` regex sabiti tanımlı veya geçerli bir regex deseni değilse, PSP (Ödeme Hizmeti Sağlayıcı) çağrılarının tespiti başarısız olur.

[Aksiyom 3]: Eğer `CLAIM_RE` regex sabiti tanımlı veya geçerli bir regex deseni değilse, claim (talep) ifadelerinin eşleşmesi yapılamaz.

[Aksiyom 4]: Eğer `EMPTY_CATCH_RE` regex sabiti tanımlı veya geçerli bir regex deseni değilse, boş catch bloklarının tespiti başarısız olur.

[Aksiyom 5]: Eğer `moneyMovers` çağrılabilir (callable) bir referans değilse, para hareketi ile ilişkili çağrı analizleri gerçekleştirilemez.

[Aksiyom 6]: Eğer `edgeSources` as_expression kaynağı erişilebilir değilse, kenar kaynak (edge source) ifadelerinin analizi yapılamaz.

---

**Not:** Fonksiyon gövdesi detayları paylaşılmadığından, bu aksiyomlar sadece imza ve sabit tanımlarından türetilen minimum zorunlulukları içermektedir.

---

## FONKSİYON DETAYLARI

### stripComments
**Ne yapar**: Verilen bir JavaScript/TypeScript kod dizesindeki yorum bloklarını ve satır sonu yorumlarını, kodun yapısını ve satır numaralarını koruyarak boşluk karakterleriyle değiştirir.

**Nasıl yapar**: Fonksiyon, iki aşamalı bir regülasyon (regex) operasyonu uygular. İlk adım, `/* ... */` ile belirtilen çok satırlı yorumları hedef alır. Bu yorumların tüm içeriğini (yeni satır karakterleri hariç) bir boşluk karakteriyle değiştirir; bu sayede yorumun kapladığı satır ve sütun yapısı korunarak kodun geri kalan parçalarının hizası bozulmaz. İkinci adım, `//` ile başlayan tek satır yorumları hedef alır. Bu düzenli ifade, bir `:` karakterinden sonra gelen `//` tanımlarını hedef almaz (URL'leri korumak için), ancak diğer tüm tek satır yorumları yakalar ve tamamen siler.

**Parametreler**:
- `code: string` — Yorumlarından arındırılması istenen kaynak kod dizesi.

**Dönüş**: `string` — Yorumları temizlenmiş, ancak satır yapısı ve hizası korunmuş yeni kod dizesi.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **edgeSources** (as_expression) — `import.meta.glob(['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'], {
 ...`
- **PSP_CALL_RE** (regex) — `/\bsdk\s*\.\s*(?:cancel|refund|payment)\s*\.\s*create\s*\(/`
- **CLAIM_RE** (regex) — `/\bclaimRefund\s*\(/`
- **EMPTY_CATCH_RE** (regex) — `/catch\s*(?:\([^)]*\))?\s*\{\s*\}/g`
- **moneyMovers** (call) — `Object.entries(edgeSources)
  .map(([path, src]) => ({ path, src, code: stri...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `__tests__/conformance/payment-money-move.test.ts`::stripComments
- **params**: `code: string`
- **ic_degiskenler**:
  - (yok — fonksiyon gövdesinde yalnızca parametre üzerinde zincirleme `.replace()` çağrısı var)
- **Dönüş**: `string` — kodun yorum bloklarını (`/* … */`) tek satırlık boşluklara, tek satır yorumları (`//`) ise parantez/grup koruyarak siren

---

### [N2_NASIL] AST Pointer: `__tests__/conformance/payment-money-move.test.ts`::(anonymous) — `it('dedektör çalışıyor…')`
- **params**: (yok)
- **ic_degiskenler**:
  - (yok — doğrudan `moneyMovers` üzerinde `.map()` zincirini `expect` içine besler)
- **Erişilen dış kapsam**: `moneyMovers` (sayılmış edge-function listesi)
- **Dönüş**: yok (vitest `it` callback; yalnızca `expect` ile yan etki üretir)

---

### [N3_NASIL] AST Pointer: `__tests__/conformance/payment-money-move.test.ts`::(anonymous) — `it('kural A…')`
- **params**: (yok)
- **ic_degiskenler**:
  - `ihlaller` — `moneyMovers` dizisinden `CLAIM_RE` ile eşleşmeyen (talep defterine yazmayan) fonksiyonların `.path` değerlerinden oluşan dizi
- **Erişilen dış kapsam**: `moneyMovers`, `CLAIM_RE`
- **Dönüş**: yok (vitest `it` callback)

---

### [N4_NASIL] AST Pointer: `__tests__/conformance/payment-money-move.test.ts`::(anonymous) — `it('kural D…')`
- **params**: (yok)
- **ic_degiskenler**:
  - `ihlaller: string[]` — boş `catch {}` bulunan konumların `"path:satırNo"` biçimindeki listesi
  - `f` — `moneyMovers` döngüsü her adımındaki tekil edge-function nesnesi (`f.code`, `f.path` alanlarına erişilir)
  - `m` — `f.code.matchAll(EMPTY_CATCH_RE)` Iterator'ünden dönen her regex eşleşme nesnesi (`m.index` satır-ofseti hesaplamak için kullanılır)
  - `satir` — `m.index`OfDay-ofsetinden split ile türetilen 1-tabanlı satır numarası
- **Erişilen dış kapsam**: `moneyMovers`, `EMPTY_CATCH_RE`
- **Dönüş**: yok (vitest `it` callback)

---

### [N5_NASIL] AST Pointer: `__tests__/conformance/payment-money-move.test.ts`::(anonymous) — `it('para taşıyan fonksiyon stoğu…')`
- **params**: (yok)
- **ic_degiskenler**:
  - `ihlaller: string[]` — stok ihlali tespit edilen fonksiyon yollarının `"path → neden"` biçimindeki listesi
  - `f` — `moneyMovers` döngüsü her adımındaki edge-function nesnesi (`f.code`, `f.path` alanlarına erişilir)
- **Erişilen dış kapsam**: `moneyMovers`
- **Dönüş**: yok (vitest `it` callback)

---

### [N6_NASIL] AST Pointer: `__tests__/conformance/payment-money-move.test.ts`::(anonymous) — `it('refund-order-mock prod yolundan…')`
- **params**: (yok)
- **ic_degiskenler**:
  - `path` — test edilen dosyanın sabit yolu: `'/supabase/functions/refund-order-mock/index.ts'`
  - `src` — `edgeSources[path]` erişimiyle elde edilen ham kaynak kod dizgesi
  - `code` — `stripComments(src)` çağrısından dönen, yorumları sıyrılmış kod
  - `yazmaIzleri` — `{ ad: string, re: RegExp }` nesnelerinden oluşan dizi; `.filter()` ile `code` içinde gerçekten bulunan yazma izleri tutulur
  - `k` — `.filter()` callback parametresi; her `yazmaIzleri` elemanı (`k.re.test(code)` çağrısı)
- **Erişilen dış kapsam**: `edgeSources`, `stripComments`
- **Dönüş**: yok (vitest `it` callback)

---

### [N7_NASIL] AST Pointer: `__tests__/conformance/payment-money-move.test.ts`::(anonymous) — `it('kendi kendini doğrular…')`
- **params**: (yok)
- **ic_degiskenler**:
  - `pspOrnek` — `PSP_CALL_RE` regex'ini pozitif yönde doğrulamak için oluşturulmuş sabit test dizgesi: `'sdk.cancel.create({}, cb)'`
  - `ornek` — `for…of` döngüsü her adımındaki boş-catch thửngisi (`'try{}catch{}'`, `'try{}catch(e){}'`, `'try{}catch (err) {  }'`)
- **Erişilen dış kapsam**: `PSP_CALL_RE`, `CLAIM_RE`, `EMPTY_CATCH_RE`, `stripComments`
- **Dönüş**: yok (vitest `it` callback)

---

## NODE ID STANDARD

  file: src\__tests__\conformance\payment-money-move.test.ts
  function: src\__tests__\conformance\payment-money-move.test.ts::stripComments

---

## DISA AKTARILANLAR (EXPORTS)
  export: stripComments