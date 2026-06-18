---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx
skeleton_hash: 93c0417d33f23b41
entity_hashes:
  func:AdminInventoryReportPage: 826a3de74f7e982f
  overview: d98a4eff9e18adc6
  style_tokens: 23d781c8192db1b8
generated_at: 2026-06-16T10:19:04Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici arayüzünde envanter verilerini raporlayan bir React sayfasıdır. Tek bileşenli bir yapıya sahip olup, yalnızca yetkili admin kullanıcıların erişimine açıktır ve projenin envanter yönetim sisteminin görsel raporlama arayüzünü sunar.

## Fonksiyon Grupları
### Ana Rapor Bileşeni
Bu grup, tüm sayfa yapısını, veri akışını ve kullanıcı arayüzünü yöneten tek bir üst düzey React bileşeninden oluşur.
- AdminInventoryReportPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül, parametre almayan bir React bileşenidir; fonksiyon gövdesine erişilmediği için iç bağımlılıklar ve çalışma koşulları belirlenememiştir.

[Aksiyom 1]: Eğer bileşen JSX döndüremezse (örn: render hatası), React bileşen ağacı bozulur ve hata sınırı yakalayıcısına kadar üst bileşenler etkilenebilir.

[Aksiyom 2]: Eğer bileşen içinde tüketilen veri kaynakları (API servisleri, context vb.) kullanılabilir değilse, bileşen geçersiz/boş durumda görüntülenir.

---

**Not:** Fonksiyon imzası `AdminInventoryReportPage()` olarak verilmiş olup parametre almamaktadır. Fonksiyon gövdesi paylaşılmadığı için içsel bağımlılıklar (state hook'ları, context tüketimleri, API çağrıları) hakkında kesin çıkarım yapılamamıştır. Mevcut aksiyomlar yalnızca React bileşen modelinin zorunlu gerekliliklerine dayanmaktadır.

---

## FONKSİYON DETAYLARI

### AdminInventoryReportPage
**Ne yapar**: Bu fonksiyon, admin panelinde envanter hareketleri için interaktif bir rapor sayfası oluşturur. Sayfa, stok giriş/çıkış verilerini çeker, işler ve grafikler, tablolar ile istatistiksel kartlar aracılığıyla görselleştirir.
**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşenidir. `useI18n` ile çevirileri, `usePathname` ile mevcut URL'yi, `useDragScroll` ile sürükleme ile kaydırılabilir alanları yönetir. `useState` ile loading durumu, tarih araması, arama sorgusu ve çeşitli veri dizileri için durumlar tutulur. `loadData` adlı `useCallback` ile sarılmış asenkron fonksiyon, `supabase.from('inventory_movements')` sorgusuyla veritabanından veri çeker ve `dateRange` durumuna göre filtreleme uygular. Çekilen veriler, bir `useEffect` içinde `movementsData` durumuna kaydedilir. Veriler işlenirken, toplam giriş/çıkış miktarları, sebep bazlı dağılım, en çok hareket gören ürünler ve günlük trend verileri hesaplanır. Son olarak, bu işlenmiş veriler JSX ile grafik (AreaChart, PieChart, BarChart) ve tablo bileşenleri kullanarak render edilir. `exportCsv` fonksiyonu, `movementsData` dizisini CSV formatına dönüştürerek tarayıcıda bir dosya indirme işlemi başlatır.
**Parametreler**: Parametre almaz (React bileşeni olarak çağrılır).
**Dönüş**: JSX.Element — Render edilmiş admin rapor sayfası bileşenini döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/DateRangePicker::DateRangePicker
- import: ../../hooks/useDragScroll::useDragScroll
- import: ../../lib/ensureSessionFresh::ensureSessionFresh
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: date-fns::eachDayOfInterval
- import: date-fns::endOfDay
- import: date-fns::format
- import: date-fns::startOfDay
- import: date-fns::subDays
- import: next/navigation::usePathname
- import: react-day-picker::DateRange
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::loadData
- **params**: (yok)
- **ic_degiskenler**:
  - `query` — Supabase veritabanı sorgusunu temsil eder, `inventory_movements` tablosundan veri çeker
  - `dateRange?.from` — Filtreleme için başlangıç tarihi
  - `dateRange?.to` — Filtreleme için bitiş tarihi
  - `movements` — Veritabanından dönen ham hareket verileri dizisi
  - `movementsError` — Veritabanı sorgusunda oluşabilecek hata nesnesi
- **Dönüş**: yok (state setter'ları çağırır)

### [N2_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::useEffectLoadData
- **params**: (yok)
- **ic_degiskenler**:
  - `loadData` — loadData asenkron fonksiyonu, veri yükleme işlemini başlatır
- **Dönüş**: yok (yan etki: loadData çağırır)

### [N3_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::computeStats
- **params**: (yok)
- **ic_degiskenler**:
  - `tIn` — Toplam giren ürün sayısını hesaplar
  - `tOut` — Toplam çıkan ürün sayısını hesaplar
  - `reasonMap` — Her sebep türü için (sale, return, restock vb.) ürün sayısını tutar
  - `productSales` — Ürün bazlı satış/çıkış verilerini depolar
  - `trendMap` — Günlük trend verilerini (giren/çıkan) tutar
  - `term` — Arama sorgusunun küçük harf ve boşluk temizlenmiş hali
  - `filtered` — Arama filtresi uygulanmış hareketler dizisi
  - `days` — Tarih aralığındaki tüm günlerin dizisi
  - `dateKey` — Hareket tarihinin 'yyyy-MM-dd' formatındaki anahtarı
  - `deltaAbs` — delta değerinin mutlak değeri
  - `pname` — Ürün adı (veya product_id yedek)
  - `rData` — Pasta grafik için sebep verisi dizisi
  - `sortedProds` — En çok satan ürünlerin sıralanmış dizisi
- **Dönüş**: yok (state setter'ları çağırır: setStats, setReasonData, setTopProducts, setTrendData)

### [N4_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::initializeDayInTrend
- **params**: `d` — Date nesnesi (forEach iterasyon parametresi)
- **ic_degiskenler**:
  - `k` — Günün 'yyyy-MM-dd' formatındaki anahtarı
- **Dönüş**: yok (yan etki: trendMap'e yeni gün ekler)

### [N5_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::processMovement
- **params**: `m` — Tek bir hareket nesnesi (forEach iterasyon parametresi)
- **ic_degiskenler**:
  - `dateKey` — Hareket tarihinin 'yyyy-MM-dd' formatındaki anahtarı
  - `deltaAbs` — delta değerinin mutlak değeri
  - `pname` — Ürün adı (veya product_id yedek)
- **Dönüş**: yok (yan etki: tIn, tOut, trendMap, reasonMap, productSales değişkenlerini günceller)

### [N6_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::mapProductForTop
- **params**: `p` — productSales objesinden bir ürün nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ name: string, amount: number }` — Grafik için formatlanmış ürün verisi

### [N7_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::exportCSV
- **params**: (yok)
- **ic_degiskenler**:
  - `movementsData` — Dışarıdan gelen hareket verileri dizisi (state)
  - `header` — CSV başlık satırı dizisi
  - `csvRows` — Her hareketi CSV satırına dönüştürülmüş dizi
  - `csvString` — Tüm CSV içeriği (BOM karakteri ile)
  - `blob` — CSV verisi için Blob nesnesi
  - `url` — Blob için oluşturulan nesne URL'i
  - `a` — Dinamik olarak oluşturulan <a> elementi (indirme için)
- **Dönüş**: yok (yan etki: CSV dosyasını indirir)

### [N8_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::mapMovementToCSVRow
- **params**: `m` — Tek bir hareket nesnesi (map iterasyon parametresi)
- **ic_degiskenler**:
  - `m.id` — Hareket ID'si
  - `m.created_at` — Hareket tarih/saat bilgisi
  - `m.products?.name` — Ürün adı (veya product_id fallback)
  - `m.delta` — Miktar değişimi
  - `m.reason` — Hareket sebebi
  - `m.product_id` — Ürün ID'si
- **Dönüş**: `string` — Virgülle ayrılmış, tırnak işaretli CSV satırı

### [N9_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::getFilteredMovements
- **params**: (yok)
- **ic_degiskenler**:
  - `searchQuery` — Dışarıdan gelen arama sorgusu (state)
  - `movementsData` — Dışarıdan gelen hareket verileri dizisi (state)
  - `term` — Arama sorgusunun küçük harf ve boşluk temizlenmiş hali
- **Dönüş**: `Array` — Filtrelenmiş hareketler dizisi (JSX'te kullanılır)

### [N10_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::renderIncomingRow
- **params**: `m` — Tek bir hareket nesnesi (JSX map iterasyon parametresi)
- **ic_degiskenler**:
  - `adminTableCellClass` — Tablo hücreleri için CSS sınıfı
  - `m.id` — Hareket ID'si (key olarak kullanılır)
  - `m.created_at` — Hareket tarihi (formatlanır)
  - `m.products?.name` — Ürün adı
  - `m.product_id` — Ürün ID'si (fallback)
  - `m.delta` — Pozitif miktar değişimi
- **Dönüş**: `JSX.Element` — Giren ürün satırı (HTML tablosu satırı)

### [N11_NASIL] AST Pointer: src/views/admin/AdminInventoryReportPage.tsx::renderOutgoingRow
- **params**: `m` — Tek bir hareket nesnesi (JSX map iterasyon parametresi)
- **ic_degiskenler**:
  - `adminTableCellClass` — Tablo hücreleri için CSS sınıfı
  - `m.id` — Hareket ID'si (key olarak kullanılır)
  - `m.created_at` — Hareket tarihi (formatlanır)
  - `m.products?.name` — Ürün adı
  - `m.product_id` — Ürün ID'si (fallback)
  - `m.delta` — Negatif miktar değişimi (çıkış)
- **Dönüş**: `JSX.Element` — Çıkan ürün satırı (HTML tablosu satırı)

---

## NODE ID STANDARD

  file: src\views\admin\AdminInventoryReportPage.tsx
  function: src\views\admin\AdminInventoryReportPage.tsx::AdminInventoryReportPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminInventoryReportPage

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
- **Yardımcı Sınıflar:** `!px-4`, `!py-2.5`, `!rounded-2xl`, `!rounded-3xl`, `!rounded-xl`, `${adminButtonSecondaryClass`, `${adminCardClass`, `${stats.net`, `0`, `:`, `<`, `>`, `animate-in`, `animate-pulse`, `border`