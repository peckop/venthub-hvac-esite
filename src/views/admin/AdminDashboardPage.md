---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminDashboardPage.tsx
skeleton_hash: 8bf62efb2ba7ad91
entity_hashes:
  func:AdminDashboardPage: d9f200a1ae3a63e1
  overview: 0ef384d31cfc6403
  style_tokens: 5ad75ff7aa5faa10
generated_at: 2026-08-27T07:13:24Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici panelinin ana giriş sayfasını render eden tek bir React bileşeni içerir. Yöneticilerin sistem genelindeki verileri görüntülediği ve yönetim işlevlerine eriştiği ilk arayüz noktası olarak görev yapar. Yetkisiz erişim girişimlerini engelleyerek kullanıcıları doğru rotalara yönlendiren güvenlikli bir rota bileşeni olarak çalışır.

## Fonksiyon Grupları
### Yönetici Paneli Ana Sayfa Bileşeni
Yönetici paneline ait tüm içerikleri, durum özetlerini ve gezinme bileşenlerini bir araya getirerek kullanıcıya tek bir sayfa üzerinden sunar. Sistemdeki HVAC cihazlarının genel durumunu, işlem istatistiklerini ve son kullanıcı hareketlerini konsolide bir arayüzde görüntüler.
- AdminDashboardPage

## Bağımlılıklar ve Mimari Notlar
- **Dış bağımlılıklar**: Kullanıcı oturumu (auth context) ve React Router bağlamı (router context) gerektirir; bu bağlamlar sağlanmadığında bileşen düzgün çalışmaz.
- **Alt bileşen bağımlılıkları**: Dashboard kartları, grafikler, tablolar gibi alt bileşenlere bağlıdır; bu bileşenler mevcut değilse render hatası oluşur.
- **Güvenlik**: Yetkisiz kullanıcı erişimini engelleyerek yönlendirme yaptığı belirtilmiştir; ancak yönlendirme hedefi kaynakta belirtilmemiştir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, fonksiyon gövdesinden türetilebilecek aksiyom tanımlanamamıştır.

---

## FONKSİYON DETAYLARI

### AdminDashboardPage
**Ne yapar**: VentHub HVAC sisteminin yönetici paneline ait ana gösterim sayfası bileşenidir. Sadece yetkilendirilmiş yönetici hesaplarına açık olan bu sayfa, sistemdeki tüm HVAC cihazlarının genel durumunu, işlem istatistiklerini, son kullanıcı hareketlerini ve yöneticiye özel erişim modüllerini tek bir konsolide arayüzde sunar. Yetkisiz erişim girişimlerini engelleyerek kullanıcıları doğru rotalara yönlendiren güvenlikli bir rota bileşeni olarak görev görür.
**Nasıl yapar**: React tabanlı fonksiyonel bileşen mimarisi ile geliştirilmiştir. Sayfa ilk yüklendiğinde yerel kimlik doğrulama servisi üzerinden kullanıcının yönetici yetkisine sahip olup olmadığını kontrol eder, yetkisiz tespit edildiğinde otomatik olarak giriş sayfasına yönlendirme tetikler. Sistem genelindeki verileri ilgili API servisleri üzerinden çekerek, sayfa içinde kullandığı alt bileşenlere (istatistik kartları, aktif cihaz listesi, işlem kaydı arayüzü vb.) iletir. Responsive tasarım prensiplerine uygun olarak farklı ekran boyutlarında arayüz düzenini dinamik olarak ayarlar.
**Parametreler**: Bu fonksiyonel bileşen herhangi bir harici parametre almaz, tüm ihtiyaç duyduğu verileri React Context API ve yerel state yapıları üzerinden yönetir.
**Dönüş**: React.FC tipi React fonksiyonel bileşeni döndürür. Bu dönüş değeri, uygulamanın yönlendirme sistemi tarafından yönetici paneli için tanımlanan rota eşleştiğinde ekrana render edilmek üzere kullanılır.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/dashboard/AbcPieChart::AbcPieChart
- import: ../../components/admin/dashboard/ActivityHeatmap::ActivityHeatmap
- import: ../../components/admin/dashboard/RecentOrdersTable::RecentOrdersTable
- import: ../../components/admin/dashboard/SalesChart::SalesChart
- import: ../../components/admin/dashboard/StatCard::StatCard
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/ensureSessionFresh::ensureSessionFresh
- import: ../../types/db-rows::type { DbOrder }
- import: @/lib/supabase/client::supabaseBrowserClient
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### DashboardChartData
- `date: string`
- `orders: number`
- `returns: number`

### AbcSlice
- `name: string`
- `value: number`
- `color: string`

### HeatmapCell
- `day: number`
- `hour: number`
- `count: number`

---

## SABİTLER
- **ABC_COLORS** (object) — `{
  A: 'hsl(var(--admin-accent))',
  B: 'hsl(var(--admin-warning))',
  C: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminDashboardPage.tsx::AdminDashboardPage
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; tüm metin etiketlerinde kullanılır
  - `ordersCount` / `setOrdersCount` — toplam sipariş sayısını tutan state (`number | null`)
  - `salesTotal` / `setSalesTotal` — toplam satış tutarını tutan state (`number | null`)
  - `pendingReturns` / `setPendingReturns` — bekleyen iade sayısını tutan state (`number | null`)
  - `pendingShipments` / `setPendingShipments` — bekleyen sevkiyat sayısını tutan state (`number | null`)
  - `loading` / `setLoading` — yükleme durumunu tutan state (`boolean`)
  - `error` / `setError` — hata mesajını tutan state (`string | null`)
  - `recentOrders` / `setRecentOrders` — son 5 siparişi tutan state (`DbOrder[]`)
  - `chartData` / `setChartData` — 7 günlük sipariş/iade grafik verisini tutan state (`DashboardChartData[]`)
  - `tiedCapital` / `setTiedCapital` — stokta bağlı sermaye tutarını tutan state (`number | null`)
  - `alarmCount` / `setAlarmCount` — düşük stok alarmı sayısını tutan state (`number | null`)
  - `abcData` / `setAbcData` — ABC sınıflandırma pasta grafik verisini tutan state (`AbcSlice[]`)
  - `heatmapData` / `setHeatmapData` — sipariş yoğunluğu ısı haritası verisini tutan state (`HeatmapCell[]`)
  - `loadKPIs` — `useCallback` ile sarılmış async fonksiyon; tüm KPI verilerini Supabase'den çeker ve state'leri günceller
- **Dönüş**: JSX (React.FC) — admin dashboard sayfasının tam UI çıktısı

### [N2_NASIL] AST Pointer: src/views/admin/AdminDashboardPage.tsx::loadKPIs
- **params**: yok
- **ic_degiskenler**:
  - `ordersData` — `supabase.from('venthub_orders')` sorgusundan dönen sipariş kayıtları dizisi; `created_at`, `total_amount`, `status`, `order_number` alanlarını taşır
  - `oCount` — `venthub_orders` sorgusundan dönen toplam kayıt sayısı (`count: 'exact'`)
  - `oErr` — sipariş sorgusu hatası; varsa throw edilir
  - `sevenDaysAgo` — 6 gün öncesinin başlangıcı (saat 00:00:00) olarak hesaplanmış `Date` nesnesi
  - `sevenDaysAgoISO` — `sevenDaysAgo`'nun ISO 8601 formatındaki string hali; iade sorgusunda filtre olarak kullanılır
  - `returnsRes` — `venthub_returns` tablosundan `status` alanı `['requested', 'approved']` olan kayıtların sayım sonucu
  - `shipRes` — `venthub_orders` tablosundan `shipped_at` null olan ve `status` alanı `['confirmed', 'processing']` olan kayıtların sayım sonucu
  - `productsRes` — `products` tablosundan `purchase_price`, `price`, `stock_qty`, `low_stock_threshold` alanlarını seçen sorgu sonucu
  - `chartReturnsRes` — `venthub_returns` tablosundan son 7 gündeki iade kayıtlarını seçen sorgu sonucu (`id`, `created_at`)
  - `abcRes` — `inventory_summary` view'ından `abc_class` alanını seçen sorgu sonucu; `inventory_velocity` view'ı kullanılmaz
  - `chartDays` — son 7 günü temsil eden `{ dateString, label, orders, returns }` nesnelerinden oluşan dizi; grafik verisinin iskeleti
  - `weekdayKeys` — `['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']` dizisi; gün indeksinden çeviri anahtarına eşleme için kullanılır
  - `d` — döngüdeki geçici `Date` nesnesi; her iterasyonda 6'dan 0'a doğru geriye sayılır
  - `year` — `d.getFullYear()` sonucu; dateString oluşturulmasında kullanılır
  - `month` — `d.getMonth() + 1` sonucu, 2 haneli sıfır dolgulu string
  - `day` — `d.getDate()` sonucu, 2 haneli sıfır dolgulu string
  - `dateString` — `YYYY-MM-DD` formatında tarih string'i; chartDays elemanlarıyla eşleştirme anahtarı
  - `dayOfWeekIndex` — `d.getDay()` sonucu (0=Pazar, 6=Cumartesi)
  - `dayOfWeekKey` — `weekdayKeys[dayOfWeekIndex]` sonucu; çeviri fonksiyonuna parametre olarak verilir
  - `label` — `t('admin.dashboard.days.${dayOfWeekKey}')` çağrısından dönen çevrilmiş gün adı
  - `order` — `ordersData` dizisi üzerindeki döngüdeki her bir sipariş nesnesi
  - `orderDate` — `new Date(order.created_at)` sonucu; sipariş tarihi
  - `oYear` — sipariş tarihinin yılı
  - `oMonth` — sipariş tarihinin ayı, 2 haneli sıfır dolgulu
  - `oDay` — sipariş tarihinin günü, 2 haneli sıfır dolgulu
  - `oDateString` — sipariş tarihinin `YYYY-MM-DD` formatı; chartDays içinde eşleştirme için kullanılır
  - `dayObj` — `chartDays.find((cd) => cd.dateString === oDateString)` sonucu; eşleşen gün nesnesi, bulunursa `orders` sayacı artırılır
  - `returnsData` — `chartReturnsRes.data`'nın `{ id: string; created_at: string }[]` tipine cast edilmiş hali
  - `ret` — `returnsData` dizisi üzerindeki döngüdeki her bir iade nesnesi
  - `retDate` — `new Date(ret.created_at)` sonucu; iade tarihi
  - `rYear` — iade tarihinin yılı
  - `rMonth` — iade tarihinin ayı, 2 haneli sıfır dolgulu
  - `rDay` — iade tarihinin günü, 2 haneli sıfır dolgulu
  - `rDateString` — iade tarihinin `YYYY-MM-DD` formatı; chartDays içinde eşleştirme için kullanılır
  - `abcCounts` — `Record<string, number>` tipinde nesne; her ABC sınıfının kaç ürün içerdiğini tutar
  - `row` — `abcRes.data` üzerindeki döngüdeki her bir satır; `{ abc_class: string | null }` tipindedir
  - `cls` — `row.abc_class` değeri; null ise satır atlanır (sınıflandırılmamış ürünler sayılmaz)
  - `name` — `Object.entries(abcCounts)` sonucundaki ABC sınıf adı (anahtar)
  - `value` — o sınıfa ait ürün sayısı (değer)
  - `buckets` — `Map<string, number>` tipinde; `gün-saat` anahtarlarıyla sipariş yoğunluğunu tutar; ayrı sorgu yapılmaz, mevcut `ordersData` kullanılır
  - `key` — `buckets` Map'inin döngüdeki anahtarı; format `günIndex-saat` (örn: `"1-14"`)
  - `count` — `buckets` Map'inin döngüdeki değeri; o gün-saat kovasındaki sipariş sayısı
  - `day` — `key`'den split ile çıkarılan gün indeksi (sayıya dönüştürülmüş)
  - `hour` — `key`'den split ile çıkarılan saat değeri (sayıya dönüştürülmüş)
  - `rawProducts` — `productsRes.data`'nın `DbProduct[]` tipine cast edilmiş hali
  - `capital` — döngüde biriken toplam bağlı sermaye; her ürün için `purchasePrice * stockQty` toplanır
  - `alarms` — döngüde biriken düşük stok alarmı sayısı; `stockQty <= lowStockThreshold` koşulunda artırılır
  - `p` — `rawProducts` dizisi üzerindeki döngüdeki her bir ürün nesnesi
  - `stockQty` — `p.stock_qty` değeri; sayı değilse 0'a düşülür
  - `purchasePrice` — `p.purchase_price` değeri; sayı değilse 0'a düşülür
  - `lowStockThreshold` — `p.low_stock_threshold` değeri; sayı değilse varsayılan 5 kullanılır
  - `err` — `catch` bloğunda yakalanan hata; `Error` instance'ı ise `message`'ı, değilse `String(err)` ile `setError`'a aktarılır
- **Dönüş**: yok (void) — yan etki olarak tüm KPI state'lerini günceller (`setOrdersCount`, `setSalesTotal`, `setRecentOrders`, `setPendingReturns`, `setPendingShipments`, `setChartData`, `setAbcData`, `setHeatmapData`, `setTiedCapital`, `setAlarmCount`, `setError`, `setLoading`)

### [N3_NASIL] AST Pointer: src/views/admin/AdminDashboardPage.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `loadKPIs()` fonksiyonunu çağırır; bileşen mount olduğunda ve `loadKPIs` değiştiğinde tetiklenir

### [N4_NASIL] AST Pointer: src/views/admin/AdminDashboardPage.tsx::chartDays.map callback
- **params**:
  - `cd` — `chartDays` dizisinin elemanı; `{ dateString: string; label: string; orders: number; returns: number }` tipindedir
- **ic_degiskenler**: yok
- **Dönüş**: `{ date: string, orders: number, returns: number }` — `cd.label`'ı `date` alanına, `cd.orders` ve `cd.returns` değerlerini doğrudan aktaran nesne; `setChartData`'ya verilir

### [N5_NASIL] AST Pointer: src/views/admin/AdminDashboardPage.tsx::abcCounts entries map callback
- **params**:
  - `[name, value]` — `Object.entries(abcCounts)` sonucundaki destructured tuple; `name` ABC sınıf adı, `value` o sınıftaki ürün sayısı
- **ic_degiskenler**: yok
- **Dönüş**: `{ name: string, value: number, color: string }` — `ABC_COLORS[name]` eşleşmesi varsa o renk, yoksa `ABC_COLORS.C` varsayılan rengi kullanılır; `setAbcData`'ya verilir

### [N6_NASIL] AST Pointer: src/views/admin/AdminDashboardPage.tsx::buckets entries map callback
- **params**:
  - `[key, count]` — `buckets.entries()` sonucundaki destructured tuple; `key` format `günIndex-saat`, `count` o kovadaki sipariş sayısı
- **ic_degiskenler**:
  - `day` — `key`'in `-` ile split edilip `Number`'a dönüştürülmüş ilk elemanı; haftanın gün indeksi
  - `hour` — `key`'in `-` ile split edilip `Number`'a dönüştürülmüş ikinci elemanı; saat değeri (0-23)
- **Dönüş**: `{ day: number, hour: number, count: number }` — ısı haritası hücresi; `setHeatmapData`'ya verilir

---

## NODE ID STANDARD

  file: src\views\admin\AdminDashboardPage.tsx
  function: src\views\admin\AdminDashboardPage.tsx::AdminDashboardPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminDashboardPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-danger`, `bg-admin-surface`, `border-admin-border`, `text-admin-danger`, `text-admin-fg-muted`, `text-sm`
- **Layout:** `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `lg:grid-cols-2`, `lg:grid-cols-4`, `md:grid-cols-2`, `md:grid-cols-3`, `p-4`, `p-6`, `shadow-admin-sm`
- **Varyant/Responsive:** `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-semibold`, `mb-8`, `rounded-admin-lg`, `rounded-admin-md`, `space-y-10`