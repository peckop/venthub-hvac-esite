---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-iyzico-reconcile\index.ts
skeleton_hash: a45e063ea3065638
generated_at: 2026-05-24T10:44:24Z
---

## Genel Bakış
Bu modül, Supabase Edge Functions altyapısı üzerinde çalışan, yalnızca yetkilendirilmiş yöneticilerin Iyzico ödeme sistemi ile iç sistem kayıtları arasındaki veri tutarlılığını denetlemek için kullandığı bir API uç noktasıdır. Gelen HTTP isteğini alarak önce güvenlik katmanından (CORS yönetimi, kullanıcı doğrulama ve yetkilendirme) geçirir, ardından belirlenen uzlaştırma (reconcile) mantığını yürütür ve işlem sonucunu istemciye döndürür.

## Fonksiyon Grupları
### Güvenlik ve Reconciliasyon Orkestrasyonu
Bu grup, gelen admin API çağrılarının güvenli bir şekilde işlenmesini sağlar. Kimlik doğrulama, yetkilendirme, CORS başlıklarının yönetimi ve Iyzico ile sistem arasındaki veri uzlaştırma işlemlerini koordine eder.
- admin-iyzico-reconcile_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### admin-iyzico-reconcile_handler
**Ne yapar**: VentHub HVAC projesinde Supabase altyapısında çalışan, sadece yetkili admin kullanıcıların erişebildiği Iyzico ödeme sistemi mutabakat işlemini yöneten ana giriş noktasıdır. Iyzico üzerinden gerçekleşen tüm ödeme işlemleri ile sistemde kayıtlı yerel ödeme verilerini karşılaştırarak ödeme mutabakatı sağlama iş akışını başlatır ve sonuçlarını kullanıcıya iletir.
**Nasıl yapar**: Öncelikle gelen HTTP talebini işleyerek talep sahibinin admin yetkisine sahip olup olmadığını doğrular. Yetki kontrolü başarılı olduğunda Iyzico ödeme servisinin API'lerini kullanarak mutabakat için gerekli tüm işlem kayıtlarını çeker, ardından bu kayıtları sistemdeki yerel veritabanında kayıtlı ödeme verileriyle eşleştirir. Eşleşme ve doğrulama süreçleri sonrası oluşan mutabakat raporunu standart HTTP yanıt formatında döndürür, yetkisiz erişim denemelerinde ise erişim engeli yanıtı üretir.
**Parametreler**:
- name: req — type: Request — Gelen HTTP isteği nesnesi, isteğin kimlik doğrulama başlıklarını, istek gövdesinde iletilen özel filtreleme parametrelerini ve talep sahibi kullanıcının sistemdeki kimlik bilgilerini içerir.
**Dönüş**: Response — İşlem sonucu oluşan standart HTTP yanıt nesnesi. Mutabakat işlemi başarılı olursa işlemin özeti, eşleşen ve eşleşmeyen kayıt sayıları gibi detayları içeren JSON yükünü; hata oluşması halinde hata kodu ve açıklamasını içeren yanıtı döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-iyzico-reconcile\index.ts::admin-iyzico-reconcile_handler
- **params**: (req)
- **ic_degiskenler**:
  - `cors` — CORS header set returned in every `Response`.
  - `supabaseUrl` — Supabase project URL read from environment variable `SUPABASE_URL`.
  - `serviceRoleKey` — Supabase service‑role key read from environment variable `SUPABASE_SERVICE_ROLE_KEY`.
  - `anonKey` — Supabase anon key read from environment variable `SUPABASE_ANON_KEY`.
  - `authHeader` — Value of the `Authorization` header from the incoming request.
  - `authClient` — Supabase client created with `supabaseUrl`, `anonKey`, and the request’s `Authorization` header.
  - `user` — Authenticated user object returned by `authClient.auth.getUser()`.
  - `authErr` — Error object returned by `authClient.auth.getUser()` if authentication fails.
  - `roleCheck` — `Response` from the fetch call that verifies the user’s role.
  - `arr` — Parsed JSON array from `roleCheck` containing role information.
  - `role` — Role string extracted from `arr[0]?.role`.
  - `body` — Parsed JSON body of the request when `req.method === 'POST'`.
  - `_id` — Order identifier extracted from request body or query string; `null` if absent.
  - `conv` — Conversation identifier extracted from request body or query string; `null` if absent.
  - `url` — `URL` instance built from `req.url` when the method is not `POST`.
  - `_limit` — Fixed pagination limit (`10`) used for the RPC call.
  - `rpcListUrl` — Full URL string for the Supabase RPC endpoint `fn_admin_get_orders`.
  - `listBody` — Payload object sent to the RPC endpoint; contains `p_id`, `p_conv`, `p_limit`, and conditional `p_status`.
  - `listResp` — `Response` from the RPC fetch request.
  - `text` — Textual body of a failed RPC response (fallback to empty string).
  - `orders` — Array of order records returned by the RPC call.
  - `su` — Temporary variable holding `supabaseUrl!` inside the IIFE that builds `fnHost`.
  - `host` — `URL` object created from `su` inside the IIFE.
  - `ref` — Subdomain part of `host.host` used to construct the function host URL.
  - `fnHost` — Base URL of the Supabase Edge Function host derived from the project URL.
  - `results` — Accumulator array that stores processing outcome for each order.
  - `o` — Individual order object iterated from `orders`.
  - `token` — Payment token extracted from the current order; `null` if missing.
  - `cbUrl` — Callback endpoint URL constructed from `fnHost`.
  - `cbResp` — `Response` from the callback POST request.
  - `cbJson` — Parsed JSON body of the callback response.
  - `st` — Status string obtained from `cbJson?.status`; defaults to `'pending'`.
  - `e` — Caught error object in both outer and inner `try‑catch` blocks.
  - `msg` — Human‑readable error message derived from `e`.
- **Dönüş**: `Response` object containing a JSON payload and appropriate HTTP status; the function performs external fetches, role verification, RPC calls, and callback invocations before returning the final response.

---

## NODE ID STANDARD

  file: supabase\functions\admin-iyzico-reconcile\index.ts
  function: supabase\functions\admin-iyzico-reconcile\index.ts::admin-iyzico-reconcile_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-iyzico-reconcile_handler