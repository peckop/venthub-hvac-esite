---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\dashboard\SalesChart.tsx
skeleton_hash: 1d2376b4feb5ff39
entity_hashes:
  func:SalesChart: 81798fe6d2553ef7
  overview: b9d1d9a412f73b23
  style_tokens: eb6fa1f854f0685b
generated_at: 2026-08-27T08:08:02Z
---

## Genel Bakış
Bu modül, admin panelindeki dashboard alanında satış verilerini grafiksel olarak gösteren bir React bileşeni içerir. Bileşen, dışarıdan aldığı veri ve başlık bilgisiyle satış grafiğini oluşturur ve render eder. Modül tek bir bileşenden oluşur ve bağımsız bir görselleştirme birimi olarak çalışır.

## Fonksiyon Grupları

### Satış Grafiği Bileşeni
Kullanıcıya satış verilerini grafik biçiminde sunar. Dışarıdan sağlanan veri kümesini ve grafik başlığını alarak ilgili grafiği ekrana çizer.
- SalesChart

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### SalesChart
**Ne yapar**: Admin dashboard alanında satış verilerini görselleştirmek üzere kullanılan bir React fonksiyon bileşenidir. Bileşen, dışarıdan sağlanan veri ve başlık bilgisiyle bir satış grafiği görüntüler.

**Nasıl yapar**: Bileşen, fonksiyon bileşeni (functional component) olarak tanımlanmıştır. Props parametreleri destructuring yöntemiyle (`{ data, title }`) alınır. `React.FC<SalesChartProps>` tipi ile tanımlanmış olup, `SalesChartProps` arayüzüne uygun props kabul eder. Bileşenin iç mantığı hakkında verilen kaynakta ek bilgi bulunmamaktadır.

**Parametreler**:
- data: `SalesChartProps` içinde tanımlı tip — Grafiğe beslenecek satış verilerini temsil eder. Kesin tip bilgisi verilen kaynakta belirtilmemiştir.
- title: `SalesChartProps` içinde tanımlı tip — Grafiğin başlığını temsil eder. Kesin tip bilgisi verilen kaynakta belirtilmemiştir.

**Dönüş**: `React.FC<SalesChartProps>` — `SalesChartProps` arayüzünü kabul eden bir React fonksiyon bileşeni döndürür. Bileşen, JSX elemanı olarak render edilebilir.

---

## İTHALATLAR (IMPORTS)
- import: ../AdminEmptyState::AdminEmptyState
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::TrendingUp
- import: react::React

---

## INTERFACES

### SalesChartProps
- `data: Array<{ date: string; orders: number; returns: number }>`
- `title: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/dashboard/SalesChart.tsx::SalesChart
- **params**: `{ data, title }` — `data` grafik veri dizisi, `title` grafik başlık metni
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; grafik etiketleri, başlık ve açıklamalar için metinleri yerelleştirir
  - `data` — props'tan gelen dizi; `data.length` ile boş durum kontrolü yapılır, `data.length > 20` ile Brush bileşeni koşullu gösterimi belirlenir, `AreaChart` bileşenine `data` prop'u olarak aktarılır
  - `title` — props'tan gelen metin; grafik panelinin üst kısmındaki `h3` etiketinde başlık olarak render edilir
  - `TrendingUp` — lucide-react'ten import edilen ikon; `data.length === 0` durumunda `AdminEmptyState` bileşeninin `icon` prop'una aktarılır
  - `AdminEmptyState` — boş durum bileşeni; veri yokken `icon`, `title`, `description`, `compact` prop'ları ile gösterilir
  - `t('admin.dashboard.charts.operationalPerformanceTrend')` — grafik alt başlık açıklaması
  - `t('admin.dashboard.charts.order')` — sipariş serisi etiketi ve legend metni
  - `t('admin.dashboard.charts.return')` — iade serisi etiketi ve legend metni
  - `t('admin.dashboard.charts.noDataTitle')` — boş durum başlığı
  - `t('admin.dashboard.charts.noDataDesc')` — boş durum açıklaması
  - `ResponsiveContainer` — recharts bileşeni; grafik konteynerini responsive yapar
  - `AreaChart` — recharts bileşeni; `data` ve `margin` prop'ları ile alan grafiğini oluşturur
  - `CartesianGrid` — recharts bileşeni; yatay çizgili ızgara çizer
  - `XAxis` — recharts bileşeni; `dataKey="date"` ile tarih ekseni, stil ve konumlandırma ayarları
  - `YAxis` — recharts bileşeni; değer ekseni, stil ve konumlandırma ayarları
  - `Tooltip` — recharts bileşeni; `contentStyle`, `labelStyle`, `itemStyle`, `cursor` prop'ları ile özel tooltip stili
  - `Area` (sipariş) — recharts bileşeni; `dataKey="orders"`, cyan renk, `fill="url(#colorOrders)"`, animasyonlu
  - `Area` (iade) — recharts bileşeni; `dataKey="returns"`, kırmızı renk, kesikli çizgi, `fill="url(#colorReturns)"`
  - `Brush` — recharts bileşeni; `data.length > 20` koşuluyla gösterilir, tarih ekseni üzerinde kaydırma/filtreleme sağlar
  - `linearGradient#colorOrders` — sipariş alanı için cyan gradyan tanımı
  - `linearGradient#colorReturns` — iade alanı için kırmızı gradyan tanımı
- **Dönüş**: JSX elementi — `div.flex.flex-col` kök elemanı içinde başlık paneli ve koşullu olarak boş durum veya AreaChart gösteren React bileşeni

---

## NODE ID STANDARD

  file: src\components\admin\dashboard\SalesChart.tsx
  function: src\components\admin\dashboard\SalesChart.tsx::SalesChart

---

## DISA AKTARILANLAR (EXPORTS)
  export: SalesChart

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-panel`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-danger`, `bg-admin-surface`, `border-admin-border`, `border-l`, `group-hover/chart:text-admin-accent`, `hover:bg-admin-surface-2`, `text-admin-fg`, `text-admin-fg-muted`, `text-xl`, `text-xs`
- **Layout:** `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-4`, `h-2.5`, `items-center`, `justify-between`, `justify-center`, `min-h-0`, `p-1.5`, `p-8`, `shadow-admin-lg`, `w-2.5`, `w-full`
- **Varyant/Responsive:** `group-hover/chart:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-ml-8`, `border`, `font-semibold`, `group/chart`, `italic`, `leading-none`, `mb-10`, `mt-3`, `opacity-60`, `px-4`, `py-2`, `rounded-admin-lg`, `rounded-admin-md`, `rounded-full`, `tracking-tighter`