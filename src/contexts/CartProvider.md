---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx
skeleton_hash: 1ea6b8991a36c6cf
generated_at: 2026-05-23T22:29:53Z
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

## FONKSIYON DETAYLARI

### CartProvider
**Ne yapar**: VentHub HVAC projesinde alışveriş sepeti bağlamını uygulamanın ilgili alt bileşen ağacında erişilebilir kılan bir React context sağlayıcı bileşenidir. Tüm sepet ile ilgili state ve işlemleri merkezi olarak yöneterek, alt ağaçtaki herhangi bir bileşenin ayrı state yönetimi yapmasına gerek kalmadan sepet verilerine erişmesini sağlar.
**Nasıl yapar**: Kendisine iletilen children prop'unu, proje içinde tanımlanmış CartContext.Provider bileşeni içine yerleştirerek sarmalar. Bağlamın tüm değerlerini içeren value nesnesini provider'ın value prop'una atayarak, alt ağaçtaki bileşenlerin useContext hook'u ile sepet verilerine erişmesini mümkün kılar. Sadece kendi kapsamı içindeki bileşenlerin bağlamı tüketebilmesini sağlayarak sepet verilerinin güvenli bir şekilde paylaşılmasını sağlar.
**Parametreler**:
- children: ReactNode — CartProvider tarafından sarmalanan, uygulamanın alt bileşenlerinden oluşan React node'u. Bu alt bileşenlerin tamamı, CartProvider tarafından sağlanan alışveriş sepeti bağlamındaki tüm verilere ve işlemlere erişim hakkı kazanır.
**Dönüş**: JSX.Element — İçine children prop'unu yerleştirdiği CartContext.Provider React elemanını döndürür. Bu döndürülen eleman, CartProvider'ın uygulama ağacında kullanıldığı konumda alt bileşenleri sarmalayarak sepet bağlamının tüm alt ağaçta aktif olmasını sağlar.

---

## SABİTLER
- **CART_SERVER_SYNC** [env-backed] (binary_expression) — `(process.env.NEXT_PUBLIC_CART_SERVER_SYNC ?? 'true') === 'true'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::ilk_cart_yukleme_effect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `schema` — localStorage'dan okunan mevcut sepet şema versiyonu, şema uyumsuzluğu kontrolü için kullanılır
  - `lastStatus` — localStorage'dan okunan son sipariş durumu, başarılı sipariş sonrası sepeti sıfırlamak için kullanılır
  - `savedCart` — localStorage'dan okunan kayıtlı sepet ürünleri listesi
  - `savedVer` — localStorage'dan okunan sepet versiyon numarası string hali
  - `v` — parseInt ile dönüştürülmüş sayısal sepet versiyonu
  - `error` — try bloğunda yakalanan localStorage okuma/hata ayıklama hatası
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::sepeti_local_storage_a_kaydet_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `v` - Date.now() ile alınan yeni sepet versiyonu zaman damgası
  - `error` — localStorage'a yazma sırasında yakalanan hata
  - `items` — kaydedilecek mevcut sepet ürünleri listesi
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::mergeItems
- **params**: local: CartItem[], server: CartItem[], isGuestCart: boolean
- **ic_degiskenler**:
  - `map` - Ürün ID'lerine göre sepet elemanlarını depolamak için kullanılan Map nesnesi
  - `it` — döngüde işlenen her bir sepet elemanı
- **Dönüş**: CartItem[]

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::sunucu_ile_sync_effect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `cancelled` - effect cleanup'inde sync işlemini iptal etmek için kullanılan bayrak
  - `syncWithServer` - içerde tanımlanan asenkron sunucu senkronizasyon fonksiyonu
- **Dönüş**: () => void (cleanup fonksiyonu)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::syncWithServer
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `CART_SERVER_SYNC` - sunucu senkronizasyonunu açan bayrak
  - `user` - mevcut oturum açmış kullanıcı nesnesi
  - `mergingRef.current` - halihazırda birleştirme işlemi yapılıp yapılmadığını kontrol eden referans
  - `setSyncing` - senkronizasyon durumunu güncelleyen state setter
  - `getOrCreateShoppingCart` - import edilen supabase fonksiyonu, kullanıcı için sepet alır/oluşturur
  - `listCartItemsWithProducts` - import edilen supabase fonksiyonu, sepet elemanlarını ürün detaylarıyla listeler
  - `clearDbCartItems` - import edilen supabase fonksiyonu, sunucudaki sepeti temizler
  - `getEffectivePriceInfo` - import edilen supabase fonksiyonu, ürün için geçerli fiyat bilgisi alır
  - `upsertCartItem` - import edilen supabase fonksiyonu, sepete eleman ekler/günceller
  - `supabase` - import edilen supabase istemci nesnesi
  - `cart` - getOrCreateShoppingCart ile alınan sunucu sepeti nesnesi
  - `setServerCartId` - sunucu sepeti ID'sini kaydeden state setter
  - `currentOwner` - localStorage'dan okunan sepet sahibi kullanıcı ID'si
  - `isGuestCart` - mevcut sepetin misafir kullanıcıya ait olup olmadığını belirten bayrak
  - `discardLocalGuestCart` - yerel misafir sepetini silmek için kullanılan bayrak
  - `clearOnce` - sunucu sepetini bir kereliğine temizlemek için localStorage bayrağı
  - `raw` - localStorage'dan okunan bekleyen sipariş verisi string hali
  - `data` - JSON.parse ile dönüştürülmüş bekleyen sipariş nesnesi
  - `oid` - bekleyen siparişin ID'si
  - `ord` - supabase'den alınan sipariş nesnesi
  - `ordErr` - sipariş sorgusu sırasında oluşan hata
  - `serverRows` - sunucudan alınan ham sepet elemanları listesi
  - `serverItems` - CartItem tipine dönüştürülmüş sunucu sepeti elemanları
  - `merged` - yerel ve sunucu sepetleri birleştirilmiş son sepet listesi
  - `priceInfoList` - tüm birleştirilmiş elemanlar için alınan fiyat bilgileri listesi
  - `it` - döngüde işlenen her bir sepet elemanı
  - `info` - getEffectivePriceInfo ile alınan ürün fiyat bilgisi
  - `e` - try bloğunda yakalanan herhangi bir hata
  - `unitMap` - ürün ID'lerine göre fiyatları depolayan Map nesnesi
  - `p` - priceInfoList'ten alınan her bir fiyat nesnesi
  - `mergedWithPrices` - yerel fiyatları eklenmiş son sepet listesi
  - `v` - Date.now() ile alınan yeni sepet versiyonu zaman damgası
- **Dönüş**: Promise<void>

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::server_row_mapper
- **params**: row: { item: { product_id: string, quantity: number }, product: Product }
- **ic_degiskenler**:
  - `row.item.product_id` - sunucudan gelen ürün ID'si
  - `row.product` - sunucudan gelen ürün detay nesnesi
  - `row.item.quantity` - sunucudan gelen ürün adedi
- **Dönüş**: CartItem

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::merged_item_async_mapper
- **params**: it: CartItem
- **ic_degiskenler**:
  - `it.product` - işlenen ürünün detay nesnesi
  - `it.product.id` - işlenen ürünün ID'si
  - `it.quantity` - işlenen ürünün sepetteki adedi
  - `info` - getEffectivePriceInfo ile alınan geçerli fiyat bilgisi
  - `cartId` - mevcut sunucu sepeti ID'si
  - `e` - upsert sırasında yakalanan hata
- **Dönüş**: Promise<{ _productId: string, unitPrice: number | undefined }>

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::cikis_yapan_kullanici_icin_owner_temizle_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` - mevcut oturum açmış kullanıcı nesnesi
  - `setServerCartId` - sunucu sepeti ID'sini sıfırlayan state setter
  - `e` - localStorage işlemi sırasında yakalanan hata
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::cross_tab_storage_listener_ekle_effect
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onStorage` - storage olayını işleyen iç fonksiyon
- **Dönüş**: () => void (cleanup fonksiyonu, event listener'ı kaldırır)

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::onStorage
- **params**: e: StorageEvent
- **ic_degiskenler**:
  - `e.key` - değişen localStorage anahtarı
  - `owner` - localStorage'dan okunan mevcut sepet sahibi ID'si
  - `user` - mevcut oturum açmış kullanıcı nesnesi
  - `vStr` - localStorage'dan okunan sepet versiyonu string hali
  - `v` - parseInt ile dönüştürülmüş sayısal sepet versiyonu
  - `localVersionRef.current` - yerel olarak kaydedilen son sepet versiyonu
  - `raw` - localStorage'dan okunan yeni sepet verisi string hali
  - `next` - JSON.parse ile dönüştürülmüş yeni sepet listesi
- **Dönüş**: void

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::addToCart
- **params**: product: Product, quantity = 1
- **ic_degiskenler**:
  - `setItems` - sepet listesini güncelleyen state setter
  - `currentItems` - mevcut sepet elemanları listesi
  - `existingItem` - eklenen ürünün zaten sepette olup olmadığını kontrol eden eleman
  - `product.id` - eklenen ürünün ID'si
  - `item` - map fonksiyonunda işlenen her bir sepet elemanı
  - `CART_SERVER_SYNC` - sunucu senkronizasyonunu açan bayrak
  - `user` - mevcut oturum açmış kullanıcı
  - `serverCartId` - mevcut sunucu sepeti ID'si
  - `getEffectivePriceInfo` - import edilen supabase fiyat bilgisi alma fonksiyonu
  - `upsertCartItem` - import edilen supabase sepet elemanı güncelleme fonksiyonu
  - `items` - mevcut sepet listesi
  - `err` - sunucu işlemleri sırasında yakalanan hata
- **Dönüş**: void

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::addToCart_currentItems_mapper
- **params**: currentItems: CartItem[]
- **ic_degiskenler**:
  - `existingItem` - ürünün sepette varlığını kontrol eden eleman
  - `product.id` - eklenen ürünün ID'si
  - `item` - döngüde işlenen her bir sepet elemanı
- **Dönüş**: CartItem[]

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::addToCart_item_mapper
- **params**: item: CartItem
- **ic_degiskenler**:
  - `item.product.id` - işlenen ürünün ID'si
  - `product.id` - eklenen ürünün ID'si
  - `item.quantity` - işlenen ürünün mevcut adedi
- **Dönüş**: CartItem

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::addToCart_supabase_import_callback
- **params**: { getEffectivePriceInfo, upsertCartItem }
- **ic_degiskenler**:
  - `product` - eklenen ürün nesnesi
  - `serverCartId` - mevcut sunucu sepeti ID'si
  - `items` - mevcut sepet listesi
  - `info` - alınan ürün fiyat bilgisi
  - `err` - sunucu işlemleri sırasında oluşan hata
- **Dönüş**: Promise<void>

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::addToCart_price_info_then_callback
- **params**: info: { unitPrice: number, priceListId?: string }
- **ic_degiskenler**:
  - `serverCartId` - mevcut sunucu sepeti ID'si
  - `product.id` - eklenen ürünün ID'si
  - `items` - mevcut sepet listesi
  - `quantity` - eklenen ürün adedi
  - `info.unitPrice` - alınan birim fiyat
  - `info.priceListId` - alınan fiyat listesi ID'si
  - `err` - sunucu işlemleri sırasında oluşan hata
- **Dönüş**: void

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::removeFromCart
- **params**: _productId: string
- **ic_degiskenler**:
  - `setItems` - sepet state'ini güncelleyen setter
  - `currentItems` - mevcut sepet elemanları listesi
  - `item` - silinen ürünle eşleşen sepet elemanı
  - `CART_SERVER_SYNC` - sunucu senkronizasyon bayrağı
  - `user` - mevcut oturum açmış kullanıcı
  - `serverCartId` - sunucu sepeti ID'si
  - `removeCartItem` - import edilen supabase sepetten eleman silme fonksiyonu
  - `err` - sunucu işlemi sırasında oluşan hata
- **Dönüş**: void

### [N17_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::removeFromCart_currentItems_callback
- **params**: currentItems: CartItem[]
- **ic_degiskenler**:
  - `item` - işlenen her bir sepet elemanı
  - `_productId` - silinecek ürünün ID'si
  - `item.product.id` - işlenen ürünün ID'si
- **Dönüş**: CartItem[]

### [N18_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::removeFromCart_supabase_import_callback
- **params**: { removeCartItem }
- **ic_degiskenler**:
  - `serverCartId` - mevcut sunucu sepeti ID'si
  - `_productId` - silinecek ürünün ID'si
  - `err` - silme işlemi sırasında oluşan hata
- **Dönüş**: Promise<void>

### [N19_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::updateQuantity
- **params**: _productId: string, quantity: number
- **ic_degiskenler**:
  - `removeFromCart` - adet 0 veya negatifse ürünü silen fonksiyon
  - `setItems` - sepet state'ini güncelleyen setter
  - `currentItems` - mevcut sepet elemanları listesi
  - `item` - işlenen her bir sepet elemanı
  - `CART_SERVER_SYNC` - sunucu senkronizasyon bayrağı
  - `user` - mevcut oturum açmış kullanıcı
  - `serverCartId` - sunucu sepeti ID'si
  - `product` - güncellenecek ürün nesnesi
  - `items` - mevcut sepet listesi
  - `getEffectivePriceInfo` - import edilen fiyat bilgisi alma fonksiyonu
  - `upsertCartItem` - import edilen sepet elemanı güncelleme fonksiyonu
  - `info` - alınan ürün fiyat bilgisi
  - `err` - sunucu işlemleri sırasında oluşan hata
- **Dönüş**: void

### [N20_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::updateQuantity_currentItems_mapper
- **params**: currentItems: CartItem[]
- **ic_degiskenler**:
  - `item` - işlenen her bir sepet elemanı
  - `_productId` - güncellenecek ürünün ID'si
  - `item.product.id` - işlenen ürünün ID'si
  - `quantity` - ayarlanacak yeni adet
- **Dönüş**: CartItem[]

### [N21_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::updateQuantity_item_mapper
- **params**: item: CartItem
- **ic_degiskenler**:
  - `item.product.id` - işlenen ürünün ID'si
  - `_productId` - güncellenecek ürünün ID'si
  - `item.quantity` - ürünün mevcut adedi
  - `quantity` - ayarlanacak yeni adet
- **Dönüş**: CartItem

### [N22_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::updateQuantity_supabase_import_callback
- **params**: { getEffectivePriceInfo, upsertCartItem }
- **ic_degiskenler**:
  - `product` - güncellenecek ürün nesnesi
  - `serverCartId` - sunucu sepeti ID'si
  - `_productId` - güncellenecek ürünün ID'si
  - `quantity` - yeni adet
  - `info` - alınan fiyat bilgisi
  - `err` - sunucu işlemleri sırasında oluşan hata
- **Dönüş**: Promise<void>

### [N23_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::updateQuantity_price_info_then_callback
- **params**: info: { unitPrice: number, priceListId?: string }
- **ic_degiskenler**:
  - `serverCartId` - sunucu sepeti ID'si
  - `_productId` - güncellenecek ürünün ID'si
  - `quantity` - yeni adet
  - `info.unitPrice` - alınan birim fiyat
  - `info.priceListId` - alınan fiyat listesi ID'si
  - `err` - sunucu işlemleri sırasında oluşan hata
- **Dönüş**: void

### [N24_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::clearCart
- **params**: opts?: { silent?: boolean }
- **ic_degiskenler**:
  - `setItems` - sepeti sıfırlayan state setter
  - `opts?.silent` - toast bildirimi gösterilmeyeceğini belirten bayrak
  - `e` - localStorage işlemleri sırasında oluşan hata
  - `CART_SERVER_SYNC` - sunucu senkronizasyon bayrağı
  - `user` - mevcut oturum açmış kullanıcı
  - `serverCartId` - sunucu sepeti ID'si
  - `clearCartItems` - import edilen supabase sunucu sepetini temizleme fonksiyonu
  - `err` - sunucu işlemi sırasında oluşan hata
- **Dönüş**: void

### [N25_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::clearCart_supabase_import_callback
- **params**: { clearCartItems }
- **ic_degiskenler**:
  - `serverCartId` - sunucu sepeti ID'si
  - `err` - temizleme işlemi sırasında oluşan hata
- **Dönüş**: Promise<void>

### [N26_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::getCartTotal
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `items` - mevcut sepet elemanları listesi
  - `total` - reduce ile hesaplanan toplam tutar
  - `item` - işlenen her bir sepet elemanı
  - `unit` - işlenen ürünün birim fiyatı
  - `item.unitPrice` - ürünün kayıtlı birim fiyatı
  - `item.product.price` - ürünün varsayılan fiyatı
  - `item.quantity` - ürünün adedi
- **Dönüş**: number

### [N27_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::getCartTotal_reduce_callback
- **params**: total: number, item: CartItem
- **ic_degiskenler**:
  - `unit` - ürünün geçerli birim fiyatı
  - `item.unitPrice` - ürünün kayıtlı birim fiyatı
  - `item.product.price` - ürünün varsayılan fiyatı
  - `item.quantity` - ürünün adedi
- **Dönüş**: number

### [N28_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::getCartCount
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `items` - mevcut sepet elemanları listesi
  - `count` - toplam ürün adedi
  - `item.quantity` - her ürünün adedi
- **Dönüş**: number

### [N29_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::applyServerPricing
- **params**: serverItems: { product_id: string, unit_price: number }[]
- **ic_degiskenler**:
  - `to2` - sayıyı 2 ondalık basamağa yuvarlayan yardımcı fonksiyon
  - `nearlyEqual` - iki fiyatın yaklaşık olarak eşit olup olmadığını kontrol eden fonksiyon
  - `pmap` - sunucu fiyatlarını ürün ID'lerine göre depolayan Map
  - `it` - döngüde işlenen her bir sunucu elemanı
  - `pid` - ürünün string ID'si
  - `up` - sunucudan gelen birim fiyat
  - `changedIds` - fiyatı değişen ürünlerin ID'lerini depolayan Set
  - `nextUnit` - sunucudan gelen yeni birim fiyat
  - `currUnit` - yerel olarak kayıtlı mevcut birim fiyat
  - `setItems` - sepet state'ini güncelleyen setter
  - `curr` - mevcut sepet listesi
  - `changedIds.size` - fiyatı değişen ürün sayısı
  - `CART_SERVER_SYNC` - sunucu senkronizasyon bayrağı
  - `user` - mevcut kullanıcı
  - `serverCartId` - sunucu sepeti ID'si
  - `upsertCartItem` - import edilen sepet güncelleme fonksiyonu
  - `tasks` - sunucuya gönderilecek tüm upsert işlemlerinin listesi
  - `i` - döngü indeksi
- **Dönüş**: void

### [N30_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::applyServerPricing_setItems_map_callback
- **params**: curr: CartItem[]
- **ic_degiskenler**:
  - `it` - işlenen her bir sepet elemanı
  - `nextUnit` - sunucudan gelen yeni birim fiyat
  - `currUnit` - yerel mevcut birim fiyat
  - `nearlyEqual` - fiyat eşitliğini kontrol eden fonksiyon
- **Dönüş**: CartItem[]

### [N31_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::applyServerPricing_item_mapper
- **params**: it: CartItem
- **ic_degiskenler**:
  - `it.product.id` - işlenen ürünün ID'si
  - `nextUnit` - sunucudan gelen yeni birim fiyat
  - `currUnit` - yerel mevcut birim fiyat
  - `nearlyEqual` - fiyat eşitliğini kontrol eden fonksiyon
  - `it.unitPrice` - yerel kayıtlı birim fiyat
- **Dönüş**: CartItem

### [N32_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::applyServerPricing_supabase_import_callback
- **params**: { upsertCartItem }
- **ic_degiskenler**:
  - `tasks` - tüm upsert işlemlerinin listesi
  - `items` - mevcut sepet listesi
  - `changedIds` - fiyatı değişen ürün ID'leri seti
  - `it` - işlenen her bir fiyatı değişen ürün
  - `up` - sunucudan gelen yeni birim fiyat
  - `serverCartId` - sunucu sepeti ID'si
  - `e` - upsert işlemi sırasında oluşan hata
- **Dönüş**: void

### [N33_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartProvider.tsx::context_value_donduren_fonksiyon
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `items` - sepet elemanları listesi
  - `syncing` - senkronizasyon durumu
  - `addToCart` - sepete ürün ekleme fonksiyonu
  - `removeFromCart` - sepetten ürün çıkarma fonksiyonu
  - `updateQuantity` - ürün adedini güncelleme fonksiyonu
  - `clearCart` - sepeti temizleme fonksiyonu
  - `getCartTotal` - sepet toplamını hesaplama fonksiyonu
  - `getCartCount` - toplam ürün adedini hesaplama fonksiyonu
  - `applyServerPricing` - sunucu fiyatlarını yerleştiren fonksiyon
- **Dönüş**: { items: CartItem[], syncing: boolean, addToCart: Function, removeFromCart: Function, updateQuantity: Function, clearCart: Function, getCartTotal: Function, getCartCount: Function, applyServerPricing: Function }

---

## NODE ID STANDARD

  file: src\contexts\CartProvider.tsx
  function: src\contexts\CartProvider.tsx::CartProvider

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartProvider