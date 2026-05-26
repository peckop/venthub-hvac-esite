---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\AbcPieChart.tsx
skeleton_hash: d9fe34c63e3b0a63
generated_at: 2026-05-23T21:51:41Z
---

## Genel Bakış
`AbcPieChart` bileşeni, yönetim panelindeki gösterge tablosunda ABC tipi verileri dairesel (pie) grafik olarak görselleştirir. Gelen veri ve başlık prop’larını kullanarak uygun bir grafik kütüphanesi aracılığıyla pasta grafiği oluşturur ve kullanıcı arayüzünde başlıkla birlikte sunar.

## Fonksiyon Grupları
### Pasta Grafiği Oluşturma Grubu
Veri ve başlık bilgilerini alarak pasta grafiğinin render edilmesinden ve ekranda gösterilmesinden sorumludur.
- AbcPieChart (tek giriş noktası, prop’ları işler ve grafik bileşenini döndürür)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### AbcPieChart
**Ne yapar**:  
Verilen `data` ve `title` prop'ları ile bir pasta grafiği (PieChart) bileşeni tanımlar. Bu bileşen, React ortamında çalışan bir UI elemanıdır ve görselleştirme amaçlı kullanılır.

**Nasıl yapar**:  
Bir React fonksiyon bileşenidir. `AbcPieChartProps` tipindeki parametre nesnesini alır; bu nesne üzerinden `data` ve `title` değerlerine erişir. Grafiğin çizim detayları (kullanılan kütüphane/harici bağımlılık) mevcut kod parçacığında belirtilmemiştir.

**Parametreler**:  
- `data`: `AbcPieChartProps['data']` (bileşenin prop tipinden gelir) — Pasta grafiğinin dilimlerini oluşturacak veri setidir.  
- `title`: `AbcPieChartProps['title']` (bileşenin prop tipinden gelir) — Grafiğin üzerinde gösterilecek başlık metnidir.

**Dönüş**:  
Fonksiyon bir React bileşeni olduğundan genellikle `JSX.Element` döndürür; ancak bu kod parçacığında dönüş tipi açıkça belirtilmemiştir (void veya bilinmiyor olarak not edilmiştir).

---

## INTERFACES

### AbcPieChartProps
- `data: Array<{ name: string; value: number; color: string }>`
- `title?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\AbcPieChart.tsx::AbcPieChart
- **params**: 
  - `data` — Bir dizi, her elemanı `value` (sayı) ve `color` (renk) özelliklerine sahip; gövdede `d.value`, `entry.color`, `data.value` (doğrudan) şeklinde erişilir
  - `title` — String, opsiyonel başlık; gösterimde varsayılan "ABC Ürün Sınıflandırması" kullanılır
- **ic_degiskenler**: 
  - `totalValue` — `data.reduce((acc, curr) => acc + curr.value, 0)` ile hesaplanan toplam değer, merkezde sergilenir
  - `d` — `data.every(d => d.value === 0)` callback parametresi, her bir veri noktasını temsil eder; `d.value` ile sıfır kontrolü yapılır
  - `entry` — `data.map((entry, index) => ...)` callback parametresi, her bir veri noktası; `entry.color` ile `Cell` dolgu rengi alınır
  - `index` — `data.map((entry, index) => ...)` callback parametresi, `Cell` için benzersiz key (`cell-${index}`) oluşturulur
  - `value (Tooltip formatter)` — `Tooltip` `formatter` fonksiyonunun ilk parametresi (`value: number`); tooltip'te `{value} Ürün` olarak görüntülenir
  - `name (Tooltip formatter)` — `Tooltip` `formatter` fonksiyonunun ikinci parametresi (`name: string`); tooltip'te `{name} Sınıfı` olarak görüntülenir
  - `value (Legend formatter)` — `Legend` `formatter` fonksiyonunun parametresi; etiket metni olarak `value` değişkeni doğrudan kullanılır
- **Dönüş**: JSX.Element (boş veri veya tüm değerler sıfırsa `AdminEmptyState` bileşeni, aksi halde pasta grafik ve `Tooltip`/`Legend` içeren `PieChart` bileşeni)

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
- **shadow:** (yok)
- **height:** `min-h-[300px]`
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`, `tracking-[0.3em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500/10`, `bg-cyan-500/30`, `bg-slate-900/40`, `border-white/5`, `text-4xl`, `text-slate-500`, `text-white`, `text-xs`
- **Layout:** `absolute`, `flex`, `flex-1`, `flex-col`, `group-hover/pie:text-cyan-400`, `group-hover/pie:w-20`, `h-0.5`, `h-full`, `items-center`, `justify-center`, `left-1/2`, `p-10`, `relative`, `top-1/2`, `w-12`
- **Responsive:** (yok)
