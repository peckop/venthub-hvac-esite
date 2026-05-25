---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CheckoutPage.tsx
skeleton_hash: c6b3de86c015dae5
generated_at: 2026-05-25T09:58:29Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının sipariş tamamlama ekranını sağlayan ana React bileşenidir. Kullanıcıdan müşteri ve teslimat bilgilerini toplar, ödeme sürecinin adım adım ilerlemesini yönetir ve gerekli adım geçişlerini gerçekleştirir.

## Fonksiyon Grupları
### Ana Bileşen
Modülün temel yapısını oluşturur, checkout ekranının tüm UI bileşenlerini bir araya getirir ve genel akışı koordine eder.
- CheckoutPage

### Süreç Geçiş Yönetimi
Ödeme sürecindeki bir sonraki adıma geçiş işlemlerini yönetir, ana bileşen tarafından çağrılarak kullanılır.
- onNextStep

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### CheckoutPage
**Ne yapar**: CheckoutPage, venthub-hvac uygulamasının ödeme sayfasının temel React fonksiyonel bileşenini tanımlar. Ödeme akışının görüntülenmesini ve yönetilmesini sağlayan ana bileşen olarak görev yapar. Kullanıcının ödeme işlemlerini yürüttüğü sayfanın temel yapısını oluşturur.
**Nasıl yapar**: Verilen belgelere göre iç işleyiş detayları (render edilen alt bileşenler, durum yönetimi, olay dinleyiciler gibi) belirtilmemiştir. Yalnızca React.FC tipiyle bir bileşen döndürmek üzere yapılandırıldığı bilgisi mevcuttur.
**Parametreler**:
- Verilen bilgide herhangi bir parametre tanımlanmamıştır.
**Dönüş**: React.FC tipi — Ödeme sayfasının render edilebilir React bileşen örneğini döndürür.

### onNextStep
**Ne yapar**: onNextStep, CheckoutPage bileşeninde kullanılan ve ödeme akışındaki adım ilerletme işlemini gerçekleştiren fonksiyondur. Mevcut ödeme adımından bir sonrakine geçişi tetiklemek üzere tasarlanmıştır. Ödeme akışının düzenli ve sıralı bir şekilde ilerlemesini sağlamak için kullanılır.
**Nasıl yapar**: Verilen belgelere göre iç işleyiş detayları (adım doğrulaması, durum güncellemesi gibi) belirtilmemiştir. Dönüş tipinin void veya bilinmiyor olduğu bilgisi mevcuttur.
**Parametreler**:
- Verilen bilgide herhangi bir parametre tanımlanmamıştır.
**Dönüş**: void veya bilinmiyor — Herhangi bir değer döndürmez veya dönüş tipi açıkça belirtilmemiştir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\CheckoutPage.tsx::CheckoutPage
- **params**: (none)
- **ic_degiskenler**:
  - `items` — array of cart items from `useCart()`
  - `getCartTotal` — function to calculate cart total from `useCart()`
  - `clearCart` — function to clear cart from `useCart()`
  - `applyServerPricing` — function to apply server‑side pricing from `useCart()`
  - `user` — authenticated user object from `useAuth()`
  - `authLoading` — boolean indicating auth loading state from `useAuth()`
  - `router` — Next.js router instance from `useRouter()`
  - `t` — translation function from `useI18n()`
  - `lang` — current language code from `useI18n()`
  - `orchestrator` — checkout orchestrator object from `useCheckoutOrchestrator()`
  - `step` — current checkout step from orchestrator
  - `setStep` — function to update step from orchestrator
  - `customerInfo` — customer information object from orchestrator
  - `setCustomerInfo` — function to update customer info from orchestrator
  - `shippingAddress` — shipping address object from orchestrator
  - `setShippingAddress` — function to update shipping address from orchestrator
  - `billingAddress` — billing address object from orchestrator
  - `setBillingAddress` — function to update billing address from orchestrator
  - `invoiceType` — type of invoice from orchestrator
  - `setInvoiceType` — function to update invoice type from orchestrator
  - `invoiceInfo` — invoice information object from orchestrator
  - `setInvoiceInfo` — function to update invoice info from orchestrator
  - `legalConsents` — legal consents object from orchestrator
  - `setLegalConsents` — function to update legal consents from orchestrator
  - `sameAsShipping` — boolean indicating if billing equals shipping from orchestrator
  - `setSameAsShipping` — function to update sameAsShipping from orchestrator
  - `shippingMethod` — selected shipping method from orchestrator
  - `setShippingMethod` — function to update shipping method from orchestrator
  - `showHelp` — boolean to show help overlay from orchestrator
  - `setShowHelp` — function to update showHelp from orchestrator
  - `savedAddresses` — array of saved addresses from orchestrator
  - `showAddressModal` — boolean to show address modal from orchestrator
  - `setShowAddressModal` — function to update showAddressModal from orchestrator
  - `addressPickTarget` — target address type ('shipping' or 'billing') from orchestrator
  - `setAddressPickTarget` — function to update addressPickTarget from orchestrator
  - `savedInvoiceProfiles` — array of saved invoice profiles from orchestrator
  - `showInvoiceModal` — boolean to show invoice modal from orchestrator
  - `setShowInvoiceModal` — function to update showInvoiceModal from orchestrator
  - `handleSelectInvoiceProfile` — handler to select an invoice profile from orchestrator
  - `handleNextStep` — handler to proceed to next step from orchestrator
  - `couponCode` — current coupon code string from `useCheckoutCoupon()`
  - `setCouponCode` — function to update coupon code from `useCheckoutCoupon()`
  - `couponApplied` — object containing applied coupon details from `useCheckoutCoupon()`
  - `applyCoupon` — function to apply coupon from `useCheckoutCoupon()`
  - `removeCoupon` — function to remove coupon from `useCheckoutCoupon()`
  - `payment` — payment object returned by `useCheckoutPayment()`
  - `totalAmount` — numeric total cart amount calculated by `getCartTotal()`
  - `vatAmount` — numeric VAT amount derived from `totalAmount`
  - `finalAmount` — numeric final amount after coupon discount
  - `onNextStep` — function defined within component that calls `handleNextStep(payment.initiatePayment)`
- **Dönüş**: React element tree (JSX)

### [N2_NASIL] AST Pointer: src\views\CheckoutPage.tsx::onNextStep
- **params**: (none)
- **ic_degiskenler**:
  - `handleNextStep` — function from orchestrator
  - `payment` — payment object from `useCheckoutPayment()`
- **Dönüş**: void (triggers navigation to next step)

### [N3_NASIL] AST Pointer: src\views\CheckoutPage.tsx::useEffect callback
- **params**: (none)
- **ic_degiskenler**:
  - `authLoading` — boolean from `useAuth()`
  - `user` — user object from `useAuth()`
  - `router` — router instance from `useRouter()`
  - `Routes` — routes utility
- **Dönüş**: void (side‑effect: redirects to login if unauthenticated)

### [N4_NASIL] AST Pointer: src\views\CheckoutPage.tsx::address pick callback
- **params**: `a` (address object)
- **ic_degiskenler**:
  - `addressPickTarget` — string from orchestrator
  - `setShippingAddress` — function from orchestrator
  - `setBillingAddress` — function from orchestrator
  - `setShowAddressModal` — function from orchestrator
- **Dönüş**: void (updates address state and closes modal)

### [N5_NASIL] AST Pointer: src\views\CheckoutPage.tsx::async setShowInvoiceModal callback
- **params**: (none)
- **ic_degiskenler**:
  - `setShowInvoiceModal` — function from orchestrator
- **Dönüş**: void (opens invoice modal)

### [N6_NASIL] AST Pointer: src\views\CheckoutPage.tsx::empty auth check function
- **params**: (none)
- **ic_degiskenler**:
  - `authLoading` — boolean from `useAuth()`
  - `user` — user object from `useAuth()`
  - `router` — router instance from `useRouter()`
  - `Routes` — routes utility
- **Dönüş**: void (redirects to login if unauthenticated)

---

## NODE ID STANDARD

  file: src\views\CheckoutPage.tsx
  function: src\views\CheckoutPage.tsx::CheckoutPage
  function: src\views\CheckoutPage.tsx::onNextStep

---

## DISA AKTARILANLAR (EXPORTS)
  export: CheckoutPage