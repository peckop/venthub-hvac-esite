---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminInventoryReportPage.tsx
skeleton_hash: 77ce07f52aadd6db
entity_hashes:
  func:AdminInventoryReportPage: 19552a84e92d3ebc
  func:InventoryReportContent: dbcbdf06c6840787
  overview: 13a120399f1afc85
  style_tokens: 3bf32080a7408e3f
generated_at: 2026-08-27T07:16:33Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetim panelinde envanter raporlama işlevini sunan bir React sayfasıdır. Sayfa, admin kullanıcıları için stok hareketlerini görselleştiren ve analiz eden interaktif bir arayüz sağlar; veri çekme, işleme ve sunum süreçlerini tek bir bileşen yapısında yönetir.

## Fonksiyon Grupları
### Sayfa Yapısı ve İçerik Rendering
Bu grup, admin rapor sayfasının ana iskeletini ve içindeki rapor içerik bölümünü oluşturan iki ilişkili bileşeni kapsar. Bileşenler, sayfanın genel düzenini ve rapor içeriğinin gösterim mantığını birlikte tanımlar.
- AdminInventoryReportPage, InventoryReportContent

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### InventoryReportContent
**Ne yapar**: Admin panelinde stok hareket raporu sayfasının ana içeriğini oluşturan React bileşenidir. Stok giriş-çıkış hareketlerini listeler, özet istatistikler (toplam giriş, çıkış, net değişim) gösterir, neden bazlı pasta grafik, trend alan grafik ve en çok hareket gören ürünler çubuk grafik sunar. Ayrıca hareket verilerini CSV formatında dışa aktarma imkânı sağlar.

**Nasıl yapar**: Bileşen, `useI18n` ile uluslararasılaştırma, `useSupabaseClient` ile Supabase veritabanı bağlantısı, `useRouter` ve `usePathname` ile Next.js yönlendirme, `useSearchParams` ile URL sorgu parametrelerini okur. `useDragScroll` hook'u ile giriş ve çıkış tablolarında sürüklemeyle kaydırma desteği ekler. URL'den `q` (arama), `from` ve `to` (tarih aralığı) parametrelerini okuyarak başlangıç state'lerini belirler. Arama sorgusu 350 milisaniyelik debounce ile geciktirilir. State değişiklikleri URL'ye yansıtılır ve tarayıcı geri/ileri navigasyonu URL'den state'e senkronize edilir. `loadData` useCallback ile tanımlanır; `ensureSessionFresh` çağrısı ardından `getInventoryMovements` fonksiyonu ile Supabase'den hareket verilerini çeker. Hata durumunda `loadError` state'i true yapılır ve kullanıcıya hata mesajı gösterilir. Ham hareket verileri üzerinde filtreleme (ürün adı veya ürün kimliğine göre), istatistik hesaplama (toplam giriş/çıkış/net), neden bazlı gruplama, en çok çıkış yapan ürünler sıralaması ve tarih bazlı trend verisi üretimi yapılır. Grafikler için Recharts kütüphanesinden `AreaChart`, `PieChart`, `BarChart` ve `ResponsiveContainer` kullanılır. `exportCsv` fonksiyonu hareket verilerini UTF-8 BOM ekli CSV'ye dönüştürüp tarayıcı üzerinden indirir. Yükleniyor durumunda iskelet (skeleton) animasyonu, veri yoksa `AdminEmptyState` bileşeni gösterilir.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: Bilinmiyor — fonksiyon bir JSX yapısı döndürür (React bileşeni), ancak kaynak kodda açık bir dönüş tipi belirtilmemiştir.

### AdminInventoryReportPage
**Ne yapar**: Stok raporu sayfasının dış sarmalayıcı bileşenidir. `InventoryReportContent` bileşenini `React.Suspense` ile sararak yükleme durumunda bir fallback UI (iskelet animasyonu) gösterir.

**Nasıl yapar**:
- `React.Suspense` bileşeni ile sarılmış `InventoryReportContent` bileşenini render eder.
- `fallback` prop'u ile yüklenme sırasında gösterilecek JSX'ı tanımlar: sayfa yapısını koruyan skeleton kartlar ve animasyonlu placeholder elemanlar içerir.

**Parametreler**:
- Fonksiyon parametresi almaz.

**Dönüş**: JSX elementi döndürür. `Suspense` sayesinde `InventoryReportContent`'in yüklenmesi tamamlanana kadar fallback UI gösterir, tamamlandığında ise rapor içeriğini render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/DateRangePicker::DateRangePicker
- import: ../../hooks/useDragScroll::useDragScroll
- import: ../../lib/ensureSessionFresh::ensureSessionFresh
- import: @/i18n/I18nProvider::useI18n
- import: @/providers/SupabaseProvider::useSupabaseClient
- import: date-fns::eachDayOfInterval
- import: date-fns::endOfDay
- import: date-fns::format
- import: date-fns::startOfDay
- import: date-fns::subDays
- import: next/navigation::usePathname
- import: next/navigation::useRouter
- import: next/navigation::useSearchParams
- import: react-day-picker::DateRange
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(tarih aralığı oluşturma)
- **params**: yok
- **ic_degiskenler**:
  - `urlFrom` — dışarıdan gelen başlangıç tarihi string'i; varsa `new Date(urlFrom)` ile Date nesnesine dönüştürülür, yoksa bugünden 30 gün öncesi kullanılır
  - `urlTo` — dışarıdan gelen bitiş tarihi string'i; varsa `endOfDay(new Date(urlTo))` ile gün sonuna ayarlanır, yoksa bugünün gün sonu kullanılır
  - `from` — hesaplanan başlangıç Date nesnesi
  - `to` — hesaplanan bitiş Date nesnesi (gün sonuna ayarlı)
- **Dönüş**: `{ from: Date, to: Date }`

### [N2_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(stateRef güncelleme)
- **params**: yok
- **ic_degiskenler**:
  - `stateRef.current` — dışarıdan erişilen ref nesnesi; `searchQuery` ve `dateRange` değerleri bu ref'e kaydedilir
  - `searchQuery` — dışarıdan gelen arama sorgusu state'i
  - `dateRange` — dışarıdan gelen tarih aralığı state'i
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(debounce timeout)
- **params**: yok
- **ic_degiskenler**:
  - `t` — `setTimeout` ile oluşturulan 350ms gecikme zamanlayıcısının ID'si; cleanup fonksiyonunda `clearTimeout(t)` ile temizlenir
  - `searchQuery` — dışarıdan gelen arama sorgusu; `trim()` uygulanarak `setDebouncedQuery`'ye aktarılır
- **Dönüş**: cleanup fonksiyonu (`() => clearTimeout(t)`)

### [N4_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(debouncedQuery doğrudan güncelleme)
- **params**: yok
- **ic_degiskenler**:
  - `searchQuery` — dışarıdan gelen arama sorgusu; `trim()` uygulanarak `setDebouncedQuery`'ye aktarılır
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(URL parametrelerini güncelleme)
- **params**: yok
- **ic_degiskenler**:
  - `params` — `new URLSearchParams()` ile oluşturulan URL parametre nesnesi
  - `debouncedQuery` — dışarıdan gelen debounce edilmiş sorgu; varsa `params.set('q', debouncedQuery)` ile eklenir
  - `dateRange` — dışarıdan gelen tarih aralığı; `.from` varsa ISO string olarak `from` parametresine, `.to` varsa `to` parametresine eklenir
  - `currentQs` — mevcut URL query string'i (`searchParams?.toString() ?? ''`)
  - `nextQs` — yeni URL query string'i (`params.toString()`)
  - `router` — Next.js router nesnesi; `router.replace` ile URL güncellenir
  - `pathname` — mevcut sayfa yolu
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(URL'den state güncelleme)
- **params**: yok
- **ic_degiskenler**:
  - `q` — URL'den okunan `q` parametresi (`searchParams?.get('q') ?? ''`)
  - `fromStr` — URL'den okunan `from` parametresi string'i
  - `toStr` — URL'den okunan `to` parametresi string'i
  - `nextFrom` — `fromStr` varsa `new Date(fromStr)`, yoksa bugünden 30 gün öncesi
  - `nextTo` — `toStr` varsa `endOfDay(new Date(toStr))`, yoksa bugünün gün sonu
  - `currentFromTime` — `stateRef.current.dateRange?.from?.getTime()` ile elde edilen mevcut başlangıç zamanı
  - `currentToTime` — `stateRef.current.dateRange?.to?.getTime()` ile elde edilen mevcut bitiş zamanı
  - `nextFromTime` — `nextFrom?.getTime()` ile elde edilen yeni başlangıç zamanı
  - `nextToTime` — `nextTo?.getTime()` ile elde edilen yeni bitiş zamanı
  - `stateRef` — dışarıdan erişilen ref nesnesi; mevcut state karşılaştırması için kullanılır
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(async veri yükleme)
- **params**: yok
- **ic_degiskenler**:
  - `data` — `getInventoryMovements(supabase, { from, to })` çağrısından dönen stok hareket verisi
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `console.error` ile loglanır
  - `supabase` — dışarıdan gelen Supabase istemcisi
  - `dateRange` — dışarıdan gelen tarih aralığı; `.from` ve `.to` değerleri API çağrısına parametre olarak geçilir
- **Dönüş**: yok (async fonksiyon; yan etki olarak `setMovementsData`, `setLoadError`, `setLoading` çağrılır)

### [N8_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(loadData çağrısı)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (`void loadData()` ile çağrılır)

### [N9_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(istatistik hesaplama)
- **params**: yok
- **ic_degiskenler**:
  - `tIn` — toplam giriş miktarı (pozitif delta'ların toplamı)
  - `tOut` — toplam çıkış miktarı (negatif delta'ların mutlak değerlerinin toplamı)
  - `reasonMap` — hareket nedenlerine göre toplam miktar tutan sözlük; anahtarlar: `sale`, `return`, `restock`, `manual_in`, `manual_out`, `adjustment`
  - `productSales` — ürün adına göre satış çıkışlarını tutan sözlük; her giriş `{ name: string, out: number }` içerir
  - `trendMap` — tarih bazlı trend verisi tutan sözlük; her giriş `{ date: string, incoming: number, outgoing: number }` içerir
  - `term` — `searchQuery`'den türetilen küçük harf arama terimi
  - `filtered` — `term` varsa `movementsData`'nın ürün adı veya ürün ID'si üzerinden filtrelenmiş hali, yoksa tüm `movementsData`
  - `dateRange` — dışarıdan gelen tarih aralığı; `.from` ve `.to` ile `eachDayOfInterval` kullanılarak gün listesi oluşturulur
  - `days` — `eachDayOfInterval` ile oluşturulan tarih dizisi
  - `d` — `days.forEach` callback'indeki her bir tarih nesnesi
  - `k` — `format(d, 'yyyy-MM-dd')` ile oluşturulan tarih anahtarı
  - `m` — `filtered.forEach` callback'indeki her bir stok hareket satırı
  - `dateKey` — `format(new Date(m.created_at), 'yyyy-MM-dd')` ile oluşturulan tarih anahtarı
  - `deltaAbs` — `Math.abs(m.delta)` ile hesaplanan mutlak miktar
  - `pname` — ürün adı; `m.products?.name` varsa o, yoksa `m.product_id`
  - `rData` — pie chart için hazırlanan neden verisi dizisi; her eleman `{ name, value, color }` içerir; `value > 0` olanlar filtrelenir
  - `sortedProds` — `productSales` değerlerinin çıkış miktarına göre azalan sıralanmış, ilk 8'inin alınıp `{ name, amount }` formatına dönüştürülmüş hali; 15 karakterden uzun isimler `...` ile kısaltılır
  - `t` — dışarıdan gelen `useI18n` çeviri fonksiyonu
- **Dönüş**: yok (yan etki olarak `setStats`, `setReasonData`, `setTopProducts`, `setTrendData` çağrılır)

### [N10_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(trendMap forEach callback)
- **params**: `d` — `eachDayOfInterval` dizisindeki her bir tarih nesnesi
- **ic_degiskenler**:
  - `k` — `format(d, 'yyyy-MM-dd')` ile oluşturulan tarih anahtarı; `trendMap[k]` olarak kullanılır
- **Dönüş**: yok

### [N11_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(filtered.forEach callback)
- **params**: `m` — filtrelenmiş stok hareket satırı (`InventoryMovementRow`)
- **ic_degiskenler**:
  - `dateKey` — `format(new Date(m.created_at), 'yyyy-MM-dd')` ile oluşturulan tarih anahtarı
  - `deltaAbs` — `Math.abs(m.delta)` ile hesaplanan mutlak miktar
  - `pname` — ürün adı; `m.products?.name` varsa o, yoksa `m.product_id`
  - `tIn` — dışarıdan erişilen toplam giriş miktarı; pozitif delta'larda artırılır
  - `tOut` — dışarıdan erişilen toplam çıkış miktarı; negatif delta'larda artırılır
  - `trendMap` — dışarıdan erişilen trend sözlüğü; tarih anahtarına göre `incoming` veya `outgoing` artırılır
  - `reasonMap` — dışarıdan erişilen neden sözlüğü; `m.reason` anahtarına göre artırılır
  - `productSales` — dışarıdan erişilen ürün satış sözlüğü; `sale` veya `manual_out` nedenli negatif delta'larda güncellenir
- **Dönüş**: yok

### [N12_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(sortedProds map callback)
- **params**: `p` — `productSales` sözlüğündeki her bir ürün nesnesi (`{ name: string, out: number }`)
- **ic_degiskenler**: yok
- **Dönüş**: `{ name: string, amount: number }` — `name` 15 karakterden uzunsa `...` ile kısaltılır, `amount` çıkış miktarıdır

### [N13_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(CSV dışa aktarma)
- **params**: yok
- **ic_degiskenler**:
  - `header` — CSV başlık satırı dizisi; `t()` ile çevrilmiş sütun adları: `id`, `date`, `product`, `amount`, `reason`, `productId`
  - `csvRows` — `movementsData.map` ile oluşturulan CSV satırları dizisi; her satır virgülle ayrılmış ve çift tırnakla escape edilmiş değerlerden oluşur
  - `csvString` — BOM karakteri (`\ufeff`) ile başlayan, başlık ve satırları `\n` ile birleştiren tam CSV metni
  - `blob` — `csvString`'den oluşturulan `Blob` nesnesi (`type: 'text/csv;charset=utf-8;'`)
  - `url` — `URL.createObjectURL(blob)` ile oluşturulan geçici URL
  - `a` — `document.createElement('a')` ile oluşturulan indirme bağlantısı elementi; `download` özelliği `stok-raporu-{tarih}.csv` olarak ayarlanır
  - `movementsData` — dışarıdan gelen stok hareket verisi dizisi
  - `t` — dışarıdan gelen çeviri fonksiyonu
- **Dönüş**: yok (yan etki olarak dosya indirme tetiklenir)

### [N14_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(csvRows map callback)
- **params**: `m` — stok hareket satırı (`InventoryMovementRow`)
- **ic_degiskenler**: yok
- **Dönüş**: string — virgülle ayrılmış ve çift tırnakla escape edilmiş CSV satırı; alanlar: `m.id`, `m.created_at` (formatlanmış), ürün adı veya `m.product_id`, `m.delta`, `m.reason`, `m.product_id`

### [N15_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(filtrelenmiş movementsData)
- **params**: yok
- **ic_degiskenler**:
  - `term` — `searchQuery.toLowerCase().trim()` ile oluşturulan arama terimi
  - `movementsData` — dışarıdan gelen stok hareket verisi dizisi; `term` varsa ürün adı (`m.products?.name`) veya ürün ID'si (`m.product_id`) üzerinden filtrelenir
- **Dönüş**: `InventoryMovementRow[]` — filtrelenmiş stok hareket dizisi

### [N16_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(incoming tablo satırı render)
- **params**: `m` — stok hareket satırı (`InventoryMovementRow`)
- **ic_degiskenler**: yok
- **Dönüş**: JSX — giriş hareketi tablo satırı; tarih (`dd.MM HH:mm`), ürün adı ve pozitif delta değeri gösterilir

### [N17_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::(outgoing tablo satırı render)
- **params**: `m` — stok hareket satırı (`InventoryMovementRow`)
- **ic_degiskenler**: yok
- **Dönüş**: JSX — çıkış hareketi tablo satırı; tarih (`dd.MM HH:mm`), ürün adı ve negatif delta değeri gösterilir

### [N18_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::AdminInventoryReportPage
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: JSX — `Suspense` ile sarmalanmış `InventoryReportContent` bileşeni; fallback olarak skeleton yükleme ekranı gösterilir

---

## NODE ID STANDARD

  file: src\views\admin\AdminInventoryReportPage.tsx
  function: src\views\admin\AdminInventoryReportPage.tsx::InventoryReportContent
  function: src\views\admin\AdminInventoryReportPage.tsx::AdminInventoryReportPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminInventoryReportPage
  export: InventoryReportContent

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-danger-weak`, `bg-admin-success-weak`, `bg-admin-surface-2`, `border-admin-border`, `border-admin-danger/30`, `border-admin-success/30`, `border-b`, `border-l-4`, `border-l-emerald-500`, `border-l-indigo-500`, `border-l-rose-500`, `hover:bg-admin-danger-weak`, `hover:bg-admin-success-weak`, `text-3xl`, `text-admin-accent`
- **Layout:** `absolute`, `flex`, `flex-col`, `gap-2`, `gap-4`, `gap-6`, `grid`, `grid-cols-1`, `h-4`, `h-5`, `h-72`, `h-8`, `h-80`, `h-full`, `items-center`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `!px-4`, `!py-2.5`, `!rounded-admin-lg`, `!rounded-admin-md`, `${adminButtonSecondaryClass`, `${adminCardClass`, `${adminTableCellClass`, `${adminTableCellTruncate150Class`, `${adminTableScrollAreaClass`, `${stats.net`, `0`, `:`, `<`, `>`, `animate-in`