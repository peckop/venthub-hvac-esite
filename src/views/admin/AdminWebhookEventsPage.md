---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminWebhookEventsPage.tsx
skeleton_hash: fcb39370657fdd67
entity_hashes:
  func:AdminWebhookEventsPage: 48683db839635910
  func:fetchEvents: 48cd1e3258f9387a
  overview: 7c63490659a70022
  style_tokens: e452abbd98ef7800
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış

Ventrub HVAC yönetici panelindeki webhook olaylarını görüntülemeye yönelik bir sayfa bileşenidir. Admin kullanıcıların sistemde tetiklenen webhook'ları listeleyerek izlemesini ve yönetmesini sağlar. Sayfa, arka planda sunucudan asenkron olarak veri çekerek webhook olaylarını düzenli bir arayüzle sunar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Sayfanın ana yapısını ve kullanıcı arayüzünü oluşturan React bileşenidir. Sayfa düzenini render eder ve veri çekme sürecini başlatarak kullanıcıya webhook olaylarını sunar.
- AdminWebhookEventsPage

### Veri Çekme
Sayfanın ihtiyaç duyduğu webhook olaylarını sunucudan asenkron olarak çeken yardımcı fonksiyondur. Arka uç veri kaynağıyla iletişim kurarak olay verilerini sayfa bileşenine iletir.
- fetchEvents

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzalarından türetilebilen sınırlı mimari varsayımlar tanımlanabilir. Fonksiyon gövdesi erişilemediğinden, çıkarımlar minimum düzeyde tutulmuştur.

[Aksiyom 1]: Eğer `fetchEvents()` çağrıldığında sunucu tarafı bir API uç noktası (endpoint) mevcut değilse, veriler getirilemez ve bileşen veri durumunda kalır (boş liste veya hata durumu).

[Aksiyom 2]: Eğer `fetchEvents()` işlevi çağrılmadan önce veya çağrı sırasında ağ bağlantısı kesilmişse, webhook olayları başarıyla alınamaz ve bileşen veri gösteremez.

[Aksiyom 3]: Eğer `AdminWebhookEventsPage()` bir React ortamı (provider, router vb.) dışında kullanılırsa, bileşen düzgün render edilemez.

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

### [N1_NASIL] AST Pointer: src\views\admin\AdminWebhookEventsPage.tsx::AdminWebhookEventsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loading` — useState<boolean> ile oluşturulan boolean, veri yükleme durumunu takip eder
  - `events` — useState<WebhookEventRow[]> ile oluşturulan dizi, webhook olaylarının listesini tutar
  - `selectedEvent` — useState<WebhookEventRow | null> ile oluşturulan nesne, tabloda seçili olan olayı tutar
  - `fetchEvents` — async arrow fonksiyonu, Supabase'den webhook_events tablosundan son 50 kaydı çeker
  - `adminClient` — supabase istemcisinin SupabaseClient<AdminDatabase> türüne cast edilmiş hali, genişletilmiş tablo erişimi sağlar
  - `query` — adminClient.from('webhook_events') ile oluşturulan Supabase sorgu nesnesi, select/order/limit zinciri uygulanır
  - `data` — Supabase select sorgusunun başarıyla döndürdüğü ham veri
  - `fetchErr` — Supabase yanıtındaki error alanı, sorgu hatalarını tutar
  - `eventsData` — data'nın WebhookEventRow[] türüne cast edilmiş hali, null ise boş dizi fallback'i kullanılır
  - `err` — catch bloğundaki genel hata nesnesi, console.error'a yazdırılır
- **Dönüş**: JSX — AdminWebhookEventsPage bileşeninin render ettiği React JSX, webhook olayları listesi tablosu ve olay detay panelini içerir; return (JSX) satırı JSX elementi döndürür

### [N2_NASIL] AST Pointer: src\views\admin\AdminWebhookEventsPage.tsx::fetchEvents
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `adminClient` — supabase istemcisinin SupabaseClient<AdminDatabase> türüne cast edilmiş hali, tip güvenli tablo erişimi sağlar
  - `query` — adminClient.from('webhook_events') ile oluşturulan Supabase sorgu nesnesi, select('*') + order('created_at', {ascending: false}) + limit(50) zinciri uygulanır
  - `data` — Supabase select sorgusunun başarıyla döndürdüğü ham veri, WebhookEventRow[]'a cast edilir
  - `fetchErr` — Supabase yanıtındaki error alanı, sorgu hatalarını tutar; truthy ise throw edilir
  - `eventsData` — data'nın WebhookEventRow[] türüne cast edilmiş hali, null/undefined ise boş dizi fallback'i kullanılır
  - `err` — catch bloğundaki genel hata nesnesi, console.error('Webhook events fetch error:', err) ile yazdırılır
- **Dönüş**: yok — fonksiyon yan etkisi olarak loading state'ini true ile başlatır, try/finally bloğu ile false'a ayarlar; events state'ini setEvents(eventsData) ile günceller

### [N3_NASIL] AST Pointer: src\views\admin\AdminWebhookEventsPage.tsx::useEffect Callback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — yan etkisi: bileşen mount edildiğinde fetchEvents() fonksiyonunu çağırır; boş bağımlılık dizisi [] ile sadece ilk render'da çalışır

### [N4_NASIL] AST Pointer: src\views\admin\AdminWebhookEventsPage.tsx::event Map Callback (tablo satırı render fonksiyonu)
- **params**: `event` — WebhookEventRow tipinde bir webhook olay nesnesi, events dizisinin her bir elemanıdır
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX `<tr>` elementi — event.id ile key, event.event_type Olay Tipi hücresinde, event.provider Kaynak hücresinde, event.status değerine göre koşullu render ile İşlendi/Hata/Bekliyor durum göstergesi (CheckCircle2/XCircle/Clock ikonları ile), format(new Date(event.created_at), 'd MMM HH:mm', {locale: tr}) ile Türkçe formatta tarih gösterilir; onClick={() => setSelectedEvent(event)} ile tıklandığında olayı seçer; selectedEvent?.id === event.id kontrolü ile seçili satır vurgulanır

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