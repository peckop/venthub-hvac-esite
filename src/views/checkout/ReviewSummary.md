---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\ReviewSummary.tsx
skeleton_hash: 115795418e651b3a
generated_at: 2026-05-23T22:40:42Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun sipariş tamamlama (checkout) akışında kullanılan bir React bileşenidir. Siparişin onaylanması aşamasında tüm kritik müşteri ve sipariş bilgilerini bir arada göstererek kullanıcının gözden geçirmesini sağlar, ödeme adımına geçmeden önce tüm detayların doğruluğunu teyit etmesine olanak tanır.

## Fonksiyon Grupları
### Ana Özet Bileşeni
Modülün tek giriş noktası olarak çalışan bu fonksiyon, müşteri bilgileri, teslimat ve fatura adres detayları, fatura tipi gibi siparişle ilgili tüm parametreleri alır ve sipariş gözden geçirme arayüzünü kullanıcıya sunar.
- ReviewSummary

---

## AXIOMS – Mimari Varsayımlar
Bu modül, sipariş ödeme adımındaki müşteri, teslimat ve fatura bilgilerini son kontrol için kullanıcıya özetlemek üzere tasarlanmıştır; tüm aldığı giriş prop'larının üst komponenler tarafından eksiksiz ve geçerli olarak iletilmesini zorunlu kılar.

[Aksiyom 1]: Eğer müşteri bilgilerini içeren customer nesnesi yoksa, özet bölümündeki müşteri bilgileri bloğu boş kalır veya bileşen hatalı çalışır.
[Aksiyom 2]: Eğer teslimat adresi ve detaylarını içeren shipping nesnesi iletilmezse, sipariş özetinde teslimat bilgileri gösterilemez, kullanıcı teslimat adresini son adımda kontrol edemez.
[Aksiyom 3]: Eğer fatura adresi ve detaylarını içeren billing nesnesi yoksa, fatura bilgileri özet bloğu eksik veriyle çalışır, sonrasında fatura oluşturma sürecinde veri hatası oluşur.
[Aksiyom 4]: Eğer fatura adresinin teslimat adresiyle aynı olup olmadığını belirten sameAsShipping boolean değeri iletilmezse, fatura adresi özetinin hangi koşullarda gösterileceği belirsizleşir, yanlış adres bilgisi kullanıcıya sunulur.
[Aksiyom 5]: Eğer fatura türünü tanımlayan invoiceType değeri iletilmezse, özet bölümünde seçilen fatura türü gösterilemez, fatura düzenleme süreçlerinde uyumsuzluk ortaya çıkar.
[Aksiyom 6]: Eğer yerel ayar/çeviri verilerini içeren in nesnesi bileşene iletilmezse, arayüzdeki tüm metinsel içerikler doğru şekilde gösterilemez, arayüz kullanıcı tarafından anlaşılamaz hale gelir.

---

## FONKSIYON DETAYLARI

### ReviewSummary
**Ne yapar**: Venthub HVAC platformunun ödeme (checkout) akışının sipariş özetini gözden geçirme adımını oluşturan bir React fonksiyonel bileşenidir. Kullanıcının sipariş sürecinde girdiği tüm müşteri, teslimat, fatura ve fatura türü verilerini tek bir ekranda toplayarak sunar, kullanıcının siparişi onaylamadan önce tüm bilgileri doğrulamasını sağlar. Sadece ödeme akışının son kontrol adımında kullanılarak, hatalı girilen bilgilerin kesinleşen siparişe yansımasını engeller.
**Nasıl yapar**: Checkout akışını yöneten üst bileşenlerden kendisine iletilen tüm verileri prop olarak alır, tanımlı ReviewSummaryProps tip kurallarına uygun olarak çalışan bir React bileşeni olarak çıktı üretir. Aldığı verileri kullanıcı dostu bir düzende yapılandırarak, fatura adresinin teslimat adresiyle aynı olması durumunda sameAsShipping bayrağını kullanarak gereksiz tekrarlamaları önler, seçilen fatura türüne göre ek bilgileri özet ekrana ekler. Sadece kendisine iletilen verileri görüntülemekle sorumludur, herhangi bir sipariş verisi üzerinde değişiklik işlemi yapmaz.
**Parametreler**:
- customer: ReviewSummaryProps['customer'] — Siparişi oluşturan müşteriye ait kişisel ve iletişim bilgilerini barındıran nesnedir, adres, iletişim, kimlik bilgileri gibi müşteriyle ilgili tüm verileri içerir.
- shipping: ReviewSummaryProps['shipping'] — Siparişin teslim edileceği lokasyon bilgilerini tutan nesnedir, teslimat adresi için gerekli tüm sokak, ilçe, şehir, posta kodu gibi verileri barındırır.
- billing: ReviewSummaryProps['billing'] — Faturanın kesileceği adrese ait yasal ve lokasyon bilgilerini tutan nesnedir, fatura işlemleri için gerekli tüm verileri içerir.
- sameAsShipping: ReviewSummaryProps['sameAsShipping'] — Kullanıcının fatura adresini teslimat adresiyle aynı olarak tanımladığını belirten boolean tipinde bayraktır, true değerinde olduğunda fatura adresi ayrı olarak görüntülenmez.
- invoiceType: ReviewSummaryProps['invoiceType'] — Sipariş için kullanıcının seçtiği fatura türünü belirten değişkendir, bireysel veya kurumsal fatura gibi seçenekleri değer olarak alır.
- in: ReviewSummaryProps['in'] — Bileşenin üst akıştan eriştiği, siparişin içeriği veya ödeme akışının mevcut durumu gibi ek bağlam verilerini tutan giriş parametresidir.
**Dönüş**: React.FC<ReviewSummaryProps> — Tüm alınan prop verilerini işleyerek kullanıcı arayüzünde görüntülenebilir sipariş gözden geçirme ekranını oluşturan, React uygulama ağacına entegre çalışan bir fonksiyonel bileşen döndürür. Bu bileşen, tanımlı tip kurallarına uyarak hata olasılığını en aza indirir ve sadece kendisine tahsis edilen rolde çalışır.

---

## INTERFACES

### ReviewSummaryProps
- `customer: CheckoutCustomerInfo`
- `shipping: CheckoutAddressInfo`
- `billing: CheckoutAddressInfo`
- `sameAsShipping: boolean`
- `invoiceType: InvoiceType`
- `invoiceInfo: CheckoutInvoiceInfo`
- `onEditPersonal: () => void`
- `onEditShipping: () => void`
- `onEditBilling: () => void`
- `onEditInvoice: () => void`

---

## TYPE ALIASES

### InvoiceType
```typescript
type InvoiceType = 'individual' | 'corporate'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\ReviewSummary.tsx::ReviewSummary
- **params**: customer, shipping, billing, sameAsShipping, invoiceType, invoiceInfo, onEditPersonal, onEditShipping, onEditBilling, onEditInvoice
- **ic_degiskenler**:
  - `t` — useI18n hook'undan elde edilen çeviri fonksiyonu, UI'daki tüm metinleri yerelleştirmek için kullanılır
  - `customer.name` — Müşterinin tam adı, kişisel bilgiler kartında gösterilir
  - `customer.email` — Müşterinin e-posta adresi, kişisel bilgiler kartında gösterilir
  - `customer.phone` — Müşterinin telefon numarası, kişisel bilgiler kartında gösterilir
  - `shipping.fullAddress` — Kargo adresinin tam yazımı, kargo bilgileri kartında gösterilir
  - `shipping.full_address` — Alternatif formatta kargo adresi, fullAddress tanımsızsa kullanılır
  - `shipping.district` — Kargo adresinin ilçe bilgisi, kargo adresi metninde kullanılır
  - `shipping.city` — Kargo adresinin şehir bilgisi, kargo adresi metninde kullanılır
  - `shipping.postalCode` — Kargo adresinin posta kodu, kargo adresi metninde kullanılır
  - `shipping.postal_code` — Alternatif formatta kargo posta kodu, postalCode tanımsızsa kullanılır
  - `billing.fullAddress` — Fatura adresinin tam yazımı, sameAsShipping false ise fatura bilgileri kartında gösterilir
  - `billing.full_address` — Alternatif formatta fatura adresi, fullAddress tanımsızsa kullanılır
  - `billing.district` — Fatura adresinin ilçe bilgisi, fatura adresi metninde kullanılır
  - `billing.city` — Fatura adresinin şehir bilgisi, fatura adresi metninde kullanılır
  - `billing.postalCode` — Fatura adresinin posta kodu, fatura adresi metninde kullanılır
  - `billing.postal_code` — Alternatif formatta fatura posta kodu, postalCode tanımsızsa kullanılır
  - `sameAsShipping` — Fatura adresinin kargo adresiyle aynı olma durumunu belirten bayrak, false ise ayrı fatura adresi kartı render edilir
  - `invoiceType` — Fatura türü (individual/corporate), fatura bilgilerinin türe göre gösterilmesini sağlar
  - `invoiceInfo.tckn` — Bireysel fatura için TC Kimlik Numarası, fatura kartında gösterilir
  - `invoiceInfo.companyName` — Kurumsal fatura için şirket adı, fatura kartında gösterilir
  - `invoiceInfo.vkn` — Kurumsal fatura için Vergi Kimlik Numarası, fatura kartında gösterilir
  - `invoiceInfo.taxOffice` — Kurumsal fatura için vergi dairesi bilgisi, fatura kartında gösterilir
  - `invoiceInfo.eInvoice` — Kurumsal fatura için e-fatura durumu, true ise e‑Fatura etiketi render edilir
  - `onEditPersonal` — Kişisel bilgileri düzenleme butonunun tıklama olayında çalıştırılan geri çağırım fonksiyonu
  - `onEditShipping` — Kargo bilgilerini düzenleme butonunun tıklama olayında çalıştırılan geri çağırım fonksiyonu
  - `onEditBilling` — Fatura bilgilerini düzenleme butonunun tıklama olayında çalıştırılan geri çağırım fonksiyonu
  - `onEditInvoice` — Fatura türü/bilgilerini düzenleme butonunun tıklama olayında çalıştırılan geri çağırım fonksiyonu
- **Dönüş**: React JSX elementi, sipariş öncesi tüm müşteri, kargo ve fatura bilgilerinin özetini gösteren checkout sayfa bileşeni

---

## NODE ID STANDARD

  file: src\views\checkout\ReviewSummary.tsx
  function: src\views\checkout\ReviewSummary.tsx::ReviewSummary

---

## DISA AKTARILANLAR (EXPORTS)
  export: InvoiceType
  export: ReviewSummary
  export: ReviewSummaryProps