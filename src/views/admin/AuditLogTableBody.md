---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AuditLogTableBody.tsx
skeleton_hash: 2b37cc68c7d8558c
entity_hashes:
  func:AuditLogTableBody: f2050a1564244cb7
  func:auditFetcher: c536e1c4fe42785b
  overview: 5e221481f809c5e2
  style_tokens: 8e3bff93edb3a9ff
generated_at: 2026-06-13T18:04:04Z
---

## Genel Bakış
Bu modül, yöneticilerin denetim kayıtlarını (audit logs) tablo formatında görüntülemesini sağlayan bir admin paneli bileşenidir. Supabase üzerinden denetim verilerini çekerek kullanıcı faaliyetlerinin izlenmesine olanak tanır.

## Fonksiyon Grupları
### Veri Çekme (Data Fetching)
Denetim kayıtlarını Supabase veritabanından asenkron olarak çeken ve sayfalama parametrelerine göre filtrelenmiş sonuçları döndüren veri erişim katmanı.
- `auditFetcher` — Supabase istemcisi ile veritabanına bağlanarak denetim satırlarını getirir

### Tablo Görünümü (Table View)
Denetim kayıtlarını kullanıcıya tablo formatında sunan React bileşeni. Veri çekme işlemini或cheterek satırları dinamik olarak render eder.
- `AuditLogTableBody` — Denetim loglarını tablo gövdesinde gösteren bileşendir

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase tabanlı bir denetim (audit) günlük tablosunu görüntülemek için tasarlanmış bir React bileşenidir. Verilen fonksiyon imzalarından aşağıdaki mimari varsayımlar çıkarılabilir:

[Aksiyom 1]: Eğer `supabase` parametresi geçerli ve kimliği doğrulanmış bir `SupabaseClient<Database>` nesnesi değilse, `auditFetcher` fonksiyonu hata fırlatır veya boş/geçersiz sonuç döner.

[Aksiyom 2]: Eğer `Database` tipi tanımlamasında audit_log ile ilgili bir tablo (örn: `audit_logs`) ve bu tablonun `AuditRow` tipine karşılık gelen sütunları yoksa, veri çekme işlemi başarısız olur veya tip hatası oluşur.

[Aksiyom 3]: Eğer `params: FetchParams` geçerli filtreleme, sayfalama veya sıralama parametreleri içermiyorsa, `auditFetcher` beklenmeyen veya eksik veri döner.

[Aksiyom 4]: Eğer `AuditLogTableBody` bileşeni kullanıldığı bağlamda (`supabase` bağlantısı, veri kaynağı) sağlanmamışsa, bileşen boş hata durumuna düşer veya render edilemez.

[Aksiyom 5]: Eğer Supabase tarafında audit tablosu için Row Level Security (RLS) politikaları tanımlı ve kullanıcı yetkilendirmesi yapılmamışsa, `auditFetcher` erişim reddi hatası ile karşılaşır.

[Aksiyom 6]: Eğer `FetchResult<AuditRow>` yapısında beklenen alanlar (örn: `data`, `count`, `error`) tanımlı değilse, `AuditLogTableBody` bileşeni verileri doğru şekilde işleyemez.

---

## FONKSİYON DETAYLARI

### auditFetcher
**Ne yapar**: Veritabanından, verilen filtreleme, sıralama ve sayfalama parametrelerine göre denetim (audit) log kayıtlarını çeken asenkron bir veri getirici fonksiyondur. Sayfalı ve filtrelenmiş bir `AuditRow` dizisi ile toplam eşleşen kayıt sayısını döndürür.

**Nasıl yapar**: `supabase.from('admin_audit_log')` ile Supabase istemcisinden `admin_audit_log` tablosuna sorgu başlatır. `select` metodunda sayım dahil belirli sütunları seçer. Sıralama için `params.sort` parametresini kullanır; belirtilmemişse `at` sütununa göre azalan sıralama yapar. Gelen `params.filters` nesnesindeki `from`, `to`, `action` ve `batch` filtrelerini sırasıyla `gte`, `lte`, `eq` ve `or` metodlarıyla sorguya ekler. Metin araması (`params.query`) durumunda `table_name`, `row_pk` ve `comment` sütunlarında `ilike` kullanarak eşleşme arar. `batch` filtresi, JSON sütunu olan `after` içindeki `batch_id` alanı veya `comment` alanı üzerinde arama yapar. Son olarak `range` metoduyla sayfalama uygular, sonucu alır ve hata oluşursa fırlatır. Dönen veriyi `AuditRow[]` dizisine dönüştürerek ve toplam sayıyı da `totalMatched` alanına ekleyerek `FetchResult` formatında geri verir.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Veritabanı bağlantısı ve sorguları için kullanılacak Supabase istemci nesnesi.
- `params`: `FetchParams` — Fonksiyona özel filtreleme, sıralama, sayfalama ve arama parametrelerini içeren nesne. `filters`, `sort`, `query`, `page`, `pageSize` gibi alanları barındırır.

**Dönüş**: `Promise<FetchResult<AuditRow>>` — Asenkron olarak, `AuditRow` tipinde satırlar (`rows` dizisi) ve toplam eşleşen kayıt sayısını (`totalMatched` sayısı) içeren bir nesne döner.

### AuditLogTableBody
**Ne yapar**: `auditFetcher` fonksiyonunu kullanarak denetim loglarını çeken, sayfalayan, filtreleyen ve arayüzde bir HTML tablosu içinde gösteren React fonksiyonel bileşenidir. Kullanıcı etkileşimlerine (sıralama, filtreleme, sayfa değiştirme) tepki verir ve yükleme durumlarını yönetir.

**Nasıl yapar**: `useState` ile sayfa, filtre ve veri durumlarını tutar. `useEffect` ile `auditFetcher` fonksiyonunu, `filters`, `sort`, `page` ve `query` parametreleri değiştiğinde yeniden çağırarak verileri getirir. Veri çekme işlemi sırasında `loading` durumunu yönetir ve hata oluşursa hata mesajını gösterir. `TablePagination` bileşenini kullanarak sayfalama kontrollerini sunar. `AuditLogTableHeader` bileşeni ile tablonun başlığını ve sıralama düğmelerini oluşturur. Her bir `AuditRow` nesnesi için `AuditLogTableRow` bileşenini bir `map` döngüsü ile render ederek satırları oluşturur. Toplam satır sayısını ve toplam eşleşen sayıyı gösterir. `AuditLogTableRow`'a gerekli verileri ve `expanded` durumunu aktarır.

**Parametreler**:
- Fonksiyon本身i parametre almaz. (`() -> React.FC` olarak tanımlanmış).

**Dönüş**: `React.FC` — React Fonksiyonel Bileşeni. Denetim kayıtlarını gösteren tablo gövdesini (başlık, satırlar, pagination) içeren JSX döndürür.

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

### [N1_NASIL] AST Pointer: src\views\admin\AuditLogTableBody.tsx::auditFetcher
- **params**: `(supabase: SupabaseClient<Database>, params: FetchParams)`
- **ic_degiskenler**:
    - `from` — `params.filters.from` dizisinin ilk elemanı. Tarih aralığının başlangıç tarihini (YYYY-MM-DD formatında) tutar.
    - `to` — `params.filters.to` dizisinin ilk elemanı. Tarih aralığının bitiş tarihini tutar.
    - `action` — `params.filters.action` dizisinin ilk elemanı. Filtrelenecek denetim kaydı eylemini (INSERT, UPDATE, vb.) tutar.
    - `batch` — `params.filters.batch` dizisinin ilk elemanı. Filtrelenecek toplu iş (batch) kimliğini tutar.
    - `query` — Supabase sorgu nesnesi. Başlangıçta `admin_audit_log` tablosundaki belirli alanları seçer, sayfalama için `count` hesaplar. Sonradan sıralama ve filtre eklemeleri için kullanılır.
    - `sortKey` — `params.sort?.key` değerinden veya varsayılan olarak `'at'` alanından türetilen sıralama anahtarı.
    - `like` — `params.query` değerini `%` joker karakterleri ile sarmalayan LIKE sorgu kalıbı.
    - `offset` — Sayfalama için hesaplanan başlangıç satırı indeksi: `(params.page - 1) * params.pageSize`.
- **Dönüş**: `Promise<FetchResult<AuditRow>>` — `rows` (denetim kaydı dizisi) ve `totalMatched` (toplam eşleşen kayıt sayısı) içeren bir nesne.

### [N2_NASIL] AST Pointer: src\views\admin\AuditLogTableBody.tsx::AuditLogTableBody
- **params**: `(parametre yok)` (React fonksiyonel bileşeni)
- **ic_degiskenler**:
    - `table` — `useAdminTable` hook'unun döndürdüğü nesne. Tablonun durumu (satırlar, toplam, yükleme durumu) ve eylemleri (filtreleme, sıralama, sayfalama) içerir.
    - `setFilter` — `table.filtering` nesnesinden çıkarılan, belirli bir filtre anahtarının değerini ayarlayan işlev.
    - `setQuery` — `table.filtering` nesnesinden çıkarılan, metin sorgusunu ayarlayan işlev.
    - `filters` — `table.filtering` nesnesinden çıkarılan, tüm aktif filtrelerin değerlerini içeren nesne.
    - `actionVal` — `filters.action` dizisinin ilk elemanı veya boş string. Eylem filtresinin mevcut değerini tutar.
    - `fromVal` — `filters.from` dizisinin ilk elemanı veya boş string. Başlangıç tarihi filtresinin mevcut değerini tutar.
    - `toVal` — `filters.to` dizisinin ilk elemanı veya boş string. Bitiş tarihi filtresinin mevcut değerini tutar.
    - `batchVal` — `filters.batch` dizisinin ilk elemanı veya boş string. Toplu iş filtresinin mevcut değerini tutar.
    - `resetFilters` — `useCallback` ile tanımlanmış, tüm filtreleri ve sorguyu sıfırlayan işlev. `setQuery` ve `setFilter` bağımlılıklarına sahiptir.
    - `clearBatch` — `useCallback` ile tanımlanmış, sadece `batch` filtresini sıfırlayan işlev. `setFilter` bağımlılığına sahiptir.
    - `columns` — `useMemo` ile hesaplanmış, `AdminColumn<AuditRow>[]` tipinde dizi. Tablo sütunlarının tanımını (anahtar, başlık, hücre oluşturma işlevi) içerir. Hücre işlevleri `r.at`, `r.action`, `r.table_name`, `r.row_pk`, `r.comment` alanlarını kullanır. `formatDateTime` ve dil (`lang`) kullanarak tarihleri biçimlendirir.
- **Dönüş**: `JSX.Element` — `DataTableKit` ve `AdminToolbar` bileşenlerini kullanan, filtre durumu ve toplu iş bildirimi içeren bir JSX yapısı. `renderExpandedRow` prop'u, `r.before` ve `r.after` alanlarını `JsonDiffViewer` componentine iletir. `toolbarSlot`, `table.filtering.query` ve `actionVal`, `fromVal`, `toVal`, `batchVal` değerlerini input/select elemanlarına bağlar.

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