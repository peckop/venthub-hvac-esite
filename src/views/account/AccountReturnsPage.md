---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx
skeleton_hash: 8328433def0f9477
entity_hashes:
  func:AccountReturnsPage: 0eaf9a077da6bd84
  overview: 283031ebf7f41a9c
  style_tokens: d5328287ff24abb4
generated_at: 2026-06-19T20:49:09Z
---

## Genel Bakış
`AccountReturnsPage`, kullanıcının hesap panelinden iade taleplerini görüntülediği ve yeni iade talepleri oluşturduğu React sayfa bileşenidir. Supabase üzerinden iade kayıtlarını ve ilişkili sipariş bilgilerini çekerek iade sürecinin durumunu zaman çizelgesi üzerinde görsel olarak sunar. Tek bileşen yapısında tüm sayfa mantığını, durum yönetimini ve veri akışını kendi içinde yönetir.

## Fonksiyon Grupları

### Sayfa Bileşeni
Tek bileşen olarak tüm modül sorumluluklarını üstlenir: kullanıcının iade taleplerini listeler, yeni iade oluşturma formunu açıp kapatır, Supabase'e kayıt ekler ve iade sürecinin zaman çizelgesini render eder.
- `AccountReturnsPage`

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesi verilmediğinden, sadece fonksiyon imzasından çıkarılabilecek minimal varsayımlar tanımlanmıştır.

[Aksiyom 1]: Eğer React runtime ortamı (JSX/TSX render context) mevcut değilse, `AccountReturnsPage` bileşeni render edilemez.

[Aksiyom 2]: Eğer `AccountReturnsPage` çağrıldığında bileşen içi bağımlılıklar (hooks, context providers) sağlanmamışsa, React hata fırlatır.

[Aksiyom 3]: Fonksiyon imzasında parametre yoktur (`def AccountReturnsPage()`); eğer bileşen prop girdisi bekliyorsa, bu imza ile tutarsızlık oluşur.

---

**Not:** Fonksiyon gövdesi paylaşılmadığı için, Supabase bağlantısı, kimlik doğrulama, iade veri modeli veya form yönetimi gibi detaylı aksiyomlar türetilmemiştir. Fonksiyon gövdesi sağlandığında kapsamlı aksiyom üretimi yapılabilir.

---

## FONKSİYON DETAYLARI

### AccountReturnsPage
**Ne yapar**: Kullanıcının hesap sayfasında iade taleplerini görüntülemesini ve yeni bir iade talebi oluşturmasını sağlayan React sayfa bileşenidir. Kullanıcının tüm iadelerini listeler, durumlarına göre filtreler ve detaylı bir zaman çizelgesi gösterir.
**Nasıl yapar**: Fonksiyon, `useAuth`, `useI18n`, `useRouter` ve `useSearchParams` gibi özel React kancalarını (hooks) kullanarak kullanıcı oturumunu, çevirileri ve URL parametrelerini yönetir. İki ana `useEffect` kancası, Supabase veritabanından (`venthub_returns` ve `venthub_orders` tabloları) verileri asenkron olarak yükler ve bileşen durumunu (`useState`) günceller. `reasonOptions` dizisi `useMemo` ile optimize edilerek gereksiz yeniden hesaplamalar önlenir. Bileşen, bir durum filtresi, iade listesi ve bir oluşturma formu içeren bir modal sunar. İçeride `handleCreate`, `statusClass`, `getStatusIcon`, `getStatusLabel` ve `getReturnTimeline` gibi yardımcı fonksiyonlar, iade verilerinin formatlanmasını, durum etiketlerinin ve zaman çizelgesinin hesaplanmasını sağlar.
**Parametreler**:
- `()` — Fonksiyon parametre almaz, çünkü React bileşenleri props almayan sayfa bileşenleridir (sayfa düzeyinde bir bileşen).
**Dönüş**: `JSX.Element` (veya `React.ReactElement`) — Bileşen, bir sayfa düzeni (layout) döndürür. Bu düzenleme, iade listesini, durum filtresini, yükleniyor göstergesini ve bir iade oluşturma modalını içerir. Bileşen, `venthub_returns` tablosundaki verileri kullanıcıya sunar ve yeni iade talepleri için bir form sağlar.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDate
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::CheckCircle
- import: lucide-react::Clock
- import: lucide-react::Filter
- import: lucide-react::Package
- import: lucide-react::RefreshCw
- import: lucide-react::Truck
- import: lucide-react::XCircle
- import: next/navigation::useRouter
- import: next/navigation::useSearchParams
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### ReturnRow
- `id: string`
- `order_id: string`
- `reason: string`
- `description?: string | null`
- `status: string`
- `created_at: string`

### OrderLite
- `id: string`
- `order_number: string`
- `created_at: string`

### SupabaseError
- `code?: string`
- `status?: number`
- `message?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::useEffectReturnsLoader
- **params**: () => void (React useEffect callback)
- **ic_degiskenler**:
  - `mounted` — Cleanup flag for preventing state updates on unmounted component
  - `load` — Async function that fetches return records from Supabase
  - `list` — Return data array from Supabase query
  - `error` — Error object from Supabase query
- **Dönüş**: Cleanup function () => void

### [N2_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::load
- **params**: () => void
- **ic_degiskenler**:
  - `list` — Return data array from Supabase 'venthub_returns' table
  - `error` — Error object from Supabase query
  - `e` — Catch block error for console.warn
- **Dönüş**: void (side effect: sets rows state, loading state, shows toast)

### [N3_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::useEffectOrdersLoader
- **params**: () => void (React useEffect callback)
- **ic_degiskenler**:
  - `mounted` — Cleanup flag for preventing state updates on unmounted component
  - `loadOrders` — Async function that fetches orders for the return form
- **Dönüş**: Cleanup function () => void

### [N4_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::loadOrders
- **params**: () => void
- **ic_degiskenler**:
  - `data` — Orders data array from Supabase query
  - `error` — Error object from Supabase query
  - `fb` — Fallback query result when first query fails
  - `e` — Catch block error for console.warn
- **Dönüş**: void (side effect: sets orders state)

### [N5_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::mapOrderToOrderLite
- **params**: o => (Order object from Supabase)
- **ic_degiskenler**:
  - `o` — Order object from database with id, order_number, created_at fields
- **Dönüş**: OrderLite object with mapped fields

### [N6_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::useEffectPrefillModal
- **params**: () => void (React useEffect callback)
- **ic_degiskenler**:
  - `prefillOrderId` — Order ID from URL search params for pre-filling return form
- **Dönüş**: void (side effect: opens modal if prefillOrderId exists)

### [N7_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::getReturnReasons
- **params**: () => string[]
- **ic_degiskenler**: (none)
- **Dönüş**: Array of localized return reason strings

### [N8_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::handleReturnSubmit
- **params**: async () => void
- **ic_degiskenler**:
  - `payload` — Return request object with order_id, user_id, reason, description
  - `error` — Error from Supabase insert operation
  - `list` — Updated returns list after successful insert
- **Dönüş**: void (side effect: inserts return, resets form, refreshes list, navigates)

### [N9_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::statusClass
- **params**: (s: string) => string
- **ic_degiskenler**:
  - `v` — Lowercase status string for comparison
- **Dönüş**: Tailwind CSS class string based on status value

### [N10_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::getStatusIcon
- **params**: (status: string) => JSX.Element
- **ic_degiskenler**: (none)
- **Dönüş**: Lucide icon component based on status value

### [N11_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::getStatusLabel
- **params**: (status: string) => string
- **ic_degiskenler**: (none)
- **Dönüş**: Localized status label string

### [N12_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::getReturnTimeline
- **params**: (currentStatus: string) => TimelineStep[]
- **ic_degiskenler**:
  - `allSteps` — Array of all possible timeline steps with keys and labels
  - `currentIndex` — Index of current status in allSteps array
- **Dönüş**: TimelineStep[] with completed/isCurrent flags

### [N13_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::mapTimelineStep
- **params**: (step, index) => TimelineStep
- **ic_degiskenler**:
  - `step` — Timeline step object from allSteps
  - `index` — Index of step in the array
  - `currentIndex` — Index of current status (from closure)
- **Dönüş**: TimelineStep with completed/isCurrent properties

### [N14_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::renderStatusFilterButton
- **params**: opt => void
- **ic_degiskenler**:
  - `opt` — Filter option object with value and label
- **Dönüş**: JSX button element for status filter

### [N15_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::renderReturnRow
- **params**: r => ReturnRow
- **ic_degiskenler**:
  - `r` — ReturnRow object from rows state
  - `o` — Corresponding order object from orders array
  - `code` — Formatted order code for display
  - `timeline` — Timeline steps for return status
- **Dönüş**: JSX div element for return row

### [N16_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::renderTimelineStep
- **params**: (step, index) => JSX.Element
- **ic_degiskenler**:
  - `step` — Timeline step object from getReturnTimeline
  - `index` — Index of step in the timeline
- **Dönüş**: JSX Fragment with step circle and connector

### [N17_NASIL] AST Pointer: src\views\account\AccountReturnsPage.tsx::renderOrderOption
- **params**: o => OrderLite
- **ic_degiskenler**:
  - `o` — OrderLite object from orders state
- **Dönüş**: JSX option element for order select

---

## NODE ID STANDARD

  file: src\views\account\AccountReturnsPage.tsx
  function: src\views\account\AccountReturnsPage.tsx::AccountReturnsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountReturnsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-primary-navy/5`, `bg-red-500`, `bg-slate-100`, `bg-slate-50`, `bg-slate-50/80`, `bg-slate-900/40`, `bg-white`, `border-b`, `border-b-2`, `border-primary-navy`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-t`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `grid`, `grid-cols-1`, `h-1`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${statusClass(r.status`, `${statusFilter`, `${step.completed`, `:`, `===`, `animate-in`, `animate-spin`, `border`, `cancelled`, `duration-200`, `fade-in`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/20`, `focus-visible:ring-primary-navy/50`