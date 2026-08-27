---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useCalculatorUsage.ts
skeleton_hash: 70b0ce5c0e9c12e7
entity_hashes:
  func:girdiOzeti: ce3cd2e72a8b3e67
  func:useCalculatorUsage: f157c6548bb3e8d5
  overview: 456b32078d3a87d0
generated_at: 2026-08-27T08:34:19Z
---

## Genel Bakış
Bu modül, hesaplayıcı kullanımını izleyen bir React hook'u ve bu izleme sürecinde kullanılan bir yardımcı fonksiyon içerir. Hook, hesaplayıcı girdilerini belirtilen bir gecikme süresiyle işlerken, yardımcı fonksiyon girdi verilerini insan tarafından okunabilir bir metin özetine dönüştürür.

## Fonksiyon Grupları
### Ana Hook
Hesaplayıcı kullanımını izlemek ve girdileri belirli bir gecikmeyle işlemek için kullanılan ana React hook'u.
- useCalculatorUsage

### Yardımcı Fonksiyonlar
Hesaplayıcı girdilerini okunabilir bir metin özeti haline getiren yardımcı fonksiyon.
- girdiOzeti

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri sağlanmadığından (yalnızca imzalar mevcut), fonksiyon gövdesinden aksiyom üretilememektedir. Mimari varsayımlar yalnızca fonksiyon gövdelerinden türetilir.

---

## FONKSİYON DETAYLARI

### girdiOzeti
**Ne yapar**: Hesaplayıcı girdilerini sabit bir sıraya göre düzenleyerek, kişisel tanımlayıcı bilgi (PII) taşımayan, kısa ve tek satırlık bir metin özeti oluşturur. Bu özet, girdilerin izlenmesi ve karşılaştırılması için kullanılır.

**Nasıl yapar**: Girdi nesnesinin tüm anahtarlarını (`Object.keys`) alfabetik olarak sıralar (`sort`). Her anahtar için `anahtar=değer` formatında bir dize oluşturur; değer tanımsız (`undefined`) veya `null` ise boş string kullanır (`?? ''`). Son olarak tüm bu parçaları noktalı virgül (`;`) ile birleştirerek tek bir string döndürür. Alfabetik sıralama sayesinde aynı girdiler farklı sıralamalarda verilse bile aynı özeti üretir.

**Parametreler**:
- `girdiler`: `HesaplayiciGirdileri` — Özetlenecek hesaplayıcı girdilerini içeren nesne. Anahtar-değer çiftlerinden oluşur.

**Dönüş**: `string` — Girdi anahtarlarının alfabetik sırayla `anahtar=değer` formatında noktalı virgülle ayrılmış tek satırlık temsili.

### useCalculatorUsage
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../utils/analytics::trackEvent
- import: react::useEffect
- import: react::useRef

---

## TYPE ALIASES

### HesaplayiciGirdileri
```typescript
type HesaplayiciGirdileri = Record<string, string | number | boolean | null | undefined>
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCalculatorUsage.ts::girdiOzeti
- **params**: `girdiler: HesaplayiciGirdileri`
- **ic_degiskenler**:
  - `k` — `Object.keys(girdiler)` ile elde edilen anahtar dizisi üzerinde `.sort()` ve `.map()` ile iterasyon yapılan her bir anahtar
- **Dönüş**: `string` — anahtar-değer çiftlerini `;` ile birleştiren string (`k=girdiler[k] ?? ''` formatında)

### [N2_NASIL] AST Pointer: src/hooks/useCalculatorUsage.ts::useCalculatorUsage
- **params**: `calculator: string`, `girdiler: HesaplayiciGirdileri`, `gecikmeMs: number = VARSAYILAN_GECIKME_MS`
- **ic_degiskenler**:
  - `ozet` — `girdiOzeti(girdiler)` çağrısının dönüş değeri; girdilerin sıralanmış anahtar-değer özetini tutar
  - `tabanRef` — `useRef<string | null>(null)` ile oluşturulan referans; ilk render'da `ozet` değeri atanır, başlangıç durumunu temsil eder
  - `atesRef` — `useRef(false)` ile oluşturulan boolean referans; olayın ateşlenip ateşlenmediğini takip eder
  - `zamanlayici` — `setTimeout` ile oluşturulan zamanlayıcı; `gecikmeMs` milisaniye sonra `trackEvent` çağrısını tetikler
  - `useEffect` cleanup fonksiyonu — `clearTimeout(zamanlayici)` çağırarak zamanlayıcıyı temizler
- **Dönüş**: `void` — yan etki olarak `trackEvent('calculator_used', { calculator, inputs_summary: ozet })` çağrısı yapar; `ozet !== tabanRef.current` ve `atesRef.current === false` koşulları sağlandığında `gecikmeMs` gecikmeyle ateşlenir

---

## NODE ID STANDARD

  file: src\hooks\useCalculatorUsage.ts
  function: src\hooks\useCalculatorUsage.ts::girdiOzeti
  function: src\hooks\useCalculatorUsage.ts::useCalculatorUsage

---

## DISA AKTARILANLAR (EXPORTS)
  export: HesaplayiciGirdileri
  export: girdiOzeti
  export: useCalculatorUsage