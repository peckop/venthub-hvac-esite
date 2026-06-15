---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\__tests__\type-converters.test.ts
skeleton_hash: a1f2221243906748
generated_at: 2026-06-15T11:43:07.939024+00:00
---

## Genel Bakış

Bu modül dışa açılan fonksiyon/sınıf/sabit/tip içermez; saf yan-etki (başlatma/konfigürasyon) veya yeniden-dışa-aktarım amaçlıdır. Davranışı, içindeki üst-seviye çağrıların (import/init) etkisinden ibarettir.

## AXIOMS – Mimari Varsayımlar
- [Aksiyom 1]: Bu modül yan-etki için yüklenir; kaldırılması veya yan-etkisinin değişmesi onu import eden giriş noktalarını etkiler.
- [Aksiyom 2]: Dışa açılan API olmadığından tüketiciler doğrudan çağrıyla değil, yalnızca yükleme sırası/yan-etkisi üzerinden bağımlıdır.

## AST POINTERS
(Dışa açılan çağrılabilir öğe yok — modül-düzeyi yan-etki; AST işaretçisi gerektiren fonksiyon/metot yok.)

## NODE ID STANDARD
file: C:\Users\alize\venthub-hvac\src\lib\__tests__\type-converters.test.ts
