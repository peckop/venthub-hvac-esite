---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutOrchestrator.ts
skeleton_hash: f1eea9e436361140
entity_hashes:
  func:useCheckoutOrchestrator: 6b4ccd36fef055f6
  overview: efc40b3210b6f2b0
generated_at: 2026-06-06T21:55:29Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin satın alma sürecini merkezi olarak yöneten bir React özel hook'u barındırır. Sepet yönetiminden ödeme ve sipariş tamamlamaya kadar tüm sürecin akışını, durumunu ve entegrasyonlarını koordine ederek tutarlı bir satın alma deneyimi sunar.

## Fonksiyon Grupları
### Checkout Süreci Koordinasyonu
Tek bir koordinatör hook, satın alma işleminin tüm adımlarını (bilgi toplama, ödeme, sipariş tamamlama) sıralar ve yönetir.
- useCheckoutOrchestrator

---

## AXIOMS – Mimari Varsayımlar

Bu modül parametresiz bir React hook'u olarak tanımlanmıştır; iç bağımlılıkları fonksiyon gövdesi sağlamadığından detaylı çıkarım yapılamamaktadır.

**[Aksiyom 1]:** Eğer hook çağrıldığında erişilebilir bir React Context veya dış state kaynağı (store) yoksa, checkout süreci için gerekli sepet/kullanıcı verileri alınamaz ve hook anlamlı bir durum döndüremez.

**[Aksiyom 2]:** Eğer bu hook bir React bileşeninin dışında (React bileşen dışı bir scope'ta) çağrılırsa veya React kurallarına aykırı bir şekilde koşullu olarak çağrılırsa, React runtime hatası oluşur.

**[Aksiyom 3]:** Fonksiyon imzasında parametre tanımlı olmadığından, checkout süreciyle ilgili yapılandırma değerleri (eşik değerleri, API endpoint'leri vb.) fonksiyon dışındaki bir mekanizma (environment değişkeni, config dosyası, context) aracılığıyla sağlanmalıdır; aksi halde bu değerler bilinmezdir.

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
- **params**: (yok)
- **ic_degiskenler**:
  - `user` — useAuth() hook'undan alınan mevcut kullanıcı nesnesi
  - `t` — useI18n() hook'undan alınan çeviri fonksiyonu
  - `step` — mevcut checkout adımını tutan state (1-4 arası)
  - `setStep` — step state'ini güncelleyen setter
  - `customerInfo` — müşteri bilgilerini tutan state (name, firstName, lastName, email, phone, identityNumber)
  - `setCustomerInfo` — customerInfo state'ini güncelleyen setter
  - `shippingAddress` — kargo adresi bilgilerini tutan state (full_name, phone, full_address, fullAddress, city, district, postalCode, postal_code)
  - `setShippingAddress` — shippingAddress state'ini güncelleyen setter
  - `billingAddress` — fatura adresi bilgilerini tutan state
  - `setBillingAddress` — billingAddress state'ini güncelleyen setter
  - `invoiceType` — fatura türünü tutan state ('individual' | 'corporate')
  - `setInvoiceType` — invoiceType state'ini güncelleyen setter
  - `invoiceInfo` — fatura detaylarını tutan state (type, tckn, companyName, taxOffice, taxNumber)
  - `setInvoiceInfo` — invoiceInfo state'ini güncelleyen setter
  - `legalConsents` — yasal onay durumlarını tutan state (kvkk, sales_agreement, privacy_policy, distanceSales, preInfo, orderConfirm, marketing)
  - `setLegalConsents` — legalConsents state'ini güncelleyen setter
  - `sameAsShipping` — fatura adresinin kargo adresiyle aynı olup olmadığını tutan boolean state
  - `setSameAsShipping` — sameAsShipping state'ini güncelleyen setter
  - `shippingMethod` — kargo yöntemini tutan state ('standard' | 'express')
  - `setShippingMethod` — shippingMethod state'ini güncelleyen setter
  - `showHelp` — yardım panelinin görünürlüğünü tutan boolean state
  - `setShowHelp` — showHelp state'ini güncelleyen setter
  - `savedAddresses` — kullanıcının kayıtlı adreslerini tutan state (UserAddress[])
  - `setSavedAddresses` — savedAddresses state'ini güncelleyen setter
  - `showAddressModal` — adres seçim modalının görünürlüğünü tutan boolean state
  - `setShowAddressModal` — showAddressModal state'ini güncelleyen setter
  - `addressPickTarget` — adres seçim hedefini tutan state ('shipping' | 'billing')
  - `setAddressPickTarget` — addressPickTarget state'ini güncelleyen setter
  - `savedInvoiceProfiles` — kullanıcının kayıtlı fatura profillerini tutan state (InvoiceProfile[])
  - `setSavedInvoiceProfiles` — savedInvoiceProfiles state'ini güncelleyen setter
  - `showInvoiceModal` — fatura profili modalının görünürlüğünü tutan boolean state
  - `setShowInvoiceModal` — showInvoiceModal state'ini güncelleyen setter
  - `handleSelectInvoiceProfile` — useCallback ile sarılmış, fatura profili seçen fonksiyon
  - `validateCustomerInfo` — useCallback ile sarılmış, müşteri bilgilerini doğrulayan fonksiyon
  - `validateAddress` — useCallback ile sarılmış, adres bilgilerini doğrulayan fonksiyon
  - `handleNextStep` — useCallback ile sarılmış, bir sonraki adıma geçişi yöneten async fonksiyon
- **Dönüş**: Tüm state'lerin (değer + setter) ve callback fonksiyonların bir object'i döner

---

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator#useEffect_prefill_customer
- **params**: (yok — useEffect callback arrow function)
- **ic_degiskenler**:
  - `fullName` — user.user_metadata?.full_name değerinden alınan tam ad stringi, boş string default
  - `parts` — fullName.split(' ') ile oluşturulmuş, ad ve soyad parçalarını içeren dizi
- **Dönüş**: yok (yan etki: setCustomerInfo çağrısı ile müşteri bilgileri doldurulur)

---

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator#useEffect_load_invoice_profiles
- **params**: (yok — useEffect callback arrow function)
- **ic_degiskenler**:
  - `loadInvoiceProfiles` — içinde tanımlı async fonksiyon, fatura profillerini API'den yükler
- **Dönüş**: yok (yan etki: setSavedInvoiceProfiles, setInvoiceType, setInvoiceInfo çağrılır)

---

### [N4_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator#loadInvoiceProfiles
- **params**: (yok)
- **ic_degiskenler**:
  - `rows` — listInvoiceProfiles() API çağısından dönen InvoiceProfile dizisi
  - `defProfile` — rows.find(r => r.is_default) ile bulunan varsayılan profil, bulunamazsa rows[0]
  - `pType` — defProfile.profile_type değerine göre 'corporate' veya 'individual' olarak belirlenen fatura türü
- **Dönüş**: yok (yan etki: setSavedInvoiceProfiles, setInvoiceType, setInvoiceInfo ile state'leri günceller)

---

### [N5_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator#handleSelectInvoiceProfile
- **params**: `p` — InvoiceProfile tipinde, seçilen fatura profili nesnesi
- **ic_degiskenler**:
  - `pType` — p.profile_type değerine göre 'corporate' veya 'individual' olarak belirlenen fatura türü
- **Dönüş**: yok (yan etki: setInvoiceType, setInvoiceInfo, setShowInvoiceModal çağrılır; toast.success ile bildirim gösterilir)

---

### [N6_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator#useEffect_load_addresses
- **params**: (yok — useEffect callback arrow function)
- **ic_degiskenler**:
  - `loadAddresses` — içinde tanımlı async fonksiyon, adresleri API'den yükler
- **Dönüş**: yok (yan etki: setSavedAddresses, setShippingAddress, setBillingAddress çağrılır)

---

### [N7_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator#loadAddresses
- **params**: (yok)
- **ic_degiskenler**:
  - `rows` — listAddresses() API çağısından dönen UserAddress dizisi
  - `defShip` — rows.find(r => r.is_default_shipping) ile bulunan varsayılan kargo adresi
  - `addr` — CheckoutAddressInfo tipinde, defShip değerlerinden oluşturulmuş kargo adresi nesnesi
- **Dönüş**: yok (yan etki: setSavedAddresses, setShippingAddress, setBillingAddress ile state'leri günceller)

---

### [N8_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator#validateCustomerInfo
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `boolean` — tüm doğrulamalar geçerse true, aksi halde false

---

### [N9_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator#validateAddress
- **params**: `address` — CheckoutAddressInfo tipinde, doğrulanacak adres nesnesi
- **ic_degiskenler**:
  - `full` — address.full_address veya address.fullAddress değerinin trim edilmiş hali, tam adres stringi
- **Dönüş**: `boolean` — tüm doğrulamalar geçerse true, aksi halde false

---

### [N10_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useCheckoutOrchestrator#handleNextStep
- **params**: `initiatePayment` — () => Promise<boolean | undefined> tipinde, ödeme başlatma fonksiyonu
- **ic_degiskenler**:
  - `success` — initiatePayment() çağısının döndüğü boolean sonuç
- **Dönüş**: `Promise<void>` — (dönüş değeri yok, yan etki: setStep ile adım ilerletilir)

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutOrchestrator.ts
  function: src\hooks\useCheckoutOrchestrator.ts::useCheckoutOrchestrator

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutOrchestrator
  export: useCheckoutOrchestrator