---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\supabase\functions\shipping-status\index.ts
skeleton_hash: 555f4d6fe3ab64af
entity_hashes:
  func:shipping-status_handler: f862630b7b2b3763
  overview: eb8c635ee40800f8
generated_at: 2026-08-25T07:33:30Z
---

## Genel Bakış

Bu modül, Supabase Edge Function altyapısı üzerinde Deno runtime ile çalışan bir gönderi durumu (shipping-status) servisidir. Modül, gelen HTTP isteklerini karşılayıp yanıt döndüren tek bir handler fonksiyonundan oluşur. Modülün iç mantığı ve dış bağımlılıkları hakkında kaynakta ek bilgi bulunmamaktadır.

## Fonksiyon Grupları

### HTTP İstek İşleyici

Gelen HTTP isteklerini karşılar ve gönderi durumuyla ilgili yanıt üretir. `@serve(Deno.serve)` decorator'ı ile işaretlenerek Supabase Edge Function uç noktası olarak tanımlanmıştır.

- shipping-status_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediğinden, modülün doğru çalışması için hangi koşulların var olması gerektiği belirlenememektedir. Yalnızca fonksiyon imzası (`shipping-status_handler(req: Request) -> Response`) ve çalıştırıcı dekoratörü (`@serve(Deno.serve)`) bilinmektedir; bu bilgiler tek başına modüle özgü bir aksiyom üretmeye yeterli değildir.

---

## FONKSİYON DETAYLARI

### shipping-status_handler

**Ne yapar**: Gelen HTTP isteklerini işleyerek bir yanıt döndüren bir Supabase Edge Function işleyicisidir. Fonksiyonun docstring'i boş bırakılmıştır; bu nedenle işlevsel amacı yalnızca fonksiyon adından ("shipping-status") kısmen çıkarılabilir ancak kesin bir açıklama mevcut değildir.

**Nasıl yapar**: `@serve(Deno.serve)` dekoratörü ile tanımlanmıştır. Bu dekoratör, fonksiyonu Deno runtime'ının yerleşik HTTP sunucusuna kaydeder ve Supabase Edge Functions altyapısının bu fonksiyonu bir HTTP uç noktası olarak sunmasını sağlar. Fonksiyon gövdesi verilen kaynakta yer almadığından iç mantık bilinmemektedir.

**Parametreler**:
- req: Request — Deno'nun yerleşik `Request` nesnesi; gelen HTTP isteğinin tüm bilgilerini (metot, başlıklar, gövde, URL vb.) içerir.

**Dönüş**: Response — Deno'nun yerleşik `Response` nesnesi; istemciye gönderilecek HTTP yanıtını (durum kodu, başlıklar, gövde vb.) temsil eder.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/shipping-status/index.ts::shipping-status_handler
- **params**: `req` (Request)
- **ic_degiskenler**:
  - `cors` — `getCorsHeaders(req)` fonksiyonundan dönen CORS başlıkları; her iki yanıt durumunda da kullanılır.
  - `req.method` — gelen istek methodunu kontrol etmek için kullanılır; `'OPTIONS'` ise 200 durum koduyla yanıt döndürülür.
- **Dönüş**: Response nesnesi. OPTIONS isteği için 200 durum kodu ve boş gövde, diğer istekler için 410 durum kodu ve `error`, `message`, `ref` alanlarını içeren JSON gövde döndürülür.

---

## NODE ID STANDARD

  file: index.ts
  function: index.ts::shipping-status_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: shipping-status_handler