---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\ErrorsTableBody.tsx
skeleton_hash: fe489845647f19bb
entity_hashes:
  func:ErrorsTableBody: ba1ec68351d28cea
  func:errorsFetcher: acba757800739598
  overview: 80765db41011b973
  style_tokens: 83e951750a6d0ee0
generated_at: 2026-08-26T07:20:57Z
---

## Genel Bakış
Bu modül, admin panelindeki hata kayıtları tablosunun gövde bölümünü oluşturan React bileşenini ve bu bileşenin ihtiyaç duyduğu veriyi Supabase veritabanından asenkron olarak çekmeye yarayan yardımcı fonksiyonu içerir. Modül, veri erişim katmanı ile sunum katmanını bir arada barındırarak hata kayıtlarının kullanıcıya tablo formatında gösterilmesini sağlar.

## Fonksiyon Grupları

### Veri Çekme ve Yönetim
Bu grup, Supabase istemcisini kullanarak hata kayıtlarını veritabanından asenkron olarak çeker ve filtreleme/sayfalama parametrelerine göre uygun veri yapısını hazırlar. Geçersiz istemci veya parametre durumlarında hata fırlatır.
- errorsFetcher

### Arayüz Gösterimi
Bu grup, çekilen hata verilerini admin panelindeki tablonun gövdesi olarak kullanıcıya sunan React bileşenini tanımlar ve tablo satırlarının render edilmesini yönetir.
- ErrorsTableBody

## Bağımlılıklar ve Mimari Notlar

**Dış Bağımlılıklar:**
- Supabase istemcisi (`SupabaseClient<Database>`) veritabanı bağlantısı için dışarıdan sağlanır
- `FetchParams` ve `FetchResult<ErrorRow>` tipleri veri yapısını tanımlar

**İç İlişki:**
- `ErrorsTableBody` bileşeni, veri çekme işlemini başlatmak için `errorsFetcher` fonksiyonunu çağırır; bu fonksiyonun döndürdüğü `ErrorRow` dizisi tablo satırlarına dönüştürülür

**Mimari Önem:**
- Modül, veri çekme ve sunum sorumluluklarını tek dosyada birleştirerek admin panelinin hata izleme bölümünün kendine yeterli bir birim olmasını sağlar

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### errorsFetcher
**Ne yapar**: Supabase veritabanındaki `client_errors` tablosundan hata kayıtlarını filtreleyerek, sıralayarak ve sayfalayarak getirir. İstemci tarafında oluşan hataları listelemek için kullanılır.

**Nasıl yapar**: Fonksiyon, öncelikle `params.filters` nesnesinden level, env, from ve to filtrelerinin ilk elemanlarını alır. Ardından Supabase sorgusu oluşturarak `client_errors` tablosundan belirli alanları (id, at, url, message, stack, user_agent, release, env, level) seçer ve toplam kayıt sayısını da hesaplar (`count: 'exact'`). Sıralama işlemi `params.sort` bilgisine göre yapılır; belirtilmemişse varsayılan olarak `at` alanına göre sıralanır. Tarih filtreleri `from` ve `to` parametreleriyle UTC formatında uygulanır (başlangıç için günün başı `T00:00:00Z`, bitiş için günün sonu `T23:59:59Z`). `level` ve `env` filtreleri varsa eşitlik kontrolüyle eklenir. `params.query` doluysa, `orIlikeContains` yardımcı fonksiyonu ile `url` ve `message` alanlarında büyük/küçük harf duyarsız metin araması yapılır; bu arama Supabase filtre gramerine doğrudan gömülmez (T078-VH kuralı). Sayfalama, `params.page` ve `params.pageSize` değerleriyle hesaplanan offset üzerinden `range` metoduyla uygulanır. Sorgu sonucunda hata oluşursa fırlatılır, aksi halde satırlar ve toplam eşleşme sayısı döndürülür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase veritabanı istemcisi. Sorguların yürütülmesi için kullanılır.
- `params`: `FetchParams` — Filtreleme, sıralama ve sayfalama bilgilerini içeren parametre nesnesi. İçerisinde `filters` (level, env, from, to), `sort` (key, dir), `query`, `page` ve `pageSize` alanları bulunur.

**Dönüş**: `Promise<FetchResult<ErrorRow>>` — Asenkron olarak dönen sonuç nesnesi. `rows` alanında `ErrorRow[]` tipinde hata kayıtları dizisi, `totalMatched` alanında filtre kriterlerine uyan toplam kayıt sayısı (`number` tipinde) bulunur. Toplam sayı hesaplanamazsa `0` değerini alır.

### ErrorsTableBody
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
- import: ../../hooks/useTenant::useTenant
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDateTime
- import: ../../types/database.types::type { Database }
- import: ../../utils/adminQueryFilters::orIlikeContains
- import: ../../utils/adminUi::adminInputClass
- import: ../../utils/adminUi::adminSelectClass
- import: ../../utils/adminUi::adminSelectStyle
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @supabase/supabase-js::type { SupabaseClient }
- import: lucide-react::Bug
- import: lucide-react::SearchX
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: sonner::toast

---

## INTERFACES

### ErrorRow
- `id: string`
- `at: string`
- `url?: string | null`
- `message: string`
- `stack?: string | null`
- `user_agent?: string | null`
- `release?: string | null`
- `env?: string | null`
- `level?: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::errorsFetcher
- **params**: `supabase: SupabaseClient<Database>`, `params: FetchParams`
- **ic_degiskenler**:
  - `level` — `params.filters.level?.[0]` değerinden türetilen hata seviyesi filtresi; sorguya `eq('level', level)` olarak eklenir
  - `env` — `params.filters.env?.[0]` değerinden türetilen ortam filtresi; sorguya `eq('env', env)` olarak eklenir
  - `from` — `params.filters.from?.[0]` değerinden türetilen başlangıç tarihi filtresi; sorguya `gte('at', ...)` olarak eklenir
  - `to` — `params.filters.to?.[0]` değerinden türetilen bitiş tarihi filtresi; sorguya `lte('at', ...)` olarak eklenir
  - `query` — `supabase.from('client_errors').select(...)` ile oluşturulan Supabase sorgu nesnesi; filtreler ve sıralama bu nesneye zincirleme eklenir
  - `sortKey` — `params.sort?.key ?? 'at'` ile belirlenen sıralama anahtarı; varsayılan `'at'`
  - `offset` — `(params.page - 1) * params.pageSize` ile hesaplanan sayfalama başlangıç indeksi
  - `data` — `query.range(...)` sonucu dönen satır dizisi
  - `error` — sorgu sırasında oluşan hata; varsa `throw error` ile fırlatılır
  - `count` — `{ count: 'exact' }` ile istenen toplam eşleşen kayıt sayısı
- **Dönüş**: `Promise<FetchResult<ErrorRow>>` — `{ rows: ErrorRow[], totalMatched: number }`

### [N2_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu
  - `lang` — `useI18n()` hook'undan gelen dil bilgisi (`'tr' | 'en'` olarak kullanılır)
  - `tenantId` — `useTenant()` hook'undan gelen kiracı kimliği; realtime kanal adında kullanılır
  - `defaultFrom` — `useMemo` ile hesaplanan varsayılan başlangıç tarihi (bugünden 6 gün önce, `YYYY-MM-DD` formatında)
  - `defaultTo` — `useMemo` ile hesaplanan varsayılan bitiş tarihi (bugün, `YYYY-MM-DD` formatında)
  - `initialFilters` — `useMemo` ile oluşturulan başlangıç filtre nesnesi; `{ env: ['production'], from: [defaultFrom], to: [defaultTo] }`
  - `table` — `useAdminTable<ErrorRow>(...)` hook'undan gelen tablo nesnesi; sayfalama, sıralama, filtreleme, veri çekme işlevlerini barındırır
  - `reloadRef` — `useRef(table.reload)` ile oluşturulan referans; tablo yenileme fonksiyonunu tutar
  - `refetchTimer` — `useRef<ReturnType<typeof setTimeout> | null>(null)` ile oluşturulan debounce zamanlayıcı referansı
  - `setFilter` — `table.filtering.setFilter` fonksiyonu; belirli bir filtre anahtarının değerini ayarlar
  - `setQuery` — `table.filtering.query` setter fonksiyonu; metin arama sorgusunu ayarlar
  - `filters` — `table.filtering.filters` nesnesi; mevcut tüm filtrelerin durumunu içerir
  - `levelVal` — `filters.level?.[0] ?? ''` ile elde edilen seviye filtresi değeri; select bileşeninde kullanılır
  - `envVal` — `filters.env?.[0] ?? ''` ile elde edilen ortam filtresi değeri; select bileşeninde kullanılır
  - `fromVal` — `filters.from?.[0] ?? ''` ile elde edilen başlangıç tarihi filtresi değeri; date input bileşeninde kullanılır
  - `toVal` — `filters.to?.[0] ?? ''` ile elde edilen bitiş tarihi filtresi değeri; date input bileşeninde kullanılır
  - `resetFilters` — `useCallback` ile oluşturulan fonksiyon; tüm filtreleri varsayılan değerlerine sıfırlar
  - `exportCsv` — `useCallback` ile oluşturulan async fonksiyon; filtrelenmiş veriyi CSV olarak dışa aktarır
  - `envOptions` — `useMemo` ile oluşturulan ortam seçenekleri dizisi (`production`, `preview`, `development`, tümü)
  - `columns` — `useMemo<AdminColumn<ErrorRow>[]>` ile oluşturulan tablo sütun tanımları (`at`, `level`, `message`, `url`)
- **Dönüş**: JSX elementi — `DataTableKit` bileşeni

### [N3_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::fmt (useMemo içinde)
- **params**: `d: Date`
- **ic_degiskenler**:
  - `y` — `d.getFullYear()` ile elde edilen yıl değeri
  - `m` — `String(d.getMonth() + 1).padStart(2, '0')` ile elde edilen iki haneli ay değeri
  - `day` — `String(d.getDate()).padStart(2, '0')` ile elde edilen iki haneli gün değeri
- **Dönüş**: `string` — `YYYY-MM-DD` formatında tarih dizesi

### [N4_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::resetFilters
- **params**: yok
- **ic_degiskenler**: yok — dışarıdan erişilen `setQuery`, `setFilter`, `defaultFrom`, `defaultTo` kullanılır
- **Dönüş**: yok (void) — yan etki olarak filtreleri sıfırlar: sorguyu boşaltır, level'ı boş yapar, env'ı `['production']`'a, from/to'yu varsayılan tarihlere ayarlar

### [N5_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::exportCsv
- **params**: yok
- **ic_degiskenler**:
  - `rows` — `table.fetchAllForExport()` ile çekilen tüm filtrelenmiş satırlar; hata durumunda `toast.error` gösterilir ve fonksiyondan çıkılır
  - `header` — çeviri fonksiyonuyla oluşturulan CSV başlık satırı (id, at, level, message, url, userAgent, release, env)
  - `lines` — `rows.map((r) => ...)` ile oluşturulan CSV veri satırları dizisi; her alan virgülle ayrılmış, metin alanları çift tırnak içinde escape edilmiş
  - `csv` — BOM karakteri (`\ufeff`) + header + lines birleştirilerek oluşturulan tam CSV içeriği
  - `blob` — `new Blob([csv], { type: 'text/csv;charset=utf-8;' })` ile oluşturulan dosya blob'u
  - `url` — `URL.createObjectURL(blob)` ile oluşturulan geçici blob URL'si
  - `a` — `document.createElement('a')` ile oluşturunan indirme linki elementi; `a.download` ile dosya adı atanır, `a.click()` ile indirme tetiklenir
- **Dönüş**: yok (void, async) — yan etki olarak tarayıcıda CSV dosyası indirme başlatır

### [N6_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::envOptions (useMemo)
- **params**: yok
- **ic_degiskenler**: yok — dışarıdan erişilen `t` çeviri fonksiyonu kullanılır
- **Dönüş**: `{ value: string, label: string }[]` — ortam seçenekleri dizisi: `production`, `preview`, `development`, tümü (boş value ile)

### [N7_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::columns (useMemo)
- **params**: yok
- **ic_degiskenler**: yok — dışarıdan erişilen `t` ve `lang` kullanılır
- **Dönüş**: `AdminColumn<ErrorRow>[]` — dört sütun tanımı:
  - `at` — tarih sütunu, sıralanabilir, `formatDateTime(r.at, lang)` ile biçimlendirilir
  - `level` — seviye sütunu, sıralanabilir, renkli etiket olarak gösterilir (error/warn/info)
  - `message` — mesaj sütunu, düz metin olarak gösterilir
  - `url` — URL sütunu, gizlenebilir, monospace font ile gösterilir

### [N8_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::renderExpandedRow
- **params**: `r` (ErrorRow tipinde satır verisi)
- **ic_degiskenler**: yok — JSX içinde doğrudan `r.stack`, `r.user_agent`, `r.release`, `r.env` alanlarına erişilir
- **Dönüş**: JSX elementi — iki sütunlu grid düzeninde hata detayları: sol tarafta `stack` (ilk 8000 karakter), sağ tarafta user_agent, release ve env bilgileri

### [N9_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::lines.map callback
- **params**: `r` (ErrorRow tipinde satır verisi)
- **ic_degiskenler**: yok — doğrudan `r.id`, `r.at`, `r.level`, `r.message`, `r.url`, `r.user_agent`, `r.release`, `r.env` alanlarına erişilir
- **Dönüş**: `string` — virgülle ayrılmış CSV satırı; metin alanları çift tırnak içinde escape edilmiş

### [N10_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::useEffect realtime callback
- **params**: yok
- **ic_degiskenler**:
  - `ch` — `supabaseBrowserClient.channel(...)` ile oluşturulan realtime kanal; `postgres_changes` olayı dinlenir, `client_errors` tablosundaki her değişiklikte tetiklenir
- **Dönüş**: yok (void) — yan etki olarak realtime kanal oluşturur ve `postgres_changes` olayında debounce'lu reload tetikler

### [N11_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::postgres_changes handler
- **params**: yok
- **ic_degiskenler**: yok — dışarıdan erişilen `refetchTimer.current` ve `reloadRef.current` kullanılır
- **Dönüş**: yok (void) — yan etki olarak mevcut zamanlayıcıyı temizler ve 400ms gecikmeli `reloadRef.current()` çağrısı başlatır

### [N12_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::useEffect cleanup
- **params**: yok
- **ic_degiskenler**:
  - `ch` — dışarıdan erişilen realtime kanal referansı; `supabaseBrowserClient.removeChannel(ch)` ile kaldırılır
- **Dönüş**: yok (void) — yan etki olarak realtime kanalı kaldırır ve bekleyen zamanlayıcıyı temizler

---

## NODE ID STANDARD

  file: src\views\admin\ErrorsTableBody.tsx
  function: src\views\admin\ErrorsTableBody.tsx::errorsFetcher
  function: src\views\admin\ErrorsTableBody.tsx::ErrorsTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: ErrorsTableBody
  export: errorsFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-bg`, `bg-admin-danger-weak`, `bg-admin-warning-weak`, `bg-surface-deep/40`, `bg-surface-deep/80`, `border-admin-border`, `border-b`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-warning`, `text-right`, `text-xs`
- **Layout:** `custom-scrollbar`, `flex`, `flex-wrap`, `gap-2`, `gap-6`, `grid`, `inline-flex`, `items-center`, `justify-between`, `justify-end`, `max-h-80`, `md:grid-cols-2`, `overflow-auto`, `p-4`
- **Varyant/Responsive:** `:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `===`, `border`, `error`, `font-bold`, `font-medium`, `font-mono`, `font-semibold`, `leading-relaxed`, `mb-3`, `ml-4`, `pb-2`, `px-2`, `py-0.5`