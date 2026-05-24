---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\ActivityHeatmap.tsx
skeleton_hash: 2c5758de78bc1dee
generated_at: 2026-05-23T21:52:24Z
---

## Genel Bakış
`ActivityHeatmap` bileşeni, yönetim panelinde kullanılan bir ısı haritası görselleştirmesidir; dışarıdan aldığı veri setini takvim benzeri bir ısı haritasına dönüştürür ve başlıkla birlikte sunar. `CustomTooltip` ise bu ısı haritasının üzerine gelindiğinde görünen bilgi balonunu oluşturur, aktif durumu ve ilgili veri noktasının detaylarını biçimlendirerek kullanıcıya gösterir.

## Fonksiyon Grupları
### Ana Isı Haritası Görselleştirme
Isı haritasının ana render mantığını, veri alımını ve bileşenin dışarıya sunduğu arayüzü (props) yönetir.
- ActivityHeatmap

### Tooltip Bileşeni
Fare etkileşimleri sırasında gösterilecek ayrıntılı bilgi balonunun görünümünü ve içeriğini hazırlar.
- CustomTooltip

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `data` parametresi `ActivityHeatmap` fonksiyonuna geçilmezse, bileşen bir hata üretir ve render edilmez.  
[Aksiyom 2]: Eğer `title` parametresi `ActivityHeatmap` fonksiyonuna geçilmezse, bileşen bir hata üretir ve render edilmez.  
[Aksiyom 3]: Eğer `data` dizisi boşsa, `ActivityHeatmap` bileşeni boş bir heatmap görüntüler (hiç veri gösterilmez).  
[Aksiyom 4]: Eğer `CustomTooltip` fonksiyonuna `active` değeri `false` olarak geçilirse, tooltip gösterilmez.  
[Aksiyom 5]: Eğer `CustomTooltip` fonksiyonuna `payload` değeri `undefined` veya boş bir dizi olarak geçilirse, tooltip gösterilmez.  
[Aksiyom 6]: Eğer `payload` dizisinde bulunan nesneler `payload` özelliği içermiyorsa, tooltip gösterilmez.  
[Aksiyom 7]: Eğer `payload` dizisinde bulunan nesnelerin `payload` özelliği `HeatmapData & { dayName: string }` tipinde değilse, tooltip gösterilmez.  
[Aksiyom 8]: Eğer `CustomTooltip` fonksiyonuna `active` değeri `true` ve `payload` değeri geçerli bir dizi ise, tooltip gösterilir ve `payload` içindeki verilerle doldurulur.

---

---

## FONKSIYON DETAYLARI

### ActivityHeatmap
**Ne yapar**: Bir aktivite ısı haritası bileşeni oluşturan React fonksiyonel bileşenidir. Bu bileşen, belirtilen veri setini takvim tabanlı bir ısı haritası şeklinde görselleştirir ve bir başlık ile birlikte sunar.
**Nasıl yapar**: `data` ve `title` prop'larını alır; dışarıdan gelen `ActivityHeatmapProps` tipindeki prop nesnesini parçalayarak bileşen içinde kullanır. Harita görünümü ve stil detayları prop'lar aracılığıyla özelleştirilebilir, ancak iç mantığında tam olarak hangi kütüphanelerin (örneğin Recharts, tarih işleme) kullanıldığı belirtilmemiştir.
**Parametreler**:
- `data`: (tip: `ActivityHeatmapProps` içindeki karşılığı) — Isı haritasında gösterilecek aktivite verilerini içeren dizi veya yapı. Hücrelerin değerlerini ve zaman dilimlerini tanımlar.
- `title`: (tip: `ActivityHeatmapProps` içindeki karşılığı) — Bileşenin üst kısmında görüntülenecek başlık metni.
**Dönüş**: `React.FC<ActivityHeatmapProps>` tipinde bir fonksiyonel bileşen. Bu bileşen React'te kullanıldığında, ısı haritasını oluşturan JSX elemanlarını döndürür.

### CustomTooltip
**Ne yapar**: Recharts tabanlı ısı haritası için özel bir tooltip (ipucu kutusu) bileşenidir. Fare ile bir hücrenin üzerine gelindiğinde ilgili günün detay bilgilerini gösterir.
**Nasıl yapar**: `active` ve `payload` prop'larına bağlı olarak çalışır. `active` true olduğunda tooltip görünür hale gelir; `payload` dizisindeki her bir veri noktasından `HeatmapData` ve türetilmiş `dayName` bilgisini çekerek ekrana yansıtır. Detaylı render mantığı (hücre içeriği, stil) kaynak kodda tanımlanmıştır ancak bu özette belirtilmemiştir.
**Parametreler**:
- `active`: `boolean` (isteğe bağlı) — Tooltip'in görünür olup olmadığını belirleyen Recharts tarafından sağlanan kontrol değişkeni.
- `payload`: `{ payload: HeatmapData & { dayName: string } }[]` (isteğe bağlı) — Üzerine gelinen veri noktalarının listesi. Her bir eleman, ısı haritası verisi (`HeatmapData`) ve ek olarak gün adı (`dayName`) içerir.
**Dönüş**: Belirtilmemiş (bilinmiyor). Büyük olasılıkla oluşturulan JSX elemanlarını veya aktivite durumuna bağlı olarak `null` döndürür; kesin tip bilgisi dokümantasyonda yer almamaktadır.

---

## INTERFACES

### HeatmapData
- `day: number`
- `hour: number`
- `count: number`

### ActivityHeatmapProps
- `data: HeatmapData[]`
- `title?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/dashboard/ActivityHeatmap.tsx::ActivityHeatmap
- **params**: data, title
- **ic_degiskenler**: 
  - `dayNames` — array of Turkish abbreviated day names used for Y‑axis labels.
  - `chartData` — transformed data array where each object contains `hour`, `dayIndex` (0 = Mon … 6 = Sun), `dayName` (string) and `count`.
  - `CustomTooltip` — a React component that renders the tooltip content when a scatter point is active.
  - `maxCount` — holds the maximum `count` value across `chartData`, used to set the Z‑axis domain.
  - `zRange` — tuple `[minArea, maxArea]` defining the minimum and maximum bubble size for the Z‑axis.
- **Dönüş**: JSX element (the rendered component)

### [N2_NASIL] AST Pointer: src/components/admin/dashboard/ActivityHeatmap.tsx::chartData.map callback
- **params**: d
- **ic_degiskenler**: 
  - `ourDayIndex` — computed Y‑axis index (0 = Mon, …, 6 = Sun) derived from `d.day`.
- **Dönüş**: object `{ hour: number, dayIndex: number, dayName: string, count: number }`

### [N3_NASIL] AST Pointer: src/components/admin/dashboard/ActivityHeatmap.tsx::CustomTooltip
- **params**: active, payload
- **ic_degiskenler**: 
  - `data` — the tooltip payload (`payload[0].payload`) containing `dayName`, `hour` and `count` for the active point.
- **Dönüş**: JSX element (tooltip div) or `null`

### [N4_NASIL] AST Pointer: src/components/admin/dashboard/ActivityHeatmap.tsx::Scatter data map callback
- **params**: entry, index
- **ic_degiskenler**: 
  - `intensity` — ratio `entry.count / maxCount` used to determine visual strength.
  - `opacity` — bubble fill opacity, clamped to a minimum of 0.15.
- **Dönüş**: JSX element (`<Cell>`) representing a scatter point.

---

---

## NODE ID STANDARD

  file: src\components\admin\dashboard\ActivityHeatmap.tsx
  function: src\components\admin\dashboard\ActivityHeatmap.tsx::ActivityHeatmap
  function: src\components\admin\dashboard\ActivityHeatmap.tsx::CustomTooltip

---

## DISA AKTARILANLAR (EXPORTS)
  export: ActivityHeatmap