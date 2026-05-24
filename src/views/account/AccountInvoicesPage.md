---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountInvoicesPage.tsx
skeleton_hash: 1c5506a1b8bb1d08
generated_at: 2026-05-23T22:35:54Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun kullanıcı hesapları bölümünde yer alan faturalar sayfasını uygulayan React tabanlı bir ön yüz modülüdür. Kullanıcıların hesaplarına ait tüm faturaları erişip görüntüleyebileceği arayüzün ana giriş noktasını oluşturur ve platformun hesap sayfaları mimarisine entegre şekilde çalışır.

## Fonksiyon Grupları
### Ana Sayfa Root Bileşeni
Modülün tek ve ana bileşeni olarak, hesap faturaları sayfasının tüm arayüz ve temel işlevselliklerini bir araya getirir, sayfanın kullanıcıya sunulmasını sağlar.
- AccountInvoicesPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı hesap faturaları görüntüleme sayfası komponenti, VentHub HVAC platformundaki kullanıcı hesaplarına ait faturaları listeleyip yönetmek için kullanılan istemci tarafı view katmanı bileşenidir, çalışması için üst rota ve uygulama bağlamlarının sağladığı zorunlu bağımlılıkların ve arka plan servislerinin erişilebilir olması gerekmektedir.

[Aksiyom 1]: Eğer kullanıcının ilgili hesap faturalarını görüntüleme yetkisi yoksa, sayfa erişimi engellenir, yetkisiz erişim hatası gösterilir.
[Aksiyom 2]: Eğer ilgili hesabın benzersiz kimliği (account ID) üst rota veya ana bileşen tarafından sayfaya iletilmezse, faturalar çekilemez ve listelenemez, eksik parametre hatası kullanıcıya sunulur.
[Aksiyom 3]: Eğer hesap faturalarını çekmek için kullanılan backend API servisi erişilemez durumdaysa, sayfa fatura listesini yükleyemez, ağ veya sunucu hatası gösterilir.
[Aksiyom 4]: Eğer ana uygulamanın kimlik doğrulama (auth) bağlamı gibi sayfanın bağımlı olduğu React bağlamları sağlanmamışsa, sayfa gerekli bilgilere erişemeden hatalı render edilir veya uygulama çöker.
[Aksiyom 5]: Eğer fatura indirme, ödeme başlatma gibi yan işlemler için kullanılan yardımcı servisler çalışmıyorsa, sayfa üzerindeki fatura ile ilgili işlevler çalışmaz, işlem başarısız hatası döndürülür.

---

## FONKSIYON DETAYLARI

### AccountInvoicesPage
**Ne yapar**: VentHub HVAC projesinin kullanıcı hesapları bölümündeki faturalar sayfasını oluşturan React bileşenidir. Kullanıcıların hesaplarına ait tüm geçmiş ve güncel faturalarını tek bir merkezden görüntülemesi için gereken temel arayüz altyapısını sunar.
**Nasıl yapar**: Projenin `src/views/account` dizininde konumlanan TypeScript ile yazılmış bir React sayfa bileşeni olarak çalışır. Hesaplar sekmesi altında erişime açılan bu sayfa, fatura verilerini kullanıcıya uygun formatta sunacak şekilde ekran içeriğini render eder.
**Parametreler**:
- Bu fonksiyona herhangi bir parametre aktarılmaz
**Dönüş**: Tanımında return tipi void veya bilinmiyor olarak işaretlenmiştir. React tabanlı bir sayfa bileşeni olarak çalıştığı için kullanıcı ekranında görüntülenecek faturalar sayfası arayüzünü üretir.

---

## TYPE ALIASES

### InvoiceProfileType
```typescript
type InvoiceProfileType = 'individual' | 'corporate'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::AccountInvoicesPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `useAuth().user` — Oturum açmış kullanıcı nesnesi, fatura profili oluşturulurken kimlik olarak kullanılır
  - `useI18n().t` — Çoklu dil desteği için çeviri fonksiyonu, UI metinlerini çevirmek için kullanılır
  - `items` — Tüm kayıtlı fatura profillerini tutan state dizisi, sunucudan yüklenen verileri saklar
  - `setItems` — items state'ini güncellemek için kullanılan React state setter'ı
  - `loading` — Profillerin yüklenme durumunu tutan boolean state, yükleme animasyonunu göstermek için kullanılır
  - `setLoading` — loading state'ini güncelleyen setter
  - `saving` - Form kaydetme işleminin aktif olup olmadığını tutan boolean state, kayıt animasyonu için kullanılır
  - `setSaving` — saving state'ini güncelleyen setter
  - `editingId` — Düzenleme modunda olan profilin kimliğini tutan state, null ise yeni profil oluşturuluyor
  - `setEditingId` — editingId state'ini güncelleyen setter
  - `profileType` — Oluşturulacak/düzenlenecek profilin türünü tutan state, 'individual' (bireysel) veya 'corporate' (kurumsal) olabilir
  - `setProfileType` — profileType state'ini güncelleyen setter
  - `firstName` — Bireysel profiller için ad bilgisini tutan form state'i
  - `setFirstName` — firstName state'ini güncelleyen setter
  - `lastName` — Bireysel profiller için soyad bilgisini tutan form state'i
  - `setLastName` — lastName state'ini güncelleyen setter
  - `companyName` — Kurumsal profiller için firma ünvanı bilgisini tutan form state'i
  - `setCompanyName` — companyName state'ini güncelleyen setter
  - `taxNumber` — Tüm profiller için vergi numarası/TCKN tutan form state'i
  - `setTaxNumber` — taxNumber state'ini güncelleyen setter
  - `taxOffice` — Tüm profiller için vergi dairesi bilgisini tutan form state'i
  - `setTaxOffice` — taxOffice state'ini güncelleyen setter
  - `city` — Adres için il bilgisini tutan form state'i
  - `setCity` — city state'ini güncelleyen setter
  - `district` — Adres için ilçe bilgisini tutan form state'i
  - `setDistrict` — district state'ini güncelleyen setter
  - `addressLine` — Detaylı adres bilgisini tutan form state'i
  - `setAddressLine` — addressLine state'ini güncelleyen setter
  - `isDefault` — Profili varsayılan yapma durumunu tutan boolean form state'i
  - `setIsDefault` — isDefault state'ini güncelleyen setter
  - `load` — Sunucudan fatura profillerini yükleyen async yardımcı fonksiyon
  - `resetForm` — Form alanlarını varsayılan değerlerine sıfırlayan yardımcı fonksiyon
  - `startEdit` — Mevcut profili düzenleme moduna alan fonksiyon
  - `handleSubmit` — Form gönderimlerini işleyen ana form işleyici fonksiyonu
  - `handleDelete` — Profil silme işlemlerini yöneten fonksiyon
  - `handleMakeDefault` — Profili varsayılan yapma işlemlerini yöneten fonksiyon
- **Dönüş**: React JSX elementi, fatura profili yönetim sayfası olarak render edilir

### [N2_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` — Yükleme durumunu açan ana bileşen state setter'ı
  - `listInvoiceProfiles` — Sunucudan tüm fatura profillerini çeken API çağrısı
  - `data` — API'den dönen ham profil verisini tutan değişken
  - `setItems` — Yüklenen profilleri ana bileşenin items state'ine kaydeden setter
  - `e` — Hata yakalama bloğunda tutulan hata nesnesi
  - `console.error` — Hatayı geliştirici konsoluna yazdıran metod
  - `toast.error` — Kullanıcıya yüklenememe hatası bildirimi gösteren toast metodu
  - `setLoading` — İşlem sonunda yükleme durumunu kapatan setter, finally bloğunda kullanılır
- **Dönüş**: void

### [N3_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::resetForm
- **params**: (parametre yok)
- **ic_degiskenler**: Tüm form state'lerini sıfırlamak için erişilen ana bileşenin tüm setter fonksiyonları
- **Dönüş**: void, tüm form alanlarını varsayılan değerlerine sıfırlar

### [N4_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::startEdit
- **params**: p: InvoiceProfile (Düzenlenecek fatura profili nesnesi)
- **ic_degiskenler**:
  - `p.id` — Düzenlenen profilin benzersiz kimliği
  - `p.profile_type` — Düzenlenen profilin türü
  - `p.first_name` — Düzenlenen bireysel profilin adı
  - `p.last_name` — Düzenlenen bireysel profilin soyadı
  - `p.company_name` — Düzenlenen kurumsal profilin firma ünvanı
  - `p.tax_number` — Düzenlenen profilin vergi numarası
  - `p.tax_office` — Düzenlenen profilin vergi dairesi
  - `p.city` — Düzenlenen profilin il değeri
  - `p.district` — Düzenlenen profilin ilçe değeri
  - `p.address_line` — Düzenlenen profilin detaylı adresi
  - `p.is_default` — Düzenlenen profilin varsayılan olma durumu
  - `window.scrollTo` — Düzenleme başladığında sayfayı en üne kaydıran tarayıcı metodu
- **Dönüş**: void, formu seçilen profilin verileriyle doldurur, düzenleme modunu aktifleştirir

### [N5_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleSubmit
- **params**: e: React.FormEvent (Form gönderim olay nesnesi)
- **ic_degiskenler**:
  - `e.preventDefault` — Formun varsayılan sayfa yenileme davranışını engelleyen metod
  - `addressLine, city, district, taxNumber` — Zorunlu alan kontrollerinde kullanılan form değerleri
  - `toast.error` — Eksik alan veya işlem hatası durumunda kullanıcıya bildirim gösteren metod
  - `setSaving` — Kayıt durumunu aktifleştiren setter
  - `user` — Gönderilen profili kullanıcıya bağlamak için kullanılan oturumdaki kullanıcı nesnesi
  - `payload` — API'ye gönderilecek tüm profil verilerini içeren nesne
  - `editingId` — Mevcut profili güncellemek veya yeni profil oluşturmak kararı için kullanılan değer
  - `updateInvoiceProfile` — Mevcut profili sunucuda güncelleyen API çağrısı
  - `createInvoiceProfile` — Yeni profil sunucuda oluşturan API çağrısı
  - `toast.success` — Başarılı işlem sonrası kullanıcıya bildirim gösteren metod
  - `resetForm` — İşlem başarılı olursa formu sıfırlayan fonksiyon
  - `load` — Güncel profilleri yeniden yükleyen fonksiyon
  - `setSaving` — İşlem sonunda kayıt durumunu devre dışı bırakan setter
- **Dönüş**: void

### [N6_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleDelete
- **params**: id: string (Silinecek profilin benzersiz kimliği)
- **ic_degiskenler**:
  - `confirm` — Kullanıcıdan silme onayı alan tarayıcı onay penceresi metodu
  - `deleteInvoiceProfile` — Profili sunucudan silen API çağrısı
  - `toast.success` — Başarılı silme sonrası kullanıcıya bildirim gösteren metod
  - `load` — Silme sonrası güncel profilleri yeniden yükleyen fonksiyon
  - `e` — Yakalanan hata nesnesi
  - `console.error` — Hatayı konsola yazdıran metod
  - `toast.error` — Silme hatası durumunda kullanıcıya bildirim gösteren metod
- **Dönüş**: void

### [N7_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::handleMakeDefault
- **params**: id: string (Varsayılan yapılacak profilin benzersiz kimliği)
- **ic_degiskenler**:
  - `setDefaultInvoiceProfile` — Profili sunucuda varsayılan olarak ayarlayan API çağrısı
  - `toast.success` — Başarılı işlem sonrası kullanıcıya bildirim gösteren metod
  - `load` — İşlem sonrası güncel profilleri yeniden yükleyen fonksiyon
  - `e` — Yakalanan hata nesnesi
  - `console.error` — Hatayı konsola yazdıran metod
  - `toast.error` — İşlem hatası durumunda kullanıcıya bildirim gösteren metod
- **Dönüş**: void

### [N8_NASIL] AST Pointer: src/views/account/AccountInvoicesPage.tsx::items.map render fonksiyonu
- **params**: p: InvoiceProfile (Listelenecek tekil fatura profili nesnesi)
- **ic_degiskenler**:
  - `p.id` — React listesi için benzersiz anahtar olarak kullanılan profil kimliği
  - `p.profile_type` — Profilin türüne göre UI ikonunu ve stilini belirleyen değer
  - `startEdit` — Düzenle butonuna tıklandığında çağrılan profili düzenleme moduna alan fonksiyon
  - `handleDelete` — Sil butonuna tıklandığında çağrılan profili silen fonksiyon
  - `p.first_name, p.last_name, p.company_name` — Kart başlığında gösterilen profil başlık verileri
  - `p.tax_office, p.tax_number` — Kart üzerinde gösterilen vergi bilgileri
  - `p.address_line, p.district, p.city` — Kart üzerinde gösterilen adres bilgileri
  - `p.is_default` — Profilin varsayılan olup olmadığını belirten değer, kart üzerindeki etiketi/butonu gösterir
  - `handleMakeDefault` — Varsayılan yap butonuna tıklandığında çağrılan profili varsayılan yapan fonksiyon
- **Dönüş**: React JSX elementi, tek fatura profili kartı olarak render edilir

---

## NODE ID STANDARD

  file: src\views\account\AccountInvoicesPage.tsx
  function: src\views\account\AccountInvoicesPage.tsx::AccountInvoicesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountInvoicesPage