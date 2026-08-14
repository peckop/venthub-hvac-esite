---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\__tests__\conformance\pricing-segment-source.test.ts
skeleton_hash: 356bf5935689db71
entity_hashes:
  overview: 79c805ae104c62b6
generated_at: 2026-08-14T07:20:04Z
---

## Genel Bakış
Bu dosya, fiyatlandırma segmentlerine ait kaynakların (pricing segment source) uyumluluk (conformance) testlerini içeren bir Vitest dosyasıdır. Testler, `PRICING_SOURCES` sabitinde tanımlanan kaynak yapılarının ve `USER_EDITABLE_META_TOKEN` ile işaretli alanların önceden tanımlanmış davranışı ve veri bütünlüğünü doğrulamayı amaçlar. Modül, doğrudan API çağırmak yerine, sabit veri yapıları üzerinde beklenen sonuçları doğrulayan izole test senaryolarından oluşur.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari aksiyom üretilemez. Nedeni:

- **Fonksiyon imzası verilmemiştir.** (Tüm imza listesi boş)
- **Fonksiyon gövdesi mevcut değildir.** Yalnızca bir test dosyası (`pricing-segment-source.test.ts`) referans olarak verilmiştir.
- Verilen iki modül sabiti (`PRICING_SOURCES`, `USER_EDITABLE_META_TOKEN`) **call** olarak işaretlenmiş olup, bu sabitlerin gerçek değerleri, tipleri veya yapıları bilinmemektedir.

Aksiyomlar **sadece fonksiyon gövdesinden** üretileceği için, kod gövdesi olmadan reliable mimari varsayımlar tanımlanamaz.

> **Not:** Gerçek modül kodu (`.ts`/`.js` kaynak dosyası) sağlandığında aksiyomlar üretilebilir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **PRICING_SOURCES** (call) — `import.meta.glob(
  '/src/lib/services/pricing.service.ts',
  { query: '?ra...`
- **EDGE_RESOLVER_SOURCES** (call) — `import.meta.glob(
  '/supabase/functions/order-validate/index.ts',
  { quer...`
- **USER_EDITABLE_META_TOKEN** (call) — `['raw', 'user', 'meta', 'data'].join('_')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: __tests__/conformance/pricing-segment-source.test.ts::test_setup
- **params**: ()
- **ic_degiskenler**:
  - `source` — PRICING_SOURCES objesinin ilk elemanı (pricing service kodu); testlerde regex ile user_profiles okuma sayıları ve yasaklı token kontrolü için kullanılır
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: __tests__/conformance/pricing-segment-source.test.ts::test_source_exists
- **params**: ()
- **ic_degiskenler**:
  - (yok — outer scope'daki `source` değişkenini kullanır ama kendi içinde tanımlamaz)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: __tests__/conformance/pricing-segment-source.test.ts::test_user_profiles_read_count_upper
- **params**: ()
- **ic_degiskenler**:
  - `count` — pricing service kodunda `from('user_profiles')` kalıbıyla eşleşen sayının sayısı; user_profiles okuma sayısının üst sınırını test eder
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: __tests__/conformance/pricing-segment-source.test.ts::test_user_profiles_read_count_lower
- **params**: ()
- **ic_degiskenler**:
  - `count` — pricing service kodunda `from('user_profiles')` kalıbıyla eşleşen sayının sayısı; ratchet mekanizmasının çalıştığını doğrular
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: __tests__/conformance/pricing-segment-source.test.ts::test_no_user_editable_meta
- **params**: ()
- **ic_degiskenler**:
  - (yok — outer scope'daki `source` ve `USER_EDITABLE_META_TOKEN` değişkenlerini kullanır ama kendi içinde tanımlamaz)
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\__tests__\conformance\pricing-segment-source.test.ts