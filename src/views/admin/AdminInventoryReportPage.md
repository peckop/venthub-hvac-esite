---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx
skeleton_hash: 5ac25ae722ac4343
entity_hashes:
  func:AdminInventoryReportPage: 89d4145e27225208
  func:InventoryReportContent: aabca4efc3fe9cfa
  overview: 13a120399f1afc85
  style_tokens: 4816686e7a19ba05
generated_at: 2026-06-19T20:50:27Z
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
**Ne yapar**: Stok hareketleri raporunu gösteren ana bileşendir. Tarih aralığına ve arama sorgusuna göre filtrelenen stok giriş/çıkış verilerini, istatistikleri ve grafikleri (eğilim, neden dağılımı, en çok hareket gören ürünler) kullanıcıya sunar.

**Nasıl yapar**: 
- `useI18n` hook'u ile çoklu dil desteği, `useSupabaseClient` ile veritabanı bağlantısı sağlar.
- URL search parametrelerinden (`q`, `from`, `to`) başlangıç değerlerini okur ve state ile senkronize eder (Back/Forward navigasyonu destekler).
- `useDragScroll` hook'ları ile tabloların sürüklemeyle kaydırılmasını sağlar.
- `React.useState` ile state yönetimi, `React.useEffect` ile URL senkronizasyonu, debounce ve veri yükleme işlemlerini yönetir.
- `loadData` fonksiyonu `getInventoryMovements` çağrısı ile Supabase'den stok hareketlerini çeker.
- `React.useMemo` ile arama filtresi uygulanmış hareketleri hesaplar, bu filtreleri giriş/çıkış olarak ikiye böler.
- `exportCsv` fonksiyonu ile hareket verilerini CSV formatına dönüştürerek indirme işlemini başlatır.
- `React.useEffect` içinde `movementsData`'yı işleyerek istatistikler (toplam giriş, çıkış, net), neden dağılımı, en çok satan ürünler ve günlük eğilim verilerini hesaplar.
- Recharts kütüphanesi ile `AreaChart`, `PieChart`, `BarChart` kullanarak interaktif grafikler oluşturur.

**Parametreler**:
- Fonksiyon parametresi almaz.

**Dönüş**: JSX elementi döndürür (React component). Yüklenme durumunda skeleton animasyonlu bir loading UI, veri yüklendiğinde tam rapor sayfasını gösterir.

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

### [N1_NASIL] AST Pointer: AdminInventoryReportPage.tsx::InventoryReportContent
- **params**: ()
- **ic_degiskenler**:
  - `searchParams` — useSearchParams hook'undan gelen URLSearchParams nesnesi, URL'deki arama parametrelerini okumak için kullanılır.
  - `router` — useRouter hook'undan gelen Next.js yönlendirici, URL'yi programatik olarak değiştirmek (router.replace) için kullanılır.
  - `pathname` — usePathname hook'undan gelen mevcut sayfa dosya yolu, URL oluştururken temel yol olarak kullanılır.
  - `supabase` — useSupabaseClient hook'undan gelen Supabase istemcisi, veritabanı işlemleri (envanter hareketlerini çekmek) için kullanılır.
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, UI metinlerini uluslararasılaştırmak için kullanılır.
  - `searchQuery` — React state, kullanıcının arama kutusuna girdiği metni tutar.
  - `setSearchQuery` — searchQuery state'ini güncelleyen fonksiyon.
  - `debouncedQuery` — React state, arama sorgusunun debounce edilmiş (geciktirilmiş) versiyonunu tutar, gereksiz API çağrılarını önler.
  - `setDebouncedQuery` — debouncedQuery state'ini güncelleyen fonksiyon.
  - `dateRange` — React state, seçilen başlangıç ve bitiş tarihlerini (DateRange tipinde) tutar.
  - `setDateRange` — dateRange state'ini güncelleyen fonksiyon.
  - `movementsData` — React state, API'den çekilen envanter hareketleri verisini (InventoryMovementRow[]) tutar.
  - `setMovementsData` — movementsData state'ini güncelleyen fonksiyon.
  - `loading` — React state, veri yüklenirken true olan yükleme durumunu tutar.
  - `setLoading` — loading state'ini güncelleyen fonksiyon.
  - `stats` — React state, hesaplanan toplam giriş (totalIn), çıkış (totalOut) ve net (net) istatistiklerini tutar.
  - `setStats` — stats state'ini güncelleyen fonksiyon.
  - `reasonData` — React state, hareket nedenlerine (sale, return, restock, vb.) göre gruplandırılmış ve grafik için hazırlanmış veriyi tutar.
  - `setReasonData` — reasonData state'ini güncelleyen fonksiyon.

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
- **Yardımcı Sınıflar:** `!px-4`, `!py-2.5`, `!rounded-2xl`, `!rounded-3xl`, `!rounded-xl`, `${adminButtonSecondaryClass`, `${adminCardClass`, `${adminTableCellClass`, `${adminTableCellTruncate150Class`, `${adminTableScrollAreaClass`, `${stats.net`, `0`, `:`, `<`, `>`