---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminWebhookEventsPage.tsx
skeleton_hash: 7ac90ec0bf18b6a1
entity_hashes:
  func:AdminWebhookEventsPage: 48683db839635910
  func:fetchEvents: 48cd1e3258f9387a
  overview: 91d0bca0f50ece7f
  style_tokens: e452abbd98ef7800
generated_at: 2026-05-28T22:39:26Z
---

## Genel Bakış
Venthub HVAC projesinin yönetici panelinde yer alan bu modül, sistemdeki tüm webhook olaylarını listelemek ve göstermek için tasarlanmış bir React sayfa bileşenidir. Yönetici kullanıcıların webhook tetiklemelerini takip edebilmesi için gerekli arayüzü sunar ve ilgili verileri arka plandan çeker.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tüm kullanıcı arayüzünü oluşturan ve管理工作ını koordine eden ana React bileşenidir. Kullanıcı etkileşimlerini yönetir, sayfa yapısını render eder ve diğer bileşenlerle entegrasyonu sağlar.
- AdminWebhookEventsPage

### Webhook Verisi Yönetimi
Sayfanın göstermek için ihtiyaç duyduğu webhook olay verilerini sunucudan asenkron olarak çeken işlevdir. Veri yükleme durumunu ve sonucunu yöneterek bileşenin güncel kalmasını sağlar.
- fetchEvents

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmemiştir; yalnızca imza bilgileri mevcuttur. Aşağıda, mevcut bilgilere dayanan asgari mimari varsayımlar sunulmaktadır.

[Aksiyom 1]: Eğer fetchEvents() tarafından sağlanan webhook olay verisi (boş dizi veya null/undefined) yoksa, AdminWebhookEventsPage bileşeni veri listesini başarıyla render edemez.

[Aksiyom 2]: Eğer fetchEvents() işlevi asenkron olarak çalıştırılmaz veya sonucu state'e bağlanmazsa, AdminWebhookEventsPage bileşeni hiçbir webhook olayı gösteremez.

[Aksiyom 3]: Eğer fetchEvents() çağrısı bir hata ile sonuçlanırsa ve bu hata yakalanıp kullanıcıya gösterilmezse, sayfa kullanıcıya anlamsız veya boş bir görünüm sunar.

[Aksiyom 4]: Eğer AdminWebhookEventsPage bileşeni yetkilendirme (auth) kontrolü içermiyorsa veya bu kontrol dışarıdan sağlanmıyorsa, yetkisiz kullanıcılar webhook olay verilerine erişebilir.

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

### [N1_NASIL] AST Pointer: src/views/admin/AdminWebhookEventsPage.tsx::AdminWebhookEventsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loading` — sayfa yükleme durumunu tutar, true olduğunda yenileme ikonu döner (`useState(true)`)
  - `events` — webhook olaylarının listesini tutar, tabloda satır olarak gösterilir (`useState<WebhookEventRow[]>([])`)
  - `selectedEvent` — kullanıcının listeden seçtiği webhook olayını tutar, detay panelinde payload ve hata gösterilir (`useState<WebhookEventRow | null>(null)`)
  - `fetchEvents` — component içinde tanımlanmış async fonksiyon, Supabase'den webhook_events tablosunu çeker
  - `fetchEvents` (useEffect callback) — `useEffect` içinde `fetchEvents()` çağırarak component mount'ta verileri yükler
- **Dönüş**: JSX — Webhook Olayları admin sayfasını render eder (tablo + detay paneli)

### [N2_NASIL] AST Pointer: src/views/admin/AdminWebhookEventsPage.tsx::fetchEvents
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `adminClient` — `supabase` client'ının `SupabaseClient<AdminDatabase>` türüne cast edilmiş hali, şema dışı tablolara tip-güvenli erişim sağlar
  - `query` — `adminClient.from('webhook_events')` ile oluşturulan Supabase sorgu nesnesi
  - `data` — sorgu sonucu dönen ham satır verisi
  - `fetchErr` — Supabase sorgusundan dönen hata nesnesi, varsa `throw` ile yukarı fırlatılır
  - `eventsData` — `data` null ise boş dizi (`[]`), değilse `WebhookEventRow[]` türüne cast edilmiş olay listesi
  - `err` — try-catch bloğunda yakalanan hata, `console.error` ile loglanır
- **Dönüş**: yok — state güncellemeleriyle (side effect) `loading` ve `events` değerlerini değiştirir

### [N3_NASIL] AST Pointer: src/views/admin/AdminWebhookEventsPage.tsx::useEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — doğrudan `fetchEvents()` çağrısı yapar)
- **Dönüş**: yok — component mount olduğunda `fetchEvents()` çalıştırarak veri yüklemeyi tetikler

### [N4_NASIL] AST Pointer: src/views/admin/AdminWebhookEventsPage.tsx::eventRowMapper
- **params**: `event` — tek bir `WebhookEventRow` nesnesi, `events.map()` içinde her satır için çağrılır
- **ic_degiskenler**:
  - `event.id` — olayın benzersiz tanımlayıcısı, `<tr>` elementinin `key` prop'u olarak kullanılır
  - `event.event_type` — olayın tipi (ör. payment, order), tablonun birinci sütununda gösterilir
  - `event.provider` — olayın geldiği kaynak/şirket, tablonun ikinci sütununda gösterilir
  - `event.status` — olayın işlenme durumu, `processed`/`failed`/diğer değerlerine göre ikonlu badge render eder
  - `event.created_at` — olayın oluşma tarihi, `format()` fonksiyonuyla `'d MMM HH:mm'` formatına dönüştürülerek dördüncü sütunda gösterilir
  - `selectedEvent` — şu an seçili olan olay nesnesi, `selectedEvent?.id === event.id` karşılaştırmasıyla satır arka plan rengi belirlenir
- **Dönüş**: `<tr>` JSX elementi — olayın bilgilerini içeren tablo satırı

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