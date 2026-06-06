---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx
skeleton_hash: 57346a7cf775affd
entity_hashes:
  func:AccountReturnsPage: b01b740ffc8dc4da
  overview: 70b8bcf043553f95
  style_tokens: d5328287ff24abb4
generated_at: 2026-06-06T21:57:02Z
---

## Genel Bakış
`AccountReturnsPage`, kullanıcının hesap panelinden iade taleplerini görüntülediği, yeni iade talepleri oluşturduğu ve iade sürecinin zaman çizelgesiyle takip ettiği React sayfa bileşenidir. Supabase üzerinden iade kayıtlarını ve ilişkili sipariş bilgilerini çekerek sayfa durumlarını (yükleniyor, hata, boş liste) yönetir.

## Fonksiyon Grupları
### Veri Yükleme ve Durum Yönetimi
Supabase sorgularıyla iade kayıtlarını ve sipariş bilgilerini çeker; sayfanın yükleniyor, hata veya boş liste durumlarını kontrol eder.

### Yeni İade Talebi Oluşturma
İade talebi formunun açılmasını, form alanlarının doğrulanmasını ve yeni iade kaydının Supabase'e eklenmesini yönetir.

### Sayfa Düzeni ve Sunum
İade listesi tablosunu, durum göstergelerini ve iade sürecinin zaman çizelgesini render eden görsel bileşen yapısını oluşturur.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AccountReturnsPage
**Ne yapar**: Kullanıcının iade taleplerini listeleyen, yeni iade talebi oluşturulmasını sağlayan ve iade sürecinin durumunu görsel bir zaman çizelgesiyle izletecek bir sayfa bileşeni sunar.  

**Nasıl yapar**:  
- `useAuth`, `useI18n`, `useSearchParams` ve `useRouter` gibi React hook’larıyla kimlik, çeviri, URL parametreleri ve yönlendirme bilgilerini alır.  
- `useEffect` içinde iki ayrı asenkron yükleme fonksiyonu (`load` ve `loadOrders`) çalıştırarak Supabase’dan iade kayıtlarını (`venthub_returns`) ve ilgili siparişleri (`venthub_orders`) çeker, hataları yönetir ve bileşen durumlarını (`rows`, `orders`, `loading`) günceller.  
- Kullanıcı bir sipariş ID’siyle (`?new=`) sayfayı açarsa modal otomatik olarak gösterilir.  
- Form durumunu (`form`) ve modal görünürlüğünü (`openModal`) `useState` ile yönetir.  
- `handleCreate` fonksiyonu, form doğrulaması yapar, yeni iade kaydını Supabase’a ekler, başarılı olduğunda listeyi yeniler ve kullanıcıyı yönlendirir.  
- `statusClass`, `getStatusIcon`, `getStatusLabel` ve `getReturnTimeline` yardımcı fonksiyonları, iade durumuna göre stil, ikon, etiket ve zaman çizelgesi adımlarını üretir.  
- Render aşamasında, yükleme, boş liste, filtreleme ve iade kartları gibi UI durumlarını koşullu olarak gösterir; ayrıca yeni iade oluşturmak için modal içerir.  

**Parametreler**: *Bu fonksiyon dışarıdan parametre almaz.*  

**Dönüş**: `void` – React bileşeni olarak JSX döndürür, doğrudan bir değer üretmez.

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

### [N1_NASIL] AST Pointer: AccountReturnsPage::(effect_cleanup_returns)
- **params**: ()
- **ic_degiskenler**:
  - `mounted` — cleanup flag, controls whether state updates should be applied
  - `load` — async function that fetches returns from Supabase
  - `setLoading` — state setter for loading indicator
  - `setRows` — state setter for returns list
  - `supabase` — Supabase client for database queries
  - `user` — authenticated user object from useAuth hook
  - `t` — translation function from useI18n hook
- **Dönüş**: cleanup function that sets `mounted = false`

### [N2_NASIL] AST Pointer: AccountReturnsPage::load
- **params**: ()
- **ic_degiskenler**:
  - `setLoading` — state setter for loading indicator
  - `list` — returned data from Supabase query (array of ReturnRow objects)
  - `error` — error object from Supabase query
  - `supabase` — Supabase client for database queries
  - `setRows` — state setter for returns list
  - `t` — translation function from useI18n hook
- **Dönüş**: void (sets state via setRows/setLoading)

### [N3_NASIL] AST Pointer: AccountReturnsPage::(effect_cleanup_orders)
- **params**: ()
- **ic_degiskenler**:
  - `mounted` — cleanup flag, controls whether state updates should be applied
  - `loadOrders` — async function that fetches user's orders from Supabase
  - `user` — authenticated user object from useAuth hook
- **Dönüş**: cleanup function that sets `mounted = false`

### [N4_NASIL] AST Pointer: AccountReturnsPage::loadOrders
- **params**: ()
- **ic_degiskenler**:
  - `data` — returned data from Supabase query (array of OrderLite objects)
  - `error` — error object from Supabase query
  - `supabase` — Supabase client for database queries
  - `user` — authenticated user object from useAuth hook
  - `setOrders` — state setter for orders list
  - `fb` — fallback query result when main query fails (object with data and error)
- **Dönüş**: void (sets state via setOrders)

### [N5_NASIL] AST Pointer: AccountReturnsPage::(map_order_transform)
- **params**: o — order object from Supabase query
- **ic_degiskenler**: (none)
- **Dönüş**: transformed order object with id, created_at, order_number properties

### [N6_NASIL] AST Pointer: AccountReturnsPage::(effect_prefill_order)
- **params**: ()
- **ic_degiskenler**:
  - `prefillOrderId` — order ID to pre-fill in the form
  - `setOpenModal` — state setter for modal visibility
- **Dönüş**: void (opens modal if prefillOrderId exists)

### [N7_NASIL] AST Pointer: AccountReturnsPage::(return_reasons)
- **params**: ()
- **ic_degiskenler**: (none)
- **Dönüş**: string array of predefined return reason options

### [N8_NASIL] AST Pointer: AccountReturnsPage::(submit_return)
- **params**: ()
- **ic_degiskenler**:
  - `form` — form state object with order_id, reason, description fields
  - `t` — translation function from useI18n hook
  - `user` — authenticated user object from useAuth hook
  - `supabase` — Supabase client for database queries
  - `setOpenModal` — state setter for modal visibility
  - `setForm` — state setter for form data
  - `router` — Next.js router for navigation
  - `setRows` — state setter for returns list
- **Dönüş**: void (submits form, closes modal, refreshes data, navigates)

### [N9_NASIL] AST Pointer: AccountReturnsPage::statusClass
- **params**: s — status string to determine CSS class
- **ic_degiskenler**: (none)
- **Dönüş**: CSS class string based on status value

### [N10_NASIL] AST Pointer: AccountReturnsPage::getStatusIcon
- **params**: status — status string to determine icon
- **ic_degiskenler**: (none)
- **Dönüş**: JSX icon element (Clock/CheckCircle/XCircle/etc.) based on status

### [N11_NASIL] AST Pointer: AccountReturnsPage::getStatusLabel
- **params**: status — status string to get label for
- **ic_degiskenler**:
  - `t` — translation function from useI18n hook
- **Dönüş**: translated label string for status (or raw status if translation not found)

### [N12_NASIL] AST Pointer: AccountReturnsPage::getReturnTimeline
- **params**: currentStatus — current return status to build timeline for
- **ic_degiskenler**:
  - `allSteps` — array of timeline step objects for normal return flow
  - `currentIndex` — index of current status in allSteps array
  - `getStatusLabel` — function to get translated status label
- **Dönüş**: TimelineStep[] array representing progress steps

### [N13_NASIL] AST Pointer: AccountReturnsPage::(map_timeline_step)
- **params**: step — timeline step object, index — step index
- **ic_degiskenler**: (none)
- **Dönüş**: timeline step object with added completed/isCurrent properties

### [N14_NASIL] AST Pointer: AccountReturnsPage::(map_status_filter_button)
- **params**: opt — filter option object with value and label
- **ic_degiskenler**:
  - `setStatusFilter` — state setter for selected status filter
  - `statusFilter` — current selected status filter value
- **Dönüş**: JSX button element for status filtering

### [N15_NASIL] AST Pointer: AccountReturnsPage::(map_return_card)
- **params**: r — return record object from database
- **ic_degiskenler**:
  - `orders` — array of user's orders for lookup
  - `formatDate` — date formatting function from i18n
  - `lang` — current language setting
  - `statusClass` — function to get CSS classes for status
  - `getStatusIcon` — function to get icon for status
  - `getStatusLabel` — function to get label for status
  - `getReturnTimeline` — function to build timeline for return
  - `router` — Next.js router for navigation
  - `Routes` — route constants
  - `o` — found order object for this return
  - `code` — formatted order code string
  - `timeline` — timeline steps for this return's status
- **Dönüş**: JSX card element displaying return details and timeline

### [N16_NASIL] AST Pointer: AccountReturnsPage::(map_timeline_step_render)
- **params**: step — timeline step object, index — step index
- **ic_degiskenler**: (none)
- **Dönüş**: JSX fragment with step indicator and label

### [N17_NASIL] AST Pointer: AccountReturnsPage::(map_order_option)
- **params**: o — order object
- **ic_degiskenler**:
  - `formatDate` — date formatting function from i18n
  - `lang` — current language setting
- **Dönüş**: JSX option element for order selection dropdown

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