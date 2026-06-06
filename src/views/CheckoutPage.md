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
  overview: f3dca71a885b6cf6
  style_tokens: 71bc3e57c5f9a6e4
generated_at: 2026-06-06T08:46:13Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının sipariş tamamlama sürecini yöneten temel React bileşenini barındırır. Kullanıcıdan müşteri ve teslimat bilgilerini toplamak, adres eklemek/silmek ve ödeme adımlarını kontrol etmek gibi süreçleri bir arada yönetir.

## Fonksiyon Grupları
### Ana Bileşen ve Durum Yönetimi
Modülün temel yapısını ve genel sayfa akışını oluşturur. Tüm alt süreçleri ve durum yönetimini koordine eder.
- CheckoutPage

### Adres Operasyonları
Müşterinin teslimat adreslerini kaydetme ve silme gibi CRUD işlemlerini yönetir.
- handleAddressSaved, handleAddressDelete

### Süreç Geçiş Kontrolü
Ödeme sürecindeki bir sonraki adıma geçiş mantığını ve ilerlemeyi kontrol eder.
- onNextStep

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel mimari varsayımlar, fonksiyon imzalarındaki parametre gereksinimlerine dayanır.

[Aksiyom 1]: Eğer `handleAddressDelete` fonksiyonuna geçerli bir `string` türünde `id` parametresi verilmezse, adres silme işlemi gerçekleştirilemez.

---

**Not:** Modülde sabit (constant) tanımlı değildir ve fonksiyon imzalarında dönüş tipleri belirtilmemiştir. Bu nedenle eşik değerleri, varsayılan akış varsayımları veya durum yönetimi ile ilgili ek aksiyomlar yalnızca fonksiyon gövdelerinden çıkarılamamıştır.

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
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `items` — useCart hook'undan gelen sepet ürünleri listesi
  - `getCartTotal` — sepet toplam tutarını hesaplayan fonksiyon
  - `clearCart` — sepeti tamamen temizleyen fonksiyon
  - `applyServerPricing` — sunucu tarafı fiyat uygulamasını tetikleyen fonksiyon
  - `user` — useAuth hook'undan gelen oturum açmış kullanıcı nesnesi
  - `authLoading` — useAuth'tan gelen `loading` alias'ı, kimlik doğrulama yükleniyor durumu
  - `router` — Next.js useRouter navigasyon nesnesi
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `lang` — useI18n hook'undan gelen aktif dil kodu
  - `editingAddress` — useState ile yönetilen, düzenlenen adres nesnesi (UserAddress | null)
  - `showAddressFormModal` — useState ile yönetilen, adres form modalının açık/kapalı durumu
  - `orchestrator` — useCheckoutOrchestrator hook'undan dönen checkout süreç yöneticisi nesnesi
  - `step` — orchestrator'dan gelen mevcut checkout adımı numarası (1-4)
  - `setStep` — orchestrator'dan gelen checkout adımını değiştiren setter
  - `customerInfo` — orchestrator'dan gelen müşteri bilgileri nesnesi
  - `setCustomerInfo` — orchestrator'dan gelen müşteri bilgilerini güncelleyen setter
  - `shippingAddress` — orchestrator'dan gelen kargo adresi bilgisi
  - `setShippingAddress` — orchestrator'dan gelen kargo adresini güncelleyen setter
  - `billingAddress` — orchestrator'dan gelen fatura adresi bilgisi
  - `setBillingAddress` — orchestrator'dan gelen fatura adresini güncelleyen setter
  - `invoiceType` — orchestrator'dan gelen fatura türü (bireysel/kurumsal)
  - `setInvoiceType` — orchestrator'dan gelen fatura türünü güncelleyen setter
  - `invoiceInfo` — orchestrator'dan gelen fatura detay bilgileri nesnesi
  - `setInvoiceInfo` — orchestrator'dan gelen fatura detaylarını güncelleyen setter
  - `legalConsents` — orchestrator'dan gelen yasal onay/rıza durumları
  - `setLegalConsents` — orchestrator'dan gelen yasal onayları güncelleyen setter
  - `sameAsShipping` — orchestrator'dan gelen, fatura adresinin kargo adresiyle aynı olup olmadığı bayrağı
  - `setSameAsShipping` — orchestrator'dan gelen sameAsShipping setter'ı
  - `shippingMethod` — orchestrator'dan gelen seçili kargo yöntemi
  - `setShippingMethod` — orchestrator'dan gelen kargo yöntemini güncelleyen setter
  - `showHelp` — orchestrator'dan gelen yardım paneli görünürlük durumu
  - `setShowHelp` — orchestrator'dan gelen yardım paneli görünürlük setter'ı
  - `savedAddresses` — orchestrator'dan gelen kullanıcının kayıtlı adresleri listesi
  - `showAddressModal` — orchestrator'dan gelen adres seçim modalının görünürlük durumu
  - `setShowAddressModal` — orchestrator'dan gelen adres modal görünürlük setter'ı
  - `addressPickTarget` — orchestrator'dan gelen, adres seçim hedefi ('shipping' veya 'billing')
  - `setAddressPickTarget` — orchestrator'dan gelen adres hedefini güncelleyen setter
  - `savedInvoiceProfiles` — orchestrator'dan gelen kayıtlı fatura profilleri listesi
  - `showInvoiceModal` — orchestrator'dan gelen fatura profil modalının görünürlük durumu
  - `setShowInvoiceModal` — orchestrator'dan gelen fatura modal görünürlük setter'ı
  - `handleSelectInvoiceProfile` — orchestrator'dan gelen fatura profili seçimi işleyici fonksiyonu
  - `handleNextStep` — orchestrator'dan gelen sonraki adıma geçiş işleyici fonksiyonu
  - `couponCode` — useCheckoutCoupon hook'undan gelen girilmiş kupon kodu
  - `setCouponCode` — useCheckoutCoupon hook'undan gelen kupon kodu setter'ı
  - `couponApplied` — useCheckoutCoupon hook'undan gelen başarılı şekilde uygulanmış kupon bilgisi
  - `applyCoupon` — useCheckoutCoupon hook'undan gelen kuponu sunucuya gönderen fonksiyon
  - `removeCoupon` — useCheckoutCoupon hook'undan gelen uygulanmış kuponu kaldıran fonksiyon
  - `payment` — useCheckoutPayment hook'undan dönen ödeme nesnesi (iyzToken, paymentFrameContent, initiatePayment, loading, formReady, progressPct içerir)
  - `totalAmount` — getCartTotal() çağrısı ile hesaplanan kdv dahil toplam tutar
  - `vatAmount` — `Number((totalAmount - totalAmount / 1.2).toFixed(2))` ile hesaplanan kdv tutarı
  - `finalAmount` — `Number((totalAmount - (couponApplied?.discount || 0)).toFixed(2))` ile hesaplanan kupon indirimi sonrası nihai tutar
- **Dönüş**: JSX element (React.FC)

---

### [N2_NASIL] AST Pointer: CheckoutPage.tsx::handleAddressSaved
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `refreshed` — listAddresses() async çağrısından dönen yenilenmiş adres listesi
- **Dönüş**: Promise<void> (implicit)

---

### [N3_NASIL] AST Pointer: CheckoutPage.tsx::handleAddressDelete
- **params**: `id: string` — silinecek kayıtlı adresin benzersiz tanımlayıcısı
- **ic_degiskenler**:
  - `refreshed` — listAddresses() async çağrısı ile silme sonrası yenilenen adres listesi
- **Dönüş**: Promise<void> (implicit)

---

### [N4_NASIL] AST Pointer: CheckoutPage.tsx::onNextStep
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (handleNextStep sonucunu döndürür, payment.initiatePayment callback'ini argüman olarak iletir)

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