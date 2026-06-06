---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminWebhookEventsPage.tsx
skeleton_hash: 9b69492b52d4088d
entity_hashes:
  func:AdminWebhookEventsPage: 48683db839635910
  func:fetchEvents: 48cd1e3258f9387a
  overview: 08c43a78d63b3e0f
  style_tokens: e452abbd98ef7800
generated_at: 2026-06-06T21:58:12Z
---

## Genel Bakış
Venthub HVAC yönetici panelindeki webhook olaylarını izlemeye yönelik bir sayfa bileşenidir. Sistemde tetiklenen webhook'ları listeleyerek yöneticilere detaylı bir görünüm sunar. Sayfa, sunucudan asenkron olarak veri çeker ve bu verileri kullanıcılara düzenli bir arayüzle gösterir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın temel yapısını ve kullanıcı arayüzünü oluşturan ana React bileşenidir. Webhook olay listesinin rendering'ini, sayfa düzenini ve kullanıcı etkileşimlerini yönetir.
- AdminWebhookEventsPage

### Veri Yönetimi
Sayfanın ihtiyaç duyduğu webhook olaylarını sunucudan asenkron olarak çeken ve bileşene aktaran veri çekme işlevdir. Veri yükleme sürecini ve hata yönetimini üstlenir.
- fetchEvents

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminWebhookEventsPage
**Ne yapar**: Admin panelinde webhook eventlerinin listelendiği sayfa bileşenidir. Webhook olaylarını göstermek ve yönetmek için kullanılan bir React sayfa bileşenidir.

**Nasıl yapar**: Bir React fonksiyonel bileşenidir ve admin paneli rotalandırma yapısı altında webhook eventleri sayfasını render eder. Sayfa yüklendiğinde event verilerini çekmek için fetchEvents fonksiyonunu çağırır.

**Parametreler**:
- Bu fonksiyon parametre almamaktadır

**Dönüş**: React JSX bileşeni döndürür (sayfa içeriği)

### fetchEvents
**Ne yapar**: Yönetici panelinin webhook olayları sayfasında görüntülenecek tüm kayıtlı geçmiş ve güncel webhook olaylarını sistemin arka uç veri kaynağından çeken yardımcı veri çekme fonksiyonudur. Sadece `AdminWebhookEventsPage` bileşeni tarafından kullanılarak sayfanın ihtiyaç duyduğu olay listesinin elde edilmesini sağlar.
**Nasıl yapar**: Aynı dosya içinde ana sayfa bileşenine destek olmak üzere tanımlanan bu fonksiyon, arka uç servisine yetkilendirme başlıklarıyla donatılmış bir HTTP isteği gönderir. Gelen sunucu yanıtını işler, başarılı veri çekimi sonrasında elde edilen olay listesini sayfa bileşeninin state'ine aktarır. Olası ağ kesintileri veya sunucu kaynaklı hatalarda gerekli hata yönetimi süreçlerini devreye sokarak kullanıcıya bildirim sağlar.
**Parametreler**: Bu fonksiyonun tanımlı herhangi bir parametresi bulunmamaktadır.
**Dönüş**: Tanımlarda dönüş tipi belirsiz (void veya bilinmiyor) olarak işaretlenmiştir. Asenkron veri çekme işlemi gerçekleştiren bir fonksiyon olarak Promise nesnesi döndürmesi beklenir ancak resmi tip tanımında bu durum belirtilmemiştir.

---

## INTERFACES

### AdminDatabase
- `public: Omit<Database['public'], 'Tables'> & {`

---

## TYPE ALIASES

### WebhookEventRow

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AdminWebhookEventsPage.tsx::AdminWebhookEventsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loading` — yükleme durumunu belirten boolean state, true olduğunda veri çekiliyor demektir
  - `setLoading` — loading state'ini güncellemek için setter fonksiyonu
  - `events` — WebhookEventRow tipinde dizi, sunucudan çekilen webhook olaylarını tutar
  - `setEvents` — events state'ini güncellemek için setter fonksiyonu
  - `selectedEvent` — şu an seçili olan webhook olayı nesnesi veya null, detay panelinde gösterilir
  - `setSelectedEvent` — selectedEvent state'ini güncellemek için setter fonksiyonu
  - `fetchEvents` — asenkron fonksiyon, veritabanından webhook_events tablosunu çeker ve events state'ini günceller
- **Dönüş**: JSX elementi (React bileşeninin render ettiği arayüz)

### [N2_NASIL] AST Pointer: AdminWebhookEventsPage.tsx::fetchEvents
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `adminClient` — SupabaseClient<AdminDatabase> tipinde, tip güvenli veritabanı erişimi için supabase istemcisidir
  - `query` — webhook_events tablosu için sorgu nesnesi, select, order ve limit operations için kullanılır
  - `data` — sorgudan dönen ham veri, WebhookEventRow[] tipine dönüştürülür
  - `fetchErr` — sorgu hatası varsa yakalanan error nesnesi
  - `eventsData` — data'nın WebhookEventRow[] tipine dönüştürülmüş hali, data boş ise boş dizi döner
  - `err` — try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: void (asenkron, state güncelleme yan etkisi var)

### [N3_NASIL] AST Pointer: AdminWebhookEventsPage.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (yan etki olarak fetchEvents fonksiyonunu çağırır)

### [N4_NASIL] AST Pointer: AdminWebhookEventsPage.tsx::event map callback
- **params**: `event` — WebhookEventRow tipinde, işlenen tek bir webhook olayı nesnesi
- **ic_degiskenler**: (yok, sadece parametre kullanılıyor)
- **Dönüş**: JSX elementi (tr tablo satırı)

---

## NODE ID STANDARD

  file: src\views\admin\AdminWebhookEventsPage.tsx
  function: src\views\admin\AdminWebhookEventsPage.tsx::AdminWebhookEventsPage
  function: src\views\admin\AdminWebhookEventsPage.tsx::fetchEvents

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminWebhookEventsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-indigo-50/50`, `bg-red-50`, `bg-slate-50`, `bg-slate-900`, `bg-white`, `border-b`, `border-light-gray`, `border-red-100`, `border-slate-100`, `hover:bg-slate-50`, `hover:text-primary-navy`, `text-2xl`, `text-center`, `text-indigo-300`, `text-industrial-gray`
- **Layout:** `flex`, `gap-1`, `gap-2`, `gap-6`, `grid`, `grid-cols-1`, `items-center`, `justify-between`, `lg:col-span-2`, `lg:grid-cols-3`, `overflow-hidden`, `overflow-x-auto`, `p-2`, `p-3`, `p-4`
- **Varyant/Responsive:** `:`, `hover:`, `lg:` önekleri
- **Yardımcı Sınıflar:** `:`, `===`, `animate-fadeIn`, `animate-spin`, `border`, `cursor-pointer`, `divide-slate-50`, `divide-y`, `event.id`, `font-bold`, `font-medium`, `font-mono`, `italic`, `mb-1`, `mb-4`