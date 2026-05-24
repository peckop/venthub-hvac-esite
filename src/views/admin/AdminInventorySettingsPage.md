---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventorySettingsPage.tsx
skeleton_hash: 46f3ae0b5676adff
generated_at: 2026-05-23T22:37:35Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin yönetici panelinde yer alan envanter ayarları yönetim sayfasını oluşturan React bileşenidir. Sistem yöneticilerinin platformun envanter yönetimine ait genel ayarları düzenlemesi ve değişikliklerini kalıcı hale getirmesi için gerekli tüm ön yüz ve arka plan işlevselliğini sunar. Tüm ayar kaydetme işlemlerini merkezi olarak yöneterek değişikliklerin güvenli bir şekilde sunucuya iletilmesini sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Envanter ayarları sayfasının ana giriş noktasıdır, arayüzü oluşturur ve sayfanın tüm temel çalışma altyapısını yönetir.
- AdminInventorySettingsPage

### Ayar Kaydetme İşlemleri
Kullanıcı tarafından yapılan ayar değişikliklerini işleyerek sunucuda kalıcı hale getirmekten sorumlu fonksiyonlardır. Ana kaydetme akışı, özel genel ayarlar kaydetme işlemini tetikleyerek çalışır.
- save, saveGeneralSettings

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinin admin paneline ait envanter ayarlarını görüntüleme, düzenleme ve kalıcılaştırma işlemlerini gerçekleştiren ön yüz React bileşenidir, doğru çalışması için ana uygulama altyapısının ve bağlı servislerin bütünlüğü zorunludur.

[Aksiyom 1]: Eğer projenin React çalışma ortamı ve ana uygulama altyapısı bu bileşeni yükleyemeyecek durumdaysa, AdminInventorySettingsPage bileşeni hiç render edilemez, kullanıcı ayarlar sayfasına erişemez.
[Aksiyom 2]: Eğer bileşeni kullanan admin kullanıcısının envanter ayarlarını düzenleme izni veya geçerli yetkilendirme kimliği yoksa, save() ve saveGeneralSettings() kaydetme fonksiyonları çalışmaz, yapılan değişiklikler kaydedilemez.
[Aksiyom 3]: Eğer envanter ayarlarını kaydetmek için iletişim kurulan arka uç API uç noktası erişilemez veya çalışmıyorsa, save() ve saveGeneralSettings() fonksiyonları hata fırlatır, kullanıcı değişiklikleri kalıcılaştıramaz.
[Aksiyom 4]: Eğer ana uygulamanın global state yönetim mekanizması mevcut envanter ayarları verisini bu bileşene iletmezse, sayfa mevcut konfigürasyonu görüntüleyemez, kullanıcı güncel ayarları göremez.
[Aksiyom 5]: Eğer bileşene iletilmesi gereken zorunlu giriş verileri (prop'lar) eksik kalırsa, AdminInventorySettingsPage bileşeni hatalı render edilir veya tamamen çöker.
[Aksiyom 6]: Eğer kaydetme işlemlerinin sonucunu kullanıcıya bildiren işlem sonucu bildirim mekanizması entegre edilmemişse, kullanıcı save() veya saveGeneralSettings() fonksiyonlarının başarılı olup olmadığını öğrenemez.

---

## FONKSIYON DETAYLARI

### AdminInventorySettingsPage
**Ne yapar**: VentHub HVAC projesinin admin paneli bünyesinde yer alan envanter ayarları sayfasının ana React bileşenidir. Yönetici kullanıcıların sistemdeki envanter kaynaklarına ilişkin tüm ayarları görüntülemesi, düzenlemesi ve kalıcı olarak kaydetmesi için gereken kullanıcı arayüzü yapısını sunar. Sadece yetkili yönetici hesaplarının erişebildiği bir rota altında yüklenen, sayfanın temel bileşeni olarak görev alır.
**Nasıl yapar**: React.FC tipinde tanımlanmış olan bu bileşen, içerdiği form yapıları, alt bileşenler ve kaydetme işlevlerini bünyesinde barındırarak kullanıcı etkileşimlerini yönetir. Proje içindeki admin rotalarına ait olarak çalışır, kendi durumu (state) üzerinde kullanıcının formda yaptığı değişiklikleri tutar ve içindeki save, saveGeneralSettings gibi fonksiyonlar aracılığıyla bu değişiklikleri işler.
**Parametreler**:
- Herhangi bir giriş parametresi almaz, tanımında belirtilen herhangi bir dışarıdan aktarılan veri veya prop bulunmamaktadır.
**Dönüş**: React.FC tipi döndürür, bu React fonksiyonel bileşeni DOM ağacına işlenerek yönetici kullanıcının karşısına envanter ayarları sayfasının çıkarılmasını sağlar.

### save
**Ne yapar**: AdminInventorySettingsPage bileşeni bünyesinde tanımlı, kullanıcının envanter ayarları sayfasında yaptığı tüm değişiklikleri topluca kaydetmek için tetiklenen ana kaydetme fonksiyonudur. Kullanıcı arayüzündeki genel kaydetme butonuna tıklandığında çalışarak tüm kategori ayarlarının kaydedilme sürecini koordine eder.
**Nasıl yapar**: Kendi içinde tanımlı olan alt kaydetme fonksiyonlarını sırayla çalıştırarak tüm form verilerinin ayrı ayrı işlenmesini sağlar. Kayıt süreci boyunca oluşabilecek hataları yakalar, başarılı kayıt sonrası kullanıcıya bildirim gösterir ve sayfanın durumunu güncelleyerek kullanıcının yeni ayarları görmesini sağlar.
**Parametreler**:
- Tanımında herhangi bir giriş parametresi belirtilmemiştir, yalnızca ait olduğu AdminInventorySettingsPage bileşeninin dahili durumunda (state) tutulan verileri kullanarak çalışır.
**Dönüş**: Dönüş tipi belirtilmemiştir, herhangi bir değer döndürmeyen void tipinde bir aksiyon fonksiyonudur, yalnızca kayıt işlemlerini yürütmek için tasarlanmıştır.

### saveGeneralSettings
**Ne yapar**: AdminInventorySettingsPage bileşeni içindeki genel envanter ayarları kategorisine ait form verilerini kaydetmekten sorumlu özel kayıt fonksiyonudur. Sadece genel kategorideki ayarların kaydedilmesini hedefler, ana kaydetme sürecinin bir parçası olarak ya da tek başına tetiklenebilir.
**Nasıl yapar**: Bileşenin dahili durumunda tutulan genel ayarlar formundaki tüm giriş değerlerini öncelikle doğrular, doğrulama sürecinden başarıyla geçen verileri ilgili sunucu API uç noktasına gönderir. Gönderim sonrası başarılı veya başarısız durumuna göre kullanıcıya geri bildirim sunar ve sayfanın durumunu güncelleyerek kayıt işleminin tamamlandığını belirtir.
**Parametreler**:
- Tanımında herhangi bir giriş parametresi belirtilmemiştir, yalnızca ait olduğu AdminInventorySettingsPage bileşeninin dahili state verilerini kullanarak çalışır.
**Dönüş**: Dönüş tipi belirtilmemiştir, herhangi bir değer döndürmeyen void tipinde bir kayıt aksiyon fonksiyonudur, yalnızca genel envanter ayarlarının kayıt sürecini yürütmek için tasarlanmıştır.

---

## ENUMS

### LoadState
- `Idle`
- `Loading`
- `Error`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::AdminInventorySettingsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `pathname` — Next.js `usePathname` hook'u ile alınan mevcut sayfa yolu
  - `defaultThreshold` — Varsayılan düşük stok eşiği için tutulan state değeri, sayı veya boş string olabilir
  - `setDefaultThreshold` — `defaultThreshold` state'ini güncelleyen React state setter fonksiyonu
  - `resetAll` — Tüm ürünlere varsayılan stok eşiğini toplu uygulama seçeneği için tutulan boolean state
  - `setResetAll` — `resetAll` state'ini güncelleyen React state setter fonksiyonu
  - `loading` — Sayfa verilerinin yükleme durumunu tutan `LoadState` tipi state
  - `setLoading` — `loading` state'ini güncelleyen React state setter fonksiyonu
  - `saving` — Stok eşik ayarlarının kaydedilme durumunu tutan boolean state
  - `setSaving` — `saving` state'ini güncelleyen React state setter fonksiyonu
  - `savingGeneral` — Genel bildirim ve rezervasyon ayarlarının kaydedilme durumunu tutan boolean state
  - `setSavingGeneral` — `savingGeneral` state'ini güncelleyen React state setter fonksiyonu
  - `error` — Kullanıcıya gösterilecek hata mesajını tutan string state
  - `setError` — `error` state'ini güncelleyen React state setter fonksiyonu
  - `success` — Kullanıcıya gösterilecek başarı mesajını tutan string state
  - `setSuccess` — `success` state'ini güncelleyen React state setter fonksiyonu
  - `alertEmail` — Kritik stok bildirimlerinin gönderileceği e-posta adresini tutan string state
  - `setAlertEmail` — `alertEmail` state'ini güncelleyen React state setter fonksiyonu
  - `alertWebhook` — Anlık stok bildirimleri için kullanılan webhook URL'sini tutan string state
  - `setAlertWebhook` — `alertWebhook` state'ini güncelleyen React state setter fonksiyonu
  - `resTimeout` — Ödemesi tamamlanmayan rezervasyonların otomatik iptal süresini (saat cinsinden) tutan number state
  - `setResTimeout` — `resTimeout` state'ini güncelleyen React state setter fonksiyonu
  - `canWrite` — `useRole` hook'undan alınan, kaynak bazında yazma izni kontrolü yapan fonksiyon
  - `hasWriteAccess` — `inventory_settings` kaynağı için yazma izni olup olmadığını belirten boolean değer
  - `load` — Mevcut envanter ayarlarını Supabase veritabanından yükleyen, `useCallback` ile sarmalanmış async fonksiyon
- **Dönüş**: React.JSX.Element

### [N2_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase'den alınan `inventory_settings` tablosuna ait tüm ayar verileri
  - `error` — Supabase sorgusu sırasında oluşabilecek hata nesnesi
  - `val` — Veritabanından gelen varsayılan düşük stok eşiği değerini, state'e uygun formata dönüştürmek için geçici tutulan değişken
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::save
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `value` — Kullanıcı tarafından girilen varsayılan stok eşiğini, Supabase'e gönderilecek formata dönüştüren geçici değişken
  - `error` — Supabase `update_inventory_thresholds` rpc çağrısı sırasında oluşan hata nesnesi
  - `e` — Catch bloğunda yakalanan genel hata nesnesi
  - `msg` — Kullanıcıya gösterilmek üzere işlenen hata mesajı
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::saveGeneralSettings
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — Supabase `inventory_settings` tablosu update sorgusu sırasında oluşan hata nesnesi
  - `e` — Catch bloğunda yakalanan genel hata nesnesi
  - `msg` — Kullanıcıya gösterilmek üzere işlenen hata mesajı
- **Dönüş**: yok

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    AdminInventorySettingsPage_tsx__AdminInventorySettingsPage["AdminInventorySettingsPage"]
    AdminInventorySettingsPage_tsx__save["save"]
    AdminInventorySettingsPage_tsx__saveGeneralSettings["saveGeneralSettings"]
```

## NODE ID STANDARD

  file: src\views\admin\AdminInventorySettingsPage.tsx
  function: src\views\admin\AdminInventorySettingsPage.tsx::AdminInventorySettingsPage
  function: src\views\admin\AdminInventorySettingsPage.tsx::save
  function: src\views\admin\AdminInventorySettingsPage.tsx::saveGeneralSettings

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminInventorySettingsPage