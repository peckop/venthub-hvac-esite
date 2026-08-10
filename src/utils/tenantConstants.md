---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\tenantConstants.ts
skeleton_hash: 3cbd7024528e2833
generated_at: 2026-06-19T20:48:17.194932+00:00
---

## Genel Bakış

Client-safe tenant sabitleri — `next/headers` İÇERMEZ, client bundle'a güvenle girer. (tenantServer.ts server-only'dir; client 3D katmanı DEFAULT_TENANT_ID'yi BURADAN alır.) SSOT: tenantServer.ts bu değeri re-export eder, böylece tek tanım kalır.

## AXIOMS – Mimari Varsayımlar
- [Aksiyom 1]: Bu modül yan-etki için yüklenir; kaldırılması veya yan-etkisinin değişmesi onu import eden giriş noktalarını etkiler.
- [Aksiyom 2]: Dışa açılan API olmadığından tüketiciler doğrudan çağrıyla değil, yalnızca yükleme sırası/yan-etkisi üzerinden bağımlıdır.

## AST POINTERS
(Dışa açılan çağrılabilir öğe yok — modül-düzeyi yan-etki; AST işaretçisi gerektiren fonksiyon/metot yok.)

## NODE ID STANDARD
file: C:\Users\alize\venthub-hvac\src\utils\tenantConstants.ts
