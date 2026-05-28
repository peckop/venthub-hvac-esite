---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx
skeleton_hash: 348e12a8da4fe548
entity_hashes:
  func:AdminUsersPage: ee013d03ee079db2
  overview: 3fe4b4182e26dc08
  style_tokens: 8daaaf9992883c4d
generated_at: 2026-05-28T22:39:48Z
---

## Genel Bakış
Bu modül, VentHub HVAC sisteminin yönetici panelinde yer alan kullanıcı yönetimi sayfasını oluşturan React bileşenini barındırır. Yöneticilerin platformdaki tüm kullanıcı hesaplarını görüntülemesi, düzenlemesi ve yönetmesi için gereken arayüzün temel yapısını sunar. Sayfa, yetkili yöneticilerin kullanıcı tablosunu filtrelemesi, detay görmesi ve gerekli işlemleri yapabilmesi için gerekli işlevselliği tek bir bileşen altında toplar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Yönetici kullanıcılar sayfasının tüm işlevselliğini tek bir bileşen altında toplayan, sayfanın renderlanmasından ve temel iş akışından sorumlu ana bileşendir. Kullanıcı listeleme arayüzünün yönetici paneli ortamında sorunsuz çalışmasını sağlar.
- `AdminUsersPage`

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Fonksiyon gövdesi verilmediği için mimari varsayımlar üretilememektedir. Aksiyom üretimi için AdminUsersPage bileşeninin implementasyon koduna ihtiyaç vardır.

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

### [N1_NASIL] AST Pointer: AdminUsersPage::roleCheckEffect
- **params**: () — effect callback, parametre yok
- **ic_degiskenler**:
  - `role` — useAuth'tan gelen kullanıcının mevcut rolü, super_admin/admin olup olmadığı kontrol edilir
- **Dönüş**: yok (state setter çağrısı: `setAdminUsers`)

---

### [N2_NASIL] AST Pointer: AdminUsersPage::authRedirectEffect
- **params**: () — effect callback, parametre yok
- **ic_degiskenler**:
  - `loading` — useAuth'tan gelen oturum yükleme durumu
  - `user` — useAuth'tan gelen mevcut kullanıcı nesnesi
- **Dönüş**: yok (yan etki: `router.push` ile login sayfasına yönlendirme)

---

### [N3_NASIL] AST Pointer: AdminUsersPage::loadAdminUsersEffect
- **params**: () — effect callback, parametre yok
- **ic_degiskenler**:
  - `loadAdminUsers` — asenkron iç fonksiyon, admin kullanıcı listesini yükler ve çağrılır
- **Dönüş**: yok (effect side-effect olarak veri çeker)

---

### [N4_NASIL] AST Pointer: AdminUsersPage::loadAdminUsers
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `isAdmin` — kullanıcının admin olup olmadığını belirleyen boolean, true değilse fonksiyon erken döner
  - `user` — mevcut oturum kullanıcısı, null ise fonksiyon erken döner
  - `isLoading` — yükleme durumu flag'i, true yapılarak spinner tetiklenir (`setIsLoading(true)`)
  - `data` — `listAdminUsers()` API çağrısından dönen admin kullanıcı dizisi
  - `profiles` — `supabase.from('user_profiles').select(...)` sorgusundan dönen profil dizisi, manuel join için kullanılır
  - `profiles?.find(p => p.id === u.id)?.full_name` — her admin user'ın id'sine karşılık gelen profil tam adı
  - `u.full_name` — profil bulunamazsa fallback olarak kullanılır
  - `enrichedAdmins` — `data.map(...)` ile genişletilmiş, full_name zenginleştirilmiş admin kullanıcı dizisi
  - `_t('admin.users.toasts.adminsLoadFailed')` — hata toast mesajı için çeviri anahtarı
- **Dönüş**: yok (yan etki: `setAdminUsers(enrichedAdmins)` ile state güncellenir)

---

### [N5_NASIL] AST Pointer: AdminUsersPage::enrichAdminProfileMap
- **params**: `u` — `AdminUser` tipinde tek bir admin kullanıcı nesnesi (map callback)
- **ic_degiskenler**:
  - `u` — genişletme yapılan orijinal admin user nesnesi, spread ile kopyalanır (`...u`)
  - `profiles` — üst kapsamdan gelen supabase profil sorgusu sonucu
  - `profiles?.find(p => p.id === u.id)?.full_name` — eşleşen profil tam adı
  - `u.full_name` — profil eşleşmezse fallback tam ad
- **Dönüş**: `{ ...u, full_name: ... }` — tam ad alanı zenginleştirilmiş admin user nesnesi

---

### [N6_NASIL] AST Pointer: AdminUsersPage::loadAllUsersEffect
- **params**: () — effect callback, parametre yok
- **ic_degiskenler**:
  - `loadAllUsers` — asenkron iç fonksiyon, tüm kullanıcıları yükler ve çağrılır
- **Dönüş**: yok (effect side-effect olarak veri çeker)

---

### [N7_NASIL] AST Pointer: AdminUsersPage::loadAllUsers
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `isAdmin` — admin yetkisi kontrolü, false ise erken dönüş
  - `user` — oturum kullanıcısı, null ise erken dönüş
  - `activeTab` — mevcut aktif sekme, 'all' değilse erken dönüş
  - `isLoading` — yükleme durumu flag'i (`setIsLoading(true)` ile tetiklenir)
  - `profiles` — `supabase.from('user_profiles').select('id, role, created_at, full_name')` sorgusundan delen tüm kullanıcı profil dizisi
  - `profileError` — supabase sorgusundan dönen hata nesnesi, varsa fırlatılır
  - `_t('admin.users.toasts.allLoadFailed')` — hata toast mesajı için çeviri anahtarı
- **Dönüş**: yok (yan etki: `setAllUsers(profiles)` ile state güncellenir, hata durumunda `setAllUsers([])` ile temizlenir)

---

### [N8_NASIL] AST Pointer: AdminUsersPage::handleRoleChange
- **params**: `userId` (string) — rolü değiştirilecek kullanıcının benzersiz kimliği, `newRole` ('user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer') — hedef rol
- **ic_degiskenler**:
  - `hasWriteAccess` — kullanıcının yazma yetkisi olup olmadığı boolean, false ise fonksiyon erken döner
  - `userId` — hedef kullanıcının ID'si
  - `newRole` — atanmak istenen yeni rol
  - `success` — `setUserAdminRole(userId, newRole)` çağrısının başarı durumu boolean
  - `logAdminAction` — dinamik import ile yüklenen audit log fonksiyonu (`../../lib/audit` modülünden)
  - `supabase` — audit log çağrısında kullanılan supabase istemcisi
  - `allUsers` — mevcut tüm kullanıcı dizisi, eski rolü bulmak için `allUsers.find(u => u.id === userId)?.role` kullanılır
  - `data` — `listAdminUsers()` ile yeniden yüklenen admin kullanıcı listesi
  - `_t('admin.users.permissionsError')` — yetki hatası toast mesajı
  - `_t('admin.users.toasts.roleUpdated')` — başarı toast mesajı, `{ role: _t(...) }` parametre ile
  - `_t('admin.users.toasts.roleNotUpdated')` — başarısızlık toast mesajı
  - `_t('admin.users.toasts.roleUpdateError')` — genel hata toast mesajı
- **Dönüş**: yok (yan etki: `setAllUsers(prev => prev.map(...))` ile local state güncellenir, `setAdminUsers(data)` ile admin listesi yenilenir)

---

### [N9_NASIL] AST Pointer: AdminUsersPage::updateAllUsersState
- **params**: `prev` — mevcut `AllUser[]` state dizisi (React state updater callback)
- **ic_degiskenler**:
  - `prev` — önceki tüm kullanıcılar dizisi
  - `u` — `prev.map` içindeki her bir kullanıcı nesnesi
  - `userId` — hedef kullanıcı ID'si, eşleşme kontrolü yapılır (`u.id === userId`)
  - `newRole` — atanacak yeni rol stringi
- **Dönüş**: `{ ...u, role: newRole }` veya orijinal `u` — güncellenmiş `AllUser[]` dizisi

---

### [N10_NASIL] AST Pointer: AdminUsersPage::getRoleIcon
- **params**: `roleCode` (string) — rol kodu ('super_admin', 'admin', 'warehouse', 'sales' veya diğer)
- **ic_degiskenler**: yok (switch statement doğrudan parametreyi kullanır)
- **Dönüş**: JSX.Element — ilgili role karşılık gelen Lucide icon bileşeni (Crown, Shield, ShieldCheck veya Users)

---

### [N11_NASIL] AST Pointer: AdminUsersPage::loadPreferencesEffect
- **params**: () — effect callback, parametre yok
- **ic_degiskenler**:
  - `c` — `localStorage.getItem(...)` ile okunan sütun görünürlükleri JSON stringi, parse edilerek `visibleCols` state'ine merged
  - `d` — `localStorage.getItem(...)` ile okunan yoğunluk tercihi stringi, 'compact' veya 'comfortable' ise `density` state'ine set edilir
  - `STORAGE_KEY` — localStorage anahtar öneki, sütun tercihleri için kullanılır
- **Dönüş**: yok (yan etki: `setVisibleCols`, `setDensity` state setter'ları çağrılır)

---

### [N12_NASIL] AST Pointer: AdminUsersPage::saveColumnsEffect
- **params**: () — effect callback, parametre yok
- **ic_degiskenler**:
  - `visibleCols` — mevcut sütun görünürlük nesnesi, JSON string olarak localStorage'a yazılır
  - `STORAGE_KEY` — localStorage anahtar öneki
- **Dönüş**: yok (yan etki: `localStorage.setItem(...)` ile sütun tercihleri kaydedilir)

---

### [N13_NASIL] AST Pointer: AdminUsersPage::saveDensityEffect
- **params**: () — effect callback, parametre yok
- **ic_degiskenler**:
  - `density` — yoğunluk tercihi stringi ('compact' veya 'comfortable'), localStorage'a yazılır
  - `STORAGE_KEY` — localStorage anahtar öneki
- **Dönüş**: yok (yan etki: `localStorage.setItem(...)` ile yoğunluk tercihi kaydedilir)

---

### [N14_NASIL] AST Pointer: AdminUsersPage::UserAvatar
- **params**: `{ name, email }` — `name?` (string, opsiyonel — kullanıcının tam adı), `email?` (string, opsiyonel — kullanıcının e-posta adresi)
- **ic_degiskenler**:
  - `initial` — `(name || email || '?').charAt(0).toUpperCase()` ile hesaplanan avatar baş harfi, büyük harfe dönüştürülür
- **Dönüş**: JSX.Element — gradient arka planlı, baş harf içeren dairesel avatar bileşeni

---

### [N15_NASIL] AST Pointer: AdminUsersPage::renderUserRow
- **params**: `userItem` — `AdminUser | AllUser` tipinde tek bir kullanıcı nesnesi
- **ic_degiskenler**:
  - `userItem.id` — satır key'i ve rol değiştirme butonlarında kullanıcı tanımlayıcısı
  - `userItem.email` — kullanıcının e-posta adresi, UserAvatar'a ve tablo hücresine yazdırılır
  - `userItem.full_name` — kullanıcının tam adı, UserAvatar'a ve tablo hücresine yazdırılır
  - `userItem.role` — kullanıcının mevcut rolü, rol ikonu ve aksiyon butonlarının koşullarında kullanılır
  - `userItem.created_at` — kullanıcının hesap oluşturma tarihi, `formatDate(userItem.created_at, lang)` ile formatlanır
  - `visibleCols.user` — email/sütununun görünürlük flag'i
  - `visibleCols.role` — rol sütununun görünürlük flag'i
  - `visibleCols.created` — tarih sütununun görünürlük flag'i
  - `visibleCols.actions` — aksiyon butonları sütununun görünürlük flag'i
  - `role` — mevcut oturum kullanıcısının rolü, super_admin/admin kontrollerinde kullanılır
  - `hasWriteAccess` — yazma yetkisi boolean, butonların disabled durumunu belirler
  - `updatingRole` — şu an rolü güncellenen kullanıcının ID'si, butonları devre dışı bırakmak için kullanılır
  - `_t(...)` — çeviri fonksiyonu, rol etiketleri ve buton başlıkları için kullanılır
  - `lang` — mevcut dil kodu, `formatDate` fonksiyonuna geçirilir
  - `handleRoleChange` — rol değiştirme handler fonksiyonu, her butonun onClick'inde çağrılır
  - `adminTableCellClass` — tablo hücreleri için ortak CSS sınıfı
  - `cellPad` — tablo hücre iç;padding sınıfı
- **Dönüş**: JSX.Element — `<tr>` tablo satırı, içinde email, rol, tarih ve aksiyon butonları hücreleri

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