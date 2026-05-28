---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\order-validate\index.ts
skeleton_hash: bf6740246d4dc074
entity_hashes:
  func:order-validate_handler: 5404fb6b36c963fe
  overview: d54381bf08b3aab6
generated_at: 2026-05-28T22:47:26Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesi kapsamında Supabase Edge Function olarak deploy edilmiş bir sipariş doğrulama servisidir. Tek bir HTTP işleyicisi aracılığıyla gelen sipariş istemlerini merkezi olarak karşılar, iş kurallarına uygunluk denetimlerini gerçekleştirir ve sonucu istemciye standart HTTP yanıtı olarak iletir.

## Fonksiyon Grupları
### Sipariş Doğrulama İşlemi
Gelen HTTP isteğinin ayrıştırılmasından başlayarak kullanıcının yetkilendirilmesi, sipariş verilerinin doğrulanması, hesaplamaların kontrol edilmesi ve stok uygunluğunun tespit edilmesi de dahil olmak üzere tüm doğrulama yaşam döngüsünü tek bir çağrı noktası üzerinden yönetir.
- order_validate_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase Edge Function ortamında çalışan bir HTTP istek işleyicisidir. Aşağıdaki mimari varsayımlar, fonksiyon imzası ve modül yapısından türetilmiştir.

---

**[Aksiyom 1]:** Eğer `req` parametresi sağlanmazsa, fonksiyon isteği işleyemez ve hata oluşur.

> **Gerekçe:** `order-validate_handler(req)` fonksiyonu tek bir zorunlu parametre alır ve bu parametre için varsayılan bir değer tanımlanmamıştır.

---

**[Aksiyom 2]:** Eğer `req` geçerli bir HTTP istek nesnesi (Request formatı) değilse, fonksiyon beklenmeyen davranış sergileyebilir veya hata fırlatabilir.

> **Gerekçe:** Modül, Supabase Edge Function ortamında çalışmaktadır ve HTTP yanıtı döndürmektedir. Bu nedenle girdinin HTTP istek formatında olması gerekmektedir.

---

**[Aksiyom 3]:** Eğer fonksiyon bir HTTP yanıtı döndüremezse (network hatası, timeout vb.), istemci geçersiz veya eksik yanıt alır.

> **Gerekçe:** Fonksiyonun temel amacı isteği işleyip HTTP yanıtı iletmektir; yanıt iletimi başarısız olursa istemci tarafında hata yönetimi devreye girer.

---

**Not:** Fonksiyon gövdesi (implementation) paylaşılmadığı için, sipariş doğrulama mantığına ilişkin spesifik kurallar (eşik değerleri, geçerlilik kriterleri vb.) belirlenememiştir.

---

## FONKSİYON DETAYLARI

### order-validate_handler

**Ne yapar**: Bu fonksiyon, HTTP isteklerini alarak sipariş doğrulama işlemlerini yönetir ve uygun HTTP yanıtı (Response) döndürür. Supabase Edge Function yapısı içinde yer alan bir istek işleyicisidir.

**Nasıl yapar**: Fonksiyon, gelen HTTP istek nesnesini (req) parameter olarak alır. Sipariş doğrulama mantığını çalıştırarak isteğin durumuna göre uygun bir Response nesnesi oluşturur ve döndürür. Fonksiyonun iç detayları docstring'de belirtilmemiştir.

**Parametreler**:
- req: Request — Gelen HTTP istek nesnesi. Sipariş doğrulama için gerekli verileri ve header bilgilerini içerir.

**Dönüş**: Response — HTTP yanıt nesnesi. Doğrulama sonucuna göre başarı veya hata durumunu belirten yanıt döndürür.

---

## INTERFACES

### CartItem
- `product_id: string`
- `quantity: number | string`
- `unit_price?: number | string`
- `price_list_id?: string | null`

### Product
- `id: string`
- `price?: number | string`
- `stock_qty?: number | string`
- `stock?: number | string`
- `quantity_available?: number | string`
- `inventory?: number | string`
- `inventory_quantity?: number | string`
- `available?: number | string`
- `on_hand?: number | string`

### UserProfile
- `id: string`
- `role?: string`
- `organization_id?: string | null`

### Organization
- `id: string`
- `tier_level?: number | null`

### PriceList
- `id: string`
- `allowed_user_roles?: string[] | null`
- `organization_tiers?: number[] | null`
- `is_default?: boolean`
- `effective_from?: string | null`

### ProductPrice
- `base_price?: number | string | null`
- `sale_price?: number | string | null`
- `discount_percentage?: number | string | null`
- `is_active?: boolean`
- `valid_from?: string | null`
- `valid_until?: string | null`
- `price_list_id?: string | null`

### RecalcItem
- `product_id: string`
- `quantity: number`
- `unit_price: number`
- `price_list_id: string | null`

### MismatchItem
- `product_id: string`
- `had: unknown`
- `expected: number`
- `price_list_id: string | null`

### StockIssue
- `product_id: string`
- `requested: number`
- `available: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::order-validate_handler
- **params**: `req` — HTTP Request nesnesi, method ve body içerir
- **ic_degiskenler**:
  - `cors` — CORS başlık nesnesi, tüm Response'larda kullanılır
  - `supabaseUrl` — Deno.env'den alınan Supabase proje URL'i
  - `serviceRoleKey` — Deno.env'den alınan service role anahtarı (admin erişimi)
  - `anonKey` — Deno.env'den alınan anon (public) anahtar
  - `authHeader` — req.headers.get('Authorization') ile alınan token
  - `authClient` — anonKey + kullanıcı token'ı ile oluşturulmuş Supabase client
  - `user` — authClient.auth.getUser() sonucundaki authenticated kullanıcı nesnesi
  - `authErr` — auth kontrolünden dönen hata (null ise başarılı)
  - `headers` — serviceRoleKey ile service-role seviyesinde API çağrısı için başlıklar
  - `body` — req.json() ile parse edilmiş request gövdesi
  - `userId` — user.id, oturum açmış kullanıcının ID'si
  - `cartId` — body'den gelen veya user'a göre çözümlenmiş sepet ID'si
  - `carts` — user_id ile shopping_carts tablosundan getirilen sepet kayıtları
  - `items` — cart_items tablosundan getirilen sepet ürünleri dizisi
  - `_productIds` — items içinden benzersiz product_id'ler kümesi
  - `prods` — products tablosundan getirilen ürün kayıtları
  - `pmap` — product_id -> Product eşlemesi yapan Map (hızlı arama için)
  - `role` — user_profiles tablosundaki kullanıcının rolü (varsayılan 'individual')
  - `orgId` — user_profiles tablosundaki organization_id (yoksa null)
  - `tier` — organizations tablosundaki tier_level (yoksa null)
  - `prof` — user_profiles tablosundan getirilen profil verisi
  - `org` — organizations tablosundan getirilen organizasyon verisi
  - `n` — şu anki ISO zaman damgası (price_lists filtresi için)
  - `lists` — aktif ve tarih filtresinden geçmiş price_lists kayıtları
  - `flists` — role ve tier uyumuna göre filtrelenmiş price lists
  - `chosenListId` — flists içinden seçilen ilk price list ID'si (yoksa null)
  - `recalculated` — yeniden hesaplanmış sepet ürünleri dizisi
  - `mismatches` — fiyat uyuşmazlıkları dizisi
  - `stockIssues` — stok sorunları dizisi
  - `to2` — sayıyı 2 ondalık basamağa yuvarlayan yardımcı fonksiyon
  - `toCents` — sayıyı kuruşa çeviren yardımcı fonksiyon
  - `it` — items döngüsündeki mevcut sepet öğesi
  - `product` — pmap'ten looked up ürün nesnesi
  - `pr` — priceFor() sonucu {unit, listId} nesnesi
  - `unit` — priceFor() sonucundaki birim fiyat
  - `unitNorm` — unit'in 2 ondalığa yuvarlanmış hali
  - `equal` — mevcut fiyat ile beklenen fiyat arasındaki fark < 0.005 ise true
  - `available` — ürün stok miktarı (product nesnesinin various alanlarından çözümlenir)
  - `cand` — stok miktarı için aday alanların dizisi
  - `c` — cand döngüsündeki mevcut aday alan değeri
  - `qty` — sepetteki talep edilen miktar
  - `finalQty` - stok durumuna göre nihai miktar (stok yetersizse available'a düşürülür)
  - `_e` — catch bloğu yakaladığı hata nesnesi
- **Dönüş**: `Response` — JSON gövdeli HTTP yanıtı (200, 400, 401, 405 veya 500)

### [N2_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::getJson
- **params**: `_path: string` — Supabase REST API yolu (supabaseUrl sonrası kısım)
- **ic_degiskenler**:
  - `res` — fetch() çağrısından dönen Response nesnesi
  - `txt` — res._text() ile alınan ham yanıt metni
- **Dönüş**: `Promise<T>` — parse edilmiş JSON verisi veya hata fırlatır

### [N3_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::nowIso
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — new Date().toISOString() ile şu anki UTC zaman damgası

### [N4_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::priceFor
- **params**: `product: Product` — fiyat hesaplanacak ürün nesnesi
- **ic_degiskenler**:
  - `queries` — price list ID sorguları dizisi (chosenListId ve/veya null)
  - `q` — döngüdeki mevcut price list ID'si veya null
  - `basePath` — product_prices REST API için temel sorgu yolu
  - `_path` — price_list_id filtresi eklenmiş tam API yolu
  - `rows` — product_prices tablosundan dönen fiyat satırları
  - `pick` — geçerli tarih aralığındaki ilk fiyat satırı (yoksa rows[0])
  - `base` — pick.base_price'dan convert edilmiş taban fiyat
  - `sale` — pick.sale_price'dan convert edilmiş indirimli fiyat (null olabilir)
  - `disc` — pick.discount_percentage'dan convert edilmiş indirim yüzdesi
  - `v` — base * (1 - disc/100) ile hesaplanan indirimli fiyat
  - `fb` — product.price alanından fallback fiyat (fallback senaryosu)
- **Dönüş**: `{unit: number, listId: string|null}` — hesaplanan birim fiyat ve kullanılan price list ID

### [N5_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::flists_filter
- **params**: `pl: PriceList` — filtrelenecek fiyat listesi
- **ic_degiskenler**:
  - `rs` — pl.allowed_user_roles alanının string[] | null | undefined olarak cast'i
  - `ts` — pl.organization_tiers alanının number[] | null | undefined olarak cast'i
  - `roleOk` — rol kontrolü sonucu (rs yoksa veya boşsa veya role içeriyorsa true)
  - `tierOk` — tier kontrolü sonucu (tier null ise veya ts yoksa veya tier içeriyorsa true)
- **Dönüş**: `boolean` — pl'nin role ve tier ile uyumlu olup olmadığı

### [N6_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::flists_sort
- **params**: `a: PriceList`, `b: PriceList` — sıralanacak iki fiyat listesi
- **ic_degiskenler**:
  - `ad` — a.is_default değerinin sayısal karşılığı (true→1, false→0)
  - `bd` — b.is_default değerinin sayısal karşılığı (true→1, false→0)
  - `at` — a.effective_from'un Date.parse ile timestamp'e çevirimi (yoksa 0)
  - `bt` — b.effective_from'un Date.parse ile timestamp'e çevirimi (yoksa 0)
- **Dönüş**: `number` — sıralama karşılaştırma sonucu (önce default olmayanlar, sonra tarihe göre azalan)

---

## NODE ID STANDARD

  file: supabase\functions\order-validate\index.ts
  function: supabase\functions\order-validate\index.ts::order-validate_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-validate_handler