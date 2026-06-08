---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx
skeleton_hash: 709af37d99f8ce2a
entity_hashes:
  func:AccountReturnsPage: b01b740ffc8dc4da
  overview: 70765e01ef58b9d6
  style_tokens: d5328287ff24abb4
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
`AccountReturnsPage`, kullanıcının hesap panelinden iade taleplerini görüntülediği ve yeni iade talepleri oluşturduğu React sayfa bileşenidir. Supabase üzerinden iade kayıtlarını ve ilişkili sipariş bilgilerini çekerek sayfa durumlarını yönetir.

## Fonksiyon Grupları
### Sayfa Bileşeni (AccountReturnsPage)
Tek bileşen olarak tüm modül sorumluluklarını üstlenir: iade listesini yükler, form açma/kapama durumunu yönetir, Supabase'e yeni kayıt ekler ve iade sürecinin zaman çizelgesini render eder. Kimlik, çeviri, URL parametreleri ve yönlendirme hook'larını kullanarak bağımsız çalışır.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::useEffectCallbackReturns
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — bileşen hâlâ bağlıysa true olan bayrak, asenkron işlemler tamamlandığında durumu güncellemek için kullanılır
  - `load` — asenkron fonksiyon, venthub_returns tablosundan verileri yükler ve state'i günceller
- **Dönüş**: () => { mounted = false } (temizleme işlevi)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `list` — supabase'den gelen veriler (venthub_returns tablosu)
  - `error` — supabase sorgusundaki hata (yoksa null)
- **Dönüş**: void (side-effect: setRows ile state güncellenir)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::useEffectCallbackOrders
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — bileşen hâlâ bağlıysa true olan bayrak
  - `loadOrders` — asenkron fonksiyon, venthub_orders tablosundan siparişleri yükler
- **Dönüş**: () => { mounted = false } (temizleme işlevi)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::loadOrders
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — supabase'den gelen sipariş verileri (OrderLite[] türünde)
  - `error` — supabase sorgusundaki hata
  - `fb` — hata durumunda alternatif sorgu sonucu (fallback)
- **Dönüş**: void (side-effect: setOrders ile state güncellenir)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::mapOrder
- **params**: `o` — bir sipariş nesnesi (id, order_number, created_at içeren)
- **ic_degiskenler**: (yok)
- **Dönüş**: { id: string, created_at: string, order_number: string }

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::useEffectCallbackPrefill
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (side-effect: setOpenModal(true) çağrılır)

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::getReasons
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: string[] — iade sebepleri listesi

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::handleCreateReturn
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `payload` — supabase'e eklenecek veri yapısı (order_id, user_id, reason, description)
  - `error` — supabase insert işlemindeki hata
  - `list` — refresh sonrası güncellenen return listesi
- **Dönüş**: void (side-effect: toast mesajları, modal kapatma, state güncellemeleri, navigasyon)

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::statusClass
- **params**: `s` — durum string'i (requested, approved, vb.)
- **ic_degiskenler**:
  - `v` — küçük harfe çevrilmiş durum string'i
- **Dönüş**: string — CSS sınıf adı

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::getStatusIcon
- **params**: `status` — durum string'i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element — duruma göre ikon bileşeni

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::getStatusLabel
- **params**: `status` — durum string'i
- **ic_degiskenler**: (yok)
- **Dönüş**: string — lokalize edilmiş durum etiketi

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::getReturnTimeline
- **params**: `currentStatus` — mevcut durum string'i
- **ic_degiskenler**:
  - `allSteps` — tüm olası timeline adımlarının listesi (key ve label içeren nesneler)
  - `currentIndex` — mevcut durumun allSteps dizisindeki indeksi
- **Dönüş**: TimelineStep[] — her adımın tamamlanma ve mevcut durum bilgileri

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::mapTimelineStep
- **params**: 
  - `step` — bir timeline adımı nesnesi (key, label)
  - `index` — adımın dizideki indeksi
- **ic_degiskenler**: (yok)
- **Dönüş**: TimelineStep — güncellenmiş timeline adımı (completed ve isCurrent özellikleri eklenmiş)

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::renderFilterButton
- **params**: `opt` — filtre seçeneği nesnesi (value ve label özelliklerine sahip)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element — buton bileşeni

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::renderReturnItem
- **params**: `r` — ReturnRow nesnesi (id, order_id, reason, description, status, created_at)
- **ic_degiskenler**:
  - `o` — orders dizisinde order_id eşleşen sipariş nesnesi
  - `code` — formatlanmış sipariş kodu (# ile başlayan)
  - `timeline` — iade durumu için timeline adımları
- **Dönüş**: JSX.Element — iade kalemi kartı

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::renderTimelineStep
- **params**:
  - `step` — timeline adımı nesnesi (key, label, completed, isCurrent, isTerminal)
  - `index` — adımın dizideki indeksi
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Fragment — timeline adımının JSX gösterimi

### [N17_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx::renderOrderOption
- **params**: `o` — OrderLite nesnesi (id, order_number, created_at)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element — option bileşeni

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