---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx
skeleton_hash: 109a1efcdb007f73
entity_hashes:
  func:AccountReturnsPage: b01b740ffc8dc4da
  overview: edff17140391afac
  style_tokens: d5328287ff24abb4
generated_at: 2026-05-29T18:52:47Z
---

## Genel Bakış
`AccountReturnsPage`, kullanıcıların iade işlemlerini görüntüleyebildiği, yeni iade talepleri oluşturabildiği ve iade sürecinin durumunu takip edebildiği bir hesap sayfası bileşenidir. Supabase üzerinden iade kayıtlarını ve sipariş bilgilerini çekerek, loading/error/empty durumlarını yöneten tek bileşenli bir yapı sunar.

## Fonksiyon Grupları
### Veri Çekme ve Durum Yönetimi
Bileşen içindeki asenkron veri yükleme işlemlerini, Supabase sorgularını ve sayfa durumlarının (yükleniyor, hata, boş liste) yönetimini kontrol eder.
- AccountReturnsPage (useEffect içinde load ve loadOrders fonksiyonlarıyla veri çekme akışı)

### Form ve Modal İşlemleri
Yeni iade talebi oluşturma formunun durumunu, modal açma/kapama mantığını ve form doğrulama ile kayıt ekleme işlemlerini yönetir.
- AccountReturnsPage (form state, openModal, handleCreate fonksiyonu)

### Sayfa Render ve Görsel Sunum
Sayfa düzenini, iade listesi tablosunu, durum göstergelerini ve iade süreci zaman çizelgesini oluşturan render mantığını içerir.
- AccountReturnsPage (JSX yapısı, statusClass, getStatus yardımcıları)

---



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

### [N1_NASIL] AST Pointer: `AccountReturnsPage.tsx`::useEffect_load_returns
- **params**: () (React useEffect callback, parametre yok)
- **ic_degiskenler**:
  - `mounted` — useEffect cleanup flag; component unmount olduğunda false yapılır, state güncellemelerini engeller
- **Dönüş**: cleanup fonksiyonu döner (`() => { mounted = false }`)

### [N2_NASIL] AST Pointer: `AccountReturnsPage.tsx`::load
- **params**: () (parametre yok, closure içinde user, mounted, setRows, setLoading, t erişir)
- **ic_degiskenler**:
  - `list` — supabase'den dönen iade kayıtları dizisi (destructuring ile `{ data: list, error }`)
  - `error` — supabase sorgusundan dönen hata nesnesi (destructuring ile `{ data: list, error }`)
- **Dönüş**: yok (async void; setRows ile state günceller, toast.error ile hata gösterir)

### [N3_NASIL] AST Pointer: `AccountReturnsPage.tsx`::useEffect_load_orders
- **params**: () (React useEffect callback, parametre yok)
- **ic_degiskenler**:
  - `mounted` — useEffect cleanup flag; component unmount olduğunda false yapılır
- **Dönüş**: cleanup fonksiyonu döner (`() => { mounted = false }`)

### [N4_NASIL] AST Pointer: `AccountReturnsPage.tsx`::loadOrders
- **params**: () (parametre yok, closure içinde user, mounted, setOrders erişir)
- **ic_degiskenler**:
  - `data` — supabase'den dönen sipariş verileri (destructuring ile `let { data, error }`)
  - `error` — supabase sorgusundan dönen hata nesnesi (destructuring ile `let { data, error }`)
  - `fb` — fallback sorgu sonucu; `order_number` sütunu yoksa alternatif select sonucu (`const fb = await supabase...`)
- **Dönüş**: yok (async void; setOrders ile state günceller)

### [N5_NASIL] AST Pointer: `AccountReturnsPage.tsx`::useEffect_prefill_modal
- **params**: () (React useEffect callback, parametre yok)
- **ic_degiskenler**: (yok — sadece prefillOrderId kontrolü yapıp setOpenModal çağırır)
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: `AccountReturnsPage.tsx`::getReasons
- **params**: () (parametre yok)
- **ic_degiskenler**: (yok — doğrudan string dizisi literal döner)
- **Dönüş**: `string[]` — iade sebepleri dizisi: `['Yanlış ürün/eksik parça', 'Hasarlı ürün', 'Uyumsuz/istenen özelliklerde değil', 'Fikrim değişti', 'Diğer']`

### [N7_NASIL] AST Pointer: `AccountReturnsPage.tsx`::handleSubmitReturn
- **params**: () (async arrow function, parametre yok; closure içinde form, user, supabase, toast, t, setOpenModal, setForm, setRows, router erişir)
- **ic_degiskenler**:
  - `payload` — supabase insert için hazırlanan nesne; `order_id`, `user_id`, `reason`, `description` alanlarını içerir
  - `list` — insert sonrası yeniden sorgulanan iade kayıtları dizisi (`const { data: list } = await supabase...`)
- **Dönüş**: yok (async void; toast.success/toast.error ile bildirim, setOpenModal ile modal kapatma, router.push ile navigasyon)

### [N8_NASIL] AST Pointer: `AccountReturnsPage.tsx`::statusClass
- **params**: `(s: string)` — iade durumu stringi
- **ic_degiskenler**:
  - `v` — parametrenin küçük harfe çevrilmiş hali, karşılaştırma için (`const v = (s || '').toLowerCase()`)
- **Dönüş**: `string` — Tailwind CSS class name (ör: `'bg-yellow-100 text-yellow-800'`)

### [N9_NASIL] AST Pointer: `AccountReturnsPage.tsx`::getStatusIcon
- **params**: `(status: string)` — iade durumu stringi
- **ic_degiskenler**: (yok — switch/if ile doğrudan JSX element döner)
- **Dönüş**: `JSX.Element` — duruma göre icon bileşeni (Clock, CheckCircle, XCircle, Truck, Package, RefreshCw)

### [N10_NASIL] AST Pointer: `AccountReturnsPage.tsx`::getStatusLabel
- **params**: `(status: string)` — iade durumu stringi
- **ic_degiskenler**: (yok — doğrudan t() çağrısının sonucu döner)
- **Dönüş**: `string` — localized durum etiketi (`t(\`returns.statusLabels.${status}\`)`) veya status'un kendisi

### [N11_NASIL] AST Pointer: `AccountReturnsPage.tsx`::getReturnTimeline
- **params**: `(currentStatus: string)` — mevcut iade durumu
- **ic_degiskenler**:
  - `allSteps` — tüm timeline adımlarının tanımlı dizisi; her biri `{ key, label }` yapısındadır (5 adım: requested, approved, in_transit, received, refunded)
  - `currentIndex` — currentStatus'un allSteps dizisindeki indeksi; `-1` ise bulunamamıştır (`allSteps.findIndex(step => step.key === currentStatus)`)
- **Dönüş**: `TimelineStep[]` — her adım için `{ key, label, completed?, isCurrent?, isTerminal? }` nesnelerinden oluşan dizi

### [N12_NASIL] AST Pointer: `AccountReturnsPage.tsx`::renderReturnCard
- **params**: `(r)` — ReturnRow tipinde bir iade kaydı nesnesi
- **ic_degiskenler**:
  - `o` — orders dizisi içinde r.order_id eşleşen sipariş nesnesi (`orders.find(x => x.id === r.order_id)`)
  - `code` — gösterim için sipariş kodu; order_number varsa `#${order_number.split('-')[1]}`, yoksa `#${r.order_id.slice(-8).toUpperCase()}`
  - `timeline` — bu iade kaydının durumuna göre timeline adımları dizisi (`getReturnTimeline(r.status)`)
- **Dönüş**: `JSX.Element` — iade kaydı kart JSX'i (header, details, progress timeline bölümleri)

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