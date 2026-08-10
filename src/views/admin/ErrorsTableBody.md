---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\ErrorsTableBody.tsx
skeleton_hash: 23a332acfe9d1e92
entity_hashes:
  func:ErrorsTableBody: ba1ec68351d28cea
  func:errorsFetcher: 302fd71d65955412
  overview: 6d954e96feed8bd9
  style_tokens: e38a63b8dd8d7926
generated_at: 2026-06-19T20:50:10Z
---

## Genel Bakış
Bu modül, admin panelindeki hata kayıtları tablosunun gövde bileşenini ve bu verileri Supabase veritabanından asenkron olarak çekmekten sorumlu olan yardımcı fonksiyonu içerir. Modül, hem veri fetching (çekme) mantığını hem de tablonun sunumunu bir arada yöneterek hata verilerinin kullanıcıya tablo formatında gösterilmesini sağlar.

## Fonksiyon Grupları
### Veri Çekme ve Yönetim
Bu grup, modülün arkasındaki veri erişim katmanını temsil eder; Supabase istemcisini kullanarak belirli parametrelere göre hata kayıtlarını asenkron olarak çeker ve veri yapısını hazırlar.
- errorsFetcher

### Arayüz Gösterimi
Bu grup, çekilen hata verilerini admin panelindeki tablonun gövdesi olarak kullanıcıya sunan React bileşenini tanımlar ve tablo satırlarının render edilmesini yönetir.
- ErrorsTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase veritabanından hata kayıtlarını çekip admin panelindeki bir tabloda göstermeye yarayan iki ana bileşenden oluşur.

[Aksiyom 1]: Eğer `supabase` parametresi (`SupabaseClient<Database>` türünde) geçerli bir veritabanı bağlantısı içermiyorsa, `errorsFetcher` fonksiyonu sorgu başlatamaz ve bir hata fırlatır.

[Aksiyom 2]: Eğer `params` parametresi (`FetchParams` türünde) geçerli filtreleme/sayfalama değerleri içermiyorsa, `errorsFetcher` fonksiyonu beklenmeyen bir veri yapısı ile karşılaşır ve hata fırlatır.

[Aksiyom 3]: Eğer `errorsFetcher` fonksiyonu başarıyla çalışırsa, dönen `Promise<FetchResult<ErrorRow>>` yapısının `data` alanı `ErrorRow` dizisi içermelidir; bu dizi `ErrorsTableBody` bileşeni tarafından işlenip tabloya dönüştürülür.

[Aksiyom 4]: Eğer `ErrorsTableBody` bileşeni veriler henüz yüklenmeden render edilirse, bileşen veri yokluğunu (örneğin boş tablo veya yükleme göstergesi) görsel olarak temsil etmelidir.

[Aksiyom 5]: Eğer Supabase veritabanında hata kayıtlarının tutulduğu tablo veya view yapısı değişmişse (örneğin `ErrorRow` alanları farklıysa), `errorsFetcher` geçersiz veri döner ve `ErrorsTableBody` bileşeni hatalı çalışır.

---

## FONKSİYON DETAYLARI

### errorsFetcher

**Ne yapar**: Supabase veritabanındaki `client_errors` tablosundan hata kayıtlarını, istenen filtreleme, sıralama ve sayfalama parametrelerine göre getirir. Bu fonksiyon, admin panelindeki hata tablosunun veri kaynağı olarak kullanılır ve toplam eşleşen kayıt sayısını da döndürerek sayfalama UI'ının doğru çalışmasını sağlar.

**Nasıl yapar**: Fonksiyon, verilen `FetchParams` nesnesinden filtre parametrelerini (seviye, ortam, tarih aralığı) çıkarır ve Supabase sorgusuna zincirler. Önce temel `select` sorgusunu oluşturur, ardından sıralama ekler. Koşullu filtreler (`gte`, `lte`, `eq`) tarih ve kategori bazlı filtreleme için uygulanır. Metin araması için `ilike` operatörü kullanılarak URL ve mesaj alanlarında kısmi eşleşme yapılır. Son olarak `range` metodu ile sayfalama uygulanır ve sonuç `FetchResult` formatında döndürülür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Veritabanı bağlantısı sağlayan ve tip güvenli sorgular oluşturmamıza olanak tanıyan Supabase istemci nesnesi
- `params`: `FetchParams` — Sayfalama, filtreleme ve sıralama parametrelerini içeren nesne; `filters.level`, `filters.env`, `filters.from`, `filters.to`, `sort.key`, `sort.dir`, `query`, `page` ve `pageSize` alanlarını barındırır

**Dönüş**: `Promise<FetchResult<ErrorRow>>` — Asenkron olarak `rows` (ErrorRow dizisi) ve `totalMatched` (toplam eşleşen kayıt sayısı) alanlarını içeren sonuç nesnesi; sorgu hatası oluşursa promise reject edilir

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
- **params**: `(supabase: SupabaseClient<Database>, params: FetchParams)`
- **ic_degiskenler**:
  - `level` — `params.filters.level` dizisinin ilk elemanı; seviye filtresi (error/warn/info) olarak kullanılır
  - `env` — `params.filters.env` dizisinin ilk elemanı; ortam filtresi (production/preview/development) olarak kullanılır
  - `from` — `params.filters.from` dizisinin ilk elemanı; tarih aralığı başlangıcı filtresi
  - `to` — `params.filters.to` dizisinin ilk elemanı; tarih aralığı bitişi filtresi
  - `query` — Supabase sorgu zinciri başlatıcısı; `client_errors` tablosundan sütun seçimi ve sayfalama için kullanılır
  - `sortKey` — sıralama anahtarı; `params.sort?.key` varsa onu, yoksa `'at'` kullanılır
  - `offset` — sayfalama için hesaplanan satır başlangıç indeksi; `(params.page - 1) * params.pageSize` formülü ile hesaplanır
  - `like` — metin arama için `%params.query%` formatında SQL LIKE kalıbı; url ve message alanlarında arama yapılır
- **Dönüş**: `Promise<FetchResult<ErrorRow>>` — `{ rows: ErrorRow[], totalMatched: number }` yapısında hata kayıtları ve toplam eşleşme sayısı

---

### [N2_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody
- **params**: `(yok)`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; tüm UI metinlerinin çevrilmesi için kullanılır
  - `lang` — `useI18n()` hook'undan gelen dil kodu; tarih formatlamada (`formatDateTime`) kullanılır
  - `tenantId` — `useTenant()` hook'undan gelen `id` alanı; realtime kanal adı oluşturmada (`client-errors-${tenantId}`) kullanılır
  - `defaultFrom` — `useMemo` ile hesaplanan varsayılan başlangıç tarihi; son 7 günün ilk günü (bugün dahil), formatı `YYYY-MM-DD`
  - `defaultTo` — `useMemo` ile hesaplanan varsayılan bitiş tarihi; bugünün tarihi, formatı `YYYY-MM-DD`
  - `initialFilters` — `useMemo` ile oluşturulan başlangıç filtreleri Record'u; `{ env: ['production'], from: [defaultFrom], to: [defaultTo] }` değerlerini içerir
  - `table` — `useAdminTable<ErrorRow>` hook'unun dönüşü; tablonun tüm durumını (veri, filtre, sayfalama, sıralama) yönetir, `resource: 'errors'`, `fetcher: errorsFetcher` ile yapılandırılmıştır
  - `reloadRef` — `useRef(table.reload)` ile oluşturulan ref; realtime callback'inde güncel `table.reload` fonksiyonuna erişmek için kullanılır, her render'da `reloadRef.current = table.reload` ile güncellenir
  - `refetchTimer` — `useRef<ReturnType<typeof setTimeout> | null>(null)` ile oluşturulan ref; debounce timer referansını tutar, realtime değişikliklerde 400ms gecikme ile reload tetikler
  - `ch` — `useEffect` içinde oluşturulan Supabase realtime kanalı; `client-errors-${tenantId}` adıyla `client_errors` tablosundaki değişiklikleri dinler, `{ private: true }` yapılandırmasıyla
  - `setFilter` — `table.filtering.setFilter` destructure edilmiş fonksiyon; belirli bir filtre anahtarının değerini ayarlar (level, env, from, to)
  - `setQuery` — `table.filtering.query` setter fonksiyonu; arama sorgusunu ayarlar
  - `filters` — `table.filtering.filters` erişimi; mevcut filtre değerlerini tutan Record nesnesi
  - `levelVal` — `filters.level` dizisinin ilk elemanı veya boş string; seviye filtresi dropdown değerini bağlar
  - `envVal` — `filters.env` dizisinin ilk elemanı veya boş string; ortam filtresi select değerini bağlar
  - `fromVal` — `filters.from` dizisinin ilk elemanı veya boş string; başlangıç tarihi input değerini bağlar
  - `toVal` — `filters.to` dizisinin ilk elemanı veya boş string; bitiş tarihi input değerini bağlar
  - `resetFilters` — `useCallback` ile sarılmış fonksiyon; tüm filtreleri varsayılan değerlere sıfırlar: query boş, level boş, env production, from/to defaultFrom/defaultTo
  - `exportCsv` — `useCallback` ile sarılmış async fonksiyon; tablodaki filtrelenmiş tüm satırları CSV formatına dönüştürür ve tarayıcıda indirme tetikler
  - `envOptions` — `useMemo` ile hesaplanan ortam seçenekleri dizisi; `[{value:'production',label:'production'}, {value:'preview',label:'preview'}, {value:'development',label:'development'}, {value:'',label:'(Tümü)'}]` değerlerini içerir
  - `columns` — `useMemo<AdminColumn<ErrorRow>[]>` ile tanımlanan tablo kolon tanımları dizisi; `at` (tarih), `level` (seviye), `message` (mesaj), `url` (adres) kolonlarını tanımlar, her biri header, sortable ve cell render fonksiyonu içerir
- **Dönüş**: `React.FC` — `DataTableKit` bileşenini render eden JSX; `AdminToolbar` ile filtre/arama, `AdminEmptyState` ile boş durum, `renderExpandedRow` ile genişletilmiş satır detay görünümünü içerir

---

### [N3_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>useMemo[dateDefaults]
- **params**: `(yok)`
- **ic_degiskenler**:
  - `fmt` — Date nesnesini `YYYY-MM-DD` formatına dönüştüren iç fonksiyon; yıl, ay (2 haneli pad), gün (2 haneli pad) birleştirir
  - `now` — `new Date()` ile oluşturulan mevcut tarih nesnesi; defaultTo ve defaultFrom hesaplamasının referansıdır
- **Dönüş**: `{ defaultTo: string, defaultFrom: string }` — formatlanmış bugünün tarihi ve 6 gün önceki tarih

---

### [N4_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>useMemo[dateDefaults]>fmt
- **params**: `(d: Date)`
- **ic_degiskenler**:
  - `y` — `d.getFullYear()` ile alınan 4 haneli yıl
  - `m` — `d.getMonth() + 1` sonucu 2 haneli pad'lenmiş ay
  - `day` — `d.getDate()` sonucu 2 haneli pad'lenmiş gün
- **Dönüş**: `string` — `YYYY-MM-DD` formatında tarih dizgesi

---

### [N5_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>useEffect[realtime]
- **params**: `(yok)`
- **ic_degiskenler**:
  - `ch` — `supabaseBrowserClient.channel(...)` ile oluşturulan Supabase realtime kanalı; `${tenantId}` ile tenant-specific adlandırma, `{ private: true }` ile özel kanal, `'postgres_changes'` ile `client_errors` tablosundaki tüm olayları (`event: '*'`) dinler, değişiklik olduğunda debounce ile reload tetikler
- **Dönüş**: `() => void` — cleanup fonksiyonu; kanalı kaldırır (`removeChannel`) ve timer'ı temizler (`clearTimeout`)

---

### [N6_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>useEffect[realtime]>onPostgresChanges
- **params**: `(yok)`
- **ic_degiskenler**: (yok — doğrudan `refetchTimer.current` ve `reloadRef.current` erişimi)
- **Dönüş**: `void` — mevcut timer'ı temizler, 400ms sonra `reloadRef.current()` çağırır (debounced reload)

---

### [N7_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>useEffect[realtime]>cleanup
- **params**: `(yok)`
- **ic_degiskenler**: (yok — doğrudan `ch` ve `refetchTimer.current` erişimi)
- **Dönüş**: `void` — Supabase kanalını kaldırır, pending timer'ı temizler

---

### [N8_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>resetFilters
- **params**: `(yok)`
- **ic_degiskenler**: (yok — doğrudan `setQuery` ve `setFilter` çağrıları)
- **Dönüş**: `void` — query'yi boş string, level'ı boş dizi, env'yi `['production']`, from'u `[defaultFrom]`, to'yu `[defaultTo]` olarak ayarlar

---

### [N9_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>exportCsv
- **params**: `(yok)`
- **ic_degiskenler**:
  - `rows` — `table.fetchAllForExport()` promise'inden dönen tüm filtrelenmiş satırlar dizisi; CSV'ye dönüştürülecek ham veri
  - `header` — CSV başlık satırı; `t('admin.errors.export.headers.*')` çeviri fonksiyonlarıyla 8 sütun başlığının virgülle birleştirilmiş hali
  - `lines` — `rows.map(...)` ile her satırın CSV formatına dönüştürülmüş hali; her alan quoted ve escape edilmiş (çift tırnak `""` ile escape)
  - `csv` — BOM (`\ufeff`) karakteri ile başlayan tam CSV içeriği; header ve lines'ın `\n` ile birleştirilmiş hali
  - `blob` — `new Blob([csv], { type: 'text/csv;charset=utf-8;' })` ile oluşturulan CSV blob nesnesi
  - `url` — `URL.createObjectURL(blob)` ile blob için oluşturulan geçici URL
  - `a` — `document.createElement('a')` ile oluşturulan gizli DOM link elemanı; indirme tetiklemek için kullanılır
- **Dönüş**: `Promise<void>` — dosyayı tarayıcıda indirir, nesne URL'ini serbest bırakır

---

### [N10_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>exportCsv>rowMapper
- **params**: `(r: ErrorRow)`
- **ic_degiskenler**: (yok — doğrudan `r.id`, `r.at`, `r.level`, `r.message`, `r.url`, `r.user_agent`, `r.release`, `r.env` erişimi ile oluşturulmuş dizi)
- **Dönüş**: `string` — virgülle ayrılmış, tırnak işaretleriyle escape edilmiş CSV satırı

---

### [N11_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>useMemo[envOptions]
- **params**: `(yok)`
- **ic_degiskenler**: (yok — doğrudan dizi literal)
- **Dönüş**: `Array<{value: string, label: string}>` — 4 seçenek: `production`, `preview`, `development`, ve boş değer ile `(Tümü)` etiketi

---

### [N12_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>useMemo[columns]
- **params**: `(yok)`
- **ic_degiskenler**: (yok — doğrudan `AdminColumn<ErrorRow>[]` literal dizisi)
- **Dönüş**: `AdminColumn<ErrorRow>[]` — 4 kolon tanımı:
  - `at`: sıralanabilir, `formatDateTime(r.at, lang)` ile formatlanmış tarih hücresi
  - `level`: sıralanabilir, renk kodlu seviye rozeti hücresi (error=rose, warn=amber, info=sky)
  - `message`: sıralanamaz, düz metin hücresi
  - `url`: gizlenebilir (`hideable: true`), monospace font ile URL hücresi

---

### [N13_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>useMemo[columns]>cellAt
- **params**: `(r: ErrorRow)`
- **ic_degiskenler**: (yok)
- **Dönüş**: `JSX.Element` — `formatDateTime(r.at, lang)` ile formatlanmış tarih span'ı; slate-400 renk, xs font, bold, uppercase, tracking-widest stilleri

---

### [N14_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>useMemo[columns]>cellLevel
- **params**: `(r: ErrorRow)`
- **ic_degiskenler**: (yok — `r.level` değeri ile inline ternary)
- **Dönüş**: `JSX.Element` — seviyeye göre renk kodlu rozet span'ı; `error`→rose, `warn`→amber, diğer→sky renk paleti

---

### [N15_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>renderExpandedRow
- **params**: `(r: ErrorRow)`
- **ic_degiskenler**: (yok — `r.stack`, `r.user_agent`, `r.release`, `r.env` alanlarına doğrudan erişim)
- **Dönüş**: `JSX.Element` — 2 sütunlu grid layout:
  - Sol sütun: `r.stack` değerinin 8000 karakter ile kısaltılmış hali `<pre>` içinde, amber-300 renk, monospace
  - Sağ sütun: user_agent, release, env bilgileri `flex justify-between` layout ile, her biri ayrı `<div>` içinde

---

### [N16_NASIL] AST Pointer: src/views/admin/ErrorsTableBody.tsx::ErrorsTableBody>envOptions>mapRenderer
- **params**: `(o: {value: string, label: string})`
- **ic_degiskenler**: (yok)
- **Dönüş**: `JSX.Element` — `<option>` elemanı; `key` olarak `o.value || 'all'`, value olarak `o.value`, label olarak `o.label`, className olarak `bg-surface-deep`

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
- **Renkler:** `bg-amber-50`, `bg-rose-50`, `bg-sky-50`, `bg-surface-deep`, `bg-surface-deep/40`, `bg-surface-deep/80`, `border-b`, `border-white/5`, `text-amber-300/80`, `text-amber-400`, `text-amber-700`, `text-cyan-400`, `text-right`, `text-rose-700`, `text-sky-700`
- **Layout:** `custom-scrollbar`, `flex`, `gap-2`, `gap-6`, `grid`, `inline-flex`, `items-center`, `justify-between`, `max-h-80`, `md:grid-cols-2`, `overflow-auto`, `p-4`
- **Varyant/Responsive:** `:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `===`, `border`, `error`, `font-black`, `font-bold`, `font-medium`, `font-mono`, `leading-relaxed`, `mb-3`, `ml-4`, `pb-2`, `px-2`, `py-0.5`