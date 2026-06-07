---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx
skeleton_hash: 99a1da87ec776a41
entity_hashes:
  func:CartProvider: 2c15a5ccde773496
  overview: a21c79a8976fc711
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-07T13:58:20Z
---

## Genel Bakış
Bu modül, alışveriş sepeti durumını ve ilgili işlemleri uygulama genelinde yönetmek için merkezi bir React Context sağlayıcısıdır. Tüm alt bileşenlerin sepet verilerine ve bunlarla ilişkili fonksiyonlara erişmesini mümkün kılar.

## Fonksiyon Grupları
### Ana Context Sağlayıcı Bileşeni
Modülün temel ve tek bileşenidir; sepet verilerini, işlevselliklerini ve durum yönetimi mantığını uygulama ağacının alt kısımlarına sağlamak üzere createContext ile context oluşturur.
- CartProvider

---

## AXIOMS – Mimari Varsayımlar

Bu modül, alışveriş sepeti durumunu uygulama genelinde paylaşan bir React Context Provider bileşenidir.

[Aksiyom 1]: Eğer `children` prop'u sağlanmazsa veya `undefined` olursa, provider hiçbir alt bileşini sarmayacak ve context'e erişim sağlanamayacaktır.

[Aksiyom 2]: Eğer `CART_SERVER_SYNC` sabit değeri `true` ise, sepet verileri sunucu ile senkronize edilmelidir; sunucu bağlantısı kopuk veya API endpoint'i erişilemez durumdaysa, senkronizasyon başarısız olur ve yerel sepet durumuyla devam edilir.

[Aksiyom 3]: Eğer `CART_SERVER_SYNC` sabit değeri `false` ise, sunucu senkronizasyonu gerçekleştirilmez; sepet verileri yalnızca istemci tarafında (client-side) tutulur.

[Aksiyom 4]: Eğer React component tree içinde bu provider üst seviyede konumlandırılmazsa, alt bileşenlerin `useCart` veya benzeri hook'lar aracılığıyla sepet context'ine erişimi başarısız olur.

---

## FONKSİYON DETAYLARI

### CartProvider
**Ne yapar**: Sepet durumunu (state) ve ilgili tüm işlemleri (ekleme, çıkarma, miktar güncelleme, temizleme) yöneten React Context Provider bileşenidir. Kullanıcının oturum durumuna göre yerel depolama (localStorage) ve sunucu tabanlı veritabanı ile senkronizasyon sağlar.

**Nasıl yapar**: Bileşen, çeşitli `useState` ve `useEffect` hook'ları kullanarak sepet verisini tutar. Başlangıçta `localStorage`'dan sepeti yükler. Kullanıcı giriş yaptığında veya çıkış yaptığında sunucu ile senkronizasyon (merge) işlemini tetikler. `useCallback` ile sarılmış fonksiyonları (addToCart vb.) ve `useMemo` ile hesaplanmış değerleri (toplam tutar, adet) alt bileşenlere sağlar. Sepet verisindeki her değişiklikte hem yerel depoyu hem de (kullanıcı giriş yapmışsa) sunucudaki ilgili kaydı günceller.

**Parametreler**:
- children: ReactNode — Provider tarafından sarılacak olan alt bileşenler.

**Dönüş**: CartContext.Provider bileşeni, `children`'ı sararak ve `value` prop'u ile sepet değerlerini ve fonksiyonlarını sağlayarak döner.

---

## SABİTLER
- **CART_SERVER_SYNC** [env-backed] (binary_expression) — `(process.env.NEXT_PUBLIC_CART_SERVER_SYNC ?? 'true') === 'true'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::useEffect_load_cart
- **params**: () — parametresiz
- **ic_degiskenler**:
  - `schema` — localStorage'dan okunan mevcut CART_SCHEMA_KEY değeri, mevcut şema ile karşılaştırma yapar
  - `lastStatus` — localStorage'daki 'vh_last_order_status' değeri, son sipariş durumunu tutar
  - `savedCart` — localStorage'dan okunanserialized sepet verisi (JSON string)
  - `savedVer` — localStorage'dan okunan versiyon number stringi
  - `v` — savedVer'in parseInt ile number'a çevirilmiş hali
- **Dönüş**: void — yan etki: `setItems` çağırarak state'i günceller

---

### [N2_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::useEffect_save_cart
- **params**: () — parametresiz
- **ic_degiskenler**:
  - `v` — Date.now() ile elde edilen timestamp, yerel versiyon olarak kaydedilir
- **Dönüş**: void — yan etki: localStorage'a items ve versiyon yazar, `localVersionRef.current` güncellenir

---

### [N3_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::mergeItems
- **params**: (local: CartItem[], server: CartItem[], isGuestCart: boolean)
- **ic_degiskenler**:
  - `map` — Merge işleminde kullanılan Map<string, CartItem>, product.id key'li benzersiz ürün haritası
- **Dönüş**: CartItem[] — birleştirilmiş benzersiz item listesi

---

### [N4_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::useEffect_syncWithServer
- **params**: () — parametresiz (useEffect callback)
- **ic_degiskenler**:
  - `cancelled` — async işlem iptal flag'i, cleanup'ta true yapılır
  - `syncWithServer` — iç tanımlı async fonksiyon, sunucu senkronizasyonunu yürütür
- **Dönüş**: cleanup fonksiyonu () => { cancelled = true }

---

### [N5_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::syncWithServer
- **params**: () — parametresiz
- **ic_degiskenler**:
  - `cancelled` — async iptal flag'i (dış scope'tan)
  - `cart` — getOrCreateShoppingCart sonucu dönen shopping cart nesnesi (id içerir)
  - `currentOwner` — localStorage'dan okunan CART_OWNER_KEY, kimin sepetini tuttuğunu gösterir
  - `isGuestCart` — misafir sepeti olup olmadığını belirleyen boolean
  - `discardLocalGuestCart` — yerel misafir sepetinin atılıp atılmayacağını belirler
  - `clearOnce` — 'vh_clear_server_cart_once' flag'inden okunan boolean, post-order temizlik bayrağı
  - `raw` — localStorage'dan okunan 'vh_pending_order' ham JSON string
  - `data` — JSON.parse ile elde edilen { orderId?: string } nesnesi
  - `oid` — data.orderId değerinin string karşılığı, sipariş ID'si
  - `ord` — Supabase'den sorgulanan venthub_orders satırı, status ve created_at içerir
  - `ordErr` — Supabase sorgu hatası
  - `serverRows` — listCartItemsWithProducts ile gelen ham satır dizisi
  - `serverItems` — serverRows'un map ile CartItem[] formatına dönüştürülmüş hali
  - `merged` — merge stratejisine göre oluşturulmuş nihai birleşik item listesi
  - `priceInfoList` — her merged item için Promise.all ile hesaplanan birim fiyat bilgi listesi
  - `unitMap` — _productId -> unitPrice eşlemesi yapan Map
  - `mergedWithPrices` — birim fiyatlar eklenmiş nihai merged item listesi
- **Dönüş**: void — yan etkiler: setItems, setServerCartId, setSyncing, localStorage, Supabase upsert

---

### [N6_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::row_map_callback
- **params**: (row) — Supabase'den dönen ham satır objesi
- **ic_degiskenler**: (yok — tek ifade)
- **Dönüş**: { id: row.item.product_id, product: row.product, quantity: row.item.quantity } — CartItem formatında nesne

---

### [N7_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::upsert_map_callback
- **params**: (it) — merged item listesindeki her CartItem
- **ic_degiskenler**:
  - `info` — getEffectivePriceInfo sonucu { unitPrice, priceListId } nesnesi
- **Dönüş**: { _productId: string, unitPrice: number | undefined } — fiyat bilgili item sonucu

---

### [N8_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::useEffect_logout_handler
- **params**: () — parametresiz (useEffect callback)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — yan etki: CART_OWNER_KEY silinir, setServerCartId(null) çağrılır

---

### [N9_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::useEffect_cross_tab_sync
- **params**: () — parametresiz (useEffect callback)
- **ic_degiskenler**:
  - `onStorage` — StorageEvent handler fonksiyonu, cross-tab senkronizasyonunu yönetir
- **Dönüş**: cleanup () => window.removeEventListener('storage', onStorage)

---

### [N10_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::onStorage
- **params**: (e: StorageEvent) — tarayıcı storage değişiklik olayı
- **ic_degiskenler**:
  - `owner` — localStorage'dan okunan CART_OWNER_KEY, sepet sahibi user ID
  - `vStr` — localStorage'dan okunan CART_VERSION_KEY string değeri
  - `v` — vStr'in parseInt ile number karşılığı, versiyon numarası
  - `raw` — localStorage'dan okunan CART_LOCAL_STORAGE_KEY ham JSON string
  - `next` — JSON.parse ile elde edilen parsed CartItem[] dizisi
- **Dönüş**: void — yan etki: setItems ile state güncellenir

---

### [N11_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::addToCart
- **params**: (product: Product, quantity = 1)
- **ic_degiskenler**: (yok — doğrudan setItems ve async işlemler)
- **Dönüş**: void — yan etkiler: setItems, Supabase upsert, CustomEvent dispatch, toast

---

### [N12_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::addToCart_setItems_callback
- **params**: (currentItems) — mevcut CartItem[] state'i
- **ic_degiskenler**:
  - `existingItem` — currentItems içinde product.id eşleşen mevcut item (varsa)
- **Dönüş**: CartItem[] — güncellenmiş item listesi (mevcut item varsa quantity artırılır, yoksa eklenir)

---

### [N13_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::addToCart_map_callback
- **params**: (item) — mevcut items listesindeki her CartItem
- **ic_degiskenler**: (yok — tek ifade)
- **Dönüş**: CartItem — product.id eşleşen item'ın quantity'si artırılmış yeni nesne, eşleşmiyorsa aynı item

---

### [N14_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::addToCart_promise_callback
- **params**: ([{ getEffectivePriceInfo }, { upsertCartItem }]) — dinamik import edilmiş modül destructuring'i
- **ic_degiskenler**: (yok — promise chain başlatır)
- **Dönüş**: Promise<void>

---

### [N15_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::addToCart_info_callback
- **params**: (info) — getEffectivePriceInfo sonucu { unitPrice, priceListId } nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: void — yan etki: upsertCartItem ve setItems çağrılır

---

### [N16_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::removeFromCart
- **params**: (_productId: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — yan etkiler: setItems, removeCartItem, toast

---

### [N17_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::removeFromCart_setItems_callback
- **params**: (currentItems) — mevcut CartItem[] state'i
- **ic_degiskenler**:
  - `item` — _productId eşleşen mevcut item (toast gösterimi için kullanılır)
- **Dönüş**: CartItem[] — _productId eşleşen item filtrelenmiş liste

---

### [N18_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::removeFromCart_import_callback
- **params**: ({ removeCartItem }) — dinamik import edilmiş modül destructuring'i
- **ic_degiskenler**: (yok)
- **Dönüş**: Promise<void> — removeCartItem sonucu

---

### [N19_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::updateQuantity
- **params**: (_productId: string, quantity: number)
- **ic_degiskenler**:
  - `product` — items listesinde _productId eşleşen item'ın product nesnesi (server sync için kullanılır)
- **Dönüş**: void — quantity <= 0 ise removeFromCart çağrılır, sonst setItems ve server upsert

---

### [N20_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::updateQuantity_setItems_callback
- **params**: (currentItems) — mevcut CartItem[] state'i
- **ic_degiskenler**: (yok — inline map)
- **Dönüş**: CartItem[] — _productId eşleşen item'ın quantity'si güncellenmiş liste

---

### [N21_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::updateQuantity_map_callback
- **params**: (item) — mevcut items listesindeki her CartItem
- **ic_degiskenler**: (yok — tek ifade)
- **Dönüş**: CartItem — _productId eşleşiyorsa quantity güncellenmiş yeni nesne, eşleşmiyorsa aynı item

---

### [N22_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::updateQuantity_promise_callback
- **params**: ([{ getEffectivePriceInfo }, { upsertCartItem }]) — dinamik import edilmiş modül destructuring'i
- **ic_degiskenler**: (yok — promise chain başlatır)
- **Dönüş**: Promise<void>

---

### [N23_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::updateQuantity_info_callback
- **params**: (info) — getEffectivePriceInfo sonucu { unitPrice, priceListId }
- **ic_degiskenler**: (yok)
- **Dönüş**: void — yan etki: upsertCartItem ve setItems çağrılır

---

### [N24_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::clearCart
- **params**: (opts?: { silent?: boolean })
- **ic_degiskenler**: (yok)
- **Dönüş**: void — yan etkiler: setItems([]), localStorage temizliği, StorageEvent dispatch, clearCartItems, toast

---

### [N25_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::clearCart_import_callback
- **params**: ({ clearCartItems }) — dinamik import edilmiş modül destructuring'i
- **ic_degiskenler**: (yok)
- **Dönüş**: Promise<void> — clearCartItems sonucu

---

### [N26_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::getCartTotal
- **params**: () — parametresiz
- **ic_degiskenler**: (yok)
- **Dönüş**: number — sepetin toplam tutarı (birim fiyat × quantity toplamı)

---

### [N27_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::getCartTotal_reduce_callback
- **params**: (total, item) — accumulator ve mevcut CartItem
- **ic_degiskenler**:
  - `unit` — item.unitPrice number ise onu, değilse item.product.price'ı fallback olarak kullanan birim fiyat
- **Dönüş**: number — total + unit * item.quantity

---

### [N28_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::getCartCount
- **params**: () — parametresiz
- **ic_degiskenler**: (yok)
- **Dönüş**: number — sepetteki toplam ürün adedi (quantity toplamı)

---

### [N29_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::getCartCount_reduce_callback
- **params**: (count, item) — accumulator ve mevcut CartItem
- **ic_degiskenler**: (yok — tek ifade)
- **Dönüş**: number — count + item.quantity

---

### [N30_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::applyServerPricing
- **params**: (serverItems: { product_id: string, unit_price: number }[])
- **ic_degiskenler**:
  - `to2` — bir sayıyı 2 ondalık basamağa yuvarlayan yardımcı fonksiyon
  - `nearlyEqual` — iki sayının 0.01 toleransla eşit olup olmadığını kontrol eden fonksiyon
  - `pmap` — product_id -> unit_price eşlemesi yapan Map, normalize edilmiş 2 ondalıklı fiyatlar
  - `changedIds` — gerçekten fiyat değişen itemların product_id'lerini tutan Set
- **Dönüş**: void — yan etkiler: setItems, upsertCartItem (sunucuya değişiklik yansıtır)

---

### [N31_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::applyServerPricing_setItems_callback
- **params**: (curr) — mevcut CartItem[] state'i
- **ic_degiskenler**: (yok — inline map)
- **Dönüş**: CartItem[] — unitPrice'ları güncellenmiş item listesi

---

### [N32_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::applyServerPricing_map_callback
- **params**: (it) — mevcut items listesindeki her CartItem
- **ic_degiskenler**:
  - `nextUnit` — pmap'ten gelen yeni birim fiyat veya null/undefined
  - `currUnit` — item'ın mevcut birim fiyat değeri (unitPrice veya product.price fallback)
- **Dönüş**: CartItem — fiyat değiştiyse unitPrice güncellenmiş yeni nesne, aynıysa mevcut item

---

### [N33_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::applyServerPricing_import_callback
- **params**: ({ upsertCartItem }) — dinamik import edilmiş modül destructuring'i
- **ic_degiskenler**:
  - `tasks` — Promise<unknown>[] dizisi, her changed item için upsert promise'ları tutar
- **Dönüş**: void — yan etki: Promise.allSettled ile toplu upsert

---

### [N34_NASIL] AST Pointer: `src/contexts/CartProvider.tsx`::CartProvider_context_value
- **params**: () — parametresiz
- **ic_degiskenler**: (yok — doğrudan nesne literal)
- **Dönüş**: CartContextValue — { items, syncing, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, applyServerPricing }

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