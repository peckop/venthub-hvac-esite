---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CheckoutPage.tsx
skeleton_hash: c6b3de86c015dae5
entity_hashes:
  func:CheckoutPage: d9bc38b15b781fcb
  func:onNextStep: 3e6b3d1f38e13467
  overview: 25c3342e4a7897fc
  style_tokens: 71bc3e57c5f9a6e4
generated_at: 2026-05-28T22:40:38Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının sipariş tamamlama ekranını yöneten ana React bileşenini içerir. Kullanıcıdan müşteri ve teslimat bilgilerini toplarken, ödeme sürecinin adım adım ilerlemesini kontrol eden bir yapıya sahiptir.

## Fonksiyon Grupları
### Ana Bileşen
Modülün temel yapısını oluşturur ve ödeme sayfasının tüm kullanıcı arayüzü bileşenlerini bir araya getirir.
- CheckoutPage

### Süreç Geçiş Yönetimi
Ödeme sürecindeki bir sonraki adıma geçiş işlemlerini tetikler; ana bileşen içinde çağrılarak adım ilerlemesini sağlar.
- onNextStep

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel React bileşeni ve süreç geçiş varsayımları tanımlanmıştır.

[Aksiyom

---

## FONKSİYON DETAYLARI

### CheckoutPage

**Ne yapar**: CheckoutPage, kullanıcıların satın alma işlemlerini tamamlayabilecekleri ana sayfa bileşenidir. Sepet özeti, teslimat bilgileri, ödeme seçenekleri ve sipariş onaylama adımlarını içeren çok aşamalı bir satın alma akışını yönetir.

**Nasıl yapar**: React functional component (React.FC) yapısıyla oluşturulmuştur. Checkout aşamalarını (step) state ile takip eder ve kullanıcı ilerledikçe bir sonraki aşama bileşenlerini render eder. Form validasyonları, adım geçiş mantığı ve sipariş tamamlama süreçlerini içsal state yönetimi ile kontrol eder.

**Parametreler**:
- Bu fonksiyon Props almamaktadır (React.FC olarak tanımlıdır, dışarıdan parametre beklenmemektedir)

**Dönüş**: `React.JSX.Element` — Checkout sayfasının tamamını oluşturan React JSX bileşeni döndürür

### onNextStep
**Ne yapar**: onNextStep, CheckoutPage bileşeninde kullanılan ve ödeme akışındaki adım ilerletme işlemini gerçekleştiren fonksiyondur. Mevcut ödeme adımından bir sonrakine geçişi tetiklemek üzere tasarlanmıştır. Ödeme akışının düzenli ve sıralı bir şekilde ilerlemesini sağlamak için kullanılır.
**Nasıl yapar**: Verilen belgelere göre iç işleyiş detayları (adım doğrulaması, durum güncellemesi gibi) belirtilmemiştir. Dönüş tipinin void veya bilinmiyor olduğu bilgisi mevcuttur.
**Parametreler**:
- Verilen bilgide herhangi bir parametre tanımlanmamıştır.
**Dönüş**: void veya bilinmiyor — Herhangi bir değer döndürmez veya dönüş tipi açıkça belirtilmemiştir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/CheckoutPage.tsx`::CheckoutPage
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `items` — `useCart()` hook'undan destructure, sepet öğeleri dizisi
  - `getCartTotal` — `useCart()` hook'undan destructure, sepet toplam tutarını hesaplayan fonksiyon
  - `clearCart` — `useCart()` hook'undan destructure, sepeti tamamen temizler
  - `applyServerPricing` — `useCart()` hook'undan destructure, sunucu tarafı fiyatlandırma uygular
  - `user` — `useAuth()` hook'undan destructure, mevcut kimlik doğrulanmış kullanıcı nesnesi
  - `authLoading` — `useAuth()` hook'undan destructure (`loading` yeniden adlandırılmış), kimlik doğrulama yüklenme durumu
  - `router` — `useRouter()` çağrısından, Next.js programlı yönlendirme nesnesi
  - `t` — `useI18n()` hook'undan destructure, çeviri fonksiyonu
  - `lang` — `useI18n()` hook'undan destructure, mevcut dil kodu
  - `orchestrator` — `useCheckoutOrchestrator()` çağrısından, checkout akışını merkezi olarak yöneten orkestratör nesnesi
  - `step` — `orchestrator`'dan destructure, mevcut checkout adım numarası (1-4)
  - `setStep` — `orchestrator`'dan destructure, checkout adımını değiştiren setter
  - `customerInfo` — `orchestrator`'dan destructure, müşteri bilgileri nesnesi
  - `setCustomerInfo` — `orchestrator`'dan destructure, müşteri bilgilerini güncelleyen setter
  - `shippingAddress` — `orchestrator`'dan destructure, teslimat adresi nesnesi
  - `setShippingAddress` — `orchestrator`'dan destructure, teslimat adresini güncelleyen setter
  - `billingAddress` — `orchestrator`'dan destructure, fatura adresi nesnesi
  - `setBillingAddress` — `orchestrator`'dan destructure, fatura adresini güncelleyen setter
  - `invoiceType` — `orchestrator`'dan destructure, fatura türü (bireysel/kurumsal)
  - `setInvoiceType` — `orchestrator`'dan destructure, fatura türünü güncelleyen setter
  - `invoiceInfo` — `orchestrator`'dan destructure, fatura detay bilgileri nesnesi
  - `setInvoiceInfo` — `orchestrator`'dan destructure, fatura bilgilerini güncelleyen setter
  - `legalConsents` — `orchestrator`'dan destructure, yasal onay/kabul durumları nesnesi
  - `setLegalConsents` — `orchestrator`'dan destructure, yasal onayları güncelleyen setter
  - `sameAsShipping` — `orchestrator`'dan destructure, fatura adresinin teslimat adresiyle aynı olup olmadığı boolean
  - `setSameAsShipping` — `orchestrator`'dan destructure, sameAsShipping durumunu güncelleyen setter
  - `shippingMethod` — `orchestrator`'dan destructure, seçili kargo yöntemi
  - `setShippingMethod` — `orchestrator`'dan destructure, kargo yöntemini güncelleyen setter
  - `showHelp` — `orchestrator`'dan destructure, yardım panelinin açık olup olmadığı boolean
  - `setShowHelp` — `orchestrator`'dan destructure, showHelp durumunu güncelleyen setter
  - `savedAddresses` — `orchestrator`'dan destructure, kullanıcının kayıtlı adresleri dizisi
  - `showAddressModal` — `orchestrator`'dan destructure, adres seçim modali görünürlük boolean'ı
  - `setShowAddressModal` — `orchestrator`'dan destructure, adres modal görünürlüğünü güncelleyen setter
  - `addressPickTarget` — `orchestrator`'dan destructure, adres seçiminin hedefi ('shipping' veya 'billing')
  - `setAddressPickTarget` — `orchestrator`'dan destructure, addressPickTarget değerini güncelleyen setter
  - `savedInvoiceProfiles` — `orchestrator`'dan destructure, kullanıcının kayıtlı fatura profilleri dizisi
  - `showInvoiceModal` — `orchestrator`'dan destructure, fatura profili modali görünürlük boolean'ı
  - `setShowInvoiceModal` — `orchestrator`'dan destructure, fatura modal görünürlüğünü güncelleyen setter
  - `handleSelectInvoiceProfile` — `orchestrator`'dan destructure, fatura profili seçimi işleyicisi
  - `handleNextStep` — `orchestrator`'dan destructure, sonraki adıma geçiş işleyicisi (payment.initiatePayment callback bekler)
  - `couponCode` — `useCheckoutCoupon(getCartTotal())` hook'undan destructure, girilmiş kupon kodu string
  - `setCouponCode` — `useCheckoutCoupon` hook'undan destructure, kupon kodunu güncelleyen setter
  - `couponApplied` — `useCheckoutCoupon` hook'undan destructure, uygulanmış kupon bilgisi (kod, indirim miktarı) veya null
  - `applyCoupon` — `useCheckoutCoupon` hook'undan destructure, kupon uygulama fonksiyonu
  - `removeCoupon` — `useCheckoutCoupon` hook'undan destructure, kuponu kaldırma fonksiyonu
  - `payment` — `useCheckoutPayment({...})` hook'undan, ödeme sürecinizi yöneten nesne (iyzToken, paymentFrameContent, loading, progressPct, formReady, initiatePayment içerir)
  - `onNextStep` — yerel arrow fonksiyon, `handleNextStep(payment.initiatePayment)` çağırarak bir sonraki adıma geçer
  - `totalAmount` — `getCartTotal()` çağırılarak hesaplanan sepet toplam tutarı number
  - `vatAmount` — `totalAmount`'dan KDV dahil fiyat farkından hesaplanan KDV tutarı number
  - `finalAmount` — `totalAmount`'dan `couponApplied?.discount` çıkarılarak hesaplanan nihai ödenecek tutar number
- **Dönüş**: JSX (React element) — boş sepet durumunda boş sepet mesaj JSX'i, dolu sepet durumunda checkout form JSX'i

---

### [N2_NASIL] AST Pointer: `src/views/CheckoutPage.tsx`::onNextStep
- **params**: () — parametre yok
- **ic_degiskenler**: (yok — doğrudan `handleNextStep(payment.initiatePayment)` çağırır)
- **Dönüş**: void — `handleNextStep`'e `payment.initiatePayment` callback'ini passed ederek bir sonraki adıma geçiş tetikler

---

### [N3_NASIL] AST Pointer: `src/views/CheckoutPage.tsx`::useEffect_authCheck_callback
- **params**: () — parametre yok (useEffect callback)
- **ic_degiskenler**: (yok — koşul kontrolü ve `router.push` çağrısı yapıyor, yerel değişken yok)
- **Dönüş**: void — `authLoading` false ve `user` null ise `Routes.auth.login('/checkout')` yoluna yönlendirme yapar (yan etki: login sayfasına redirect)

---

### [N4_NASIL] AST Pointer: `src/views/CheckoutPage.tsx`::onPick_callback
- **params**: `(a)` — seçilen kayıtlı adres nesnesi (savedAddress objesi, `address_line`, `city`, `district`, `postal_code`, `full_name`, `phone` alanları beklenir)
- **ic_degiskenler**:
  - `addr` — `CheckoutAddressInfo` tipinde normalize edilmiş adres nesnesi; `a` parametresinin alanlarından `|| ''` fallback ile türetilir (`full_address`, `city`, `district`, `postalCode`, `full_name`, `phone` alanlarını içerir)
- **Dönüş**: void — `addressPickTarget` 'shipping' ise `setShippingAddress(addr)`, değilse `setBillingAddress(addr)` çağırarak adresi ilgili state'e yazar, ardından `setShowAddressModal(false)` ile modalı kapatır

---

### [N5_NASIL] AST Pointer: `src/views/CheckoutPage.tsx`::onOpenInvoiceModal_callback
- **params**: () — parametre yok (async arrow fonksiyon)
- **ic_degiskenler**: (yok — doğrudan setter çağrısı yapıyor)
- **Dönüş**: Promise\<void\> — `setShowInvoiceModal(true)` çağırarak fatura profili seçici modalını açar

---

## NODE ID STANDARD

  file: src\views\CheckoutPage.tsx
  function: src\views\CheckoutPage.tsx::CheckoutPage
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