---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-altyapi\src\views\account\OrderDetailPage.tsx
skeleton_hash: 884bfc2dd0c01b0e
entity_hashes:
  func:OrderDetailPage: dfa1eb0c67bb7d37
  overview: c0f73db07d5be692
  style_tokens: 2d7ff3d6e2a546ab
generated_at: 2026-08-18T06:53:36Z
---

## Genel Bakış
Bu modül, kullanıcı hesap panelinden erişilen tek bir siparişin tüm detaylarını görüntüleyen React sayfa bileşenidir. Sipariş özeti, ürünler, ödeme bilgileri ve teslimat durumunu düzenli bir arayüzde sunarak kullanıcıya siparişinin tamamını tek bir sayfada inceleme imkânı sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve merkezi bileşeni olup, sipariş verisini alarak sayfa düzenini oluşturur ve ilgili alt bileşenleri bir araya getirerek sipariş detay sayfasını kullanıcıya render eder.
- OrderDetailPage

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### OrderDetailPage
**Ne yapar**: Kullanıcının belirli bir siparişinin detaylı görünümünü sunan React bileşenidir. Sipariş özeti, ürünler, kargo takibi ve fatura olmak üzere dört sekmede bilgi görüntüler; sipariş durumunu adım adım gösteren bir ilerleme çubuğu ve yeniden sipariş verme gibi eylemler sunar.

**Nasıl yapar**: `useSearchParams` hook'u ile URL'den sipariş ID'sini alır. `useAuth` hook'u ile kimlik doğrulaması kontrol eder; kullanıcı giriş yapmamışsa `useRouter` ile login sayfasına yönlendirme yapar. `useEffect` içindeki `load` asenkron fonksiyonu ile Supabase veritabanından `venthub_orders` tablosuna ilişkisel sorgu (`.select` ile `venthub_order_items` join'i) göndererek tek bir sorguda sipariş ana verilerini ve kalemleri çeker. Ham verileri `Order` ve `OrderItem` tiplerine dönüştürürken `*_snapshot` kolonlarından (`product_name_snapshot`, `unit_price_snapshot`, `product_sku_snapshot`) okuma yaparak sipariş anındaki fiyat ve ürün bilgisini korur (W2b-2 snapshot prensibi). `handleInvoicePdf` fonksiyonunda `jsPDF` ve `jspdf-autotable` paketlerini `Promise.all` ile dinamik import ederek proforma PDF'i oluşturur ve indirir. `handleReorder` fonksiyonunda sipariş kalemlerinden ürünleri sorgulayarak sepete ekler. `useI18n` hook'u ile çoklu dil desteği, `useCart` hook'u ile sepet yönetimi sağlar.

**Parametreler**: Parametre almaz (React bileşeni, props’suz fonksiyonel bileşendir).

**Dönüş**: JSX.Element — Sipariş detay sayfasını oluşturan React JSX'i; yükleme durumunda spinner, sipariş hazır olduğunda tam sayfa arayüzü döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useCartHook::useCart
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
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

### [N1_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::authRedirectEffect
- **params**: (yok — anonim arrow fonksiyon)
- **ic_degiskenler**:
  - `authLoading` — useAuth hook'undan gelen yükleme durumu bayrağı
  - `user` — useAuth hook'undan gelen oturum açmış kullanıcı nesnesi
  - `router` — useRouter() navigasyon nesnesi
  - `id` — useSearchParams'dan gelen sipariş URL parametresi
  - `Routes.auth.login(...)` — login sayfası rotası, argüman olarak orderDetail rotası verilir
  - `Routes.account.orderDetail(id)` — mevcut sipariş detay rotası
- **Dönüş**: yok (yan etki: `router.push` ile login sayfasına yönlendirme)

---

### [N2_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::loadEffect
- **params**: (yok — anonim arrow fonksiyon, useEffect callback)
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi; load içinde koruma kontrolü yapılır
  - `id` — useSearchParams'dan gelen sipariş ID'si; load içinde koruma kontrolü yapılır
  - `load` — effectscope içinde tanımlı asenkron yardımcı fonksiyon; veri çekme işlemini yürütür ve ardından hemen çağrılır
- **Dönüş**: yok (yan etki: asenkron veri yükleme, state güncellemeleri)

---

### [N3_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::load
- **params**: (yok — `async function load()`)
- **ic_degiskenler**:
  - `orderData` — `supabase.from('venthub_orders').select(...).eq('id', id).single()` sorgusundan dönen sipariş ve ilişkili kalemler verisi (ilişkisel sorgu ile tek seferde çekilen ana + detay verisi)
  - `orderError` — Supabase sorgu sonucundan destructuring ile alınan hata nesnesi; throw ile yukarı fırlatılır
  - `rawItems` — `orderData.venthub_order_items` alanının `Record<string, unknown>[]` tipine cast edilmiş ham kalem dizisi; `|| []` ile boş dizi fallback'i
  - `mappedItems` — `rawItems.map(...)` çağrısı ile `OrderItem[]` formatına dönüştürülmüş sipariş kalemleri dizisi
  - `mappedOrder` — Tüm sipariş alanlarının `Order` tipine dönüştürülmüş tam nesne; snapshot kolonları, fallback değerler ve `user` nesnesinden türetilen alanlar dahil
  - `e` — try-catch yakalama değişkeni; `console.error` ve `toast.error` ile işlenir
- **Dönüş**: yok (yan etki: `setOrder(mappedOrder)`, `setLoading(false)`, `toast.error`)
- **API Çağrıları**: `supabase.from('venthub_orders').select(relationalQuery).eq('id', id).single()`
- **Dict Erişimleri**: `orderData.id`, `orderData.total_amount`, `orderData.status`, `orderData.payment_status`, `orderData.created_at`, `orderData.customer_name`, `orderData.customer_email`, `orderData.shipping_address`, `orderData.order_number`, `orderData.conversation_id`, `orderData.carrier`, `orderData.tracking_number`, `orderData.tracking_url`, `orderData.shipped_at`, `orderData.delivered_at`, `orderData.shipping_method`, `orderData.invoice_type`, `orderData.invoice_info`, `orderData.legal_consents`, `orderData.venthub_order_items`, `user?.user_metadata?.full_name`, `user?.email`

---

### [N4_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::mapOrderItem
- **params**: `(it)` — Ham sipariş kalemi satırı (`Record<string, unknown>`)
- **ic_degiskenler**:
  - `unit` — `Number(it.unit_price_snapshot) || 0` hesaplaması ile elde edilen birim fiyat (sayısal, snapshot kolonundan okunur, canlı katalogdan değil)
  - `qty` — `Number(it.quantity) || 0` hesaplaması ile elde edilen ürün miktarı (sayısal)
- **Dönüş**: `OrderItem` nesnesi — `id`, `product_id`, `product_name`, `product_sku`, `quantity`, `unit_price`, `total_price` (`unit * qty`), `product_image_url` alanlarını içerir
- **Dict Erişimleri**: `it.unit_price_snapshot`, `it.quantity`, `it.id`, `it.product_id`, `it.product_name_snapshot`, `it.product_sku_snapshot`, `it.product_image_url`

---

### [N5_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::copyToClipboard
- **params**: `(text?: string)` — Kopyalanacak metin dizgesi (opsiyonel)
- **ic_degiskenler**:
  - (yok — parametre ve API çağrıları dışında yerel değişken yok)
- **Dönüş**: yok (yan etki: `navigator.clipboard.writeText(text)`, `toast.success` veya `toast.error`)
- **API Çağrıları**: `navigator.clipboard.writeText(text)`

---

### [N6_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::generatePDF
- **params**: `(o: Order)` — PDF'i oluşturulacak sipariş nesnesi
- **ic_degiskenler**:
  - `jsPDF` — `import('jspdf')` dinamik import'undan gelen varsayılan dışa aktarım; PDF belge sınıfı
  - `autoTable` — `import('jspdf-autotable')` dinamik import'undan gelen varsayılan dışa aktarım; tablo ekleme fonksiyonu
  - `doc` — `new jsPDF({ unit: 'pt', format: 'a4' })` ile oluşturulan PDF belge nesnesi
  - `orderNo` — Proforma numarası; `o.order_number` varsa `'-'` ile bölünüp ikinci parça alınır, yoksa `o.id.slice(-8).toUpperCase()` fallback'i
  - `head` — Tablo başlık satırı dizisi: `[t('orders.productCol'), t('orders.qtyCol'), t('orders.unitPriceCol'), t('orders.totalCol')]`
  - `body` — `o.order_items.map(...)` ile oluşturulan tablo gövde satırları; her satır `[ürünAdı, miktar, birimFiyat, toplamFiyat]` formatında
  - `after` — Tablonun bittiği Y koordinatı; `(doc as ...).lastAutoTable?.finalY || 100` ile hesaplanır
  - `e` — try-catch yakalama değişkeni
- **Dönüş**: yok (yan etki: `doc.save(...)` ile PDF dosyası indirilir, `toast.error` hata durumunda)
- **Dinamik Importlar**: `import('jspdf')`, `import('jspdf-autotable')`
- **Dict Erişimleri**: `o.order_number`, `o.created_at`, `o.customer_name`, `o.customer_email`, `o.order_items`, `o.total_amount`

---

### [N7_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::reorder
- **params**: `(o: Order)` — Tekrar sipariş verilecek sipariş nesnesi
- **ic_degiskenler**:
  - `ids` — `o.order_items` içindeki `product_id` alanlarının benzersiz, null/undefined filtreli string dizisi; `Array.from(new Set(...))` ile elde edilir
  - `names` — `product_id`'si olmayan kalemlerin `product_name` değerlerinin benzersiz dizisi; products tablosunda isim ile arama için kullanılır
  - `productMap` — `Record<string, Product>` sözlüğü; ürün ID'si veya adına göre `Product` nesnesini eşler
  - `data` — `supabase.from('products').select(VARIANT_DETAIL_COLUMNS).in('id', ids)` sorgusundan dönen ürün verisi
  - `error` — IDs tabanlı Supabase sorgu hatası
  - `p` — `forEach` callback parametresi; `Product` nesnesi; `productMap[p.id]` veya `productMap[p.name]` olarak kaydedilir
  - `added` — Sepete eklenen toplam ürün adedi sayacı
  - `it` — `for...of` döngü değişkeni; `o.order_items` içindeki her sipariş kalemi
  - `prod` — Mevcut kaleme karşılık gelen `Product` nesnesi; önce `productMap[it.product_id]`, sonra fallback olarak `productMap[it.product_name]` ile bulunur
  - `e` — try-catch yakalama değişkeni
- **Dönüş**: yok (yan etki: `addToCart(prod, it.quantity)`, `toast.success`/`toast.error`, `router.push(Routes.cart())`)
- **API Çağrıları**: `supabase.from('products').select(VARIANT_DETAIL_COLUMNS).in('id', ids)`, `supabase.from('products').select(VARIANT_DETAIL_COLUMNS).in('name', names)`
- **Dict Erişimleri**: `productMap[p.id]`, `productMap[p.name]`, `productMap[it.product_id]`, `productMap[it.product_name]`, `it.product_id`, `it.product_name`, `it.quantity`

---

### [N8_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::getStatusColor
- **params**: `(status: string)` — Sipariş veya ödeme durumu dizgesi
- **ic_degiskenler**:
  - (yok — parametre dışında yerel değişken yok)
- **Dönüş**: `string` — Tailwind CSS class adı (ör. `'bg-yellow-100 text-yellow-800'`, `'bg-blue-100 text-blue-800'`); durum değerine göre `switch/case` ile belirlenir; `'pending'`, `'paid'`/`'confirmed'`, `'shipped'`, `'delivered'`, `'failed'`/`'cancelled'` ve default kolları vardır

---

### [N9_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::getStatusText
- **params**: `(status: string)` — Sipariş veya ödeme durumu dizgesi
- **ic_degiskenler**:
  - (yok — parametre dışında yerel değişken yok)
- **Dönüş**: `string` — `t()` uluslararasılaştırma fonksiyonu ile çevrilmiş durum metni (ör. `t('orders.pending')`); `'refunded'` durumu ek olarak ele alınır; bilinmeyen durumlarda ham `status` dizgesi döner

---

### [N10_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::renderStep
- **params**: `(s, idx)` — `s`: adım durumu dizgesi, `idx`: adımın sırası (0-tabanlı indeks)
- **ic_degiskenler**:
  - (yok — yerel değişken yok; JSX içinde doğrudan hesaplama)
- **Dönüş**: JSX `React.Fragment` — Sipariş takip adımını gösteren daire + çizgi bloğu; `idx <= activeIdx` koşulu ile aktif/pasif renklendirme; `getStatusText(s)` ile durum metni; `steps.length - 1` kontrolü ile son adımda çizgi gizlenir
- **Dict Erişimleri**: `idx <= activeIdx` (dış kapsam değişkeni `activeIdx`)

---

### [N11_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::renderTabButton
- **params**: `(tt)` — Sekme identifier dizgesi (ör. `'overview'`, `'items'`, `'shipping'`, `'invoice'`)
- **ic_degiskenler**:
  - (yok — yerel değişken yok)
- **Dönüş**: JSX `button` elementi — `onClick={() => setTab(tt)}` ile aktif sekme değiştirilir; `tab === tt` koşulu ile aktif/pasif stil uygulanır; her `tt` değeri için `t()` ile çevrilmiş sekme başlığı gösterilir
- **Dict Erişimleri**: `tab === tt` (dış kapsam değişkeni `tab`)

---

### [N12_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::renderShippingAddress
- **params**: (yok — anonim arrow fonksiyon)
- **ic_degiskenler**:
  - `addr` — `order.shipping_address` alanının `ShippingAddress` tipine cast edilmiş hali; kargo adresi nesnesi
  - `line1` — Tam adres satırı; `addr.fullAddress` varsa o alınır, yoksa `addr.street` fallback'i
  - `line2` — İlçe/İl bilgisi; `addr.city` ve `addr.district || addr.state` değerlerinin `', '` ile birleşimi; `filter(Boolean)` ile boş değerler temizlenir
  - `line3` — Posta kodu; `addr.postalCode || addr.postal_code` ile iki farklı isimlendirme desteklenir
- **Dönüş**: JSX `div` elementi — Adres satırlarını (`line1`, `line2`, `line3`) koşullu olarak gösteren `<p>` blokları
- **Dict Erişimleri**: `order.shipping_address`, `addr.fullAddress`, `addr.street`, `addr.city`, `addr.district`, `addr.state`, `addr.postalCode`, `addr.postal_code`

---

### [N13_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::renderOrderItemRow
- **params**: `(item)` — Tek bir sipariş kalemi nesnesi (`OrderItem`); `product_id`, `product_name`, `product_sku`, `quantity`, `unit_price`, `total_price`, `product_image_url` alanlarını içerir
- **ic_degiskenler**:
  - (yok — yerel değişken yok; JSX içinde doğrudan parametre erişimi)
- **Dönüş**: JSX `tr` elementi — Ürün adı (`item.product_name`), SKU etiketi (`item.product_sku`), ürün görseli (`item.product_image_url` ile `VentImage`), miktar (`item.quantity`), birim fiyat (`item.unit_price` ile `formatPrice`), toplam fiyat (`item.total_price` ile `formatPrice`); `item.product_id` varsa ürün adına `Link` ile tıklanabilir bağlantı eklenir
- **Dict Erişimleri**: `item.product_id`, `item.product_name`, `item.product_sku`, `item.product_image_url`, `item.quantity`, `item.unit_price`, `item.total_price`

---

### [N14_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::renderInvoiceInfo
- **params**: (yok — anonim arrow fonksiyon)
- **ic_degiskenler**:
  - `info` — `order.invoice_info` alanının `Record<string, unknown>` tipine cast edilmiş fatura bilgisi sözlüğü; `|| {}` ile boş nesne fallback'i
  - `iv` — İç helper fonksiyon `(k: string) => string`; `info?.[k]` erişimi ile belirli bir anahtarın değerini `String()` ile döner, yoksa `'-'` döner
- **Dönüş**: JSX element — `order.invoice_type` `'corporate'` ise kurumsal fatura bilgileri (`companyName`, `vkn`, `taxOffice`); değilse bireysel fatura bilgisi (`tckn`); her alan `iv()` helper'ı ile okunur
- **Dict Erişimleri**: `order.invoice_info`, `order.invoice_type`, `info?.[k]`, `info[k]`

---

### [N15_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::renderLegalConsents
- **params**: (yok — anonim arrow fonksiyon)
- **ic_degiskenler**:
  - `cons` — `order.legal_consents` alanının `Record<string, { accepted?: boolean; ts?: string | null }>` tipine cast edilmiş yasal onay sözlüğü; `|| {}` ile boş nesne fallback'i
  - `row` — İç helper fonksiyon `(label: string, k: string) => JSX`; belirli bir onay kaydının etiketini, kabul durumunu ve zaman damgasını gösterir; `[N16_NASIL]` fonksiyonunun aynısıdır
- **Dönüş**: JSX fragment — Beş onay satırı: `'kvkk'`, `'distanceSales'`, `'preInfo'`, `'orderConfirm'`, `'marketing'`; her biri `row()` helper'ı ile render edilir
- **Dict Erişimleri**: `order.legal_consents`, `cons?.[k]`

---

### [N16_NASIL] AST Pointer: `src\views\account\OrderDetailPage.tsx`::renderConsentRow
- **params**: `(label: string, k: string)` — `label`: Görünen etiket metni, `k`: Onay kaydının sözlük anahtarı
- **ic_degiskenler**:
  - `c` — `cons?.[k]` erişimi ile elde edilen tekil onay nesnesi (`{ accepted?: boolean; ts?: string | null }`)
  - `ok` — `!!c?.accepted` ile hesaplanan boolean; onayın verilip verilmediğini gösterir
  - `ts` — `c?.ts ? formatDateTime(c.ts, lang) : '-'` ile formatlanmış zaman damgası dizgesi
- **Dönüş**: JSX `div` elementi — Sol tarafta etiket, sağ tarafta zaman damgası ve onay durumu rozeti (`accepted` ise yeşil, değilse gri); `formatDateTime(c.ts, lang)` ile tarih formatlanır
- **Dict Erişimleri**: `cons?.[k]`, `c?.accepted`, `c?.ts`

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