---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\AbcPieChart.tsx
skeleton_hash: cb71fb57bbf4a080
entity_hashes:
  func:AbcPieChart: 3ae66809a3c8cea6
  overview: 64d9c987fb2a5f21
  style_tokens: cc7ba7a958715321
generated_at: 2026-06-19T20:47:04Z
---

## Genel Bakış
AbcPieChart, yönetim paneli gösterge tablosunda ABC ürün sınıflandırması verilerini interaktif bir donut (halka) pasta grafiği olarak görselleştiren React bileşenidir. Veri dizisi ve opsiyonel bir başlık alarak grafik oluşturur; veri yoksa veya tüm değerler sıfırsa AdminEmptyState bileşeniyle boş durum ekranı gösterir.

## Fonksiyon Grupları
### Pasta Grafiği Görselleştirme
Bileşenin tek ve temel sorumluluğudur: gelen veri dizisini doğrular, geçerliyse ResponsiveContainer ve PieChart bileşenleriyle renkli dilimlerden oluşan interaktif bir halka grafik oluşturur. Grafik merkezinde toplam stok sayısını, altında ise Legend ve Tooltip bileşenlerini sunar.

- AbcPieChart

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari fonksiyon gövdesi paylaşılmadığından, yalnızca fonksiyon imzasından çıkarılabilir minimum varsayımlar tanımlanmıştır.

[Aksiyom 1]: Eğer `data` prop'u verilmezse, bileşen tanımsız davranış gösterebilir; çünkü `AbcPieChartProps` içinde `data` için bir default değer belirtilmemiştir.

[Aksiyom 2]: Eğer `title` prop'u verilmezse, bileşen tanımsız davranış gösterebilir; çünkü `AbcPieChartProps` içinde `title` için bir default değer belirtilmemiştir.

[Aksiyom 3]: Eğer `AbcPieChartProps` tipi tanımlı değilse veya `data`/`title` alanlarını içermiyorsa, TypeScript derleme hatası oluşur.

---

> **Not:** Modül gövdesi (function body) paylaşılmadığından, verinin işlenme mantığı (sıfır kontrolü, boş durum ekranı, grafik kütüphane entegrasyonu vb.) hakkında kesin aksiyon üretmek mümkün değildir. Eski dokümanda bahsedilen "veri yoksa boş ekran gösterimi" gibi davranışlar docstring/yorum kaynaklıdır ve mimari aksiyom olarak doğrulanamaz.

---

## FONKSİYON DETAYLARI

### AbcPieChart

**Ne yapar**: Admin dashboard'da ABC ürün sınıflandırması için interaktif donut (iç portionlu) pasta grafik gösteren React bileşenidir. Veri olmadığında veya tüm değerler sıfır olduğunda boş durum bileşeni (AdminEmptyState) gösterir, aksi halde renkli dilimlerden oluşan animasyonlu bir pie chart ve merkezde toplam stok sayısını sunar.

**Nasıl yapar**: 
- `useI18n()` hook'u ile çevirileri (`t` fonksiyonu) alarak çok dilli destek sağlar.
- İlk olarak data dizisinin geçerliliğini kontrol eder: `data` tanımsızsa, boşsa veya tüm elemanların `value` değeri 0 ise, `AdminEmptyState` bileşeni ile veri yetersizlik mesajı gösterir.
- Geçerli veri varsa, `data.reduce()` ile toplam değeri hesaplar ve `ResponsiveContainer` içinde `PieChart` bileşenini render eder.
- `Pie` bileşeninde her bir veri elemanı için `Cell` oluşturur; her hücreye ait `color` değeri `fill` olarak kullanılır, hover'da opacity düşüşü ile interaktiflik sağlanır.
- `Tooltip` ile üzerine gelindiğinde ürün sayısını ve sınıf adını formatlanmış şekilde gösterir.
- `Legend` bileşeni ile grafik altında sınıf isimlerini listeler.
- Grafik merkezine `absolute` konumlandırma ile toplam değer ve "Toplam Stok" etiketi yerleştirir; arkasında `blur` efekti ile görsel derinlik oluşturulur.
- Tüm grafik animasyonları `animationBegin={0}` ve `animationDuration={1500}` ile 1.5 saniyelik giriş animasyonuna sahiptir.
- Grubun tamamına `group/pie` class'ı eklenerek, başlık ve alt çizgi üzerinde hover efekti (`group-hover/pie:text-cyan-400`, `group-hover/pie:w-20`) uygulanır.

**Parametreler**:
- `data` — `AbcPieChartItem[]` veya `undefined` — Pasta grafikte gösterilecek veri dizisi; her eleman bir ürün sınıfını (A, B, C vb.) temsil eder, `value` (sayı) ve `color` (hex renk kodu) alanları içerir. Boş veya tanımsız geldiğinde boş durum gösterilir.
- `title` — `string` veya `undefined` — Grafik başlığı; belirtilmezse varsayılan olarak `t('admin.dashboard.abcProductClassification')` çevirisi kullanılır.

**Dönüş**: `JSX.Element` — Bu bileşen React JSX'i döner; iki durumdan birini render eder: ya veri yetersizlik durumu için `AdminEmptyState` içeren bir `div`, ya da donut pie chart, tooltip, legend ve merkez toplam göstergesi içeren tam grafik görünümü.

---

## İTHALATLAR (IMPORTS)
- import: ../AdminEmptyState::AdminEmptyState
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::PieChart
- import: recharts::Cell
- import: recharts::Legend
- import: recharts::Pie
- import: recharts::PieChart
- import: recharts::ResponsiveContainer
- import: recharts::Tooltip

---

## INTERFACES

### AbcPieChartProps
- `data: Array<{ name: string; value: number; color: string }>`
- `title?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/dashboard/AbcPieChart.tsx::AbcPieChart
- **params**: `{ data, title }` (destructure edilmiş AbcPieChartProps objesi)
  - `data` — Pie chart veri dizisi; her eleman `value` (sayı), `color` (renk kodu) ve `name` (sınıf adı) özelliklerine sahiptir
  - `title` — Grafik başlık metni (opsiyonel, verilmezse `t('admin.dashboard.abcProductClassification')` kullanılır)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; tüm UI metinlerinin lokalizasyonu için kullanılır (`t('admin.dashboard.noAnalysisData')`, `t('admin.dashboard.productCount', { count: value })` vb.)
  - `totalValue` — `data.reduce((acc, curr) => acc + curr.value, 0)` ile hesaplanan tüm data elemanlarının value toplamı; grafiğin merkezinde "Toplam Stok" olarak görüntülenir
- **Dönüş**: JSX (React bileşeni) — Veri boşsa veya sıfırdan oluşan `AdminEmptyState` bileşeni, değilse donut pie chart bileşeni döner
- **Yan etkiler**: Yok (render-only bileşen)
- **Inline callback değişkenleri** (JSX içinde tanımlı):
  - `entry` / `index` — `data.map` callback'inde her pie dilimi elemanını ve indeksini temsil eder; `Cell` bileşenine `entry.color` ile renk ve `key={cell-${index}}` ile anahtar atar
  - `value` / `name` — `Tooltip` `formatter` callback parametreleri; `value` ürün sayısını, `name` ürün sınıf adını temsil eder, çeviri fonksiyonuyla formatlanır
  - `value` — `Legend` `formatter` callback parametresi; legend metnini render eder

---

## NODE ID STANDARD

  file: src\components\admin\dashboard\AbcPieChart.tsx
  function: src\components\admin\dashboard\AbcPieChart.tsx::AbcPieChart

---

## DISA AKTARILANLAR (EXPORTS)
  export: AbcPieChart

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500/10`, `bg-cyan-500/30`, `bg-slate-900/40`, `border-white/5`, `group-hover/pie:text-cyan-400`, `text-4xl`, `text-slate-500`, `text-white`, `text-xs`
- **Layout:** `absolute`, `drop-shadow-pie-chart-glow`, `flex`, `flex-1`, `flex-col`, `group-hover/pie:w-20`, `h-0.5`, `h-full`, `items-center`, `justify-center`, `left-1/2`, `min-h-300px`, `p-10`, `relative`, `top-1/2`
- **Varyant/Responsive:** `group-hover/pie:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-mt-4`, `-translate-x-1/2`, `-translate-y-1/2`, `blur-3xl`, `border`, `cursor-pointer`, `duration-500`, `duration-700`, `font-black`, `group/pie`, `hover:opacity-80`, `inset-0`, `italic`, `mb-10`, `ml-1`