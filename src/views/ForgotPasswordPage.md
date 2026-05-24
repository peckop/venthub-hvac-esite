---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ForgotPasswordPage.tsx
skeleton_hash: 28f5aaf598269af6
generated_at: 2026-05-23T22:40:57Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun şifremi unuttum sayfasını oluşturan React tabanlı ön yüz bileşenini barındırır. Kullanıcıların şifre sıfırlama talebi oluşturabileceği bir form arayüzünü sunar ve sayfadaki tüm kullanıcı etkileşimlerini yönetir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Şifremi unuttum sayfasının tüm arayüz yapısını, temel durumlarını ve bileşen ömrünü yönetir, platformdaki ilgili rotada çağrılarak kullanıcıya sunulur.
- ForgotPasswordPage

### Form Gönderim Yöneticisi
Kullanıcının şifre sıfırlama formunu göndermesi sonrası çalışan asenkron işlemleri yürütür, form gönderim olayını yakalayıp şifre sıfırlama talebinin doğru şekilde işlenmesini sağlar.
- handleSubmit

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı şifremi unuttum sayfası modülünün sorunsuz şekilde çalışması, React runtime ortamının, form olay yönetimi altyapısının, şifre sıfırlama taleplerini işleyen arka plan servisinin ve uygulama içi yönlendirme sisteminin tam olarak entegre olmasına bağlıdır.

[Aksiyom 1]: Eğer React.FormEvent tipini tanımlayan tüm React bağımlılıkları projeye yüklü değilse, handleSubmit fonksiyonu form gönderim olaylarını işleyemez, bileşen hiçbir şekilde derlenemez.
[Aksiyom 2]: Eğer bu React bileşeninin monte edileceği geçerli bir DOM node'u uygulama tarafından sağlanmıyorsa, ForgotPasswordPage kullanıcılara hiçbir şekilde gösterilemez, şifre sıfırlama iş akışı başlatılamaz.
[Aksiyom 3]: Eğer handleSubmit fonksiyonu içerisinde çağrılan şifre sıfırlama API uç noktası erişilebilir değilse, kullanıcıların gönderdiği şifre sıfırlama talepleri işlenemez, kullanıcıya başarısızlık durumuna ait geri dönüş sağlanamaz.
[Aksiyom 4]: Eğer ForgotPasswordPage'e erişimi ve iş akışının sonraki adımlarına yönlendirmeyi sağlayan uygulama içi route yönetimi sistemi entegre edilmemişse, kullanıcılar şifre sıfırlama sürecinde yönlendirilemez, yetkisiz erişim kontrolleri uygulanamaz.
[Aksiyom 5]: Eğer formdaki kullanıcı giriş verilerinin handleSubmit fonksiyonuna doğru şekilde iletilmesini sağlayan form bağlama mantığı yoksa, eksik veya geçersiz verilerle API istekleri gönderilir, tüm kullanıcı talepleri başarısız olur.

---

## FONKSIYON DETAYLARI

### ForgotPasswordPage
**Ne yapar**: VentHub HVAC projesinde şifresini unutan kullanıcılar için tasarlanmış şifre sıfırlama sayfasını oluşturan React fonksiyonel bileşenidir. Kullanıcının e-posta adresini girerek şifre sıfırlama talebi gönderebileceği kullanıcı arayüzünü sunar. Uygulamanın oturum açma akışının bir parçası olarak, şifre unutma durumunda kullanıcıların yönlendirildiği özel sayfa işlevi görür.
**Nasıl yapar**: Proje kök dizininde `src\views\ForgotPasswordPage.tsx` dosyasında tanımlı React tabanlı bir fonksiyonel bileşendir. Sayfadaki form elemanları, bilgilendirme metinleri ve gönderim butonu gibi tüm kullanıcı arayüzü öğelerini render eder. Bileşen içindeki yerleşik olay işleyicileri sayesinde kullanıcı girdilerini alır ve şifre sıfırlama akışının sorunsuz çalışması için gerekli arayüz altyapısını sunar.
**Parametreler**: Herhangi bir giriş parametresi almaz.
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Bu döndürülen bileşen, uygulamanın yönlendirme sistemi tarafından çağrıldığında şifre sıfırlama sayfasının içeriğini uygulama DOM'ına ekler.

### handleSubmit
**Ne yapar**: ForgotPasswordPage bileşeni içindeki şifre sıfırlama formunun gönderilme olayını yöneten özel olay işleyicisidir. Formun standart web varsayılan davranışını engelleyerek şifre sıfırlama talebinin tek sayfa uygulama akışına uygun olarak işlenmesini sağlar. Kullanıcının girdiği bilgilerle şifre sıfırlama sürecini tetikleyen ilk adım olarak çalışır.
**Nasıl yapar**: Formun gönderilme anında tetiklenen olayı yakalar, bu olay üzerinden formun tüm değerlerine erişir ve varsayılan sayfa yenileme davranışını engelleyerek uygulama akışının kesilmesini önler. Formdaki kullanıcı girdilerinin doğruluğunu kontrol etme ve sonraki sıfırlama adımlarını çağırma işlemlerini yürütmek üzere tasarlanmıştır.
**Parametreler**:
- name: e, type: React.FormEvent — Formun gönderilme olayını temsil eden, olayla ilgili tüm meta verileri ve form içindeki giriş değerlerini içeren React FormEvent nesnesidir. Bu nesne üzerinden formun varsayılan davranışını engelleme ve form elemanlarına güvenli erişim işlemleri gerçekleştirilir.
**Dönüş**: Tanımında açık bir dönüş tipi belirtilmemiştir. Sadece form gönderim olayını yönetmek üzere çalışan işleyici, herhangi bir işlem sonucu değer döndürmez.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\ForgotPasswordPage.tsx::ForgotPasswordPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `email` — Kullanıcının girdiği şifre sıfırlama e-postasını tutan state değişkeni
  - `setEmail` — email state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `loading` — Form gönderimi sürecindeki yükleme durumunu izleyen state değişkeni
  - `setLoading` — loading state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `emailSent` — Şifre sıfırlama e-postasının başarıyla gönderildiğini işaret eden state değişkeni
  - `setEmailSent` — emailSent state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `resetPassword` — useAuth hook'undan alınan kimlik doğrulama servisinin şifre sıfırlama fonksiyonu
  - `t` — useI18n hook'undan alınan çoklu dil çevirisi yapan fonksiyon
  - `handleSubmit` - Form gönderim işlemini yöneten async iç fonksiyon
  - `Routes.auth.login()` — Giriş sayfası rotasını döndüren rota yardımcı fonksiyon çağrısı
  - `toast` — Kullanıcıya bildirim göstermek için kullanılan react-hot-toast kütüphane fonksiyonu
- **Dönüş**: React JSX elementi (sayfa arayüzü)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\ForgotPasswordPage.tsx::handleSubmit
- **params**: e: React.FormEvent
- **ic_degiskenler**:
  - `e` — Form gönderim event nesnesi
  - `e.preventDefault()` — Formun varsayılan sayfa yenileme davranışını engelleyen metot
  - `email` — Üst kapsamdan erişilen kullanıcının girdiği e-posta değeri
  - `toast.error` — Kullanıcıya hata bildirimi göstermek için kullanılan toast metodu
  - `t('auth.email')` — Çeviri sisteminden e-posta metnini çeken çağrı
  - `t('auth.required')` — Çeviri sisteminden zorunlu alan uyarısı metnini çeken çağrı
  - `setLoading` — loading state değerini güncelleyen setter fonksiyonu
  - `resetPassword(email)` — Şifre sıfırlama API'sini çağıran fonksiyon, parametre olarak kullanıcının e-postasını alır
  - `error` — resetPassword çağrısından dönen hata nesnesi
  - `error.message` — Hata nesnesinin mesaj alanı, hata türünü sınıflandırmak için kullanılır
  - `t('auth.userNotFound')` — Çeviri sisteminden kullanıcı bulunamadı metnini çeken çağrı
  - `t('auth.resetError')` — Çeviri sisteminden genel şifre sıfırlama hatası metnini çeken çağrı
  - `setEmailSent` — emailSent state değerini true yaparak başarılı gönderimi işaretleyen setter fonksiyonu
  - `toast.success` — Kullanıcıya başarı bildirimi göstermek için kullanılan toast metodu
  - `t('auth.resetEmailSent')` — Çeviri sisteminden e-posta gönderildi metnini çeken çağrı
  - `catch (error)` — Try bloğunda oluşan beklenmedik hataları yakalayan hata nesnesi
  - `t('auth.unexpectedError')` — Çeviri sisteminden beklenmedik hata metnini çeken çağrı
  - `console.error` — Hata detaylarını geliştirici konsoluna yazdıran metot
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\views\ForgotPasswordPage.tsx
  function: src\views\ForgotPasswordPage.tsx::ForgotPasswordPage
  function: src\views\ForgotPasswordPage.tsx::handleSubmit

---

## DISA AKTARILANLAR (EXPORTS)
  export: ForgotPasswordPage