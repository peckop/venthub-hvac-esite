---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\order-validate\index.ts
skeleton_hash: 51c5353a83b2d85b
entity_hashes:
  func:order-validate_handler: 5404fb6b36c963fe
  overview: 583f7cd99c081500
generated_at: 2026-05-29T11:46:48Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesi için bir Supabase Edge Function olarak tasarlanmış, merkezi bir sipariş doğrulama servisi sunar. Tek bir HTTP giriş noktası üzerinden tüm sipariş taleplerini karşılar, iş kurallarına uygunluk denetimlerini uygular ve sonucu istemciye standart bir HTTP yanıtı olarak iletir.

## Fonksiyon Grupları
### Sipariş Doğrulama İşlemi
Tüm sipariş doğrulama mantığını tek bir çağrı noktasında birleştirerek, istek ayrıştırma, yetkilendirme, veri doğrulama ve stok kontrolleri gibi adımları yönetir.
- order-validate_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir HTTP isteğini alıp sipariş doğrulama işlemleri yapacak şekilde tasarlanmıştır.

[Aksiyom 1]: Eğer req nesnesi geçerli bir HTTP isteği içermiyorsa, fonksiyon uygun hata yanıtı (400 Bad Request) döner.

[Aksiyom 2]: Eğer istek içindeki sipariş verisi eksik veya hatalıysa, fonksiyon_VALIDASYON hatası ile yanıt verir.

[Aksiyom 3]: Eğer kullanıcının oturum bilgileri (token) geçerli değilse veya yoksa, fonksiyon_YETKİLENDİRME hatası (401/403) ile yanıt verir.

[Aksiyom 4]: Eğer stok kontrolü yapılıyorsa ve yeterli stok yoksa, fonksiyon stok yetersizliği hatası ile yanıt verir.

[Aksiyom 5]: Eğer tüm doğrulamalar başarılı

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
- **params**: `req` — HTTP request nesnesi, method, headers ve body içerir
- **ic_degiskenler**:
  - `corsHeaders` — getCorsHeaders(req) ile elde edilen CORS başlık nesnesi
  - `cors` — corsHeaders'a eşitlenen kısaltma; OPTIONS ve hata yanıtlarında kullanılır
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL') ile okunan Supabase URL adresi
  - `serviceRoleKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ile okunan service role anahtarı
  - `anonKey` — Deno.env.get('SUPABASE_ANON_KEY') ile okunan anon anahtar
  - `authHeader` — req.headers.get('Authorization') ile çekilen yetkilendirme başlığı
  - `authClient` — createClient ile anonKey + authHeader ile oluşturulan Supabase istemcisi (kullanıcı doğrulama için)
  - `user` — authClient.auth.getUser() sonucundan alınan authenticated kullanıcı nesnesi
  - `authErr` — auth.getUser() sırasında oluşan hata nesnesi
  - `headers` — serviceRoleKey ile oluşturulan HTTP başlık nesnesi, supabase REST API çağrılarında kullanılır
  - `body` — req.json().catch() ile parse edilen istek gövdesi (hata durumunda boş nesne)
  - `userId` — user.id değerinden alınan mevcut kullanıcının UUID'si
  - `cartId` — body.cart_id veya body.cartId'den okunan veya kullanıcının sepetinden çözümlenen sepet ID'si
  - `carts` — /rest/v1/shopping_carts sorgusu ile kullanıcının sepetleri (cartId yoksa çözümleme için)
  - `items` — /rest/v1/cart_items sorgusu ile cart_id'ye ait sepet ürünleri dizisi (CartItem[])
  - `_productIds` — items dizisinden uniq product_id'ler kümesi, ürünleri toplu sorgulamak için
  - `prods` — /rest/v1/products sorgusu ile çekilen ürün nesneleri dizisi (Product[])
  - `pmap` — prods dizisinden oluşturulan Map<productId, Product>, hızlı ürün erişimi için
  - `role` — kullanıcının rolü ('individual' varsayılan), user_profiles tablosundan yüklenir
  - `orgId` — kullanıcının organization_id'si, user_profiles tablosundan yüklenir
  - `tier` — organizasyonun tier_level'u, organizations tablosundan yüklenir
  - `prof` — /rest/v1/user_profiles sorgusu ile çekilen kullanıcı profil verisi (UserProfile[])
  - `org` — /rest/v1/organizations sorgusu ile çekilen organizasyon verisi (Organization[])
  - `n` — nowIso() ile elde edilen ISO formatlı şu anki zaman damgası
  - `lists` — aktif ve geçerli fiyat listelerinin tamamı (PriceList[])
  - `flists` — lists içinden role ve tier uygunluğuna göre filtrelenmiş ve sıralanmış fiyat listeleri
  - `chosenListId` — flists[0]?.id, kullanılacak birincil fiyat listesi ID'si
  - `recalculated` — her sepet ürünü için yeniden hesaplanmış fiyat/miktar bilgisi (RecalcItem[])
  - `mismatches` — mevcut unit_price ile hesaplanan fiyat arasındaki farklar (MismatchItem[])
  - `stockIssues` — stok yetersizliği tespit edilen ürünler (StockIssue[])
  - `to2` — sayıyı 2 ondalık basamağa yuvarlayan arrow fonksiyonu
  - `toCents` — sayıyı sent cinsine çeviren arrow fonksiyonu (100 ile çarpıp round)
  - `it` — for...of döngüsü içindeki her birCartItem (CartItem)
  - `product` — pmap.get(it.product_id) ile elde edilen ürün nesnesi
  - `pr` — priceFor(product) ile hesaplanan {unit, listId} nesnesi
  - `unit` — pr.unit, hesaplanan birim fiyat
  - `unitNorm` — to2(unit) ile 2 ondalığa yuvarlanmış birim fiyat
  - `equal` — mevcut unit_price ile unitNorm arasındaki farkın 0.005'ten küçük olup olmadığı
  - `available` — ürünün stok miktarı, product nesnesinin çeşitli alanlarından çözümlenir
  - `cand` — stok alanını temsil edebilecek potansiyel alan adları dizisi
  - `qty` — sepet ürünü miktarı (it.quantity)
  - `finalQty` — stok kontrolünden sonra kullanılacak nihai miktar
  - `subtotalCents` — recalculated dizisinin reduce ile toplanmış toplam tutarı (sent cinsinden)
  - `subtotal` — subtotalCents/100, toplam tutar (birim cinsinden)
  - `ok` — mismatches ve stockIssues dizilerinin ikisinin de boş olup olmadığı
- **Dönüş**: Response (JSON: { ok, items, mismatches, stock_issues, totals, cart_id })

### [N2_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::getJson
- **params**: `_path: string` — Supabase REST API yol kesri
- **ic_degiskenler**:
  - `res` — fetch(supabaseUrl + _path, { headers }) çağrısından dönen Response nesnesi
  - `txt` — res._text() ile okunan ham yanıt metni
- **Dönüş**: `Promise<T>` — JSON.parse ile parse edilmiş泛型 veri; parse edilemezse null döner

### [N3_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::priceFor
- **params**: `product: Product` — fiyat hesaplanacak ürün nesnesi
- **ic_degiskenler**:
  - `queries` — sorgulanacak price_list_id değerleri dizisi; chosenListId varsa [chosenListId, null], yoksa [null]
  - `q` — for...of döngüsündeki mevcut price_list_id sorgu değeri (string|null)
  - `basePath` — product_prices REST API sorgu yolunun ortak kısmı, is_active=eq.true filtresi dahil
  - `_path` — q değerine göre price_list_id parametresi eklenmiş nihai sorgu yolu
  - `rows` — getJson ile çekilen ProductPrice[] dizisi
  - `rows` içinden `pick` — valid_from/valid_until tarih aralığına uygun ilk satır veya ilk satır
  - `base` — pick.base_price sayısına dönüştürülmüş taban fiyat
  - `sale` — pick.sale_price varsa sayıya dönüştürülmüş indirimli satış fiyatı, yoksa null
  - `disc` — pick.discount_percentage sayısına dönüştürülmüş indirim yüzdesi
  - `v` — base*(1-disc/100) formülü ile hesaplanan indirimli fiyat (base > 0, disc > 0 durumu)
  - `fb` — product.price fallback değeri, hiçbir fiyat listesi bulunamazsa kullanılır
- **Dönüş**: `Promise<{unit: number, listId: string|null}>` — hesaplanan birim fiyat ve kullanılan fiyat listesi ID'si

### [N4_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::(priceListFilter callback)
- **params**: `pl: PriceList` — filtrelenecek fiyat listesi nesnesi
- **ic_degiskenler**:
  - `rs` — pl.allowed_user_roles alanının string[] | null | undefined olarak cast edilmiş hali
  - `ts` — pl.organization_tiers alanının number[] | null | undefined olarak cast edilmiş hali
  - `roleOk` — mevcut kullanıcının rolünün fiyat listesinin izin verilen rolleri arasında olup olmadığı
  - `tierOk` — mevcut kullanıcının tier seviyesinin fiyat listesinin izin verilen tier'ları arasında olup olmadığı
- **Dönüş**: `boolean` — fiyat listesi kullanıcının rolüne ve tier'ına uygunsa true

### [N5_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::(priceListSort comparator)
- **params**: `a: PriceList, b: PriceList` — sıralanacak iki fiyat listesi nesnesi
- **ic_degiskenler**:
  - `ad` — a.is_default true ise 1, değilse 0
  - `bd` — b.is_default true ise 1, değilse 0
  - `at` — a.effective_from tarihinden parse edilmiş milisaniye değeri (yoksa 0)
  - `bt` — b.effective_from tarihinden parse edilmiş milisaniye değeri (yoksa 0)
- **Dönüş**: `number` — sıralama skoru; önce default olmayanlar, sonra tarihi daha yeni olanlar üstte

### [N6_NASIL] AST Pointer: supabase/functions/order-validate/index.ts::nowIso
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — new Date().toISOString() ile elde edilen ISO formatlı zaman damgası

---

## NODE ID STANDARD

  file: supabase\functions\order-validate\index.ts
  function: supabase\functions\order-validate\index.ts::order-validate_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-validate_handler