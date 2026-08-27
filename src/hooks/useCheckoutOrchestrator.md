---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useCheckoutOrchestrator.ts
skeleton_hash: c9028befaf257cf9
entity_hashes:
  func:useCheckoutOrchestrator: 27abaa56edfb49c9
  overview: d20540bc22d68feb
generated_at: 2026-08-27T08:34:25Z
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

**Neden:** Fonksiyon gövdesi verilmediğinden, `useCheckoutOrchestrator` fonksiyonunun çalışması için gerekli koşullar kaynaktan çıkarılamamaktadır. Yalnızca fonksiyon imzası (`def useCheckoutOrchestrator()`) mevcut olup parametre, sabit veya gövde bilgisi bulunmamaktadır. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebilir.

---

## FONKSİYON DETAYLARI

### useCheckoutOrchestrator
**Ne yapar**: Çok adımlı ödeme (checkout) sürecini orkestre eden bir React hook'udur. State yönetimini, doğrulama mantığını ve yasal onay kontrollerini tek bir merkezde toplayarak sürecin koordinasyonunu sağlar. Aktif adımı, adres seçimini ve fatura profillerini yönetir; ödeme adımına geçmeden önce doğrulama yapılmasını garanti altına alır.

**Nasıl yapar**: Checkout sürecinin tüm bileşenlerini tek bir hook altında birleştirerek merkezi bir yönetim sağlar. Çok adımlı yapıda hangi adımın aktif olduğunu takip eder, adres ve fatura profilleriyle ilgili state'i yönetir. Kullanıcının bir sonraki adıma geçebilmesi için gerekli doğrulama kontrollerini çalıştırır ve yasal onay (legal consent) kontrollerini gerçekleştirir. Bu sayede bileşenler arası state senkronizasyonu ve geçiş mantığı tek noktadan kontrol edilir.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: Checkout form state'lerini, adım göstergelerini (step indicators), adres ve fatura profillerini (address/invoice profiles) ile doğrulama handler'larını (validation handlers) içeren bir obje döndürür. Detaylı dönüş tipi belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/I18nProvider::useI18n
- import: ../i18n/format::formatCurrency
- import: ../lib/services/invoice.service::listInvoiceProfiles
- import: ./useAuth::useAuth
- import: ./useCartHook::useCart
- import: @/config/legal::legalConfig
- import: @/lib/services/address.service::listAddresses
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/lib/validation/invoiceIdentity::checkInvoiceIdentity
- import: @/types/ui-models::type { InvoiceProfile,UserAddress }
- import: react::useCallback
- import: react::useEffect
- import: react::useState
- import: sonner::toast

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
  - `user` — `useAuth()` hook'undan dönen kullanıcı nesnesi; useEffect bağımlılıklarında kullanıcı oturumunu kontrol etmek için kullanılır
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; hata ve başarı mesajlarını yerelleştirmek için kullanılır
  - `lang` — `useI18n()` hook'undan dönen dil kodu; `formatCurrency` çağrısında para birimi biçimlendirmesinde kullanılır
  - `getCartTotal` — `useCart()` hook'undan dönen fonksiyon; fatura kimliği doğrulamasında sepet toplamını okumak için kullanılır
  - `step` — useState ile tutulan mevcut adım numarası (1-4 arası); ödeme akışının hangi aşamasında olunduğunu belirtir
  - `setStep` — step state'ini güncelleyen setter fonksiyonu
  - `customerInfo` — useState ile tutulan müşteri bilgileri nesnesi (name, firstName, lastName, email, phone, identityNumber alanları)
  - `setCustomerInfo` — customerInfo state'ini güncelleyen setter fonksiyonu
  - `shippingAddress` — useState ile tutulan teslimat adresi nesnesi (full_name, phone, full_address, fullAddress, city, district, postalCode, postal_code alanları)
  - `setShippingAddress` — shippingAddress state'ini güncelleyen setter fonksiyonu
  - `billingAddress` — useState ile tutulan fatura adresi nesnesi (shippingAddress ile aynı alan yapısına sahip)
  - `setBillingAddress` — billingAddress state'ini güncelleyen setter fonksiyonu
  - `invoiceType` — useState ile tutulan fatura tipi; `'individual'` veya `'corporate'` değerlerinden birini alır
  - `setInvoiceType` — invoiceType state'ini güncelleyen setter fonksiyonu
  - `invoiceInfo` — useState ile tutulan fatura bilgileri nesnesi (type, tckn, companyName, taxOffice, taxNumber alanları)
  - `setInvoiceInfo` — invoiceInfo state'ini güncelleyen setter fonksiyonu
  - `legalConsents` — useState ile tutulan yasal onay durumları nesnesi (kvkk, sales_agreement, privacy_policy, distanceSales, preInfo, orderConfirm, marketing alanları)
  - `setLegalConsents` — legalConsents state'ini güncelleyen setter fonksiyonu
  - `sameAsShipping` — useState ile tutulan boolean; fatura adresinin teslimat adresiyle aynı olup olmadığını belirtir
  - `setSameAsShipping` — sameAsShipping state'ini güncelleyen setter fonksiyonu
  - `shippingMethod` — useState ile tutulan kargo yöntemi; `'standard'` veya `'express'` değerlerinden birini alır
  - `setShippingMethod` — shippingMethod state'ini güncelleyen setter fonksiyonu
  - `showHelp` — useState ile tutulan boolean; yardım panelinin görünürlüğünü kontrol eder
  - `setShowHelp` — showHelp state'ini güncelleyen setter fonksiyonu
  - `savedAddresses` — useState ile tutulan kayıtlı adresler dizisi (UserAddress tipinde)
  - `setSavedAddresses` — savedAddresses state'ini güncelleyen setter fonksiyonu
  - `showAddressModal` — useState ile tutulan boolean; adres seçme modalının görünürlüğünü kontrol eder
  - `setShowAddressModal` — showAddressModal state'ini güncelleyen setter fonksiyonu
  - `addressPickTarget` — useState ile tutulan hedef; adres seçiminde `'shipping'` mi yoksa `'billing'` mi hedefleneceğini belirtir
  - `setAddressPickTarget` — addressPickTarget state'ini güncelleyen setter fonksiyonu
  - `savedInvoiceProfiles` — useState ile tutulan kayıtlı fatura profilleri dizisi (InvoiceProfile tipinde)
  - `setSavedInvoiceProfiles` — savedInvoiceProfiles state'ini güncelleyen setter fonksiyonu
  - `showInvoiceModal` — useState ile tutulan boolean; fatura profili seçme modalının görünürlüğünü kontrol eder
  - `setShowInvoiceModal` — showInvoiceModal state'ini güncelleyen setter fonksiyonu
  - `handleSelectInvoiceProfile` — useCallback ile sarılmış fonksiyon; seçilen fatura profilini state'e yazar ve modalı kapatır
  - `validateCustomerInfo` — useCallback ile sarılmış fonksiyon; müşteri bilgilerini doğrular, eksikse hata toast'u gösterir
  - `validateAddress` — useCallback ile sarılmış fonksiyon; adres bilgilerini doğrular, eksikse hata toast'u gösterir
  - `validateInvoiceInfo` — useCallback ile sarılmış fonksiyon; fatura kimliğini `checkInvoiceIdentity` ile doğrular
  - `validateLegalConsents` — useCallback ile sarılmış fonksiyon; zorunlu yasal onayların işaretlenip işaretlenmediğini kontrol eder
  - `handleNextStep` — useCallback ile sarılmış async fonksiyon; adım geçişlerini yönetir ve ödeme başlatma fonksiyonunu çağırır
- **Dönüş**: object — tüm state'ler, setter'lar ve handler fonksiyonlarını içeren nesne

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useEffect (user dependency)
- **params**: (parametre yok — useEffect callback)
- **ic_degiskenler**:
  - `user` — dış kapsamdan erişilen kullanıcı nesnesi; varlığında müşteri bilgilerini ön doldurma yapılır
  - `fullName` — `user.user_metadata?.full_name` değerinden okunan tam ad; boşsa `''` atanır
  - `parts` — fullName'ın boşlukla split edilmesiyle oluşan dizi; ad ve soyadı ayırmak için kullanılır
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::loadInvoiceProfiles
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — dış kapsamdan erişilen kullanıcı nesnesi; yoksa fonksiyon erken döner
  - `rows` — `listInvoiceProfiles(supabaseBrowserClient)` çağrısından dönen fatura profilleri dizisi
  - `defProfile` — `rows` içinde `is_default` true olan profil; bulunamazsa `rows[0]` kullanılır
  - `pType` — `defProfile.profile_type` değerine göre `'corporate'` veya `'individual'` olarak belirlenen fatura tipi
- **Dönüş**: yok (async fonksiyon, Promise<void>)

### [N4_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::handleSelectInvoiceProfile
- **params**:
  - `p` — InvoiceProfile tipinde; seçilen fatura profili nesnesi
- **ic_degiskenler**:
  - `pType` — `p.profile_type` değerine göre `'corporate'` veya `'individual'` olarak belirlenen fatura tipi
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::loadAddresses
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — dış kapsamdan erişilen kullanıcı nesnesi; yoksa fonksiyon erken döner
  - `rows` — `listAddresses(supabaseBrowserClient)` çağrısından dönen adresler dizisi
  - `defShip` — `rows` içinde `is_default_shipping` true olan adres; bulunamazsa undefined kalır
  - `addr` — `defShip` adresinden oluşturulan CheckoutAddressInfo nesnesi (full_address, city, district, postalCode, full_name, phone alanları)
- **Dönüş**: yok (async fonksiyon, Promise<void>)

### [N6_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::validateCustomerInfo
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `customerInfo` — dış kapsamdan erişilen müşteri bilgileri nesnesi; name, email, phone alanları doğrulanır
  - `t` — dış kapsamdan erişilen çeviri fonksiyonu; hata mesajlarını yerelleştirmek için kullanılır
- **Dönüş**: boolean — doğrulama başarılıysa `true`, aksi halde `false`

### [N7_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::validateAddress
- **params**:
  - `address` — CheckoutAddressInfo tipinde; doğrulanacak adres nesnesi
- **ic_degiskenler**:
  - `full` — `address.full_address` veya `address.fullAddress` değerinden okunan ve trim edilen tam adres stringi; boşsa hata gösterilir
  - `t` — dış kapsamdan erişilen çeviri fonksiyonu; hata mesajlarını yerelleştirmek için kullanılır
- **Dönüş**: boolean — doğrulama başarılıysa `true`, aksi halde `false`

### [N8_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::validateInvoiceInfo
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `invoiceType` — dış kapsamdan erişilen fatura tipi; `'individual'` veya `'corporate'`
  - `invoiceInfo` — dış kapsamdan erişilen fatura bilgileri nesnesi; tckn, t_c_id, companyName, company_name, vkn, taxNumber, tax_number, taxOffice, tax_office alanlarından okuma yapılır
  - `getCartTotal` — dış kapsamdan erişilen fonksiyon; sepet toplamını döndürür
  - `t` — dış kapsamdan erişilen çeviri fonksiyonu; hata mesajlarını yerelleştirmek için kullanılır
  - `lang` — dış kapsamdan erişilen dil kodu; `formatCurrency` çağrısında kullanılır
  - `sorun` — `checkInvoiceIdentity` fonksiyonundan dönen hata kodu stringi; yoksa doğrulama başarılıdır
- **Dönüş**: boolean — doğrulama başarılıysa `true`, aksi halde `false`

### [N9_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::validateLegalConsents
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `required` — zorunlu onay anahtarlarını içeren dizi: `['kvkk', 'distanceSales', 'preInfo', 'orderConfirm']`
  - `legalConsents` — dış kapsamdan erişilen yasal onay durumları nesnesi; required dizisindeki anahtarlar kontrol edilir
  - `t` — dış kapsamdan erişilen çeviri fonksiyonu; hata mesajını yerelleştirmek için kullanılır
- **Dönüş**: boolean — tüm zorunlu onaylar işaretliyse `true`, aksi halde `false`

### [N10_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::handleNextStep
- **params**:
  - `initiatePayment` — `() => Promise<boolean | undefined>` tipinde; ödeme başlatma fonksiyonu
- **ic_degiskenler**:
  - `step` — dış kapsamdan erişilen mevcut adım numarası; hangi doğrulamaların yapılacağını belirler
  - `shippingAddress` — dış kapsamdan erişilen teslimat adresi nesnesi; adım 2'de doğrulanır
  - `validateCustomerInfo` — dış kapsamdan erişilen fonksiyon; adım 1'de müşteri bilgilerini doğrular
  - `validateAddress` — dış kapsamdan erişilen fonksiyon; adım 2'de adresi doğrular
  - `validateInvoiceInfo` — dış kapsamdan erişilen fonksiyon; adım 2 ve 3'te fatura kimliğini doğrular
  - `validateLegalConsents` — dış kapsamdan erişilen fonksiyon; adım 2 ve 3'te yasal onayları doğrular
  - `success` — `initiatePayment()` çağrısından dönen boolean; ödeme başarılıysa adım 4'e geçilir
- **Dönüş**: yok (async fonksiyon, Promise<void>)

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutOrchestrator.ts
  function: src\hooks\useCheckoutOrchestrator.ts::useCheckoutOrchestrator

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutOrchestrator
  export: useCheckoutOrchestrator