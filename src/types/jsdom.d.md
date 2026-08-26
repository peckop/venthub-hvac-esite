---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\jsdom.d.ts
skeleton_hash: 7c650494f9aede4b
generated_at: 2026-08-25T08:46:18.007833+00:00
---

## Genel Bakış

`jsdom` için dar tip bildirimi. NİÇİN VAR: `jsdom` paketi kendi tiplerini getirmiyor ve `@types/jsdom` bu depoda kurulu değil. Paketi bağımlılık olarak eklemek pnpm workspace kökünü ve kilit dosyasını değiştirirdi — tek bir test dosyası için orantısız. Depoda bu desenin örneği zaten var (`isomorphic

## AXIOMS – Mimari Varsayımlar
- [Aksiyom 1]: Bu modül yan-etki için yüklenir; kaldırılması veya yan-etkisinin değişmesi onu import eden giriş noktalarını etkiler.
- [Aksiyom 2]: Dışa açılan API olmadığından tüketiciler doğrudan çağrıyla değil, yalnızca yükleme sırası/yan-etkisi üzerinden bağımlıdır.

## AST POINTERS
(Dışa açılan çağrılabilir öğe yok — modül-düzeyi yan-etki; AST işaretçisi gerektiren fonksiyon/metot yok.)

## NODE ID STANDARD
file: C:\Users\alize\venthub-hvac\src\types\jsdom.d.ts
