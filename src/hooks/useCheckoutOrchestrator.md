---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutOrchestrator.ts
skeleton_hash: b0d12f3c2957247a
entity_hashes:
  func:useCheckoutOrchestrator: 6b4ccd36fef055f6
  overview: 6dca858583af2307
generated_at: 2026-05-29T18:48:40Z
---

## Genel Bakış
`useCheckoutOrchestrator` hook'u, VentHub HVAC projesinin satın alma sürecini merkezi olarak yöneten ve koordine eden bir React özel hook'udur. Sepet yönetiminden ödeme ve teslimat adımlarına kadar tüm sürecin akışını, durumunu ve entegrasyonlarını tek bir yerden kontrol ederek tutarlı ve yönetilebilir bir deneyim sunar.

## Fonksiyon Grupları
### Checkout Süreci Koordinasyonu
Bu ana hook, satın alma işleminin tüm adımlarını (kullanıcı bilgisi toplama, ödeme alma, siparişi tamamlama) sıralar, ilgili verileri toplar ve sürecin durumunu, başarı ve hata senaryolarını yönetir.
- useCheckoutOrchestrator

---

## AXIOMS – Mimari Varsayımlar

Bu hook, parametresiz olarak çağrılan bir React hook'u olup checkout sürecinin koordinasyonunu üstlenir. Aşağıdaki varsayımlar fonksiyon imzasından ve hook'un yapısından türetilmiştir:

---

**[Aksiyom 1]:** Eğer `useCheckoutOrchestrator` bir React hook'sa ve parametresiz çağrılıyorsa, bağımlılıklarının (sepet verisi, kullanıcı oturumu, ödeme servisi vb.) React Context veya iç hook'lar aracılığıyla sağlanmış olması gerekir; eğer dış kaynaklardan bağımlılıklar yoksa, hook geçersiz veri ile çalışır.

**[Aksiyom 2]:** Eğer hook dışı bir bileşen veya modül tarafından `useCheckoutOrchestrator` doğrudan çağrılmıyorsa (sadece içindeki yardımcı fonksiyonlar kullanılıyorsa), hook'un dışarıya döndürdüğü arayüzün (return value) bileşenler tarafından tüketilmesi gerekir; eğer dönüş değeri_consumed edilmezse, checkout süreci tetiklenemez.

**[Aksiyom 3]:** Eğer hook bir React bileşeninin içinde çağrılmıyorsa veya React Hooks kurallarının dışında (koşullu, döngü içinde, nested function içinde) kullanılıyorsa, React çalışma zamanı hatası oluşur.

**[Aksiyom 4]:** Eğer `useCheckoutOrchestrator` içinde bir state yönetimi (useState/useReducer) varsa ve bu state'e birden fazla asenkron işlem aynı anda yazıyorsa (race condition), checkout verileri tutarsız olur — bu nedenle sıralı/koordineli yazma varsayımı gereklidir.

**[Aksiyom 5]:** Eğer hook'un içinde API çağrıları (fetch/axios) yapılıyorsa ve bu çağrıların iptal edilme mekanizması (AbortController, cleanup) yoksa, bileşen unmount edildikten sonra state güncellemesi yapılmaya çalışılır ve "memory leak" veya "state update on unmounted component" uyarısı oluşur.

---

**Not:** Fonksiyon gövdesi (function body) sağlanmadığından, hook'un içindeki spesifik bağımlılık zincirleri, döndürülen değer yapısı ve yan etki detayları hakkında kesin çıkarım yapılamamıştır. Yukarıdaki aksiyomlar, hook'un imzası (parametresiz) ve React hook yapısı genellemesinden türetilmiştir.

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
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, kimlik bilgilerini tutar
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, metinleri döndürür
  - `step` — Mevcut checkout adımını tutan state (1=müşteri, 2=adres, 3=ödeme, 4=tamamlandı)
  - `setStep` — step state'ini güncellemek için setter fonksiyonu
  - `customerInfo` — Müşteri bilgilerini tutan state nesnesi (name, firstName, lastName, email, phone, identityNumber alanları)
  - `setCustomerInfo` — customerInfo state'ini güncellemek için setter fonksiyonu
  - `shippingAddress` — Teslimat adresi bilgilerini tutan state nesnesi (full_name, phone, full_address, fullAddress, city, district, postalCode, postal_code alanları)
  - `setShippingAddress` — shippingAddress state'ini güncellemek için setter fonksiyonu
  - `billingAddress` — Fatura adresi bilgilerini tutan state nesnesi (aynı alan yapısına sahip)
  - `setBillingAddress` — billingAddress state'ini güncellemek için setter fonksiyonu
  - `invoiceType` — Fatura türünü tutan state ('individual' veya 'corporate')
  - `setInvoiceType` — invoiceType state'ini güncellemek için setter fonksiyonu
  - `invoiceInfo` — Fatura detaylarını tutan state nesnesi (type, tckn, companyName, taxOffice, taxNumber alanları)
  - `setInvoiceInfo` — invoiceInfo state'ini güncellemek için setter fonksiyonu
  - `legalConsents` — Yasal onay durumlarını tutan state nesnesi (kvkk, sales_agreement, privacy_policy, distanceSales, preInfo, orderConfirm, marketing alanları boolean değerler)
  - `setLegalConsents` — legalConsents state'ini güncellemek için setter fonksiyonu
  - `sameAsShipping` — Fatura adresinin teslimat adresiyle aynı olup olmadığını tutan boolean state
  - `setSameAsShipping` — sameAsShipping state'ini güncellemek için setter fonksiyonu
  - `shippingMethod` — Kargo yöntemini tutan state ('standard' veya 'express')
  - `setShippingMethod` — shippingMethod state'ini güncellemek için setter fonksiyonu
  - `showHelp` — Yardım gösterilip gösterilmeyeceğini tutan boolean state
  - `setShowHelp` — showHelp state'ini güncellemek için setter fonksiyonu
  - `savedAddresses` — Kullanıcının kayıtlı adreslerini tutan state array'i (UserAddress tipinde)
  - `setSavedAddresses` — savedAddresses state'ini güncellemek için setter fonksiyonu
  - `showAddressModal` — Adres seçim modalinin açık olup olmadığını tutan boolean state
  - `setShowAddressModal` — showAddressModal state'ini güncellemek için setter fonksiyonu
  - `addressPickTarget` — Hangi adres türünün seçileceğini tutan state ('shipping' veya 'billing')
  - `setAddressPickTarget` — addressPickTarget state'ini güncellemek için setter fonksiyonu
  - `savedInvoiceProfiles` — Kullanıcının kayıtlı fatura profillerini tutan state array'i (InvoiceProfile tipinde)
  - `setSavedInvoiceProfiles` — savedInvoiceProfiles state'ini güncellemek için setter fonksiyonu
  - `showInvoiceModal` — Fatura profili seçim modalinin açık olup olmadığını tutan boolean state
  - `setShowInvoiceModal` — showInvoiceModal state'ini güncellemek için setter fonksiyonu
  - `handleSelectInvoiceProfile` — useCallback ile sarmalanmış, fatura profili seçen callback fonksiyonu
  - `validateCustomerInfo` — useCallback ile sarmalanmış, müşteri bilgilerini doğrulayan callback fonksiyonu
  - `validateAddress` — useCallback ile sarmalanmış, adres bilgisini doğrulayan callback fonksiyonu
  - `handleNextStep` — useCallback ile sarmalanmış, bir sonraki adıma geçişi yöneten async callback fonksiyonu
- **Dönüş**: { step, setStep, customerInfo, setCustomerInfo, shippingAddress, setShippingAddress, billingAddress, setBillingAddress, invoiceType, setInvoiceType, invoiceInfo, setInvoiceInfo, legalConsents, setLegalConsents, sameAsShipping, setSameAsShipping, shippingMethod, setShippingMethod, showHelp, setShowHelp, savedAddresses, setSavedAddresses, showAddressModal, setShowAddressModal, addressPickTarget, setAddressPickTarget, savedInvoiceProfiles, setSavedInvoiceProfiles, showInvoiceModal, setShowInvoiceModal, handleSelectInvoiceProfile, validateCustomerInfo, validateAddress, handleNextStep } nesnesi döndürür

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useEffect[pre-fill customer info]
- **params**: () => {}
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, user.user_metadata.full_name, user.email, user.user_metadata.phone alanlarını içerir
  - `fullName` — user.user_metadata.full_name değerinden veya boş stringden oluşan tam ad değişkeni
  - `parts` — fullName.split(' ') ile oluşturulan, ad ve soyadı ayıran array
- **Dönüş**: yok (side effect: setCustomerInfo çağrısı ile customerInfo state'ini günceller)

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useEffect[load Invoice profiles]
- **params**: () => {}
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, kullanıcı oturum durumunu kontrol eder
  - `rows` — listInvoiceProfiles() API çağrısından dönen InvoiceProfile array'i
  - `defProfile` — rows.find(r => r.is_default) || rows[0] ile bulunan varsayılan fatura profili veya ilk profil
  - `pType` — defProfile.profile_type değerine göre 'individual' veya 'corporate' olarak belirlenen fatura türü string'i
- **Dönüş**: yok (side effect: setSavedInvoiceProfiles, setInvoiceType, setInvoiceInfo çağrısı ile state'leri günceller)

### [N4_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::loadInvoiceProfiles
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, kullanıcı oturum durumunu kontrol eder
  - `rows` — listInvoiceProfiles() API çağrısından dönen InvoiceProfile array'i
  - `defProfile` — rows.find(r => r.is_default) || rows[0] ile bulunan varsayılan fatura profili veya ilk profil
  - `pType` — defProfile.profile_type değerine göre 'individual' veya 'corporate' olarak belirlenen fatura türü string'i
- **Dönüş**: Promise<void> (async fonksiyon, doğrudan değer döndürmez, state'leri günceller)

### [N5_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::handleSelectInvoiceProfile
- **params**: (p: InvoiceProfile) — Seçilen fatura profili nesnesi
- **ic_degiskenler**:
  - `pType` — p.profile_type değerine göre 'individual' veya 'corporate' olarak belirlenen fatura türü string'i
- **Dönüş**: void (yan etki: setInvoiceType, setInvoiceInfo, setShowInvoiceModal çağrısı ile state'leri günceller, toast.success gösterir)

### [N6_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::useEffect[load Addresses]
- **params**: () => {}
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, kullanıcı oturum durumunu kontrol eder
  - `sameAsShipping` — Fatura adresinin teslimat adresiyle aynı olup olmadığını tutan boolean state
  - `rows` — listAddresses() API çağrısından dönen UserAddress array'i
  - `defShip` — rows.find(r => r.is_default_shipping) ile bulunan varsayılan teslimat adresi
  - `addr` — defShip değerlerinden oluşturulmuş CheckoutAddressInfo tipinde nesne (full_address, city, district, postalCode, full_name, phone alanları)
- **Dönüş**: yok (side effect: setSavedAddresses, setShippingAddress, setBillingAddress çağrısı ile state'leri günceller)

### [N7_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::loadAddresses
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, kullanıcı oturum durumunu kontrol eder
  - `rows` — listAddresses() API çağrısından dönen UserAddress array'i
  - `defShip` — rows.find(r => r.is_default_shipping) ile bulunan varsayılan teslimat adresi
  - `addr` — defShip değerlerinden oluşturulmuş CheckoutAddressInfo tipinde nesne (full_address, city, district, postalCode, full_name, phone alanları)
- **Dönüş**: Promise<void> (async fonksiyon, doğrudan değer döndürmez, state'leri günceller)

### [N8_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::validateCustomerInfo
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `customerInfo` — Doğrulanacak müşteri bilgilerini tutan state nesnesi (name, email, phone alanlarını içerir)
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
- **Dönüş**: boolean — Tüm doğrulamalar geçerse true, aksi halde false döndürür ve toast.error gösterir

### [N9_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::validateAddress
- **params**: (address: CheckoutAddressInfo) — Doğrulanacak adres bilgisi nesnesi
- **ic_degiskenler**:
  - `address` — Parametre olarak gelen adres nesnesi (full_address, fullAddress, city, district alanlarını içerir)
  - `full` — (address.full_address || address.fullAddress || '').trim() ile oluşturulmuş, trimmed tam adres string'i
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
- **Dönüş**: boolean — Tüm doğrulamalar geçerse true, aksi halde false döndürür ve toast.error gösterir

### [N10_NASIL] AST Pointer: src/hooks/useCheckoutOrchestrator.ts::handleNextStep
- **params**: (initiatePayment: () => Promise<boolean | undefined>) — Ödeme işlemini başlatan async callback fonksiyonu
- **ic_degiskenler**:
  - `step` — Mevcut checkout adımını tutan state (1, 2 veya 3 olabilir)
  - `validateCustomerInfo` — Müşteri bilgilerini doğrulayan callback fonksiyonu
  - `shippingAddress` — Teslimat adresi bilgilerini tutan state nesnesi
  - `validateAddress` — Adres bilgisini doğrulayan callback fonksiyonu
  - `success` — initiatePayment() çağrısından dönen boolean veya undefined değer (ödeme başarılı mı)
- **Dönüş**: Promise<void> (async fonksiyon, doğrudan değer döndürmez, setStep çağrısı ile step state'ini günceller)

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutOrchestrator.ts
  function: src\hooks\useCheckoutOrchestrator.ts::useCheckoutOrchestrator

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutOrchestrator
  export: useCheckoutOrchestrator