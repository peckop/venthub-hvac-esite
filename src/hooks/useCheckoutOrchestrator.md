---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutOrchestrator.ts
skeleton_hash: 412e20bbf706ee7a
entity_hashes:
  func:useCheckoutOrchestrator: 6b4ccd36fef055f6
  overview: ac952b0f8fb06046
generated_at: 2026-06-08T10:09:32Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin satın alma sürecini merkezi olarak yöneten bir React özel hook'u sunar. Sepet yönetiminden ödeme ve sipariş tamamlamaya kadar tüm sürecin akışını, durumunu ve servis entegrasyonlarını koordine ederek bileşenler düzeyinde tutarlı bir satın alma deneyimi sağlar.

## Fonksiyon Grupları
### Checkout Süreci Koordinasyonu
Satın alma işleminin tüm adımlarını — bilgi toplama, ödeme doğrulama ve sipariş tamamlama — tek bir koordinatör hook üzerinden sıralı bir şekilde yönetir, durum takibi ve hata yönetimini merkezileştirir.
- useCheckoutOrchestrator

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Verilen bilgilerde fonksiyon gövdesi (implementation body) bulunmamaktadır. Mimari aksiyomlar **sadece fonksiyon gövdesinden** üretilebilir; docstring'lerden, genel bakış açıklamalarından veya değişken isimlerinden bilgi çıkarılamaz.

---

## FONKSİYON DETAYLARI

### useCheckoutOrchestrator
**Ne yapar**: VentHub HVAC projesinin satın alma (checkout) akışını tek merkezden koordine eden React özel hook'udur. Tüm ödeme ve teslimat sürecindeki adım yönetimi, durum takibi, hata yönetimi ve ilgili servis entegrasyonlarının sorumluluğunu üstlenir, satın alma sürecinin farklı bileşenleri arasında tutarlı bir iletişim ve veri akışı sağlar. Kullanıcıların sepet içeriğiyle başlayıp siparişin başarıyla tamamlanmasına kadar geçen tüm adımlarda merkezi bir yönetim noktası olarak çalışır, proje içindeki tekrar eden kod kullanımını ortadan kaldırır.
**Nasıl yapar**: Proje kaynak kodlarında belirtilen `C:\Users\alize\venthub-hvac\src\hooks\` dizininde tanımlanan React özel hook'u olarak çalışır. İçerisinde sepet yönetimi, kullanıcı oturum servisi, ödeme ağ geçidi entegrasyonu ve adres doğrulama servisi gibi proje içindeki temel servisleri entegre ederek süreci adım adım ilerletir. Her adımda ilgili bilgilerin geçerliliğini (sepet ürünlerinin stokta olup olmadığı, teslimat adresinin geçerli olması, ödeme yönteminin sorunsuz çalışması gibi) kontrol ederek sonraki adıma geçiş izni verir, oluşan tüm hataları merkezi olarak kaydederek kullanıcıya uygun geri bildirimlerin gösterilmesini tetikler.
**Parametreler**:
- Bu hook herhangi bir giriş parametresi almamaktadır, doğrudan import edildiği yerde çağrılarak kullanılır.
**Dönüş**: Resmi olarak tanımlanmış bir dönüş tipi bulunmamaktadır. İçerisinde yönettiği tüm checkout sürecine ait durum değişkenleri, adım geçiş işleyicileri, hata yönetimi fonksiyonları ve servis entegrasyon metotlarını hook'u kullanan tüm bileşenlere erişime sunar, böylece checkout akışına dahil olan her alt bileşen bu merkezi yönetim araçlarını sorunsuz bir şekilde kullanabilir.

---

## TYPE ALIASES

### CheckoutOrchestrator
```typescript
type CheckoutOrchestrator = ReturnType<typeof useCheckoutOrchestrator>
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen mevcut kullanıcı nesnesi
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu
  - `step` — Checkout sürecindeki mevcut adım (1,2,3,4)
  - `setStep` — step state'ini güncellemek için setter fonksiyonu
  - `customerInfo` — Müşteri bilgilerini tutan CheckoutCustomerInfo nesnesi
  - `setCustomerInfo` — customerInfo state'ini güncellemek için setter fonksiyonu
  - `shippingAddress` — Kargo adresi bilgilerini tutan CheckoutAddressInfo nesnesi
  - `setShippingAddress` — shippingAddress state'ini güncellemek için setter fonksiyonu
  - `billingAddress` — Fatura adresi bilgilerini tutan CheckoutAddressInfo nesnesi
  - `setBillingAddress` — billingAddress state'ini güncellemek için setter fonksiyonu
  - `invoiceType` — Fatura türü ('individual' veya 'corporate')
  - `setInvoiceType` — invoiceType state'ini güncellemek için setter fonksiyonu
  - `invoiceInfo` — Fatura detaylarını tutan CheckoutInvoiceInfo nesnesi
  - `setInvoiceInfo` — invoiceInfo state'ini güncellemek için setter fonksiyonu
  - `legalConsents` — Yasal onayları tutan CheckoutLegalConsents nesnesi
  - `setLegalConsents` — legalConsents state'ini güncellemek için setter fonksiyonu
  - `sameAsShipping` — Fatura adresinin kargo adresiyle aynı olup olmadığını belirten boolean
  - `setSameAsShipping` — sameAsShipping state'ini güncellemek için setter fonksiyonu
  - `shippingMethod` — Kargo yöntemi ('standard' veya 'express')
  - `setShippingMethod` — shippingMethod state'ini güncellemek için setter fonksiyonu
  - `showHelp` — Yardım panelinin görünürlüğünü tutan boolean
  - `setShowHelp` — showHelp state'ini güncellemek için setter fonksiyonu
  - `savedAddresses` — Kayıtlı adreslerin listesini tutan UserAddress[]
  - `setSavedAddresses` — savedAddresses state'ini güncellemek için setter fonksiyonu
  - `showAddressModal` — Adres seçim modalının görünürlüğünü tutan boolean
  - `setShowAddressModal` — showAddressModal state'ini güncellemek için setter fonksiyonu
  - `addressPickTarget` — Hangi adresin seçileceğini tutan ('shipping' veya 'billing')
  - `setAddressPickTarget` — addressPickTarget state'ini güncellemek için setter fonksiyonu
  - `savedInvoiceProfiles` — Kayıtlı fatura profillerinin listesini tutan InvoiceProfile[]
  - `setSavedInvoiceProfiles` — savedInvoiceProfiles state'ini güncellemek için setter fonksiyonu
  - `showInvoiceModal` — Fatura profili seçim modalının görünürlüğünü tutan boolean
  - `setShowInvoiceModal` — showInvoiceModal state'ini güncellemek için setter fonksiyonu
- **Dönüş**: {
    step, setStep, customerInfo, setCustomerInfo, shippingAddress, setShippingAddress,
    billingAddress, setBillingAddress, invoiceType, setInvoiceType, invoiceInfo, setInvoiceInfo,
    legalConsents, setLegalConsents, sameAsShipping, setSameAsShipping, shippingMethod,
    setShippingMethod, showHelp, setShowHelp, savedAddresses, setSavedAddresses,
    showAddressModal, setShowAddressModal, addressPickTarget, setAddressPickTarget,
    savedInvoiceProfiles, setSavedInvoiceProfiles, showInvoiceModal, setShowInvoiceModal,
    handleSelectInvoiceProfile, validateCustomerInfo, validateAddress, handleNextStep
  }

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator::useEffect::1
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen mevcut kullanıcı nesnesi (closure'dan)
  - `fullName` — Kullanıcının tam adı (user.user_metadata.full_name)
  - `parts` — Tam adın boşluk ile bölünmüş hali (dizi)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator::useEffect::2
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen mevcut kullanıcı nesnesi (closure'dan)
  - `loadInvoiceProfiles` — Fatura profillerini yükleyen async fonksiyon
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator::useEffect::2::loadInvoiceProfiles
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen mevcut kullanıcı nesnesi (closure'dan)
  - `rows` — listInvoiceProfiles(supabaseBrowserClient) çağrısından dönen InvoiceProfile dizisi
  - `defProfile` — Varsayılan veya ilk fatura profili (rows.find ile bulunan)
  - `pType` — Profil türünü temsil eden string ('individual' veya 'corporate')
- **Dönüş**: Promise<void> (async fonksiyon)

### [N5_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator::handleSelectInvoiceProfile
- **params**: (p: InvoiceProfile)
- **ic_degiskenler**:
  - `pType` — Seçilen profilin türünü temsil eden string ('individual' veya 'corporate')
- **Dönüş**: void

### [N6_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator::useEffect::3
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen mevcut kullanıcı nesnesi (closure'dan)
  - `loadAddresses` — Adresleri yükleyen async fonksiyon
  - `sameAsShipping` — Fatura adresinin kargo adresiyle aynı olup olmadığını belirten boolean (closure'dan)
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator::useEffect::3::loadAddresses
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan gelen mevcut kullanıcı nesnesi (closure'dan)
  - `rows` — listAddresses(supabaseBrowserClient) çağrısından dönen UserAddress dizisi
  - `defShip` — Varsayılan kargo adresi (rows.find ile bulunan)
  - `addr` — CheckoutAddressInfo formatında adres nesnesi (defShip'den dönüştürülen)
  - `sameAsShipping` — Fatura adresinin kargo adresiyle aynı olup olmadığını belirten boolean (closure'dan)
- **Dönüş**: Promise<void> (async fonksiyon)

### [N8_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator::validateCustomerInfo
- **params**: (parametre yok)
- **ic_degiskenler**: (yerel değişken yok, closure'dan müşteri bilgilerini kullanır)
- **Dönüş**: boolean

### [N9_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator::validateAddress
- **params**: (address: CheckoutAddressInfo)
- **ic_degiskenler**:
  - `full` — Tam adres satırı (address.full_address veya address.fullAddress'in trim edilmiş hali)
- **Dönüş**: boolean

### [N10_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator::handleNextStep
- **params**: (initiatePayment: () => Promise<boolean | undefined>)
- **ic_degiskenler**:
  - `step` — Checkout sürecindeki mevcut adım (closure'dan)
  - `validateCustomerInfo` — Müşteri bilgilerini doğrulayan fonksiyon (closure'dan)
  - `shippingAddress` — Kargo adresi bilgileri (closure'dan)
  - `validateAddress` — Adres doğrulama fonksiyonu (closure'dan)
  - `success` — Ödeme başlatma sonucu (step 3'te initiatePayment() çağrısından dönen değer)
- **Dönüş**: Promise<void> (async fonksiyon)

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutOrchestrator.ts
  function: src\hooks\useCheckoutOrchestrator.ts::useCheckoutOrchestrator

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutOrchestrator
  export: useCheckoutOrchestrator