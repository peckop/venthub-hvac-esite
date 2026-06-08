---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\AbcPieChart.tsx
skeleton_hash: 611a19bfc52d2b80
entity_hashes:
  func:AbcPieChart: 7bea9a0163aecd5b
  overview: 9b9476fab7bc8e23
  style_tokens: cc7ba7a958715321
generated_at: 2026-06-08T10:08:37Z
---

## Genel Bakış
AbcPieChart modülü, yönetim panelindeki gösterge tablosunda ABC ürün sınıflandırması verilerini dairesel grafik (pie chart) olarak görselleştiren bir React bileşeni sunar. Veri dizisini ve isteğe bağlı bir başlık alarak interaktif bir grafik oluşturur; veri yoksa veya tüm değerler sıfırsa boş bir durum ekranı gösterir.

## Fonksiyon Grupları
### Pasta Grafiği Oluşturma ve Gösterim
Bu grup, bileşenin temel sorumluluğunu karşılar: ham veriyi kontrol edip işleyerek, interaktif bir pasta grafiği bileşeni oluşturur ve başlıkla birlikte kullanıcı arayüzünde sunar.
- AbcPieChart

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ABC sınıflandırmalı pasta grafiği görselleştiren bir React bileşenidir.

---

## FONKSİYON DETAYLARI

### AbcPieChart
**Ne yapar**: Bu React bileşeni, ABC ürün sınıflandırması için interaktif bir pasta grafik gösterir. Veri yoksa veya tüm değerler sıfırsa boş durum ekranını, aksi halde detaylı bir pasta grafik ve merkezde toplam stok sayısını render eder.

**Nasıl yapar**: Fonksiyon, `data` dizisini kontrol ederek başlar: dizi boşsa veya tüm elemanların `value` değeri sıfırsa, `AdminEmptyState` bileşeniyle basit bir boş durum ekranı gösterir. Veri geçerliyse, dizideki tüm `value` değerlerinin toplamını hesaplar. Ardından, `ResponsiveContainer` ve `PieChart` bileşenlerini kullanarak donut (halka) grafik oluşturur. Her veri elemanı için renkli bir dilim (Cell) render eder, araç ipuçları (Tooltip) ve gösterge (Legend) ekler. Grafik merkezinde, hesaplanan toplam değeri "Toplam Stok" etiketiyle konumlandırır.

**Parametreler**:
- `data`: array of objects — Grafikte gösterilecek veri dizisi. Her eleman en az `value` (number), `color` (string) ve muhtemelen `name` (string) özelliklerine sahip olmalıdır. `value`, stok miktarını veya sınıflandırma değerini; `color`, dilimin rengini belirtir.
- `title`: string (isteğe bağlı) — Grafik başlığı. Belirtilmezse "ABC Ürün Sınıflandırması" varsayılan değeri kullanılır.

**Dönüş**: JSX elementi — React bileşeni, koşullara bağlı olarak boş durum ekranını veya tam grafik arayüzünü içeren JSX döndürür. Doğrudan `void` döndürmez, React'ta bileşenler JSX döndürerek render işlemini gerçekleştirir.

---

## INTERFACES

### AbcPieChartProps
- `data: Array<{ name: string; value: number; color: string }>`
- `title?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/components/admin/dashboard/AbcPieChart.tsx`::AbcPieChart
- **params**: `{ data, title }: AbcPieChartProps`
  - `data` — ABC sınıflandırma verisi dizisi; her eleman `value` (stok adedi) ve `color` (hücre rengi) özelliklerine sahiptir; boşsa veya tüm değerleri 0 ise boş durum bileşeni gösterilir
  - `title` — grafik başlık metni; sağlanmazsa `"ABC Ürün Sınıflandırması"` varsayılanı kullanılır
- **ic_degiskenler**:
  - `totalValue` — `data.reduce((acc,_curr)=>acc+curr.value,0)` ile hesaplanan toplam stok adedi; merkezde büyük rakam olarak gösterilir
- **Callback parametreleri** (map/formatter içinde):
  - `entry` — `data.map` callback'indeki mevcut eleman; `entry.color` ile hücre rengi alınır
  - `index` — `data.map` callback'indeki indeks; `key={`cell-${index}`}` oluşturulurken kullanılır
  - `value` (Tooltip formatter) — Tooltip'te gösterilen sayısal değer; `"${value} Ürün"` formatına dönüştürülür
  - `name` (Tooltip formatter) — Tooltip'te gösterilen sınıf adı; `"${name} Sınıfı"` formatına dönüştürülür
  - `value` (Legend formatter) — Legend satırındaki etiket metni; `value` string olarak büyük harfli span içinde render edilir
- **Dönüş**: JSX (React elementi) — `data` boş/tümü sıfır ise `AdminEmptyState` içeren empty-state JSX; aksi halde `ResponsiveContainer > PieChart` ile merkezde toplam gösteren pie chart JSX

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