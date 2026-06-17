---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\WebhookEventsTableBody.tsx
skeleton_hash: 281e943f1b76ab3b
entity_hashes:
  func:WebhookEventsTableBody: 08758a783f258c2e
  func:webhookEventsFetcher: 6dbdd61167243534
  overview: f1febf0756389550
  style_tokens: b14d0e3316338d3b
generated_at: 2026-06-17T13:26:10Z
---

## Genel Bakış

WebhookEventsTableBody modülü, admin panelindeki webhook olayları tablosunun gövdesini (satırlarını) oluşturan React bileşenini ve bu verileri Supabase'den çeken asenkron veri getiriciyi barındırır. Modül, webhook olaylarının listelenmesi için gerekli veri akışını ve görsel sunumu tek bir bileşen yapısında birleştirir.

## Fonksiyon Grupları

### Veri Getirme
Bu grup, webhook olaylarının Supabase veritabanından asenkron olarak getirilmesinden sorumludur. Tablonun içerik beslemesini sağlayan temel veri kaynağı işlevini görür.
- webhookEventsFetcher

### Tablo Bileşeni
Bu grup, getirilen webhook olaylarını tablo satırları olarak ekrana dizen React fonksiyonel bileşenini içerir. Veri getirme fonksiyonunu tetikler ve sonucu kullanıcıya sunar.
- WebhookEventsTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül, webhook olaylarını Supabase veritabanından çekip bir React tablosunda gösteren sunucu tarafı veri çekme ve UI bileşenlerinden oluşur.

**[Aksiyom 1 - Veritabanı Bağımlılığı]:** Eğer `webhookEventsFetcher` fonksiyonuna geçilen `supabase` parametresi `SupabaseClient<Database>` tipinde bir Supabase istemcisi değilse, veritabanı sorgusu başarısız olur ve `FetchResult<DbWebhookEvent>` döndürülemez.

**[Aksiyom 2 - Parametre Gerekliliği]:** Eğer `webhookEventsFetcher` fonksiyonuna geçilen `params` parametresi `FetchParams` tipinde değilse veya gerekli alanları içermiyorsa, veri çekme işlemi tanımsız davranış sergiler.

**[Aksiyom 3 - Dönüş Tipi Tutarlılığı]:** Eğer `webhookEventsFetcher` başarıyla çalışırsa, dönüş değeri `FetchResult<DbWebhookEvent>` formatında olmalıdır; aksi takdirde `WebhookEventsTableBody` bileşeni veriyi işleyemez ve tablo gövdesi boş kalır.

**[Aksiyom 4 - Database Şema Eşleşmesi]:** Eğer Supabase veritabanında `DbWebhookEvent` tipiyle eşleşen `webhook_events` tablosu (veya karşılık gelen tablo) yoksa veya tablo yapısı farklıysa, `webhookEventsFetcher` tip uyumsuzluğu hatası verir.

**[Aksiyom 5 - React Bağlamı]:** Eğer `WebhookEventsTableBody` bileşeni geçerli bir React bağlamı (RenderTree) dışında çağrılırsa, React bileşen olarak değerlendirilmez ve hata fırlatır.

> **Not:** Fonksiyon gövdeleri paylaşılmadığından, saysal eşik değerleri, sayfalama parametreleri, filtreleme koşulları veya hata yönetimi ile ilgili spesifik aksiyomlar tanımlanamamıştır.

---

## FONKSİYON DETAYLARI

### webhookEventsFetcher

**Ne yapar**: Supabase veritabanından webhook_events tablosuna sorgu göndererek, verilen sayfalama, sıralama, arama ve filtreleme parametrelerine göre webhook olaylarını getirir. Sonuç olarak normalize edilmiş webhook event satırlarını ve toplam eşleşen kayıt sayısını döndürür.

**Nasıl yapar**: Fonksiyon, önce `supabase.from()` ile webhook_events tablosuna bir sorgu başlatır ve `select('*', { count: 'exact' })` ile tüm alanları ve toplam sayıyı alacak şekilde yapılandırır. Ardından `params.sort` parametrelerine göre sıralama sütununu belirler; `colMap` nesnesinde tanımlı geçerli sıralama anahtarları (event_type, provider, status, created_at) dışında bir değer gelirse varsayılan olarak `created_at` kullanılır. `params.query` mevcutsa, `event_type` ve `provider` alanlarında büyük-küçük harf duyarsız (`ilike`) arama yapar. `params.filters.status` dizisi doluysa, `status` alanını bu değerler ile filtreler. Son olarak `params.page` ve `params.pageSize` kullanarak `range()` ile sayfalama uygular. Sorgu sonucundaki her satır, `DbWebhookEvent` tipine dönüştürülerek `id`, `event_type`, `provider`, `status`, `payload`, `request_body`, `response_body`, `error_message` ve `created_at` alanları normalize edilir; `status` alanı sadece `'processed'`, `'failed'` veya `'pending'` değerlerini kabul eder, geçersiz değerlerde `'pending'` kullanılır.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase istemci nesnesi, veritabanı bağlantısını ve sorgu oluşturmayı sağlar. `<Database>` generic parametresi ile veritabanı şeması tanımları sunulur.
- `params`: `FetchParams` — SorguParametrelerini içeren nesne. İçerisinde `sort` (sıralama bilgisi: `key` ve `dir` alanları), `query` (arama metni), `filters` (nesne, içinde `status` dizisi), `page` (sayfa numarası) ve `pageSize` (sayfa başına kayıt sayısı) alanları bulunur.

**Dönüş**: `Promise<FetchResult<DbWebhookEvent>>` — Asenkron bir Promise döndürür. `FetchResult<DbWebhookEvent>` tipindeki nesne şu alanları içerir:
- `rows`: `DbWebhookEvent[]` — Normalize edilmiş webhook event nesnelerinin dizisi. Her nesne `id`, `event_type`, `provider`, `status` (üç olası değerden biri), `payload` (Json), `request_body` (Json), `response_body` (Json), `error_message` (opsiyonel string) ve `created_at` alanlarını barındırır.
- `totalMatched`: `number` — Filtreleme ve arama koşullarına toplamda kaç kaydın eşleştiği (toplam kayıt sayısı).

### WebhookEventsTableBody
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/data-table/DataTableKit::DataTableKit
- import: ../../components/admin/data-table/types::type { AdminColumn }
- import: ../../hooks/useAdminTable::type FetchParams
- import: ../../hooks/useAdminTable::type FetchResult
- import: ../../hooks/useAdminTable::useAdminTable
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDateTime
- import: ../../types/database.types::type { Database, Json }
- import: ../../utils/adminUi::adminCardPaddedClass
- import: @/types/db-rows::type { DbWebhookEvent }
- import: @supabase/supabase-js::type { SupabaseClient }
- import: lucide-react::Activity
- import: lucide-react::CheckCircle2
- import: lucide-react::Clock
- import: lucide-react::Code
- import: lucide-react::SearchX
- import: lucide-react::XCircle
- import: react::React
- import: react::useCallback
- import: react::useMemo
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/WebhookEventsTableBody.tsx::webhookEventsFetcher
- **params**: `supabase: SupabaseClient<Database>`, `params: FetchParams`
- **ic_degiskenler**:
  - `query` — Supabase sorgu nesnesi; webhook_events tablosundan select, sıralama, filtreleme ve sayfalama uygulanır
  - `sortKey` — params.sort?.key değeri veya varsayılan 'created_at'; sıralama sütunu anahtarı
  - `ascending` — params.sort?.dir === 'asc' ise true; sıralama yönü
  - `colMap` — Record<string, string>; frontend sort anahtarlarını veritabanı sütun adlarına eşler (event_type, provider, status, created_at)
  - `orderCol` — colMap'ten eşleşen sütun adı veya varsayılan 'created_at'; sorguda kullanılacak sıralama sütunu
  - `like` — `%${params.query}%` formatında arama kalıbı; event_type ve provider üzerinde ilike araması
  - `statusFilter` — params.filters.status ?? []; seçili durum filtreleri dizisi
  - `offset` — sayfalama için hesaplanan satır başlangıç indeksi: (params.page - 1) * params.pageSize
  - `data` — Supabase sorgu sonucu dönen ham satır verisi
  - `error` — Supabase sorgu hatası varsa dönen hata nesnesi
  - `count` — toplam eşleşen satır sayısı (exact count)
  - `rows` — DbWebhookEvent[] tipinde dönüştürülmüş ve tip güvenliği sağlanmış satırlar dizisi
  - `row` — map içindeki her bir ham satır; Record<string, unknown> olarak cast edilir
  - `r` — row as Record<string, unknown> ile elde edilen tip güvenliği sağlanmış kayıt
- **Dönüş**: `Promise<FetchResult<DbWebhookEvent>>` — `{ rows: DbWebhookEvent[], totalMatched: number }`

### [N2_NASIL] AST Pointer: src/views/admin/WebhookEventsTableBody.tsx::WebhookEventsTableBody
- **params**: (yok — React functional component)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu; UI metinlerinin uluslararasılaştırılması
  - `lang` — useI18n() hook'undan gelen dil kodu; tarih formatlama için kullanılır
  - `selectedEvent` — useState ile yönetilen DbWebhookEvent | null; detay panelinde gösterilecek seçili webhook olayı
  - `table` — useAdminTable<DbWebhookEvent>() hook'undan dönen tablo yönetim nesnesi; sayfalama, sıralama, filtreleme, seçim durumu yönetimi
  - `setQuery` — table.filtering.query değerini güncelleyen fonksiyon; arama sorgusunu ayarlar
  - `setFilter` — table.filtering.filters değerini güncelleyen fonksiyon; belirli bir filtre anahtarının değerini değiştirir
  - `filters` — table.filtering.filters mevcut filtre değerleri nesnesi
  - `activeStatuses` — useMemo ile hesaplanan aktif durum filtreleri dizisi (filters.status ?? [])
  - `onRowClick` — useCallback ile memoize edilmiş satır tıklama handler'ı; selectedEvent'i ayarlar, seçimi temizler ve toggle eder
  - `columns` — useMemo ile memoize edilmiş AdminColumn<DbWebhookEvent>[] dizisi; tablo sütun tanımları (event_type, provider, status, created_at)
  - `statusChips` — useMemo ile memoize edilmiş durum filtre çip tanımları dizisi; processed/failed/pending için aktif durum ve toggle davranışları
  - `resetFilters` — useCallback ile memoize edilmiş filtreleri sıfırlama fonksiyonu; query'yi '' ve status'ü [] yapar
  - `selectedEvent` JSX'te kullanılır: `selectedEvent?.payload`, `selectedEvent?.error_message`
- **Dönüş**: JSX — grid layout içinde DataTableKit (sol sütun) ve detay paneli (sağ sütun) içeren React elementi; yan etki olarak table hook'u URL senkronizasyonu yapar

### [N3_NASIL] AST Pointer: src/views/admin/WebhookEventsTableBody.tsx::onRowClick (arrow callback)
- **params**: `row: DbWebhookEvent`
- **ic_degiskenler**:
  - (yok — doğrudan state ve tablo seçim nesnelerini kullanır)
- **Dönüş**: void — setSelectedEvent(row) ile seçili olayı günceller, table.selection.clear() ile mevcut seçimi temizler, table.selection.toggle(row.id) ile satır seçimini açar/kapar

### [N4_NASIL] AST Pointer: src/views/admin/WebhookEventsTableBody.tsx::columns (useMemo callback)
- **params**: (yok — useMemo callback)
- **ic_degiskenler**:
  - (yok — doğrudan t, lang ve formatDateTime kullanılarak sütun tanımları döndürülür)
- **Dönüş**: `AdminColumn<DbWebhookEvent>[]` — 4 sütun: event_type (font-bold uppercase), provider (text-slate-300), status (processed/failed/pending durumuna göre icon ve badge), created_at (formatDateTime ile formatlanmış tarih)

### [N5_NASIL] AST Pointer: src/views/admin/WebhookEventsTableBody.tsx::statusChips (useMemo callback)
- **params**: (yok — useMemo callback)
- **ic_degiskenler**:
  - (yok — doğrudan activeStatuses, setFilter ve t kullanılarak çip tanımları döndürülür)
- **Dönüş**: Array — 3 çip nesnesi (processed, failed, pending); her biri key, label, active durumu ve onToggle callback içerir; onToggle içinde `next` adlı geçici dizi hesaplanarak setFilter('status', next) çağrılır

### [N6_NASIL] AST Pointer: src/views/admin/WebhookEventsTableBody.tsx::statusChip onToggle (arrow callback — processed/failed/pending için ortak yapı)
- **params**: (yok — inline callback)
- **ic_degiskenler**:
  - `next` — activeStatuses dizisinin filter veya spread ile oluşturulmuş güncel hali; ilgili durum mevcutsa çıkarılır, yoksa eklenir
- **Dönüş**: void — setFilter('status', next) çağrısı ile durum filtresini günceller

### [N7_NASIL] AST Pointer: src/views/admin/WebhookEventsTableBody.tsx::resetFilters (useCallback callback)
- **params**: (yok — useCallback callback)
- **ic_degiskenler**:
  - (yok — doğrudan setQuery ve setFilter çağrıları yapar)
- **Dönüş**: void — setQuery('') ile arama sorgusunu temizler, setFilter('status', []) ile durum filtresini boş diziye ayarlar

### [N8_NASIL] AST Pointer: src/views/admin/WebhookEventsTableBody.tsx::webhookEventsFetcher (row map callback)
- **params**: `row` — Record<string, unknown> tipinde ham Supabase satırı
- **ic_degiskenler**:
  - `r` — row as Record<string, unknown> ile tip güvenliği sağlanmış kayıt; tüm alanlara erişim için kullanılır
- **Dönüş**: DbWebhookEvent — id (String), event_type (String), provider (String), status (processed/failed/pending union veya 'pending' fallback), payload (Json cast), request_body (Json cast), response_body (Json cast), error_message (String veya undefined), created_at (String)

---

## NODE ID STANDARD

  file: src\views\admin\WebhookEventsTableBody.tsx
  function: src\views\admin\WebhookEventsTableBody.tsx::webhookEventsFetcher
  function: src\views\admin\WebhookEventsTableBody.tsx::WebhookEventsTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: WebhookEventsTableBody
  export: webhookEventsFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500/10`, `bg-emerald-500/10`, `bg-rose-500/10`, `bg-slate-950/80`, `border-amber-500/20`, `border-emerald-500/20`, `border-rose-500/20`, `border-white/5`, `text-amber-400`, `text-center`, `text-cyan-300`, `text-cyan-400`, `text-emerald-400`, `text-lg`, `text-rose-300`
- **Layout:** `flex`, `gap-1.5`, `gap-2`, `gap-6`, `grid`, `grid-cols-1`, `items-center`, `lg:col-span-2`, `lg:grid-cols-3`, `overflow-x-auto`, `p-4`, `w-fit`
- **Varyant/Responsive:** `lg:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-black`, `font-bold`, `font-medium`, `font-mono`, `italic`, `mb-2`, `mb-4`, `px-2.5`, `py-1.5`, `py-20`, `rounded-2xl`, `rounded-xl`, `space-y-4`, `tracking-tight`