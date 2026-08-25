---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\contexts\CartProvider.tsx
skeleton_hash: 74a67e0e4c2361e3
entity_hashes:
  func:CartProvider: 8807e7c812fc3463
  overview: 37930ba7d9f73804
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:27:34Z
---

## Genel Bakış

CartProvider, React bileşeni olarak çalışan bir bağlam sağlayıcıdır. Çocuk bileşenleri alıp sarmalayarak bir alışveriş sepeti bağlamı sunar. Modülde yalnızca tek bir bileşen tanımlıdır.

## Fonksiyon Grupları

### Bağlam Sağlayıcı Bileşen

Çocuk bileşenleri ReactNode tipinde parametre olarak alır ve sepet ile ilgili bağlamı alt bileşenlere aktarır.

- CartProvider

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imzadan ve sabit tanımından çıkarılabilecek sınırlı varsayımlar mevcuttur.

[Aksiyom 1]: Eğer `children` prop'u sağlanmazsa, `CartProvider` bileşeni çocuk bileşenleri sarmalayamaz ve bileşen ağacı eksik render edilir.

[Aksiyom 2]: Eğer React ortamı (React ve ilgili modüller) mevcut değilse, `CartProvider` bileşeni oluşturulamaz ve `ReactNode` tipi tanımsız kalır.

[Aksiyom 3]: `CART_SERVER_SYNC` sabiti bir binary_expression olarak tanımlanmıştır; ancak fonksiyon gövdesi verilmediğinden bu sabitin hangi koşullarda kullanıldığı ve ne tür bir eşitleme/senkronizasyon mantığı içerdiği bilinmiyor.

---

## FONKSİYON DETAYLARI

### CartProvider
**Ne yapar**: Sepet (cart) durumunu yöneten bir React Context Provider bileşenidir. Sepet öğelerini yerel depolama (localStorage) ile sunucu (Supabase) arasında senkronize eder, misafir ve oturum açmış kullanıcı sepetlerini birleştirir, fiyat çözümlemesi yapar ve sepet işlemlerini (ekleme, çıkarma, miktar güncelleme, temizleme) sağlar. Bileşen, `CartContext.Provider` içinde çocuk bileşenlere sepet durumunu ve fonksiyonlarını sunar.

**Nasıl yapar**: Bileşen yüklendiğinde `useEffect` ile localStorage'dan sepet verilerini okur; şema uyumsuzluğu varsa eski sepeti sessizce temizler ve güncel şemayı yazar. Son sipariş durumu "success" ise sepeti zorla boşaltır. `items` durumu her değiştiğinde localStorage'a yazar ve bir versiyon numarası (timestamp) artırır. Kullanıcı oturum açtığında `syncWithServer` async fonksiyonu çalışır: sunucudan sepeti alır veya oluşturur, misafir sepeti varsa birleştirir (`mergeItems`), fiyat çözümlemesi yapar (`getEffectivePriceInfo`), birleştirilmiş sepeti sunucuya yazar (`upsertCartItem`) ve yerel durumu günceller. Kullanıcı çıkış yaptığında `CART_OWNER_KEY` temizlenir ve `serverCartId` sıfırlanır. Çapraz sekme senkronizasyonu `storage` olay dinleyicisi ile sağlanır; daha yüksek versiyon numarasına sahip sepet kazanır. `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart` fonksiyonları `useCallback` ile sarılıdır ve hem yerel durumu hem de sunucuyu günceller. `cartTotal` ve `cartCount` `useMemo` ile hesaplanır. `applyServerPricing` fonksiyonu sunucudan gelen birim fiyatları yerel sepete uygular ve değişen kalemleri sunucuya yansıtır. `value` nesnesi `useMemo` ile sarılarak gereksiz yeniden render'lar önlenir.

**Parametreler**:
- children: ReactNode — Provider tarafından sarılacak alt bileşenler.

**Dönüş**: JSX elementi — `CartContext.Provider` içinde `children`'ı saran ve `value` prop'u olarak sepet durumunu ileten bir React elementi.

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

### [N1_NASIL] AST Pointer: CartProvider.tsx::CartProvider
- **params**: `children: ReactNode`
- **ic_degiskenler**:
  - `items` — useState ile yönetilen sepet öğeleri listesi (CartItem[])
  - `syncing` — useState ile yönetilen sunucu senkronizasyon durumu (boolean)
  - `serverCartId` — useState ile yönetilen sunucu tarafındaki sepet kimliği (string | null)
  - `localVersionRef` — useRef ile oluşturulan yerel sepet versiyon numarası referansı
  - `mergingRef` — useRef ile oluşturulan birleştirme işlemi devam ediyor mu referansı
  - `supabase` — useSupabaseClient hook'undan alınan Supabase istemcisi
  - `user` — useAuth hook'undan alınan kullanıcı bilgisi
- **Dönüş**: yok (JSX döndürür: CartContext.Provider içinde children)

### [N2_NASIL] AST Pointer: CartProvider.tsx::mergeItems
- **params**: `local: CartItem[]`, `server: CartItem[]`, `isGuestCart: boolean`
- **ic_degiskenler**:
  - `map` — Map<string, CartItem> tipinde birleştirme haritası, ürün.id anahtarlı
  - `it` — döngülerdeki her bir CartItem öğesi
- **Dönüş**: CartItem[] (birleştirilmiş sepet öğeleri dizisi)

### [N3_NASIL] AST Pointer: CartProvider.tsx::syncWithServer
- **params**: (parametre yok — dış kapsam değişkenlerini kullanır)
- **ic_degiskenler**:
  - `cancelled` — useEffect cleanup fonksiyonu tarafından iptal edilip edilmediğini işaretleyen boolean
  - `getOrCreateShoppingCart` — cart.service modülünden dinamik olarak import edilen fonksiyon
  - `listCartItemsWithProducts` — cart.service modülünden dinamik olarak import edilen fonksiyon
  - `clearDbCartItems` — cart.service modülünden clearCartItems olarak import edilen fonksiyon
  - `upsertCartItem` — cart.service modülünden dinamik olarak import edilen fonksiyon
  - `getEffectivePriceInfo` — pricing.service modülünden dinamik olarak import edilen fonksiyon
  - `cart` — getOrCreateShoppingCart çağrısından dönen sepet nesnesi (id alanı kullanılır)
  - `currentOwner` — localStorage'daki CART_OWNER_KEY değeri
  - `isGuestCart` — currentOwner yoksa, boşsa veya user.id ile eşleşmiyorsa true olan boolean
  - `discardLocalGuestCart` — yakın zamanda ödenmiş sipariş nedeniyle misafir sepetinin atılması gerektiğini gösteren boolean
  - `clearOnce` — localStorage'daki vh_clear_server_cart_once bayrağına bağlı boolean
  - `raw` — localStorage'daki vh_pending_order ham değeri
  - `data` — JSON.parse ile ayrıştırılmış vh_pending_order nesnesi (orderId alanı opsiyonel)
  - `oid` — data.orderId, bekleyen sipariş kimliği
  - `ord` — Supabase sorgusundan dönen sipariş kaydı (status, created_at alanları)
  - `ordErr` — Supabase sorgu hatası
  - `serverRows` — listCartItemsWithProducts çağrısından dönen sunucu sepet öğeleri
  - `serverItems` — serverRows.map ile dönüştürülmüş CartItem dizisi
  - `row` — serverRows.map içindeki her bir satır (row.item.product_id, row.product, row.item.quantity)
  - `merged` — birleştirme stratejisine göre belirlenmiş nihai sepet öğeleri dizisi
  - `priceInfoList` — Promise.all ile fiyat çözümü sonuçları dizisi
  - `it` — merged.map içindeki her bir CartItem öğesi
  - `info` — getEffectivePriceInfo çağrısından dönen fiyat bilgisi nesnesi
  - `e` — catch bloklarındaki hata nesnesi
  - `unitMap` — Map<string, { resolved: boolean; unitPrice: number | undefined }> tipinde fiyat haritası
  - `p` — priceInfoList.map içindeki her bir fiyat bilgisi öğesi
  - `mergedWithPrices` — fiyat bilgileri uygulanmış nihai sepet öğeleri dizisi
  - `v` — Date.now() ile üretilen zaman damgası
- **Dönüş**: yok (yan etki: setItems, setServerCartId, localStorage yazımı)

### [N4_NASIL] AST Pointer: CartProvider.tsx::onStorage
- **params**: `e: StorageEvent`
- **ic_degiskenler**:
  - `owner` — localStorage'daki CART_OWNER_KEY değeri
  - `vStr` — localStorage'daki CART_VERSION_KEY değeri (varsayılan '0')
  - `v` — parseInt ile ayrıştırılmış versiyon numarası
  - `raw` — localStorage'daki CART_LOCAL_STORAGE_KEY ham değeri
  - `next` — JSON.parse ile ayrıştırılmış sepet öğeleri dizisi
- **Dönüş**: yok (yan etki: setItems, localVersionRef.current güncelleme)

### [N5_NASIL] AST Pointer: CartProvider.tsx::addToCart
- **params**: `product: Product`, `quantity: number` (varsayılan 1)
- **ic_degiskenler**:
  - `currentItems` — setItems callback'indeki mevcut sepet öğeleri dizisi
  - `existingItem` — currentItems.find ile bulunan mevcut ürün öğesi
  - `item` — map/filter callback'lerindeki her bir CartItem öğesi
  - `info` — getEffectivePriceInfo çağrısından dönen fiyat bilgisi nesnesi
  - `curr` — setItems callback'indeki güncel sepet öğeleri dizisi
  - `it` — map callback'indeki her bir CartItem öğesi
  - `upsertCartItem` — cart.service modülünden dinamik olarak import edilen fonksiyon
  - `i` — items.find callback'indeki her bir CartItem öğesi
  - `err` — catch bloklarındaki hata nesnesi
- **Dönüş**: yok (yan etki: setItems, fiyat çözümü, sunucuya yazım, CustomEvent dispatch)

### [N6_NASIL] AST Pointer: CartProvider.tsx::removeFromCart
- **params**: `_productId: string`
- **ic_degiskenler**:
  - `currentItems` — setItems callback'indeki mevcut sepet öğeleri dizisi
  - `item` — currentItems.find ile bulunan çıkarılacak ürün öğesi
  - `toast` — sonner modülünden dinamik olarak import edilen bildirim fonksiyonu
  - `removeCartItem` — cart.service modülünden dinamik olarak import edilen fonksiyon
  - `err` — catch bloğundaki hata nesnesi
- **Dönüş**: yok (yan etki: setItems, bildirim gösterimi, sunucudan silme)

### [N7_NASIL] AST Pointer: CartProvider.tsx::updateQuantity
- **params**: `_productId: string`, `quantity: number`
- **ic_degiskenler**:
  - `currentItems` — setItems callback'indeki mevcut sepet öğeleri dizisi
  - `item` — map callback'indeki her bir CartItem öğesi
  - `product` — items.find ile bulunan ürün nesnesi (Product tipinde)
  - `i` — items.find callback'indeki her bir CartItem öğesi
  - `info` — getEffectivePriceInfo çağrısından dönen fiyat bilgisi nesnesi
  - `curr` — setItems callback'indeki güncel sepet öğeleri dizisi
  - `it` — map callback'indeki her bir CartItem öğesi
  - `upsertCartItem` — cart.service modülünden dinamik olarak import edilen fonksiyon
  - `err` — catch bloklarındaki hata nesnesi
- **Dönüş**: yok (yan etki: removeFromCart çağrısı, setItems, fiyat çözümü, sunucuya yazım)

### [N8_NASIL] AST Pointer: CartProvider.tsx::clearCart
- **params**: `opts?: { silent?: boolean }`
- **ic_degiskenler**:
  - `e` — catch bloğundaki hata nesnesi
  - `toast` — sonner modülünden dinamik olarak import edilen bildirim fonksiyonu
  - `clearCartItems` — cart.service modülünden dinamik olarak import edilen fonksiyon
  - `err` — catch bloğundaki hata nesnesi
- **Dönüş**: yok (yan etki: setItems, localStorage temizleme, StorageEvent dispatch, bildirim, sunucu temizleme)

### [N9_NASIL] AST Pointer: CartProvider.tsx::getCartTotal
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `total` — reduce callback'indeki birikimli toplam tutar
  - `item` — reduce callback'indeki her bir CartItem öğesi
  - `unit` — item.unitPrice, birim fiyat değeri
- **Dönüş**: number (sepet toplam tutarı)

### [N10_NASIL] AST Pointer: CartProvider.tsx::getCartCount
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `count` — reduce callback'indeki birikimli toplam adet
  - `item` — reduce callback'indeki her bir CartItem öğesi
- **Dönüş**: number (sepet toplam öğe sayısı)

### [N11_NASIL] AST Pointer: CartProvider.tsx::applyServerPricing
- **params**: `serverItems: { product_id: string, unit_price: number | null }[]`
- **ic_degiskenler**:
  - `to2` — ondalık hassasiyeti 2 basamağa yuvarlayan yardımcı fonksiyon
  - `nearlyEqual` — iki sayının 0.01 toleransla eşit olup olmadığını kontrol eden yardımcı fonksiyon
  - `n` — to2 fonksiyonundaki sayı parametresi
  - `a` — nearlyEqual fonksiyonundaki birinci sayı parametresi
  - `b` — nearlyEqual fonksiyonundaki ikinci sayı parametresi
  - `pmap` — Map<string, number> tipinde ürün kimliği-birim fiyat haritası
  - `it` — for döngülerindeki her bir serverItems öğesi
  - `pid` — String ile dönüştürülmüş ürün kimliği
  - `up` — Number ile dönüştürülmüş birim fiyat
  - `changedIds` — Set<string> tipinde fiyatı değişen ürün kimlikleri kümesi
  - `nextUnit` — pmap.get ile alınan yeni birim fiyat
  - `currUnit` — mevcut birim fiyat (number veya null)
  - `curr` — setItems callback'indeki güncel sepet öğeleri dizisi
  - `upsertCartItem` — cart.service modülünden dinamik olarak import edilen fonksiyon
  - `tasks` — Promise<unknown>[] tipinde sunucu yazım görevleri dizisi
  - `i` — for döngüsündeki indeks
  - `up` — pmap.get ile alınan birim fiyat (ikinci kullanım)
  - `e` — catch bloklarındaki hata nesnesi
- **Dönüş**: yok (yan etki: setItems, sunucuya fiyat güncelleme yazımı)

---

## NODE ID STANDARD

  file: CartProvider.tsx
  function: CartProvider.tsx::CartProvider

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