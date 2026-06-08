---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CheckoutPage.tsx
skeleton_hash: 07fc2c50879243fd
entity_hashes:
  func:CheckoutPage: d9bc38b15b781fcb
  func:handleAddressDelete: ec0b9e7a9db92cd8
  func:handleAddressSaved: 301e608092f98f4d
  func:onNextStep: 3e6b3d1f38e13467
  overview: 4fa2bd6a6e14fbb2
  style_tokens: 71bc3e57c5f9a6e4
generated_at: 2026-06-08T10:10:58Z
---

## Genel Bakış
VentHub HVAC uygulamasının sipariş tamamlama sürecini yöneten temel React bileşenidir. Kullanıcıdan müşteri ve teslimat bilgilerini toplamak, adres eklemek/silmek ve ödeme adımlarını kontrol etmek gibi süreçleri bir arada yönetir.

## Fonksiyon Grupları
### Ana Bileşen ve Süreç Koordinasyonu
Modülün temel yapısını ve genel sayfa akışını oluşturur. Tüm alt süreçleri, durum yönetimini ve kullanıcının satın alma deneyimini koordine eder.
- CheckoutPage

### Adres Yönetimi Operasyonları
Müşterinin teslimat adreslerinin eklenmesi ve silinmesi gibi temel CRUD işlemlerini yönetir. Adres verilerinin doğruluğunu ve akışını kontrol eder.
- handleAddressSaved, handleAddressDelete

### Adım İlerleme Kontrolü
Ödeme sürecinde bir sonraki aşamaya geçiş mantığını ve kullanıcının ilerlemesini doğrular. Adımlar arası geçiş kurallarını uygular.
- onNextStep

---

## AXIOMS – Mimari Varsayımlar

Bu modül, sipariş tamamlama sürecinde adım tabanlı bir akış ve adres yönetimi gerektirir. Aşağıda bu modülün doğru çalışması için gerekli mimari varsayımlar yer almaktadır.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/CheckoutPage.tsx`::CheckoutPage
- **params**: () — parametre almaz, React FC bileşeni olarak dışa açılır
- **ic_degiskenler**:
  - `items` — `useCart()` hook'unun döndürdüğü sepet öğeleri dizisi; sipariş özeti ve ödeme akışında kullanılır
  - `getCartTotal` — `useCart()` hook'undan gelen fonksiyon; sepetin toplam tutarını hesaplar, `totalAmount` ve kupon hesaplamalarında çağrılır
  - `clearCart` — `useCart()` hook'undan gelen fonksiyon; ödeme başarılı olduktan sonra sepeti temizler, `payment` hook'una aktarılır
  - `applyServerPricing` — `useCart()` hook'undan gelen fonksiyon; sunucu tarafı fiyatlandırma uygular, `payment` hook'una aktarılır
  - `user` — `useAuth()` hook'undan gelen mevcut kullanıcı nesnesi; auth kontrolünde ve `payment` hook'unda kullanılır
  - `authLoading` — `useAuth()` hook'undan `loading` alanının yeniden adlandırılmış hali; auth durumu yüklenirken `useEffect` içinde kontrol edilir
  - `router` — `useRouter()` hook'undan gelen Next.js router nesnesi; auth yönlendirmelerinde (`router.push`) ve geri butonunda kullanılır
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; tüm arayüz metinlerinin çevrilmesinde kullanılır
  - `lang` — `useI18n()` hook'undan gelen aktif dil kodu; `OrderSummarySidebar` bileşenine aktarılır
  - `editingAddress` — `useState<UserAddress | null>` state'i; adres formu modalında düzenlenecek adresi tutar, `null` ise yeni adres ekleme modu
  - `showAddressFormModal` — `useState<boolean>` state'i; adres formu modalının açık/kapalı durumunu kontrol eder
  - `orchestrator` — `useCheckoutOrchestrator()` hook'undan dönen checkout akış yöneticisi nesnesi; tüm checkout state'lerini ve adım geçişlerini merkezi olarak yönetir
  - `step` — orchestrator'dan gelen checkout adım numarası (1-4); hangi adımda olunduğunu belirler
  - `setStep` — orchestrator'dan gelen step state setter'ı; manuel adım değişiminde (geri butonu, düzenleme) kullanılır
  - `customerInfo` — orchestrator'dan gelen müşteri bilgileri nesnesi; `StepCustomerInfo` ve `ReviewSummary` bileşenlerine aktarılır
  - `setCustomerInfo` — orchestrator'dan gelen setter; müşteri bilgileri güncellendiğinde çağrılır
  - `shippingAddress` — orchestrator'dan gelen teslimat adresi nesnesi (`CheckoutAddressInfo`); address modal seçiminde ve `StepAddressInfo`'da kullanılır
  - `setShippingAddress` — orchestrator'dan gelen setter; teslimat adresi seçildiğinde veya güncellendiğinde çağrılır
  - `billingAddress` — orchestrator'dan gelen fatura adresi nesnesi; `StepAddressInfo` ve `ReviewSummary`'de kullanılır
  - `setBillingAddress` — orchestrator'dan gelen setter; fatura adresi seçildiğinde çağrılır
  - `invoiceType` — orchestrator'dan gelen fatura türü; bireysel/kurumsal fatura seçimini tutar
  - `setInvoiceType` — orchestrator'dan gelen setter; fatura türü değiştiğinde çağrılır
  - `invoiceInfo` — orchestrator'dan gelen fatura bilgileri nesnesi; fatura profil modalından seçilen değerleri tutar
  - `setInvoiceInfo` — orchestrator'dan gelen setter; fatura bilgileri güncellendiğinde çağrılır
  - `legalConsents` — orchestrator'dan gelen yasal onay durumları nesnesi; kvkk ve mesafeli satış sözleşmesi onaylarını tutar
  - `setLegalConsents` — orchestrator'dan gelen setter; yasal onaylar değiştiğinde çağrılır
  - `sameAsShipping` — orchestrator'dan gelen boolean flag; fatura adresinin teslimat adresiyle aynı olup olmadığını belirler
  - `setSameAsShipping` — orchestrator'dan gelen setter; checkbox değiştiğinde çağrılır
  - `shippingMethod` — orchestrator'dan gelen kargo yöntemi değeri; seçili kargo şirketini tutar
  - `setShippingMethod` — orchestrator'dan gelen setter; kargo yöntemi değiştiğinde çağrılır
  - `showHelp` — orchestrator'dan gelen boolean; ödeme adımında yardım panelinin görünürlüğünü kontrol eder
  - `setShowHelp` — orchestrator'dan gelen setter; yardım butonuna tıklandığında çağrılır
  - `savedAddresses` — orchestrator'dan gelen kayıtlı adresler dizisi; `AddressSelectModal` ve `StepAddressInfo`'ya aktarılır
  - `showAddressModal` — orchestrator'dan gelen boolean; adres seçim modalının açık/kapalı durumunu tutar
  - `setShowAddressModal` — orchestrator'dan gelen setter; modal açılıp kapatılırken çağrılır
  - `addressPickTarget` — orchestrator'dan gelen `'shipping' | 'billing'` değeri; adres seçiminin hangi amaçla yapıldığını belirler
  - `setAddressPickTarget` — orchestrator'dan gelen setter; modal açılmadan önce hedef belirlenirken çağrılır
  - `savedInvoiceProfiles` — orchestrator'dan gelen kayıtlı fatura profilleri dizisi; `InvoiceProfileModal`'a aktarılır
  - `showInvoiceModal` — orchestrator'dan gelen boolean; fatura profil modalının görünürlüğünü kontrol eder
  - `setShowInvoiceModal` — orchestrator'dan gelen setter; fatura modalı açılıp kapatılırken çağrılır
  - `handleSelectInvoiceProfile` — orchestrator'dan gelen callback; fatura profil seçildiğinde çağrılır
  - `handleNextStep` — orchestrator'dan gelen fonksiyon; bir sonraki adıma geçişi yönetir, `payment.initiatePayment` callback'ini argument olarak alır
  - `handleAddressSaved` — fonksiyon gövdesinde tanımlanan async callback; adres kaydedildikten sonra listeyi yeniler
  - `handleAddressDelete` — fonksiyon gövdesinde tanımlanan async callback; adres silme işlemini yönetir
  - `couponCode` — `useCheckoutCoupon()` hook'undan gelen kupon kodu string'i; input alanına bağlanır
  - `setCouponCode` — `useCheckoutCoupon()` hook'undan gelen setter; input değişiminde çağrılır
  - `couponApplied` — `useCheckoutCoupon()` hook'undan gelen uygulanan kupon nesnesi veya `null`; indirim hesaplamasında ve sipariş özeti bileşeninde kullanılır
  - `applyCoupon` — `useCheckoutCoupon()` hook'undan gelen callback; kupon uygulama butonuna bağlanır
  - `removeCoupon` — `useCheckoutCoupon()` hook'undan gelen callback; kupon kaldırma butonuna bağlanır
  - `payment` — `useCheckoutPayment()` hook'undan dönen ödeme nesnesi; `iyzToken`, `paymentFrameContent`, `loading`, `progressPct`, `formReady`, `initiatePayment` alanlarını içerir
  - `totalAmount` — `getCartTotal()` çağrısının sonucu; KDV öncesi toplam tutarı temsil eder, `OrderSummarySidebar`'a ve `vatAmount`/`finalAmount` hesaplamalarına aktarılır
  - `vatAmount` — `totalAmount`'dan hesaplanan KDV tutarı; `(totalAmount - totalAmount / 1.2).toFixed(2)` ile hesaplanır, `Number` ile parse edilir
  - `finalAmount` — kupon indirimi uygulanmış nihai tutar; `(totalAmount - (couponApplied?.discount || 0)).toFixed(2)` ile hesaplanır
- **Dönüş**: JSX — boş sepet durumunda basit mesaj + alışverişe dönüş linki, aksi halde checkout akışının tam JSX yapısı (adım bileşenleri, modallar, sidebar)

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