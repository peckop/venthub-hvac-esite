---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountProfilePage.tsx
skeleton_hash: 8f54003fdfbd1d91
generated_at: 2026-05-23T22:35:41Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun hesap yönetimi bölümünde yer alan kullanıcı profil sayfasını oluşturan React görünüm bileşenidir. Kullanıcıların kendi hesap bilgilerini görüntüleyip yönetebileceği web arayüzünü sunan ana sayfa yapısını barındırır.

## Fonksiyon Grupları
### Profil Sayfası Ana Bileşeni
Hesap profil sayfasının tüm arayüz yapısını ve temel işleyişini yöneten tek ana bileşendir, sayfanın yüklenmesi ve temel kullanıcı etkileşimlerinin koordinasyonundan sorumludur.
- AccountProfilePage

---

## AXIOMS – Mimari Varsayımlar
Bu React Typescript ile geliştirilmiş hesap profili görünüm (view) bileşeninin sorunsuz çalışması, uygulama ortamının frontend çalışma gereksinimlerini, yönlendirme yapısını, veri sağlayıcı bağlamları ve harici servis erişimini sağlamasına bağlıdır.

[Aksiyom 1]: Eğer React 16.8 ve üstü sürümü (hooks desteği sunan) uygulama çalışma ortamında yüklü değilse, AccountProfilePage bileşeni hiçbir şekilde kullanıcıya render edilemez, profil görünümü oluşturulamaz.
[Aksiyom 2]: Eğer kullanıcı hesap verilerini sağlayan global uygulama bağlamı (context API) bu bileşen tarafından erişilebilir durumda değilse, kullanıcının kişisel profil bilgileri görüntülenemez, boş ya da hatalı içerik kullanıcıya sunulur.
[Aksiyom 3]: Eğer projenin Typescript yapılandırması TSX dosyalarını derleyecek şekilde ayarlanmamışsa, uygulama build işlemi sırasında derleme hatası alınır, AccountProfilePage içeren üretim paketi oluşturulamaz.
[Aksiyom 4]: Eğer uygulama içi yönlendirme (routing) sistemi, bu bileşene ait tanımlı rota üzerinden çalışma zamanında AccountProfilePage'i yükleyecek şekilde yapılandırılmamışsa, kullanıcı hesap profil sayfasına erişim sağlayamaz, tanımlanmamış rota hatasıyla karşılaşır.
[Aksiyom 5]: Eğer hesap profil bilgilerini okumak/güncellemek için kullanılan backend API uç noktaları, bu bileşenin çalıştığı kaynaktan erişime izin verecek şekilde yapılandırılmamışsa (CORS hatası, servis erişimsizliği vb.), profil görüntüleme ve güncelleme işlemleri tamamlanamaz.

---

## FONKSIYON DETAYLARI

### AccountProfilePage
**Ne yapar**: Venthub HVAC projesinin kullanıcı hesap profili sayfasını oluşturan ana bileşendir. Kullanıcıların kendi hesap bilgilerini görüntülemesi ve hesap ayarlarıyla ilgili işlemleri gerçekleştirebilmesi için gereken arayüzü sunar, uygulamanın hesap yönetimi akışının temel görüntüleme katmanı olarak görev alır.
**Nasıl yapar**: Proje ağacında `src/views/account/AccountProfilePage.tsx` dosyasında tanımlanan TSX tabanlı bileşen olarak çalışır. React uygulamasının sayfa render mekanizması tarafından çağrılarak hesap profil sayfasının içeriğini uygulamanın DOM yapısına ekler, genel domain kapsamında kullanıcı hesap işlemleri için özel olarak geliştirilmiştir.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: Fonksiyonun return tipi tanımda void veya bilinmiyor olarak belirtilmiştir. Temel işlevi, hesap profili sayfasının arayüzünü oluşturmak ve kullanıcıya sunmaktır.

---

## INTERFACES

### UserMetadata
- `full_name?: string`
- `phone?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountProfilePage.tsx::AccountProfilePage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri metinlerini getiren fonksiyon, tüm arayüz metinleri için kullanılır
  - `user` — useAuth hook'undan alınan oturum açmış mevcut kullanıcı nesnesi, kullanıcı metadata'sını çekmek için kullanılır
  - `fullName` — React.useState ile yönetilen, kullanıcının tam adını tutan string state değeri, form inputunda bağlanır
  - `setFullName` — fullName state'ini güncellemek için kullanılan state setter fonksiyonu
  - `phone` — React.useState ile yönetilen, kullanıcının telefon numarasını tutan string state değeri, form inputunda bağlanır
  - `setPhone` — phone state'ini güncellemek için kullanılan state setter fonksiyonu
  - `saving` — React.useState ile yönetilen, profil kaydetme işleminin devam edip etmediğini belirten boolean yükleme durumu state'i
  - `setSaving` — saving state'ini güncellemek için kullanılan state setter fonksiyonu
  - `onSave` - form submit edildiğinde tetiklenen, profili kaydetmek için çalışan asenkron iç fonksiyon
- **Dönüş**: Profil sayfası arayüzünü oluşturan React JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountProfilePage.tsx::AccountProfilePage.useEffect.callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `meta` — kullanıcı nesnesinden alınan, ek kullanıcı bilgilerini (ad, telefon) içeren metadata nesnesi, tip dönüşümü yapılarak kullanılır
  - `meta.full_name` — meta nesnesinden alınan kullanıcının kayıtlı tam adı, fullName state'ine atanır
  - `meta.phone` — meta nesnesinden alınan kullanıcının kayıtlı telefon numarası, phone state'ine atanır
  - `user` — üst fonksiyondan gelen mevcut kullanıcı nesnesi, user?.user_metadata erişimi yapılır
  - `setFullName` — üst fonksiyondan gelen fullName state setter'ı, kullanıcının mevcut adını state'e yüklemek için kullanılır
  - `setPhone` — üst fonksiyondan gelen phone state setter'ı, kullanıcının mevcut telefonunu state'e yüklemek için kullanılır
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountProfilePage.tsx::onSave
- **params**: e: React.FormEvent (form submit olayını tutan event nesnesi)
- **ic_degiskenler**:
  - `e.preventDefault` — formun varsayılan yenileme davranışını engellemek için kullanılan event metodu
  - `setSaving` — üst fonksiyondan gelen yükleme durumu state setter'ı, kaydetme süreci başında ve sonunda durumu günceller
  - `supabase` — projeye entegre Supabase istemcisi, auth.updateUser API çağrısı ile kullanıcı verisini güncellemek için kullanılır
  - `error` — Supabase API çağrısından dönen olası hata nesnesi, hata durumunda yakalanıp işlenir
  - `fullName` — üst fonksiyondan gelen formda girilen yeni tam adı tutan state değeri, API'ye gönderilir
  - `phone` — üst fonksiyondan gelen formda girilen yeni telefon numarasını tutan state değeri, API'ye gönderilir
  - `toast` — react-hot-toast bildirim kütüphanesi, başarı ve hata durumunda kullanıcıya bildirim göstermek için kullanılır
  - `t` — üst fonksiyondan gelen çeviri fonksiyonu, bildirim ve buton metinlerini çevirmek için kullanılır
  - `console.error` — tarayıcı konsoluna hata yazdırmak için kullanılan yerleşik metot, yakalanan hataları loglamak için kullanılır
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\views\account\AccountProfilePage.tsx
  function: src\views\account\AccountProfilePage.tsx::AccountProfilePage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountProfilePage