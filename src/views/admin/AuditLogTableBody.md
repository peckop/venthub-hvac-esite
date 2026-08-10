---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AuditLogTableBody.tsx
skeleton_hash: 5a256f48933f7a2b
entity_hashes:
  func:AuditLogTableBody: f2050a1564244cb7
  func:auditFetcher: aa6d40cc3bb6c8b9
  overview: a55893ff85a3f719
  style_tokens: 8e3bff93edb3a9ff
generated_at: 2026-06-19T20:49:43Z
---

## Genel Bakış
Bu modül, admin paneli için denetim kayıtlarının (audit logs) tabloda görüntülenmesini sağlayan bir React bileşenidir. Supabase veritabanından kullanıcı faaliyetlerini çekerek, yöneticilerin sistemi izlemesine ve denetlemesine olanak tanır. Modül, veri çekme ve arayüz sunumu gibi iki temel sorumluluğu bir arada yönetir.

## Fonksiyon Grupları
### Veri Erişimi (Data Access)
Supabase istemcisi kullanarak denetim kayıtlarını asenkron olarak veritabanından çeken ve sayfalama/filtreleme parametrelerine göre yapılandırılmış sonuçlar döndüren mantıksal katman.
- `auditFetcher` — Veritabanı bağlantısı alarak denetim satırlarını getirir ve standart bir fetch sonucu formatında sunar.

### Bileşen Sunumu (Component Presentation)
Çekilen denetim verisini kullanıcıya tablo satırları halinde dinamik olarak gösteren, React tabanlı arayüz bileşeni.
- `AuditLogTableBody` — Tablonun gövde bölümünü oluşturarak her bir denetim kaydını satır olarak render eder.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase üzerinden denetim kayıtlarını çekerek tablo formatında gösteren bir admin bileşenidir.

**[Aksiyom 1]**: Eğer `auditFetcher` için geçerli bir `SupabaseClient<Database>` bağlantısı yoksa, veri çekme işlemi başarısız olur veya hata fırlatır.

**[Aksiyom 2]**: Eğer `FetchParams` parametresi sağlanması gereken sayfalama/filtreleme bilgilerini içermiyorsa, beklenmeyen veya boş sonuçlar döner.

**[Aksiyom 3]**: Eğer Supabase veritabanında `audit_logs` tablosu (veya denetim kayıtlarını tutan karşılıklı tablo) erişilebilir değilse, `auditFetcher` Promise'ı reddedilir.

**[Aksiyom 4]**: Eğer `AuditLogTableBody` bileşeni bileşen ağacında bir `AuditRow[]` verisi veya buna erişim sağlayan bir context/provider olmadan kullanılırsa, tablo boş görünür veya hata verir.

**[Aksiyom 5]**: Eğer Supabase bağlantısı kesilir veya zaman aşımına uğrarsa (timeout), asenkron veri çekme süreci askıda kalır.

**[Aksiyom 6]**: Eğer `Database` tipi ile tanımlanan şema yapısı (audit logs tablosu ve sütunları) değiştirilirse, `AuditRow` tipi tutarsızlaşır ve çalışma zamanı hataları oluşur.

---

## FONKSİYON DETAYLARI

### auditFetcher

**Ne yapar**: Supabase veritabanındaki admin_audit_log tablosundan denetim kayıtlarını filtreleme, sıralama ve sayfalama desteğiyle çeker. Admin kullanıcılarının yaptığı değişiklikleri izlemek için kullanılır.

**Nasıl yapar**: Fonksiyon, Supabase client üzerinden admin_audit_log tablosuna bir sorgu oluşturur. Önce temel select işlemini tanımlar, ardından `params.sort` parametresine göre sıralama belirler (varsayılan olarak 'at' sütununu kullanır). Filtre parametreleri sırasıyla uygulanır: tarih aralığı filtresi (gte/lte ile), action tipi filtresi (eq ile), serbest metin arama filtresi (ilike ile OR operatöründe table_name, row_pk ve comment alanlarında), ve batch filtresi (JSONB alanı olan after->>batch_id veya comment içindeki arama ile). Son olarak offset hesaplanarak range ile sayfalama uygulanır ve sonuç {rows, totalMatched} formatında döndürülür.

**Parametreler**:
- supabase: `SupabaseClient<Database>` — Veritabanı bağlantısı sağlayan Supabase istemcisi, Database tipi ile tip güvenliği sağlanmış yapıda
- params: `FetchParams` — Filtreleme, sıralama ve sayfalama parametrelerini içeren nesne. İçerisinde şu alanlar bulunur:
  - filters.from: `string[] | undefined` — Başlangıç tarih filtresi, ISO formatında tarih (örn: "2024-01-15")
  - filters.to: `string[] | undefined` — Bitiş tarih filtresi, ISO formatında tarih
  - filters.action: `string[] | undefined` — İşlem tipi filtresi (örn: "INSERT", "UPDATE", "DELETE")
  - filters.batch: `string[] | undefined` — Toplu işlem ID'si filtresi
  - sort.key: `string | undefined` — Sıralama yapılacak sütun adı, varsayılan 'at'
  - sort.dir: `'asc' | 'desc' | undefined` — Sıralama yönü
  - query: `string | undefined` — Serbest metin arama terimi, tablo adı, satır ID'si ve yorum alanlarında aranır
  - page: `number` — Mevcut sayfa numarası (1'den başlar)
  - pageSize: `number` — Sayfa başına gösterilecek kayıt sayısı

**Dönüş**: `Promise<FetchResult<AuditRow>>` — Asenkron olarak dönen sonuç nesnesi. İçeriği:
  - rows: `AuditRow[]` — Sorgu sonucunda elde edilen denetim kayıtları dizisi
  - totalMatched: `number` — Filtreleme sonucunda eşleşen toplam kayıt sayısı (sayfalama için gerekli)

### AuditLogTableBody
**Ne yapar**: `auditFetcher` fonksiyonunu kullanarak denetim loglarını çeken, sayfalayan, filtreleyen ve arayüzde bir HTML tablosu içinde gösteren React fonksiyonel bileşenidir. Kullanıcı etkileşimlerine (sıralama, filtreleme, sayfa değiştirme) tepki verir ve yükleme durumlarını yönetir.

**Nasıl yapar**: `useState` ile sayfa, filtre ve veri durumlarını tutar. `useEffect` ile `auditFetcher` fonksiyonunu, `filters`, `sort`, `page` ve `query` parametreleri değiştiğinde yeniden çağırarak verileri getirir. Veri çekme işlemi sırasında `loading` durumunu yönetir ve hata oluşursa hata mesajını gösterir. `TablePagination` bileşenini kullanarak sayfalama kontrollerini sunar. `AuditLogTableHeader` bileşeni ile tablonun başlığını ve sıralama düğmelerini oluşturur. Her bir `AuditRow` nesnesi için `AuditLogTableRow` bileşenini bir `map` döngüsü ile render ederek satırları oluşturur. Toplam satır sayısını ve toplam eşleşen sayıyı gösterir. `AuditLogTableRow`'a gerekli verileri ve `expanded` durumunu aktarır.

**Parametreler**:
- Fonksiyon本身i parametre almaz. (`() -> React.FC` olarak tanımlanmış).

**Dönüş**: `React.FC` — React Fonksiyonel Bileşeni. Denetim kayıtlarını gösteren tablo gövdesini (başlık, satırlar, pagination) içeren JSX döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/ExportMenu::ExportMenu
- import: ../../components/admin/JsonDiffViewer::JsonDiffViewer
- import: ../../components/admin/data-table/DataTableKit::DataTableKit
- import: ../../components/admin/data-table/types::type { AdminColumn }
- import: ../../hooks/useAdminTable::type FetchParams
- import: ../../hooks/useAdminTable::type FetchResult
- import: ../../hooks/useAdminTable::useAdminTable
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDateTime
- import: ../../types/database.types::type { Database }
- import: ../../utils/adminUi::adminButtonSecondaryClass
- import: ../../utils/adminUi::adminInputClass
- import: @supabase/supabase-js::type { SupabaseClient }
- import: lucide-react::ClipboardList
- import: lucide-react::Filter
- import: lucide-react::SearchX
- import: lucide-react::Terminal
- import: react::React
- import: react::useCallback
- import: react::useMemo

---

## INTERFACES

### AuditRow
- `id: string`
- `at: string`
- `actor: string | null`
- `table_name: string`
- `row_pk: string | null`
- `action: string`
- `comment: string | null`
- `before: unknown`
- `after: unknown`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/admin/AuditLogTableBody.tsx`::auditFetcher
- **params**: `(supabase: SupabaseClient<Database>, params: FetchParams)`
- **ic_degiskenler**:
  - `from` — `params.filters.from?.[0]` aracılığıyla alınan başlangıç tarihi filtresi; `gte` sorgusunda kullanılır
  - `to` — `params.filters.to?.[0]` aracılığıyla alınan bitiş tarihi filtresi; `lte` sorgusunda kullanılır
  - `action` — `params.filters.action?.[0]` aracılığıyla alınan aksiyon filtresi (INSERT/UPDATE/DELETE vb.); `eq` sorgusunda kullanılır
  - `batch` — `params.filters.batch?.[0]` aracılığıyla alınan batch ID filtresi; `or` sorgusunda `after->>batch_id` ve `comment` üzerinde arama yapılır
  - `query` — Supabase `from('admin_audit_log')` ile başlayan zincirlenebilir sorgu nesnesi; `select`, `order`, `gte`, `lte`, `eq`, `or`, `range` metodlarıyla inşa edilir
  - `sortKey` — `params.sort?.key ?? 'at'` ile belirlenen sıralama anahtarı varsayılan olarak `'at'`; `query.order()` içinde kullanılır
  - `like` — `` `%${params.query}%` `` deseni; `or()` sorgusunda `table_name`, `row_pk`, `comment` alanlarında LIKE araması için kullanılır
  - `offset` — `(params.page - 1) * params.pageSize` hesaplamasıyla elde edilen sayfalama başlangıç indeksi; `query.range()` içinde kullanılır
  - `data` — `await query.range(...)` çağrısından dönen sorgu satırları dizisi
  - `error` — `await query.range(...)` çağrısından dönen hata nesnesi; truthy ise `throw error` ile fırlatılır
  - `count` — `select`'te `count: 'exact'` ile istenen toplam eşleşen kayıt sayısı; `totalMatched` dönüş değerine yazılır
- **Dönüş**: `Promise<FetchResult<AuditRow>>` — `{ rows: AuditRow[], totalMatched: number }` nesnesi

---

### [N2_NASIL] AST Pointer: `src/views/admin/AuditLogTableBody.tsx`::AuditLogTableBody
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; tüm UI metinlerinde (`t('admin.audit.colDate')` vb.) kullanılır
  - `lang` — `useI18n()` hook'undan dönen dil kodu (`'tr'` | `'en'`); `formatDateTime` çağrısına `lang as 'tr' | 'en'` olarak iletilir
  - `table` — `useAdminTable<AuditRow>({...})` hook'undan dönen tablo state nesnesi; `filtering`, `fetchAllForExport`, `totalMatched`, `sorting` gibi alanları içerir; `paginationMode: 'server'`, `sortMode: 'server'`, `syncUrl: true` ile yapılandırılır
  - `setFilter` — `table.filtering` destructuring'inden alınan filtre setter fonksiyonu; `setFilter('action', [])`, `setFilter('from', [...])`, `setFilter('batch', [])` çağrılarıyla filtreler değiştirilir
  - `setQuery` — `table.filtering` destructuring'inden alınan arama sorgusu setter fonksiyonu; `setQuery('')` ile arama temizlenir, `AdminToolbar`'a `onChange` olarak bağlanır
  - `filters` — `table.filtering.filters` referansı; mevcut tüm filtrelerin Record nesnesi
  - `actionVal` — `filters.action?.[0] ?? ''` ile alınan mevcut aksiyon filtresi değeri; `AdminToolbar` `select` prop'una `value` olarak bağlanır
  - `fromVal` — `filters.from?.[0] ?? ''` ile alınan başlangıç tarihi filtresi değeri; `<input type="date">` `value` prop'una bağlanır
  - `toVal` — `filters.to?.[0] ?? ''` ile alınan bitiş tarihi filtresi değeri; `<input type="date">` `value` prop'una bağlanır
  - `batchVal` — `filters.batch?.[0] ?? ''` ile alınan batch filtresi değeri; batch bilgi banner'ının koşullu gösteriminde (`{batchVal && ...}`) ve `href` query string'inde (`/admin/movements?batch=${batchVal}`) kullanılır
  - `resetFilters` — `useCallback` ile memoize edilmiş fonksiyon; `setQuery('')` ve dört `setFilter` çağrısıyla tüm filtreleri sıfırlar; `AdminToolbar` `onClear` prop'una bağlanır; bağımlılıklar: `[setQuery, setFilter]`
  - `clearBatch` — `useCallback` ile memoize edilmiş fonksiyon; `setFilter('batch', [])` ile yalnızca batch filtresini temizler; batch banner'ındaki "Temizle" butonunun `onClick` handler'ıdır; bağımlılıklar: `[setFilter]`
  - `exportCsv` — `useCallback` ile memoize edilmiş async fonksiyon; `table.fetchAllForExport()` ile tüm filtrelenmiş satırları çeker, CSV başlık satırını `t()` çevirileriyle oluşturur, `rows.map()` ile her satırı CSV formatına dönüştürür (`r.id`, `r.at`, `r.actor`, `r.action`, `r.table_name`, `r.row_pk`, `r.comment` alanları); BOM (`\ufeff`) ekleyerek `Blob` oluşturur, `URL.createObjectURL` ile indirme URL'i üretir, geçici `<a>` elementi oluşturup `a.click()` ile tetikler, ardından `URL.revokeObjectURL` ile temizler; bağımlılıklar: `[table, t]`
  - `columns` — `useMemo<AdminColumn<AuditRow>[]>` ile memoize edilmiş kolon tanımları dizisi; beş kolon: `at` (tarih, `formatDateTime` ile formatlanır, `sortable: true`), `action` (aksiyon badge'i, renk kodlamalı koşullu className ile, `sortable: true`), `table_name`, `row_pk`, `comment`; her kolon `cell: (r) => JSX` callback'ine sahiptir; bağımlılıklar: `[t, lang]`
- **Dönüş**: JSX — `<div className="space-y-6">` sarmalayıcısı içinde; koşullu batch bilgi banner'ı (`batchVal` truthy ise); `DataTableKit` bileşeni (`columns`, `table`, `rowId`, `persistKey`, `emptyState`, `filterEmptyState`, `errorLabel`, `expandLabel`, `renderExpandedRow` (`JsonDiffViewer` ile `r.before`/`r.after` gösterimi), `toolbarSlot` (`AdminToolbar` ile arama, aksiyon select, tarih input'ları, `ExportMenu`))

---

## NODE ID STANDARD

  file: src\views\admin\AuditLogTableBody.tsx
  function: src\views\admin\AuditLogTableBody.tsx::auditFetcher
  function: src\views\admin\AuditLogTableBody.tsx::AuditLogTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuditLogTableBody
  export: auditFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500/5`, `bg-cyan-500/10`, `bg-emerald-500/10`, `bg-rose-500/10`, `bg-slate-500/10`, `bg-surface-deep/60`, `border-amber-500/20`, `border-cyan-500/20`, `border-emerald-500/20`, `border-rose-500/20`, `border-slate-500/20`, `border-white/5`, `hover:bg-amber-500/10`, `text-amber-500`, `text-cyan-400`
- **Layout:** `!h-8`, `block`, `flex`, `gap-2`, `gap-3`, `gap-4`, `items-center`, `justify-between`, `max-w-xs`, `p-1`, `p-4`
- **Varyant/Responsive:** `:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `!px-3`, `$`, `${adminButtonSecondaryClass`, `:`, `===`, `DELETE`, `INSERT`, `UPDATE`, `border`, `font-black`, `font-mono`, `glass-strong`, `mb-4`, `px-2`, `py-0.5`