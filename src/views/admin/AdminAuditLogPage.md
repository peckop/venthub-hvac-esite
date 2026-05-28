---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminAuditLogPage.tsx
skeleton_hash: faa129e425bec71a
entity_hashes:
  func:AdminAuditLogPage: 50d17db2bc55805a
  overview: 2053e68b7986a9b1
  style_tokens: d2a1c3bee3a34f52
generated_at: 2026-05-28T22:38:53Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının yönetici paneli altındaki denetim günlüğü sayfasını uygulayan tek React bileşenini barındırır. Yalnızca yetkili yönetici kullanıcıların sistemde gerçekleştirilen tüm eylemlerin kayıtlarını görüntülemesi için bir kullanıcı arayüzü sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek sorumluluğunu kapsar: Yönetici denetim günlüğü sayfasının tüm kullanıcı arayüzünü ve temel işlevselliğini sağlayan React bileşenini tanımlar.
- AdminAuditLogPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminAuditLogPage
**Ne yapar**: VentHub HVAC projesinin admin paneline ait sistem denetim günlükleri (audit log) sayfasını oluşturan React bileşenidir. Yalnızca yetkili yönetici kullanıcıların erişebildiği bu sayfa, platform üzerinde gerçekleştirilen tüm kullanıcı ve sistem aktivitelerinin kaydedildiği günlükleri görüntülemek amacıyla tasarlanmıştır. Projenin admin rotaları altında çağrılarak yönetici kullanıcıların karşısına denetim kayıtları arayüzünü çıkarır.
**Nasıl yapar**: TypeScript ile yazılmış bir React fonksiyonel bileşeni olarak tanımlanmış, projenin src/views/admin dizini altında yer alan AdminAuditLogPage.tsx dosyasında barınmaktadır. React rota yönetim sistemi tarafından tetiklendiğinde ana admin şablonu içine yerleştirilerek ekrana render edilir, kendi iç yapısında gerekli veri yönetimi ve arayüz düzenleme işlemlerini yürüterek denetim kayıtlarını kullanıcıya sunar.
**Parametreler**: Herhangi bir giriş parametresi almaz, standart React sayfa bileşeni olarak rota sistemi tarafından çağrılır, tüm ihtiyaç duyduğu verileri ve bağlamları içindeki araçlar ve servisler aracılığıyla kendi bünyesinde karşılar.
**Dönüş**: React.FC türünde bir değer döndürür. Bu dönen değer, React tarafından işlenerek DOM'a eklenmek üzere hazırlanmış, denetim günlükleri sayfasının kullanıcı arayüzünü oluşturan React fonksiyonel bileşen instance'ıdır.

---

## INTERFACES

### AuditRow
- `id: string`
- `at: string`
- `actor: string | null`
- `table_name: string`
- `row_pk: string | null`
- `action: string`
- `comment: string | null`
- `before: unknown`
- `after: unknown`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminAuditLogPage.tsx::AdminAuditLogPage
- **params**: (none)
- **ic_degiskenler**:
  - `t` — translation function from `useI18n`
  - `lang` — current language code from `useI18n`
  - `dragScrollRef` — ref object for drag‑scroll container from `useDragScroll`
  - `router` — Next.js router instance from `useRouter`
  - `rows` — state array of `AuditRow` objects
  - `setRows` — state updater for `rows`
  - `loading` — boolean state indicating data fetch in progress
  - `setLoading` — state updater for `loading`
  - `error` — string or null state for error message
  - `setError` — state updater for `error`
  - `total` — numeric state of total audit log count
  - `setTotal` — state updater for `total`
  - `page` — current page number state
  - `setPage` — state updater for `page`
  - `q` — search query string state
  - `setQ` — state updater for `q`
  - `debouncedQ` — debounced search query string state
  - `setDebouncedQ` — state updater for `debouncedQ`
  - `fromDate` — start date filter string state
  - `setFromDate` — state updater for `fromDate`
  - `toDate` — end date filter string state
  - `setToDate` — state updater for `toDate`
  - `action` — action filter string state
  - `setAction` — state updater for `action`
  - `batch` — batch filter string state
  - `setBatch` — state updater for `batch`
  - `pathname` — current path string from `usePathname`
  - `searchParams` — URL search parameters object from `useSearchParams`
  - `expandedId` — id of currently expanded row or null
  - `setExpandedId` — state updater for `expandedId`
- **Dönüş**: JSX element tree rendering the audit log page

---

## NODE ID STANDARD

  file: src\views\admin\AdminAuditLogPage.tsx
  function: src\views\admin\AdminAuditLogPage.tsx::AdminAuditLogPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminAuditLogPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-xl`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500/5`, `bg-black/40`, `bg-cyan-400/3`, `bg-cyan-500/10`, `bg-emerald-500/10`, `bg-rose-500/10`, `bg-rose-500/5`, `bg-slate-500/10`, `bg-surface-deep/40`, `bg-surface-deep/60`, `bg-transparent`, `bg-white/2`, `border-amber-500/20`, `border-cyan-500/20`, `border-emerald-500/20`
- **Layout:** `!h-10`, `!h-8`, `!p-0`, `!w-10`, `flex`, `gap-2`, `gap-3`, `gap-4`, `h-10`, `items-center`, `justify-between`, `justify-center`, `max-w-xs`, `overflow-hidden`, `overflow-x-auto`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `focus-within:`, `group-focus-within:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `!bg-white/5`, `!border-white/10`, `!px-3`, `!rounded-xl`, `$`, `${adminButtonSecondaryClass`, `${adminTableActionClass`, `${adminTableCellClass`, `${expandedId`, `:`, `===`, `DELETE`, `INSERT`, `UPDATE`, `animate-in`