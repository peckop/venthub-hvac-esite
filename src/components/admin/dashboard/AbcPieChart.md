---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\AbcPieChart.tsx
skeleton_hash: d9fe34c63e3b0a63
entity_hashes:
  func:AbcPieChart: 7bea9a0163aecd5b
  overview: fae5c7b54ba69454
  style_tokens: cc7ba7a958715321
generated_at: 2026-05-28T22:35:56Z
---

## Genel Bakış
Bu modül, yönetim panelindeki gösterge tablosunda ABC tipi verileri dairesel grafik (pie chart) olarak görselleştiren bir React bileşeni sunar. Veri ve opsiyonel başlık bilgisini alarak grafik oluşturur ve kullanıcı arayüzünde başlıkla birlikte sunar.

## Fonksiyon Grupları
### Pasta Grafiği Görselleştirme
Bileşenin temel sorumluluğunu oluşturur: gelen veriyi ve başlığı işleyerek interaktif bir pasta grafiği bileşeni oluşturma ve ekranda gösterme.
- AbcPieChart

---



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

### [N1_NASIL] AST Pointer: AbcPieChart.tsx::AbcPieChart
- **params**: ({ data, title }: AbcPieChartProps)
- **ic_degiskenler**: 
    - `totalValue` — data dizisindeki tüm elemanların value değerlerinin toplamı (stok adetlerinin toplamı)
- **Dönüş**: JSX.Element (React bileşeni)

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