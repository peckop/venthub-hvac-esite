---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx
skeleton_hash: 1ea6b8991a36c6cf
entity_hashes:
  func:CartProvider: d9bed5174f018a15
  overview: d316bc96f5e38c53
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:38:06Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin alışveriş sepeti yönetimi için React Context tabanlı bir sağlayıcıdır. Uygulama içindeki tüm alt bileşenlerin merkezi sepet verilerine ve işlevlerine erişmesini sağlayarak sepet yönetimi mantığını tek bir merkezde toplar. React ekosisteminin context pattern'ini kullanarak state paylaşımını standart bir yapıda gerçekleştirir.

## Fonksiyon Grupları
### Ana Context Sağlayıcı Bileşeni
Modülün tek sorumluluğunu üstlenen, sepet context'ini uygulama genelinde kullanılabilir hale getiren ana bileşendir. Kendisine iletilen tüm alt React bileşenlerini sarmalayarak sepet ile ilgili tüm state ve işlevleri alt ağaçtaki tüm bileşenlere erişilebilir kılar.
- CartProvider

---

## AXIOMS – Mimari Varsayımlar
Bu React CartProvider modülü, alışveriş sepeti state'ini uygulama genelinde paylaşmak ve yapılandırıldığında sunucu ile senkronize etmek için tasarlanmıştır, çalışması için React context altyapısının ve gerektiğinde senkronizasyon için gerekli ağ bağlantısının varlığı zorunludur.

[Aksiyom 1]: Eğer CartProvider prop'u olarak iletilen children ReactNode bileşenleri yoksa, hiçbir alt uygulama bileşeni sepet state'ine erişemez, modül tamamen işlevsiz kalır.
[Aksiyom 2]: Eğer modül içindeki CART_SERVER_SYNC binary ifadesi doğru şekilde tanımlanmamışsa, sepet verilerinin sunucu ile senkronizasyon işlemi hiçbir zaman tetiklenemez, sepet verileri sadece istemci tarafında tutulur, çapraz cihaz/oturum senkronizasyonu çalışmaz.
[Aksiyom 3]: Eğer CartProvider, sepet state'ini kullanacak tüm tüketici bileşenlerden üstte, React uygulama ağacının uygun kök seviyesinde render edilmezse, context tüketen bileşenler çalışma zamanında hata alır, sepet işlemleri kullanılamaz hale gelir.
[Aksiyom 4]: Eğer CART_SERVER_SYNC ifadesi true (senkronizasyon aktif) iken sepet verilerinin iletileceği sunucu API uç noktasına ağ üzerinden erişim yoksa, sepet üzerindeki tüm değişiklikler sunucuya aktarılamaz, istemci ve sunucu sepet verileri arasında kalıcı tutarsızlık oluşur.

---

## FONKSİYON DETAYLARI

### CartProvider
**Ne yapar**: React uygulamasında alışveriş sepeti (cart) durumunu yöneten bir context provider bileşenidir. Sepet verilerini hem yerel tarayıcı depolamasına (localStorage) hem de sunucuya (veritabanına) senkronize eder. Kullanıcı oturum açtığında misafir sepetini sunucu sepetiyle birleştirir.

**Nasıl yapar**: Bileşen, useState ile yerel sepet state'ini tutar. Mount olduğunda localStorage'dan sepeti yükler (şema uyumsuzluğu veya son sipariş başarılı ise temizler). items değiştiğinde localStorage'a kaydeder. Kullanıcı değiştiğinde (giriş/çıkış) sunucuyla senkronizasyon sağlar. Cross-tab senkronizasyonu için storage event'lerini dinler. addToCart, removeFromCart, updateQuantity, clearCart gibi callback'leri memoize ederek sağlar. Son olarak CartContext.Provider'a değer olarak verir.

**Parametreler**:
- `children`: ReactNode — Provider'ın sarmalayacağı alt bileşenler

**Dönüş**: JSX elementi (`<CartContext.Provider value={value}>{children}</CartContext.Provider>`) — value nesnesi şu alanları içerir:
- `items`: CartItem[] — Sepetteki ürünlerin listesi
- `syncing`: boolean — Sunucuyla senkronizasyon devam ediyor mu?
- `addToCart`: (product: Product, quantity?: number) => void — Ürünü sepete ekler
- `removeFromCart`: (productId: string) => void — Ürünü sepetten çıkarır
- `updateQuantity`: (productId: string, quantity: number) => void — Ürün miktarını günceller
- `clearCart`: (opts?: { silent?: boolean }) => void — Sepeti temizler
- `getCartTotal`: () => number — Sepet toplam tutarını hesaplar
- `getCartCount`: () => number — Sepet toplam ürün sayısını döndürür
- `applyServerPricing`: (serverItems: { product_id: string, unit_price: number }[]) => void — Sunucudan gelen fiyat listesini yerel sepete uygular

---

## SABİTLER
- **CART_SERVER_SYNC** [env-backed] (binary_expression) — `(process.env.NEXT_PUBLIC_CART_SERVER_SYNC ?? 'true') === 'true'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/contexts/CartProvider.tsx::loadCartFromLocalStorage (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**:
  - `schema` — localStorage'dan okunan mevcut sepet şeması anahtarı
  - `lastStatus` — son sipariş durumu (localStorage'dan), 'success' ise sepet temizlenir
  - `savedCart` — localStorage'dan okunan sepet verisi (JSON string)
  - `savedVer` — localStorage'dan okunan yerel versiyon numarası (string)
  - `v` — savedVer'in parseInt ile number'a dönüştürülmüş hali
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: src/contexts/CartProvider.tsx::saveCartToLocalStorage (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**:
  - `v` — Date.now() ile oluşturulan zaman damgası, yerel versiyon olarak saklanır
- **Dönüş**: yok (yan etki: localStorage'a items ve versiyon yazar)

### [N3_NASIL] AST Pointer: src/contexts/CartProvider.tsx::mergeItems
- **params**: `(local: CartItem[], server: CartItem[], isGuestCart: boolean)`
- **ic_degiskenler**:
  - `map` — product.id -> CartItem eşlemesi; birleştirilmiş sepet ürünlerini tutar, tekrarları önler
- **Dönüş**: `CartItem[]` — birleştirilmiş sepet dizisi

### [N4_NASIL] AST Pointer: src/contexts/CartProvider.tsx::serverSyncUseEffect (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**:
  - `cancelled` — async senkronizasyon iptal flag'i; cleanup fonksiyonunda true yapılır
- **Dönüş**: cleanup fonksiyonu `() => { cancelled = true }` — useEffect temizliği

### [N5_NASIL] AST Pointer: src/contexts/CartProvider.tsx::syncWithServer (async inner function)
- **params**: (yok)
- **ic_degiskenler**:
  - `cart` — getOrCreateShoppingCart ile elde edilen veya oluşturulan sunucu sepet nesnesi (id içerir)
  - `currentOwner` — localStorage'dan okunan sepet sahibi kullanıcı ID'si
  - `isGuestCart` — mevcut kullanıcının misafir sepeti taşıyıp taşımadığını belirten boolean
  - `discardLocalGuestCart` — misafir sepetinin atılması gerekip gerekmediğini belirten flag
  - `clearOnce` — sipariş sonrası sunucu sepetini temizleme flag'i (localStorage'dan okunur)
  - `raw` — localStorage'dan okunan vh_pending_order ham JSON string'i
  - `data` — JSON.parse ile çözümlenmiş pending order nesnesi (orderId alanı içerir)
  - `oid` — pending order'ın sipariş ID'si
  - `ord` — Supabase'den sorgulanan sipariş kaydı (status ve created_at alanları)
  - `ordErr` — Supabase sipariş sorgulama hatası
  - `serverRows` — listCartItemsWithProducts ile getirilen sunucu satırları (item ve product içerir)
  - `serverItems` — serverRows'dan map'lenen CartItem dizisi
  - `merged` — yerel ve sunucu sepetlerinin birleştirilmiş hali (merge stratejisine göre)
  - `priceInfoList` — merged ürünlerin her biri için Promise.all ile hesaplanan birim fiyat bilgileri dizisi
  - `unitMap` — product.id -> unitPrice eşlemesi; fiyat bilgilerini hızlı erişim için saklar
  - `mergedWithPrices` — birleştirilmiş ürünlerin unitPrice alanlarının güncellenmiş hali
  - `v` — Date.now() ile oluşturulan zaman damgası, yerel versiyon olarak saklanır
- **Dönüş**: yok (yan etki: items state'ini, serverCartId'yi günceller; localStorage'ı yazar)

### [N6_NASIL] AST Pointer: src/contexts/CartProvider.tsx::serverItemsMapCallback
- **params**: `(row)` — sunucu sepet satırı nesnesi (item ve product alanları içerir)
- **ic_degiskenler**: (yok — sadece return ifadesi)
- **Dönüş**: `{ id: string, product: Product, quantity: number }` — row.verilerinden oluşturulmuş CartItem

### [N7_NASIL] AST Pointer: src/contexts/CartProvider.tsx::upsertPricingCallback
- **params**: `(it)` — merge edilmiş CartItem nesnesi
- **ic_degiskenler**:
  - `info` — getEffectivePriceInfo ile hesaplanan etkin fiyat bilgisi (unitPrice ve priceListId içerir)
- **Dönüş**: `{ _productId: string, unitPrice: number | undefined }` — ürün ID ve birim fiyat

### [N8_NASIL] AST Pointer: src/contexts/CartProvider.tsx::logoutSync (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**: (yok — sadece user kontrolü ve localStorage temizliği)
- **Dönüş**: yok (yan etki: CART_OWNER_KEY'i kaldırır, serverCartId'yi null yapar)

### [N9_NASIL] AST Pointer: src/contexts/CartProvider.tsx::crossTabSync (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**: (yok — iç içe onStorage fonksiyonunu tanımlar)
- **Dönüş**: cleanup fonksiyonu — storage event listener'ı kaldırır

### [N10_NASIL] AST Pointer: src/contexts/CartProvider.tsx::onStorage (named function)
- **params**: `(e: StorageEvent)` — tarayıcı storage olay nesnesi
- **ic_degiskenler**:
  - `owner` — localStorage'dan okunan sepet sahibi kullanıcı ID'si
  - `vStr` — localStorage'dan okunan versiyon string'i
  - `v` — parseInt ile number'a dönüştürülmüş versiyon; yerel versiyondan büyükse senkronize eder
  - `raw` — localStorage'dan okunan ham sepet JSON string'i
  - `next` — JSON.parse ile çözümlenmiş sepet dizisi
- **Dönüş**: yok (yan etki: items state'ini günceller)

### [N11_NASIL] AST Pointer: src/contexts/CartProvider.tsx::addToCart
- **params**: `(product: Product, quantity = 1)` — eklenecek ürün ve miktar
- **ic_degiskenler**:
  - `serverCartId` — sunucu sepet ID'si (closure'dan); upsertCartItem çağrısında kullanılır
- **Dönüş**: yok (yan etki: items state'ini günceller; sunucuya upsert yapar; toast/custom event tetikler)

### [N12_NASIL] AST Pointer: src/contexts/CartProvider.tsx::addToCart_setItemsUpdater
- **params**: `(currentItems)` — mevcut sepet ürünleri dizisi (setState updater)
- **ic_degiskenler**:
  - `existingItem` — aynı product.id'ye sahip mevcut sepet kalemi; varsa miktar artırılır, yoksa yeni eklenir
- **Dönüş**: `CartItem[]` — güncellenmiş sepet ürünleri dizisi

### [N13_NASIL] AST Pointer: src/contexts/CartProvider.tsx::addToCart_mapUpdater
- **params**: `(item)` — mevcut sepet kalemi (map içinde dolaşılan)
- **ic_degiskenler**: (yok — sadece koşullu spread ve quantity güncelleme)
- **Dönüş**: `CartItem` — miktarı artırılmış veya aynen kalmış sepet kalemi

### [N14_NASIL] AST Pointer: src/contexts/CartProvider.tsx::addToCart_supabaseImport
- **params**: `({ getEffectivePriceInfo, upsertCartItem })` — dinamik import ile gelen fonksiyonlar
- **ic_degiskenler**:
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
  - `items` — mevcut sepet ürünleri (closure'dan); mevcut ürün miktarını bulmak için kullanılır
- **Dönüş**: yok (yan etki: sunucuya fiyat hesaplar ve upsert yapar)

### [N15_NASIL] AST Pointer: src/contexts/CartProvider.tsx::addToCart_priceInfoCallback
- **params**: `(info)` — getEffectivePriceInfo sonucu { unitPrice, priceListId }
- **ic_degiskenler**:
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
  - `product` — eklenecek ürün nesnesi (closure'dan)
  - `quantity` — eklenecek miktar (closure'dan)
  - `items` — mevcut sepet ürünleri (closure'dan); ürünün güncel miktarını bulmak için kullanılır
- **Dönüş**: yok (yan etki: upsertCartItem çağırır, items state'ini unitPrice ile günceller)

### [N16_NASIL] AST Pointer: src/contexts/CartProvider.tsx::removeFromCart
- **params**: `(_productId: string)` — kaldırılacak ürünün ID'si
- **ic_degiskenler**:
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
- **Dönüş**: yok (yan etki: items state'inden ürünü filtreler; sunucudan kaldırır; toast gösterir)

### [N17_NASIL] AST Pointer: src/contexts/CartProvider.tsx::removeFromCart_setItemsUpdater
- **params**: `(currentItems)` — mevcut sepet ürünleri dizisi (setState updater)
- **ic_degiskenler**:
  - `item` — kaldırılacak ürünü bulan find sonucu; varsa toast gösterilir
- **Dönüş**: `CartItem[]` — ilgili ürün filtrelenmiş sepet dizisi

### [N18_NASIL] AST Pointer: src/contexts/CartProvider.tsx::removeFromCart_supabaseImport
- **params**: `({ removeCartItem })` — dinamik import ile gelen kaldırma fonksiyonu
- **ic_degiskenler**:
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
  - `_productId` — kaldırılacak ürünün ID'si (closure'dan)
- **Dönüş**: Promise — removeCartItem sonucu

### [N19_NASIL] AST Pointer: src/contexts/CartProvider.tsx::updateQuantity
- **params**: `(_productId: string, quantity: number)` — güncellenecek ürün ID'si ve yeni miktar
- **ic_degiskenler**:
  - `product` — _productId'ye eşleşen ürün nesnesi; fiyat hesaplaması için kullanılır
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
- **Dönüş**: yok (yan etki: quantity <= 0 ise removeFromCart çağırır; items state'ini günceller; sunucuya upsert yapar)

### [N20_NASIL] AST Pointer: src/contexts/CartProvider.tsx::updateQuantity_setItemsUpdater
- **params**: `(currentItems)` — mevcut sepet ürünleri dizisi (setState updater)
- **ic_degiskenler**: (yok — sadece map ile quantity güncelleme)
- **Dönüş**: `CartItem[]` — ilgili ürünün miktarı güncellenmiş sepet dizisi

### [N21_NASIL] AST Pointer: src/contexts/CartProvider.tsx::updateQuantity_mapUpdater
- **params**: `(item)` — mevcut sepet kalemi (map içinde dolaşılan)
- **ic_degiskenler**: (yok — koşul kontrolü ve spread)
- **Dönüş**: `CartItem` — quantity'si güncellenmiş veya aynen kalmış sepet kalemi

### [N22_NASIL] AST Pointer: src/contexts/CartProvider.tsx::updateQuantity_supabaseImport
- **params**: `({ getEffectivePriceInfo, upsertCartItem })` — dinamik import ile gelen fonksiyonlar
- **ic_degiskenler**:
  - `product` — güncellenecek ürün (closure'dan)
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
  - `_productId` — ürün ID'si (closure'dan)
  - `quantity` — yeni miktar (closure'dan)
- **Dönüş**: yok (yan etki: fiyat hesaplar ve sunucuya upsert yapar)

### [N23_NASIL] AST Pointer: src/contexts/CartProvider.tsx::updateQuantity_priceInfoCallback
- **params**: `(info)` — getEffectivePriceInfo sonucu { unitPrice, priceListId }
- **ic_degiskenler**:
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
  - `_productId` — ürün ID'si (closure'dan)
  - `quantity` — yeni miktar (closure'dan)
- **Dönüş**: yok (yan etki: upsertCartItem çağırır, items state'ini unitPrice ile günceller)

### [N24_NASIL] AST Pointer: src/contexts/CartProvider.tsx::clearCart
- **params**: `(opts?: { silent?: boolean })` — opsiyonel; silent=true ise toast göstermez
- **ic_degiskenler**: (yok — doğrudan setItems, localStorage temizliği ve sunucu temizliği yapar)
- **Dönüş**: yok (yan etki: items'ı boşaltır; localStorage'ı temizler; storage event tetikler; sunucudan temizler)

### [N25_NASIL] AST Pointer: src/contexts/CartProvider.tsx::clearCart_supabaseImport
- **params**: `({ clearCartItems })` — dinamik import ile gelen sepet temizleme fonksiyonu
- **ic_degiskenler**:
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
- **Dönüş**: Promise — clearCartItems sonucu

### [N26_NASIL] AST Pointer: src/contexts/CartProvider.tsx::getCartTotal
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — sepet ürünleri dizisi (closure'dan); reduce ile toplam hesaplanır
- **Dönüş**: `number` — sepet toplam tutarı (birim fiyat × miktar toplamı)

### [N27_NASIL] AST Pointer: src/contexts/CartProvider.tsx::getCartTotal_reduceCallback
- **params**: `(total, item)` — kümülatif toplam ve mevcut sepet kalemi
- **ic_degiskenler**:
  - `unit` — ürün birim fiyatı; item.unitPrice sayıysa onu, değilse product.price'ı kullanır
- **Dönüş**: `number` — güncellenmiş kümülatif toplam

### [N28_NASIL] AST Pointer: src/contexts/CartProvider.tsx::getCartCount
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — sepet ürünleri dizisi (closure'dan); reduce ile toplam miktar hesaplanır
- **Dönüş**: `number` — sepet toplam ürün adedi (quantity'lerin toplamı)

### [N29_NASIL] AST Pointer: src/contexts/CartProvider.tsx::applyServerPricing
- **params**: `(serverItems: { product_id: string, unit_price: number }[])` — sunucudan gelen ürün-birim fiyat çiftleri dizisi
- **ic_degiskenler**:
  - `to2` — sayıyı 2 ondalık basamağa yuvarlayan yardımcı fonksiyon
  - `nearlyEqual` — iki sayının 2 ondalık hassasiyetle eşit olup olmadığını kontrol eden fonksiyon
  - `pmap` — product_id -> unitPrice eşlemesi; sunucu fiyatlarını 2 ondalık olarak saklar
  - `changedIds` — gerçekten fiyatı değişen ürün ID'lerinin kümesi; idempotent davranış sağlar
  - `items` — mevcut sepet ürünleri (closure'dan)
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
- **Dönüş**: yok (yan etki: items state'indeki unitPrice'ları günceller; değişen kalemleri sunucuya upsert eder)

### [N30_NASIL] AST Pointer: src/contexts/CartProvider.tsx::applyServerPricing_setItemsUpdater
- **params**: `(curr)` — mevcut sepet ürünleri dizisi (setState updater)
- **ic_degiskenler**: (yok — map içinde koşullu güncelleme)
- **Dönüş**: `CartItem[]` — birim fiyatları güncellenmiş sepet dizisi

### [N31_NASIL] AST Pointer: src/contexts/CartProvider.tsx::applyServerPricing_mapUpdater
- **params**: `(it)` — mevcut sepet kalemi (map içinde dolaşılan)
- **ic_degiskenler**:
  - `nextUnit` — sunucudan gelen yeni birim fiyat (pmap'ten); null ise ürün aynen kalır
  - `currUnit` — ürünün mevcut birim fiyatı; unitPrice sayıysa onu, değilse product.price'ı kullanır
- **Dönüş**: `CartItem` — birim fiyat güncellenmiş veya aynen kalmış sepet kalemi

### [N32_NASIL] AST Pointer: src/contexts/CartProvider.tsx::applyServerPricing_supabaseImport
- **params**: `({ upsertCartItem })` — dinamik import ile gelen upsert fonksiyonu
- **ic_degiskenler**:
  - `tasks` — Promise dizisi; her değişen ürün için upsertCartItem çağrısı
  - `items` — mevcut sepet ürünleri (closure'dan)
  - `changedIds` — fiyatı değişen ürün ID'leri kümesi (closure'dan)
  - `pmap` — product_id -> unitPrice eşlemesi (closure'dan)
  - `serverCartId` — sunucu sepet ID'si (closure'dan)
- **Dönüş**: yok (yan etki: Promise.allSettled ile sunucuya toplu fiyat güncellemesi yapar)

### [N33_NASIL] AST Pointer: src/contexts/CartProvider.tsx::contextValue
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — sepet ürünleri (closure'dan)
  - `syncing` — senkronizasyon durumu flag'i (closure'dan)
  - `addToCart` — ürün ekleme fonksiyonu (closure'dan)
  - `removeFromCart` — ürün kaldırma fonksiyonu (closure'dan)
  - `updateQuantity` — miktar güncelleme fonksiyonu (closure'dan)
  - `clearCart` — sepet temizleme fonksiyonu (closure'dan)
  - `getCartTotal` — toplam tutar hesaplama fonksiyonu (closure'dan)
  - `getCartCount` — toplam adet hesaplama fonksiyonu (closure'dan)
  - `applyServerPricing` — sunucu fiyatlarını yerel sepete uygulama fonksiyonu (closure'dan)
- **Dönüş**: `CartContext` — CartContext tipinde nesne; tüm sepet state ve fonksiyonlarını sağlar

---

## NODE ID STANDARD

  file: src\contexts\CartProvider.tsx
  function: src\contexts\CartProvider.tsx::CartProvider

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartProvider

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)