---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\WebhookEventsTableBody.tsx
skeleton_hash: 281e943f1b76ab3b
entity_hashes:
  func:WebhookEventsTableBody: 08758a783f258c2e
  func:webhookEventsFetcher: 6dbdd61167243534
  overview: ef1b01ec610a06ac
  style_tokens: b14d0e3316338d3b
generated_at: 2026-06-19T20:50:29Z
---

## Genel Bakış
Bu modül, admin panelindeki webhook olayları tablosunun satırlarını oluşturmak için tasarlanmış bir React bileşeni ve bu verileri Supabase veritabanından asenkron olarak çekmek için gerekli veri getiriciyi içerir. Modül, veri kaynağını (fetcher) ve verinin kullanıcı arayüzündeki sunumunu (bileşen) bir arada tutan tek bir modülden oluşur.

## Fonksiyon Grupları
### Veri Erişimi ve İşleme
Bu grup, webhook olaylarının Supabase veritabanından filtreleme ve sayfalama parametreleri ile birlikte asenkron olarak getirilmesiyle ilgilenir. Tablonun besleneceği ham veriyi sağlayan iş mantığını barındırır.
- webhookEventsFetcher

### Arayüz Sunumu
Bu grup, getirilen webhook olaylarını tablo satırları olarak kullanıcıya sunan React fonksiyonel bileşenini kapsar. Veri getirme işlemini tetikler ve sonucu tablo formatında render eder.
- WebhookEventsTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül, webhook olaylarının veritabanından çekilmesi ve tablo gövdesi olarak sunulması süreçlerini kapsar.

[Aksiyom 1]: Eğer `webhookEventsFetcher` fonksiyonuna geçerli bir `SupabaseClient<Database>` nesnesi sağlanmazsa, Supabase veritabanına bağlantı kurulamaz ve veri getirme işlemi başarısız olur.

[Aksiyom 2]: Eğer `webhookEventsFetcher` fonksiyonuna geçerli bir `FetchParams` nesnesi sağlanmazsa, sorgu parametreleri tanımsız kalır ve beklenen `DbWebhookEvent` kayıtları getirilemez.

[Aksiyom 3]: Eğer Supabase veritabanında `DbWebhookEvent` türünde karşılık gelen tablo veya görünüm yoksa, `webhookEventsFetcher` fonksiyonunun döndürdüğü `FetchResult<DbWebhookEvent>` yapısında geçerli veri bulunmaz.

[Aksiyom 4]: Eğer `WebhookEventsTableBody` React bileşeni, geçerli bir React uygulama bağlamı (React Context / Provider yapısı) dışında kullanılırsa, bileşen hükmettiği veriyi alamaz ve doğru render edilemez.

[Aksiyom 5]: Eğer `FetchParams` içindeki sayfalama, filtreleme veya sıralama parametreleri veritabanı şemasıyla uyumsuz değerler içerirse, `webhookEventsFetcher` beklenen `FetchResult` yapısını tutarlı biçimde dolduramaz.

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
- import: ../../components/admin/ExportMenu::ExportMenu
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

### [N1_NASIL] AST Pointer: `src/views/admin/WebhookEventsTableBody.tsx`::`webhookEventsFetcher`
- **params**:
  - `supabase: SupabaseClient<Database>` — Supabase istemcisi, veritabanı sorgularını yürütür
  - `params: FetchParams` — sayfalama, sıralama, arama ve filtre parametreleri
- **ic_degiskenler**:
  - `query` — Supabase sorgu builder'ı; `supabase.from('webhook_events').select('*', { count: 'exact })` ile başlatılır, zincirleme `.order()`, `.or()`, `.in()`, `.range()` eklenerek filtrelenir
  - `sortKey` — sıralama sütun anahtarı; `params.sort?.key` varsa o, yoksa `'created_at'` kullanılır
  - `ascending` — sıralama yönü; `params.sort?.dir === 'asc'` ise true
  - `colMap` — sort anahtarlarını gerçek veritabanı sütun adlarına eşleyen sözlük; `event_type`, `provider`, `status`, `created_at` eşlemeleri içerir
  - `orderCol` — eşlenmiş sütun adı; `colMap[sortKey]` eşleşmezse `'created_at'` fallback kullanılır
  - `like` — LIKE arama kalıbı; `%${params.query}%` formatında
  - `statusFilter` — filtrelenmek istenen durum değerleri dizisi; `params.filters.status ?? []` alınır
  - `offset` — sayfalama ofseti; `(params.page - 1) * params.pageSize` hesaplanır
  - `data` — Supabase'den dönen satır verisi
  - `error` — Supabase sorgu hatası; varsa `throw error` ile fırlatılır
  - `count` — toplam eşleşen satır sayısı (exact count)
  - `rows` — ham satırların `DbWebhookEvent` tipine dönüştürülmüş hali; `.map()` ile her `row` işlenir
  - `row` — `.map()` callback'indeki her bir ham satır
  - `r` — `row`'un `Record<string, unknown>` olarak cast edilmiş hali; `r.id`, `r.event_type`, `r.provider`, `r.status`, `r.payload`, `r.request_body`, `r.response_body`, `r.error_message`, `r.created_at` alanlarına erişilir
- **Dönüş**: `Promise<FetchResult<DbWebhookEvent>>` — `{ rows, totalMatched }` nesnesi döner; `totalMatched` `count` sayısal ise `count`, değilse `0`

---

### [N2_NASIL] AST Pointer: `src/views/admin/WebhookEventsTableBody.tsx`::`WebhookEventsTableBody`
- **params**: (yok — parametresiz React fonksiyonel bileşeni)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('admin.webhooks.eventType')` gibi anahtarlarla çeviri metinleri alınır
  - `lang` — `useI18n()` hook'undan dönen dil kodu (`'tr' | 'en'`); `formatDateTime` fonksiyonuna passed
  - `selectedEvent` — `useState<DbWebhookEvent | null>(null)` ile oluşturulan state; tıklanan webhook olayını tutar, sağ panelde detay göstermek için kullanılır
  - `setSelectedEvent` — `selectedEvent` state'ini güncelleyen setter fonksiyonu
  - `table` — `useAdminTable<DbWebhookEvent>({...})` hook'undan dönen tablo controller nesnesi; `table.filtering`, `table.selection`, `table.totalMatched`, `table.fetchAllForExport()` erişimleri yapılır
    - `resource: 'webhook_events'` — Supabase tablo adı
    - `rowId: (r) => r.id` — her satırın benzersiz tanımlayıcısı
    - `fetcher: webhookEventsFetcher` — veri çekme fonksiyonu referansı
    - `paginationMode: 'server'` — sunucu taraflı sayfalama
    - `sortMode: 'server'` — sunucu taraflı sıralama
    - `pageSize: 50` — sayfa başına satır sayısı
    - `initialSort: { key: 'created_at', dir: 'desc' }` — varsayılan sıralama
    - `syncUrl: true` — URL parametreleri ile senkronizasyon
  - `setQuery` — `table.filtering.setQuery`; arama sorgusunu günceller
  - `setFilter` — `table.filtering.setFilter`; filtre değerlerini günceller; `setFilter('status', next)` çağrılır
  - `filters` — `table.filtering.filters`; mevcut filtre durumu nesnesi; `filters.status` erişimi yapılır
  - `activeStatuses` — `useMemo()` ile türetilen, o anda aktif olan durum filtresi değerleri dizisi; `filters.status ?? []` hesaplanır
  - `onRowClick` — `useCallback()` ile sarılı satır tıklama işleyicisi; parametre olarak `row: DbWebhookEvent` alır, `setSelectedEvent(row)`, `table.selection.clear()`, `table.selection.toggle(row.id)` çağırır
  - `exportCsv` — `useCallback()` ile sarılı asfonksiyon; CSV dışa aktarma işlemini yürütür
    - `rows` — `await table.fetchAllForExport()` ile çekilen tüm filtrelenmiş satırlar
    - `header` — CSV başlık satırı; `t('admin.webhooks.export.headers.id')` vb. ile 6 sütun başlığı `join(',')` ile birleştirilir
    - `lines` — `rows.map((r) => ...)` ile her satırın CSV satırına dönüştürülmüş hali; `r.id`, `r.event_type`, `r.provider`, `r.status`, `r.created_at`, `r.error_message` alanları kullanılır; `r` map callback parametresidir; string alanlar `'"'` escape'li formatlanır
    - `csv` — BOM (`\ufeff`) ile başlayan tam CSV metni; `[header, ...lines].join('\n')`
    - `blob` — `new Blob([csv], { type: 'text/csv;charset=utf-8;' })` ile oluşturulan dosya nesnesi
    - `url` — `URL.createObjectURL(blob)` ile oluşturulan indirme URL'i
    - `a` — `document.createElement('a')` ile oluşturulan görünmez link elemanı; `a.href = url`, `a.download = t('admin.webhooks.export.filename')`, `a.click()`, `URL.revokeObjectURL(url)` ile tetiklenir
  - `columns` — `useMemo<AdminColumn<DbWebhookEvent>[]>(...)` ile tanımlanan sütun dizisi; 4 sütun içerir:
    - `e` — her sütunun `cell` callback parametresi; `e.event_type`, `e.provider`, `e.status`, `e.created_at` alanlarına erişilir
    - `formatDateTime` — `e.created_at` ve `lang` parametreleri ile tarih formatlama fonksiyonu çağrısı
  - `statusChips` — `useMemo()` ile tanımlanan durum filtre çipi yapılandırma dizisi; 3 çip (`'processed'`, `'failed'`, `'pending'`) içerir
    - `next` — her `onToggle` callback içinde hesaplanan bir sonraki durum filtresi dizisi; `activeStatuses.includes(x)` kontrolü ile ekleme/çıkarma yapılır
  - `resetFilters` — `useCallback()` ile sarılı; `setQuery('')` ve `setFilter('status', [])` çağrısı ile tüm filtreleri sıfırlar
- **Dönüş**: JSX — sol tarafta `DataTableKit` (tablo + toolbar + filtreler + boş durum state'leri + dışa aktarma menüsü) ve sağ tarafta seçili olayın payload JSON'unu ve hata mesajını gösteren detay paneli içeren React elementi

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