---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx
skeleton_hash: 85bfbc2f18d6514d
generated_at: 2026-05-23T22:35:39Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun kullanıcı hesapları bölümündeki adres yönetimi sayfasını oluşturan React bileşenidir. Kullanıcıların hesaplarına ekledikleri tüm teslimat veya fatura adreslerini görüntüleyip yönetebilmeleri için gereken ana sayfa yapısını sunar. Hesap ayarları menüsü altında erişilen, adreslerle ilgili tüm işlemlerin merkezindeki sayfa bileşenini barındırır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Adres yönetimi işlevlerini kullanıcıya sunan bu modülün tek ve ana bileşenidir. Tüm adres yönetimi arayüzünü ve ilgili işlevleri bir araya getirerek platformun hesap ayarları sistemine entegre eder.
- AccountAddressesPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı hesap adresleri yönetim sayfası modülünün çalışması için temel React altyapısının, uygulama yönlendirme mekanizmasının, kullanıcı oturum durumunun ve adres işlemleri için gerekli backend entegrasyonlarının erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer React kütüphanesi uygulama genelinde yüklü ve erişilebilir değilse, bu bileşen hiçbir şekilde render edilemez, çalışma zamanı hatası oluşur.
[Aksiyom 2]: Eğer modül içinde tanımlı `emptyForm` sabit nesnesi tüm temel adres alanlarını içermiyorsa, adres oluşturma ve düzenleme formları hatalı başlatılır, kullanıcı girişi sırasında doğrulama ve veri kaydetme hataları meydana gelir.
[Aksiyom 3]: Eğer uygulama yönlendirme (routing) mekanizmasında bu bileşen için geçerli bir rota tanımlanmamışsa, kullanıcı hesap adresleri sayfasına erişemez.
[Aksiyom 4]: Eğer oturum açmış kullanıcının kimlik bilgilerine bu modül erişemiyorsa, kullanıcıya ait adresleri listelemek, düzenlemek veya eklemek mümkün olmaz, sayfa yetkisiz erişim hatasıyla veya boş şekilde gösterilir.
[Aksiyom 5]: Eğer adres ekleme, silme, güncelleme ve listeleme (CRUD) işlemleri için gerekli backend API uç noktaları erişilebilir değilse, kullanıcı hiçbir adres yönetimi işlemini gerçekleştiremez.

---

## FONKSIYON DETAYLARI

### AccountAddressesPage
**Ne yapar**: VentHub HVAC projesinde yer alan AccountAddressesPage, kullanıcıların hesaplarına bağlı tüm adresleri yönetebileceği hesap ayarları sayfası bileşenidir. Kaynak kodunda src/views/account/ dizininde konumlanan bu bileşen, kullanıcıların kayıtlı adreslerini görüntülemesi, yeni adres eklemesi, mevcut adresleri düzenlemesi veya silmesi gibi tüm adres yönetimi işlemlerini tek bir merkezden gerçekleştirmesini sağlar. Hesap yönetimi modülünün ayrılmaz bir parçası olarak kullanıcıların ileride yapacağı cihaz kurulumu, servis talebi gibi süreçlerde kullanacağı adres verilerini güncel tutmasına olanak tanır.
**Nasıl yapar**: React tabanlı bir frontend bileşeni olarak çalışan AccountAddressesPage, VentHub projesinin genel frontend mimarisiyle tam uyumlu çalışır. İlk sayfa yüklemesi sırasında projenin hesap servisleri ile iletişim kurarak kullanıcının mevcut adres listesini sunucudan çeker, bu verileri yerel bileşen state üzerinde depolar ve kullanıcı arayüzüne yansıtır. Kullanıcı tarafından gerçekleştirilen tüm adres güncelleme işlemlerini yine ilgili sunucu servisleri aracılığıyla doğrular, değişiklikleri kaydeder ve adres listesini anlık olarak güncel tutar. Kullanıcı arayüzünü JSX formatında yapılandırarak tarayıcıda sorunsuz görüntülenmesini sağlar.
**Parametreler**:
- Bu fonksiyona çağrım sırasında herhangi bir özel giriş parametresi iletilmez. React tabanlı bir bileşen olarak yalnızca React kütüphanesi tarafından standart bileşen sözleşmesine uygun olarak iletilen genel props nesnesini alır, tanımında belirtilen özel zorunlu veya opsiyonel parametresi bulunmamaktadır.
**Dönüş**: Tanımında açıkça dönüş tipi void veya bilinmiyor olarak belirtilmiştir. React sayfa bileşeni olarak çalıştığı için pratikte tarayıcıda görüntülenmek üzere JSX formatında kullanıcı arayüzü elementi döndürür, ancak proje içindeki tür tanımında kesin dönüş türü belirtilmediği için resmi return tipi olarak bilinmeyen değer paylaşılmıştır.

---

## INTERFACES

### FormState
- `id?: string`
- `label?: string | null`
- `full_name?: string | null`
- `phone?: string | null`
- `address_line: string`
- `city: string`
- `district: string`
- `postal_code?: string | null`
- `country?: string`
- `is_default_shipping?: boolean | null`
- `is_default_billing?: boolean | null`

---

## SABİTLER
- **emptyForm** (object) — `{
  label: '',
  full_name: '',
  phone: '',
  address_line: '',
  city:...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::anonim_fetch_addresses
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` - adres listesi yüklenirken loading state'ini ayarlamak için kullanılan state setter fonksiyonu
  - `listAddresses` - API'den kullanıcı adreslerini çekmek için çağrılan fonksiyon
  - `data` - listAddresses'ten dönen adres listesi verisi
  - `setItems` - çekilen adres verilerini state'e kaydetmek için kullanılan state setter
  - `e` - try bloğunda oluşan hataları yakalayan hata nesnesi
  - `console.error` - yakalanan hatayı konsola loglamak için kullanılan metod
  - `toast.error` - kullanıcıya yükleme hatası bildirimi göstermek için toast fonksiyonu
  - `t` - çeviri metinlerini almak için kullanılan i18n fonksiyonu
- **Dönüş**: yok (async void, yan etki olarak adres verilerini yükler ve state'i günceller)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::startEdit
- **params**: a: UserAddress
- **ic_degiskenler**:
  - `setForm` - form state'ini seçilen adresin verileriyle doldurmak için kullanılan state setter
  - `a.id` - düzenlenecek adresin benzersiz kimliği
  - `a.label` - adresin etiketi
  - `a.full_name` - adreste kayıtlı kişinin tam adı
  - `a.phone` - adreste kayıtlı telefon numarası
  - `a.address_line` - adresin açık adres satırı
  - `a.city` - adresin bulunduğu şehir
  - `a.district` - adresin bulunduğu ilçe
  - `a.postal_code` - adresin posta kodu
  - `a.country` - adresin bulunduğu ülke
  - `a.is_default_shipping` - adresin varsayılan teslimat adresi olup olmadığı bilgisi
  - `a.is_default_billing` - adresin varsayılan fatura adresi olup olmadığı bilgisi
  - `window.scrollTo` - mobilde formun bulunduğu yere sayfayı yumuşak kaydırmak için kullanılan window metodu
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setForm` - form state'ini sıfırlamak için kullanılan state setter
  - `emptyForm` - önceden tanımlanmış boş form şablonu, formu sıfırlamak için kullanılır
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::handleSubmit
- **params**: e: React.FormEvent
- **ic_degiskenler**:
  - `e.preventDefault` - formun varsayılan sayfa yenileme davranışını engellemek için kullanılan metod
  - `form.address_line` - formda girilen açık adres satırı, zorunlu alan kontrolü yapılır
  - `form.city` - formda girilen şehir, zorunlu alan kontrolü yapılır
  - `form.district` - formda girilen ilçe, zorunlu alan kontrolü yapılır
  - `toast.error` - kullanıcıya hata bildirimi göstermek için kullanılan toast fonksiyonu
  - `t` - çeviri metinlerini almak için kullanılan i18n fonksiyonu
  - `user` - mevcut oturum açmış kullanıcı nesnesi, kimlik doğrulama kontrolü için kullanılır
  - `setSaving` - kayıt işlemi sırasında loading state'ini ayarlamak için kullanılan state setter
  - `isEditing` - mevcut formun varolan bir adresi düzenleme modunda olup olmadığını belirten state
  - `form.id` - düzenlenen adresin benzersiz kimliği
  - `updateAddress` - API'de varolan adresi güncellemek için çağrılan fonksiyon
  - `form.label` - formda girilen adres etiketi
  - `form.full_name` - formda girilen tam isim
  - `form.phone` - formda girilen telefon numarası
  - `form.postal_code` - formda girilen posta kodu
  - `form.country` - formda girilen ülke
  - `form.is_default_shipping` - formda işaretlenen varsayılan teslimat adresi durumu
  - `form.is_default_billing` - formda işaretlenen varsayılan fatura adresi durumu
  - `toast.success` - kullanıcıya başarılı işlem bildirimi göstermek için toast fonksiyonu
  - `createAddress` - API'de yeni adres oluşturmak için çağrılan fonksiyon
  - `user.id` - mevcut kullanıcının benzersiz kimliği, yeni adres ataması için kullanılır
  - `resetForm` - formu sıfırlamak için çağrılan yardımcı fonksiyon
  - `refresh` - adres listesini yenilemek için çağrılan fonksiyon
  - `e` - try bloğunda oluşan hataları yakalayan hata nesnesi
  - `console.error` - yakalanan hatayı konsola loglamak için kullanılan metod
- **Dönüş**: yok (async void, adres oluşturma/güncelleme işlemini gerçekleştirir)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::handleDelete
- **params**: id: string
- **ic_degiskenler**:
  - `confirm` - kullanıcıdan silme işlemi için onay almak için kullanılan tarayıcı metodu
  - `t` - çeviri metinlerini almak için kullanılan i18n fonksiyonu
  - `deleteAddress` - API'den adresi silmek için çağrılan fonksiyon
  - `toast.success` - başarılı silme işlemi için kullanıcıya bildirim göstermek için toast fonksiyonu
  - `refresh` - adres listesini silme işleminden sonra yenilemek için çağrılan fonksiyon
  - `form.id` - mevcut formda düzenlenen adresin kimliği, silinen adresle eşleşirse form sıfırlanır
  - `resetForm` - silinen adres düzenleniyorsa formu sıfırlamak için çağrılan fonksiyon
  - `e` - oluşan hataları yakalayan hata nesnesi
  - `console.error` - hatayı konsola loglamak için kullanılan metod
  - `toast.error` - silme sırasında oluşan hatalarda kullanıcıya bildirim göstermek için toast fonksiyonu
- **Dönüş**: yok (async void, adres silme işlemini gerçekleştirir)

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::makeDefault
- **params**: id: string, kind: 'shipping' | 'billing'
- **ic_degiskenler**:
  - `setDefaultAddress` - API'de seçilen adresi varsayılan teslimat/fatura adresi yapmak için çağrılan fonksiyon
  - `toast.success` - başarılı işlemde kullanıcıya bildirim göstermek için toast fonksiyonu
  - `t` - çeviri metinlerini almak için kullanılan i18n fonksiyonu
  - `refresh` - varsayılan adres değişikliğinden sonra listeyi yenilemek için çağrılan fonksiyon
  - `e` - oluşan hataları yakalayan hata nesnesi
  - `console.error` - hatayı konsola loglamak için kullanılan metod
  - `toast.error` - oluşan hatalarda kullanıcıya bildirim göstermek için toast fonksiyonu
- **Dönüş**: yok (async void, adresi varsayılan olarak ayarlar)

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountAddressesPage.tsx::anonim_address_card_render
- **params**: a: UserAddress
- **ic_degiskenler**:
  - `a.id` - adresin benzersiz kimliği, React listelemesi için key olarak kullanılır
  - `MapPin` - lucide-react'ten importlanan konum ikonu, kart başlığında kullanılır
  - `t` - çeviri metinlerini almak için kullanılan i18n fonksiyonu
  - `a.label` - adresin etiketi, kart başlığında gösterilir
  - `Edit2` - lucide-react'ten importlanan düzenleme ikonu, düzenleme butonunda kullanılır
  - `startEdit` - adresi düzenleme moduna almak için çağrılan fonksiyon, düzenleme butonu tıklamasında tetiklenir
  - `Trash2` - lucide-react'ten importlanan silme ikonu, silme butonunda kullanılır
  - `handleDelete` - adresi silmek için çağrılan fonksiyon, silme butonu tıklamasında tetiklenir
  - `a.full_name` - adreste kayıtlı tam isim, kart içeriğinde gösterilir
  - `a.address_line` - adresin açık adresi, kart içeriğinde gösterilir
  - `a.district` - adresin ilçesi, kart içeriğinde gösterilir
  - `a.city` - adresin şehri, kart içeriğinde gösterilir
  - `a.postal_code` - adresin posta kodu, kart içeriğinde gösterilir
  - `a.phone` - adreste kayıtlı telefon numarası, kart içeriğinde gösterilir
  - `Truck` - lucide-react'ten importlanan teslimat ikonu, teslimat adresi başlığında kullanılır
  - `a.is_default_shipping` - adresin varsayılan teslimat adresi olup olmadığı, durum etiketini belirler
  - `CheckCircle` - lucide-react'ten importlanan onay ikonu, varsayılan adres etiketinde kullanılır
  - `makeDefault` - adresi varsayılan yapmak için çağrılan fonksiyon, "varsayılan yap" butonu tıklamasında tetiklenir
  - `CreditCard` - lucide-react'ten importlanan fatura ikonu, fatura adresi başlığında kullanılır
  - `a.is_default_billing` - adresin varsayılan fatura adresi olup olmadığı, durum etiketini belirler
- **Dönüş**: JSX elementi (tek adres kartı olarak render edilir)

---

## NODE ID STANDARD

  file: src\views\account\AccountAddressesPage.tsx
  function: src\views\account\AccountAddressesPage.tsx::AccountAddressesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountAddressesPage