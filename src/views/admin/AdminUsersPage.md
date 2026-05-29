---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx
skeleton_hash: aab27482c6f16b67
entity_hashes:
  func:AdminUsersPage: ee013d03ee079db2
  overview: 0096771747f8ab6c
  style_tokens: 8daaaf9992883c4d
generated_at: 2026-05-29T19:00:45Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici panelinde yer alan kullanıcı yönetimi sayfasını oluşturan ana React bileşenidir. Yetkili yöneticilerin platformdaki tüm kullanıcı hesaplarını görüntülemesi, filtrelemesi, detay bilgilerini incelemesi ve rol gibi temel bilgileri değiştirebilmesi için gereken arayüzün tamamını sunar. Sayfa, yönetici ve normal kullanıcı sekmeleri arasında geçiş yaparak verileri dinamik şekilde yükler ve yöneticilerin kullanıcıları etkin bir şekilde denetlemesini sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Yönetici kullanıcılar sayfasının tüm arayüz ve işlevselliğini tek bir bileşen altında toplayan, sayfanın renderlanmasından ve temel veri akışından sorumlu ana bileşendir. Oturum kontrolü, veri çekme, filtreleme ve rol değiştirme gibi işlemleri yöneterek yönetici panelinde kullanıcı yönetimini mümkün kılar.
- `AdminUsersPage`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi detayları paylaşılmamıştır, bu nedenle yalnızca fonksiyon imzasından ve modül yapısından çıkarılabilecek minimal aksiyomlar tanımlanmıştır.

---

[Aksiyom 1]: Eğer bileşen bir React sayfa bileşeni olarak render ediliyorsa, bir React Router v6+ ortamında çalışması gerekir. Eğer geçerli bir React Router bağlamı (Router Context) yoksa, bileşen iç navigasyon ve route parametreleri doğru çalışmaz.

[Aksiyom 2]: Eğer bileşen yönetici paneline ait bir sayfa ise, kullanıcı bilgileri ve rol kontrolü için üst seviye bir AuthProvider/Context bağlamı mevcut olmalıdır. Eğer Auth Context bağlantısı yoksa, yönetici yetkilendirme kontrolü yapılamaz ve yetkisiz erişim riski oluşur.

[Aksiyom 3]: Eğer AdminUsersPage fonksiyonu paramet almıyorsa (signature: `AdminUsersPage()`), bileşen props yerine hook'lar (useContext, useNavigate, useQuery vb.) aracılığıyla bağımlılıklarını karşılar. Eğer gerekli hook'lar çalıştırılamıyorsa (örn: bir Provider içinde render edilmemişse), bileşen hata fırlatır.

---

**Not:** Fonksiyon gövdesi detayları paylaşılmadığı için, API çağrıları, state yönetimi, filtreleme eşik değerleri veya veri modeli bağımlılıkları gibi detaylı aksiyomlar türetilememiştir. Fonksiyon implementasyonu paylaşıldığında daha spesifik aksiyomlar eklenebilir.

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

### [N1_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::setIsAdminCallback
- **params**: () — parametre yok
- **ic_degiskenler**: (yok, doğrudan state setter çağrılır)
- **Dönüş**: yok (yan etki: `isAdmin` state'ini `role` değerine göre günceller)

---

### [N2_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::redirectIfUnauthenticated
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `loading` — useAuth hook'undan gelen yükleme durumu flag'i, true ise henüz oturum kontrolü devam ediyor demektir
  - `user` — useAuth hook'undan gelen mevcut kullanıcı nesnesi, null ise giriş yapılmamıştır
  - `router` — useRouter hook'undan gelen Next.js router instance'ı, sayfa yönlendirme için kullanılır
- **Dönüş**: yok (yan etki: kullanıcı giriş yapmamışsa `/admin/users` login sayfasına yönlendirir)

---

### [N3_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::useEffectLoadAdminUsers
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `isAdmin` — kullanıcının admin olup olmadığını belirten boolean state, inner function'ın guard kontrolünde kullanılır
  - `user` — useAuth hook'undan gelen mevcut kullanıcı nesnesi, inner function'ın guard kontrolünde kullanılır
- **ic_fonksiyonlar**:
  - `loadAdminUsers` — async inner fonksiyon, admin kullanıcı listesini yükler
- **Dönüş**: yok (yan etki: `isAdmin` true ve `user` mevcutsa `loadAdminUsers()` çağırır)

---

### [N4_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::loadAdminUsers
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `isAdmin` — boolean state, guard kontrolünde kullanılır; false ise fonksiyon erken return eder
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, guard kontrolünde kullanılır; null ise erken return
  - `data` — `listAdminUsers()` API çağrısının dönüş değeri; admin kullanıcıların dizisi (AdminUser[])
  - `profiles` — `supabase.from('user_profiles').select(...)` sorgusunun `data` alanı; `{id, full_name}` alanlarını içeren profil nesneleri dizisi
  - `enrichedAdmins` — `data.map(...)` ile oluşturulan genişletilmiş admin listesi; her user objesine `full_name` alanı profile'dan join edilerek eklenir
- **API Cagrilari**:
  - `listAdminUsers()` — admin kullanıcı listesini getiren servis fonksiyonu
  - `supabase.from('user_profiles').select('id, full_name').in('id', data.map(u => u.id))` — user_profiles tablosundan admin kullanıcıların profil bilgilerini çeker
- **Dönüş**: yok (yan etki: `setIsLoading(true)`, `setAdminUsers(enrichedAdmins)` state güncellemeleri yapar, hata durumunda `toast.error` gösterir)

---

### [N5_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::adminUsersMapCallback
- **params**: `u` — AdminUser tipinde tek bir admin kullanıcısı nesnesi
- **ic_degiskenler**:
  - `profiles` — outer scope'tan gelen supabase sorgusundan dönen profil dizisi; `.find(p => p.id === u.id)` ile eşleşme aranır
- **Dönüş**: nesne — `...u` spread ile mevcut alanlar korunur, `full_name` alanı profiles'tan bulunamazsa `u.full_name` fallback kullanılır

---

### [N6_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::useEffectLoadAllUsers
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `isAdmin` — boolean state, guard kontrolünde kullanılır
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, guard kontrolünde kullanılır
  - `activeTab` — mevcut aktif sekme state'i; `'all'` değilse fonksiyon erken return eder
- **ic_fonksiyonlar**:
  - `loadAllUsers` — async inner fonksiyon, tüm kullanıcı listesini yükler
- **Dönüş**: yok (yan etki: guard koşulları sağlandığında `loadAllUsers()` çağırır)

---

### [N7_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::loadAllUsers
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `isAdmin` — boolean state, guard kontrolünde kullanılır
  - `user` — useAuth hook'undan gelen kullanıcı nesnesi, guard kontrolünde kullanılır
  - `activeTab` — mevcut sekme state'i; `'all'` değilse fonksiyon erken return
  - `profiles` — `supabase.from('user_profiles').select(...)` sorgusunun `data` alanı; `{id, role, created_at, full_name}` alanlarını içeren tüm kullanıcı profil dizisi (AllUser[])
  - `profileError` — supabase sorgusunun `error` alanı; sorgu hatası varsa fırlatılır
- **API Cagrilari**:
  - `ensureSessionFresh()` — proaktif oturum tazeleme kontrolü yapar
  - `supabase.from('user_profiles').select('id, role, created_at, full_name')` — user_profiles tablosundan tüm kullanıcıların temel bilgilerini çeker
- **Dönüş**: yok (yan etki: `setIsLoading(true/false)`, `setAllUsers(profiles)` state güncellemeleri yapar; hata durumunda `setAllUsers([])` ile listeyi temizler ve `toast.error` gösterir)

---

### [N8_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::handleRoleChange
- **params**: `userId` — string, rolü değiştirilecek kullanıcının benzersiz kimliği; `newRole` — string union tipi (`'user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer'`), hedef rol
- **ic_degiskenler**:
  - `hasWriteAccess` — boolean, kullanıcının yazma yetkisi olup olmadığını belirler; false ise toast gösterilip erken return
  - `success` — `setUserAdminRole(userId, newRole)` çağrısının boolean dönüş değeri; true ise güncelleme başarılı demektir
  - `logAdminAction` — dinamik import ile `../../lib/audit` modülünden yüklenen audit loglama fonksiyonu
- **API Cagrilari**:
  - `setUserAdminRole(userId, newRole)` — kullanıcının rolünü veritabanında günceller
  - `import('../../lib/audit').logAdminAction(supabase, {...})` — dinamik import ile audit log kaydı oluşturur; `supabase` instance'ı, `table_name: 'user_profiles'`, `row_pk: userId`, `action: 'UPDATE'`, `before: { role: ... }`, `after: { role: newRole }`, `comment: 'role change'` parametreleri ile
  - `listAdminUsers()` — güncelleme sonrası admin listesini yeniden çeker
- **Dönüş**: yok (yan etki: `setUpdatingRole(userId/null)`, `setAllUsers(prev => ...)`, `setAdminUsers(data)` state güncellemeleri yapar; success'e göre `toast.success` veya `toast.error` gösterir)

---

### [N9_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::setAllUsersMapCallback
- **params**: `prev` — AllUser[] tipinde mevcut tüm kullanıcılar dizisi (setState'in önceki değeri)
- **ic_degiskenler**:
  - `u` — `.map()` iterasyonundaki mevcut kullanıcı nesnesesi
  - `userId` — outer scope'tan gelen hedef kullanıcı kimliği
  - `newRole` — outer scope'tan gelen yeni rol değeri
- **Dönüş**: AllUser[] — her kullanıcı için `u.id === userId` eşleşiyorsa `role` alanı `newRole` ile değiştirilmiş nesne, diğerleri aynen korunur

---

### [N10_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::searchFilterCallback
- **params**: `user` — AllUser tipinde tek bir kullanıcı nesnesi
- **ic_degiskenler**:
  - `searchQuery` — outer scope'tan gelen arama sorgusu string'i; küçük harfe dönüştürülerek eşleşme kontrolü yapılır
- **Dönüş**: boolean — kullanıcının `email` alanı veya `full_name` alanı arama sorgusunu içeriyorsa true, aksi halde false

---

### [N11_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::searchFilterCallbackAll
- **params**: `user` — AllUser tipinde tek bir kullanıcı nesnesi
- **ic_degiskenler**:
  - `searchQuery` — outer scope'tan gelen arama sorgusu string'i; küçük harfe dönüştürülerek eşleşme kontrolü yapılır
- **Dönüş**: boolean — kullanıcının `email` alanı veya `full_name` alanı arama sorgusunu içeriyorsa true, aksi halde false

---

### [N12_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::getRoleIcon
- **params**: `roleCode` — string, kullanıcının rol kodu
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element — rol koduna göre ilgili lucide-react icon bileşeni döner: `'super_admin'` → Crown (mor), `'admin'` → Shield (indigo), `'warehouse'`/`'sales'` → ShieldCheck (cyan), diğer tüm roller → Users (slate)

---

### [N13_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::useEffectLoadColPrefs
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `STORAGE_KEY` — outer scope'tan gelen localStorage anahtarının kök değeri; `${STORAGE_KEY}:cols` formatında sütun tercihi okunur
  - `c` — `localStorage.getItem(...)` çağrısının dönüş string'i; JSON parse edilerek sütun görünürlük nesnesine dönüştürülür
  - `d` — `localStorage.getItem(...)` çağrısının dönüş string'i; yoğunluk tercihini temsil eder (`'compact'` veya `'comfortable'`)
  - `prev` — `setVisibleCols` setter'ının callback'indeki mevcut visibleCols state değeri
- **Dönüş**: yok (yan etki: `setVisibleCols` ile sütun görünürlük state'ini, `setDensity` ile yoğunluk state'ini localStorage'dan yükler)

---

### [N14_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::useEffectSaveColPrefs
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `STORAGE_KEY` — outer scope'tan gelen localStorage anahtarının kök değeri; `${STORAGE_KEY}:cols` formatında sütun tercihi yazılır
  - `visibleCols` — mevcut sütun görünürlük state nesnesi; JSON.stringify ile string'e dönüştürülüp localStorage'a kaydedilir
- **Dönüş**: yok (yan etki: `visibleCols` state'ini localStorage'a kaydeder)

---

### [N15_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::useEffectSaveDensity
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `STORAGE_KEY` — outer scope'tan gelen localStorage anahtarının kök değeri; `${STORAGE_KEY}:density` formatında yoğunluk tercihi yazılır
  - `density` — mevcut yoğunluk state değeri (`'compact'` veya `'comfortable'`); doğrudan string olarak localStorage'a kaydedilir
- **Dönüş**: yok (yan etki: `density` state'ini localStorage'a kaydeder)

---

### [N16_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::UserAvatar
- **params**: `name` — string | undefined opsiyonel, kullanıcının tam adı; `email` — string | undefined opsiyonel, kullanıcının e-posta adresi
- **ic_degiskenler**:
  - `initial` — avatar içinde gösterilen başharf; `name` mevcutsa onun ilk karakteri, yoksa `email`'in ilk karakteri, o da yoksa `'?'` karakteri; `.toUpperCase()` ile büyük harfe dönüştürülür
- **Dönüş**: JSX.Element — user'ın başharfini gösteren gradient arka planlı dairesel avatar bileşeni

---

### [N17_NASIL] AST Pointer: `src/views/admin/AdminUsersPage.tsx`::userTableRow
- **params**: `userItem` — AllUser veya AdminUser tipinde tek bir kullanıcı nesnesi; tabloda satır olarak render edilecek
- **ic_degiskenler**:
  - `visibleCols` — outer scope'tan gelen sütun görünürlük nesnesi; `visibleCols.user`, `visibleCols.role`, `visibleCols.created`, `visibleCols.actions` boolean alanları ile hangi sütunların gösterileceği kontrol edilir
  - `cellPad` — outer scope'tan gelen hücre padding CSS class string'i
  - `adminTableCellClass` — outer scope'tan gelen ortak hücre CSS class string'i
  - `lang` — outer scope'tan gelen dil code string'i, `formatDate` fonksiyonuna geçirilir
  - `role` — outer scope'tan gelen mevcut giriş yapmış kullanıcının rolü; butonların koşullu gösteriminde kullanılır
  - `hasWriteAccess` — outer scope'tan gelen boolean, kullanıcının yazma yetkisi varsa butonlar aktif olur
  - `updatingRole` — outer scope'tan gelen string | null state, şu anda rolü güncellenen kullanıcının ID'si; ilgili butonlar `disabled` olur
  - `user` — outer scope'tan gelen mevcut kullanıcı nesnesi; `userItem.id === user?.id` kontrolü ile kendi rolünü değiştirmesi engellenir
- **Fonksiyon Cagrilari**:
  - `UserAvatar({ name: userItem.full_name || undefined, email: userItem.email })` — avatar bileşeni
  - `getRoleIcon(userItem.role || 'user')` — rol ikonu
  - `_t(\`roles.${userItem.role || 'user'}\`)` — rol çevirisi
  - `formatDate(userItem.created_at, lang)` — tarih formatlama
  - `handleRoleChange(userItem.id, 'super_admin'|'admin'|'warehouse'|'sales'|'viewer'|'user')` — buton onClick handler'ları
- **Dönüş**: JSX `<tr>` elementi — kullanıcının bilgilerini (avatar, email, isim, rol, kayıt tarihi, işlem butonları) içeren tablo satırı; sütun görünürlüğüne göre koşullu olarak render edilir

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