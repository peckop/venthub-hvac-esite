---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\OrderSummarySidebar.tsx
skeleton_hash: a5b0e7a434933e80
generated_at: 2026-05-23T22:40:28Z
---

## Genel Bakış
VentHub HVAC platformunun ödeme (checkout) sürecinde yer alan bu modül, sipariş özetini kullanıcı arayüzünün kenar çubuğunda sunmak üzere tasarlanmış bir React bileşeni barındırır. Ödeme akışı sırasında kullanıcının siparişine ait tüm maliyet kalemlerini tek bir noktada görmesini sağlayarak şeffaf bir satın alma deneyimi sunar.

## Fonksiyon Grupları
### Ana Sipariş Özeti Kenar Çubuğu Bileşeni
Tüm sipariş ve maliyet verilerini alarak, ödeme sayfasının kenar çubuğunda kullanıcının erişebileceği düzenli bir sipariş özeti arayüzü oluşturur. Modülün tek ana bileşeni olarak, tüm gelen parametreleri işleyerek tutarlı bir sunum sağlar.
- OrderSummarySidebar

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı sipariş özeti kenar çubuğu bileşeni, ödeme akışında sipariş kalemlerini ve tüm fiyatlandırma tutarlarını doğru görüntüleyebilmek için aldığı tüm giriş prop'larının geçerli, formatına uygun ve aralarında tutarlı olmasını varsayar.

[Aksiyom 1]: Eğer sipariş kalemlerini içeren `items` prop'u geçerli bir dizi olarak iletilmezse, bileşen sipariş içeriğini listeleyemez, arayüzde çökme veya tamamen boş bir özet alanı oluşur.
[Aksiyom 2]: Eğer ara toplam tutarını temsil eden `totalAmount` prop'u geçerli pozitif sayısal bir değer olarak iletilmezse, tüm alt toplam ve nihai tutar gösterimleri yanlış olur, faturalama doğruluğu ve kullanıcı güveni bozulur.
[Aksiyom 3]: Eğer KDV tutarını temsil eden `vatAmount` prop'u geçerli sayısal bir değer olarak iletilmezse, vergi tutarı doğru görüntülenemez, yasal faturalama gereksinimleri ve fiyat şeffaflığı karşılanamaz.
[Aksiyom 4]: Eğer son ödeme tutarını temsil eden `finalAmount` prop'u geçerli pozitif sayısal bir değer olarak iletilmezse, kullanıcının ödeyeceği nihai tutar doğru sunulamaz, ödeme akışı kesintiye uğrar.
[Aksiyom 5]: Eğer kupon uygulama durumunu temsil eden `couponApp` prop'u geçerli formatta iletilmezse, uygulanan kuponun indirim etkisi doğru gösterilemez, tüm fiyat hesaplamalarında tutarsızlık oluşur.

---

## FONKSIYON DETAYLARI

### OrderSummarySidebar
**Ne yapar**: VentHub HVAC projesinin ödeme adımında kullanılmak üzere tasarlanmış, siparişin tüm ürün ve finansal detaylarını müşteriye sunan yan bar React bileşenidir. Sepetteki ürünleri, ara toplam, vergi, kupon uygulama durumu ve nihai ödeme tutarını tek bir alanda toplayarak kullanıcının siparişini onaylamadan önce tüm detayları kontrol etmesini sağlar.
**Nasıl yapar**: Tanımlandığı OrderSummarySidebar.tsx dosyasında kendisine iletilen tüm prop değerlerini kullanarak çalışır, gelen sipariş kalemlerini arayüzde listeler, önceden hesaplanmış tutarları düzenli bir şekilde kullanıcının görüntüleyebileceği şekilde ekrana yansıtır. Ödeme sayfasının yan tarafında sabit olarak görüntülenmek üzere yapılandırılmış olması sayesinde kullanıcının tüm ödeme süreci boyunca sipariş özetine erişimini korumasını sağlar.
**Parametreler**:
- items: dizi — Siparişe dahil edilen tüm ürün kalemlerinin detaylarını barındıran, sepet içeriğini temsil eden dizi
- totalAmount: sayı — Kupon indirimleri ve vergiler hesaplanmadan önceki, tüm ürün fiyatlarının toplamından oluşan ara toplam tutarı
- vatAmount: sayı — Siparişe uygulanan toplam KDV tutarını, hesaplanmış vergi miktarını içeren sayısal değer
- finalAmount: sayı — Tüm indirimler ve vergiler uygulandıktan sonra müşterinin ödemekle yükümlü olduğu nihai toplam tutar
- couponApp: boolean — Siparişe herhangi bir kupon kodunun başarıyla uygulanıp uygulanmadığını belirten durum bayrağı
**Dönüş**: React.FC<OrderSummarySidebarProps> — Sipariş özet yan barını oluşturan, arayüzde render edilebilir React fonksiyonel bileşenini döndürür. Bu bileşen, ödeme adımı boyunca ekranda kalarak kullanıcının sipariş detaylarını her an görüntülemesine olanak tanır.

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
- **params**: items, totalAmount, vatAmount, finalAmount, couponApplied, couponCode, setCouponCode, onApplyCoupon, onRemoveCoupon, t, lang
- **ic_degiskenler**:
  - `formatCurrency` — i18n modülünden import edilen para tutarlarını yerel ayarlara göre formatlayan fonksiyon
  - `Lock` — lucide-react'ten import edilen 256-bit SSL güvenlik bilgisi bölümünde kullanılan kilit ikonu bileşeni
  - `items.map` — siparişteki tüm ürünleri listelemek için kullanılan dizi döngü metodu
  - `e.target.value` — kupon kodu input alanına girilen yeni değer, kupon state'ini güncellemek için kullanılır
- **Dönüş**: JSX formatında, ödeme sayfasında sabitlenen sipariş özeti kenar çubuğu React bileşeni

### [N2_NASIL] AST Pointer: src/views/checkout/OrderSummarySidebar.tsx::items.map iterator callback
- **params**: item
- **ic_degiskenler**:
  - `item.id` — listedeki her sipariş kaleminin benzersiz kimliği, React listelemesi için anahtar olarak kullanılır
  - `item.product.name` — ilgili ürünün ekranda gösterilecek tam adı
  - `item.quantity` — siparişte alınan ilgili üründen kaç adet olduğunu belirten sayısal değer
  - `item.unitPrice` - ürünün siparişteki özel birim fiyatı, mevcut değilse ürün temel fiyatı kullanılır
  - `item.product.price` — ürünün platformdaki temel listeleme fiyatı, unitPrice tanımlı değilse kullanılır
  - `lang` — ana bileşenden gelen arayüz dili kodu, para tutarlarını kullanıcının diline uygun formatlamak için kullanılır
  - `t` — ana bileşenden gelen çeviri fonksiyonu, tüm sabit metinleri yerelleştirmek için kullanılır
  - `formatCurrency` — para tutarlarını standart formata sokan import edilen fonksiyon, ürün satır toplamını göstermek için kullanılır
- **Dönüş**: Her sipariş kalemi için oluşturulan, listede gösterilecek tekil ürün satırı JSX elementi

---

## NODE ID STANDARD

  file: src\views\checkout\OrderSummarySidebar.tsx
  function: src\views\checkout\OrderSummarySidebar.tsx::OrderSummarySidebar

---

## DISA AKTARILANLAR (EXPORTS)
  export: OrderSummaryItem
  export: OrderSummarySidebar
  export: OrderSummarySidebarProps