---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountReturnsPage.tsx
skeleton_hash: 4efd1464e1206194
entity_hashes:
  func:AccountReturnsPage: 9093f5ff722c6443
  overview: 70765e01ef58b9d6
  style_tokens: d5328287ff24abb4
generated_at: 2026-06-14T17:23:29Z
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

**Ne yapar**: Kullanıcının hesabına ait iade taleplerini listeler, filtreler ve yeni iade talebi oluşturma imkanı sunar. Supabase veritabanından sipariş ve iade verilerini çekerek, iade sürecinin durumunu zaman çizelgesi üzerinde görsel olarak takip edebilmeyi sağlar.

**Nasıl yapar**: Fonksiyon bir React fonksiyon bileşenidir ve hook'ları kullanarak durum yönetimi, veri getirme ve yan etkileri yönetir. `useAuth` hook'u ile oturum açmış kullanıcıyı, `useI18n` hook'u ile çeviri fonksiyonlarını ve mevcut dili alır. `useSearchParams` ile URL'deki `?new=<order_id>` parametresini okuyarak ilgili sipariş ID'sini önceden doldurur. İki ayrı `useEffect` ile paralel olarak `venthub_returns` ve `venthub_orders` tablolarından verileri çeker. İlk `useEffect` (`[user, t]` bağımlılıklı), kullanıcının tüm iade taleplerini `venthub_returns` tablosundan `created_at` alanına göre azalan sırayla getirir; 404 hatası alırsa (tablo mevcut değilse) boş liste gösterir, otros hatalarda toast bildirimi yapar. İkinci `useEffect` (`[user]` bağımlılıklı), kullanıcının siparişlerini `venthub_orders` tablosundan çeker; `order_number` alanı mevcut değilse veya sorgu hatası alırsa (`42703` kodu ile), `id` ve `created_at` alanlarıyla alternatif bir sorgu yaparak geriye dönük uyumluluk sağlar. `handleCreate` fonksiyonu, form verilerini doğrulayıp `venthub_returns` tablosuna yeni kayıt ekler, ardından listeyi yenileyip ilgili sayfaya yönlendirir. `getReturnTimeline` fonksiyonu, iade durumuna göre zaman çizelgesi adımlarını hesaplar; `rejected` veya `cancelled` durumları için terminal (son) durum olarak işlenir. `statusClass` fonksiyonu duruma göre Tailwind CSS sınıf döndürerek renk kodlaması yapar. `getStatusIcon` fonksiyonu her durum için uygun Lucider ikon bileşenini (`Clock`, `CheckCircle`, `XCircle`, `Truck`, `Package`, `RefreshCw`) döndürür. `getStatusLabel` fonksiyonu ise i18n çeviri sistemi üzerinden durum etiketini getirir. `reasonOptions` `useMemo` ile hesaplanarak her render'da yeniden oluşturulması engellenir.

**Parametreler**:

Bu fonksiyon parametre almaz. Fonksiyon bir React bileşenidir ve tüm verileri hook'lar ve iç durum yoluyla yönetir.

- **`user`** (iç): `useAuth()` hook'undan elde edilen nesne — oturum açmış kullanıcının bilgilerini içerir; `user.id` alanı ile veritabanı sorgularında kullanılır.
- **`t`** (iç): `useI18n()` hook'undan elde edilen çeviri fonksiyonu — string anahtarlarına karşılık gelen lokalize metinleri döndürür.
- **`lang`** (iç): `useI18n()` hook'undan elde edilen dil kodu — `formatDate` fonksiyonuna gönderilerek tarihlerin doğru formatta gösterilmesini sağlar.
- **`rows`** (iç durum): `ReturnRow[]` tipinde — veritabanından çekilen iade taleplerinin listesi; her biri `id`, `order_id`, `reason`, `description`, `status`, `created_at` alanlarını içerir.
- **`orders`** (iç durum): `OrderLite[]` tipinde — kullanıcının siparişlerinin listesi; her biri `id`, `order_number`, `created_at` alanlarını içerir.
- **`loading`** (iç durum): `boolean` — verilerin arka planda yüklenip yüklenmediğini belirtir; `true` iken yükleme animasyonu gösterilir.
- **`openModal`** (iç durum): `boolean` — yeni iade formunun açılıp kapanma durumunu kontrol eder.
- **`statusFilter`** (iç durum): `string` — mevcut durum filtresini tutar; varsayılan olarak `'all'` değerindedir ve `'requested'`, `'approved'`, `'in_transit'`, `'refunded'`, `'rejected'` değerlerini alabilir.
- **`prefillOrderId`** (iç): `string` — URL'deki `?new=` parametresinden okunan sipariş ID'si; modal açıldığında ilgili siparişin otomatik seçilmesini sağlar.
- **`form`** (iç durum): `{ order_id: string, reason: string, description: string }` — iade form alanlarının güncel değerlerini tutar.
- **`reasonOptions`** (iç): `string[]` — iade nedeni seçeneklerinin localized listesi; `useMemo` ile `t` fonksiyonuna bağımlı olarak hesaplanır ve beş seçenek sunar: yanlış ürün, hasarlı, uyumsuz, fikir değiştirme, diğer.
- **`statusClass`** (iç): `(s: string) => string` — durum dizesini alarak ilgili Tailwind CSS arka plan ve metin renk sınıfını döndürür.
- **`getStatusIcon`** (iç): `(status: string) => JSX.Element` — durum dizesine göre uygun Lucider ikon bileşenini ve rengini döndürür.
- **`getStatusLabel`** (iç): `(status: string) => string` — durum dizesi için i18n çeviri sistemi üzerinden lokalize etiketi döndürür; çeviri bulunamazsa ham durum dizesini döndürür.
- **`getReturnTimeline`** (iç): `(currentStatus: string) => TimelineStep[]` — mevcut iade durumuna göre zaman çizelgesi adımlarını hesaplar; her adım `key`, `label`, `completed`, opsiyonel `isCurrent` ve `isTerminal` alanlarını içerir. Normal akış beş adımdan oluşur: `requested` → `approved` → `in_transit` → `received` → `refunded`. `rejected` veya `cancelled` durumlarında ise sadece `requested` ve terminal durum olmak üzere iki adımlı özel bir zaman çizelgesi döndürür.
- **`handleCreate`** (iç): `async () => Promise<void>` — form verilerini doğrulayıp Supabase'e insert işlemi yapar; başarılıysa toast bildirimi gösterir, modalı kapatır, formu sıfırlar, listeyi yeniler ve `Routes.account.returns()` rotasına yönlendirir.
- **`searchParams`** (iç): `URLSearchParams | null` — `useSearchParams()` hook'undan elde edilen URL arama parametreleri nesnesi.
- **`router`** (iç): `NextRouter` — `useRouter()` hook'undan elde edilen yönlendirici nesnesi; programlı sayfa geçişleri için kullanılır.

**Dönüş**: Fonksiyon bir React JSX bileşeni olarak çalışır ve doğrudan JSX döndürür. Dönüş tipi React bileşeni olduğu için JSX.Element veya void olarak sınıflandırılabilir. Döndürülen JSX, ana bir `<div>` container içinde şu bölümleri içerir: sayfa başlığı ve "Yeni İade" butonu, durum filtreleme barı (en az bir iade kaydı varsa), yükleme animasyonu (loading iken), boş durum gösterimi (kayıt yoksa), iade kartları listesi (her kart için durum rozeti, sipariş bilgisi, iade nedeni/açıklaması ve interaktif zaman çizelgesi) ve modal penceresi (openModal true iken, içinde sipariş seçimi, neden seçimi ve açıklama alanları bulunan formla birlikte).

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDate
- import: ../../utils/routes::Routes
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

### [N1_NASIL] AST Pointer: AccountReturnsPage.tsx::useEffectCallback1
- **params**: ()
- **ic_degiskenler**:
  - `mounted` — Boolean flag, useEffect cleanup fonksiyonuyla false yapılır, state güncelleme kontrolü için kullanılır
  - `load` — Async fonksiyon, venthub_returns tablosundan tüm iade verilerini çeker
  - `list` — supabase.from('venthub_returns').select() çağrısından dönen veri dizisi
  - `error` — supabase.from('venthub_returns').select() çağrısından dönen hata nesnesi
- **Dönüş**: Cleanup fonksiyonu döner (mounted = false)

### [N2_NASIL] AST Pointer: AccountReturnsPage.tsx::load
- **params**: ()
- **ic_degiskenler**:
  - `list` — supabase.from('venthub_returns').select() çağrısından dönen veri dizisi
  - `error` — supabase.from('venthub_returns').select() çağrısından dönen hata nesnesi
- **Dönüş**: yok (state güncelleme yan etkisi var)

### [N3_NASIL] AST Pointer: AccountReturnsPage.tsx::useEffectCallback2
- **params**: ()
- **ic_degiskenler**:
  - `mounted` — Boolean flag, useEffect cleanup fonksiyonuyla false yapılır
  - `loadOrders` — Async fonksiyon, venthub_orders tablosundan kullanıcının siparişlerini çeker
  - `data` — supabase.from('venthub_orders').select() çağrısından dönen veri dizisi
  - `error` — supabase.from('venthub_orders').select() çağrısından dönen hata nesnesi
  - `fb` — Fallback supabase.from('venthub_orders').select() çağrısı sonucu
- **Dönüş**: Cleanup fonksiyonu döner (mounted = false)

### [N4_NASIL] AST Pointer: AccountReturnsPage.tsx::loadOrders
- **params**: ()
- **ic_degiskenler**:
  - `data` — supabase.from('venthub_orders').select() çağrısından dönen veri dizisi
  - `error` — supabase.from('venthub_orders').select() çağrısından dönen hata nesnesi
  - `fb` — Fallback supabase.from('venthub_orders').select() çağrısı sonucu
- **Dönüş**: yok (state güncelleme yan etkisi var)

### [N5_NASIL] AST Pointer: AccountReturnsPage.tsx::orderToOption
- **params**: o
- **ic_degiskenler**:
  - `o` — Sipariş nesnesi (id, created_at, order_number özellikleri)
- **Dönüş**: id vecreated_at özellikleri olan nesne

### [N6_NASIL] AST Pointer: AccountReturnsPage.tsx::openModalOnPrefill
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: yok (openModal(true) yan etkisi var)

### [N7_NASIL] AST Pointer: AccountReturnsPage.tsx::getReasons
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: t() çağrılarıyla çevrilmiş iade nedenleri dizisi

### [N8_NASIL] AST Pointer: AccountReturnsPage.tsx::submitReturn
- **params**: ()
- **ic_degiskenler**:
  - `payload` — venthub_returns tablosuna eklenecek iade verisi (order_id, user_id, reason, description)
  - `list` — Yeni eklenen iade sonrası güncellenen iade listesi
- **Dönüş**: yok (router.push, toast, state güncelleme yan etkileri var)

### [N9_NASIL] AST Pointer: AccountReturnsPage.tsx::statusClass
- **params**: s
- **ic_degiskenler**:
  - `v` — Küçük harfe çevrilmiş iade durumu stringi
- **Dönüş**: Tailwind CSS sınıf adı stringi

### [N10_NASIL] AST Pointer: AccountReturnsPage.tsx::getStatusIcon
- **params**: status
- **ic_degiskenler**: yok
- **Dönüş**: JSX icon element (lucide-react icon bileşeni)

### [N11_NASIL] AST Pointer: AccountReturnsPage.tsx::getStatusLabel
- **params**: status
- **ic_degiskenler**: yok
- **Dönüş**: t() çağrısıyla çevrilmiş iade durumu etiketi

### [N12_NASIL] AST Pointer: AccountReturnsPage.tsx::getReturnTimeline
- **params**: currentStatus
- **ic_degiskenler**:
  - `allSteps` — Tüm iade süreç adım dizisi (requested, approved, in_transit, received, refunded)
  - `currentIndex` — Mevcut duruma denk gelen adımın allSteps içindeki indeksi
- **Dönüş**: TimelineStep[] dizisi (completed, isCurrent, isTerminal özellikleri)

### [N13_NASIL] AST Pointer: AccountReturnsPage.tsx::renderTimelineStep
- **params**: step, index
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (timeline adımı gösteren React.Fragment)

### [N14_NASIL] AST Pointer: AccountReturnsPage.tsx::renderModalTimelineStep
- **params**: step, index
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (modal içinde timeline adımı)

### [N15_NASIL] AST Pointer: AccountReturnsPage.tsx::renderOrderOption
- **params**: o
- **ic_degiskenler**:
  - `o` — Sipariş nesnesi (id, order_number, created_at özellikleri)
- **Dönüş**: JSX option element (form içinde sipariş seçeneği)

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