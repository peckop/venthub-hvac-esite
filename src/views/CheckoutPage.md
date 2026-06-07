---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CheckoutPage.tsx
skeleton_hash: b19bede53752fd38
entity_hashes:
  func:CheckoutPage: d9bc38b15b781fcb
  func:handleAddressDelete: ec0b9e7a9db92cd8
  func:handleAddressSaved: 301e608092f98f4d
  func:onNextStep: 3e6b3d1f38e13467
  overview: 0980ab7c30b476fc
  style_tokens: 71bc3e57c5f9a6e4
generated_at: 2026-06-07T12:11:26Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının sipariş tamamlama sürecini yöneten temel React bileşenini barındırır. Kullanıcıdan müşteri ve teslimat bilgilerini toplamak, adres eklemek/silmek ve ödeme adımlarını kontrol etmek gibi süreçleri bir arada yönetir.

## Fonksiyon Grupları
### Ana Bileşen ve Süreç Koordinasyonu
Modülün temel yapısını ve genel sayfa akışını oluşturur. Tüm alt süreçleri, durum Yönetimini ve kullanıcının satın alma deneyimini koordine eder.
- CheckoutPage

### Adres Yönetimi Operasyonları
Müşterinin teslimat adreslerinin eklenmesi ve silinmesi gibi temel CRUD işlemlerini yönetir. Adres verilerinin doğruluğunu ve akışını kontrol eder.
- handleAddressSaved, handleAddressDelete

### Adım İlerleme Kontrolü
Ödeme sürecinde bir sonraki aşamaya geçiş mantığını ve kullanıcının ilerlemesini doğrular. Adımlar arası geçiş kurallarını uygular.
- onNextStep

---

## AXIOMS – Mimari Varsayımlar

Bu modül, sipariş tamamlama sürecini yöneten bir React bileşeni olup, temel olarak durum yönetimi, adres CRUD işlemleri ve adım navigasyonunu kapsar. Modülün doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer CheckoutPage bileşeninin kullandığı durum yönetimi (state) veya bağlam (context) sağlayıcıları (örn: sipariş verisi, kullanıcı oturumu) render edildiği üst bileşen tarafından sağlanmıyorsa, bileşen beklenmedik hatalarla karşılaşır veya hiç render olmaz.

[Aksiyom 2]: Eğer handleAddressSaved fonksiyonu, geçerli bir adres nesnesi (örn: gerekli alanları içeren) ile çağrılmıyorsa, adres kaydetme işlemi başarısız olur veya uygulama tutarsız bir duruma girer.

[Aksiyom 3]: Eğer handleAddressDelete(id: string) fonksiyonu, var olmayan veya geçersiz bir `id` parametresi ile çağrılırsa, silme işlemi hedeflenen adresi bulamaz ve sessizce başarısız olur veya bir hata fırlatır.

[Aksiyom 4]: Eğer onNextStep fonksiyonu çağrıldığında, mevcut adımın tamamlanması için zorunlu alanlar (örn: teslimat adresi) doldurulmamışsa, adım geçişi engellenir ve kullanıcı bilgilendirilmezse süreç ilerlemez.

[Aksiyom 5]: Eğer modül, iç işleyişi için外部 bir API servisine (örn: ödeme doğrulama, adres kaydetme) bağımlıysa ve bu servislerde kesinti veya hata oluşursa, ilgili kullanıcı işlemleri (adres kaydetme, adım geçme) tamamlanamaz.

[Aksiyom 6]: Eğer CheckoutPage bileşeni, alt bileşenlere (örn: adres formu, ödeme formu) prop olarak geçilen callback fonksiyonları (handleAddressSaved, onNextStep vb.) sağlamıyorsa, bu alt bileşenler kendi içlerindeki olayları yukarı taşıyamaz ve süreç durur.

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

### [N1_NASIL] AST Pointer: CheckoutPage.tsx::CheckoutPage
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — useCart'tan gelen sepet öğeleri listesi, sepet boşluk kontrolünde ve bileşenlere prop olarak kullanılır
  - `getCartTotal` — useCart'tan gelen sepet toplam tutarını hesaplayan fonksiyon, useCheckoutCoupon'a ve tutar hesaplamalarına geçirilir
  - `clearCart` — useCart'tan gelen sepeti temizleme fonksiyonu, useCheckoutPayment'a geçirilir
  - `applyServerPricing` — useCart'tan gelen sunucu tabanlı fiyatlandırma uygulama fonksiyonu, useCheckoutPayment'a geçirilir
  - `user` — useAuth'tan gelen mevcut kullanıcı nesnesi, auth kontrolünde ve useCheckoutPayment'ta kullanılır
  - `authLoading` — useAuth'tan gelen kimlik doğrulama yükleme durumu flag'i, useEffect'te auth kontrolü için kullanılır
  - `router` — next/navigation'dan gelen yönlendirici nesne, auth yönlendirmesi ve buton navigasyonları için kullanılır
  - `t` — useI18n'dan gelen çeviri fonksiyonu, tüm bileşenlere ve UI metinlerine geçirilir
  - `lang` — useI18n'dan gelen aktif dil kodu string'i, OrderSummarySidebar'a geçirilir
  - `editingAddress` — useState ile tutulan düzenlenecek adres nesnesi (UserAddress | null), AddressFormModal'a prop olarak geçer
  - `setEditingAddress` — editingAddress state setter'ı, adres düzenleme ve ekleme akışlarında çağrılır
  - `showAddressFormModal` — useState ile tutulan adres formu modalının açık/kapalı durumu boolean'ı
  - `setShowAddressFormModal` — showAddressFormModal state setter'ı, modal açma/kapama işlemlerinde kullanılır
  - `orchestrator` — useCheckoutOrchestrator hook'undan dönen süreç yöneticisi nesnesi, tüm checkout state'lerini ve handler'ları barındırır
  - `step` — orchestrator'dan gelen mevcut checkout adım numarası (1-4), koşullu render ve navigasyon mantığını kontrol eder
  - `setStep` — orchestrator'dan gelen step state setter'ı, geri gitme ve adım değiştirme butonlarında kullanılır
  - `customerInfo` — orchestrator'dan gelen müşteri bilgileri nesnesi, StepCustomerInfo ve ReviewSummary'a prop olarak geçer
  - `setCustomerInfo` — orchestrator'dan gelen müşteri bilgileri setter'ı, StepCustomerInfo'ya prop olarak geçer
  - `shippingAddress` — orchestrator'dan gelen teslimat adresi nesnesi (CheckoutAddressInfo), StepAddressInfo/ReviewSummary'a geçer ve adres seçiminde kullanılır
  - `setShippingAddress` — orchestrator'dan gelen teslimat adresi setter'ı, adres seçim callback'inde ve StepAddressInfo'da kullanılır
  - `billingAddress` — orchestrator'dan gelen fatura adresi nesnesi (CheckoutAddressInfo), StepAddressInfo/ReviewSummary'a geçer
  - `setBillingAddress` — orchestrator'dan gelen fatura adresi setter'ı, adres seçim callback'inde ve StepAddressInfo'da kullanılır
  - `invoiceType` — orchestrator'dan gelen fatura türü değeri, StepAddressInfo ve ReviewSummary'a prop olarak geçer
  - `setInvoiceType` — orchestrator'dan gelen fatura türü setter'ı, StepAddressInfo'ya prop olarak geçer
  - `invoiceInfo` — orchestrator'dan gelen fatura bilgileri nesnesi, StepAddressInfo ve ReviewSummary'a prop olarak geçer
  - `setInvoiceInfo` — orchestrator'dan gelen fatura bilgileri setter'ı, StepAddressInfo'ya prop olarak geçer
  - `legalConsents` — orchestrator'dan gelen yasal onay durumları nesnesi, StepAddressInfo'ya prop olarak geçer
  - `setLegalConsents` — orchestrator'dan gelen yasal onay setter'ı, StepAddressInfo'ya prop olarak geçer
  - `sameAsShipping` — orchestrator'dan gelen boolean flag, fatura adresinin teslimat adresiyle aynı olup olmadığını belirtir
  - `setSameAsShipping` — orchestrator'dan gelen sameAsShipping setter'ı, StepAddressInfo'ya prop olarak geçer
  - `shippingMethod` — orchestrator'dan gelen kargo yöntemi değeri, StepAddressInfo'ya prop olarak geçer
  - `setShippingMethod` — orchestrator'dan gelen kargo yöntemi setter'ı, StepAddressInfo'ya prop olarak geçer
  - `showHelp` — orchestrator'dan gelen yardım paneli görünürlük boolean'ı, PaymentIframeContainer'a prop olarak geçer
  - `setShowHelp` — orchestrator'dan gelen showHelp setter'ı, PaymentIframeContainer'a prop olarak geçer
  - `savedAddresses` — orchestrator'dan gelen kayıtlı adresler listesi, AddressSelectModal ve StepAddressInfo'a prop olarak geçer
  - `showAddressModal` — orchestrator'dan gelen adres seçimi modalının açık/kapalı boolean'ı, koşullu render'da kontrol edilir
  - `setShowAddressModal` — orchestrator'dan gelen showAddressModal setter'ı, modal açma/kapama işlemlerinde kullanılır
  - `addressPickTarget` — orchestrator'dan gelen adres seçiminin hedef belirteci (shipping/billing), onPick callback'inde hangi adresin set edileceğini belirler
  - `setAddressPickTarget` — orchestrator'dan gelen addressPickTarget setter'ı, onOpenAddressModal callback'inde çağrılır
  - `savedInvoiceProfiles` — orchestrator'dan gelen kayıtlı fatura profilleri listesi, InvoiceProfileModal'a prop olarak geçer
  - `showInvoiceModal` — orchestrator'dan gelen fatura profili modalının açık/kapalı boolean'ı, koşullu render'da kontrol edilir
  - `setShowInvoiceModal` — orchestrator'dan gelen showInvoiceModal setter'ı, modal açma/kapama işlemlerinde kullanılır
  - `handleSelectInvoiceProfile` — orchestrator'dan gelen fatura profili seçim handler fonksiyonu, InvoiceProfileModal'a prop olarak geçer
  - `handleNextStep` — orchestrator'dan gelen bir sonraki adıma geçiş handler fonksiyonu, onNextStep tanımında kullanılır
  - `couponCode` — useCheckoutCoupon'dan gelen kupon kodu string'i, OrderSummarySidebar'a prop olarak geçer
  - `setCouponCode` — useCheckoutCoupon'dan gelen kupon kodu setter'ı, OrderSummarySidebar'a prop olarak geçer
  - `couponApplied` — useCheckoutCoupon'dan gelen uygulanan kupon bilgisi nesnesi, indirim hesaplamasında ve bileşenlere prop olarak kullanılır
  - `applyCoupon` — useCheckoutCoupon'dan gelen kupon uygulama fonksiyonu, OrderSummarySidebar'a prop olarak geçer
  - `removeCoupon` — useCheckoutCoupon'dan gelen kupon kaldırma fonksiyonu, OrderSummarySidebar'a prop olarak geçer
  - `payment` — useCheckoutPayment hook'undan dönen ödeme nesnesi, iyzToken/paymentFrameContent/loading/progressPct/formReady/initiatePayment alanlarını içerir
  - `onNextStep` — handleNextStep'i payment.initiatePayment argümanıyla sarmalayan local arrow fonksiyon, ilerleme butonunun onClick handler'ı olarak kullanılır
  - `totalAmount` — getCartTotal() çağrı sonucu, sepet toplam tutarı number değeri; VAT ve finalAmount hesaplamalarında ve OrderSummarySidebar'a geçer
  - `vatAmount` — totalAmount üzerinden hesaplanan KDV tutarı number değeri (totalAmount - totalAmount/1.2), OrderSummarySidebar'a prop olarak geçer
  - `finalAmount` — kupon indirimi sonrası nihai tutar number değeri (totalAmount - couponApplied.discount), OrderSummarySidebar'a prop olarak geçer
- **Dönüş**: React JSX — CheckoutPage ana bileşeninin render ettiği full sayfa JSX'i (boş sepet uyarısı veya 4 adımlı checkout akışı)

### [N2_NASIL] AST Pointer: CheckoutPage.tsx::handleAddressSaved
- **params**: (yok)
- **ic_degiskenler**:
  - `refreshed` — listAddresses(supabaseBrowserClient) asenkron çağrısının sonucu, güncellenmiş adres listesi; orchestrator.setSavedAddresses'e geçirilerek state güncellenir
- **Dönüş**: yok (async void) — yan etki olarak orchestrator'daki savedAddresses state'ini yeniler

### [N3_NASIL] AST Pointer: CheckoutPage.tsx::handleAddressDelete
- **params**: `id: string` — silinecek kayıtlı adresin benzersiz tanımlayıcı string'i
- **ic_degiskenler**:
  - `refreshed` — listAddresses(supabaseBrowserClient) asenkron çağrısının sonucu, silme sonrası güncellenmiş adres listesi; orchestrator.setSavedAddresses'e geçirilerek state güncellenir
- **Dönüş**: yok (async void) — yan etki olarak window.confirm ile onay alır, deleteAddress ile siler, toast bildirimi gösterir ve savedAddresses state'ini yeniler

### [N4_NASIL] AST Pointer: CheckoutPage.tsx::onNextStep
- **params**: (yok)
- **ic_degiskenler**: (yok — basit sarmalayıcı fonksiyon)
- **Dönüş**: yok (void) — handleNextStep'i payment.initiatePayment fonksiyonu argümanıyla çağırarak checkout adım ilerlemesini ve ödeme başlatma sürecini tetikler

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