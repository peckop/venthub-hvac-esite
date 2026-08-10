---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\OrderDetailPage.tsx
skeleton_hash: 5bdff96bddcc93df
entity_hashes:
  func:OrderDetailPage: ac807f69496e29a7
  overview: c849ca7afaf0a8b3
  style_tokens: 2d7ff3d6e2a546ab
generated_at: 2026-06-19T20:49:33Z
---

## Genel Bakış
Bu modül, kullanıcının hesap panelinden erişebildiği tek bir siparişin tüm detaylarını gösteren bir React sayfa bileşenidir. Sipariş özeti, ürünler, ödeme bilgileri ve teslimat durumu gibi bilgileri düzenli bir arayüzde sunarak kullanıcıya siparişinin tamamını tek bir sayfada inceleme imkânı sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek bileşeni olup, sipariş verisini alarak sayfa düzenini oluşturur ve ilgili alt bileşenleri bir araya getirerek sipariş detay sayfasını kullanıcıya render eder.
- OrderDetailPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen fonksiyon gövdesi (implementation body) bulunmamaktadır; yalnızca imza (`def OrderDetailPage()`) ve modül sabitleri (boş) verilmiştir. Bu nedenle, fonksiyon gövdesinden türetilebilecek mimari varsayım tanımlanamamaktadır.

---

## FONKSİYON DETAYLARI

### OrderDetailPage
**Ne yapar**: Kullanıcının belirli bir siparişinin tüm detaylarını (özet, ürünler, kargo, fatura) görüntülediği, sipariş durumunu takip ettiği ve yeniden sipariş/PDF oluşturma gibi işlemleri yapabildiği React bileşenidir.

**Nasıl yapar**: Bileşen, URL parametrelerinden sipariş kimliğini alır ve kullanıcının oturum durumunu kontrol eder. Supabase'den `venthub_orders` tablosunu ilişkisel sorguyla (`venthub_order_items` ile join) çekerek sipariş verilerini ve kalemlerini tek seferde yükler. Veriler `Order` ve `OrderItem` tiplerine dönüştürülerek state'e kaydedilir. Bileşen, dil ve rotalama için `useI18n` ve `useLocalizedRoutes` hook'larını, sepet işlemleri için `useCart` hook'unu kullanır. PDF oluşturmak için `jsPDF` ve `jspdf-autotable` modülleri dinamik olarak import edilerek proforma fatura oluşturulur. Sipariş durumuna göre renk kodları ve ilerleme çubuğu hesaplanarak görsel geri bildirim sağlanır.

**Parametreler**:
- Bu bileşen parametre almaz (React fonksiyonel bileşeni, props'u yok).

**Dönüş**:
- `JSX.Element` — Sipariş detay sayfasının tüm arayüzünü (başlık, durum çubuğu, sekmeli içerik alanı) içeren React JSX yapısı.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useCartHook::useCart
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDateTime
- import: ../../i18n/format::formatCurrency
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

### [N1_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::authGuardEffect
- **params**: (parametre yok — anonim arrow, React useEffect callback'i)
- **ic_degiskenler**: (useEffect scope'undan erişilen hook değişkenleri)
  - `authLoading` — useAuth hook'undan gelen yükleme durumu flag'i
  - `user` — useAuth hook'undan gelen mevcut kullanıcı nesnesi, null ise giriş yapılmamıştır
  - `router` — useRouter() hook'undan gelen Next.js router instance'ı, sayfa yönlendirmesi için kullanılır
  - `id` — URL parametresinden gelen sipariş identifier'ı, login sonrası yönlendirme URL'i için kullanılır
- **Dönüş**: yok (yan etki: `router.push` ile login sayfasına yönlendirme)

### [N2_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::useEffectLoadCallback
- **params**: (parametre yok — anonim arrow, React useEffect callback'i)
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, yoksa load iptal edilir
  - `id` — useSearchParams veya component prop'undan gelen sipariş ID'si, yoksa load iptal edilir
- **Dönüş**: yok (yan etki: `load()` asenkron fonksiyonunu çağırır)

### [N3_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::load
- **params**: (parametre yok — inner async function)
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, null ise fonksiyon erken döner
  - `id` — sipariş ID'si, string veya undefined, null ise fonksiyon erken döner
  - `setLoading` — useState setter'ı, yükleme durumunu true/false yapar
  - `orderData` — supabase sorgusundan dönen tek sipariş kaydı (venthub_orders + venthub_order_items join)
  - `orderError` — supabase sorgusundan dönen hata nesnesi, varsa throw edilir
  - `rawItems` — `orderData.venthub_order_items` alanının `Record<string, unknown>[]` türünde ham dizi karşılığı, boş dizi fallback'li
  - `it` — rawItems.map callback parametresi, her bir ham sipariş kalemi
  - `unit` — `it.price_at_time` değerinin Number karşılığı, birim fiyat, 0 fallback'li
  - `qty` — `it.quantity` değerinin Number karşılığı, adet, 0 fallback'li
  - `mappedItems` — `OrderItem[]` türüne dönüştürülmüş sipariş kalemleri dizisi
  - `mappedOrder` — `Order` türüne tam olarak eşlenmiş sipariş nesnesi, tüm supabase alanlarını içerir
  - `e` — catch bloğu hata nesnesi, console.error'a yazılır
- **Dönüş**: yok (yan etki: `setOrder(mappedOrder)` ile sipariş state'ini günceller, `setLoading(false)` ile yükleme bitirir, `toast.error` ile hata bildirir)

### [N4_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::mapOrderItemCallback
- **params**: `it` — `Record<string, unknown>` türünde ham sipariş kalemi objesi
- **ic_degiskenler**:
  - `unit` — `it.price_at_time` değerinin `Number()` karşılığı, birim fiyat, `|| 0` ile fallback
  - `qty` — `it.quantity` değerinin `Number()` karşılığı, adet miktarı, `|| 0` ile fallback
- **Dönüş**: `OrderItem` nesnesi — `{ id, product_id, product_name, quantity, unit_price, total_price, product_image_url }`

### [N5_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::copyToClipboard
- **params**: `text` — `string | undefined`, panoya kopyalanacak metin, undefined veya boşsa fonksiyon erken döner
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `navigator.clipboard.writeText` ile panoya yazar, `toast.success` veya `toast.error` ile bildirim gösterir)

### [N6_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::generateProformaPDF
- **params**: `o` — `Order` türüne ait sipariş nesnesi, PDF içeriği bu nesneden üretilir
- **ic_degiskenler**:
  - `jsPDF` — dinamik `import('jspdf')` ile lazy yüklenen PDF oluşturma sınıfı (default export)
  - `autoTable` — dinamik `import('jspdf-autotable')` ile lazy yüklenen tablo ekleme fonksiyonu (default export)
  - `doc` — `new jsPDF(...)` ile oluşturulan PDF doküman instance'ı, A4 boyutunda, pt birimi
  - `orderNo` — sipariş numarası string'i, `o.order_number` varsa `'-'` split'inden [1] alınır, yoksa `o.id.slice(-8).toUpperCase()` fallback
  - `head` — tablo başlık satırı dizisi, `t()` i18n fonksiyonu ile çevrilmiş sütun başlıkları
  - `body` — `o.order_items` dizisinin map'lenmesiyle oluşan tablo gövdesi, her satır `[productName, quantity, unitPrice, totalPrice]`
  - `after` — `doc.lastAutoTable.finalY` değerinden hesaplanan tablo altı Y koordinatı, fallback 100
  - `e` — catch bloğu hata nesnesi
- **Dönüş**: yok (yan etki: `doc.save(...)` ile PDF dosyasını indirir, hata durumunda `toast.error` gösterir)

### [N7_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::reorderToCart
- **params**: `o` — `Order` türüne ait sipariş nesnesi, yeniden sipariş verilecek ürünler bu nesneden alınır
- **ic_degiskenler**:
  - `ids` — sipariş kalemlerinden benzersiz `product_id` değerlerinin string dizisi, `filter(Boolean)` ile undefined olanlar çıkarılır
  - `names` — `product_id` olmayan kalemlerden benzersiz `product_name` değerlerinin string dizisi
  - `productMap` — `Record<string, Product>` türüne ait ürün haritası, supabase'den çekilen ürünler burada saklanır
  - `data` — `supabase.from('products').select(...)` sorgusundan dönen ürün dizisi (id ile sorgulama)
  - `error` — supabase ürün sorgusundan dönen hata nesnesi
  - `p` — `data` dizisi üzerindeki `forEach` iterasyon parametresi, her bir Product nesnesi
  - `data` — ikinci sorgudan (name ile) dönen ürün dizisi
  - `error` — ikinci sorgudan dönen hata nesnesi
  - `p` — ikinci sorgu forEach iterasyon parametresi
  - `added` — sepete eklenen toplam ürün adedi sayacı, başlangıç 0
  - `it` — `o.order_items` üzerindeki `for...of` iterasyon parametresi
  - `prod` — `productMap` içinden eşleşen Product nesnesi veya undefined
  - `e` — catch bloğu hata nesnesi
- **Dönüş**: yok (yan etki: `addToCart(prod, qty)` ile ürünleri sepete ekler, `router.push(Routes.cart())` ile sepet sayfasına yönlendirir, `toast.success`/`toast.error` ile bildirim gösterir)

### [N8_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::getStatusColorClass
- **params**: `status` — `string` türünde sipariş durumu değeri
- **ic_degiskenler**: (yok — switch/case yapısı içinde parametre directly kullanılır)
- **Dönüş**: `string` — Tailwind CSS renk class'ı (ör. `'bg-yellow-100 text-yellow-800'`), duruma göre belirlenir

### [N9_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::getStatusText
- **params**: `status` — `string` türünde sipariş durumu değeri
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — i18n ile çevrilmiş durum metni (ör. `t('orders.pending')`), tanınmayan durum ise ham status string'i döner

### [N10_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::renderStepItem
- **params**: `s` — step durumu string'i (siparişin o anki aşaması), `idx` — step indeks numarası (number)
- **ic_degiskenler**:
  - `activeIdx` — mevcut aktif step indeksini hesaplayan değişken (useMemo veya hesaplama sonucu), `idx <= activeIdx` koşuluyla renk belirlenir
  - `steps` — sipariş akışındaki tüm adım isimlerinin dizisi, `steps.length` ile son adım kontrolü yapılır
- **Dönüş**: `JSX.Element` — React Fragment içinde step number circle + label + connector bar JSX'i

### [N11_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::renderTabButton
- **params**: `tt` — tab identifier string'i (ör. `'overview'`, `'items'`, `'shipping'`, `'invoice'`)
- **ic_degiskenler**:
  - `tab` — aktif seçili tab'ın state değeri, `setTab` ile değiştirilir
  - `setTab` — useState setter'ı, tab değişiminde çağrılır
- **Dönüş**: `JSX.Element` — tab butonu JSX'i, `onClick` handler ile `setTab(tt)` çağrısı, aktif/pasif conditionally styled

### [N12_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::renderShippingAddress
- **params**: (parametre yok — anonim arrow)
- **ic_degiskenler**:
  - `order` — component state'indeki `Order` nesnesi, `shipping_address` alanı kullanılır
  - `addr` — `order.shipping_address` değerinin `ShippingAddress` türüne cast edilmiş hali
  - `line1` — `addr.fullAddress` veya `addr.street` değerinden oluşan sokak adresi satırı
  - `line2` — `addr.city` ve `addr.district || addr.state` değerlerinin `', '` ile birleştirilmiş hali, `filter(Boolean)` ile boş olanlar çıkarılır
  - `line3` — `addr.postalCode` veya `addr.postal_code` değerinden oluşan posta kodu satırı
- **Dönüş**: `JSX.Element` — `<div>` içinde adres satırlarını conditionally render eden JSX

### [N13_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::renderOrderItemRow
- **params**: `item` — `OrderItem` türüne ait sipariş kalemi nesnesi
- **ic_degiskenler**: (yok — item özellikleri doğrudan JSX içinde kullanılır)
- **Dönüş**: `JSX.Element` — `<tr>` tablo satırı JSX'i, ürün adı (linkli/linkless), görsel (VentImage), adet, birim fiyat, toplam fiyat sütunları

### [N14_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::renderInvoiceInfo
- **params**: (parametre yok — anonim arrow)
- **ic_degiskenler**:
  - `order` — component state'indeki `Order` nesnesi
  - `info` — `order.invoice_info` değerinin `Record<string, unknown>` türüne cast edilmiş hali
  - `iv` — inner arrow fonksiyonu, `(k: string) => String(info[k])` veya `'-'` fallback,_invoice_info alanından değer okumak için helper
- **Dönüş**: `JSX.Element` — kurumsal ise şirket adı/VKN/vergi dairesi, bireysel ise TCKN gösteren JSX

### [N15_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::renderLegalConsents
- **params**: (parametre yok — anonim arrow)
- **ic_degiskenler**:
  - `order` — component state'indeki `Order` nesnesi
  - `cons` — `order.legal_consents` değerinin `Record<string, { accepted?: boolean; ts?: string | null }>` türüne cast edilmiş hali
  - `row` — inner arrow fonksiyonu, `(label: string, k: string) => JSX.Element`, her bir yasal onay satırını render eden helper
- **Dönüş**: `JSX.Element` — KVKK, mesafeli satış, ön bilgilendirme, sipariş onay, pazarlama onay satırlarını gösteren Fragment JSX

### [N16_NASIL] AST Pointer: src/views/account/OrderDetailPage.tsx::renderConsentRow
- **params**: `label` — `string` türünde gösterilecek onay etiketi metni, `k` — `string` türünde legal_consents objesindeki key (ör. `'kvkk'`, `'distanceSales'`)
- **ic_degiskenler**:
  - `cons` — parent scope'daki `order.legal_consents` cast edilmiş `Record<string, { accepted?: boolean; ts?: string | null }>` nesnesi
  - `c` — `cons?.[k]` erişimi ile elde edilen tekil onay kaydı, `{ accepted?: boolean; ts?: string | null }` yapısında
  - `ok` — `!!c?.accepted` boolean flag'i, onay durumu (boolean coercion)
  - `ts` — `c?.ts` varsa `formatDateTime(c.ts, lang)` ile formatlanmış tarih string'i, yoksa `'-'`
- **Dönüş**: `JSX.Element` — `<div>` içinde etiket, tarih damgası ve kabul/ret badge'i gösteren JSX

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