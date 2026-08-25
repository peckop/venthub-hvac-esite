---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\AuditLogTableBody.tsx
skeleton_hash: e0272e6144d454a4
entity_hashes:
  func:AuditLogTableBody: f2050a1564244cb7
  func:auditFetcher: 15cf2cdb6832e2e8
  overview: 3f8c6404d0e8090a
  style_tokens: 6e2907e7b7287d77
generated_at: 2026-08-25T07:30:31Z
---

## Genel Bakış
AuditLogTableBody modülü, admin panelinde denetim günlüğü (audit log) kayıtlarının tablo içinde görüntülenmesinden sorumludur. Supabase veritabanından denetim kayıtlarını çeken bir veri erişim fonksiyonu ve bu kayıtları tablo gövdesinde sunan bir React bileşeni içerir.

## Fonksiyon Grupları
### Veri Erişim
Supabase veritabanından denetim günlüğü kayıtlarını asenkron olarak çeker ve sonuç formatında döndürür.
- auditFetcher

### Bileşen
Denetim günlüğü tablosunun gövde kısmını render eden React bileşenidir. Çekilen verileri tablo yapısı içinde görüntüler.
- AuditLogTableBody

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `supabase` parametresi olarak geçerli bir `SupabaseClient<Database>` nesnesi yoksa, `auditFetcher` veritabanı sorgusunu gerçekleştiremez.

[Aksiyom 2]: Eğer `params` parametresi olarak geçerli bir `FetchParams` nesnesi yoksa, `auditFetcher` hangi verilerin çekileceğini belirleyemez.

[Aksiyom 3]: Eğer `auditFetcher` fonksiyonu düzgün çalışmazsa, `AuditLogTableBody` bileşeni görüntülenecek denetim kayıtlarını alamaz.

[Aksiyom 4]: Eğer Supabase veritabanında `AuditRow` yapısına uygun veriler yoksa, `auditFetcher` boş veya hatalı bir `FetchResult` döndürür.

---

## FONKSİYON DETAYLARI

### auditFetcher
**Ne yapar**: Supabase veritabanındaki `admin_audit_log` tablosundan denetim kayıtlarını filtreleyerek, sıralayarak ve sayfalayarak getiren asenkron veri çekme fonksiyonudur. Audit günlüğü tablosu için veri sağlayıcı (data fetcher) olarak kullanılır.

**Nasıl yapar**: Fonksiyon, gelen `params` nesnesindeki filtre, sıralama ve sayfa bilgilerini kullanarak Supabase sorgusu oluşturur. Sorguya `from`, `to`, `action` ve `batch` filtrelerini koşullu olarak ekler. `params.query` değeri varsa, `table_name`, `row_pk` ve `comment` alanlarında arama yapar — ancak bu arama doğrudan sorgu gramerine gömülmez (T078-VH referansı). `batch` parametresi URL filtre parametresinden gelir ve `after->>batch_id` alanı ile `comment` alanında eşleşme arar. Sıralama anahtarı belirtilmemişse varsayılan olarak `at` alanına göre sıralar. Sayfalama için `offset` ve `pageSize` hesaplanarak `range` metoduyla veri aralığı belirlenir. Hata oluşursa hata fırlatır, başarılı olursa satırları ve toplam eşleşen kayıt sayısını döndürür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase veritabanı istemcisi. Veritabanı şeması tipiyle birlikte gelir.
- `params`: `FetchParams` — Filtre, sıralama, sayfa ve arama bilgilerini içeren parametre nesnesi. İçerisinde `filters` (from, to, action, batch), `sort` (key, dir), `page`, `pageSize` ve `query` alanları bulunur.

**Dönüş**: `Promise<FetchResult<AuditRow>>` — Asenkron olarak çözülen, `rows` (AuditRow dizisi) ve `totalMatched` (toplam eşleşen kayıt sayısı, sayısal değer veya 0) alanlarını içeren sonuç nesnesi.

### AuditLogTableBody
**Ne yapar**: Denetim günlüğü tablosunun gövde bileşenini oluşturan React fonksiyonel bileşenidir. Audit log tablosunun satırlarını render etmekten sorumludur.

**Nasıl yapar**: Fonksiyonun gövdesi verilen kaynak kodda belirtilmemiştir. Bu nedenle iç mantığı hakkında bilgi verilemez.

**Parametreler**: Parametre bilgisi verilen kaynak kodda yer almamaktadır.

**Dönüş**: `React.FC` — React fonksiyonel bileşeni döndürür.

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
- import: sonner::toast

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

### [N1_NASIL] AST Pointer: src/views/admin/AuditLogTableBody.tsx::auditFetcher
- **params**: `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi; `params` — FetchParams tipinde, filtreleme/sayfalama/sıralama parametreleri
- **ic_degiskenler**:
  - `from` — params.filters.from?.[0] değeri, tarih filtresi başlangıcı (YYYY-MM-DD formatında)
  - `to` — params.filters.to?.[0] değeri, tarih filtresi bitişi (YYYY-MM-DD formatında)
  - `action` — params.filters.action?.[0] değeri, işlem tipi filtresi (INSERT, UPDATE, DELETE, CUSTOM)
  - `batch` — params.filters.batch?.[0] değeri, toplu işlem (batch) filtresi
  - `query` — supabase.from('admin_audit_log').select(...) ile oluşturulan Supabase sorgu nesnesi; select edilen alanlar: id, at, actor, table_name, row_pk, action, comment, before, after; count: 'exact'
  - `sortKey` — params.sort?.key değeri, yoksa varsayılan 'at'; sıralama alanı belirler
  - `offset` — (params.page - 1) * params.pageSize hesaplaması; sayfalama ofseti
  - `data` — await query.range(offset, offset + params.pageSize - 1) sonucu dönen satırlar dizisi
  - `error` — sorgu sonucu oluşan hata nesnesi; varsa throw ile fırlatılır
  - `count` — sorgu sonucu dönen toplam eşleşen kayıt sayısı (exact count)
- **Dönüş**: Promise<FetchResult<AuditRow>> — rows (AuditRow[]) ve totalMatched (number) alanlarını içeren nesne

---

### [N2_NASIL] AST Pointer: src/views/admin/AuditLogTableBody.tsx::AuditLogTableBody
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu
  - `lang` — useI18n() hook'undan gelen mevcut dil kodu
  - `table` — useAdminTable<AuditRow>({...}) ile oluşturulan tablo nesnesi; resource: 'audit', rowId: (r) => r.id, fetcher: auditFetcher, paginationMode: 'server', sortMode: 'server', initialSort: { key: 'at', dir: 'desc' }, syncUrl: true
  - `setFilter` — table.filtering.setFilter fonksiyonu; filtre değerlerini ayarlar
  - `setQuery` — table.filtering.setQuery fonksiyonu; arama metnini ayarlar
  - `filters` — table.filtering.filters nesnesi; mevcut tüm filtreler
  - `actionVal` — filters.action?.[0] ?? ''; action filtresinin mevcut değeri
  - `fromVal` — filters.from?.[0] ?? ''; tarih başlangıç filtresinin mevcut değeri
  - `toVal` — filters.to?.[0] ?? ''; tarih bitiş filtresinin mevcut değeri
  - `batchVal` — filters.batch?.[0] ?? ''; batch filtresinin mevcut değeri
  - `resetFilters` — useCallback ile sarılı fonksiyon; setQuery('') ve tüm filtreleri boş diziye sıfırlar, bağımlılıkları: [setQuery, setFilter]
  - `clearBatch` — useCallback ile sarılı fonksiyon; sadece setFilter('batch', []) çağırır, bağımlılıkları: [setFilter]
  - `exportCsv` — useCallback ile sarılı async fonksiyon; table.fetchAllForExport() ile tüm filtrelenmiş veriyi çeker, CSV formatında Blob oluşturur ve tarayıcıda indirme tetikler; hata durumunda toast.error gösterir, bağımlılıkları: [table, t]
  - `columns` — useMemo ile sarılı AdminColumn<AuditRow>[] dizisi; 5 sütun tanımlar: at (sortable, formatDateTime ile), action (sortable, renkli etiket), table_name, row_pk, comment; bağımlılıkları: [t, lang]
- **Dönüş**: JSX.Element — space-y-6 div'i içinde batchVal varsa uyarı banner'ı, DataTableKit bileşeni (columns, table, rowId, persistKey: 'audit', hasWriteAccess: false, emptyState, filterEmptyState, errorLabel, columnsButtonLabel, totalLabel, expandLabel, renderExpandedRow ile JsonDiffViewer, toolbarSlot ile AdminToolbar)

---

### [N3_NASIL] AST Pointer: src/views/admin/AuditLogTableBody.tsx::resetFilters
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — dışarıdan kapatılan setQuery ve setFilter fonksiyonlarını çağırır)
- **Dönüş**: void — setQuery('') çağırır, setFilter('action', []), setFilter('from', []), setFilter('to', []), setFilter('batch', []) çağırarak tüm filtreleri sıfırlar

---

### [N4_NASIL] AST Pointer: src/views/admin/AuditLogTableBody.tsx::clearBatch
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — dışarıdan kapatılan setFilter fonksiyonunu çağırır)
- **Dönüş**: void — setFilter('batch', []) çağırarak batch filtresini temizler

---

### [N5_NASIL] AST Pointer: src/views/admin/AuditLogTableBody.tsx::exportCsv
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `rows` — table.fetchAllForExport() sonucu; Awaited<ReturnType<typeof table.fetchAllForExport>> tipinde; tüm filtrelenmiş satırlar
  - `header` — 7 sütun başlığını virgülle birleştiren string: id, at, actor, action, tableName, rowPk, comment (t ile çevrilmiş)
  - `lines` — rows dizisi üzerinde map ile üretilen CSV satırları dizisi; her satırda r.id, r.at, r.actor (çift tırnak escape ile), r.action, r.table_name, r.row_pk (çift tırnak escape ile), r.comment (çift tırnak escape ile) virgülle birleştirilir
  - `csv` — '\ufeff' BOM + header + lines birleştirilmiş tam CSV metni
  - `blob` — new Blob([csv], { type: 'text/csv;charset=utf-8;' }); CSV verisini içeren Blob nesnesi
  - `url` — URL.createObjectURL(blob); Blob için geçici URL
  - `a` — document.createElement('a'); indirme bağlantısı elementi; a.href = url, a.download = t('admin.audit.export.filename')
- **Dönüş**: Promise<void> — yan etki olarak tarayıcıda CSV dosyası indirme tetikler; hata durumunda toast.error(t('admin.audit.export.failed')) gösterir ve return ile erken çıkar

---

## NODE ID STANDARD

  file: AuditLogTableBody.tsx
  function: AuditLogTableBody.tsx::auditFetcher
  function: AuditLogTableBody.tsx::AuditLogTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuditLogTableBody
  export: auditFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-danger-weak`, `bg-admin-success-weak`, `bg-admin-surface`, `bg-admin-surface-3`, `bg-admin-warning-weak`, `bg-surface-deep/60`, `border-admin-accent/30`, `border-admin-border`, `border-admin-danger/30`, `border-admin-success/30`, `border-admin-warning/30`, `hover:bg-admin-warning-weak`, `text-admin-accent`, `text-admin-danger`
- **Layout:** `!h-8`, `block`, `flex`, `flex-wrap`, `gap-2`, `gap-3`, `gap-4`, `items-center`, `justify-between`, `justify-end`, `max-w-xs`, `p-1`, `p-4`
- **Varyant/Responsive:** `:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `!px-3`, `$`, `${adminButtonSecondaryClass`, `:`, `===`, `DELETE`, `INSERT`, `UPDATE`, `border`, `font-mono`, `font-semibold`, `mb-4`, `px-2`, `py-0.5`, `r.action`