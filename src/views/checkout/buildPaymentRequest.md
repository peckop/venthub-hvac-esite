---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\buildPaymentRequest.ts
skeleton_hash: d8e58db5a87487ca
generated_at: 2026-05-23T22:40:19Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ödeme sürecinde yer alarak, sipariş ödeme adımında ihtiyaç duyulan standartlaştırılmış ödeme isteklerinin oluşturulmasını sağlar. Kullanıcı ve sipariş detaylarını içeren giriş parametrelerini işleyerek, üçüncü taraf ödeme servisleriyle uyumlu, geçerli bir ödeme talebi yapısını üretir.

## Fonksiyon Grupları
### Ana Ödeme İsteği Oluşturucu
Modülün temel sorumluluğu olan ödeme talebi oluşturma işlemini gerçekleştiren ana işlevi barındırır. Tüm giriş argümanlarını standart ödeme servisi formatına uygun hale getirerek kullanılabilir bir istek nesnesi haline getirir.
- buildPaymentRequest

---

## AXIOMS – Mimari Varsayımlar
Bu müşteri tarafı ödeme talebi oluşturma modülü, sipariş ödeme sürecini başlatmak için ödeme sağlayıcılarının işleyebileceği geçerli bir istek nesnesi üretmek üzere tasarlanmıştır; tüm işlevselliği giriş verilerinin bütünlüğüne ve çalışma ortamının erişim izinlerine bağlıdır.

[Aksiyom 1]: Eğer fonksiyona iletilen `args` nesnesi `BuildPaymentArgs` tip tanımına uygun yapıya sahip değilse, ödeme talebi nesnesi doğru şekilde yapılandırılamaz ve ödeme süreci kesintiye uğrar.
[Aksiyom 2]: Eğer `args` nesnesi içerisinde ödeme işlemi için zorunlu olan temel alanlar (kullanıcı kimliği, sipariş tutarı, teslimat/fatura adresi vb.) eksik veya hatalıysa, oluşturulan ödeme talebi ödeme sağlayıcısı tarafından reddedilir.
[Aksiyom 3]: Eğer modülün çalıştığı istemci (client) ortamında entegre edilen ödeme sağlayıcılarının API'lerine istek göndermek için gerekli CORS izinleri yoksa, oluşturulan ödeme talebi ile ödeme başlatılamaz, istek tarayıcı tarafından engellenir.
[Aksiyom 4]: Eğer modül, ödeme sağlayıcılarının kabul ettiği standart veri formatlarına uygun yapılandırılmamışsa, üretilen ödeme talebi geçersiz sayılarak sipariş süreci sonlanır.

---

## FONKSIYON DETAYLARI

### buildPaymentRequest
**Ne yapar**: VentHub HVAC platformunun ödeme adımında çalışan bu fonksiyon, checkout sürecinde toplanan tüm verilerden geçerli, servisler tarafından kabul edilebilir bir ödeme talebi nesnesi oluşturur. Ödeme işlemlerinin sorunsuz başlatılabilmesi için yerel sistem verilerini harici ödeme sağlayıcılarının standartlarına uygun hale getirme görevini üstlenir. Checkout akışının kritik bir parçası olarak, eksik veya hatalı veri kaynaklı ödeme hatalarının önüne geçmek için standartlaştırılmış bir istek yapısı sunar.
**Nasıl yapar**: Girdi olarak aldığı yapılandırılmış ödeme argümanlarını önce zorunlu alan kontrolünden geçirir, eksik kalan sistem kökenli varsayılan değerleri ilgili boş alanlara ekler. Ardından yerel sistemdeki veri formatları ve isimlerini ödeme servislerinin beklediği standartlara dönüştürerek, tüm alanları dolu tam çalışır durumda bir ödeme talebi nesnesini bir araya getirir. Basit format doğrulamaları yaparak geçersiz verilerin ödeme servislerine iletilmesini engeller.
**Parametreler**:
- name: args, type: BuildPaymentArgs — Ödeme talebi oluşturmak için gereken tüm sipariş, müşteri ve ödeme yöntemi bilgilerini içeren yapılandırılmış girdi nesnesi. Checkout adımında kullanıcıdan ve iç sistemden toplanan sipariş tutarı, teslimat adresi, müşteri kimliği, seçilen taksit planı gibi tüm işlem verilerini barındırır.
**Dönüş**: req türünde ödeme talebi nesnesi döndürür. Bu nesne, tüm zorunlu alanları doldurulmuş, harici ödeme API'lerine gönderilmek üzere standart formatta yapılandırılmıştır, doğrudan ödeme işlemini başlatmak için kullanılır.

---

## INTERFACES

### CartItemInput
- `id: string`
- `quantity: number`
- `product: { id: string; name: string; price: number; image_url?: string | null }`

### CustomerInput
- `name?: string`
- `firstName?: string`
- `lastName?: string`
- `email: string`
- `phone: string`

### AddressInput
- `fullAddress?: string`
- `full_address?: string`
- `city: string`
- `district: string`
- `postalCode?: string`
- `postal_code?: string | null`

### LegalConsentsInput
- `kvkk: boolean`
- `distanceSales: boolean`
- `preInfo: boolean`
- `orderConfirm: boolean`
- `marketing?: boolean`

### BuildPaymentArgs
- `amount: number`
- `items: CartItemInput[]`
- `customer: CustomerInput`
- `shipping: AddressInput | UserAddress | null`
- `billing: AddressInput | UserAddress | null`
- `sameAsShipping: boolean`
- `userId?: string | null`
- `invoiceType: InvoiceType`
- `invoiceInfo: InvoiceInfo`
- `legalConsents: LegalConsentsInput | Record<string, boolean>`
- `shippingMethod?: 'standard' | 'express' | string | null`
- `couponCode?: string | null`

---

## TYPE ALIASES

### InvoiceType
```typescript
type InvoiceType = 'individual' | 'corporate'
```

### InvoiceInfo
```typescript
type InvoiceInfo = Partial<{ tckn: string; companyName: string; vkn: string; taxOffice: string; eInvoice?: boolean }>
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/checkout/buildPaymentRequest.ts::buildPaymentRequest
- **params**: [args: BuildPaymentArgs]
- **ic_degiskenler**:
  - `amount` — args nesnesinden çıkarılan ödeme işlemi için toplam tutar değeri
  - `items` — args nesnesinden çıkarılan müşteri sepetindeki ham ürün listesi
  - `customer` — args nesnesinden çıkarılan müşteri kimlik ve iletişim bilgileri nesnesi
  - `shipping` — args nesnesinden çıkarılan ham gönderim adresi nesnesi
  - `billing` — args nesnesinden çıkarılan ham fatura adresi nesnesi
  - `sameAsShipping` — args nesnesinden çıkarılan, fatura adresinin gönderim adresiyle aynı olup olmadığını belirten bayrak
  - `userId` — args nesnesinden çıkarılan sistemdeki kayıtlı kullanıcı kimliği
  - `invoiceType` — args nesnesinden çıkarılan fatura türü (şahıs/kurum vb.) değeri
  - `invoiceInfo` — args nesnesinden çıkarılan fatura düzenleme için gerekli detaylar nesnesi
  - `legalConsents` — args nesnesinden çıkarılan müşterinin onayladığı yasal sözleşmeler nesnesi
  - `shippingMethod` — args nesnesinden çıkarılan seçilen kargo teslimat yöntemi
  - `cartItems` — items listesi üzerinden ödeme sistemi formatına dönüştürülerek oluşturulan standart sepet ürünleri listesi
  - `normalizeAddress` — farklı formatlardaki adres nesnelerini tek standart formata dönüştürmek için tanımlanan iç fonksiyon
  - `shippingAddress` — normalize edilmiş, adres türü 'shipping' olarak ayarlanmış nihai gönderim adresi nesnesi
  - `billingAddress` — normalize edilmiş, adres türü 'billing' olarak ayarlanmış nihai fatura adresi nesnesi; sameAsShipping true ise gönderim adresi kullanılır
  - `customerName` — müşterinin isim bilgilerinden birleştirilerek oluşturulan tam isim string'i
  - `consents` — legalConsents nesnesinin tip dönüşümü yapılmış hali, yasal onayların erişimini kolaylaştırır
  - `req` — tüm toplanan verilerle oluşturulan nihai ödeme isteği nesnesi
  - `args.couponCode` — args nesnesinden erişilen, eğer varsa müşterinin kullandığı indirim kuponu kodu
- **Dönüş**: Ödeme işlemi için hazırlanmış standart formatlı ödeme isteği nesnesi (req)

### [N2_NASIL] AST Pointer: src/views/checkout/buildPaymentRequest.ts::items.map callback fonksiyonu
- **params**: [it: ham sepet ürünü nesnesi]
- **ic_degiskenler**:
  - `it.product.id` - dönüştürülen ürünün benzersiz kimliği
  - `it.quantity` - sepetteki ürün adedi
  - `it.product.price` - ürünün ham fiyat değeri
  - `safeNumber` - harici import edilen tip dönüştürme fonksiyonu, fiyat değerini güvenli sayı formatına çevirir
  - `it.product.name` - ürünün ekranda gösterilecek tam adı
  - `it.product.image_url` - ürünün kapak resminin URL'si
- **Dönüş**: Ödeme sistemi ile uyumlu standartlaştırılmış tek sepet ürünü nesnesi

### [N3_NASIL] AST Pointer: src/views/checkout/buildPaymentRequest.ts::normalizeAddress
- **params**: [addr: AddressInput | UserAddress | null]
- **ic_degiskenler**:
  - `a` - addr nesnesinin Record<string, unknown> tipine dönüştürülmüş hali, farklı tipteki adres alanlarına güvenli erişim sağlar
  - `a.fullAddress` - ham adresin standart camelCase formatlı tam adres alanı
  - `a.full_address` - ham adresin snake_case formatlı tam adres alanı
  - `a.city` - ham adresin şehir bilgisini tutan alan
  - `a.district` - ham adresin ilçe bilgisini tutan alan
  - `a.postalCode` - ham adresin standart camelCase formatlı posta kodu alanı
  - `a.postal_code` - ham adresin snake_case formatlı posta kodu alanı
- **Dönüş**: Tüm adres formatları için ortak, standartlaştırılmış adres nesnesi (fullAddress, city, district, postalCode alanları içerir)

---

## NODE ID STANDARD

  file: src\views\checkout\buildPaymentRequest.ts
  function: src\views\checkout\buildPaymentRequest.ts::buildPaymentRequest

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddressInput
  export: BuildPaymentArgs
  export: CartItemInput
  export: CustomerInput
  export: InvoiceInfo
  export: InvoiceType
  export: LegalConsentsInput
  export: buildPaymentRequest