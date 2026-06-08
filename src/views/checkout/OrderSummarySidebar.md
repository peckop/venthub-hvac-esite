---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\OrderSummarySidebar.tsx
skeleton_hash: c470ea53787aa68a
entity_hashes:
  func:OrderSummarySidebar: d1d455540c8e8d0c
  overview: ce3348034c2766ed
  style_tokens: ed45dfd73f706270
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış
VentHub HVAC platformunun ödeme sürecinde yer alan bu modül, sipariş özetini kullanıcı arayüzünün kenar çubuğunda sunmak üzere tasarlanmış bir React bileşeni barındırır. Ödeme akışı sırasında kullanıcının siparişine ait tüm maliyet kalemlerini tek bir noktada görmesini sağlayarak şeffaf bir satın alma deneyimi sunar.

## Fonksiyon Grupları
### Ana Sipariş Özeti Kenar Çubuğu Bileşeni
Tüm sipariş ve maliyet verilerini alarak, ödeme sayfasının kenar çubuğunda kullanıcının erişebileceği düzenli bir sipariş özeti arayüzü oluşturur. Modülün tek ana bileşeni olarak, tüm gelen parametreleri işleyerek tutarlı bir sunum sağlar.
- OrderSummarySidebar

---

## AXIOMS – Mimari Varsayımlar

Bu sipariş özeti kenar çubuğu bileşeni, ödeme sayfasında maliyet kalemlerini sunmak için zorunlu veri parametrelerine ihtiyaç duyar.

[Aksiyom 1]: Eğer `items` parametresi (sipariş kalemleri listesi) sağlanmazsa, kenar çubuğunda hangi ürünlerin sipariş edildiği gösterilemez.

[Aksiyom 2]: Eğer `totalAmount` (ara toplam)parametresi sağlanmazsa, vergi ve indirim öncesi tutar kullanıcıya sunulamaz.

[Aksiyom 3]: Eğer `vatAmount` (KDV tutarı) parametresi sağlanmazsa, vergi kalemi sipariş özetinde gösterilemez.

[Aksiyom 4]: Eğer `finalAmount` (ödenecek nihai tutar) parametresi sağlanmazsa, kullanıcının ne kadar ödeyeceği belirsiz kalır.

[Aksiyom 5]: Fonksiyon imzası `couponApp` ile kesilmiş olup tam parametre adı bilinmemektedir; bu parametrenin tipi, zorunluluğu ve ilişkili işlevi fonksiyon gövdesi incelenmeden belirlenemez.

---

## FONKSİYON DETAYLARI

### OrderSummarySidebar

**Ne yapar**: Sipariş özetini ve ödeme detaylarını gösteren bir kenar bileşenidir. Kullanıcıya sepetteki ürünler, ara toplam, KDV tutarı ve ödenmesi gereken nihai miktar hakkında bilgi sunar.

**Nasıl yapar**: Verilen props'ları alarak sipariş özeti bölümünü render eder. Ürün listesini, ara toplamı, KDV tutarını ve kupon indirimi uygulanmış nihai fiyatı sırasıyla gösterir. Bileşen, ödeme sayfasının yan tarafında sabit bir konumda yer alarak kullanıcının sipariş detaylarını her an görebilmesini sağlar.

**Parametreler**:
- `items` — Array (sipariş içindeki ürün listesi, her bir ürünün adını, miktarını ve fiyatını içerir)
- `totalAmount` — number — Products toplam tutarı (KDV ve indirim öncesi ara toplam)
- `vatAmount` — number — Hesaplanan KDV tutarı (vergi dahil fiyat hesaplaması için kullanılır)
- `finalAmount` — number — Kupon indirimi uygulandıktan sonra müşteri tarafından ödenmesi gereken nihai tutar
- `couponApp` — object | undefined — Uygulanan kupon bilgilerini içeren nesne (kupon kodu, indirim tutarı veya yüzdesi gibi detayları barındırır, kupon yoksa undefined olabilir)

**Dönüş**: `React.FC<OrderSummarySidebarProps>` — Sipariş özetini gösteren JSX bileşeni döndürür. Bileşen, sipariş özeti panelini ve ilgili ödeme detaylarını render eder.

---

## INTERFACES

### OrderSummaryItem
- `id: string`
- `product: {`
- `quantity: number`
- `unitPrice?: number | string`

### OrderSummarySidebarProps
- `items: OrderSummaryItem[]`
- `totalAmount: number`
- `vatAmount: number`
- `finalAmount: number`
- `couponApplied: { code: string; discount: number } | null`
- `couponCode: string`
- `setCouponCode: (v: string) => void`
- `onApplyCoupon: () => void`
- `onRemoveCoupon: () => void`
- `t: (key: string, params?: Record<string, unknown>) => string`
- `lang: Lang`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/checkout/OrderSummarySidebar.tsx::OrderSummarySidebar
- **params**: `items`, `totalAmount`, `vatAmount`, `finalAmount`, `couponApplied`, `couponCode`, `setCouponCode`, `onApplyCoupon`, `onRemoveCoupon`, `t`, `lang`
- **ic_degiskenler**:
  - `items` — Sepet öğeleri dizisi; her biri ürün adı, miktar, birim fiyat bilgisi taşır, `items.map()` ile dönülerek her öğe render edilir
  - `totalAmount` — Ara toplam tutarı; `formatCurrency(totalAmount, lang, ...)` ile para birimi formatlanarak gösterilir
  - `vatAmount` — KDV dahil tutar; `formatCurrency(vatAmount, lang, ...)` ile para birimi formatlanarak gösterilir
  - `finalAmount` — Kupon indirimi sonrası nihai toplam; `formatCurrency(finalAmount, lang, ...)` ile para birimi formatlanarak gösterilir
  - `couponApplied` — Uygulanan kupon nesnesi (veya `null`); `.code` ve `.discount` özellikleri JSX'te koşullu olarak okunur, truthy ise indirim satırı render edilir
  - `couponCode` — Kupon kodu input alanının kontrolsüz olmayan (controlled) değeri; `<input value={couponCode}>` bağlanır
  - `setCouponCode` — `couponCode` state setter'ı; input'un `onChange` handler'ında `setCouponCode(e.target.value)` çağrısıyla güncellenir
  - `onApplyCoupon` — Kupon uygulama callback'i; "Uygula" butonunun `onClick` handler'ına bağlanır
  - `onRemoveCoupon` — Kupon kaldırma callback'i; "Kaldır" butonunun `onClick` handler'ına bağlanır, sadece `couponApplied` truthy ise render edilir
  - `t` — Çeviri fonksiyonu; `t('checkout.summaryTitle')`, `t('checkout.summaryThumb')`, `t('orders.qtyCol')`, `t('cart.subtotal')`, `t('cart.vatIncluded')`, `t('cart.shipping')`, `t('cart.free')`, `t('checkout.couponDiscount', { code: couponApplied.code })`, `t('cart.total')`, `t('checkout.security.secureNote')` çağrılarıyla UI metinleri alınır
  - `lang` — Dil kodu; `formatCurrency` çağrılarına passed olarak para birimi formatlamada kullanılır
  - `item` — `items.map()` iterasyonundaki her bir sepet öğesi; `item.id`, `item.product.name`, `item.quantity`, `item.unitPrice`, `item.product.price` erişimleri ile herbir öğe render edilir
- **Dönüş**: JSX (`<div>` root element — React element) — kupon input alanları, toplam satırları, öğe listesi ve güvenlik bilgisi barındıran sidebar JSX'i

### [N2_NASIL] AST Pointer: src/views/checkout/OrderSummarySidebar.tsx::items.map callback (item) => (...)
- **params**: `item` — `items` dizisindeki tek bir sepet öğesi
- **ic_degiskenler**:
  - `item` — Döngü değişkeni; `.id` key prop'u için, `.product.name` ürün adı gösterimi için, `.quantity` miktar gösterimi için, `.unitPrice` birim fiyat (nullable, fallback olarak `.product.price` kullanılır) fiyat gösterimi için okunur
- **Dönüş**: JSX (`<div>` element — tek bir sepet öğesinin satır JSX'i); `item.product.name`, birim fiyat × miktar hesaplaması, toplam tutar formatlaması içerir

---

## NODE ID STANDARD

  file: src\views\checkout\OrderSummarySidebar.tsx
  function: src\views\checkout\OrderSummarySidebar.tsx::OrderSummarySidebar

---

## DISA AKTARILANLAR (EXPORTS)
  export: OrderSummaryItem
  export: OrderSummarySidebar
  export: OrderSummarySidebarProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue`, `bg-light-gray`, `bg-primary-navy`, `bg-white`, `border-light-gray`, `text-center`, `text-industrial-gray`, `text-lg`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-success-green`, `text-white`, `text-xs`
- **Layout:** `flex`, `flex-1`, `gap-2`, `h-12`, `items-center`, `justify-between`, `justify-center`, `max-h-64`, `min-w-0`, `overflow-y-auto`, `p-3`, `p-6`, `shadow-sm`, `sticky`, `top-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `border`, `font-medium`, `font-semibold`, `mb-1`, `mb-4`, `mb-6`, `mt-3`, `px-3`, `py-2`, `rounded`, `rounded-lg`, `rounded-xl`, `space-x-2`, `space-x-3`, `space-y-2`