---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\order-housekeeping\index.ts
skeleton_hash: ef1bd632b4cee85c
generated_at: 2026-05-24T07:43:27Z
---

## Genel Bakış
Bu modül, Supabase fonksiyonu olarak sipariş temizlik işlemlerini yöneten tek bir giriş noktası sağlar. İstekleri alır, gerekli işlemleri yürütür ve uygun bir yanıt döndürür.

## Fonksiyon Grupları
### Sipariş Temizlik İşleyici
Modülün temel sorumluluğu, gelen HTTP isteklerini işleyip sipariş temliğiyle ilgili gerekli işlemleri gerçekleştirmektir.
- order-housekeeping_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### order-housekeeping_handler
**Ne yapar**: Order housekeeping ile ilgili gelen istekleri işler ve uygun bir `Response` nesnesi döndürür.  
**Nasıl yapar**: Fonksiyon, `req` parametresi olarak alınan HTTP isteğini okur, içindeki veriyi değerlendirerek order housekeeping işlemlerini gerçekleştirir ve işlem sonucunu bir `Response` objesi olarak geri döndürür.  
**Parametreler**:
- req: Request — İşlenecek HTTP isteği; housekeeping işlemi için gerekli veriyi (örneğin kimlik, komut veya veri yükü) içerir.  
**Dönüş**: Response — Order housekeeping işleminin sonucunu taşıyan HTTP yanıtı; durum kodu, başlıklar ve gövde gibi bilgileri içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/order-housekeeping/index.ts::order-housekeeping_handler
- **params**: req
- **ic_degiskenler**:
  - `cors` — CORS header nesnesi, tüm originlere izin ver ve belirli başlıklar/metodlar için önceden tanımlanmış değerler
  - `supabaseUrl` — Supabase proje URL’si, Deno ortam değişkenlerinden okunur (boş string varsayılan)
  - `serviceRoleKey` — Supabase service_role anahtarı, admin işlemleri için kullanılır
  - `anonKey` — Supabase anonim anahtarı, istemci tarafı çağrılarında kullanılır
  - `authHeader` — İstekteki Authorization başlığının değeri (Bearer token)
  - `authClient` — Supabase istemcisi, anonKey ve authHeader ile kullanıcı bilgilerini almak için oluşturulur
  - `user` — authClient.auth.getUser() çağrısından dönen Supabase kullanıcı nesnesi
  - `authErr` — Kullanıcı bilgisi alınırken oluşan hata nesnesi
  - `roleCheck` — Kullanıcının rolünü kontrol etmek için user_profiles tablosuna yapılan HTTP isteğinin Response nesnesi
  - `arr` — roleCheck yanıtının JSON olarak ayrıştırılmış hali (boş dizi varsayılan)
  - `role` — Kullanıcının rolü (admin/superadmin gibi), arr[0]?.role dan elde edilir
  - `now` — Şu anki Unix milisaniye zaman damgası (Date.now())
  - `th30` — 30 dakika önceki zamanın ISO 8601 stringi, pending ve token olmayan siparişleri iptal etmek için kullanılır
  - `th15` — 15 dakika önceki zamanın ISO 8601 stringi, token olan bekleyen siparişleri listelemek için kullanılır
  - `cancelResp` — 30 dakikadan eski ve payment_token null olan siparişlerin statusunu cancelled olarak güncelleme PATCH isteğinin Response nesnesi
  - `cancelled` — cancelRespから返却された JSON 配列（キャンセルされた注文のリスト）、失敗時は空配列
  - `listResp` — payment_tokenが存在し、15分以前のpending注文を取得するGETリクエストのResponse
  - `pendWithToken` — listRespから返却された JSON 配列（トークンありの保留注文リスト）、失敗時は空配列
  - `fnHost` — supabaseUrlから導き出された関数ホスト URL（例：https://<project>.functions.supabase.co）
  - `reconciled` — iyzico 콜백에서 status が 'success' だった注文 ID の文字列配列
  - `failed` — iyzico 콜백에서 status が success でなかったり、エラーがあった注文 ID の文字列配列（ステータスを failed に更新）
  - `cb` — iyzico-callback 関数への POST リクエストの Response
  - `body` — cb の JSON 本体（status フィールドを含む可能性があるオブジェクト）、失敗時は空オブジェクト
  - `_e` — 外部 try/catch で捕捉された例外オブジェクト（またはその文字列表現）
  - `host` — fnHost を生成する IIFE 内での supabaseUrl のホスト部分（例：project.supabase.co）
  - `ref` — host の最初のラベル（サブプロジェクト名）
  - `o` — pendWithToken 配列を for...of でイテレーションする際の各注文オブジェクト（{ id: string }）
- **Dönüş**: Response

---

## NODE ID STANDARD

  file: supabase\functions\order-housekeeping\index.ts
  function: supabase\functions\order-housekeeping\index.ts::order-housekeeping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-housekeeping_handler