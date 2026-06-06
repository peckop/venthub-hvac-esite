---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx
skeleton_hash: 5908a1fc9f21bfe1
entity_hashes:
  func:AdminUsersPage: ee013d03ee079db2
  overview: 6b612d5aaaee6797
  style_tokens: 8daaaf9992883c4d
generated_at: 2026-06-06T21:58:01Z
---

## Genel Bakış
AdminUsersPage, VentHub HVAC yönetici panelinin kullanıcı yönetimi sayfasını oluşturan ana React bileşenidir. Yetkili yöneticilerin platformdaki tüm kullanıcı hesaplarını görüntülemesini, filtrelemesini ve temel bilgilerini değiştirebilmesini sağlayan tek bir bileşen olarak modülün tüm arayüz ve işlevselliğini barındırır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tüm arayüzünü, veri akışını ve kullanıcı yönetimi işlevselliğini (oturum kontrolü, veri çekme, filtreleme, rol değiştirme) tek bir merkezi bileşen altında toplar.
- AdminUsersPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca bileşen imzasından çıkarılabilecek temel mimari varsayımlar tanımlanabilir.

[Aksiyom 1]: Eğer React ortamı (render context) yoksa, bileşen hiçbir JSX döndüremez ve sayfa boş kalır.

[Aksiyom 2]: Eğer bileşenin bağımlı olduğu alt bileşenler (kullanıcı listesi tablosu, filtre paneli, sekme bileşenleri) yoksa, bileşen render aşamasında hata verir.

[Aksiyom 3]: Eğer yetkilendirme/auth context'i (yönetici rolü kontrolü) yoksa, bileşen kullanıcı verilerini güvenli bir şekilde filtreleyemez veya erişim izni olmayan kullanıcıları gösterebilir.

---

**Not:** Fonksiyon gövdesi (implementation body) paylaşılmadığı için, API çağrıları, state yönetimi, hata yönetimi veya veri doğrulama gibi detaylı mimari aksiyomlar üretilememektedir. Bu aksiyomlar yalnızca bileşen imzası ve modül tanımından çıkarılabilen genel React bileşen varsayımlarıdır.

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

### [N1_NASIL] AST Pointer: AdminUsersPage::setIsAdminEffect
- **params**: (parametre yok — useEffect callback)
- **ic_degiskenler**: (doğrudan state setter çağrısı, iç değişken yok)
- **Dönüş**: yok (yan etki: `setIsAdmin` çağrılır, `role` değerine göre `true`/`false` atanır)

---

### [N2_NASIL] AST Pointer: AdminUsersPage::redirectIfUnauthenticated
- **params**: (parametre yok — useEffect callback)
- **ic_degiskenler**: (iç değişken yok; `loading`, `user`, `router` scope'tan gelir)
- **Dönüş**: yok (yan etki: `router.push(Routes.auth.login('/admin/users'))` ile yönlendirme)

---

### [N3_NASIL] AST Pointer: AdminUsersPage::useEffectLoadAdmins
- **params**: (parametre yok — useEffect callback)
- **ic_degiskenler**:
  - `loadAdminUsers` — async inner fonksiyon, admin kullanıcı listesini API'den çekip profile verisiyle zenginleştirir
- **Dönüş**: yok (yan etki: `loadAdminUsers()` çağrılarak state güncellenir)

---

### [N4_NASIL] AST Pointer: AdminUsersPage::loadAdminUsers
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — `listAdminUsers()` çağrısından dönen admin kullanıcı dizisi
  - `profiles` — `supabase.from('user_profiles').select('id, full_name')` sorgusundan dönen `{ data, error }`解构 ile elde edilen profil listesi
  - `enrichedAdmins` — `data.map(u => ...)` ile her admin objsine `full_name` alanı eklenmiş genişletilmiş dizi
- **Dönüş**: yok (yan etki: `setAdminUsers(enrichedAdmins)` ile state güncellenir; hata durumunda `toast.error` gösterilir)

---

### [N5_NASIL] AST Pointer: AdminUsersPage::enrichAdminMapper
- **params**: `u` — tek bir admin kullanıcı objesi (AdminUser)
- **ic_degiskenler**:
  - `u.id` — kullanıcının benzersiz ID'si, `profiles` dizisinde eşleşme için kullanılır
  - `u.full_name` — orijinal tam ad, profilde bulunamazsa fallback olarak kullanılır
  - `profiles?.find(p => p.id === u.id)?.full_name` — profile tablosundan eşleşen tam ad, bulunamazsa `undefined`
- **Dönüş**: `{ ...u, full_name: <bulunan_veya_fallback> }` — genişletilmiş kullanıcı objesi

---

### [N6_NASIL] AST Pointer: AdminUsersPage::useEffectLoadAllUsers
- **params**: (parametre yok — useEffect callback)
- **ic_degiskenler**:
  - `loadAllUsers` — async inner fonksiyon, tüm kullanıcıları profile tablosundan çeker
- **Dönüş**: yok (yan etki: `loadAllUsers()` çağrılarak state güncellenir)

---

### [N7_NASIL] AST Pointer: AdminUsersPage::loadAllUsers
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `profiles` — `supabase.from('user_profiles').select('id, role, created_at, full_name')` sorgusundan dönen tüm kullanıcı profil dizisi
  - `profileError` — supabase sorgusundan dönen hata objesi, varsa `throw` ile fırlatılır
- **Dönüş**: yok (yan etki: `setAllUsers(profiles)` ile state güncellenir; hata durumunda `toast.error` + `setAllUsers([])` çağrılır)

---

### [N8_NASIL] AST Pointer: AdminUsersPage::handleRoleChange
- **params**:
  - `userId: string` — rolü değiştirilecek kullanıcının ID'si
  - `newRole: 'user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer'` — atanacak yeni rol
- **ic_degiskenler**:
  - `success` — `setUserAdminRole(userId, newRole)` çağrısının başarılı olup olmadığı boolean
  - `logAdminAction` — dinamik import ile yüklenen audit log fonksiyonu
  - `allUsers.find(u => u.id === userId)?.role` — rol değişikliği öncesi mevcut rol (audit log için `before` değeri)
- **Dönüş**: yok (yan etki: `setUpdatingRole`, `setAllUsers`, `setAdminUsers` ile state güncellenir; `toast.success`/`toast.error` gösterilir; audit log yazılır)

---

### [N9_NASIL] AST Pointer: AdminUsersPage::updateAllUsersMapper
- **params**: `prev` — mevcut `allUsers` state'inin önceki değeri (dizi)
- **ic_degiskenler**:
  - `u` — `prev.map` içindeki her bir kullanıcı objesi
- **Dönüş**: `prev.map(u => u.id === userId ? { ...u, role: newRole } : u )` — güncellenmiş kullanıcı dizisi

---

### [N10_NASIL] AST Pointer: AdminUsersPage::searchFilterMapper
- **params**: `user` — arama filtresinde kontrol edilen tek bir kullanıcı objesi
- **ic_degiskenler**: (iç değişken yok; `searchQuery` scope'tan gelir)
- **Dönüş**: `boolean` — kullanıcının `email` veya `full_name` alanları `searchQuery` içeriyorsa `true`

---

### [N11_NASIL] AST Pointer: AdminUsersPage::searchFilterMapper (ikinci kullanım)
- **params**: `user` — arama filtresinde kontrol edilen tek bir kullanıcı objesi
- **ic_degiskenler**: (iç değişken yok; `searchQuery` scope'tan gelir)
- **Dönüş**: `boolean` — kullanıcının `email` veya `full_name` alanları `searchQuery` içeriyorsa `true`

---

### [N12_NASIL] AST Pointer: AdminUsersPage::getRoleIcon
- **params**: `roleCode: string` — rol kodu
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: `JSX.Element` — role göre icon bileşeni (`Crown`, `Shield`, `ShieldCheck`, `Users`)

---

### [N13_NASIL] AST Pointer: AdminUsersPage::loadColPrefs
- **params**: (parametre yok — useEffect callback)
- **ic_degiskenler**:
  - `c` — `localStorage.getItem(\`${STORAGE_KEY}:cols\`)` ile okunan JSON string, görünür sütun tercihleri
  - `d` — `localStorage.getItem(\`${STORAGE_KEY}:density\`)` ile okunan yoğunluk tercihi (`'compact'` veya `'comfortable'`)
- **Dönüş**: yok (yan etki: `setVisibleCols` ve `setDensity` ile state güncellenir)

---

### [N14_NASIL] AST Pointer: AdminUsersPage::saveColPrefs
- **params**: (parametre yok — useEffect callback)
- **ic_degiskenler**:
  - `visibleCols` — mevcut görünür sütun tercihleri objesi, JSON string olarak `localStorage`'a yazılır
- **Dönüş**: yok (yan etki: `localStorage.setItem(\`${STORAGE_KEY}:cols\`, ...)` çağrılır)

---

### [N15_NASIL] AST Pointer: AdminUsersPage::saveDensityPref
- **params**: (parametre yok — useEffect callback)
- **ic_degiskenler**:
  - `density` — mevcut yoğunluk tercihi string, `localStorage`'a yazılır
- **Dönüş**: yok (yan etki: `localStorage.setItem(\`${STORAGE_KEY}:density\`, ...)` çağrılır)

---

### [N16_NASIL] AST Pointer: AdminUsersPage::UserAvatar
- **params**: `{ name, email }` — `{ name?: string, email?: string }` destructured obje
- **ic_degiskenler**:
  - `initial` — `(name || email || '?').charAt(0).toUpperCase()` hesaplanan baş harf avatar Metni
- **Dönüş**: `JSX.Element` — gradient arka planlı, baş harfi gösteren dairemsi avatar bileşeni

---

### [N17_NASIL] AST Pointer: AdminUsersPage::renderUserRow
- **params**: `userItem` — tek bir kullanıcı objesi (tüm alanlarıyla: `id`, `email`, `full_name`, `role`, `created_at`)
- **ic_degiskenler**: (dışarıdan gelen state'ler kullanılır: `visibleCols`, `updatingRole`, `role`, `hasWriteAccess`, `user`, `cellPad`, `adminTableCellClass`, `lang`, `_t`, `formatDate`, `getRoleIcon`, `handleRoleChange`, `UserAvatar`)
- **Dönüş**: `JSX.Element` — `<tr>` satır bileşeni, koşullu sütunlar (`visibleCols.user`, `visibleCols.role`, `visibleCols.created`, `visibleCols.actions`) ile satır hücrelerini render eder; `handleRoleChange` çağrılı butonlar ile rol değiştirme eylemleri sunar

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