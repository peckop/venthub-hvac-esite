---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\order-validate\index.ts
skeleton_hash: c5992e8b629d24ba
entity_hashes:
  func:order-validate_handler: 5404fb6b36c963fe
  func:segmentFromUser: 705d18e6eb2ea250
  overview: 07239b761dcc7b2d
generated_at: 2026-08-14T22:03:26Z
---

## Genel Bakış
Bu modül, VentHub HVAC sistemi için bir Supabase Edge Function olarak implemente edilmiş, merkezi sipariş doğrulama servisidir. Tek bir HTTP istek noktası üzerinden tüm sipariş taleplerini alarak, iş kurallarına dayalı kapsamlı doğrulama adımlarını uygular ve sonucu istemciye standart bir HTTP yanıtı olarak geri döndürür. Modül, fiyatlandırma segmentasyonu gibi yardımcı işlevleri de entegre ederek doğrulama sürecini destekler.

## Fonksiyon Grupları
### Ana Sipariş Doğrulama İşleyicisi
Modülün dış dünyayla (HTTP istekleri) tek etkileşim noktasıdır. Gelen tüm istekleri dinler, işler ve uygun HTTP yanıtlarını (başarı, hata kodları) üreterek sonuçlandırır.
- order-validate_handler

### Yardımcı Fiyatlandırma ve Segmentasyon
Kullanıcı bilgilerinden yola çıkarak siparişin hangi fiyat segmentine (ör. perakende, toptan) ait olduğunu belirlemek gibi destekleyici mantığı yürütür. Ana işleyici tarafından çağrılarak doğrulama sürecine zenginlik katar.
- segmentFromUser

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir HTTP isteğini alıp sipariş doğrulama işlemleri yapacak şekilde tasarlanmıştır.

[Aksiyom 1]: Eğer `u` parametresi `null` olarak geçirilirse, `segmentFromUser` fonksiyonu yine de geçerli bir `PriceSegment` değeri döndürmelidir; çünkü fonksiyon imzası `null`ı açıkça kabul etmektedir.

[Aksiyom 2]: Eğer `u.app_metadata` alanı mevcut değilse, `segmentFromUser` fonksiyonu bu durumu işleyebilmeli (undefined erişimi olmadan çalışabilmelidir); çünkü `app_metadata` imzada `Record<string, unknown>` olarak **opsiyonel** (`?`) tanımlanmıştır.

[Aksiyom 3]: Eğer `req` parametresi geçerli bir HTTP isteği içermiyorsa, `order-validate_handler` geçerli bir `Response` nesnesi döndüremeyebilir; çünkü handler'ın girdisi olarak yalnızca `req` alınmaktadır ve dönüş tipi `Response`'tur.

---

## FONKSİYON DETAYLARI

### segmentFromUser
**Ne yapar**: Bu fonksiyon, bir kullanıcının fiyat segmentini (PriceSegment) belirler. Kullanıcı nesnesinin `app_metadata` alanındaki `price_segment` veya `user_role` özelliklerini kontrol ederek, kullanıcının bireysel (individual), bayi (dealer) veya kurumsal (corporate) müşteri olup olmadığını döndürür.

**Nasıl yapar**: Fonksiyon, verilen kullanıcı nesnesinden `app_metadata` alanını alır veya nesne null ise boş bir nesne kullanır. Ardından `price_segment` ve `user_role` alanlarını sırasıyla kontrol eder. Bu alanlardan herhangi biri `'dealer'` veya `'corporate'` değerine sahipse, bu değeri doğrudan `PriceSegment` olarak döndürür. Bu koşullar sağlanmazsa varsayılan olarak `'individual'` değerini döndürür.

**Parametreler**:
- `u`: `{ app_metadata?: Record<string, unknown> } | null` — İşlem yapılacak kullanıcı nesnesi. `app_metadata` alanı opsiyoneldir ve nesne herself null olabilir.

**Dönüş**: `PriceSegment` — Kullanıcının belirlenen fiyat segmenti. `'individual'`, `'dealer'` veya `'corporate'` değerlerinden biri olabilir.

### order-validate_handler

**Ne yapar**: Bu fonksiyon, HTTP isteklerini alarak sipariş doğrulama işlemlerini yönetir ve uygun HTTP yanıtı (Response) döndürür. Supabase Edge Function yapısı içinde yer alan bir istek işleyicisidir.

**Nasıl yapar**: Fonksiyon, gelen HTTP istek nesnesini (req) parameter olarak alır. Sipariş doğrulama mantığını çalıştırarak isteğin durumuna göre uygun bir Response nesnesi oluşturur ve döndürür. Fonksiyonun iç detayları docstring'de belirtilmemiştir.

**Parametreler**:
- req: Request — Gelen HTTP istek nesnesi. Sipariş doğrulama için gerekli verileri ve header bilgilerini içerir.

**Dönüş**: Response — HTTP yanıt nesnesi. Doğrulama sonucuna göre başarı veya hata durumunu belirten yanıt döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

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

### PriceList
- `id: string`
- `user_type?: string | null`
- `effective_from?: string | null`

### ProductPrice
- `base_price?: number | string | null`
- `sale_price?: number | string | null`
- `discount_percentage?: number | string | null`
- `is_active?: boolean`
- `valid_from?: string | null`
- `valid_until?: string | null`
- `price_list_id?: string | null`
- `net_price?: number | string | null`
- `gross_price?: number | string | null`

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

## TYPE ALIASES

### PriceSegment
```typescript
type PriceSegment = 'individual' | 'dealer' | 'corporate'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::segmentFromUser
- **params**: `u: { app_metadata?: Record<string, unknown> } | null` — JWT user objesi, app_metadata içerebilir
- **ic_degiskenler**:
  - `md` — u?.app_metadata değerini alır, null/undefined ise boş obje {} fallback'lidir; price_segment ve user_role alanlarını barındırır
  - `c` — for döngüsü iterasyon değişkeni; önce md['price_segment'] sonra md['user_role'] değerlerini sırayla kontrol eder
- **Dönüş**: PriceSegment — 'dealer', 'corporate' veya 'individual'

### [N2_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::order-validate_handler
- **params**: `req` — gelen HTTP Request objesi, method/headers/body taşır
- **ic_degiskenler**:
  - `cors` — getCorsHeaders(req) ile üretilen CORS header objesi, her yanıtta kullanılır
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL') ortam değişkeni, Supabase API temel URL'i
  - `serviceRoleKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), servis seviyesi yetkilendirme anahtarı
  - `anonKey` — Deno.env.get('SUPABASE_ANON_KEY'), anonim kullanıcı anahtarı
  - `authHeader` — req.headers.get('Authorization'), Bearer token taşıyan başlık
  - `authClient` — createClient ile anonKey + authHeader ile oluşturulan Supabase istemcisi, kullanıcı doğrulaması için kullanılır
  - `user` — authClient.auth.getUser() sonucu dönen authenticated kullanıcı objesi; user.id sepet çözümlemesinde kullanılır
  - `authErr` — authClient.auth.getUser() hata sonucu; hata varsa veya user null ise 401 döner
  - `headers` — serviceRoleKey ile API istekleri için Authorization, apikey ve Content-Type barındıran header objesi
  - `body` — req.json().catch(()=>({})) ile parse edilen istek gövdesi, cart_id/cartId içerebilir
  - `userId` — user.id değerinden türetilen kullanıcının UUID'si
  - `cartId` — body.cart_id veya body.cartId'den çözülen alışveriş sepeti ID'si; boşsa user_id ile sorgulanır
  - `carts` — /rest/v1/shopping_carts sorgusundan dönen kullanıcının sepetleri dizisi
  - `items` — /rest/v1/cart_items sorgusundan dönen CartItem[] dizisi; product_id, quantity, unit_price, price_list_id taşır
  - `_productIds` — items dizisinden map ile çıkarılıp Set ile benzersizleştirilmiş product_id'ler dizisi
  - `prods` — /rest/v1/products sorgusundan dönen Product[] dizisi, _productIds ile filtrelenmiş
  - `pmap` — product.id → Product eşlemesi yapan Map, ürünleri hızlı erişim için indeksler
  - `segment` — segmentFromUser(user) çağrısıyla JWT'den çıkarılan fiyat segmenti ('individual'/'dealer'/'corporate')
  - `n` — nowIso() çağrısıyla elde edilen mevcut ISO zaman damgası, fiyat listesi geçerlilik kontrolünde kullanılır
  - `lists` — /rest/v1/price_lists sorgusundan dönen PriceList[] dizisi; is_active=true, effective_from<=now, effective_to>=now veya null filtresi uygulanmış
  - `flists` — lists'ten segment'e eşleşen veya user_type'ı olmayan (genel) listeleri filtreleyip sıralayan dizi; spesifik user_type önce, sonra en yeni effective_from
  - `chosenListId` — flists[0]?.id, sıralama sonrası seçilen fiyat listesinin ID'si; null ise fallback fiyat kullanılır
  - `recalculated` — RecalcItem[] dizisi, her kalem için yeniden hesaplanan birim fiyat ve miktarı tutar
  - `mismatches` — MismatchItem[] dizisi, sepetteki unit_price ile hesaplanan fiyat arasındaki farkları kaydeder
  - `stockIssues` — StockIssue[] dizisi, istenen miktarın mevcut stoktan fazla olduğu durumları kaydeder
  - `to2` — (n:number) => Number(Number(n).toFixed(2)), sayıyı 2 ondalık basamağa yuvarlayan yardımcı fonksiyon
  - `toCents` — (n:number) => Math.round(Number(n)*100), sayıyı sent cinsine çeviren yardımcı fonksiyon
  - `it` — for...of items döngüsü iterasyon değişkeni,her bir CartItem
  - `product` — pmap.get(it.product_id) ile elde edilen ürün objesi; bulunamazsa döngü atlanır
  - `pr` — await priceFor(product) sonucu {unit, listId} nesnesi, hesaplanan birim fiyat ve kullanılan liste ID'si
  - `unit` — pr.unit, priceFor fonksiyonundan dönen hesaplanmış birim fiyat
  - `unitNorm` — to2(unit), 2 ondalık basamağa yuvarlanmış birim fiyat
  - `equal` — it.unit_price ile unitNorm arasındaki mutlak farkın 0.005'ten küçük olup olmadığını test eden boolean
  - `available` — ürünün stok miktarı; product nesnesinin stock_qty/stock/quantity_available/inventory/inventory_quantity/available/on_hand alanlarından ilk geçerli sayısal değer
  - `cand` — stok alanı adlarının dizisi, product nesnesinden stok değerini çözmek için sırayla kontrol edilir
  - `c` — cand döngüsü iterasyon değişkeni, her bir potansiyel stok alanı adı
  - `qty` — Number(it.quantity)||0, istenen kalem miktarı
  - `finalQty` — stok kısıtlamasıyla belirlenen nihai miktar; available varsa ve qty>available ise available'a düşürülür
  - `subtotalCents` — recalculated.reduce ile hesaplanan toplam tutarın sent cinsinden değeri
  - `subtotal` — subtotalCents/100, toplam tutarın birim cinsinden değeri
  - `ok` — mismatches.length===0 && stockIssues.length===0, siparişin fiyat ve stok açısından uyumlu olduğunu gösteren boolean
- **Dönüş**: Response — JSON { ok, items, mismatches, stock_issues, totals, cart_id }

### [N3_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::getJson (inner)
- **params**: `_path: string` — Supabase REST API'ye yapılacak istek yolu (ör: /rest/v1/cart_items?...)
- **ic_degiskenler**:
  - `res` — fetch(supabaseUrl + _path, { headers }) çağrısından dönen Response objesi
  - `txt` — res.text() ile elde edilen response body'sinin ham metin hali; hata durumunda da loglanır
- **Dönüş**: Promise<T> — JSON.parse(txt) ile çözülen泛型 nesne; parse hatasında null cast edilir

### [N4_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::nowIso (inner)
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: string — new Date().toISOString() ile elde edilen güncel ISO 8601 zaman damgası

### [N5_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::priceFor (inner)
- **params**: `product: Product` — fiyat hesaplanacak ürün nesnesi; product.id ve product.price fallback olarak kullanılır
- **ic_degiskenler**:
  - `_path` — /rest/v1/product_prices sorgusu için oluşturulan URL; product_id, is_active=true, price_list_id=chosenListId filtreleri uygulanmış
  - `rows` — getJson<ProductPrice[]>(_path) ile dönen fiyat kayıtları dizisi
  - `pick` — rows içinden valid_from<=now && valid_until>=now koşulunu sağlayan ilk kayıt; yoksa rows[0] fallback
  - `net` — pick.net_price null değilse Number(pick.net_price), aksi halde null; B2B (net/KDV-harici) fiyat
  - `gross` — pick.gross_price null değilse Number(pick.gross_price), aksi halde null; B2C (gross/KDV-dahil) fiyat
  - `derived` — segment==='individual' ise gross??net, aksi halde net??gross; segment'e göre türetilen fiyat
  - `base` — Number(pick.base_price||0), taban fiyat
  - `sale` — pick.sale_price null değilse Number(pick.sale_price), aksi halde null; indirimli satış fiyatı
  - `disc` — Number(pick.discount_percentage||0), indirim yüzdesi (0-100)
  - `v` — base*(1-disc/100) ile hesaplanan indirim uygulanmış fiyat
  - `fb` — Number(product.price||0), fiyat listesinde kayıt bulunamazsa kullanılan fallback ürün fiyatı
- **Dönüş**: Promise<{unit: number, listId: string | null}> — hesaplanmış birim fiyat ve kullanılan fiyat listesi ID'si

### [N6_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::sort_comparator (anonymous)
- **params**: `a: PriceList` — karşılaştırılacak ilk fiyat listesi, `b: PriceList` — karşılaştırılacak ikinci fiyat listesi
- **ic_degiskenler**:
  - `at` — a.effective_from Date.parse() sonucu milisaniye cinsinden tarih; null/parse edilemezse 0
  - `bt` — b.effective_from Date.parse() sonucu milisaniye cinsinden tarih; null/parse edilemezse 0
- **Dönüş**: number — negatif ise a önce gelir; spesifik user_type olan önce, sonra en yeni effective_from önce gelir (azalan sıra)

---

## NODE ID STANDARD

  file: supabase\functions\order-validate\index.ts
  function: supabase\functions\order-validate\index.ts::segmentFromUser
  function: supabase\functions\order-validate\index.ts::order-validate_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-validate_handler
  export: segmentFromUser