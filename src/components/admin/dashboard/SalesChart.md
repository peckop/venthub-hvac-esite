---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\SalesChart.tsx
skeleton_hash: d31ca9fe12bd815b
entity_hashes:
  func:SalesChart: 81798fe6d2553ef7
  overview: 0b8303dd7641efb3
  style_tokens: d6e6bd2ac73e7719
generated_at: 2026-06-08T10:08:37Z
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

## FONKSİYON DETAYLARI

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

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-panel`, `shadow-glow-md`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-rose-500`, `border-l`, `border-white/10`, `border-white/5`, `group-hover/chart:text-cyan-400`, `hover:bg-white/5`, `text-slate-300`, `text-slate-500`, `text-white`, `text-xl`, `text-xs`
- **Layout:** `backdrop-blur-2xl`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-4`, `h-2.5`, `items-center`, `justify-between`, `justify-center`, `min-h-0`, `p-1.5`, `p-8`, `shadow-2xl`, `w-2.5`
- **Varyant/Responsive:** `group-hover/chart:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-ml-8`, `border`, `font-black`, `glass`, `group/chart`, `italic`, `leading-none`, `mb-10`, `mt-3`, `opacity-60`, `px-4`, `py-2`, `rounded-2xl`, `rounded-full`, `rounded-xl`