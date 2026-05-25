---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutOrchestrator.ts
skeleton_hash: ff7c7a77d0655691
generated_at: 2026-05-25T09:58:19Z
---

## Genel Bakış
`useCheckoutOrchestrator` hook’u, uygulamanın checkout (satın alma) sürecini yönetmek ve ilgili alt sistemler arasında koordinasyonu sağlamak için tasarlanmıştır. Tek bir giriş noktası üzerinden veri toplama, durum güncellemeleri ve yan etkileri (API çağrıları, yönlendirmeler vb.) birleştirir.

## Fonksiyon Grupları
### Checkout Koordinasyonu
Bu grup, checkout adımlarının sırasını belirler, gerekli verileri (sepet, kullanıcı, ödeme bilgileri) toplar ve sürecin ilerleyişini kontrol eder.  
- useCheckoutOrchestrator  

(İçerideki yardımcı fonksiyonlar ve callback’ler bu ana hook içinde çağrılır; dışarıdan başka bir fonksiyon bu hook’u doğrudan çağırmaz.)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

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
- **params**: (none)
- **ic_degiskenler**:
  - `user` — `useAuth()` hook’undan gelen oturum bilgisi, kullanıcı objesi.
  - `t` — `useI18n()` hook’undan gelen çeviri fonksiyonu.
  - `step` — checkout sürecinin mevcut adımını tutan state (1‑4).
  - `setStep` — `step` state’ini güncelleyen setter.
  - `customerInfo` — müşterinin adı, e‑posta, telefon vb. bilgilerini tutan obje.
  - `setCustomerInfo` — `customerInfo` state’ini güncelleyen setter.
  - `shippingAddress` — gönderim adresi bilgilerini tutan obje.
  - `setShippingAddress` — `shippingAddress` state’ini güncelleyen setter.
  - `billingAddress` — fatura adresi bilgilerini tutan obje.
  - `setBillingAddress` — `billingAddress` state’ini güncelleyen setter.
  - `invoiceType` — fatura tipi (`'individual'` | `'corporate'`).
  - `setInvoiceType` — `invoiceType` state’ini güncelleyen setter.
  - `invoiceInfo` — fatura detaylarını tutan obje.
  - `setInvoiceInfo` — `invoiceInfo` state’ini güncelleyen setter.
  - `legalConsents` — yasal onayların boolean değerlerini tutan obje.
  - `setLegalConsents` — `legalConsents` state’ini güncelleyen setter.
  - `sameAsShipping` — fatura adresinin gönderim adresiyle aynı olup olmadığını belirten boolean.
  - `setSameAsShipping` — `sameAsShipping` state’ini güncelleyen setter.
  - `shippingMethod` — seçilen kargo yöntemi (`'standard'` | `'express'`).
  - `setShippingMethod` — `shippingMethod` state’ini güncelleyen setter.
  - `showHelp` — yardım modalının gösterim durumunu tutan boolean.
  - `setShowHelp` — `showHelp` state’ini güncelleyen setter.
  - `savedAddresses` — kullanıcının kayıtlı adres listesini tutan dizi.
  - `setSavedAddresses` — `savedAddresses` state’ini güncelleyen setter.
  - `showAddressModal` — adres seçme modalının gösterim durumu.
  - `setShowAddressModal` — `showAddressModal` state’ini güncelleyen setter.
  - `addressPickTarget` — adres seçiminin “shipping” mi “billing” mi olduğunu belirten değer.
  - `setAddressPickTarget` — `addressPickTarget` state’ini güncelleyen setter.
  - `savedInvoiceProfiles` — kullanıcının kayıtlı fatura profillerini tutan dizi.
  - `setSavedInvoiceProfiles` — `savedInvoiceProfiles` state’ini güncelleyen setter.
  - `showInvoiceModal` — fatura profili modalının gösterim durumu.
  - `setShowInvoiceModal` — `showInvoiceModal` state’ini güncelleyen setter.
  - `handleSelectInvoiceProfile` — bir fatura profili seçildiğinde çalışan callback (aşağıda ayrı AST pointer’da tanımlı).
  - `validateCustomerInfo` — müşteri bilgilerini doğrulayan fonksiyon (aşağıda ayrı AST pointer’da tanımlı).
  - `validateAddress` — adres objesini doğrulayan fonksiyon (aşağıda ayrı AST pointer’da tanımlı).
  - `handleNextStep` — checkout adımlarını ilerleten async fonksiyon (aşağıda ayrı AST pointer’da tanımlı).
- **Dönüş**: Hook’un dışarıya döndürdüğü obje; içinde tüm state değerleri, setter’lar ve yardımcı fonksiyonlar bulunur (yan etkileri: UI’da gösterim ve veri akışı).

---

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::preFillCustomerInfoEffect
- **params**: (none) – `useEffect` callback.
- **ic_degiskenler**:
  - `fullName` — `user.user_metadata?.full_name` değerinden elde edilen tam ad string’i; boş ise `''`.
  - `parts` — `fullName.split(' ')` ile elde edilen ad parçalarının dizisi.
- **Dönüş**: `void` (state setterları `setCustomerInfo` ile yan etki yaratır).

---

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::loadInvoiceProfilesEffect
- **params**: (none) – `useEffect` callback.
- **ic_degiskenler**:
  - `rows` — `await listInvoiceProfiles()` çağrısından dönen `InvoiceProfile[]` dizisi.
  - `defProfile` — `rows.find(r => r.is_default) || rows[0]`; varsayılan ya da ilk profil.
  - `pType` — profil tipine göre `'individual'` ya da `'corporate'` olarak belirlenen tip.
- **Dönüş**: `void` (state setterları `setSavedInvoiceProfiles`, `setInvoiceType`, `setInvoiceInfo` ile yan etki yaratır).

---

### [N4_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::handleSelectInvoiceProfile
- **params**: `(p: InvoiceProfile)`
- **ic_degiskenler**:
  - `p` — seçilen fatura profili objesi.
  - `pType` — `p.profile_type` değerine göre `'individual'` ya da `'corporate'`.
- **Dönüş**: `void` (state güncellemeleri ve `toast.success` ile yan etki).

---

### [N5_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::loadAddressesEffect
- **params**: (none) – `useEffect` callback.
- **ic_degiskenler**:
  - `rows` — `await listAddresses()` çağrısından dönen `UserAddress[]` dizisi.
  - `defShip` — `rows.find(r => r.is_default_shipping)`; varsayılan gönderim adresi.
  - `addr` — `defShip` verileriyle oluşturulan `CheckoutAddressInfo` objesi.
- **Dönüş**: `void` (state setterları `setSavedAddresses`, `setShippingAddress`, `setBillingAddress` ile yan etki).

---

### [N6_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::validateCustomerInfo
- **params**: (none) – `useCallback` callback.
- **ic_degiskenler**:
  - `customerInfo` – dışarıdan kapalı değişken; ad, e‑posta, telefon vb.
- **Dönüş**: `boolean` – tüm kontroller geçerse `true`, aksi takdirde `false` (hata durumunda `toast.error` ile yan etki).

---

### [N7_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::validateAddress
- **params**: `(address: CheckoutAddressInfo)`
- **ic_degiskenler**:
  - `address` – doğrulanacak adres objesi.
  - `full` – `address.full_address` veya `address.fullAddress` birleşiminden temizlenmiş string.
- **Dönüş**: `boolean` – adres geçerli ise `true`, aksi takdirde `false` (hata durumunda `toast.error` ile yan etki).

---

### [N8_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::handleNextStep
- **params**: `(initiatePayment: () => Promise<boolean | undefined>)`
- **ic_degiskenler**:
  - `step` – mevcut checkout adımı.
  - `shippingAddress` – gönderim adresi objesi.
  - `validateCustomerInfo` – müşteri bilgisi doğrulama fonksiyonu.
  - `validateAddress` – adres doğrulama fonksiyonu.
  - `setStep` – adım state’ini güncelleyen setter.
  - `success` – `await initiatePayment()` sonucunda elde edilen boolean/undefined.
- **Dönüş**: `Promise<void>` – adım geçişlerini yönetir, ödeme başarılıysa adımı 4’e yükseltir (yan etki: `setStep`).

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutOrchestrator.ts
  function: src\hooks\useCheckoutOrchestrator.ts::useCheckoutOrchestrator

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutOrchestrator
  export: useCheckoutOrchestrator