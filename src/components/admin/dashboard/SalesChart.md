---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\SalesChart.tsx
skeleton_hash: 8dd65454f964d2ba
generated_at: 2026-05-23T21:52:04Z
---

## Genel Bakış
`SalesChart`, yönetim paneline ait satış verilerini görselleştiren bir React bileşenidir. Kendisine dışarıdan iletilen veri dizisi ve başlık bilgisiyle bir grafik oluşturarak kullanıcıya özet bir satış raporu sunar.

## Fonksiyon Grupları
### Grafik Render Grubu
Bu grup, bileşene gelen `data` ve `title` prop’larını kullanarak satış grafiğini hazırlar ve JSX çıktısı olarak döndürür.
- SalesChart

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### SalesChart
**Ne yapar**: Bu React fonksiyonel bileşeni, yönetici panosu (admin dashboard) arayüzünde satış verilerini görselleştiren bir grafik bileşeni oluşturur. Kendisine iletilen `data` ve `title` prop'larını kullanarak kullanıcıya anlamlı bir satış raporu sunar.

**Nasıl yapar**: `React.FC<SalesChartProps>` tipi ile tanımlanan bir fonksiyonel bileşendir. Gelen props nesnesini JavaScript destructuring yöntemiyle `data` ve `title` değişkenlerine ayırır. Bu değişkenleri kullanarak bir grafik JSX yapısı oluşturur ve render edilmek üzere döndürür. Bileşenin iç mantığı, tip güvenliği sağlayan `SalesChartProps` arayüzüne dayanır.

**Parametreler**:
- `data: SalesChartProps['data']` — Grafikte görüntülenecek olan satış verilerini içeren prop'tur. İçeriği ve yapısı `SalesChartProps` arayüzü tarafından belirlenir ve üst bileşen tarafından sağlanır.
- `title: SalesChartProps['title']` — Grafiğin üst kısmında görüntülenecek başlık metnini belirten string değerdir. Kullanıcı arayüzünde grafiğin bağlamını açıklamak için kullanılır.

**Dönüş**: `React.FC<SalesChartProps>` — Fonksiyonun kendisi bir React Fonksiyonel Bileşeni döndürür. Bu bileşenin bir örneği JSX içerisinde çağrıldığında (`<SalesChart ... />`) bir `ReactElement` ya da `null` döndürür.

---

## INTERFACES

### SalesChartProps
- `data: Array<{ date: string; orders: number; returns: number }>`
- `title: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/dashboard/SalesChart.tsx::SalesChart
- **params**: 
  - `data` — satış verisi dizisi (SalesChartProps'den alınır, `data.length` ile boş kontrolü, `AreaChart data` prop'u ve `Brush` koşulu için kullanılır)
  - `title` — grafik başlığı (h3 elementinde görüntülenir)
- **ic_degiskenler**: yok (fonksiyon gövdesinde değişken tanımlanmamıştır)
- **Dönüş**: React JSX elemanı (`ResponsiveContainer` içinde `AreaChart`, `Brush`, `AdminEmptyState` gibi bileşenleri döndürür)

---

## NODE ID STANDARD

  file: src\components\admin\dashboard\SalesChart.tsx
  function: src\components\admin\dashboard\SalesChart.tsx::SalesChart

---

## DISA AKTARILANLAR (EXPORTS)
  export: SalesChart