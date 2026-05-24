---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\StepAddressInfo.tsx
skeleton_hash: 61818ab3eba26faa
generated_at: 2026-05-23T22:40:34Z
---

## Genel Bakış
VentHub HVAC platformunun ödeme (checkout) akışının adres bilgileri adımını oluşturan React bileşen modülüdür. Üst bileşenlerden aldığı teslimat ve fatura adresi verileri ile state güncelleme metodları aracılığıyla kullanıcının adres bilgilerini girmesini ve güncellemesini destekler.

## Fonksiyon Grupları
### Ana Adres Adımı Bileşeni
Modülün temel bileşeni olarak ödeme akışındaki adres bilgisini girme adımının tüm işleyişinden sorumludur. Üst bileşenle adres verilerini senkronize tutarak kullanıcı girişlerini ilgili state'lere aktarır.
- StepAddressInfo

---

## AXIOMS – Mimari Varsayımlar
Bu React bileşeni, VentHub HVAK platformu sipariş sürecinin adres bilgisini girme adımında çalışır, teslimat ve fatura adresi yönetimi için gerekli state ve state güncelleme fonksiyonlarını üst bileşenlerden prop olarak alır, çalışması için bu prop'ların eksiksiz ve doğru yapıda iletilmesi zorunludur.

[Aksiyom 1]: Eğer üst bileşen tarafından shippingAddress prop'u iletilmezse, kullanıcının mevcut teslimat adresi formda görüntülenemez, boş formla karşılaşılır.
[Aksiyom 2]: Eğer setShippingAddress setter fonksiyonu iletilmezse, kullanıcının formda girdiği yeni teslimat adresi uygulama genel state'e kaydedilemez, adres değişiklikleri kalıcı olmaz.
[Aksiyom 3]: Eğer billingAddress prop'u iletilmezse, mevcut fatura adresi formda yüklenemez, kullanıcı fatura adresini düzenleyemez.
[Aksiyom 4]: Eğer prop imzasında kısmi yazılan setBi ile temsil edilen setBillingAddress setter fonksiyonu iletilmezse, kullanıcının girdiği yeni fatura adresi genel state'e aktarılamaz, sipariş süreci eksik adres bilgisiyle ilerler.
[Aksiyom 5]: Eğer iletilen shippingAddress veya billingAddress prop'ları geçerli adres nesnesi yapısında değilse, form alanları hatalı veriyle doldurulur, sonraki sipariş adımlarında adres doğrulaması başarısız olur.

---

## FONKSIYON DETAYLARI

### StepAddressInfo
**Ne yapar**: VentHub HVAC projesinin ödeme (checkout) akışında adres bilgisi girişi adımını yöneten React fonksiyonel bileşenidir. Kullanıcıdan teslimat ve fatura adresi bilgilerini toplamak, mevcut adres bilgilerini kullanıcıya sunmak ve kullanıcının adreslerde yaptığı değişiklikleri üst (parent) bileşene iletmekle görevlidir. Ödeme sürecinin zorunlu adres toplama adımının tüm veri akışı ve arayüz sorumluluğunu üstlenir.
**Nasıl yapar**: Üst bileşenden aldığı mevcut adres state'leri ve state güncelleme fonksiyonları ile adres verilerini merkezi olarak yönetir. Gelen teslimat ve fatura adresi verilerini kendi içindeki form arayüzünde kullanıcıya görüntüler, kullanıcının form alanlarında yaptığı değişiklikleri ilgili setter fonksiyonlarını çağırarak üst bileşene iletir, bu sayede uygulama genelindeki adres state'inin güncel kalmasını sağlar.
**Parametreler**:
- shippingAddress: any — Üst bileşenden iletilen, mevcut teslimat (shipping) adresi verilerini tutan state objesi
- setShippingAddress: function — Teslimat adresi state'ini güncellemek için kullanılan, üst bileşen tarafından sağlanan setter fonksiyonu
- billingAddress: any — Üst bileşenden iletilen, mevcut fatura (billing) adresi verilerini tutan state objesi
- setBi: function — Fatura adresi state'ini güncellemek için üst bileşen tarafından sağlanan, fonksiyon tanımında kısaltılmış şekilde belirtilen setter fonksiyonu
**Dönüş**: React.FC<StepAddressInfoProps> — Props olarak StepAddressInfoProps tipini kabul eden, ödeme akışının adres bilgisi giriş adımının tüm kullanıcı arayüzünü render eden React fonksiyonel bileşeni döndürür.

---

## INTERFACES

### StepAddressInfoProps
- `shippingAddress: CheckoutAddressInfo`
- `setShippingAddress: (a: CheckoutAddressInfo) => void`
- `billingAddress: CheckoutAddressInfo`
- `setBillingAddress: (a: CheckoutAddressInfo) => void`
- `sameAsShipping: boolean`
- `setSameAsShipping: (v: boolean) => void`
- `shippingMethod: 'standard' | 'express'`
- `setShippingMethod: (v: 'standard' | 'express') => void`
- `invoiceType: 'individual' | 'corporate'`
- `setInvoiceType: (v: 'individual' | 'corporate') => void`
- `invoiceInfo: CheckoutInvoiceInfo`
- `setInvoiceInfo: (v: CheckoutInvoiceInfo) => void`
- `legalConsents: CheckoutLegalConsents`
- `setLegalConsents: (v: CheckoutLegalConsents) => void`
- `savedAddresses: UserAddress[]`
- `onOpenAddressModal: (target: 'shipping' | 'billing') => void`
- `onOpenInvoiceModal: () => void`
- `t: (key: string) => string`
- `tf: (key: string, fallback: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\StepAddressInfo.tsx::StepAddressInfo içi shippingAddress postalCode güncelleme arrow fonksiyonu
- **params**: (e)
- **ic_degiskenler**:
  - `e` — Input değişikliğini tetikleyen React change event nesnesi
  - `e.target.value` — Posta kodu girilen inputun ham girilen değeri
  - `v` — Sadece sayılardan kalacak şekilde temizlenmiş, maksimum 10 karaktere kırpılmış geçerli posta kodu değeri
  - `setShippingAddress` — Kargo adresi state'ini güncellemek için kullanılan prop olarak gelen setter fonksiyonu
  - `shippingAddress` — Mevcut tüm kargo adresi bilgilerini tutan state nesnesi
  - `shippingAddress.postalCode` — Güncellenecek olan kargo adresine ait posta kodu alanı
- **Dönüş**: void (sadece state güncellemesi yapar, herhangi bir değer döndürmez)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\checkout\StepAddressInfo.tsx::StepAddressInfo içi billingAddress postalCode güncelleme arrow fonksiyonu
- **params**: (e)
- **ic_degiskenler**:
  - `e` — Input değişikliğini tetikleyen React change event nesnesi
  - `e.target.value` — Posta kodu girilen inputun ham girilen değeri
  - `v` — Sadece sayılardan kalacak şekilde temizlenmiş, maksimum 10 karaktere kırpılmış geçerli posta kodu değeri
  - `setBillingAddress` — Fatura adresi state'ini güncellemek için kullanılan prop olarak gelen setter fonksiyonu
  - `billingAddress` — Mevcut tüm fatura adresi bilgilerini tutan state nesnesi
  - `billingAddress.postalCode` — Güncellenecek olan fatura adresine ait posta kodu alanı
- **Dönüş**: void (sadece state güncellemesi yapar, herhangi bir değer döndürmez)

---

## NODE ID STANDARD

  file: src\views\checkout\StepAddressInfo.tsx
  function: src\views\checkout\StepAddressInfo.tsx::StepAddressInfo

---

## DISA AKTARILANLAR (EXPORTS)
  export: StepAddressInfo