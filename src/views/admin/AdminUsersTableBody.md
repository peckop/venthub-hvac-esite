---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersTableBody.tsx
skeleton_hash: b01e7fa733f0db9c
entity_hashes:
  func:AdminUsersTableBody: f0dd41f9640952ff
  func:normalizeRole: afac682f1e1dd057
  overview: 1fa053ba4e77e890
  style_tokens: 81e53ecf980e3b56
generated_at: 2026-06-13T18:57:24Z
---

## Genel Bakış
Bu modül, admin panelindeki kullanıcı tablosunun satırlarını render eden bir React bileşenidir. Ana görevi, kullanıcı verilerini güvenli ve okunabilir bir şekilde sunarken, rol bilgisini standartlaştırmak için yardımcı bir işlev içerir.

## Fonksiyon Grupları
### Veri Hazırlama ve Yardımcı İşlevler
Bu grup, bileşen tarafından kullanılan ham verileri işleyen ve standart formatlara dönüştüren yardımcı fonksiyonları kapsar.
- normalizeRole: Ham rol dizgesini alır ve ön tanımlı, küçük harfle yazılmış geçerli bir rol değerine dönüştürür.

### Ana Bileşen ve Arayüz Sunumu
Modülün temel responsibility'sini taşıyan, kullanıcı tablosunun satırlarını oluşturan React bileşenidir.
- AdminUsersTableBody: Admin yetkilerine göre tablonun içeriğini ve görünümünü belirleyen, veriyi tablo yapısına yerleştiren ana bileşendir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kullanıcı rol normalize işlemi ve admin kullanıcılar tablosu gövde bileşeni için aşağıdaki mimari varsayımlara sahiptir:

[Aksiyom 1]: Eğer `normalizeRole` fonksiyonuna `null` veya `undefined` değer verilirse, dönen string değerin boş string (`""`) olması beklenir. (Bu durum, fonksiyonun inputun `raw` parametresine atanması ve `string | null | undefined` tipiyle uyumlu olması için zorunludur;aksi halde tip hatası oluşur.)

[Aksiyom 2]: Eğer `normalizeRole` fonksiyonu geçerli bir string (`raw`) alırsa, dönen stringin küçük harfe dönüştürülmüş ve boşlukları temizlenmiş (`trim()`) olması gerekir.aksi halde, rol butonları için doğru ikon ve ton eşleşmesi yapılamaz.

[Aksiyom 3]: Eğer `ROLE_BUTTON_ICON` veya `ROLE_BUTTON_TONE` sabitleri tanımlı değilse veya `normalizeRole`'den dönen değer için bir eşleşme içermiyorsa, ilgili rol butonu için varsayılan bir ikon ve ton gösterilmelidir.aksi halde, undefined değerler render aşamasında hata verebilir.

[Aksiyom 4]: Eğer `isAdmin` prop'u `false` ise, `AdminUsersTableBody` bileşeni tablodaki admin kullanıcılarına ait satırları (örneğin, admin rolündekileri) göstermemelidir.aksi halde, yetkisiz kullanıcılar admin-only bilgileri görebilir.

[Aksiyom 5]: Eğer `isAdmin` prop'u `true` ise, `AdminUsersTableBody` bileşeni tüm kullanıcı satırlarını (admin ve non-admin) gösterebilir.aksi halde, bileşenin çalışması tutarsız olabilir.

---

## FONKSİYON DETAYLARI

### normalizeRole
**Ne yapar**: Ham rol değerini (null, undefined veya boş dize) standart bir formata dönüştürerek geçerli bir rol dizesi döndürür. Geçersiz veya eksik girişler için varsayılan 'user' rolünü atar.

**Nasıl yapar**: Fonksiyon, input olarak aldığı `raw` değerinin varlığını ve uzunluğunu kontrol eder. Eğer `raw` truthy (null veya undefined değilse) ve uzunluğu sıfırdan büyükse, olduğu gibi döndürülür. Aksi takdirde, varsayılan değer olarak 'user' dizesi döndürülür. Bu, uygulama genelinde tutarlı rol formatı sağlar ve eksik veri durumlarını güvenli bir şekilde işler.

**Parametreler**:
- raw: string | null | undefined — Normalize edilecek ham rol değeri. null, undefined veya boş bir dize olabilir.

**Dönüş**: string — Normalize edilmiş rol dizesi. Girdi geçerliyse o değer, değilse 'user' döndürülür.

### AdminUsersTableBody
**Ne yapar**: Admin kullanıcılar tablosunun gövde (tbody) bölümünü render eden bir React fonksiyonel bileşenidir. Bileşen, kullanıcının admin olup olmadığını belirleyen bir prop alır ve tablonun satırlarını buna göre oluşturur.

**Nasıl yapar**: Bu bir React fonksiyonel bileşenidir. Fonksiyon, `{ isAdmin }` destructuring ile prop'ları alır. Fonksiyonun dönüş tipi `React.FC<{ isAdmin: boolean }>` olarak belirtilmiştir; bu da fonksiyonun bir React Functional Component olduğunu ve `isAdmin` adında boolean bir prop aldığını ifade eder. Bileşen, `isAdmin` prop'una bağlı olarak tablonun içeriğini veya yapısını dinamik olarak belirleyen JSX kodunu döndürür.

**Parametreler**:
- isAdmin: boolean — Kullanıcının admin yetkisine sahip olup olmadığını belirten bayrak. true ise admin, false ise normal kullanıcı视图。

**Dönüş**: React.FC<{ isAdmin: boolean }> — React Functional Component. Bileşen, `isAdmin` boolean prop'unu kabul eden ve JSX döndüren bir React bileşenidir.

---

## INTERFACES

### UserRow
- `id: string`
- `email?: string`
- `full_name?: string`
- `role: string`
- `created_at: string`

### ProfileLite
RPC profil satırı (full_name zenginleştirmesi için)
- `id: string`
- `full_name?: string | null`

### AllProfileRow
- `id: string`
- `role?: string | null`
- `created_at: string`
- `full_name?: string | null`

---

## TYPE ALIASES

### UserRoleCode
```typescript
type UserRoleCode = 'user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer'
```

### UsersTab
```typescript
type UsersTab = 'admins' | 'all'
```

---

## SABİTLER
- **ROLE_BUTTON_ICON** (object) — `{
  super_admin: <Crown size={14} />,
  admin: <Shield size={14} />,
  wareho...`
- **ROLE_BUTTON_TONE** (object) — `{
  super_admin: 'text-amber-500 hover:bg-amber-500/10 hover:border-amber-500...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::normalizeRole
- **params**: `raw: string | null | undefined`
- **ic_degiskenler**:
  - (dahili değişken yok — doğrudan ternary döner)
- **Dönüş**: `string` — raw değer dolu ve uzunluğu > 0 ise aynen döner, değilse `'user'` döner

---

### [N2_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::fetchCallback (data fetching)
- **params**: `supabase: SupabaseClient<Database>`, `_params: FetchParams`
- **ic_degiskenler**:
  - `tabRef.current` — mevcut sekmenin referans değeri (`'admins'` veya `'all'` kontrol edilir)
  - `data` — `listAdminUsers()` çağrısından dönen admin kullanıcı listesi
  - `ids` — `data.map((u) => u.id)` ile türetilen, admin kullanıcıların ID dizisi
  - `profiles` — `ProfileLite[]` tipinde, başlangıçta boş dizi; `supabase.from('user_profiles').select(...)` sorgusundan gelen profil verileri atanır
  - `profileData` — supabase sorgusunun `data` alanından dönen profil satırları; `profiles` olarak cast edilir
  - `rows` — `UserRow[]` dizisi; admin veya tüm kullanıcı verilerinin normalize edilmiş hali
  - `error` — supabase sorgusundan dönen hata nesnesi; `throw error` ile fırlatılır
  - `data` (all sekmesi) — `supabase.from('user_profiles').select(...)` sorgusunun `data` alanı; `AllProfileRow[]` olarak cast edilir
- **Dönüş**: `Promise<FetchResult<UserRow>>` — `{ rows, totalMatched }` nesnesi

---

### [N3_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::adminUserMapCallback
- **params**: `u` (admin kullanıcısı nesnesi; `u.id`, `u.email`, `u.full_name`, `u.role`, `u.created_at` alanları erişilir)
- **ic_degiskenler**:
  - (dahili değişken yok — doğrudan nesne literal döner)
- **Dönüş**: `UserRow` nesnesi — `profiles.find()` ile `full_name` eşleştirilir, `normalizeRole(u.role)` ile rol normalize edilir

---

### [N4_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::allProfilesMapCallback
- **params**: `p` (`AllProfileRow` nesnesi; `p.id`, `p.role`, `p.created_at`, `p.full_name` alanları erişilir)
- **ic_degiskenler**:
  - (dahili değişken yok — doğrudan nesne literal döner)
- **Dönüş**: `UserRow` nesnesi — `email` her zaman `undefined`, `normalizeRole(p.role)` ile rol normalize edilir

---

### [N5_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::handleTabSwitch
- **params**: `next: UsersTab`
- **ic_degiskenler**:
  - `tabRef.current` — mevcut sekme referansı; `next` ile aynıysa erken dönüş yapılır, değilse güncellenir
- **Dönüş**: yok (yan etki: `setActiveTab(next)` çağırır, `table.reload()` tetikler)

---

### [N6_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::handleRoleChange
- **params**: `row: UserRow`, `newRole: UserRoleCode`
- **ic_degiskenler**:
  - `hasWriteAccess` — kullanıcının yazma izni olup olmadığını belirten boolean; `false` ise toast gösterilip fonksiyon sonlanır
  - `t` — i18n çeviri fonksiyonu; toast mesajlarında ve hata mesajlarında kullanılır
  - `updatingRole` / `setUpdatingRole` — hangi satırın rolünün güncellendiğini takip eden state; `row.id` atanır, finally bloğunda `null` yapılır
  - `row.id` — güncellenen kullanıcının benzersiz tanımlayıcısı
  - `row.role` — güncellenen kullanıcının mevcut rolü; audit `before` kaydına yazılır
  - `newRole` — hedef rol; audit `after` kaydına yazılır
  - `mutateWithAudit` — audit loglu mutation yardımcısı; `supabaseBrowserClient`, `resource: 'users'`, `action: 'UPDATE'`, `rowPk: row.id`, `before`, `after`, `auditedByEdge: false`, `fn` parametreleriyle çağrılır
  - `e` — catch bloğundaki hata nesnesi; `AdminPermissionError` kontrolü yapılır
- **Dönüş**: yok (yan etki: toast gösterir, `table.reload()` çağırır)

---

### [N7_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::innerSetRole
- **params**: (dışarıdan kapanış: `row.id`, `newRole`)
- **ic_degiskenler**:
  - `success` — `setUserAdminRole(row.id, newRole)` çağrısının dönüş değeri; `false` ise hata fırlatılır
- **Dönüş**: `Promise<void>` — başarı durumunda sessiz, başarısızsa `Error('role_update_failed')` fırlatır

---

### [N8_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::getRoleIcon
- **params**: `roleCode: string`
- **ic_degiskenler**:
  - (dahili değişken yok — switch/case ile doğrudan JSX döner)
- **Dönüş**: `JSX.Element` — `'super_admin'` → `<Crown>`, `'admin'` → `<Shield>`, `'warehouse'`/`'sales'` → `<ShieldCheck>`, default → `<Users>`

---

### [N9_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::UserAvatar
- **params**: `name?: string`, `email?: string`
- **ic_degiskenler**:
  - `initial` — `(name || email || '?').charAt(0).toUpperCase()` ile hesaplanan avatar baş harfi
- **Dönüş**: `JSX.Element` — gradyan arka planlı, `initial` harfini gösteren div

---

### [N10_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::RoleButton
- **params**: `row: UserRow`, `target: UserRoleCode`, `disabled: boolean`
- **ic_degiskenler**:
  - `row` — hedef satır; `handleRoleChange(row, target)` çağrısına geçirilir
  - `target` — hedef rol kodu; `ROLE_BUTTON_TONE[target]` className ve `ROLE_BUTTON_ICON[target]` icon için kullanılır
  - `disabled` — butonun devre dışı olup olmadığını belirler
- **Dönüş**: `JSX.Element` — rol değiştirme butonu

---

### [N11_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::columnsDefinition
- **params**: (parametre yok — useMemo callback)
- **ic_degiskenler**:
  - `t` — i18n çeviri fonksiyonu; sütun başlıkları ve hücre metinleri için kullanılır
  - `role` — mevcut kullanıcının rolü; actions sütununda `isActor` hesaplaması ve `targetProtected` kontrolü için kullanılır
  - `user` — mevcut kullanıcı nesnesi; `user?.id` ile `isSelf` kontrolü yapılır
  - `updatingRole` — hangi satırın güncellendiğini tutan state; `busy` değişkenine atanır
  - `hasWriteAccess` — yazma izni boolean;但onların `disabled` koşullarında kullanılır
  - `lang` — mevcut dil kodu; `formatDate` çağrısına geçirilir (`'tr' | 'en'` cast edilir)
- **Dönüş**: `AdminColumn<UserRow>[]` — `user`, `role`, `created_at`, `actions` sütunlarını içeren dizi

---

### [N12_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::userCellRenderer
- **params**: `r: UserRow` (sütun callback parametresi)
- **ic_degiskenler**:
  - `r.full_name` — kullanıcının tam adı; `UserAvatar`'a geçirilir, varsa alt satırda gösterilir
  - `r.email` — kullanıcının e-postası; `UserAvatar`'a geçirilir, üst satırda truncateli gösterilir; `undefined` ise `t('admin.users.noEmail')` fallback kullanılır
- **Dönüş**: `JSX.Element` — avatar + email + full_name içeren flex layout

---

### [N13_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::roleCellRenderer
- **params**: `r: UserRow` (sütun callback parametresi)
- **ic_degiskenler**:
  - `r.role` — kullanıcının rol kodu; `getRoleIcon(r.role)` ile icon ve `t(\`roles.${r.role}\`)` ile çevrilmiş ad gösterilir
- **Dönüş**: `JSX.Element` — icon + çevrilmiş rol adını içeren badge

---

### [N14_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::createdAtCellRenderer
- **params**: `r: UserRow` (sütun callback parametresi)
- **ic_degiskenler**:
  - `r.created_at` — kullanıcının oluşma tarihi; `formatDate(r.created_at, lang)` ile formatlanır; `undefined` ise `t('admin.users.noEmail')` fallback kullanılır
- **Dönüş**: `JSX.Element` — formatlanmış tarih + etiket içeren flex column

---

### [N15_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::actionsCellRenderer
- **params**: `r: UserRow` (sütun callback parametresi)
- **ic_degiskenler**:
  - `isActor` — `role === 'super_admin' || role === 'admin'` boolean; mevcut kullanıcının rol değiştirme yetkisi olup olmadığını belirler
  - `isSelf` — `r.id === user?.id` boolean; satırın mevcut kullanıcıya ait olup olmadığını kontrol eder
  - `targetProtected` — `r.role === 'super_admin' && role !== 'super_admin'` boolean; süper admin rolündeki kullanıcının yalnızca başka bir süper admin tarafından değiştirilebildiğini belirtir
  - `busy` — `updatingRole === r.id` boolean; o satırda rol güncellemesi devam ediyorsa true olur
  - `r.role` — hedef satırın mevcut rolü; hangi butonların gösterileceğini belirler
  - `role` — mevcut kullanıcının rolü; `isActor` ve `targetProtected` hesaplamalarında kullanılır
  - `hasWriteAccess` — yazma izni; her `RoleButton`'ın `disabled` propuna geçirilir
  - `user?.id` — mevcut kullanıcının ID'si; `isSelf` kontrolünde kullanılır
- **Dönüş**: `JSX.Element` — koşullu olarak gösterilen `RoleButton` bileşenlerinden oluşan flex container

---

### [N16_NASIL] AST Pointer: src/views/admin/AdminUsersTableBody.tsx::AdminUsersTableBody (ana bileşen)
- **params**: `{ isAdmin: boolean }`
- **ic_degiskenler**:
  - `tabRef` — `useRef` ile oluşturulan sekme referansı (`'admins'` veya `'all'`)
  - `activeTab` / `setActiveTab` — mevcut sekme state'i
  - `updatingRole` / `setUpdatingRole` — güncellenen satır ID state'i
  - `table` — `DataTableKit`'ten dönen tablo kontrol nesnesi (`table.reload()`)
  - `hasWriteAccess` — `isAdmin` propundan türetilen yazma izni boolean
  - `role` — mevcut kullanıcının rolü; sütun tanımlarında kullanılır
  - `user` — mevcut kullanıcı nesnesi; `user?.id` erişimi yapılır
  - `t` — i18n çeviri fonksiyonu
  - `lang` — mevcut dil kodu
- **Dönüş**: `JSX.Element` — `AdminToolbar` + `DataTableKit` içeren React bileşeni; yan etki olarak veri çeker, rol günceller, toast gösterir

---

## NODE ID STANDARD

  file: src\views\admin\AdminUsersTableBody.tsx
  function: src\views\admin\AdminUsersTableBody.tsx::normalizeRole
  function: src\views\admin\AdminUsersTableBody.tsx::AdminUsersTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminUsersTableBody
  export: normalizeRole

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-lg`, `rounded-hvac-xl`, `shadow-glow-md`, `tracking-hvac-normal`, `tracking-hvac-snug`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-cyan-400/5`, `bg-gradient-to-br`, `bg-red-500/10`, `bg-white/5`, `border-red-500/20`, `border-white/10`, `border-white/5`, `from-white/10`, `group-hover:bg-cyan-400/10`, `group-hover:border-cyan-400/30`, `group-hover:text-cyan-400`, `hover:bg-white/5`, `hover:border-cyan-400/30`, `hover:text-white`
- **Layout:** `absolute`, `flex`, `flex-1`, `flex-col`, `from-white/10`, `gap-2`, `gap-3`, `gap-4`, `gap-8`, `grid`, `grid-cols-1`, `h-10`, `h-16`, `h-8`, `h-96`
- **Varyant/Responsive:** `:`, `active:`, `disabled:`, `group-hover/item:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `$`, `${ROLE_BUTTON_TONE[target]`, `-mr-48`, `-mt-48`, `:`, `===`, `active:scale-95`, `activeTab`, `admins`, `all`, `blur-120`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-40`, `duration-1000`