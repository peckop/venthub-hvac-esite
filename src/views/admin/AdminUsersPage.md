---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx
skeleton_hash: 348e12a8da4fe548
generated_at: 2026-05-23T22:38:49Z
---

## Genel Bakış
Bu modül, VentHub HVAC sisteminin yönetici panelinde yer alan kullanıcı yönetimi sayfasını oluşturan React bileşenini barındırır. Sistemin yetkili yöneticilerinin platformdaki tüm kullanıcı hesaplarını görüntülemesi ve yönetmesi için gereken arayüzün temel yapısını sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Yönetici kullanıcılar sayfasının tüm işlevselliğini tek bir çatıda toplayan, sayfanın renderlanmasından ve temel iş akışından sorumlu ana bileşendir. Yönetici arayüzünün kullanıcı yönetimi bölümünün sorunsuz şekilde çalışmasını sağlar.
- AdminUsersPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC sisteminin yönetici paneli kullanıcı yönetimi sayfası React TypeScript bileşenidir, çalışması için geçerli yönetici oturumu doğrulaması, desteklenen frontend runtime ortamı, bağımlı arayüz bileşenleri, backend API erişimi ve doğru ağ yapılandırmaları zorunludur.

[Aksiyom 1]: Eğer bu sayfaya erişen kullanıcının yönetici rolüne sahip olduğunu doğrulayan oturum kontrol mekanizması yoksa, yetkisiz kullanıcıların kullanıcı yönetimi işlemlerine erişmesi sağlanır, sistem güvenliği tamamen ihlal edilir.
[Aksiyom 2]: Eğer modülün çalıştığı ortamda React hook'larını destekleyen TypeScript frontend runtime ortamı yoksa, AdminUsersPage bileşeni hiçbir şekilde render edilemez, kullanıcıya boş veya hatarlı bir arayüz gösterilir.
[Aksiyom 3]: Eğer yönetici panelinin ortak kullanılan bağımlı arayüz bileşenleri (yan menü, üst gezinme çubuğu, kullanıcı listeleme tablosu vb.) bu modül tarafından erişilebilir durumda değilse, sayfa tam olarak yüklenemez, kullanıcı arayüzü işlevsiz ve bozuk görünür.
[Aksiyom 4]: Eğer bu modülün kullanıcı listeleme, düzenleme, silme gibi işlemler için ihtiyaç duyduğu backend API'lerine ağ erişimi yoksa, tüm kullanıcı yönetimi işlevleri devre dışı kalır, hiçbir işlem başarılı olmaz.
[Aksiyom 5]: Eğer bu modülün çalıştığı ortamda CORS, erişim izinleri gibi ağ güvenliği yapılandırmaları doğru ayarlanmamışsa, tarayıcı tarafından kaynaklara erişim engellenir, sayfa hiç yüklenemez veya içerik gösterilemez.

---

## FONKSIYON DETAYLARI

### AdminUsersPage
**Ne yapar**: VentHub HVAC projesinin admin paneli bünyesinde yer alan kullanıcı yönetimi sayfasını oluşturan React bileşenidir. Sadece yetkili yönetici kullanıcıların erişebildiği, platformdaki tüm kullanıcıların yönetim işlemlerini gerçekleştireceği arayüzü sunan ana yönetim sayfası bileşenidir.
**Nasıl yapar**: Projenin kaynak kod yapısında `src\views\admin` dizini altında konumlanmış TSX dosyası olarak çalışır, projenin genel domain kapsamında yönetim paneli işlevlerini destekleyen bir sayfa bileşeni olarak projenin rota sistemi üzerinden çağrılarak kullanıma sunulur.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: Dönüş tipi açıkça tanımlanmamıştır, void veya bilinmeyen bir dönüş tipi olarak belirtilmiştir. Bir React sayfa bileşeni olarak çalışması nedeniyle, ekrana render edilmek üzere uygun arayüz çıktısı üretmesi beklenir.

---

## INTERFACES

### AdminUser
- `id: string`
- `email: string`
- `full_name?: string | null`
- `phone?: string | null`
- `role: string`
- `created_at: string`
- `updated_at: string`

### AllUser
- `id: string`
- `email: string`
- `full_name?: string | null`
- `created_at: string`
- `role?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_isAdminDurumuAyarla
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setIsAdmin` — Kullanıcının admin olup olmadığını state'e kaydetmek için kullanılan React state setter fonksiyonu
  - `role` — Kullanıcının mevcut sistem rolünü tutan değişken, super_admin veya admin olup olmadığını kontrol etmek için kullanılır
- **Dönüş**: yok

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_oturumKontroluYap
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loading` - Kullanıcı verisi yükleme durumunu tutan state değişkeni
  - `user` - Oturum açmış mevcut kullanıcı nesnesi
  - `router` - Next.js yönlendirme işlemleri için kullanılan router nesnesi
  - `Routes.auth.login` - Giriş sayfası rotasını oluşturan fonksiyon, parametre olarak dönüş adresi alır
- **Dönüş**: Kullanıcı yoksa erken return, aksi takdirde yok

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_loadAdminUsersCagir
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loadAdminUsers` - İçeride tanımlanan admin kullanıcıları yükleyen async fonksiyon
  - `isAdmin` - Mevcut kullanıcının admin yetkisi olup olmadığını tutan state değişkeni
  - `user` - Oturum açmış mevcut kullanıcı nesnesi
  - `setIsLoading` - Yükleme durumunu state'e kaydeden state setter
  - `listAdminUsers` - Admin kullanıcı listesini getiren API fonksiyonu
  - `supabase` - Supabase veritabanı istemcisi
  - `setAdminUsers` - Yüklenen admin kullanıcı listesini state'e kaydeden state setter
  - `console.error` - Hata mesajlarını konsola yazan fonksiyon
  - `toast.error` - Hata bildirimi gösteren toast fonksiyonu
  - `_t` - Çeviri işlemi için kullanılan i18n fonksiyonu
- **Dönüş**: Koşullar sağlanmazsa erken return, aksi takdirde yok

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::loadAdminUsers
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isAdmin` - Mevcut kullanıcının admin yetkisi olup olmadığını tutan state değişkeni
  - `user` - Oturum açmış mevcut kullanıcı nesnesi
  - `setIsLoading` - Yükleme durumunu state'e kaydeden state setter
  - `listAdminUsers` - Admin kullanıcı listesini getiren API fonksiyonu
  - `supabase` - Supabase veritabanı istemcisi, user_profiles tablosundan veri çekmek için kullanılır
  - `setAdminUsers` - Zenginleştirilmiş admin kullanıcı listesini state'e kaydeden state setter
  - `console.error` - Hata mesajlarını konsola yazan fonksiyon
  - `toast.error` - Hata bildirimi gösteren toast fonksiyonu
  - `_t` - Çeviri işlemi için kullanılan i18n fonksiyonu
- **Dönüş**: Koşullar sağlanmazsa erken return, aksi takdirde yok

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_adminKullaniciZenginlestir
- **params**: `u` - İşlenen orijinal admin kullanıcı nesnesi
- **ic_degiskenler**:
  - `u` - Üzerinde işlem yapılan orijinal kullanıcı nesnesi
  - `profiles` - user_profiles tablosundan çekilen tüm profil verileri listesi
- **Dönüş**: full_name alanı eklenmiş/güncellenmiş yeni kullanıcı nesnesi

---

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_loadAllUsersCagir
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loadAllUsers` - İçeride tanımlanan tüm kullanıcıları yükleyen async fonksiyon
  - `isAdmin` - Mevcut kullanıcının admin yetkisi olup olmadığını tutan state değişkeni
  - `user` - Oturum açmış mevcut kullanıcı nesnesi
  - `activeTab` - Sekme durumunu tutan değişken, sadece 'all' sekmesindeyse çalışır
  - `setIsLoading` - Yükleme durumunu state'e kaydeden state setter
  - `ensureSessionFresh` - Oturumun geçerliliğini kontrol eden fonksiyon
  - `supabase` - Supabase veritabanı istemcisi
  - `setAllUsers` - Yüklenen tüm kullanıcı listesini state'e kaydeden state setter
  - `console.error` - Hata mesajlarını konsola yazan fonksiyon
  - `toast.error` - Hata bildirimi gösteren toast fonksiyonu
  - `_t` - Çeviri işlemi için kullanılan i18n fonksiyonu
- **Dönüş**: Koşullar sağlanmazsa erken return, aksi takdirde yok

---

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::loadAllUsers
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isAdmin` - Mevcut kullanıcının admin yetkisi olup olmadığını tutan state değişkeni
  - `user` - Oturum açmış mevcut kullanıcı nesnesi
  - `activeTab` - Sekme durumunu tutan değişken, sadece 'all' sekmesindeyse çalışır
  - `setIsLoading` - Yükleme durumunu state'e kaydeden state setter
  - `ensureSessionFresh` - Oturumun geçerliliğini kontrol eden fonksiyon
  - `supabase` - Supabase veritabanı istemcisi, user_profiles tablosundan tüm kullanıcıları çeker
  - `setAllUsers` - Yüklenen tüm kullanıcı listesini state'e kaydeden state setter
  - `profileError` - Veritabanı sorgusu sırasında oluşan hata nesnesi
  - `console.error` - Hata mesajlarını konsola yazan fonksiyon
  - `toast.error` - Hata bildirimi gösteren toast fonksiyonu
  - `_t` - Çeviri işlemi için kullanılan i18n fonksiyonu
- **Dönüş**: Koşullar sağlanmazsa erken return, aksi takdirde yok

---

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_rolGuncelle
- **params**: `userId: string`, `newRole: 'user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer'`
- **ic_degiskenler**:
  - `hasWriteAccess` - Kullanıcının rol değiştirme yetkisi olup olmadığını tutan değişken
  - `toast.error` - Hata bildirimi gösteren toast fonksiyonu
  - `_t` - Çeviri işlemi için kullanılan i18n fonksiyonu
  - `setUpdatingRole` - Rol güncelleme işleminin hangi kullanıcı için yapıldığını state'e kaydeden setter
  - `setUserAdminRole` - Kullanıcının rolünü veritabanında güncelleyen API fonksiyonu
  - `logAdminAction` - Dinamik import edilen denetim kaydı oluşturan fonksiyon
  - `supabase` - Supabase veritabanı istemcisi, denetim kaydı için kullanılır
  - `allUsers` - Tüm kullanıcıları tutan state listesi, eski rolünü almak için kullanılır
  - `toast.success` - Başarı bildirimi gösteren toast fonksiyonu
  - `setAllUsers` - Yerel kullanıcı listesini güncellemek için kullanılan state setter
  - `listAdminUsers` - Güncel admin listesini yeniden yüklemek için kullanılan API fonksiyonu
  - `setAdminUsers` - Yeni admin listesini state'e kaydeden setter
  - `console.error` - Hata mesajlarını konsola yazan fonksiyon
- **Dönüş**: Yetki yoksa erken return, aksi takdirde yok

---

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_rolGuncelleMapCallback
- **params**: `prev` - Önceki tüm kullanıcı listesi state'i
- **ic_degiskenler**:
  - `prev` - Güncelleme öncesi mevcut kullanıcı listesi
  - `u` - Üzerinde işlem yapılan tekil kullanıcı nesnesi
  - `userId` - Rolü güncellenecek kullanıcının ID'si
  - `newRole` - Kullanıcıya atanacak yeni rol
- **Dönüş**: Güncellenmiş kullanıcı listesi

---

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_aramaFiltresi1
- **params**: `user` - Filtrelenecek kullanıcı nesnesi
- **ic_degiskenler**:
  - `user` - Üzerinde arama yapılan kullanıcı nesnesi
  - `searchQuery` - Kullanıcının girdiği arama metni
- **Dönüş**: Arama kriterlerine uyan kullanıcılar için true, aksi takdirde false

---

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_aramaFiltresi2
- **params**: `user` - Filtrelenecek kullanıcı nesnesi
- **ic_degiskenler**:
  - `user` - Üzerinde arama yapılan kullanıcı nesnesi
  - `searchQuery` - Kullanıcının girdiği arama metni
- **Dönüş**: Arama kriterlerine uyan kullanıcılar için true, aksi takdirde false

---

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::getRoleIcon
- **params**: `roleCode: string` - Rolün kod adı
- **ic_degiskenler**:
  - `roleCode` - Karşılığı gelen ikonun seçileceği rol kodu
  - `Crown` - super_admin rolü için kullanılan lucide ikonu
  - `Shield` - admin rolü için kullanılan lucide ikonu
  - `ShieldCheck` - warehouse/sales rolleri için kullanılan lucide ikonu
  - `Users` - varsayılan kullanıcı rolü için kullanılan lucide ikonu
- **Dönüş: Rol koduna göre React element olarak ikon bileşeni

---

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_yerelDepolamaAyarlariniYukle
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `STORAGE_KEY` - Yerel depolama anahtarlarını oluşturmak için kullanılan sabit anahtar
  - `localStorage.getItem` - Tarayıcı yerel deposundan veri çeken fonksiyon
  - `setVisibleCols` - Görünür tablo sütunlarını state'e kaydeden setter
  - `setDensity` - Tablo yoğunluğunu state'e kaydeden setter
- **Dönüş**: yok, hata durumunda catch bloğunda sonlanır

---

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_sutunAyarlariniKaydet
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `STORAGE_KEY` - Yerel depolama anahtarını oluşturmak için kullanılan sabit anahtar
  - `visibleCols` - Mevcut görünür sütun ayarları
  - `localStorage.setItem` - Tarayıcı yerel deposuna veri kaydeden fonksiyon
- **Dönüş**: yok, hata durumunda catch bloğunda sonlanır

---

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_yoğunlukAyariniKaydet
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `STORAGE_KEY` - Yerel depolama anahtarını oluşturmak için kullanılan sabit anahtar
  - `density` - Mevcut tablo yoğunluğu ayarı
  - `localStorage.setItem` - Tarayıcı yerel deposuna veri kaydeden fonksiyon
- **Dönüş**: yok, hata durumunda catch bloğunda sonlanır

---

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::UserAvatar
- **params**: `{ name?: string, email?: string }` - Kullanıcının adı ve e-posta adresi
- **ic_degiskenler**:
  - `name` - Kullanıcının tam adı
  - `email` - Kullanıcının e-posta adresi
  - `initial` - Avatar üzerinde gösterilecek ilk harf, name/email'den alınır
- **Dönüş**: Kullanıcı avatarı olarak render edilen React elementi

---

### [N17_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx::anonim_kullaniciSatiriRender
- **params**: `userItem` - Render edilecek tekil kullanıcı nesnesi
- **ic_degiskenler**:
  - `userItem` - Üzerinde işlem yapılan ve render edilen kullanıcı nesnesi
  - `userItem.id` - Kullanıcının benzersiz ID'si, anahtar olarak kullanılır
  - `visibleCols` - Hangi sütunların gösterileceğini tutan state nesnesi
  - `adminTableCellClass` - Tablo hücreleri için ortak CSS sınıfı
  - `cellPad` - Hücre içi dolgu için CSS sınıfı
  - `UserAvatar` - Kullanıcı avatarını render eden bileşen
  - `getRoleIcon` - Rol koduna göre ikon döndüren fonksiyon
  - `_t` - Çeviri işlemi için kullanılan i18n fonksiyonu
  - `formatDate` - Tarih formatlama fonksiyonu
  - `lang` - Mevcut dil kodu
  - `handleRoleChange` - Kullanıcının rolünü değiştirmek için tetiklenen fonksiyon
  - `updatingRole` - Şu anda rolü güncellenen kullanıcının ID'si
  - `hasWriteAccess` - Mevcut kullanıcının rol değiştirme yetkisi olup olmadığı
  - `role` - Mevcut kullanıcının rolü
  - `Crown` / `Shield` / `Package` / `Tag` / `Eye` / `Users` - İşlem butonlarında kullanılan lucide ikonları
- **Dönüş**: Kullanıcı satırı olarak render edilen HTML tr elementi

---

## NODE ID STANDARD

  file: src\views\admin\AdminUsersPage.tsx
  function: src\views\admin\AdminUsersPage.tsx::AdminUsersPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminUsersPage