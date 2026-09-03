---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-rec89\src\config\features.ts
skeleton_hash: ac08aadf5df99483
generated_at: 2026-09-03T17:33:44.084077+00:00
---

## Genel Bakış

Vitrin yetenek bayrakları — derleme zamanı sabitleri. NİÇİN ENV DEĞİL SABİT (REC-94, 2026-09-04 kararı, gerekçesi yazılı): Bu bayrağı tüketen bileşenlerin HEPSİ `'use client'`. İstemciye ulaşan bir env değişkeni `NEXT_PUBLIC_` öneki İSTER; önek unutulursa değer sessizce `undefined` olur ve bayrak "k

## AXIOMS – Mimari Varsayımlar
- [Aksiyom 1]: Bu modül yan-etki için yüklenir; kaldırılması veya yan-etkisinin değişmesi onu import eden giriş noktalarını etkiler.
- [Aksiyom 2]: Dışa açılan API olmadığından tüketiciler doğrudan çağrıyla değil, yalnızca yükleme sırası/yan-etkisi üzerinden bağımlıdır.

## AST POINTERS
(Dışa açılan çağrılabilir öğe yok — modül-düzeyi yan-etki; AST işaretçisi gerektiren fonksiyon/metot yok.)

## NODE ID STANDARD
file: C:\tmp\vh-urun-rec89\src\config\features.ts
