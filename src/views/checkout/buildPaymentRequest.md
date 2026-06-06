---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\buildPaymentRequest.ts
skeleton_hash: 1c47edb9be957105
entity_hashes:
  func:buildPaymentRequest: 874080c807e1dee1
  overview: d55be1ad42d13d7e
generated_at: 2026-06-06T21:58:16Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ödeme sürecinin temel taşı olarak, sipariş ve müşteri verilerini harici ödeme servislerinin beklediği standart formata dönüştürme sorumluluğunu taşır. Checkout akışında, yerel sistem verilerini alarak geçerli ve eksiksiz bir ödeme talebi yapısı oluşturur ve böylece ödeme işleminin başarıyla başlatılmasını garanti altına alır.

## Fonksiyon Grupları
### Ödeme İsteği Oluşturucu
Modülün tek ve temel sorumluluğu olan, ödeme süreci için gerekli olan standartlaştırılmış istek nesnesini oluşturma işlemini yönetir.
- buildPaymentRequest

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmıştır.

[Aksiyom 1]: Eğer `args` parametresi (`BuildPaymentArgs` tipinde) geçerli (null/undefined olmayan) bir nesne içermiyorsa, fonksiyon hata fırlatır veya beklenmeyen bir sonuç üretir.
[Aksiyom 2]: Eğer `args` nesnesi içindeki alanlar (örn. `orderId`, `amount`, `currency` vb. - tam liste bilinmiyor) ödeme servisinin beklediği formata uygun (gerekli alanları içeren) değilse, fonksiyon geçersiz bir ödeme isteği yapısı üretir.
[Aksiyom 3]: Eğer `args` içindeki `amount` alanı sayısal bir değer değilse (örn. string, null veya NaN), fonksiyon tutarsız veya hatalı bir ödeme tutarı içeren istek üretir.
[Aksiyom 4]: Eğer `args` içindeki `currency` alanı geçerli bir para birimi kodu (örn. 'USD', 'EUR', 'TRY') içermiyorsa, fonksiyon geçersiz para birimi koduna sahip bir istek üretir.
[Aksiyom 5]: Eğer `args` içindeki `orderId` alanı benzersiz veya geçerli bir sipariş tanımlayıcısı içermiyorsa, fonksiyon hedeflenen siparişle eşleşmeyen bir ödeme isteği üretir.

---

## FONKSİYON DETAYLARI

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
- **params**:
  - `args: BuildPaymentArgs` — ödeme isteği için gerekli tüm bilgileri (tutar, ürünler, müşteri, adresler, fatura, yasal onaylar vb.) barındıran nesne
- **ic_degiskenler**:
  - `amount` — ödeme tutarı, args'ten destructure edilir
  - `items` — sepet ürünleri dizisi, her biri ürün bilgisi ve adet içerir
  - `customer` — müşteri bilgileri (isim, e-posta, telefon)
  - `shipping` — kargo adresi girdisi (AddressInput | UserAddress | null)
  - `billing` — fatura adresi girdisi (AddressInput | UserAddress | null)
  - `sameAsShipping` — fatura adresinin kargo adresi ile aynı olup olmadığını belirten boolean
  - `userId` — giriş yapmış kullanıcının ID'si (opsiyonel)
  - `invoiceType` — fatura türü
  - `invoiceInfo` — fatura detay bilgileri
  - `legalConsents` — yasal onayların (KVKK, mesafeli satış, ön bilgilendirme vb.) tutulduğu nesne
  - `shippingMethod` — kargo yöntemi (ör. standard)
  - `cartItems` — items dizisinin map ile dönüştürülmüş hali; her eleman {product_id, quantity, price, product_name, product_image_url} yapısındadır
  - `normalizeAddress` — inner function; AddressInput | UserAddress | null alıp {fullAddress, city, district, postalCode} formatında normalize edilmiş adres nesnesi döndürür; null ise boş alanlarla varsayılan nesne döner; Record<string, unknown> cast ile hem camelCase hem snake_case alan isimlerini destekler
  - `a` — normalizeAddress içinde addr'nin Record<string, unknown> olarak cast edilmiş hali, alan erişimi için kullanılır
  - `shippingAddress` — normalizeAddress(shipping) sonucuna `address_type: 'shipping'` eklenmiş kargo adresi nesnesi
  - `billingAddress` — sameAsShipping true ise shippingAddress'in kopyasına `address_type: 'billing'` eklenir; false ise normalizeAddress(billing) ile oluşturulur
  - `customerName` — customer.name varsa onu kullanır, yoksa firstName ve lastName birleştirilerek oluşturulur, trim ile boşluk temizlenir
  - `consents` — legalConsents'ın Record<string, boolean | undefined> olarak cast edilmiş hali, yasal onay anahtarlarına erişim için kullanılır
  - `req` — ödeme istek nesnesi; amount, cartItems, customerInfo (name, email, phone), shippingAddress, billingAddress, user_id, invoiceType, invoiceInfo, legalConsents (kvkk, distanceSales, preInfo, orderConfirm, marketing — her biri accepted boolean ve timestamp), shippingMethod, couponCode alanlarını içerir
- **Dönüş**: `req` nesnesi — ödemeateway'e gönderilecek yapılandırılmış istek nesnesi (tutar, sepet, müşteri bilgisi, adresler, fatura, yasal onaylar, kargo yöntemi, kupon kodu)

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