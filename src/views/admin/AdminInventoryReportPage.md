---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\vh-invreport\src\views\admin\AdminInventoryReportPage.tsx
skeleton_hash: 3bdc447fefc2db5d
entity_hashes:
  func:AdminInventoryReportPage: a23c742740baa316
  func:InventoryReportContent: 4005cf17ab3151b4
  overview: 13a120399f1afc85
  style_tokens: 9b13f3522b9ce8c7
generated_at: 2026-06-18T16:22:15Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici arayüzünde envanter verilerini raporlayan bir React sayfasıdır. Ana bileşen olarak sayfa yapısını ve erişim kontrolünü yöneten bir üst bileşen ile içindeki rapor detaylarını, grafikleri ve verileri gösteren bir alt bileşenden oluşur. Modül, yetkili admin kullanıcıların erişimine açıktır ve envanter yönetim sisteminin görsel raporlama arayüzünü sunar; fonksiyon gövdesi paylaşılmadığı için iç bağımlılıklar hakkında kesin bilgi olmamakla birlikte, React bileşen modeli gereği JSX döndürmeli ve geçersiz durumlarda hata yönetimi sağlanmalıdır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Bu grup, sayfa yapısını, erişim kontrolünü ve alt bileşenlerin yerleşimini yöneten üst düzey React

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### InventoryReportContent
**Ne yapar**: Stok hareketleri raporunu gösteren, filtreleyen ve görselleştiren ana React bileşenidir. Arama filtresi, tarih aralığı seçimi, istatistik kartları, grafikler ve detaylı hareket tabloları sunar.

**Nasıl yapar**: Bileşen, Next.js'in `useRouter` ve `useSearchParams` hook'larını kullanarak URL parametrelerini okur/yazar. `useSupabaseClient` ile Supabase bağlantısı alıp `getInventoryMovements` fonksiyonu ile veri çeker. `useDragScroll` hook'u tablolar için yatay sürükleme sağlar. `React.useEffect` ile debounce arama, URL senkronizasyonu ve veri yükleme işlemleri yönetilir. `React.useMemo` ile filtrelenmiş veriler hesaplanır. `recharts` kütüphanesi kullanılarak alan, pasta ve çubuk grafikler oluşturulur.

**Parametreler**:
- Bu fonksiyon parametre almaz (React bileşeni olarak).

**Dönüş**: JSX element döndürür. Yüklenme durumunda skeleton, yüklenme sonrası rapor içeriğini (kartlar, grafikler, tablolar) render eder.

### AdminInventoryReportPage
**Ne yapar**: `InventoryReportContent` bileşenini `React.Suspense` ile sarmalayan üst seviye sayfa bileşenidir.

**Nasıl yapar**: `React.Suspense` bileşeni, `InventoryReportContent` yüklenene kadar `fallback` prop'unda verilen skeleton yükleme göstergesini render eder. Bu, Next.js app router'daki streaming/server component özelliklerini destekler.

**Parametreler**:
- Bu fonksiyon parametre almaz (React bileşeni olarak).

**Dönüş**: JSX element döndürür. `Suspense` ile sarılmış `InventoryReportContent` bileşenini render eder.

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

### [N1_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::InventoryReportContent
- **params**: ()
- **ic_degiskenler**:
  - `urlFrom` — URL parametresinden alınan başlangıç tarihi (string), Date objesine dönüştürülür
  - `urlTo` — URL parametresinden alınan bitiş tarihi (string), Date objesine dönüştürülür
  - `from` — Hesaplanan başlangıç tarihi (Date), varsayılan olarak 30 gün öncesi
  - `to` — Hesaplanan bitiş tarihi (Date), gün sonu ile
  - `t` — setTimeout ile oluşturulan timer ID'si (debounce için)
  - `debouncedQuery` — Gecikmeli arama sorgusu (state)
  - `searchQuery` — Anlık arama sorgusu (state)
  - `params` — URLSearchParams nesnesi, arama parametrelerini tutar
  - `currentQs` — Mevcut URL query string'i
  - `nextQs` — Yeni URL query string'i
  - `q` — URL'den alınan arama parametresi
  - `fromStr` — URL'den alınan başlangıç tarihi string'i
  - `toStr` — URL'den alınan bitiş tarihi string'i
  - `nextFrom` — URL'den hesaplanan başlangıç tarihi
  - `nextTo` — URL'den hesaplanan bitiş tarihi
  - `currentFromTime` — Mevcut başlangıç tarihi timestamp'i (sayısal)
  - `currentToTime` — Mevcut bitiş tarihi timestamp'i (sayısal)
  - `nextFromTime` — Yeni başlangıç tarihi timestamp'i (sayısal)
  - `nextToTime` — Yeni bitiş tarihi timestamp'i (sayısal)
  - `data` — API'den gelen inventar hareket verisi (InventoryMovementRow[])
  - `movementsData` — Inventar hareketleri veri dizisi (state)
  - `loading` — Yükleme durumu bayrağı (state, boolean)
  - `tIn` — Toplam gelen ürün miktarı (sayısal)
  - `tOut` — Toplam giden ürün miktarı (sayısal)
  - `reasonMap` — Hareket sebeplerine göre miktarları tutan obje (Record<string, number>)
  - `productSales` — Ürün bazlı satış verilerini tutan obje (Record<string, {name: string, out: number}>)
  - `trendMap` — Günlük trend verilerini tutan obje (Record<string, {date: string, incoming: number, outgoing: number}>)
  - `term` — Küçük harfe çevrilmiş arama terimi
  - `filtered` — Arama terimine göre filtrelenmiş hareket verileri
  - `days` — Seçilen tarih aralığındaki tüm günlerin dizisi
  - `dateKey` — Tarihin 'yyyy-MM-dd' formatında string karşılığı
  - `deltaAbs` — Miktarın mutlak değeri
  - `pname` — Ürün adı
  - `rData` — Grafik için sebep verileri dizisi
  - `sortedProds` — Sıralanmış ve kısaltılmış ürün adlarıyla top ürün listesi
  - `csvRows` — CSV satırları dizisi
  - `csvString` — Oluşturulan CSV metni
  - `blob` — CSV dosyası için Blob nesnesi
  - `url` — Blob için oluşturulmuş URL
  - `a` — Dosya indirme linki için oluşturulan HTMLAnchorElement
- **Dönüş**: React JSX (InventoryReportContent bileşeni)

### [N2_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::AdminInventoryReportPage
- **params**: ()
- **ic_degiskenler**: (yok — sadece JSX döndürür, iç değişken yok)
- **Dönüş**: React JSX (Suspense ile sarılmış InventoryReportContent bileşeni)

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
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-emerald-400/10`, `bg-emerald-500/5`, `bg-rose-400/10`, `bg-rose-500/5`, `bg-slate-100`, `bg-slate-200`, `bg-slate-50`, `border-b`, `border-emerald-100/10`, `border-emerald-400/20`, `border-emerald-500/10`, `border-l-4`, `border-l-emerald-500`, `border-l-indigo-500`, `border-l-rose-500`
- **Layout:** `absolute`, `flex`, `flex-col`, `gap-2`, `gap-4`, `gap-6`, `grid`, `grid-cols-1`, `h-4`, `h-5`, `h-72`, `h-8`, `h-80`, `h-full`, `items-center`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `!px-4`, `!py-2.5`, `!rounded-2xl`, `!rounded-3xl`, `!rounded-xl`, `${adminButtonSecondaryClass`, `${adminCardClass`, `${adminTableScrollAreaClass`, `${stats.net`, `0`, `:`, `<`, `>`, `animate-in`, `animate-pulse`