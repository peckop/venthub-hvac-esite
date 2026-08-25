---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\supabase\functions\order-validate\index.ts
skeleton_hash: c26fe237bc27679d
entity_hashes:
  func:order-validate_handler: 5404fb6b36c963fe
  func:segmentFromUser: 75769b5088e7f187
  overview: 07239b761dcc7b2d
generated_at: 2026-08-25T07:34:04Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak çalışan bir sipariş doğrulama servisidir. Deno runtime'ında `@serve` dekoratörüyle tanımlanmış bir HTTP istek işleyicisi içerir. Kullanıcı bilgilerinden fiyat segmenti çıkararak sipariş doğrulama işlemini gerçekleştirir.

## Fonksiyon Grupları

### Ana İşlemci
Gelen HTTP isteklerini karşılar ve sipariş doğrulama sürecini yönetir. Supabase'in `Deno.serve` altyapısıyla entegre çalışarak yanıt üretir.
- order-validate_handler

### Yardımcı Fonksiyonlar
Kullanıcı nesnesinin `app_metadata` alanından fiyat segmenti (`PriceSegment`) değerini çözümlemekten sorumludur. Kullanıcı bilgisi null olabilir; bu durumda uygun bir varsayılan değer döndürür.
- segmentFromUser

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer Deno runtime'ı mevcut değilse, `@serve(Deno.serve)` decorator'ı çalışamaz ve modül başlatılamaz.

[Aksiyom 2]: Eğer `PriceSegment` tipi tanımlı değilse, `segmentFromUser` fonksiyonu derlenemez ve çalıştırılamaz.

[Aksiyom 3]: Eğer `segmentFromUser` fonksiyonuna `null` değer gelir ve fonksiyon null durumunu işlemiyorsa, beklenmeyen bir hata oluşur. Ancak fonksiyon imzası `null` kabul ettiğinden, null durumunu işlediği varsayılabilir; kesin davranış fonksiyon gövdesi bilinmediğinden belirlenemez.

[Aksiyom 4]: Eğer `req` parametresi geçerli bir HTTP isteği içermiyorsa, `order-validate_handler` fonksiyonu beklenen şekilde çalış

---

## FONKSİYON DETAYLARI

### segmentFromUser
**Ne yapar**: Verilen kullanıcı nesnesinin `app_metadata` alanını inceleyerek kullanıcının fiyat segmentini belirler. Dealer, corporate veya individual segmentlerinden birini döndürür.
**Nasıl yapar**: Fonksiyon, öncelikle kullanıcının `app_metadata` nesnesini alır (eğer kullanıcı null ise boş bir nesne kullanır). Ardından bu metadata içindeki `price_segment` ve `user_role` anahtarlarını sırasıyla kontrol eder. Eğer bu anahtarlardan herhangi birinin değeri `'dealer'` veya `'corporate'` ise, o değeri hemen döndürür. Eğer bu kontrollerin hiçbiri eşleşmezse, varsayılan olarak `'individual'` segmentini döndürür.
**Parametreler**:
- u: `{ app_metadata?: Record<string, unknown> } | null` — Kullanıcı nesnesi. `app_metadata` alanı isteğe bağlıdır ve içinde key-value çiftleri barındırabilir. Null olabilir.
**Dönüş**: `PriceSegment` — Kullanıcının belirlenen fiyat segmentini temsil eden bir değer. `'dealer'`, `'corporate'` veya `'individual'` olabilir.

### order-validate_handler
**Ne yapar**: Gelen HTTP isteklerini işleyen bir sunucu fonksiyonudur. Sipariş doğrulama mantığını uygulamak için bir giriş noktası olarak görev yapar.
**Nasıl yapar**: Fonksiyon, `@serve(Deno.serve)` dekoratörü ile işaretlenmiştir. Bu dekoratör, fonksiyonun Deno'nun yerleşik HTTP sunucusu (`Deno.serve`) tarafından çağrılacak bir istek işleyicisi (handler) olmasını sağlar. Fonksiyonun gövdesi verilen kaynakta yer almadığından, iç mantığı hakkında bilgi verilemez.
**Parametreler**:
- req: `Request` — Gelen HTTP isteğini temsil eden nesne. Fonksiyonun gövdesi bilinmediğinden, bu parametrenin nasıl kullanıldığı bilinmiyor.
**Dönüş**: `Response` — Fonksiyonun isteğe yanıt olarak döndürdüğü HTTP yanıt nesnesi.

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
- **params**: `u` — null olabilen bir nesne; `app_metadata` alanı `Record<string, unknown>` tipinde isteğe bağlıdır
- **ic_degiskenler**:
  - `md` — `u?.app_metadata ?? {}` ifadesiyle elde edilen kullanıcı meta verisi; `u` null ise boş nesne kullanılır
  - `c` — `for` döngüsünde `md['price_segment']` ve `md['user_role']` değerlerini sırayla kontrol eden döngü değişkeni
- **Dönüş**: `PriceSegment` — `'dealer'`, `'corporate'` veya `'individual'` değerlerinden biri

---

### [N2_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::order-validate_handler
- **params**: `req` — gelen HTTP isteği nesnesi
- **ic_degiskenler**:
  - `cors` — `getCorsHeaders(req)` çağrısıyla elde edilen CORS başlıkları nesnesi
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alınan ortam değişkeni; yoksa boş string
  - `serviceRoleKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan ortam değişkeni; yoksa boş string
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan ortam değişkeni; yoksa boş string
  - `authHeader` — `req.headers.get('Authorization')` ile alınan yetkilendirme başlığı
  - `authClient` — `createClient(supabaseUrl, anonKey, ...)` ile oluşturulan Supabase istemcisi; `authHeader` global başlık olarak eklenir
  - `user` — `authClient.auth.getUser(...)` sonucundaki `data.user` nesnesi; kimliği doğrulanmış kullanıcıyı temsil eder
  - `authErr` — `authClient.auth.getUser(...)` sonucundaki hata; yetkilendirme başarısızlığında dolu olur
  - `headers` — `serviceRoleKey` ile oluşturulan API istek başlıkları nesnesi (`Authorization`, `apikey`, `Content-Type`)
  - `body` — `req.json().catch(()=>({}))` ile parse edilen istek gövdesi; parse hatasında boş nesne
  - `userId` — `user.id` ile alınan kullanıcı kimliği
  - `cartId` — `body?.cart_id || body?.cartId` değerinden elde edilen sepet kimliği; bulunamazsa kullanıcı kimliğiyle sorgulanır
  - `carts` — `getJson` ile `/rest/v1/shopping_carts` endpoint'inden alınan sepet listesi; `cartId` boşken kullanıcı kimliğiyle sorgulanır
  - `items` — `getJson` ile `/rest/v1/cart_items` endpoint'inden alınan sepet ürünleri dizisi (`CartItem[]`)
  - `_productIds` — `items` dizisinden çıkarılan benzersiz `product_id` değerlerinden oluşan `Set`
  - `prods` — `getJson` ile `/rest/v1/products` endpoint'inden alınan ürünler dizisi (`Product[]`)
  - `pmap` — `prods` dizisinden oluşturulan `Map<string, Product>`; ürün kimliğini Product nesnesine eşler
  - `segment` — `segmentFromUser(user)` çağrısıyla belirlenen fiyat segmenti (`'dealer'`, `'corporate'` veya `'individual'`)
  - `n` — `nowIso()` ile elde edilen mevcut zaman damgası (ISO 8601 formatında)
  - `lists` — `getJson` ile `/rest/v1/price_lists` endpoint'inden alınan fiyat listeleri dizisi (`PriceList[]`); `is_active=true`, `effective_from<=n` ve geçerlilik süresi koşullarıyla filtrelenmiş
  - `flists` — `lists` dizisinin `segment` değerine göre filtrelenmiş hali; `user_type` segment ile eşleşen veya `user_type` boş olan listeler
  - `chosenListId` — `flists` dizisinin sıralama sonrası ilk elemanının `id` değeri; yoksa `null`
  - `recalculated` — `RecalcItem[]` tipinde, yeniden hesaplanmış sepet ürünlerini tutan dizi
  - `mismatches` — `MismatchItem[]` tipinde, fiyat uyumsuzluklarını tutan dizi
  - `stockIssues` — `StockIssue[]` tipinde, stok sorunlarını tutan dizi
  - `to2` — aldığı sayıyı `Number(n).toFixed(2)` ile iki ondalık basamağa yuvarlayan fonksiyon
  - `toCents` — aldığı sayıyı `Math.round(Number(n)*100)` ile kuruş birimine çeviren fonksiyon
  - `it` — `items` dizisi üzerinde `for...of` ile iterasyon yapılan her bir sepet kalemi
  - `product` — `pmap.get(it.product_id)` ile elde edilen Product nesnesi; eşleşme yoksa `undefined`
  - `pr` — `priceFor(product)` çağrısıyla elde edilen fiyat bilgisi (`{unit, listId}`)
  - `unit` — `pr.unit` ile alınan birim fiyat
  - `unitNorm` — `to2(unit)` ile normalize edilmiş birim fiyat (iki ondalık basamak)
  - `equal` — `it.unit_price` ile `unitNorm` arasındaki farkın 0.005'ten küçük olup olmadığını gösteren boolean
  - `available` — ürünün mevcut stok miktarı; `product` nesnesindeki `stock_qty`, `stock`, `quantity_available`, `inventory`, `inventory_quantity`, `available`, `on_hand` alanlarından bulunan ilk sayısal değer
  - `cand` — stok bilgisi için kontrol edilen alan adları dizisi (`product.stock_qty`, `product.stock`, `product.quantity_available`, `product.inventory`, `product.inventory_quantity`, `product.available`, `product.on_hand`)
  - `c` — `cand` dizisi üzerinde `for...of` ile iterasyon yapılan her bir stok alanı adayı
  - `qty` — `Number(it.quantity) || 0` ile elde edilen sepet kaleminin miktarı
  - `finalQty` — stok kontrolü sonrası nihai miktar; stok yetersizse `available` değerine düşürülür
  - `subtotalCents` — `recalculated` dizisi üzerinde `reduce` ile hesaplanan toplam tutar (kuruş cinsinden)
  - `subtotal` — `subtotalCents / 100` ile elde edilen toplam tutar (TL cinsinden)
  - `ok` — `mismatches.length === 0 && stockIssues.length === 0` koşulunu gösteren boolean; fiyat uyumsuzluğu ve stok sorunu yoksa `true`
- **Dönüş**: `Response` — durum kodu 200 (başarılı), 400 (eksik sepet), 401 (yetkisiz), 405 (izin verilmeyen yöntem), 500 (yapılandırma/hata) olabilen HTTP yanıtı; gövde JSON formatında

---

### [N3_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::getJson
- **params**: `_path` — Supabase REST API endpoint yolunu içeren string
- **ic_degiskenler**:
  - `res` — `fetch(\`${supabaseUrl}${_path}\`, { headers })` çağrısıyla elde edilen HTTP yanıt nesnesi
  - `txt` — `res.text()` ile yanıt gövdesinin string olarak okunmuş hali
- **Dönüş**: `Promise<T>` — yanıt gövdesinin `JSON.parse` ile parse edilmiş hali; parse hatasında `null as unknown as T` döner; HTTP hatasında `Error` fırlatır

---

### [N4_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::nowIso
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — `new Date().toISOString()` ile elde edilen mevcut zaman damgası (ISO 8601 formatında)

---

### [N5_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::flists.sort (sıralama fonksiyonu)
- **params**: `a` — `PriceList` tipinde birinci fiyat listesi; `b` — `PriceList` tipinde ikinci fiyat listesi
- **ic_degiskenler**:
  - `at` — `a.effective_from` varsa `Date.parse(a.effective_from)`, yoksa `0` değeri
  - `bt` — `b.effective_from` varsa `Date.parse(b.effective_from)`, yoksa `0` değeri
- **Dönüş**: `number` — sıralama sonucu; `user_type` spesifik olan önce gelir, ardından `effective_from` tarihine göre azalan sıralama

---

### [N6_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::priceFor
- **params**: `product` — `Product` tipinde fiyatlandırılacak ürün nesnesi
- **ic_degiskenler**:
  - `_path` — `/rest/v1/product_prices` endpoint'ine yapılacak sorgunun URL'si; `product.id` ve `chosenListId` ile filtrelenmiş
  - `rows` — `getJson<ProductPrice[]>(_path)` ile alınan fiyat kayıtları dizisi
  - `pick` — `rows` dizisinde geçerlilik tarih aralığındaki (`valid_from <= Date.now()` ve `valid_until >= Date.now()`) ilk kayıt; bulunamazsa `rows[0]`
  - `net` — `pick.net_price` değerinin `Number()` ile sayıya çevrilmiş hali; `null` ise `null`
  - `gross` — `pick.gross_price` değerinin `Number()` ile sayıya çevrilmiş hali; `null` ise `null`
  - `derived` — segment `'individual'` ise `gross ?? net`, değilse `net ?? gross` ile belirlenen fiyat
  - `base` — `Number(pick.base_price || 0)` ile elde edilen temel fiyat
  - `sale` — `pick.sale_price` değerinin `Number()` ile sayıya çevrilmiş hali; `null` ise `null`
  - `disc` — `Number(pick.discount_percentage || 0)` ile elde edilen indirim yüzdesi
  - `v` — `base * (1 - disc / 100)` ile hesaplanan indirimli fiyat
  - `fb` — `Number(product.price || 0)` ile elde edilen ürünün varsayılan fiyatı (fallback)
- **Dönüş**: `Promise<{unit: number, listId: string | null}>` — hesaplanan birim fiyat ve kullanılan fiyat listesi kimliği

---

## NODE ID STANDARD

  file: index.ts
  function: index.ts::segmentFromUser
  function: index.ts::order-validate_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-validate_handler
  export: segmentFromUser