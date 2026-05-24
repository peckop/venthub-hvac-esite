---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminSettingsPage.tsx
skeleton_hash: 0888f56aa6c1221b
generated_at: 2026-05-23T22:38:03Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yönetici panelinde sistem genelindeki ayarların düzenlenebildiği özel ayarlar sayfasını barındıran React frontend bileşenidir. Sadece yetkili yönetici kullanıcıların erişebileceği bu sayfa, yapılan ayar değişikliklerini kalıcı hale getirmek için gerekli işlevleri içerir ve yöneticiye tüm sistem ayarlarını tek noktadan yönetme imkanı sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Yönetici ayarlar sayfasının tüm arayüz yapısını ve temel çalışma mantığını oluşturur, kullanıcıya düzenlenebilir ayar alanlarını ve sayfa akışını sunar.
- AdminSettingsPage

### Ayar Kayıt İşlevi
Yönetici tarafından güncellenen ayarların asenkron olarak kaydedilmesi sürecini yönetir, sunucu ile iletişimi sağlayarak değişikliklerin kalıcı hale gelmesini sağlar.
- handleSave

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı yönetici ayarları sayfası modülünün sorunsuz çalışması, uygulamanın React çalışma zamanı, yönetici yetkilendirme servisi, ayarları kaydetmek için kullanılan arka uç API'si ve proje içi ortak UI bileşenlerinin tümünün erişilebilir ve çalışır durumda olmasına bağlıdır.

[Aksiyom 1]: Eğer React 16.8+ sürümüne sahip bir bileşen çalışma zamanı ortamı yoksa, AdminSettingsPage bileşeni hiçbir şekilde render edilemez, yönetici ayarlar sayfası yüklenmez.
[Aksiyom 2]: Eğer yönetici kullanıcı yetkilerini doğrulayan bir kimlik/yetkilendirme servisi entegrasyonu yoksa, yetkisiz hesaplar da ayarlar sayfasına erişebilir, sistem güvenliği ihlal edilir.
[Aksiyom 3]: Eğer handleSave fonksiyonunun ayarları kalıcı olarak kaydetmek için çağırdığı arka uç yönetici ayarları API'si erişilebilir değilse, kullanıcı tarafından yapılan ayar değişiklikleri hiçbir şekilde saklanamaz, modülün temel işlevi devre dışı kalır.
[Aksiyom 4]: Eğer proje içinde tanımlanan ortak UI bileşenleri (form inputları, kaydetme butonu, bildirim bileşeni vb.) içe aktarma yollarında mevcut değilse, AdminSettingsPage derleme hatası verir, uygulama yayınlanamaz.
[Aksiyom 5]: Eğer mevcut sistem ayarlarını çeken bir veri yükleme mekanizması entegre edilmemişse, sayfa hiçbir mevcut ayarı görüntüleyemez, kullanıcı düzenleme yapamaz.

---

## FONKSIYON DETAYLARI

### AdminSettingsPage
**Ne yapar**: VentHub HVAC projesinin yönetici paneli bünyesindeki ayarlar sayfasını oluşturan ana React bileşenidir. Tüm yönetici özelinde yapılması gereken sistem ayarlarının görüntülendiği, düzenlendiği ve kalıcı olarak kaydedildiği kullanıcı arayüzünü inşa eder. Yöneticilerin platform ayarlarını yönetmesine olanak tanıyan tek bir bütünleşik sayfa olarak çalışır.
**Nasıl yapar**: React.FC tipinde tanımlanan bileşen, sayfa yüklendiğinde mevcut sistem ayarlarını arka uç API'den çeker, form durumlarını yerel state'te yönetir ve yetkilendirme kontrollerini yaparak sadece yetkili kullanıcıların sayfaya erişmesini sağlar. İçerdiği alt bileşenleri (giriş alanları, form elemanları, aksiyon butonları) bir araya getirerek yönetici ayarları sayfasının DOM ağacını oluşturur ve tarayıcıda render eder.
**Parametreler**:
- Hiçbir dış parametre almaz, projenin yönlendirme (routing) sistemi tarafından doğrudan sayfa bileşeni olarak çağrılır.
**Dönüş**: React.FC tipinde bir React bileşeni döndürür, bu bileşen işlendiğinde yönetici ayarları sayfasının tüm kullanıcı arayüzünü ekrana çizer.

### handleSave
**Ne yapar**: AdminSettingsPage bileşeni içerisinde tanımlanan, yönetici tarafından form üzerinden yapılan tüm ayar değişikliklerinin kaydedilmesi sürecini yöneten tetikleyici fonksiyondur. Kullanıcının kaydetme butonuna tıklaması sonrası çalışarak tüm güncel ayar değerlerini toplayıp kalıcılaştırma işlemlerini başlatır.
**Nasıl yapar**: İlk olarak formdaki tüm giriş alanlarının geçerliliğini kontrol eder, herhangi bir doğrulama hatası varsa kullanıcıya anlaşılır bir uyarı mesajı gösterir. Validasyon süreci başarılı olursa güncel ayar verilerini yapılandırır, arka uç API'ye ilgili istekle gönderir. İsteğin başarılı veya başarısız olma durumuna göre kullanıcıya uygun bildirimler sunar ve sayfa state'ini günceller.
**Parametreler**:
- Hiçbir dış parametre almaz, sadece tanımlandığı AdminSettingsPage bileşeni içindeki yerel state, form verileri ve API servislerine erişerek çalışır.
**Dönüş**: Herhangi bir değer döndürmez, tüm işlemlerini tarafsız olarak gerçekleştirir, sadece kullanıcı arayüzündeki bildirimleri ve sayfa içi state güncellemelerini yönetir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminSettingsPage.tsx::AdminSettingsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `_t` — useI18n hook'undan gelen çeviri fonksiyonu, metinleri çok dilli olarak yüklemek için kullanılır
  - `activeTab` — Hangi ayar sekmesinin aktif olduğunu izleyen state değişkeni, 'general' | 'payment' | 'admins' | 'system' tiplerini alır
  - `setActiveTab` — activeTab state'ini güncellemek için kullanılan state setter fonksiyonu
  - `settings` — useSettings hook'undan gelen genel uygulama ayarları nesnesi, AppSettings tipindedir
  - `loading` — useSettings hook'undan gelen ayarların yüklenme durumunu tutan boolean state
  - `saving` — Ayar kaydetme işleminin aktif olup olmadığını izleyen boolean state değişkeni
  - `saveStatus` — Kaydetme işleminin başarı/hata durumunu ve ilgili mesajı tutan state, null veya {type: 'success' | 'error', message: string} tipindedir
  - `setSaveStatus` — saveStatus state'ini güncelleyen state setter fonksiyonu
  - `formData` — Kullanıcı tarafından düzenlenen ayarların yerel kopyasını tutan state, AppSettings tipindedir
  - `setFormData` — formData state'ini güncelleyen state setter fonksiyonu
  - `React.useEffect` — Ayarlar yüklendiğinde formData state'ini doldurmak için kullanılan yan etki hook'u
  - `handleSave` - Ayarları kaydetme işlemini yöneten async fonksiyon
  - `tabs` - Sayfada görüntülenecek ayar sekmelerinin listesini tutan dizi, her sekme id, label, icon değerleri içerir
- **Dönüş**: React.FC (React bileşeni JSX çıktısı)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminSettingsPage.tsx::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `settings` — useSettings'ten gelen yüklü uygulama ayarları nesnesi
  - `formData` — Henüz doldurulmamış yerel form ayarları state'i
  - `setFormData` — formData state'ini, yüklenen settings değeriyle doldurmak için kullanılan setter
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminSettingsPage.tsx::handleSave
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setSaveStatus` — Kaydetme işleminin durumunu kullanıcıya göstermek için saveStatus state'ini güncelleyen setter
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminSettingsPage.tsx::tabs_map_callback
- **params**: (tab)
- **ic_degiskenler**:
  - `tab.id` — Mevcut iterasyondaki sekmenin benzersiz kimliği, activeTab karşılaştırması için kullanılır
  - `tab.icon` — Sekme başlığında gösterilecek ikon bileşeni
  - `tab.label` — Sekme başlığında gösterilecek çevrilmiş metin
  - `setActiveTab` — Sekmeye tıklandığında aktif sekmeyi değiştirmek için kullanılan state setter
  - `activeTab` — Şu anda aktif olan sekmenin kimliği, sekme stili değiştirmek için karşılaştırılır
- **Dönüş**: JSX button elementi (sekme bileşeni)

---

## NODE ID STANDARD

  file: src\views\admin\AdminSettingsPage.tsx
  function: src\views\admin\AdminSettingsPage.tsx::AdminSettingsPage
  function: src\views\admin\AdminSettingsPage.tsx::handleSave

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminSettingsPage