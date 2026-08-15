---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\src\lib\__tests__\errorReporter.test.ts
skeleton_hash: 4709e1cb68b3de22
entity_hashes:
  func:loadReporter: 3292ee1e5919964b
  func:parseBody: 6fb707b5fb1cb509
  overview: 790af11e0a6b5928
generated_at: 2026-08-15T06:34:24Z
---

## Genel Bakış
Bu modül, errorReporter modülünün unit testleri için yardımcı fonksiyonlar içeren bir test dosyasıdır. Dinamik yükleme ve mock veri hazırlama yetenekleri sunarak test senaryolarının yürütülmesini kolaylaştırır.

## Fonksiyon Grupları
### Test Altyapısı
Test sürecinin hazırlanması ve test verilerinin işlenmesinden sorumludur.
- loadReporter: errorReporter modülünü dinamik olarak import ederek her test senaryosunda temiz bir modül yüklemesi sağlar
- parseBody: Mock fonksiyon çağrılarını analiz ederek gövde verisini okunabilir nesne formatına dönüştürür

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri verilmediğinden, fonksiyon iç mantığına dayalı mimari aksiyom türetilmemiştir. Ancak fonksiyon imzaları ve sabit yapısından aşağıdaki yapısal varsayımlar çıkarılabilir:

[Aksiyom 1]: Eğer `parseBody`'ye `call` argümanı olarak `unknown[]` tipinde geçerli bir array verilmezse, `Record<string, unknown>` dönüş değerinin tanımsız olması beklenir.

[Aksiyom 2]: Eğer `ENDPOINT` template sabiti, `loadReporter` içinde gerçek endpoint URL'sine dönüştürülmek üzere kullanılmazsa, istek hedefi bilinmiyor olur.

[Aksiyom 3]: Eğer `loadReporter` fonksiyonu async olarak çağrılmazsa veya promise'i beklenmezse, raporlayıcı yüklenme süreci tamamlanmaz.

[Aksiyom 4]: Eğer `parseBody`'ye空 `call` array'i (`[]`) verilirse, hangi alanların doldurulacağına dair varsayım bilinmiyor — fonksiyon gövdesi mevcut değildir.

> **Not:** Bu modül için `domain: general, source_type: doc` olarak belirlenmiş olup, kaynak dosya bir **test dosyasıdır** (`errorReporter.test.ts`). Test dosyaları gerçek modül mantığını değil, beklenen davranışı tanımladığı için buradaki varsayımlar yalnızca **yapısal/imzadan türetilen** niteliktedir. Gerçek aksiyomlar, kaynak modülün gövdesinden üretilmelidir.

---

## FONKSİYON DETAYLARI

### loadReporter

**Ne yapar**: Test ortamında her test çalıştırıldığında errorReporter modülünü yeniden import ederek modül düzeyindeki de-duplication (tekrar engelleme) durumunu sıfırlayan asenkron bir test yardımcı fonksiyonudur. Bu sayede bir önceki testten kalan singleton benzeri durumların bir sonraki testi etkilemesi önlenir.

**Nasıl yapar**: Önce `vi.resetModules()` çağrısıyla Vitest'in modül önbelleğini tamamen temizler. Ardından dinamik bir `await import` ile `../errorReporter` modülünü sıfırdan yükler. Bu dinamik import, modülün kendi内部singleton state'ini (de-duplication set'i gibi) sıfırlanmış olarak getirir. Son olarak modülün `reportError` fonksiyonunu çağrılabilir şekilde döndürür.

**Parametreler**:

- Fonksiyonun herhangi bir parametresi yoktur.

**Dönüş**: `Promise<mod.reportError>` — Modülün `reportError` fonksiyonunu içeren bir Promise döner. Bu fonksiyon çağrıldığında hata raporlama işlemini gerçekleştiren asenkron bir fonksiyondur.

### parseBody
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: vitest::afterEach
- import: vitest::beforeEach
- import: vitest::describe
- import: vitest::expect
- import: vitest::it
- import: vitest::vi

---

## SABİTLER
- **ENDPOINT** (template) — ``${SUPABASE_URL}/functions/v1/log-client-error``

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::loadReporter
- **params**: (yok)
- **ic_degiskenler**:
  - `mod` — dinamik import ile yüklenen `../errorReporter` modülü, `reportError` fonksiyonunu barındırır
- **Dönüş**: `mod.reportError` — errorReporter modülünden dışa açılan hata raporlama fonksiyonu (yan etki: `vi.resetModules()` ile modül cache'ini sıfırlar)

---

### [N2_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::parseBody
- **params**: `call: unknown[]` — fetch mock'unun yakaladığı çağrı argümanları dizisi; `call[0]` URL, `call[1]` RequestInit
- **ic_degiskenler**:
  - `init` — `call[1]` erişimi ile elde edilen `RequestInit` nesnesi; `body` özelliği JSON string olarak barındırır
- **Dönüş**: `Record<string, unknown>` — `init.body` stringinin `JSON.parse` ile çözümlenmiş hali (log-client-error endpoint'ine gönderilen request body'si)

---

## NODE ID STANDARD

  file: src\lib\__tests__\errorReporter.test.ts
  function: src\lib\__tests__\errorReporter.test.ts::loadReporter
  function: src\lib\__tests__\errorReporter.test.ts::parseBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadReporter
  export: parseBody