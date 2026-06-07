---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutOrchestrator.ts
skeleton_hash: 21ca5d27be7a7c9e
entity_hashes:
  func:useCheckoutOrchestrator: 6b4ccd36fef055f6
  overview: 2cb8b2386ae09d1e
generated_at: 2026-06-07T12:06:16Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin satın alma sürecini merkezi olarak yöneten bir React özel hook'u sunar. Sepet yönetiminden ödeme ve sipariş tamamlamaya kadar tüm sürecin akışını, durumunu ve servis entegrasyonlarını koordine ederek bileşenler düzeyinde tutarlı bir satın alma deneyimi sağlar.

## Fonksiyon Grupları
### Checkout Süreci Koordinasyonu
Satın alma işleminin tüm adımlarını —bilgi toplama, ödeme doğrulama ve sipariş tamamlama— tek bir koordinatör hook üzerinden sıralı bir şekilde yönetir, durum takibi ve hata yönetimini merkezileştirir.
- useCheckoutOrchestrator

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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

### [N1_NASIL] AST Pointer: `src/hooks/useCheckoutOrchestrator.ts`::useCheckoutOrchestrator
- **params**: (yok)
- **ic_degiskenler**:
  - `user` — `useAuth()` hookundan gelen oturum açmış kullanıcı nesnesi
  - `t` — `useI18n()` hookundan gelen çeviri fonksiyonu
  - `step` / `setStep` — Checkout akışındaki mevcut adım numarası (1-4 arası)
  - `customerInfo` / `setCustomerInfo` — Müşteri bilgi formu state'i (name, firstName, lastName, email, phone, identityNumber alanlarını tutar)
  - `shippingAddress` / `setShippingAddress` — Kargo adresi formu state'i (full_name, phone, full_address, fullAddress, city, district, postalCode, postal_code alanlarını tutar)
  - `billingAddress` / `setBillingAddress` — Fatura adresi formu state'i (shippingAddress ile aynı yapıda)
  - `invoiceType` / `setInvoiceType` — Fatura türü: `'individual'` veya `'corporate'`
  - `invoiceInfo` / `setInvoiceInfo` — Fatura detayları (type, tckn, companyName, taxOffice, taxNumber alanlarını tutar)
  - `legalConsents` / `setLegalConsents` — Yasal onay checkboxları state'i (kvkk, sales_agreement, privacy_policy, distanceSales, preInfo, orderConfirm, marketing)
  - `sameAsShipping` / `setSameAsShipping` — Fatura adresinin kargo adresi ile aynı olup olmadığını belirten bayrak
  - `shippingMethod` / `setShippingMethod` — Kargo yöntemi: `'standard'` veya `'express'`
  - `showHelp` / `setShowHelp` — Yardım panelinin görünürlük durumu
  - `savedAddresses` / `setSavedAddresses` — Kullanıcının kayıtlı adreslerinin listesi
  - `showAddressModal` / `setShowAddressModal` — Adres seçim modalının görünürlüğü
  - `addressPickTarget` / `setAddressPickTarget` — Hangi adresin seçildiği (`'shipping'` veya `'billing'`)
  - `savedInvoiceProfiles` / `setSavedInvoiceProfiles` — Kullanıcının kayıtlı fatura profillerinin listesi
  - `showInvoiceModal` / `setShowInvoiceModal` — Fatura profili seçim modalının görünürlüğü
  - `handleSelectInvoiceProfile` — useCallback ile tanımlanmış fatura profili seçme işleyicisi
  - `validateCustomerInfo` — useCallback ile tanımlanmış müşteri bilgisi doğrulama fonksiyonu
  - `validateAddress` — useCallback ile tanımlanmış adres doğrulama fonksiyonu
  - `handleNextStep` — useCallback ile tanımlanmış asenkron adım ilerletme fonksiyonu
- **Dönüş**: `{ step, setStep, customerInfo, setCustomerInfo, shippingAddress, setShippingAddress, billingAddress, setBillingAddress, invoiceType, setInvoiceType, invoiceInfo, setInvoiceInfo, legalConsents, setLegalConsents, sameAsShipping, setSameAsShipping, shippingMethod, setShippingMethod, showHelp, setShowHelp, savedAddresses, setSavedAddresses, showAddressModal, setShowAddressModal, addressPickTarget, setAddressPickTarget, savedInvoiceProfiles, setSavedInvoiceProfiles, showInvoiceModal, setShowInvoiceModal, handleSelectInvoiceProfile, validateCustomerInfo, validateAddress, handleNextStep }` — Tüm checkout state'lerini, setter'larını ve işleyici fonksiyonları içeren nesne

---

### [N2_NASIL] AST Pointer: `src/hooks/useCheckoutOrchestrator.ts`::useEffect(pre-fill customer info callback)
- **params**: (yok)
- **ic_degiskenler**:
  - `fullName` — `user.user_metadata?.full_name` değerinden alınan tam ad; boş string fallback'li
  - `parts` — `fullName.split(' ')` ile oluşmuş kelimeler dizisi; ilk eleman firstName, geri kalanı lastName olarak ayrıştırılır
- **Dönüş**: yok — `setCustomerInfo` ile user bilgilerini form state'ine yazar (yan etki)

---

### [N3_NASIL] AST Pointer: `src/hooks/useCheckoutOrchestrator.ts`::loadInvoiceProfiles (useEffect içindeki inner async function)
- **params**: (yok)
- **ic_degiskenler**:
  - `rows` — `listInvoiceProfiles(supabaseBrowserClient)` API çağrısının dönüşü; `InvoiceProfile[]` dizisi
  - `defProfile` — `rows.find(r => r.is_default) || rows[0]` ifadesinden elde edilen varsayılan veya ilk fatura profili; `undefined` olabilir
  - `pType` — `defProfile.profile_type` değerinin `'corporate'` olup olmadığına bakılarak normalize edilmiş tür: `'individual'` veya `'corporate'`
- **Dönüş**: yok — `setSavedInvoiceProfiles(rows)`, `setInvoiceType(pType)`, `setInvoiceInfo(...)` ile state'leri günceller (yan etki)

---

### [N4_NASIL] AST Pointer: `src/hooks/useCheckoutOrchestrator.ts`::handleSelectInvoiceProfile
- **params**: `(p: InvoiceProfile)` — Seçilen fatura profili nesnesi
- **ic_degiskenler**:
  - `pType` — `p.profile_type` değerinin `'corporate'` olup olmadığına bakılarak normalize edilmiş tür: `'individual'` veya `'corporate'`
- **Dönüş**: yok — `setInvoiceType`, `setInvoiceInfo`, `setShowInvoiceModal(false)`, `toast.success(...)` ile state'leri günceller ve bildirim gösterir (yan etki)

---

### [N5_NASIL] AST Pointer: `src/hooks/useCheckoutOrchestrator.ts`::loadAddresses (useEffect içindeki inner async function)
- **params**: (yok)
- **ic_degiskenler**:
  - `rows` — `listAddresses(supabaseBrowserClient)` API çağrısının dönüşü; `UserAddress[]` dizisi
  - `defShip` — `rows.find(r => r.is_default_shipping)` ifadesinden elde edilen varsayılan kargo adresi; `undefined` olabilir
  - `addr` — `defShip` alanlarından (`address_line`, `city`, `district`, `postal_code`, `full_name`, `phone`) oluşturulmuş `CheckoutAddressInfo` nesnesi
- **Dönüş**: yok — `setSavedAddresses(rows)`, `setShippingAddress(addr)`, koşullu `setBillingAddress(addr)` ile state'leri günceller (yan etki)

---

### [N6_NASIL] AST Pointer: `src/hooks/useCheckoutOrchestrator.ts`::validateCustomerInfo
- **params**: (yok) — closure üzerinden `customerInfo` ve `t` kullanır
- **ic_degiskenler**:
  - (yok — doğrudan closure değişkenleri `customerInfo.name`, `customerInfo.email`, `customerInfo.phone` ve `t(...)` çeviri fonksiyonu kullanılır)
- **Dönüş**: `boolean` — `true` tüm kontrollerden geçtiğinde, `false` hata toast gösterildiğinde

---

### [N7_NASIL] AST Pointer: `src/hooks/useCheckoutOrchestrator.ts`::validateAddress
- **params**: `(address: CheckoutAddressInfo)` — Doğrulanacak adres nesnesi
- **ic_degiskenler**:
  - `full` — `address.full_address || address.fullAddress` birleşiminden elde edilmiş trimmed tam adres字符串i
- **Dönüş**: `boolean` — `true` tüm alanlar dolu olduğunda, `false` hata toast gösterildiğinde

---

### [N8_NASIL] AST Pointer: `src/hooks/useCheckoutOrchestrator.ts`::handleNextStep
- **params**: `(initiatePayment: () => Promise<boolean | undefined>)` — Dışarıdan enjekte edilen ödeme başlatma fonksiyonu
- **ic_degiskenler**:
  - `success` — `await initiatePayment()` çağrısının dönüş değeri; `boolean | undefined`
- **Dönüş**: `Promise<void>` — `setStep` ile adım durumunu güncüler; `success` ise `setStep(4)` yapar (yan etki)

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutOrchestrator.ts
  function: src\hooks\useCheckoutOrchestrator.ts::useCheckoutOrchestrator

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutOrchestrator
  export: useCheckoutOrchestrator