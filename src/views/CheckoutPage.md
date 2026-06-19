---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CheckoutPage.tsx
skeleton_hash: 19e35a930c3d034c
entity_hashes:
  func:CheckoutPage: d9bc38b15b781fcb
  func:handleAddressDelete: ec0b9e7a9db92cd8
  func:handleAddressSaved: 301e608092f98f4d
  func:onNextStep: 3e6b3d1f38e13467
  overview: c81a7524fbfb8b66
  style_tokens: 71bc3e57c5f9a6e4
generated_at: 2026-06-19T09:04:41Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının e-ticaret sipariş tamamlama (checkout) sürecini yöneten ana React bileşenidir. Kullanıcının adres bilgilerini girmesini, düzenlemesini ve ödeme adımlarında ilerlemesini kontrol eden çok aşamalı bir satın alma deneyimini koordine eder.

## Fonksiyon Grupları
### Ana Sayfa ve Durum Yönetimi
Tüm checkout sürecinin üst düzey yapısını ve durumunu (adım seçimi, veri toplama) oluşturur. Alt süreçlerin ve bileşenlerin entegrasyonunu sağlayarak kullanıcı deneyimini orkestra eder.
- CheckoutPage

### Adres İşlemleri
Kullanıcının teslimat adreslerini kaydetmesi ve silmesi gibi temel CRUD (oluştur, oku, güncelle, sil) işlemlerini asenkron olarak yönetir. Adres verilerinin doğruluğunu ve akışını kontrol eder.
- handleAddressSaved, handleAddressDelete

### Süreç İlerlemesi
Ödeme sürecindeki bir sonraki aşama geçiş mantığını ve kullanıcının ilerleme haklarını doğrular. Adımlar arasında geçiş yaparken gerekli kuralları ve validasyonları uygular.
- onNextStep

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### CheckoutPage

**Ne yapar**: CheckoutPage, kullanıcıların satın alma işlemlerini tamamlayabilecekleri ana sayfa bileşenidir. Sepet özeti, teslimat bilgileri, ödeme seçenekleri ve sipariş onaylama adımlarını içeren çok aşamalı bir satın alma akışını yönetir.

**Nasıl yapar**: React functional component (React.FC) yapısıyla oluşturulmuştur. Checkout aşamalarını (step) state ile takip eder ve kullanıcı ilerledikçe bir sonraki aşama bileşenlerini render eder. Form validasyonları, adım geçiş mantığı ve sipariş tamamlama süreçlerini içsal state yönetimi ile kontrol eder.

**Parametreler**:
- Bu fonksiyon Props almamaktadır (React.FC olarak tanımlıdır, dışarıdan parametre beklenmemektedir)

**Dönüş**: `React.JSX.Element` — Checkout sayfasının tamamını oluşturan React JSX bileşeni döndürür

### handleAddressSaved
**Ne yapar**: Bu fonksiyon, bir adres başarıyla kaydedildikten veya güncellendikten sonra tetiklenen bir geri çağırma (callback) fonksiyonudur. Genellikle bir formun gönderilmesi veya bir API çağrısının başarılı yanıt almasının ardından kullanıcı arayüzünü güncellemek veya kullanıcıya bildirimde bulunmak için kullanılır.

**Nasıl yapar**: Fonksiyonun içinde, muhtemelen ilgili bileşenin durumunu (state) güncelleme, form alanlarını temizleme, kullanıcıya başarılı bir mesaj gösterme veya sayfayı belirli bir duruma getirme işlemleri yapılır. Fonksiyonun içindeki spesifik mantık, kaydedilen adres verisinin başarısıyla tetiklenen yan etkilere yöneliktir.

**Parametreler**:
- Fonksiyon parametre almaz.

**Dönüş**: Bilinmiyor.

### handleAddressDelete
**Ne yapar**: Bu fonksiyon, belirli bir kimliğe (ID) sahip adresi silme işlemini başlatır. Kullanıcı bir adres listesinden veya detayından "sil" butonuna tıkladığında çağrılır. Silme işlemi genellikle bir API isteği ve ardından arayüzün güncellenmesiyle sonuçlanır.

**Nasıl yapar**: Fonksiyon, gelen `id` parametresini kullanarak bir silme API'sine (örneğin, DELETE HTTP metodu ile) istek gönderir. İsteğin başarılı olması durumunda, silinen adresi yerel durumdan (state) kaldırarak arayüzü günceller. Hata yönetimi ve kullanıcı onayı (confirm dialog gibi) işlemleri de bu fonksiyonun içinde veya çağrıldığı yerde yönetilebilir.

**Parametreler**:
- id: string — Silinecek olan adresin benzersiz tanımlayıcısı (ID) bilgisi. Bu değer, silme işlemi için API'ye gönderilir ve doğru kaydın hedeflenmesini sağlar.

**Dönüş**: Bilinmiyor.

### onNextStep
**Ne yapar**: onNextStep, CheckoutPage bileşeninde kullanılan ve ödeme akışındaki adım ilerletme işlemini gerçekleştiren fonksiyondur. Mevcut ödeme adımından bir sonrakine geçişi tetiklemek üzere tasarlanmıştır. Ödeme akışının düzenli ve sıralı bir şekilde ilerlemesini sağlamak için kullanılır.
**Nasıl yapar**: Verilen belgelere göre iç işleyiş detayları (adım doğrulaması, durum güncellemesi gibi) belirtilmemiştir. Dönüş tipinin void veya bilinmiyor olduğu bilgisi mevcuttur.
**Parametreler**:
- Verilen bilgide herhangi bir parametre tanımlanmamıştır.
**Dönüş**: void veya bilinmiyor — Herhangi bir değer döndürmez veya dönüş tipi açıkça belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useAuth::useAuth
- import: ../hooks/useCartHook::useCart
- import: ../hooks/useCheckoutCoupon::useCheckoutCoupon
- import: ../hooks/useCheckoutOrchestrator::useCheckoutOrchestrator
- import: ../hooks/useCheckoutPayment::useCheckoutPayment
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../types/db-rows::CheckoutAddressInfo
- import: ../utils/checkoutHelpers::getTranslationWithFallback
- import: ./checkout/AddressFormModal::AddressFormModal
- import: ./checkout/AddressSelectModal::AddressSelectModal
- import: ./checkout/CheckoutProgress::CheckoutProgress
- import: ./checkout/InvoiceProfileModal::InvoiceProfileModal
- import: ./checkout/OrderSummarySidebar::OrderSummarySidebar
- import: ./checkout/PaymentIframeContainer::PaymentIframeContainer
- import: ./checkout/ReviewSummary::ReviewSummary
- import: ./checkout/SecurePaymentOverlay::SecurePaymentOverlay
- import: ./checkout/StepAddressInfo::StepAddressInfo
- import: ./checkout/StepCustomerInfo::StepCustomerInfo
- import: @/lib/services/address.service::deleteAddress
- import: @/lib/services/address.service::listAddresses
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/ui-models::type { UserAddress }
- import: lucide-react::ArrowLeft
- import: next/link::Link
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CheckoutPage.tsx::CheckoutPage
- **params**: ()
- **ic_degiskenler**: 
  - `items` — `useCart()` hook'undan sepet ürünleri listesi
  - `getCartTotal` — `useCart()` hook'undan sepet toplamını hesaplayan fonksiyon
  - `clearCart` — `useCart()` hook'undan sepeti temizleyen fonksiyon
  - `applyServerPricing` — `useCart()` hook'undan sunucu fiyatlandırmasını uygulayan fonksiyon
  - `user` — `useAuth()` hook'undan mevcut kullanıcı nesnesi
  - `authLoading` — `useAuth()` hook'undan kimlik doğrulama yükleniyor durumu (boolean)
  - `router` — `useRouter()` hook'undan Next.js router nesnesi
  - `t` — `useI18n()` hook'undan çeviri fonksiyonu
  - `lang` — `useI18n()` hook'undan mevcut dil kodu
  - `Routes` — `useLocalizedRoutes()` hook'undan yerel rotalar nesnesi
  - `editingAddress` — `useState<UserAddress | null>(null)` ile oluşturulan, düzenlenen adres (UserAddress veya null)
  - `showAddressFormModal` — `useState<boolean>(false)` ile oluşturulan, adres formu modali görünür mü (boolean)
  - `orchestrator` — `useCheckoutOrchestrator()` hook'undan ödeme akışı orkestratörü
  - `step` — orchestrator'dan mevcut ödeme adımı (number)
  - `setStep` — orchestrator'dan adım sayısını ayarlayan fonksiyon
  - `customerInfo` — orchestrator'dan müşteri bilgileri
  - `setCustomerInfo` — orchestrator'dan müşteri bilgilerini ayarlayan fonksiyon
  - `shippingAddress` — orchestrator'dan teslimat adresi (CheckoutAddressInfo)
  - `setShippingAddress` — orchestrator'dan teslimat adresini ayarlayan fonksiyon
  - `billingAddress` — orchestrator'dan fatura adresi (CheckoutAddressInfo)
  - `setBillingAddress` — orchestrator'dan fatura adresini ayarlayan fonksiyon
  - `invoiceType` — orchestrator'dan fatura tipi
  - `setInvoiceType` — orchestrator'dan fatura tipini ayarlayan fonksiyon
  - `invoiceInfo` — orchestrator'dan fatura bilgileri
  - `setInvoiceInfo` — orchestrator'dan fatura bilgilerini ayarlayan fonksiyon
  - `legalConsents` — orchestrator'dan yasal onaylar (boolean objesi)
  - `setLegalConsents` — orchestrator'dan yasal onayları ayarlayan fonksiyon
  - `sameAsShipping` — orchestrator'dan fatura adresinin teslimat adresiyle aynı olup olmadığı (boolean)
  - `setSameAsShipping` — orchestrator'dan sameAsShipping değerini ayarlayan fonksiyon
  - `shippingMethod` — orchestrator'dan kargo yöntemi
  - `setShippingMethod` — orchestrator'dan kargo yöntemini ayarlayan fonksiyon
  - `showHelp` — orchestrator'dan yardım gösteriliyor mu (boolean)
  - `setShowHelp` — orchestrator'dan showHelp değerini ayarlayan fonksiyon
  - `savedAddresses` — orchestrator'dan kayıtlı adresler listesi (UserAddress[])
  - `showAddressModal` — orchestrator'dan adres seçim modali görünür mü (boolean)
  - `setShowAddressModal` — orchestrator'dan showAddressModal değerini ayarlayan fonksiyon
  - `addressPickTarget` — orchestrator'dan adres seçiminin hedefi ('shipping' veya 'billing')
  - `setAddressPickTarget` — orchestrator'dan addressPickTarget değerini ayarlayan fonksiyon
  - `savedInvoiceProfiles` — orchestrator'dan kayıtlı fatura profilleri listesi
  - `showInvoiceModal` — orchestrator'dan fatura profili modali görünür mü (boolean)
  - `setShowInvoiceModal` — orchestrator'dan showInvoiceModal değerini ayarlayan fonksiyon
  - `handleSelectInvoiceProfile` — orchestrator'dan fatura profili seçimi işleyicisi
  - `handleNextStep` — orchestrator'dan sonraki adıma geçiş işleyicisi
  - `couponCode` — `useCheckoutCoupon` hook'undan kupon kodu (string)
  - `setCouponCode` — `useCheckoutCoupon` hook'undan kupon kodunu ayarlayan fonksiyon
  - `couponApplied` — `useCheckoutCoupon` hook'undan uygulanan kupon bilgisi (nesne veya null)
  - `applyCoupon` — `useCheckoutCoupon` hook'undan kupon uygulayan fonksiyon
  - `removeCoupon` — `useCheckoutCoupon` hook'undan kuponu kaldıran fonksiyon
  - `payment` — `useCheckoutPayment` hook'undan ödeme nesnesi (iyzToken, paymentFrameContent, loading, progressPct, formReady, initiatePayment içerir)
  - `totalAmount` — hesaplanan toplam tutar (getCartTotal())
  - `vatAmount` — hesaplanan KDV tutarı (totalAmount - totalAmount / 1.2)
  - `finalAmount` — hesaplanan nihai tutar (toplam indirim uygulanmış tutar)
- **Dönüş**: JSX elementi (Checkout sayfası)

### [N2_NASIL] AST Pointer: CheckoutPage.tsx::handleAddressSaved
- **params**: ()
- **ic_degiskenler**: 
  - `refreshed` — `listAddresses(supabaseBrowserClient)` çağrısından dönen güncellenmiş adres listesi
- **Dönüş**: yok (async fonksiyon, orkestratörün savedAddresses state'ini günceller)

### [N3_NASIL] AST Pointer: CheckoutPage.tsx::handleAddressDelete
- **params**: `id: string` — silinecek adresin ID'si
- **ic_degiskenler**: 
  - `refreshed` — `listAddresses(supabaseBrowserClient)` çağrısından dönen güncellenmiş adres listesi
- **Dönüş**: yok (async fonksiyon, adresi siler, toast gösterir ve listeyi yeniler)

### [N4_NASIL] AST Pointer: CheckoutPage.tsx::onNextStep
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: yok (handleNextStep fonksiyonunu payment.initiatePayment parametresiyle çağırır)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    CheckoutPage_tsx__CheckoutPage["CheckoutPage"]
    CheckoutPage_tsx__handleAddressDelete["handleAddressDelete"]
    CheckoutPage_tsx__handleAddressSaved["handleAddressSaved"]
    CheckoutPage_tsx__onNextStep["onNextStep"]
```

## NODE ID STANDARD

  file: src\views\CheckoutPage.tsx
  function: src\views\CheckoutPage.tsx::CheckoutPage
  function: src\views\CheckoutPage.tsx::handleAddressSaved
  function: src\views\CheckoutPage.tsx::handleAddressDelete
  function: src\views\CheckoutPage.tsx::onNextStep

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-light-gray`, `bg-primary-navy`, `bg-white`, `border-2`, `border-light-gray`, `border-t`, `text-2xl`, `text-center`, `text-industrial-gray`, `text-white`
- **Layout:** `flex`, `gap-8`, `grid`, `grid-cols-1`, `inline-flex`, `items-center`, `justify-between`, `justify-center`, `lg:col-span-1`, `lg:col-span-2`, `lg:grid-cols-3`, `max-w-7xl`, `min-h-screen`, `p-6`, `shadow-sm`
- **Varyant/Responsive:** `disabled:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `disabled:opacity-50`, `font-bold`, `font-semibold`, `lg:px-8`, `mb-4`, `mr-2`, `mt-8`, `mx-auto`, `pt-6`, `px-4`, `px-6`, `px-8`, `py-3`, `py-8`