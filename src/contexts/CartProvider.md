---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx
skeleton_hash: b6505b7c5c0605ec
entity_hashes:
  func:CartProvider: 2c15a5ccde773496
  overview: 37930ba7d9f73804
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu modül, alışveriş sepeti durumunu ve ilgili tüm işlemleri (ürün ekleme, çıkarma, miktar güncelleme, temizleme) uygulama genelinde yönetmek için merkezi bir React Context Provider bileşeni sunar. Sepet verilerinin yerel depolama ile kalıcılığını ve opsiyonel olarak sunucu senkronizasyonunu sağlar.

## Fonksiyon Grupları
### Context Sağlayıcı
Modülün temel ve tek bileşeni olarak, sepet durumunu ve ilgili tüm işlevsellikleri React component tree'sinin alt kısımlarına sağlar. Bu bileşen olmadan alt bileşenler sepet verilerine erişemez.
- CartProvider

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aksiyon tanımlanamamaktır. Fonksiyon gövdesi verilmemiştir; sadece fonksiyon imzası ve sabit tanımı mevcuttur. Mimari varsayımlar yalnızca fonksiyon gövdesindeki mantıksal akış ve koşullardan üretilebilir.

---

## FONKSİYON DETAYLARI

### CartProvider
**Ne yapar**: Sepet durumunu (state) ve ilgili tüm işlemleri (ekleme, çıkarma, miktar güncelleme, temizleme) yöneten React Context Provider bileşenidir. Kullanıcının oturum durumuna göre yerel depolama (localStorage) ve sunucu tabanlı veritabanı ile senkronizasyon sağlar.

**Nasıl yapar**: Bileşen, çeşitli `useState` ve `useEffect` hook'ları kullanarak sepet verisini tutar. Başlangıçta `localStorage`'dan sepeti yükler. Kullanıcı giriş yaptığında veya çıkış yaptığında sunucu ile senkronizasyon (merge) işlemini tetikler. `useCallback` ile sarılmış fonksiyonları (addToCart vb.) ve `useMemo` ile hesaplanmış değerleri (toplam tutar, adet) alt bileşenlere sağlar. Sepet verisindeki her değişiklikte hem yerel depoyu hem de (kullanıcı giriş yapmışsa) sunucudaki ilgili kaydı günceller.

**Parametreler**:
- children: ReactNode — Provider tarafından sarılacak olan alt bileşenler.

**Dönüş**: CartContext.Provider bileşeni, `children`'ı sararak ve `value` prop'u ile sepet değerlerini ve fonksiyonlarını sağlayarak döner.

---

## İTHALATLAR (IMPORTS)
- import: ../contexts/CartContext::CartContext
- import: ../hooks/useAuth::useAuth
- import: @/providers/SupabaseProvider::useSupabaseClient
- import: @/types/cart::type { CartItem }
- import: @/types/ui-models::type { Product }
- import: react::React
- import: react::ReactNode
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: react::useState

---

## SABİTLER
- **CART_SERVER_SYNC** [env-backed] (binary_expression) — `(process.env.NEXT_PUBLIC_CART_SERVER_SYNC ?? 'true') === 'true'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CartProvider.tsx::(useEffect_load_cart)
- **params**: ()
- **ic_degiskenler**:
  - `schema` — `localStorage.getItem(CART_SCHEMA_KEY)` çağrısının sonucu; yerel depolama şeması anahtarının değeri
  - `lastStatus` — `localStorage.getItem('vh_last_order_status')` çağrısının sonucu; önceki sipariş durumunu tutar
  - `savedCart` — `localStorage.getItem(CART_LOCAL_STORAGE_KEY)` çağrısının sonucu; yerel depolamadan okunan sepet JSON'u
  - `savedVer` — `localStorage.getItem(CART_VERSION_KEY)` çağrısının sonucu; yerel versiyon numarası string olarak
  - `v` — `parseInt(savedVer, 10)` ile elde edilen tamsayı versiyon değeri
- **Dönüş**: yok (yan etki: `setItems` çağırır, localStorage'ı temizler)

### [N2_NASIL] AST Pointer: CartProvider.tsx::(useEffect_save_cart)
- **params**: ()
- **ic_degiskenler**:
  - `v` — `Date.now()` ile elde edilen Unix timestamp; yerel versiyon zaman damgası olarak kullanılır
- **Dönüş**: yok (yan etki: localStorage'a items ve versiyon yazar)

### [N3_NASIL] AST Pointer: CartProvider.tsx::mergeItems
- **params**: (local: CartItem[], server: CartItem[], isGuestCart: boolean)
- **ic_degiskenler**:
  - `map` — `Map<string, CartItem>` türünde ürün ID'lerini CartItem'a eşleyen harita; birleştirilmiş sepet öğelerini tutar
- **Dönüş**: `Array.from(map.values())` — birleştirilmiş CartItem dizisi

### [N4_NASIL] AST Pointer: CartProvider.tsx::(useEffect_sync_with_server)
- **params**: ()
- **ic_degiskenler**:
  - `cancelled` — boolean bayrak; cleanup fonksiyonunda `true` yapılır, async işlemin iptal edildiğini belirtir
- **Dönüş**: cleanup fonksiyonu `() => { cancelled = true }` döner (yan etki: `syncWithServer` çağırır)

### [N5_NASIL] AST Pointer: CartProvider.tsx::syncWithServer
- **params**: ()
- **ic_degiskenler**:
  - `cart` — `getOrCreateShoppingCart(supabase, user.id)` çağrısının sonucu; sunucudaki alışveriş sepeti nesnesi, `cart.id` içerir
  - `currentOwner` — `localStorage.getItem(CART_OWNER_KEY)` çağrısının sonucu; sepet sahibinin user ID'si
  - `isGuestCart` — boolean; mevcut sahibin user.id ile eşleşip eşleşmediğine göre misafir sepeti olup olmadığını belirler
  - `discardLocalGuestCart` — boolean; misafir sepetinin atılıp atılmayacağını belirler
  - `clearOnce` — boolean; `localStorage.getItem('vh_clear_server_cart_once') === '1'` sonucu, sipariş sonrası temizlik bayrağı
  - `raw` — `localStorage.getItem('vh_pending_order')` çağrısının sonucu; bekleyen sipariş JSON string'i
  - `data` — `JSON.parse(raw)` sonucu; `{ orderId?: string }`形状inde bekleyen sipariş verisi
  - `oid` — `data?.orderId` ifadesinden elde edilen sipariş ID string'i
  - `ord` — `supabase.from('venthub_orders').select(...).maybeSingle()` sonucu `data` alanı; sipariş kaydı nesnesi
  - `ordErr` — Supabase sorgusundan dönen hata nesnesi
  - `serverRows` — `listCartItemsWithProducts(supabase, cart.id)` çağrısının sonucu; sunucudaki sepet satırları dizisi
  - `serverItems` — `serverRows.map(...)` ile dönüştürülmüş `CartItem[]` dizisi
  - `merged` — birleştirme stratejisine göre belirlenmiş `CartItem[]` dizisi
  - `priceInfoList` — `Promise.all(merged.map(...))` sonucu; her ürün için `{ _productId, unitPrice }` nesneleri dizisi
  - `unitMap` — `Map<string, number | undefined>`; ürün ID'sinden birim fiyata eşleme haritası
  - `mergedWithPrices` — `merged.map(...)` ile birim fiyatların eklenmesiyle oluşturulmuş nihai `CartItem[]` dizisi
  - `v` — `Date.now()` ile elde edilen timestamp; yerel versiyon zaman damgası
- **Dönüş**: yok (yan etki: `setItems`, `setServerCartId`, `setSyncing` çağırır)

### [N6_NASIL] AST Pointer: CartProvider.tsx::(serverRows_map_callback)
- **params**: (row)
- **ic_degiskenler**:
  - `row.item.product_id` — sunucudaki sepet satırının ürün ID'si
  - `row.product` — sunucudaki sepet satırının ürün nesnesi
  - `row.item.quantity` — sunucudaki sepet satırının miktarı
- **Dönüş**: `{ id: row.item.product_id, product: row.product, quantity: row.item.quantity }` — CartItem nesnesi

### [N7_NASIL] AST Pointer: CartProvider.tsx::(price_computation_callback)
- **params**: (it: CartItem)
- **ic_degiskenler**:
  - `info` — `getEffectivePriceInfo(supabase, it.product)` çağrısının sonucu; `unitPrice` ve `priceListId` içeren fiyat bilgisi nesnesi
- **Dönüş**: `{ _productId: it.product.id, unitPrice: info.unitPrice }` veya hata durumunda `{ _productId: it.product.id, unitPrice: undefined }`

### [N8_NASIL] AST Pointer: CartProvider.tsx::(useEffect_logout_handler)
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `localStorage.removeItem(CART_OWNER_KEY)`, `setServerCartId(null)` çağırır)

### [N9_NASIL] AST Pointer: CartProvider.tsx::(useEffect_storage_listener)
- **params**: ()
- **ic_degiskenler**:
  - `onStorage` — `StorageEvent` parametreli iç fonksiyon; tarayıcı sepet depolama olaylarını dinler
- **Dönüş**: cleanup fonksiyonu `() => window.removeEventListener('storage', onStorage)`

### [N10_NASIL] AST Pointer: CartProvider.tsx::onStorage
- **params**: (e: StorageEvent)
- **ic_degiskenler**:
  - `owner` — `localStorage.getItem(CART_OWNER_KEY)` çağrısının sonucu; mevcut sepet sahibi ID'si
  - `vStr` — `localStorage.getItem(CART_VERSION_KEY)` çağrısının sonucu veya `'0'` varsayılanı; versiyon string'i
  - `v` — `parseInt(vStr, 10) || 0` ile elde edilen tamsayı versiyon değeri
  - `raw` — `localStorage.getItem(CART_LOCAL_STORAGE_KEY)` çağrısının sonucu; ham sepet JSON string'i
  - `next` — `JSON.parse(raw)` sonucu; parsed sepet dizisi
- **Dönüş**: yok (yan etki: `setItems`, `localVersionRef.current` günceller)

### [N11_NASIL] AST Pointer: CartProvider.tsx::addToCart
- **params**: (product: Product, quantity = 1)
- **ic_degiskenler**: (yok — `items` dışarıdan closure ile gelir)
- **Dönüş**: yok (yan etki: `setItems` çağırır, `Promise.all` ile sunucu senkronizasyonu başlatır, `CustomEvent` fırlatır)

### [N12_NASIL] AST Pointer: CartProvider.tsx::(addToCart_setItems_callback)
- **params**: (currentItems: CartItem[])
- **ic_degiskenler**:
  - `existingItem` — `currentItems.find(...)` ile bulunan, ürün ID'si eşleşen mevcut sepet öğesi veya `undefined`
- **Dönüş**: güncellenmiş `CartItem[]` dizisi

### [N13_NASIL] AST Pointer: CartProvider.tsx::(addToCart_map_callback)
- **params**: (item)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ ...item, quantity: item.quantity + quantity }` veya aynen `item`

### [N14_NASIL] AST Pointer: CartProvider.tsx::(addToCart_promise_then_callback)
- **params**: ([{ getEffectivePriceInfo }, { upsertCartItem }])
- **ic_degiskenler**: (yok — params destructured)
- **Dönüş**: yok (yan etki: `getEffectivePriceInfo` ve `upsertCartItem` çağırır)

### [N15_NASIL] AST Pointer: CartProvider.tsx::(addToCart_info_then_callback)
- **params**: (info)
- **ic_degiskenler**: (yok — `info.unitPrice` ve `info.priceListId` params içinde doğrudan erişilir)
- **Dönüş**: yok (yan etki: `upsertCartItem`, `setItems` çağırır)

### [N16_NASIL] AST Pointer: CartProvider.tsx::removeFromCart
- **params**: (_productId: string)
- **ic_degiskenler**: (yok — `items` dışarıdan closure ile gelir)
- **Dönüş**: yok (yan etki: `setItems` çağırır, `Promise` ile sunucudan siler)

### [N17_NASIL] AST Pointer: CartProvider.tsx::(removeFromCart_setItems_callback)
- **params**: (currentItems: CartItem[])
- **ic_degiskenler**:
  - `item` — `currentItems.find(...)` ile bulunan, productId eşleşen sepet öğesi
- **Dönüş**: filtrelenmiş `CartItem[]` dizisi (element çıkarılmış)

### [N18_NASIL] AST Pointer: CartProvider.tsx::(removeFromCart_import_then_callback)
- **params**: ({ removeCartItem })
- **ic_degiskenler**: (yok)
- **Dönüş**: `removeCartItem(supabase, serverCartId, _productId)` Promise'i

### [N19_NASIL] AST Pointer: CartProvider.tsx::updateQuantity
- **params**: (_productId: string, quantity: number)
- **ic_degiskenler**:
  - `product` — `items.find(...)` ile bulunan, productId eşleşen sepet öğesinin `product` alanı
- **Dönüş**: yok (yan etki: `removeFromCart` veya `setItems` çağırır, `Promise.all` ile sunucu senkronizasyonu başlatır)

### [N20_NASIL] AST Pointer: CartProvider.tsx::(updateQuantity_setItems_callback)
- **params**: (currentItems: CartItem[])
- **ic_degiskenler**: (yok)
- **Dönüş**: map edilmiş `CartItem[]` dizisi

### [N21_NASIL] AST Pointer: CartProvider.tsx::(updateQuantity_map_callback)
- **params**: (item)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ ...item, quantity }` veya aynen `item`

### [N22_NASIL] AST Pointer: CartProvider.tsx::(updateQuantity_promise_then_callback)
- **params**: ([{ getEffectivePriceInfo }, { upsertCartItem }])
- **ic_degiskenler**: (yok — params destructured)
- **Dönüş**: yok (yan etki: `getEffectivePriceInfo` ve `upsertCartItem` çağırır)

### [N23_NASIL] AST Pointer: CartProvider.tsx::(updateQuantity_info_then_callback)
- **params**: (info)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `upsertCartItem`, `setItems` çağırır)

### [N24_NASIL] AST Pointer: CartProvider.tsx::clearCart
- **params**: (opts?: { silent?: boolean })
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `setItems([])`, localStorage temizler, `StorageEvent` fırlatır, `toast` gösterir, sunucuyu temizler)

### [N25_NASIL] AST Pointer: CartProvider.tsx::(clearCart_import_then_callback)
- **params**: ({ clearCartItems })
- **ic_degiskenler**: (yok)
- **Dönüş**: `clearCartItems(supabase, serverCartId)` Promise'i

### [N26_NASIL] AST Pointer: CartProvider.tsx::getCartTotal
- **params**: ()
- **ic_degiskenler**: (yok — `items` dışarıdan closure ile gelir)
- **Dönüş**: `number` — sepet toplam tutarı

### [N27_NASIL] AST Pointer: CartProvider.tsx::(getCartTotal_reduce_callback)
- **params**: (total: number, item: CartItem)
- **ic_degiskenler**:
  - `unit` — birim fiyat; `item.unitPrice` sayıysa onu, değilse `item.product.price`'ı `Number` ile dönüştürür
- **Dönüş**: `total + unit * item.quantity` — kümülatif toplam

### [N28_NASIL] AST Pointer: CartProvider.tsx::getCartCount
- **params**: ()
- **ic_degiskenler**: (yok — `items` dışarıdan closure ile gelir)
- **Dönüş**: `number` — sepetteki toplam ürün adedi

### [N29_NASIL] AST Pointer: CartProvider.tsx::(getCartCount_reduce_callback)
- **params**: (total: number, item: CartItem)
- **ic_degiskenler**: (yok)
- **Dönüş**: `count + item.quantity` — kümülatif adet toplamı

### [N30_NASIL] AST Pointer: CartProvider.tsx::applyServerPricing
- **params**: (serverItems: { product_id: string, unit_price: number }[])
- **ic_degiskenler**:
  - `to2` — `(n: number) => Number(Number(n).toFixed(2))` fonksiyonu; sayıyı 2 ondalık basamağa yuvarlar
  - `nearlyEqual` — `(a: number, b: number) => Math.abs(to2(a) - to2(b)) <= 0.01` fonksiyonu; iki sayının yaklaşık eşitliğini kontrol eder
  - `pmap` — `Map<string, number>`; ürün ID'sinden 2 ondalıklı birim fiyatına eşleme haritası
  - `changedIds` — `Set<string>`; fiyatı gerçekten değişen ürün ID'lerinin kümesi
- **Dönüş**: yok (yan etki: `setItems` çağırır, sunucuya upsert yapar)

### [N31_NASIL] AST Pointer: CartProvider.tsx::(applyServerPricing_setItems_callback)
- **params**: (curr: CartItem[])
- **ic_degiskenler**: (yok)
- **Dönüş**: map edilmiş `CartItem[]` dizisi

### [N32_NASIL] AST Pointer: CartProvider.tsx::(applyServerPricing_item_map_callback)
- **params**: (it: CartItem)
- **ic_degiskenler**:
  - `nextUnit` — `pmap.get(it.product.id)` ile elde edilen sunucu birim fiyatı veya `undefined`
  - `currUnit` — mevcut birim fiyat; `it.unitPrice` sayıysa onu, değilse `it.product.price`'ı `Number` ile dönüştürür
- **Dönüş**: güncellenmiş `CartItem` nesnesi veya aynen `it`

### [N33_NASIL] AST Pointer: CartProvider.tsx::(applyServerPricing_import_then_callback)
- **params**: ({ upsertCartItem })
- **ic_degiskenler**:
  - `tasks` — `Promise<unknown>[]` dizisi; sunucuya yapılacak upsert isteklerinin promise'ları
  - `it` — `items[i]` döngüsündeki mevcut CartItem
  - `up` — `pmap.get(it.product.id)` ile elde edilen güncellenmiş birim fiyat
- **Dönüş**: yok (yan etki: `Promise.allSettled(tasks)` ile sunucu güncellemelerini tetikler)

### [N34_NASIL] AST Pointer: CartProvider.tsx::(context_value_callback)
- **params**: ()
- **ic_degiskenler**: (yok — tüm değerler dışarıdan closure ile gelir: `items`, `syncing`, `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `getCartTotal`, `getCartCount`, `applyServerPricing`)
- **Dönüş**: `CartContextValue` nesnesi — sepet context'inin sağladığı tüm değerler ve fonksiyonlar

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