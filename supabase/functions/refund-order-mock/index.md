---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\refund-order-mock\index.ts
skeleton_hash: f6440556e54dc688
generated_at: 2026-05-24T10:46:22Z
---

## Genel Bakış
Bu modül, Supabase ortamında çalışan bir HTTP endpoint’i olarak tasarlanmıştır; amacı, bir siparişin iade sürecini taklit eden (mock) bir yanıt üretmektir. Tek bir asenkron işleyici fonksiyon (`refund-order-mock_handler`) gelen isteği alır, gerekli doğrulamaları (varsa) yapar ve önceden tanımlanmış mock veriyle bir `Response` döndürür.

## Fonksiyon Grupları
### İstek İşleme ve Mock Yanıt Üretimi
Bu grup, dışarıdan gelen HTTP isteğini alıp mock iade mantığını çalıştırarak HTTP yanıtı oluşturan tek sorumluluğu taşır.  
- refund-order-mock_handler   (tek giriş‑çıkış noktası)

---

## AXIOMS – Mimari Varsayımlar
Bu modül, tek bir parametre olan `req` ile çalışan bir handler fonksiyonunu içerir.

[Aksiyom 1]: Eğer `req` argümanı sağlanmazsa, fonksiyon çalıştırılırken bir hata (örneğin TypeError) oluşur.  
[Aksiyom 2]: Eğer `req` bir nesne değilse, fonksiyonun davranışı belirsizdir (tanımsız).  
[Aksiyom 3]: Eğer `req` içinde fonksiyonun işleme yapması için beklenen veri yapısı eksikse, fonksiyonun sonucu veya hata durumu belirsizdir.

---

---

## FONKSIYON DETAYLARI

### refund-order-mock_handler
**Ne yapar**: Gelen `req` (istek) nesnesini işleyerek bir iade (refund) siparişine ait taklit (mock) yanıtı üretir ve `Response` nesnesi olarak döndürür.  

**Nasıl yapar**: Fonksiyon, `req` içeriğini alır, iade siparişine ilişkin iş mantığını taklit eder ve uygun HTTP durum kodu, başlık ve gövdeyle bir `Response` nesnesi oluşturur.  

**Parametreler**:
- `req`: *any* — İade siparişinin taklit edilmesi için gelen istek nesnesi.  

**Dönüş**: `Response` — İsteğe karşılık oluşturulan HTTP yanıtını temsil eden nesne.

---

## INTERFACES

### RefundRequest
- `order_id: string`
- `amount?: number`
- `reason?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\refund-order-mock\index.ts::refund-order-mock_handler
- **params**: (req)
- **ic_degiskenler**:
  - `origin` — `req.headers.get('origin')` sonucundan gelen değer; yoksa `'*'` kullanılır, CORS başlıkları için.
  - `cors` — CORS yanıt başlıklarını içeren nesne; `origin` ve istek başlıklarından türetilir.
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ortam değişkeni; boş ise hata döner.
  - `serviceKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ortam değişkeni; boş ise hata döner.
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ortam değişkeni; boş ise hata döner.
  - `authHeader` — `req.headers.get('authorization')` sonucu; yoksa yetkisiz yanıt döner.
  - `authClient` — `createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })` ile oluşturulan Supabase istemcisi.
  - `user` — `authClient.auth.getUser()` çağrısının başarılı sonucunda elde edilen kullanıcı nesnesi.
  - `authErr` — `authClient.auth.getUser()` çağrısının hata nesnesi.
  - `actorUserId` — `user.id`; işlem yapan kullanıcının kimliği.
  - `body` — `await req.json().catch(()=>({}))` ile elde edilen istek gövdesi, `RefundRequest` tipinde.
  - `order_id` — `body.order_id` değerinin boşlukları temizlenmiş hali; zorunlu alan.
  - `amount` — `body.amount` sayısal ve geçerli ise `Number(body.amount)`; aksi takdirde `undefined`.
  - `reason` — `body.reason` string ise ilk 140 karakteri; aksi takdirde `undefined`.
  - `ordResp` — Sipariş bilgilerini getirmek için yapılan `fetch` isteği.
  - `arr` — `ordResp.json()` sonucunda elde edilen dizi; hata durumunda boş dizi.
  - `order` — `arr[0]` (ilk eleman) eğer dizi ise; yoksa `null`.
  - `isAdmin` — Başlangıçta `false`; profil sorgulaması sonrası admin/superadmin rolü varsa `true`.
  - `prof` — Kullanıcı profilini getirmek için yapılan `fetch` isteği.
  - `prows` — `prof.json()` sonucunda elde edilen dizi; hata durumunda boş dizi.
  - `prow` — `prows[0]` (ilk eleman) eğer dizi ise; yoksa `null`.
  - `isOwner` — `actorUserId` mevcut ve `order.user_id` ile eşleşiyorsa `true`.
  - `totalAmount` — `order.total_amount` değerinin sayısal karşılığı; yoksa `0`.
  - `target` — `amount` pozitif bir sayı ise `amount`; aksi takdirde `totalAmount`.
  - `isFull` — `target >= totalAmount`; tam iade mi yoksa kısmi iade mi olduğunu belirler.
  - `newPaymentStatus` — `isFull` ise `'refunded'`, değilse `'partial_refunded'`.
  - `newOrderStatus` — `isFull` ve sipariş durumu `shipped`/`delivered` değilse `'cancelled'`, aksi takdirde mevcut `order.status`.
  - `dbg` — `order.payment_debug` nesnesi; yoksa boş nesne.
  - `newDebug` — Güncellenmiş ödeme debug nesnesi; iade türü, miktarı, neden vb. bilgileri içerir.
  - `itemsResp` — Tam iade durumunda stok geri eklemek için sipariş öğelerini getiren `fetch` isteği.
  - `items` — `itemsResp.json()` sonucunda elde edilen dizi; hata durumunda boş dizi.
  - `it` — `items` dizisindeki tek bir öğe; `product_id` ve `quantity` alanları vardır.
  - `upd` — Siparişin `payment_status`, `status` ve `payment_debug` alanlarını güncelleyen `PATCH` `fetch` isteği.
  - `txt` — `upd._text()` çağrısının sonucu; güncelleme hatası mesajı.
  - `payload` — Audit kaydı için oluşturulan nesne: `{ order_id, amount: target, reason, actor_user_id }`.
  - `msg` — `catch` bloğunda yakalanan hata mesajı; `Error` ise `message`, değilse `String(_e)`.
- **Dönüş**: `Response` nesnesi. Fonksiyon, CORS başlıkları eklenmiş JSON yanıtları döner; başarılı işlemde `{ ok: true, order_id, payment_status, amount }`, hata durumlarında ilgili hata kodu ve mesajı içerir.

---

## NODE ID STANDARD

  file: supabase\functions\refund-order-mock\index.ts
  function: supabase\functions\refund-order-mock\index.ts::refund-order-mock_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: refund-order-mock_handler