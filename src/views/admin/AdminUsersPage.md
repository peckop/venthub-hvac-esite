---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx
skeleton_hash: b883fa0f48e920fc
entity_hashes:
  func:AdminUsersPage: ee013d03ee079db2
  overview: fb63d83e453e8f9f
  style_tokens: 8daaaf9992883c4d
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış
AdminUsersPage, VentHub HVAC yönetici panelinin kullanıcı yönetimi sayfasını oluşturan ana React bileşenidir. Yetkili yöneticilerin platformdaki tüm kullanıcı hesaplarını görüntülemesini, filtrelemesini ve temel bilgilerini düzenleyebilmesini sağlayan merkezi bir bileşendir.

## Fonksiyon Grupları
### Sayfa Bileşeni
Kullanıcı yönetimi arayüzünü, veri akışını ve yöneticiye özgü işlevsellikleri tek bir bileşen altında toplar.
- AdminUsersPage

---

## AXIOMS – Mimari Varsayımlar

AdminUsersPage, parametresiz bir React bileşeni olup, kullanıcı yönetimi sayfasını render eder.

[Aksiyom 1]: Eğer kullanıcı verilerini çeken API servisi (örn: kullanıcı listesi endpoint'i) yoksa, sayfa kullanıcıları gösteremez ve boş/hata durumu oluşur.

[Aksiyom 2]: Eğer mevcut kullanıcının admin yetkisi doğrulanamıyorsa, sayfa erişimi reddedilmeli veya yönetici olmayan kullanıcılar veri göremez.

[Aksiyom 3]: Eğer rol değiştirme işlemini işleyen backend endpoint'i yoksa, yönetici kullanıcıların rollerini güncelleme istekleri başarısız olur.

[Aksiyom 4]: Eğer filtreleme için gerekli kullanıcı alanları (rol, e-posta, durum vb.) API yanıtında dönmüyorsa, filtreleme işlevselliği çalışmaz.

[Aksiyom 5]: Eğer kullanıcı listesi verisi boş dönerse veya API çağrısı hata verirse, sayfa uygun hata/bos durum mesajını göstermelidir.

---

## FONKSİYON DETAYLARI

### AdminUsersPage
**Ne yapar**: Admin panelinde kullanıcı yönetimi sayfasını oluşturur. Admin kullanıcılarını ve tüm sisteme kayıtlı kullanıcıları listeler, rol değiştirme işlemlerini yönetir, arama ve filtreleme imkanı sağlar.

**Nasıl yapar**: useAuth hook'uyla oturum bilgisini, useRole hook'uyla yetki seviyesini alır. Sayfa yüklenirken admin olmayan kullanıcıları login sayfasına yönlendirir. Aktif sekmeye göre (adminler veya tüm kullanıcılar) ilgili veriyi Supabase'den çeker. Kullanıcı profilleri tablosundan veri alırken manuel join ile tam isim bilgisini zenginleştirir. Rol değiştirme işlemlerinde audit log kaydı oluşturarak değişiklikleri izlenebilir hale getirir. LocalStorage aracılığıyla sütun görünürlüğü ve yoğunluk ayarlarını kalıcı olarak saklar.

**Parametreler**: Parametre almaz (React functional component).

**Dönüş**: JSX element döndürür — Kullanıcı yönetimi arayüzü veya erişim engellendi uyarı sayfası.

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

### [N1_NASIL] AST Pointer: AdminUsersPage::setIsAdminCallback
- **params**: () (parametre yok)
- **ic_degiskenler**:
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: AdminUsersPage::redirectIfNotAuthenticated
- **params**: () (parametre yok)
- **ic_degiskenler**:
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: AdminUsersPage::loadAdminUsersEffect
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `loadAdminUsers` — async fonksiyon, admin kullanıcılarını sunucudan yükler ve state'i günceller
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: AdminUsersPage::loadAdminUsers
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `data` — `listAdminUsers()` çağrısından dönen admin kullanıcı listesi
  - `profiles` — `supabase.from('user_profiles').select(...)` sorgusundan dönen profil verileri
  - `enrichedAdmins` — `data` ve `profiles` birleştirilerek oluşturulan genişletilmiş admin listesi
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: AdminUsersPage::mapAdminUser
- **params**: `u` — tek bir admin kullanıcı nesnesi
- **ic_degiskenler**:
- **Dönüş**: `{ ...u, full_name: ... }` — orijinal kullanıcı nesnesine `full_name` alanı eklenmiş yeni nesne

### [N6_NASIL] AST Pointer: AdminUsersPage::loadAllUsersEffect
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `loadAllUsers` — async fonksiyon, tüm kullanıcıları `user_profiles` tablosundan yükler
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: AdminUsersPage::loadAllUsers
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `profiles` — `supabase.from('user_profiles').select(...)` sorgusundan dönen tüm kullanıcı profilleri
  - `profileError` — supabase sorgusu sırasında oluşabilecek hata nesnesi
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: AdminUsersPage::handleRoleChange
- **params**: `userId` (string), `newRole` ('user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer')
- **ic_degiskenler**:
  - `success` — `setUserAdminRole()` çağrısının başarılı olup olmadığını belirten boolean
  - `logAdminAction` — dinamik import ile yüklenen audit log kayıt fonksiyonu
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: AdminUsersPage::updateAllUsersState
- **params**: `prev` — önceki tüm kullanıcılar state dizisi
- **ic_degiskenler**:
- **Dönüş**: `prev.map(u => ...)` — userId eşleşen kullanıcının rolü güncellenmiş yeni dizi

### [N10_NASIL] AST Pointer: AdminUsersPage::filterUsersByEmailOrName
- **params**: `user` — filtreleme yapılacak kullanıcı nesnesi
- **ic_degiskenler**:
- **Dönüş**: boolean — kullanıcının email veya full_name alanlarında searchQuery ile eşleşme durumu

### [N11_NASIL] AST Pointer: AdminUsersPage::getRoleIcon
- **params**: `roleCode` (string)
- **ic_degiskenler**:
- **Dönüş**: React elementi (JSX) — role göre icon bileşeni

### [N12_NASIL] AST Pointer: AdminUsersPage::loadLocalStoragePreferences
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `c` — localStorage'dan okunan sutun gorunurluk ayarları (JSON string)
  - `d` — localStorage'dan okunan yoğunluk ayarı (string: 'compact' veya 'comfortable')
- **Dönüş**: yok

### [N13_NASIL] AST Pointer: AdminUsersPage::saveColumnsToLocalStorage
- **params**: () (parametre yok)
- **ic_degiskenler**:
- **Dönüş**: yok

### [N14_NASIL] AST Pointer: AdminUsersPage::saveDensityToLocalStorage
- **params**: () (parametre yok)
- **ic_degiskenler**:
- **Dönüş**: yok

### [N15_NASIL] AST Pointer: AdminUsersPage::UserAvatar
- **params**: `name` (string, opsiyonel), `email` (string, opsiyonel)
- **ic_degiskenler**:
  - `initial` — name veya email'in ilk karakteri, büyük harfe çevrilmiş
- **Dönüş**: React elementi (JSX) — avatar bileşeni

### [N16_NASIL] AST Pointer: AdminUsersPage::renderUserRow
- **params**: `userItem` — tek bir kullanıcı nesnesi (AllUser tipinde)
- **ic_degiskenler**:
- **Dönüş**: React elementi (JSX) — tablo satırı `<tr>`

---

## NODE ID STANDARD

  file: src\views\admin\AdminUsersPage.tsx
  function: src\views\admin\AdminUsersPage.tsx::AdminUsersPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminUsersPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-lg`, `rounded-hvac-xl`, `shadow-glow-md`, `tracking-hvac-normal`, `tracking-hvac-snug`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-cyan-400/5`, `bg-gradient-to-br`, `bg-red-500/10`, `bg-white/5`, `border-red-500/20`, `border-white/10`, `border-white/5`, `from-white/10`, `group-hover:bg-cyan-400/10`, `group-hover:border-cyan-400/30`, `group-hover:text-cyan-400`, `hover:bg-amber-500/10`, `hover:bg-blue-400/10`, `hover:bg-emerald-400/10`
- **Layout:** `absolute`, `custom-scrollbar`, `flex`, `flex-1`, `flex-col`, `from-white/10`, `gap-2`, `gap-3`, `gap-4`, `gap-8`, `grid`, `grid-cols-1`, `h-10`, `h-16`, `h-8`
- **Varyant/Responsive:** `:`, `active:`, `group-hover/item:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${activeTab`, `${adminTableCellClass`, `${adminTableHeadCellClass`, `${cellPad`, `${headPad`, `-mr-48`, `-mt-48`, `:`, `===`, `active:scale-95`, `admins`, `all`, `blur-120`, `border`, `divide-white/5`