---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\isomorphic-dompurify.d.ts
skeleton_hash: 792edb619e798d97
generated_at: 2026-06-19T20:48:17.036519+00:00
---

## Genel Bakış

Bu modül dışa açılan fonksiyon/sınıf/sabit/tip içermez; saf yan-etki (başlatma/konfigürasyon) veya yeniden-dışa-aktarım amaçlıdır. Davranışı, içindeki üst-seviye çağrıların (import/init) etkisinden ibarettir.

## AXIOMS – Mimari Varsayımlar
- [Aksiyom 1]: Bu modül yan-etki için yüklenir; kaldırılması veya yan-etkisinin değişmesi onu import eden giriş noktalarını etkiler.
- [Aksiyom 2]: Dışa açılan API olmadığından tüketiciler doğrudan çağrıyla değil, yalnızca yükleme sırası/yan-etkisi üzerinden bağımlıdır.

## AST POINTERS
(Dışa açılan çağrılabilir öğe yok — modül-düzeyi yan-etki; AST işaretçisi gerektiren fonksiyon/metot yok.)

## NODE ID STANDARD
file: C:\Users\alize\venthub-hvac\src\types\isomorphic-dompurify.d.ts
