---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\order-validate\index.ts
skeleton_hash: ab6f40489d866897
entity_hashes:
  func:order-validate_handler: 5404fb6b36c963fe
  func:segmentFromUser: 75769b5088e7f187
  overview: 07239b761dcc7b2d
generated_at: 2026-08-14T07:20:36Z
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

**Ne yapar**: Verilen kullanıcı nesnesinin fiyat segmentini belirler. Kullanıcının rolüne veya mevcut fiyat segmenti bilgisine göre 'dealer', 'corporate' veya 'individual' değerlerinden birini döndürerek, sipariş fiyatlandırma mantığının doğru dalga geçmesini sağlar.

**Nasıl yapar**: Fonksiyon, kullanıcının `app_metadata` alanını güvenli bir şekilde erişilebilir hale getirir (nullish coalescing operatörü ile `?? {}` kullanarak). Ardından `price_segment` ve `user_role` olmak üzere iki anahtarı sırasıyla kontrol eder. Bu anahtarlardan herhangi birinin değeri 'dealer' veya 'corporate' ise, o değeri doğrudan döndürür. Her iki anahtar da bu değerleri içermiyorsa, varsayılan olarak 'individual' segmentini döndürür. Bu sayede öncelik sırası `price_segment` > `user_role` > `individual` şeklindedir.

**Parametreler**:
- `u`: `{ app_metadata?: Record<string, unknown> } | null` — Kullanıcı nesnesi. `app_metadata` alanı opsiyoneldir ve `Record<string, unknown>` tipinde, yani key-value çiftlerinden oluşan bir sözlük yapısındadır. `null` değer alabilmesi, kullanıcının oturum açmamış olabileceği veya bilinmeyen bir durumda olduğu senaryoları kapsar.

**Dönüş**: `PriceSegment` — Fonksiyon, predefined (önceden tanımlı) bir string union tipi olan `PriceSegment` döndürür. Bu değerler kodun başka bir yerinde tanımlı olmakla birlikte, fonksiyonun mantığından anlaşıldığı üzere 'dealer', 'corporate' veya 'individual' değerlerinden birini alır.

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
- **params**: `u` — JWT user objesi, `app_metadata` alanı içerebilir, null olabilir
- **ic_degiskenler**:
  - `md` — `u?.app_metadata ?? {}` → kullanıcının app_metadata'sı, yoksa boş obje
  - `c` — for döngüsü değişkeni, `[md['price_segment'], md['user_role']]` dizisi üzerinde iterasyon yapar
- **Dönüş**: `PriceSegment` — `'dealer'`, `'corporate'` veya `'individual'` string döner

### [N2_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::order-validate_handler
- **params**: `req` — gelen HTTP Request nesnesi
- **ic_degiskenler**:
  - `cors` — `getCorsHeaders(req)` ile elde edilen CORS başlık nesnesi
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL') || ''` → Supabase proje URL'i
  - `serviceRoleKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''` → service role anahtarı, servis çağrılarında kullanılır
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY') || ''` → anonim公众 anahtar, auth client oluşturulurken kullanılır
  - `authHeader` — `req.headers.get('Authorization')` → istekten gelen Authorization başlığı
  - `authClient` — `createClient(supabaseUrl, anonKey, ...)` → kullanıcının own token'ı ile oluşturulmuş Supabase auth istemcisi
  - `user` — `authClient.auth.getUser()` sonucu dönen authenticated kullanıcı objesi
  - `authErr` — auth sırasında oluşabilecek hata
  - `headers` — `{ Authorization: Bearer serviceRoleKey, apikey: serviceRoleKey, Content-Type }` → servis rolü ile yapılacak HTTP istekleri için başlıklar
  - `body` — `await req.json()` → istek gövdesi, parse edilemezse boş obje
  - `userId` — `user.id` → oturum açmış kullanıcının ID'si
  - `cartId` — `body?.cart_id || body?.cartId || ''` → sepetteki sepet ID'si, body'den gelmezse user'dan çözülür
  - `getJson` — iç içe tanımlı async fonksiyon, Supabase REST API'ye GET isteği atar ve JSON parse eder
  - `nowIso` — iç içe tanımlı fonksiyon, `new Date().toISOString()` döner
  - `carts` — `getJson('/rest/v1/shopping_carts?...')` → kullanıcının sepetleri (cartId yoksa)
  - `items` — `getJson<CartItem[]>('/rest/v1/cart_items?...')` → sepetteki ürünler, Product[] tipinde döner
  - `_productIds` — `Array.from(new Set(items.map(i=>i.product_id)))` → items içindeki benzersiz product_id'ler
  - `prods` — `getJson<Product[]>('/rest/v1/products?...')` → ürün bilgileri dizisi
  - `pmap` — `new Map<string, Product>()` → product.id → Product eşlemesi, hızlı erişim için
  - `segment` — `segmentFromUser(user)` → kullanıcının fiyat segmenti (individual/dealer/corporate)
  - `n` — `nowIso()` → şu anki ISO zaman damgası, fiyat listesi filtrelemede kullanılır
  - `lists` — `getJson<PriceList[]>('/rest/v1/price_lists?...')` → aktif ve geçerli fiyat listeleri
  - `flists` — `lists` dizisinin `user_type` segment'e uyan veya genel olanlarına göre filtrelenmiş ve sıralanmış hali
  - `chosenListId` — `flists[0]?.id ?? null` → en uygun fiyat listesinin ID'si, hiçbiri yoksa null
  - `priceFor` — iç içe async fonksiyon, bir ürünün fiyat listesinden birim fiyatını hesaplar
  - `recalculated` — `RecalcItem[]` → her satır için yeniden hesaplanmış fiyat/miktar bilgileri
  - `mismatches` — `MismatchItem[]` → sepetteki fiyat ile hesaplanan fiyat arasındaki farklar
  - `stockIssues` — `StockIssue[]` → stok yetersizliği olan ürünler
  - `to2` — `(n:number)=> Number(Number(n).toFixed(2))` → virgülden sonra 2 basamağa yuvarlama helper'ı
  - `toCents` — `(n:number)=> Math.round(Number(n)*100)` → ondalıklı fiyatı kuruşa çevirme
  - `product` — döngü içinde `pmap.get(it.product_id)` ile elde edilen ürün nesnesi
  - `pr` — `priceFor(product)` sonucu, `{unit, listId}` objesi
  - `unit` — `pr.unit` → hesaplanan birim fiyat
  - `unitNorm` — `to2(unit)` → 2 ondalığa yuvarlanmış birim fiyat
  - `equal` — boolean → `it.unit_price` ile `unitNorm` arasındaki fark 0.005'ten küçükse true
  - `available` — `number | null` → ürünün stok miktarı, aday alanlardan ilki bulunana kadar aranır
  - `cand` — stok miktarı için aday alan isimleri dizisi: `[product.stock_qty, product.stock, product.quantity_available, product.inventory, product.inventory_quantity, product.available, product.on_hand]`
  - `c` — cand döngüsü değişkeni
  - `qty` — `Number(it.quantity)||0` → sepetteki ürün miktarı
  - `finalQty` — stok kontrolü sonrası nihai miktar, stok yetersizse `available` değerine düşürülür
  - `subtotalCents` — `recalculated.reduce(...)` → toplam tutar kuruş cinsinden
  - `subtotal` — `subtotalCents/100` → toplam tutar ana para birimi cinsinden
  - `ok` — boolean → `mismatches.length===0 && stockIssues.length===0` ise true
  - `_e` — catch bloğundaki hata nesnesi
- **Dönüş**: `Response` — JSON body: `{ ok, items, mismatches, stock_issues, totals: { subtotal, subtotal_cents }, cart_id }` veya hata durumunda `{ error }`

### [N3_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::getJson
- **params**: `_path: string` — Supabase REST API yolu (örn. `/rest/v1/cart_items?...`)
- **ic_degiskenler**:
  - `res` — `fetch()` sonucu Response nesnesi
  - `txt` — `await res.text()` → yanıtın ham metin gövdesi
- **Dönüş**: `Promise<T>` — parse edilmiş JSON nesnesi; parse edilemezse `null as unknown as T`

### [N4_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::sort_comparator (flists.sort callback)
- **params**: `a: PriceList`, `b: PriceList` — karşılaştırılan iki fiyat listesi
- **ic_degiskenler**:
  - `at` — `a.effective_from ? Date.parse(a.effective_from) : 0` → fiyat listesi A'nın geçerlilik başlangıç zamanı (timestamp)
  - `bt` — `b.effective_from ? Date.parse(b.effective_from) : 0` → fiyat listesi B'nin geçerlilik başlangıç zamanı (timestamp)
- **Dönüş**: `number` — sıralama sırası (negatif: a önce, pozitif: b önce)

### [N5_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::priceFor
- **params**: `product: Product` — fiyat hesaplanacak ürün nesnesi
- **ic_degiskenler**:
  - `_path` — product_prices REST API sorgu yolu, `chosenListId`, `product.id` parametreleriyle
  - `rows` — `getJson<ProductPrice[]>(_path)` → ilgili fiyat listesindeki ürün fiyat kayıtları
  - `pick` — `rows.find(...)` ile bulunan veya `rows[0]` fallback'li seçilmiş fiyat kaydı, geçerli tarih aralığındaki kayıt tercih edilir
  - `net` — `pick.net_price != null ? Number(pick.net_price) : null` → KDV hariç net fiyat
  - `gross` — `pick.gross_price != null ? Number(pick.gross_price) : null` → KDV dahil brüt fiyat
  - `derived` — segment'e göre türetilen fiyat: individual ise gross→net öncelikli, diğerleri net→gross
  - `base` — `Number(pick.base_price||0)` → fiyat kaydının temel fiyatı
  - `sale` — `pick.sale_price != null ? Number(pick.sale_price) : null` → indirimli satış fiyatı
  - `disc` — `Number(pick.discount_percentage||0)` → yüzdelik indirim oranı
  - `v` — `base*(1-disc/100)` → indirim uygulanmış hesaplanan fiyat
  - `fb` — `Number(product.price||0)` → fallback olarak ürünün kendi fiyatı
- **Dönüş**: `Promise<{unit: number, listId: string|null}>` — birim fiyat ve kullanılan fiyat listesi ID'si

---

## NODE ID STANDARD

  file: supabase\functions\order-validate\index.ts
  function: supabase\functions\order-validate\index.ts::segmentFromUser
  function: supabase\functions\order-validate\index.ts::order-validate_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-validate_handler
  export: segmentFromUser