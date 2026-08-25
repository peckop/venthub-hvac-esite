---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\e2e\reflow.e2e.ts
skeleton_hash: 2c2f1ecf70723aa8
entity_hashes:
  func:olc: 9ec713a7dca7913f
  overview: 83ca75367cad8bd1
generated_at: 2026-08-25T08:46:15Z
---

## Genel Bakış
Bu modül, uçtan uca (e2e) test kapsamında kullanılan bir ölçüm yardımcısıdır. Bir Playwright sayfası üzerinde belirli bir sentinel kimliğine karşılık gelen ölçüm verisini okuyarak döndürür. Modül, akış (reflow) testlerinin doğrulama adımlarında tekil ölçüm sorgularını soyutlamak amacıyla tanımlanmıştır.

## Fonksiyon Grupları
### Ölçüm Sorgulama
Belirtilen sentinel kimliğine ait ölçüm verisini, verilen tarayıcı sayfası üzerinden okur ve yapılandırılmış bir ölçüm nesnesi olarak döndürür. Bu fonksiyon, e2e test senaryolarında akış doğrulama adımlarının temel veri kaynağıdır.
- olc

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, fonksiyon gövdesinden türetilebilecek aksiyom tanımlanamamıştır.

İmzadan çıkarılabilecek bilgiler (aksiyom niteliğinde değildir):

- `olc` fonksiyonu bir `Page` nesnesi ve bir `sentinelId` parametresi alır, `Olcum` türünde bir değer döndürür.
- Fonksiyon asenkron (`async`) olarak tanımlıdır.
- `WIDTHS` sabiti bir ifade (`as_expression`) olarak belirtilmiş olup değeri verilen kaynakta yer almamaktadır.

---

## FONKSİYON DETAYLARI

### olc
**Ne yapar**: Sayfadaki yatay taşma (overflow) durumunu ölçer. Geçici olarak 5000px genişliğinde bir div ekleyerek provoke edilen taşma değerini ve normal taşma değerini karşılaştırır; ayrıca `html` ve `body` elementlerinin `overflow-x` stil değerlerini yakalar. Tüm ölçüm tek bir `evaluate` turunda yapılır.

**Nasıl yapar**: Fonksiyon, Playwright'ın `page.evaluate` metodunu kullanarak tüm işlemi tarayıcı tarafında tek bir JavaScript çalıştırma döngüsünde gerçekleştirir. İlk olarak `requestAnimationFrame` ile bir çerçeve beklenerek medya dalının/React yeniden-render'ının oturması sağlanır. Ardından `document.scrollingElement` (yoksa `document.documentElement`) referans alınarak mevcut `scrollWidth` ile `window.innerWidth` arasındaki fark hesaplanır. Sonra `sentinelId` id'li, `position:static; width:5000px; height:1px` stillerine sahip geçici bir div oluşturulup `document.body`'ye eklenir; bu eleman varken provoke edilen taşma ölçülür ve eleman hemen kaldırılır. Eleman kaldırıldıktan sonra normal taşma tekrar ölçülür. Docstring'te belirtilen sebep: her Playwright aksiyonu bir trace anlık-görüntüsü üretir ve 5000px'lik enstrüman elemanı sayfadayken bu anlık-görüntü ağır rotada (`/tr/products`) test başına 60sn sınırını aşıyordu — taşma yokken bile KIRMIZI. Bu nedenle tüm ölçüm tek bir `evaluate` turunda yapılır.

**Parametreler**:
- `page`: `Page` — Playwright Page nesnesi; tarayıcı sayfasıyla etkileşim için kullanılır.
- `sentinelId`: `string` — Oluşturulan geçici 5000px genişliğindeki div elementinin `id` attribute değeri olarak atanır.

**Dönüş**: `Promise<Olcum>` — Tarayıcı tarafında hesaplanan ölçüm sonuçlarını içeren bir nesneyi çözümleyen Promise. Dönen nesne şu alanları içerir:
- `provoked`: `number` — 5000px genişliğindeki geçici div eklenmişken ölçülen taşma değeri (`scrollWidth - window.innerWidth`).
- `overflow`: `number` — Geçici div kaldırıldıktan sonra ölçülen normal taşma değeri (`scrollWidth - window.innerWidth`).
- `htmlOverflowX`: `string` — `document.documentElement` elementinin hesaplanmış `overflow-x` stil değeri.
- `bodyOverflowX`: `string` — `document.body` elementinin hesaplanmış `overflow-x` stil değeri.

---

## İTHALATLAR (IMPORTS)
- import: @playwright/test::expect
- import: @playwright/test::test
- import: @playwright/test::type Page

---

## TYPE ALIASES

### Olcum
```typescript
type Olcum = {
  provoked: number
  overflow: number
  htmlOverflowX: string
  bodyOverflowX: string
}
```

---

## SABİTLER
- **WIDTHS** (as_expression) — `[320, 768, 1024, 1280] as const`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: e2e/reflow.e2e.ts::olc
- **params**: `page: Page` — Playwright Page nesnesi, tarayıcı oturumunu temsil eder; `sentinelId: string` — tarayıcı içi `evaluate`'a ikinci argüman olarak geçirilen, kasıtlı taşma ölçümünde kullanılacak element ID'si
- **ic_degiskenler**:
  - `id` — `page.evaluate`'ın ikinci argümanı olarak tarayıcıya aktarılan `sentinelId` değerinin tarayıcı-içi karşılığı; oluşturulan geçici div elementine `el.id` olarak atanır
  - `doc` — fonksiyon: `document.scrollingElement ?? document.documentElement` döndürür; kaydırma genişliğini ölçmek için referans alınan kök elementi belirler
  - `measure` — fonksiyon: `doc().scrollWidth - window.innerWidth` hesaplayarak belgenin yatay taşma miktarını piksel olarak döndürür
  - `el` — `document.createElement('div')` ile oluşturulan geçici div elementi; `position:static;width:5000px;height:1px` stil atanır, kasıtlı taşma provoke etmek için `document.body`'ye eklenir
  - `provoked` — geçici element eklendikten sonra `measure()` çağrılarak elde edilen taşma değeri; kasıtlı 5000px genişlikteki elementin gerçekten taşma yapıp yapmadığını kanıtlar
  - `overflow` — `el.remove()` çağrıldıktan sonra `measure()` ile ölçülen gerçek belge taşma miktarı; SC 1.4.10 uyumluluğu için kontrol edilen değer
  - `htmlOverflowX` — `getComputedStyle(document.documentElement).overflowX` sonucu; `<html>` elementinin `overflow-x` computed değeri, `hidden` veya `clip` ise taşmanın gizlendiğini gösterir
  - `bodyOverflowX` — `getComputedStyle(document.body).overflowX` sonucu; `<body>` elementinin `overflow-x` computed değeri, `hidden` veya `clip` ise taşmanın gizlendiğini gösterir
- **Dönüş**: `Promise<Olcum>` — `{ provoked: number, overflow: number, htmlOverflowX: string, bodyOverflowX: string }` yapısında obje

### [N2_NASIL] AST Pointer: e2e/reflow.e2e.ts::anonim_test_callback
- **params**: `{ page }` — destructured Playwright Page nesnesi; `testInfo` — Playwright TestInfo nesnesi, proje yapılandırmasına ve test bağlamına erişim sağlar
- **ic_degiskenler**:
  - `mobil` — `testInfo.project.use.isMobile === true` sonucu boolean; testin mobil projede mi çalıştığını belirler, genişlik dizisini `[null]` ile sınırlandırır
  - `genislikler` — `mobil ? [null] : WIDTHS` sonucu `ReadonlyArray<number | null>`; mobilde viewport boyutu değiştirilmez (`null`), masaüstünde `WIDTHS` sabitindeki tüm genişlikler denenir
  - `lang` — `page.locator('html').getAttribute('lang')` ile elde edilen `<html>` elementinin `lang` attribute değeri; uygulama sayfası olup olmadığını doğrulamak için kontrol edilir
  - `genislik` — `for (const genislik of genislikler)` döngüsü değişkeni; her iterasyonda test edilecek viewport genişliği (`null` veya sayısal değer)
  - `width` — `genislik ?? (page.viewportSize()?.width ?? 0)` hesaplanan değer; `genislik` `null` ise mevcut viewport genişliğini kullanır, hata mesajlarında hangi pikselde test edildiğini göstermek için kullanılır
  - `m` — `olc(page, SENTINEL_ID)` çağrısının dönüşü olan `Olcum` objesi; `provoked`, `overflow`, `htmlOverflowX`, `bodyOverflowX` alanlarını içerir
  - `el` — `for (const [el, v] of [['html', m.htmlOverflowX], ['body', m.bodyOverflowX]])` döngüsünde `'html'` veya `'body'` string değerini alır; hata mesajında hangi elementin overflow-x kuralını ihlal ettiğini belirtmek için kullanılır
  - `v` — aynı döngüde `m.htmlOverflowX` veya `m.bodyOverflowX` string değerini alır; `['hidden', 'clip'].includes(v)` ile kırpma yasağı kontrol edilir
- **Dönüş**: yok — test fonksiyonu, `expect` assertion'larıyla yan etki yapar; başarısız olursa testi düşürür
- **dış_erisimler**: `route` — dış `for` döngüsünden gelen mevcut rota string'i; `SENTINEL_ID` — kasıtlı taşma elementi için kullanılan sabit ID; `TOLERANCE` — yatay taşma için izin verilen piksel üst sınırı sabiti; `WIDTHS` — masaüstü testlerinde kullanılan genişlik dizisi sabiti; `ROUTES` — dış `for` döngüsünde iterate edilen rota listesi sabiti

---

## NODE ID STANDARD

  file: e2e\reflow.e2e.ts
  function: e2e\reflow.e2e.ts::olc

---

## DISA AKTARILANLAR (EXPORTS)
  export: olc