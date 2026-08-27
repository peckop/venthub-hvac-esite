---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\views\account\OrderDetailPage.tsx
skeleton_hash: 2b6661c0a71b96df
entity_hashes:
  func:OrderDetailPage: 85c6f615024b92fd
  overview: a5cc962f9daa7e69
  style_tokens: 2d7ff3d6e2a546ab
generated_at: 2026-08-27T04:15:16Z
---

## Genel Bakış
Bu modül, kullanıcının hesap panelinden eriştiği belirli bir siparişin detaylı görünümünü sunan tek bir React sayfa bileşeninden oluşur. Sipariş özeti, ürünler, kargo takibi ve fatura bilgilerini sekmeler halinde düzenler ve sipariş durumunu adım adım gösteren bir ilerleme çubuğu ile yeniden sipariş verme gibi eylemler sunar. Bileşen, URL'den sipariş kimliğini alır, kimlik doğrulamasını kontrol eder ve Supabase veritabanından sipariş verilerini ilişkisel sorguyla çeker.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve merkezi bileşeni olup, sipariş verisini alarak sayfa düzenini oluşturur ve ilgili alt bileşenleri bir araya getirerek sipariş detay sayfasını kullanıcıya render eder.
- OrderDetailPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesi sağlanmadığından, fonksiyon gövdesinden türetilen özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### OrderDetailPage
**Ne yapar**: Sipariş detay sayfasını oluşturan React bileşenidir. URL'den alınan sipariş kimliğine göre veritabanından sipariş verilerini çeker, sipariş kalemlerini eşler ve kullanıcıya sipariş özeti, ürünler, kargo takibi ve fatura bilgilerini sekmeli bir arayüzde sunar. Kimlik doğrulama yapılmamış kullanıcıları giriş sayfasına yönlendirir.

**Nasıl yapar**: Bileşen önce `useSearchParams` ile URL'deki `id` parametresini alır. `useAuth` ile kullanıcı oturum durumunu kontrol eder; oturum açılmamışsa `useRouter` ile giriş sayfasına yönlendirir. `useI18n` ve `useLocalizedRoutes` ile çoklu dil desteği ve yerelleştirilmiş rotaları kullanır. `useCart` ile sepete ekleme fonksiyonuna erişir. İlk `useEffect` kimlik doğrulama kontrolü yapar. İkinci `useEffect` içinde tanımlanan `load` fonksiyonu, Supabase üzerinden `venthub_orders` tablosundan sipariş ana verilerini ve ilişkili `venthub_order_items` kalemlerini tek bir sorguda çeker (ilişkisel sorgu optimizasyonu). Çekilen kalemler `*_snapshot` sütunlarından okunur; canlı katalogtan değil, sipariş anındaki anlık değerlerden — bu bir fatura görünümüdür ve ürün adı ya da fiyatı sonradan değişse bile müşterinin gördüğü kayıt değişmemelidir. Yedek (fallback) bilerek yoktur çünkü bu alanlar veritabanında NOT NULL olarak tanımlıdır ve "boşsa eski kolona düş" davranışı sessiz bozulmaya yol açardı. Görünen müşteri adı yedeği sözlükten gelir; ham Türkçe dizge EN kullanıcıya da gösteriyordu (I18N-SWEEP bildirdi; anahtar ortak sözlükte). Durum renkleri ve metinleri için `getStatusColor` ve `getStatusText` yardımcı fonksiyonları kullanılır. İlerleme çubuğu için `'confirmed'` durumu `'paid'` olarak normalize edilir. Sekme yapısı `'overview'`, `'items'`, `'shipping'`, `'invoice'` olmak üzere dört bölümden oluşur. Yükleme sırasında spinner gösterilir.

**Parametreler**:
- Parametre almaz (fonksiyon bileşeni).

**Dönüş**: Bilinmiyor (tip belirtilmemiş).

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useCartHook::useCart
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/currency::SYSTEM_CURRENCY
- import: ../../i18n/datetime::formatDateTime
- import: ../../i18n/format::formatCurrency
- import: ../../lib/services/product.columns::VARIANT_DETAIL_COLUMNS
- import: @/components/ui/VentImage::VentImage
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/ui-models::type { Product }
- import: next/link::Link
- import: next/navigation::useRouter
- import: next/navigation::useSearchParams
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### ShippingAddress
- `fullAddress?: string`
- `street?: string`
- `city?: string`
- `district?: string`
- `state?: string`
- `postalCode?: string`
- `postal_code?: string`

### OrderItem
- `id: string`
- `product_id?: string`
- `product_name: string`
- `product_sku?: string`
- `quantity: number`
- `unit_price: number`
- `total_price: number`
- `product_image_url?: string | null`

### Order
- `id: string`
- `total_amount: number`
- `status: string`
- `payment_status?: string`
- `created_at: string`
- `customer_name: string`
- `customer_email: string`
- `shipping_address: unknown`
- `order_items: OrderItem[]`
- `order_number?: string`
- `is_demo?: boolean`
- `payment_data?: unknown`
- `conversation_id?: string`
- `carrier?: string`
- `tracking_number?: string`
- `tracking_url?: string`
- `shipped_at?: string`
- `delivered_at?: string`
- `shipping_method?: 'standard' | 'express' | string`
- `invoice_type?: string`
- `invoice_info?: unknown`
- `legal_consents?: unknown`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::useEffect (auth kontrol)
- **params**: yok
- **ic_degiskenler**:
  - `authLoading` — kimlik doğrulama yüklenme durumu; true ise kontrol yapılmaz
  - `user` — giriş yapmış kullanıcı nesnesi; yoksa login sayfasına yönlendirilir
  - `router` — Next.js router nesnesi; sayfa yönlendirmesi için kullanılır
  - `Routes` — rota sabitleri nesnesi; `Routes.auth.login()` ve `Routes.account.orderDetail()` fonksiyonları çağrılır
  - `id` — sipariş ID'si; login sonrası geri dönüş URL'inde kullanılır
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::useEffect (sipariş yükleme)
- **params**: yok
- **ic_degiskenler**:
  - `user` — giriş yapmış kullanıcı nesnesi; yoksa yükleme yapılmaz
  - `id` — sipariş ID'si; yoksa yükleme yapılmaz
  - `setLoading` — yükleme durumunu güncelleyen state setter fonksiyonu
  - `supabase` — Supabase istemcisi; veritabanı sorguları için kullanılır
  - `setOrder` — sipariş verisini güncelleyen state setter fonksiyonu
  - `toast` — bildirim gösterme fonksiyonu; hata durumunda `toast.error()` çağrılır
  - `t` — çeviri fonksiyonu; hata mesajı anahtarı için kullanılır
  - `console.error` — hata günlüğü; yakalanan hataları konsola yazar
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::load
- **params**: yok
- **ic_degiskenler**:
  - `user` — giriş yapmış kullanıcı nesnesi; yoksa fonksiyon erken döner
  - `id` — sipariş ID'si; Supabase sorgusunda `.eq('id', id)` filtresi olarak kullanılır
  - `setLoading` — yükleme durumunu güncelleyen state setter; try bloğunda true, finally'de false yapılır
  - `supabase` — Supabase istemcisi; `venthub_orders` tablosundan veri çeker
  - `orderData` — Supabase sorgusundan dönen sipariş verisi; ilişkisel sorgu ile `venthub_order_items` dahil çekilir
  - `orderError` — Supabase sorgu hatası; varsa throw edilir
  - `rawItems` — `orderData.venthub_order_items` dizisi; `Record<string, unknown>[]` tipinde, yoksa boş dizi atanır
  - `mappedItems` — `rawItems` dizisinin `OrderItem` tipine dönüştürülmüş hali; `rawItems.map()` ile oluşturulur
  - `mappedOrder` — `Order` tipinde nesne; `orderData` alanlarından dönüştürülerek oluşturulur
  - `setOrder` — `mappedOrder`'ı state'e kaydeden setter fonksiyonu
  - `toast` — bildirim fonksiyonu; hata durumunda `toast.error()` çağrılır
  - `t` — çeviri fonksiyonu; `t('orders.unexpectedError')` ve `t('common.userFallback')` anahtarları için kullanılır
  - `console.error` — hata günlüğü; `'Order load error:'` mesajıyla yakalanan hatayı yazar
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::mappedItems map callback
- **params**: `it` — ham sipariş kalemi nesnesi; `Record<string, unknown>` tipinde
- **ic_degiskenler**:
  - `it.unit_price_snapshot` — birim fiyat snapshot alanı; `Number()` ile sayıya dönüştürülür, yoksa 0 atanır
  - `it.quantity` — miktar alanı; `Number()` ile sayıya dönüştürülür, yoksa 0 atanır
  - `unit` — dönüştürülmüş birim fiyat; `Number(it.unit_price_snapshot) || 0`
  - `qty` — dönüştürülmüş miktar; `Number(it.quantity) || 0`
  - `it.id` — kalemin ID'si; `String()` ile dönüştürülür
  - `it.product_id` — ürün ID'si; varsa `String()` ile dönüştürülür, yoksa `undefined`
  - `it.product_name_snapshot` — ürün adı snapshot; `String()` ile dönüştürülür
  - `it.product_sku_snapshot` — ürün SKU snapshot; varsa `String()` ile dönüştürülür, yoksa `undefined`
  - `it.product_image_url` — ürün görsel URL'si; varsa `String()` ile dönüştürülür, yoksa `null`
- **Dönüş**: `OrderItem` nesnesi — `id`, `product_id`, `product_name`, `product_sku`, `quantity`, `unit_price`, `total_price`, `product_image_url` alanlarını içerir

### [N5_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::copyToClipboard
- **params**: `text` — kopyalanacak metin; opsiyonel string
- **ic_degiskenler**:
  - `text` — kopyalanacak metin; yoksa fonksiyon erken döner
  - `navigator.clipboard.writeText` — panoya yazma API'si; `text` parametresini panoya kopyalar
  - `toast` — bildirim fonksiyonu; başarılı kopyalamada `toast.success()`, hata durumunda `toast.error()` çağrılır
  - `t` — çeviri fonksiyonu; `t('orders.copied')` ve `t('orders.copyFailed')` anahtarları için kullanılır
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::downloadProforma
- **params**: `o` — proforma oluşturulacak `Order` nesnesi
- **ic_degiskenler**:
  - `jsPDF` — jsPDF kütüphanesinin default export'u; dinamik import ile yüklenir
  - `autoTable` — jspdf-autotable eklentisinin default export'u; dinamik import ile yüklenir
  - `doc` — jsPDF belge nesnesi; `new jsPDF({ unit: 'pt', format: 'a4' })` ile oluşturulur
  - `o.order_number` — sipariş numarası; varsa `'-'` ile bölünerek ikinci parça alınır
  - `o.id` — sipariş ID'si; `order_number` yoksa son 8 karakteri büyük harfle kullanılır
  - `orderNo` — proforma numarası; `o.order_number` veya `o.id` türetilir
  - `o.created_at` — sipariş oluşturulma tarihi; `formatDateTime()` ile biçimlendirilir
  - `lang` — dil parametresi; tarih ve para birimi biçimlendirmede kullanılır
  - `o.customer_name` — müşteri adı; PDF'de gösterilir
  - `o.customer_email` — müşteri e-postası; varsa PDF'de gösterilir
  - `head` — tablo başlık satırı; çeviri fonksiyonu ile oluşturulur
  - `o.order_items` — sipariş kalemleri dizisi; tablo gövdesi için dönüştürülür
  - `body` — tablo gövdesi; her kalem için `[ürün_adı, miktar, birim_fiyat, toplam_fiyat]` dizisi
  - `formatCurrency` — para birimi biçimlendirme fonksiyonu; fiyatlar için kullanılır
  - `SYSTEM_CURRENCY` — sistem para birimi sabiti; `formatCurrency`'ye iletilir
  - `after` — autoTable bitiş Y koordinatı; `doc.lastAutoTable.finalY` veya 100
  - `o.total_amount` — sipariş toplam tutarı; grand total satırında gösterilir
  - `t` — çeviri fonksiyonu; `t('orders.grandTotal')` anahtarı için kullanılır
  - `e` — catch bloğunda yakalanan hata nesnesi
  - `toast` — bildirim fonksiyonu; hata durumunda `toast.error()` çağrılır
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::reorder
- **params**: `o` — yeniden sipariş verilecek `Order` nesnesi
- **ic_degiskenler**:
  - `o.order_items` — sipariş kalemleri dizisi; ürün ID'leri ve isimleri çıkarılır
  - `ids` — benzersiz ürün ID'leri dizisi; `Set` ile tekrarlar kaldırılır, boş olmayan `product_id` değerleri filtrelenir
  - `names` — benzersiz ürün adları dizisi; `product_id` olmayan ama `product_name` olan kalemlerden çıkarılır
  - `productMap` — ürün haritası; `Record<string, Product>` tipinde, ID ve isim anahtarlarıyla ürünleri saklar
  - `supabase` — Supabase istemcisi; `products` tablosundan veri çeker
  - `VARIANT_DETAIL_COLUMNS` — ürün sütun seçimi sabiti; Supabase select sorgusunda kullanılır
  - `data` — Supabase sorgusundan dönen ürün verisi; `Product[]` tipine dönüştürülür
  - `error` — Supabase sorgu hatası; varsa throw edilir
  - `added` — sepete eklenen toplam miktar; sayaç olarak kullanılır
  - `it` — döngüdeki sipariş kalemi; `product_id` veya `product_name` ile eşleştirilir
  - `prod` — eşleştirilen `Product` nesnesi; `productMap`'ten ID veya isimle aranır
  - `addToCart` — sepete ekleme fonksiyonu; `prod` ve `it.quantity` ile çağrılır
  - `toast` — bildirim fonksiyonu; başarılı durumda `toast.success()`, hata durumunda `toast.error()` çağrılır
  - `t` — çeviri fonksiyonu; `t('orders.reorderedToast')`, `t('orders.reorderNotFound')`, `t('orders.reorderError')` anahtarları için kullanılır
  - `router` — Next.js router nesnesi; sepet sayfasına yönlendirme için kullanılır
  - `Routes` — rota sabitleri nesnesi; `Routes.cart()` fonksiyonu çağrılır
  - `e` — catch bloğunda yakalanan hata nesnesi
  - `console.error` — hata günlüğü; yakalanan hatayı konsola yazar
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::getStatusColor
- **params**: `status` — sipariş durumu string'i
- **ic_degiskenler**:
  - `status` — sipariş durumu; `toLowerCase()` ile küçük harfe dönüştürülerek eşleştirilir
- **Dönüş**: string — Tailwind CSS renk sınıfı; duruma göre `bg-yellow-100 text-yellow-800`, `bg-blue-100 text-blue-800`, `bg-purple-100 text-purple-800`, `bg-green-100 text-green-800`, `bg-red-100 text-red-800` veya `bg-gray-100 text-gray-800`

### [N9_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::getStatusText
- **params**: `status` — sipariş durumu string'i
- **ic_degiskenler**:
  - `status` — sipariş durumu; `toLowerCase()` ile küçük harfe dönüştürülerek eşleştirilir
  - `t` — çeviri fonksiyonu; durum metinleri için `t('orders.pending')`, `t('orders.paid')`, `t('orders.shipped')`, `t('orders.delivered')`, `t('orders.failed')`, `t('orders.cancelled')`, `t('orders.refunded')` anahtarları kullanılır
- **Dönüş**: string — çevrilmiş durum metni veya eşleşme yoksa orijinal `status` değeri

### [N10_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::step render callback
- **params**: `s` — adım durumu string'i, `idx` — adım indeksi numarası
- **ic_degiskenler**:
  - `s` — adım durumu; `getStatusText(s)` ile çevrilerek gösterilir
  - `idx` — adım indeksi; 0'dan başlar, aktif adım kontrolünde kullanılır
  - `activeIdx` — aktif adım indeksi; `idx <= activeIdx` kontrolüyle adım durumu belirlenir
  - `steps` — adımlar dizisi; son adım kontrolünde `steps.length - 1` ile karşılaştırılır
  - `getStatusText` — durum metni fonksiyonu; `s` parametresiyle çağrılır
- **Dönüş**: JSX element — adım göstergesi (daire + metin + çizgi)

### [N11_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::tab render callback
- **params**: `tt` — sekme adı string'i
- **ic_degiskenler**:
  - `tt` — sekme adı; `'overview'`, `'items'`, `'shipping'`, `'invoice'` değerlerinden biri
  - `setTab` — sekme state setter fonksiyonu; tıklama olayında `setTab(tt)` çağrılır
  - `tab` — aktif sekme; `tab === tt` kontrolüyle aktif stil belirlenir
  - `t` — çeviri fonksiyonu; `t('orders.tabs.overview')`, `t('orders.tabs.items')`, `t('orders.tabs.shipping')`, `t('orders.tabs.invoice')` anahtarları için kullanılır
- **Dönüş**: JSX element — sekme butonu

### [N12_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::adres render callback
- **params**: yok
- **ic_degiskenler**:
  - `order` — sipariş nesnesi; `order.shipping_address` alanına erişilir
  - `addr` — `order.shipping_address`'in `ShippingAddress` tipine dönüştürülmüş hali
  - `addr.fullAddress` — tam adres; `addr.street`'e fallback olarak kullanılır
  - `addr.street` — sokak adresi; `line1`'e atanır
  - `addr.city` — şehir; `line2`'ye eklenir
  - `addr.district` — ilçe; `addr.state`'e fallback olarak kullanılır, `line2`'ye eklenir
  - `addr.state` — eyalet/il; `addr.district` yoksa kullanılır
  - `addr.postalCode` — posta kodu; `addr.postal_code`'a fallback olarak kullanılır
  - `addr.postal_code` — posta kodu (alternatif alan adı); `line3`'e atanır
  - `line1` — birinci adres satırı; `addr.fullAddress || addr.street`
  - `line2` — ikinci adres satırı; `[addr.city, addr.district || addr.state].filter(Boolean).join(', ')`
  - `line3` — üçüncü adres satırı; `addr.postalCode || addr.postal_code`
- **Dönüş**: JSX element — adres bilgisi div'i

### [N13_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::sipariş kalemi render callback
- **params**: `item` — sipariş kalemi nesnesi
- **ic_degiskenler**:
  - `item.id` — kalem ID'si; `key` prop'u olarak kullanılır
  - `item.product_id` — ürün ID'si; varsa `Routes.legacyProduct(item.product_id)` ile ürün sayfasına link oluşturulur
  - `item.product_name` — ürün adı; tablo hücresinde gösterilir
  - `item.product_sku` — ürün SKU'su; varsa `t('orders.skuLabel', { sku: item.product_sku })` ile gösterilir
  - `item.product_image_url` — ürün görsel URL'si; varsa `VentImage` bileşeniyle gösterilir
  - `item.quantity` — miktar; tablo hücresinde gösterilir
  - `item.unit_price` — birim fiyat; `formatPrice(item.unit_price)` ile biçimlendirilir
  - `item.total_price` — toplam fiyat; `formatPrice(item.total_price)` ile biçimlendirilir
  - `Routes` — rota sabitleri nesnesi; `Routes.legacyProduct()` fonksiyonu çağrılır
  - `Link` — Next.js Link bileşeni; ürün sayfasına yönlendirme için kullanılır
  - `VentImage` — özel görsel bileşeni; ürün görseli için kullanılır
  - `t` — çeviri fonksiyonu; `t('orders.skuLabel')` ve `t('orders.noImage')` anahtarları için kullanılır
  - `formatPrice` — fiyat biçimlendirme fonksiyonu; birim ve toplam fiyatlar için kullanılır
- **Dönüş**: JSX element — tablo satırı (`<tr>`)

### [N14_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::fatura bilgisi render callback
- **params**: yok
- **ic_degiskenler**:
  - `order` — sipariş nesnesi; `order.invoice_info` ve `order.invoice_type` alanlarına erişilir
  - `info` — `order.invoice_info`'nun `Record<string, unknown>` tipine dönüştürülmüş hali
  - `iv` — fatura alanı okuma fonksiyonu; `info?.[k]` değerini string'e dönüştürür, yoksa `'-'` döner
  - `order.invoice_type` — fatura tipi; `'corporate'` ise kurumsal, değilse bireysel gösterilir
  - `info.companyName` — şirket adı; kurumsal faturada gösterilir
  - `info.vkn` — vergi kimlik numarası; kurumsal faturada gösterilir
  - `info.taxOffice` — vergi dairesi; kurumsal faturada gösterilir
  - `info.tckn` — T.C. kimlik numarası; bireysel faturada gösterilir
  - `t` — çeviri fonksiyonu; `t('account.orderDetail.companyTitleLabel')`, `t('account.orderDetail.vknLabel')`, `t('account.orderDetail.taxOfficeLabel')`, `t('account.orderDetail.tcknLabel')` anahtarları için kullanılır
- **Dönüş**: JSX element — fatura bilgisi div'i

### [N15_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::yasal onay render callback
- **params**: yok
- **ic_degiskenler**:
  - `order` — sipariş nesnesi; `order.legal_consents` alanına erişilir
  - `cons` — `order.legal_consents`'in `Record<string, { accepted?: boolean; ts?: string | null }>` tipine dönüştürülmüş hali
  - `row` — onay satırı render fonksiyonu; `label` ve `k` parametreleriyle çağrılır
  - `formatDateTime` — tarih biçimlendirme fonksiyonu; onay tarihi için kullanılır
  - `lang` — dil parametresi; tarih biçimlendirmede kullanılır
  - `t` — çeviri fonksiyonu; `t('account.orderDetail.consentDistanceSales')`, `t('account.orderDetail.consentPreInfo')`, `t('account.orderDetail.consentOrderConfirm')`, `t('account.orderDetail.consentMarketing')` anahtarları için kullanılır
- **Dönüş**: JSX element — yasal onay listesi

### [N16_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::row (yasal onay satırı)
- **params**: `label` — onay etiketi string'i, `k` — onay anahtarı string'i
- **ic_degiskenler**:
  - `cons` — yasal onaylar nesnesi; `cons?.[k]` ile belirli onay bilgisine erişilir
  - `c` — belirli onay nesnesi; `cons?.[k]`'dan alınır
  - `c.accepted` — onay durumu boolean'ı; `!!c?.accepted` ile dönüştürülür
  - `c.ts` — onay tarihi string'i; varsa `formatDateTime(c.ts, lang)` ile biçimlendirilir
  - `ok` — onaylanmış mı boolean'ı; `!!c?.accepted`
  - `ts` — biçimlendirilmiş onay tarihi; `c.ts` varsa `formatDateTime(c.ts, lang)`, yoksa `'-'`
  - `label` — onay etiketi; `<span>` içinde gösterilir
  - `k` — onay anahtarı; `key` prop'u olarak kullanılır
  - `formatDateTime` — tarih biçimlendirme fonksiyonu; `c.ts` ve `lang` parametreleriyle çağrılır
  - `lang` — dil parametresi; tarih biçimlendirmede kullanılır
  - `t` — çeviri fonksiyonu; `t('account.orderDetail.consentAccepted')` ve `t('account.orderDetail.consentNone')` anahtarları için kullanılır
- **Dönüş**: JSX element — onay satırı div'i

---

## NODE ID STANDARD

  file: src\views\account\OrderDetailPage.tsx
  function: src\views\account\OrderDetailPage.tsx::OrderDetailPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: OrderDetailPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-clean-white`, `bg-green-100`, `bg-orange-100`, `bg-orange-100/80`, `bg-primary-navy`, `bg-primary-navy/5`, `bg-slate-100`, `bg-slate-100/80`, `bg-slate-200`, `bg-slate-50`, `bg-slate-50/80`, `bg-white`, `border-b`, `border-b-2`, `border-gray-100`
- **Layout:** `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `gap-6`, `grid`, `grid-cols-1`, `h-1`, `h-10`, `h-12`, `h-6`
- **Varyant/Responsive:** `:`, `focus-visible:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${activeIdx`, `${getStatusColor(order.status`, `${idx`, `${ok`, `${tab`, `1`, `:`, `<=`, `===`, `>=`, `activeIdx`, `animate-spin`, `border`, `break-all`, `divide-slate-100`