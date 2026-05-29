---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx
skeleton_hash: 1ea6b8991a36c6cf
entity_hashes:
  func:CartProvider: 62fae74b03951519
  overview: d316bc96f5e38c53
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-29T18:46:59Z
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

**Ne yapar**: Sepet (cart) durumunu yöneten React Context sağlayıcısıdır. Tüm sepet verisini (eklenen ürünler, miktarlar, birim fiyatlar) tutar, yerel depolama (localStorage) ile senkronize eder, giriş yapmış kullanıcılar için sunucu tarafı (Supabase) senkronizasyonunu yürütür ve sepetin toplam tutar/sayı bilgilerini hesaplar.

**Nasıl yapar**: Bileşen, `useState` ile sepet öğelerini ve senkronizasyon durumunu, `useRef` ile yerel versiyon numarasını tutar. Mount edildiğinde `useEffect` ile localStorage'dan kayıtlı sepeti yükler; bu sırada şema uyumsuzluğu (deployment güncellemesi) veya başarılı sipariş sonrası temizlik kontrolleri yapar. Öğeler her değiştiğinde localStorage'a yazılır ve versiyon numarası `Date.now()` ile güncellenir. Kullanıcı giriş yaptığında sunucu sepeti ile yerel misafir sepeti birleştirilir (`mergeItems`); sipariş sonrası temizlik bayrakları, fiyat hesaplamaları ve sunucuya upsert işlemleri gerçekleştirilir. Çapraz sekme senkronizasyonu `storage` event'i ile sağlanır — daha yüksek versiyon numarası kazanır. Sunucu tarafı senkronizasyon, `NEXT_PUBLIC_DEBUG` ve `CART_SERVER_SYNC` gibi ortam değişkenlerine bağlı olarak çalışır.

**Parametreler**:
- `children`: `ReactNode` — Bu sağlayıcının sarmaladığı alt bileşen ağacı. `CartContext` değerine erişebilecek tüm alt bileşenleri kapsar.

**Dönüş**: `JSX.Element` — `CartContext.Provider` ile sarılmış `children` öğesini döndürür. Sağlanan value nesnesi şu alanları içerir: `items`, `syncing`, `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `getCartTotal`, `getCartCount`, `applyServerPricing`.

---

## SABİTLER
- **CART_SERVER_SYNC** [env-backed] (binary_expression) — `(process.env.NEXT_PUBLIC_CART_SERVER_SYNC ?? 'true') === 'true'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/contexts/CartProvider.tsx::loadCart (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**:
  - `schema` — localStorage'dan okunan mevcut sepat şeması
  - `lastStatus` — son sipariş durumu, "success" ise sepet temizlenir
  - `savedCart` — localStorage'dan kaydedilmiş sepet JSON string'i
  - `savedVer` — localStorage'dan kaydedilmiş sepat versiyonu string'i
  - `v` — savedVer'in parseInt ile elde edilmiş numeric karşılığı
- **Dönüş**: yok (yan etki: localStorage'dan item'ları yükler, setItems çağırır)

---

### [N2_NASIL] AST Pointer: src/contexts/CartProvider.tsx::saveCart (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**:
  - `v` — Date.now() ile elde edilen zaman damgası, hem localVersionRef.current'a hem localStorage'a yazılır
- **Dönüş**: yok (yan etki: items'ları JSON.stringify edip localStorage'a yazar)

---

### [N3_NASIL] AST Pointer: src/contexts/CartProvider.tsx::mergeItems
- **params**: `(local: CartItem[], server: CartItem[], isGuestCart: boolean)`
- **ic_degiskenler**:
  - `map` — Map<string, CartItem>, product.id key ile benzersiz sepat öğelerini tutar
  - `it` — her iki döngüde de CartItem, haritaya eklenecek tekil öğe
- **Dönüş**: `Array.from(map.values())` → `CartItem[]` (birleştirilmiş sepat listesi)

---

### [N4_NASIL] AST Pointer: src/contexts/CartProvider.tsx::syncWithServer (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**:
  - `cancelled` — boolean, cleanup fonksiyonunda true yapılır, async işlemleri iptal eder
  - `syncWithServer` — inner async fonksiyon, asıl senkronizasyon mantığını çalıştırır
- **Dönüş**: cleanup fonksiyonu döner → `() => { cancelled = true }` (yan etki: user değiştiğinde server ile senkronizasyon başlatır)

---

### [N5_NASIL] AST Pointer: src/contexts/CartProvider.tsx::syncWithServer (inner async function)
- **params**: (yok)
- **ic_degiskenler**:
  - `cart` — `getOrCreateShoppingCart(user.id)` ile elde edilen/seçilen alışveriş sepatı nesnesi, `cart.id` kullanılır
  - `currentOwner` — localStorage'dan okunan `CART_OWNER_KEY` değeri, misafir sepatı tespiti için
  - `isGuestCart` — boolean, currentOwner boşsa veya mevcut user.id ile eşleşmiyorsa true
  - `discardLocalGuestCart` — boolean, recent paid sipariş varsa misafir sepatı atılır
  - `clearOnce` — boolean, `vh_clear_server_cart_once` flag'inden okunur, post-order temizlik için
  - `raw` — localStorage'dan okunan `vh_pending_order` JSON string'i
  - `data` — JSON.parse(raw) sonucu `{ orderId?: string }` tipinde nesne
  - `oid` — pending order ID string'i
  - `ord` — Supabase'den sorgulanan sipariş kaydı (status, created_at alanları)
  - `ordErr` — Supabase sipariş sorgusundaki hata
  - `serverRows` — `listCartItemsWithProducts(cart.id)` sonucu ham satır dizisi
  - `serverItems` — CartItem[] dizisi, serverRows'dan map ile dönüştürülmüş, her eleman `row.item.product_id`, `row.product`, `row.item.quantity` kullanır
  - `merged` — birleştirilmiş CartItem[], stratejiye göre server, local veya mergeItems sonucu
  - `priceInfoList` — `Promise.all` ile hesaplanan fiyat bilgisi dizisi, her eleman `{ _productId, unitPrice }`
  - `info` — `getEffectivePriceInfo(it.product)` sonucu `{ unitPrice, priceListId }` nesnesi
  - `unitMap` — Map<string, number | undefined>, _productId → unitPrice eşlemesi
  - `mergedWithPrices` — merged dizisinin unitPrice alanları güncellenmiş hali
- **Dönüş**: yok (yan etki: setItems, setServerCartId, localStorage ve Supabase upsert operations)

---

### [N6_NASIL] AST Pointer: src/contexts/CartProvider.tsx::map (serverRows → serverItems)
- **params**: `(row)` — supabase'den gelen { item: { product_id, quantity }, product: Product } yapısındaki tek satır
- **ic_degiskenler**:
  - `row.item.product_id` — sunucudaki ürün ID'si, CartItem.id olarak kullanılır
  - `row.product` — tam Product nesnesi, CartItem.product olarak kullanılır
  - `row.item.quantity` — sepetteki miktar, CartItem.quantity olarak kullanılır
- **Dönüş**: `{ id: row.item.product_id, product: row.product, quantity: row.item.quantity }` → `CartItem`

---

### [N7_NASIL] AST Pointer: src/contexts/CartProvider.tsx::async (it) => { ... } (price upsert per item)
- **params**: `(it)` — CartItem, fiyat bilgisi hesaplanacak ve sunucuya upsert edilecek sepat öğesi
- **ic_degiskenler**:
  - `info` — `getEffectivePriceInfo(it.product)` sonucu `{ unitPrice: number, priceListId?: string }`
  - `e` — catch bloğundaki hata nesnesi
- **Dönüş**: `{ _productId: it.product.id, unitPrice: info.unitPrice }` veya hata durumunda `{ _productId: it.product.id, unitPrice: undefined }`

---

### [N8_NASIL] AST Pointer: src/contexts/CartProvider.tsx::logoutCleanup (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: user null ise CART_OWNER_KEY'i kaldırır, setServerCartId(null) çağırır)

---

### [N9_NASIL] AST Pointer: src/contexts/CartProvider.tsx::crossTabSync (useEffect callback)
- **params**: (yok)
- **ic_degiskenler**:
  - `onStorage` — StorageEvent handler fonksiyonu, cross-tab sepet senkronizasyonunu yönetir
- **Dönüş**: cleanup fonksiyonu → `() => window.removeEventListener('storage', onStorage)` (yan etki: storage event listener ekler)

---

### [N10_NASIL] AST Pointer: src/contexts/CartProvider.tsx::onStorage (inner function)
- **params**: `(e: StorageEvent)` — tarayıcı storage event'i
- **ic_degiskenler**:
  - `owner` — localStorage'dan okunan CART_OWNER_KEY, mevcut sepat sahibinin user.id'si
  - `vStr` — localStorage'dan okunan CART_VERSION_KEY string'i, varsayılan '0'
  - `v` — vStr'in parseInt ile parse edilmiş numeric versiyonu
  - `raw` — localStorage'dan okunan CART_LOCAL_STORAGE_KEY JSON string'i
  - `next` — JSON.parse(raw) sonucu CartItem[] dizisi
- **Dönüş**: yok (yan etki: versiyon güncel ise setItems ile local sepatı günceller)

---

### [N11_NASIL] AST Pointer: src/contexts/CartProvider.tsx::addToCart
- **params**: `(product: Product, quantity = 1)` — eklenecek ürün ve miktar (varsayılan 1)
- **ic_degiskenler**:
  - `currentItems` — setItems updater callback'inin mevcut state parametresi, mevcut CartItem[] listesi
  - `existingItem` — currentItems.find ile bulunan, aynı product.id'ye sahip mevcut sepat öğesi (varsa)
  - `serverCartId` — context'ten gelen sunucu sepat ID'si (closure), server sync için kullanılır
  - `items` — context'ten gelen mevcut sepat state'i (closure), server upsert miktar hesabında kullanılır
  - `info` — getEffectivePriceInfo sonucu, { unitPrice, priceListId }
  - `curr` — setItems updater callback parametresi, unitPrice güncellemesi için
- **Dönüş**: yok (yan etki: setItems ile local state günceller, sunucuya upsert gönderir, CustomEvent ve toast tetikler)

---

### [N12_NASIL] AST Pointer: src/contexts/CartProvider.tsx::updater (addToCart inner — currentItems =>)
- **params**: `(currentItems)` — mevcut CartItem[] state'i
- **ic_degiskenler**:
  - `existingItem` — currentItems.find ile bulunan, aynı product.id'ye sahip sepat öğesi
- **Dönüş**: Güncellenmiş CartItem[] — mevcut ürün varsa quantity artırılır, yoksa yeni öğe eklenir

---

### [N13_NASIL] AST Pointer: src/contexts/CartProvider.tsx::dynamicImportCallback (addToCart — ({ getEffectivePriceInfo, upsertCartItem }) =>)
- **params**: `({ getEffectivePriceInfo, upsertCartItem })` — dynamic import ile yüklenen Supabase fonksiyonları
- **ic_degiskenler**:
  - `info` — `getEffectivePriceInfo(product)` promise sonucu `{ unitPrice: number, priceListId?: string }`
  - `err` — catch bloğundaki hata nesnesi
- **Dönüş**: void (yan etki: upsertCartItem ile sunucuya yazar, setItems ile local unitPrice günceller)

---

### [N14_NASIL] AST Pointer: src/contexts/CartProvider.tsx::removeFromCart
- **params**: `(_productId: string)` — sepetteki kaldırılacak ürünün ID'si
- **ic_degiskenler**:
  - `currentItems` — setItems updater callback parametresi, mevcut CartItem[] listesi
  - `item` — currentItems.find ile bulunan, kaldırılacak sepat öğesi (toast mesajı için)
  - `serverCartId` — closure'dan gelen sunucu sepat ID'si
- **Dönüş**: yok (yan etki: setItems ile item'ı filtreler, soner toast gösterir, sunucudan kaldırır)

---

### [N15_NASIL] AST Pointer: src/contexts/CartProvider.tsx::dynamicImportCallback (removeFromCart — ({ removeCartItem }) =>)
- **params**: `({ removeCartItem })` — dynamic import ile yüklenen Supabase kaldırma fonksiyonu
- **ic_degiskenler**: (yok)
- **Dönüş**: `removeCartItem(serverCartId, _productId)` promise'i

---

### [N16_NASIL] AST Pointer: src/contexts/CartProvider.tsx::updateQuantity
- **params**: `(_productId: string, quantity: number)` — güncellenecek ürün ID'si ve yeni miktar
- **ic_degiskenler**:
  - `currentItems` — setItems updater callback parametresi, mevcut CartItem[] listesi
  - `product` — items.find ile bulunan, _productId'ye karşılık gelen Product nesnesi (sunucu sync için)
  - `serverCartId` — closure'dan gelen sunucu sepat ID'si
  - `items` — closure'dan gelen mevcut sepat state'i, product araması için kullanılır
  - `info` — getEffectivePriceInfo sonucu `{ unitPrice, priceListId }`
  - `curr` — setItems updater callback parametresi, unitPrice güncellemesi için
- **Dönüş**: yok (yan etki: quantity <= 0 ise removeFromCart çağırır, aksi halde setItems ile günceller ve sunucuya upsert gönderir)

---

### [N17_NASIL] AST Pointer: src/contexts/CartProvider.tsx::updater (updateQuantity inner — currentItems =>)
- **params**: `(currentItems)` — mevcut CartItem[] state'i
- **ic_degiskenler**: (yok)
- **Dönüş**: Güncellenmiş CartItem[] — _productId eşleşen öğenin quantity'si yeni değere set edilir

---

### [N18_NASIL] AST Pointer: src/contexts/CartProvider.tsx::clearCart
- **params**: `(opts?: { silent?: boolean })` — opsiyonel, silent=true ise toast gösterilmez
- **ic_degiskenler**:
  - `e` — catch bloğundaki hata nesnesi (localStorage temizleme sırasında)
  - `serverCartId` — closure'dan gelen sunucu sepat ID'si
- **Dönüş**: yok (yan etki: setItems([]), localStorage temizler, StorageEvent dispatch eder, sunucu sepatını temizler)

---

### [N19_NASIL] AST Pointer: src/contexts/CartProvider.tsx::dynamicImportCallback (clearCart — ({ clearCartItems }) =>)
- **params**: `({ clearCartItems })` — dynamic import ile yüklenen Supabase temizleme fonksiyonu
- **ic_degiskenler**: (yok)
- **Dönüş**: `clearCartItems(serverCartId)` promise'i

---

### [N20_NASIL] AST Pointer: src/contexts/CartProvider.tsx::getCartTotal
- **params**: (yok)
- **ic_degiskenler**:
  - `total` — reduce accumulator'ı, kümülatif toplam tutar
  - `item` — reduce callback'indeki tekil CartItem
  - `unit` — birim fiyat, item.unitPrice number ise onu kullanır, aksi halde item.product.price'ı fallback olarak alır
- **Dönüş**: `number` — sepatın toplam tutarı (birim fiyat × miktar toplamı)

---

### [N21_NASIL] AST Pointer: src/contexts/CartProvider.tsx::getCartCount
- **params**: (yok)
- **ic_degiskenler**:
  - `count` — reduce accumulator'ı, kümülatif ürün adedi
  - `item` — reduce callback'indeki tekil CartItem
- **Dönüş**: `number` — sepetteki toplam ürün adedi (miktarların toplamı)

---

### [N22_NASIL] AST Pointer: src/contexts/CartProvider.tsx::applyServerPricing
- **params**: `(serverItems: { product_id: string, unit_price: number }[])` — sunucudan gelen ürün ID + birim fiyat listesi
- **ic_degiskenler**:
  - `to2` — helper fonksiyon, sayıyı 2 ondalık basamağa yuvarlar
  - `nearlyEqual` — helper fonksiyon, iki sayının 0.01 toleransla eşit olup olmadığını kontrol eder
  - `pmap` — Map<string, number>, product_id → birim fiyat eşlemesi (normalize edilmiş 2 ondalık)
  - `pid` — String(it.product_id), normalize edilmiş ürün ID'si
  - `up` — Number(it.unit_price), numeric birim fiyat
  - `changedIds` — Set<string>, fiyat değişikliği olan ürün ID'leri
  - `it` — döngüdeki tekil serverItems veya items elemanı
  - `nextUnit` — pmap'ten gelen yeni birim fiyat (number | undefined)
  - `currUnit` — mevcut birim fiyat, item.unitPrice veya fallback item.product.price
  - `curr` — setItems updater callback parametresi
  - `tasks` — Promise<unknown>[] dizisi, değişen kalemler için upsert promise'leri
  - `i` — for döngüsü indeksi
  - `up` — pmap'ten gelen updated birim fiyat
- **Dönüş**: yok (yan etki: setItems ile local sepat günceller, değişen kalemleri sunucuya upsert eder)

---

### [N23_NASIL] AST Pointer: src/contexts/CartProvider.tsx::dynamicImportCallback (applyServerPricing — ({ upsertCartItem }) =>)
- **params**: `({ upsertCartItem })` — dynamic import ile yüklenen Supabase upsert fonksiyonu
- **ic_degiskenler**:
  - `tasks` — Promise<unknown>[] dizisi, her biri bir upsertCartItem promise'i
  - `i` — for döngüsü indeksi
  - `it` — items[i], sepetteki tekil CartItem
  - `up` — pmap.get(it.product.id) ile elde edilen yeni birim fiyat
  - `e` — catch bloğundaki hata nesnesi
- **Dönüş**: void (Promise.allSettled ile arka planda çalışır)

---

### [N24_NASIL] AST Pointer: src/contexts/CartProvider.tsx::contextValue (useMemo callback)
- **params**: (yok)
- **ic_degiskenler**: (yok — sadece closure'daki değerleri paketler)
- **Dönüş**: `{ items, syncing, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, applyServerPricing }` — CartContext tipinde sepat sağlayıcı değeri

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