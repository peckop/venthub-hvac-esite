---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx
skeleton_hash: 714d41430b62d140
generated_at: 2026-05-23T22:36:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun kullanıcı hesap yönetimi bölümünde yer alan hesap güvenliği sayfası ön yüz bileşenidir. Kullanıcıların kendi hesaplarının güvenlik ayarlarına erişmesini, bu ayarları görüntülemesini ve yönetmesini sağlayan arayüzün temelini oluşturur.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve ana giriş noktası olarak, hesap güvenliği sayfasının tüm yapısını ve temel işlevlerini sunar, kullanıcının sayfa ile etkileşim kurmasının öncülüğünü yapar.
- AccountSecurityPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı hesap güvenliği sayfası bileşeninin doğru çalışması, kullanıcıların hesap güvenliği işlemlerini sorunsuz gerçekleştirebilmesi için frontend runtime ortamı, kimlik doğrulama/yetkilendirme altyapısı, yönlendirme sistemi ve backend servis erişiminin eksiksiz olması zorunludur.

[Aksiyom 1]: Eğer React kütüphanesi ve TSX/JSX bileşenlerini çalıştıracak frontend runtime ortamı yoksa, bu sayfa hiç render edilemez, kullanıcılar hesap güvenliği arayüzüne hiç erişemez.
[Aksiyom 2]: Eğer uygulama içi yönlendirme (routing) mekanizması bu sayfayı yetkili kullanıcı erişimi için tanımlamamışsa, kullanıcılar bu sayfanın yoluna ulaşamaz, sayfaya erişim sağlayamaz.
[Aksiyom 3]: Eğer oturum açmış mevcut kullanıcının kimlik bilgilerine erişim sağlayan kimlik doğrulama (auth) servisi veya global kullanıcı state'i yoksa, kullanıcı kendi hesap güvenliği verilerini çekemez, hiçbir güvenlik işlemini başlatamaz.
[Aksiyom 4]: Eğer şifre değiştirme, güvenlik ayarlarını güncelleme gibi hesap güvenliği işlemlerini çalıştıran backend API uçlarına istemci tarafı ağ erişimi yoksa, kullanıcının tüm güvenlik aksiyonları başarısız olur.
[Aksiyom 5]: Eğer sadece yetkili, oturum açmış kullanıcıların bu sayfaya erişmesini sağlayan yetkilendirme (authorization) kontrol mekanizması yoksa, yetkisiz kullanıcılar başkalarının hesap güvenliği bilgilerine erişebilir veya mevcut kullanıcılar kendi sayfalarına giriş yapamaz.

---

## FONKSIYON DETAYLARI

### AccountSecurityPage
**Ne yapar**: VentHub HVAC projesinin kullanıcı hesap güvenliği işlemlerinin sunulduğu web sayfası bileşenidir. Kullanıcıların hesaplarıyla ilgili güvenlik ayarlarını görüntülemesi ve yönetmesi amacıyla geliştirilmiş, proje içindeki özel hesap sayfalarından biridir.
**Nasıl yapar**: Projenin `src/views/account` dizininde konumlanmış React bileşeni olarak, projenin rota yapısı üzerinden ilgili adrese erişildiğinde çalıştırılır. İçerisinde barındırdığı alt bileşenleri birleştirerek tüm hesap güvenliği işlevlerini tek bir arayüz altında toplar.
**Parametreler**:
- Herhangi bir giriş parametresi almaz.
**Dönüş**: Tanımlanmış spesifik bir dönüş tipi bulunmamaktadır, React tabanlı sayfa bileşeni olarak ilgili kullanıcı arayüzü elementlerini DOM'a render etmek üzere çalışır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::AccountSecurityPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router` — Next.js yönlendirme hook'undan alınan sayfa taşıma nesnesi
  - `user` — useAuth hook'undan gelen oturum açmış kullanıcı nesnesi
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `current` — useState ile yönetilen mevcut şifre input değeri
  - `setCurrent` — current state'ini güncelleyen setter fonksiyonu
  - `password` — useState ile yönetilen yeni şifre input değeri
  - `setPassword` — password state'ini güncelleyen setter fonksiyonu
  - `confirm` — useState ile yönetilen yeni şifre tekrar input değeri
  - `setConfirm` — confirm state'ini güncelleyen setter fonksiyonu
  - `saving` — Şifre kaydetme işlemi sırasında aktif olan loading state'i
  - `setSaving` — saving state'ini güncelleyen setter fonksiyonu
  - `identities` — Kullanıcıya bağlı üçüncü taraf giriş kimliklerini tutan state dizisi
  - `setIdentities` — identities state'ini güncelleyen setter fonksiyonu
  - `hasProvider` — Belirli bir giriş sağlayıcısının bağlı olup olmadığını kontrol eden yardımcı fonksiyon
  - `refreshIdentities` - Supabase'den kullanıcı kimliklerini yenileyen async fonksiyon
  - `useEffect` — Komponent ilk mount olduğunda kimlikleri yüklemek için kullanılan hook
  - `passwordRules` — Şifre güç kurallarını (uzunluk, büyük harf vb.) içeren nesne dizisi
  - `passedRules` — Yeni şifrenin karşıladığı şifre kuralı sayısı
  - `strengthColor` — Şifre güç seviyesine göre arka plan rengi CSS sınıfı
  - `strengthLabel` — Şifre güç seviyesinin Türkçe etiketi (Zayıf/Orta/İyi/Güçlü)
  - `handleSubmit` — Şifre değiştirme formunun submit işlemini yöneten fonksiyon
- **Dönüş**: Hesap güvenliği sayfasının JSX React elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::hasProvider
- **params**: (p: string)
- **ic_degiskenler**:
  - `identities` — Üst scope'dan gelen kullanıcının bağlı kimlikleri dizisi
  - `i` — some metodu içinde döngüye giren her bir kimlik nesnesi
- **Dönüş**: Boolean, istenen sağlayıcı bağlıysa true, değilse false

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::refreshIdentities
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — supabase.auth.getUser() çağrısından dönen kullanıcı verisi
  - `error` — Supabase kimlik getirme çağrısından dönen hata nesnesi
  - `ids` — Kullanıcı nesnesinden çıkarılan kimlikler dizisi, setIdentities'e aktarılır
- **Dönüş**: Promise<void>

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::strength_bar_item_renderer
- **params**: (i: number)
- **ic_degiskenler**:
  - `passedRules` — Üst scope'dan gelen karşılanan şifre kuralı sayısı
  - `strengthColor` — Üst scope'dan gelen şifre güç seviyesine ait renk sınıfı
- **Dönüş**: Şifre güç çubuğunun her bir parçası için JSX div elementi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::rule_list_item_renderer
- **params**: (rule: {key: string, label: string, test: (p: string) => boolean})
- **ic_degiskenler**:
  - `password` — Üst scope'dan gelen yeni şifre değeri
  - `rule.test` — İlgili şifre kuralını test eden fonksiyon
- **Dönüş**: Şifre kuralı listesi elemanı için JSX li elementi

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::google_unlink_click_handler
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `hasProvider` — Email giriş sağlayıcısının varlığını kontrol eden fonksiyon
  - `toast` — Kullanıcıya bildirim göstermek için kullanılan react-hot-toast fonksiyonu
  - `t` — Çeviri fonksiyonu
  - `identities` — Üst scope'dan gelen kullanıcı kimlikleri dizisi
  - `google` - İçinde bulunan Google kimlik nesnesi
  - `supabase.auth.unlinkIdentity` — Supabase'ın üçüncü taraf kimlik bağlantısını kesen fonksiyonu
  - `error` — unlinkIdentity çağrısından dönen hata nesnesi
  - `refreshIdentities` — Bağlantı kesildikten sonra kimlikleri yenileyen fonksiyon
  - `console.error` — Hata durumunda konsola hata yazdıran fonksiyon
- **Dönüş**: Promise<void>

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::google_link_click_handler
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `supabase.auth.linkIdentity` — Supabase'ın yeni üçüncü taraf kimlik bağlantısı oluşturan fonksiyonu
  - `window.location.origin` — Mevcut sitenin kök URL'si, yönlendirme için kullanılır
  - `data` — linkIdentity çağrısından dönen cevap verisi
  - `error` — linkIdentity çağrısından dönen hata nesnesi
  - `url` — Supabase'ın Google yönlendirmesi için döndüğü URL
  - `router.push` — Kullanıcıyı Google giriş sayfasına yönlendiren fonksiyon
  - `toast` — Bildirim göndermek için kullanılan fonksiyon
  - `t` — Çeviri fonksiyonu
  - `refreshIdentities` — Bağlantı kurulduktan sonra kimlikleri yenileyen fonksiyon
  - `console.error` — Hata durumunda konsola yazan fonksiyon
- **Dönüş**: Promise<void>

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::handleSubmit
- **params**: (e: React.FormEvent)
- **ic_degiskenler**:
  - `e.preventDefault` — Formun varsayılan yenileme davranışını engelleyen fonksiyon
  - `current` — Mevcut şifre input değeri
  - `toast.error` — Hata bildirimi gönderen fonksiyon
  - `t` — Çeviri fonksiyonu
  - `passedRules` — Karşılanan şifre kuralı sayısı
  - `password` — Yeni şifre değeri
  - `confirm` — Yeni şifre tekrar değeri
  - `setSaving` — Loading state'ini aktifleştiren setter
  - `email` — Kullanıcının email adresi, yeniden yetkilendirme için kullanılır
  - `reauth` — Mevcut şifre ile yeniden oturum açma çağrısının cevabı
  - `pwned` — HIBP servisinden dönen şifrenin geçtiği sızıntı sayısı
  - `hibpPwnedCount` — Şifrenin sızıntıda olup olmadığını kontrol eden güvenlik fonksiyonu
  - `supabase.auth.updateUser` — Kullanıcının şifresini güncelleyen Supabase fonksiyonu
  - `error` — Şifre güncelleme çağrısından dönen hata nesnesi
  - `setCurrent`, `setPassword`, `setConfirm` — Form inputlarını sıfırlayan setter fonksiyonları
  - `console.error` — Hata durumunda konsola yazan fonksiyon
  - `setSaving(false)` — İşlem sonunda (hata/başarılı) loading state'ini kapatan setter çağrısı
- **Dönüş**: Promise<void>

---

## NODE ID STANDARD

  file: src\views\account\AccountSecurityPage.tsx
  function: src\views\account\AccountSecurityPage.tsx::AccountSecurityPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountSecurityPage