---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\SalesChart.tsx
skeleton_hash: da532f9cfab326b1
entity_hashes:
  func:SalesChart: 81798fe6d2553ef7
  overview: b9d1d9a412f73b23
  style_tokens: d6e6bd2ac73e7719
generated_at: 2026-06-19T20:47:01Z
---

## Genel Bakış
SalesChart bileşeni, yönetim panelinde satış verilerini görselleştiren temel bir React grafik bileşenidir. Dışarıdan sağlanan veri seti ve başlık bilgisiyle, kullanıcının satış performansını hızlıca analiz etmesine olanak tanıyan bir grafik oluşturur.

## Fonksiyon Grupları
### Grafik Görselleştirme
Bu grup, yönetici arayüzünde satış verilerini grafik olarak sunan bileşenin temel yapısını ve render mantığını barındırır. Bileşen, gelen verileri alır ve anlamlı bir grafik çıktısı üretir.
- SalesChart

---

## AXIOMS – Mimari Varsayımlar
Bu React bileşeninin çalışması için外界den sağlanan props'ların varlığına bağlıdır.

**[Aksiyom 1]**: Eğer `data` prop'u sağlanmamışsa, bileşen grafik verisini görselleştiremez ve boş/hatalı bir grafik render edilir.

**[Aksiyom 2]**: Eğer `title` prop'u sağlanmamışsa, grafik başlığı gösterilmez veya grafik başlıksız render edilir.

**[Aksiyom 3]**: Eğer `data` prop'u boş dizi (`[]`) olarak verilmişse, grafik alanında veri noktaları gösterilmez (sıfır yükseklikli veya boş bir chart alanı oluşur).

**[Aksiyom 4]**: Eğer `data` prop'u grafik kütüphanesinin beklediği formatta (tarih/sayısal değer çiftleri vb.) değilse, grafik render hatası oluşur.

**[Aksiyom 5]**: Eğer `title` prop'u boş string (`""`) olarak verilmişse, grafik başlık alanı görünür ancak içeriği boş olur.

**[Aksiyom 6]**: Bu bileşen yönetici paneli (admin dashboard) bağlamında kullanılmalıdır — yetkisiz sayfalarda render edilmesi durumunda veri gizliliği ihlali riski oluşur.

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