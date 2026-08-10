---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\ActivityHeatmap.tsx
skeleton_hash: f80ac205549e0a66
entity_hashes:
  func:ActivityHeatmap: bd94540a2dbd025e
  func:CustomTooltip: 99bc62d30dc2bdeb
  overview: 54bf3273bff08181
  style_tokens: 92623035906e7e7c
generated_at: 2026-06-19T20:47:14Z
---

## Genel Bakış
Bu modül, yönetim paneli dashboard'unun bir parçası olarak aktivite verilerini görselleştirmek için tasarlanmış, takvim tabanlı bir ısı haritası bileşenidir. Dışarıdan sağlanan veri setini, yoğunluk bilgisini renk kodlarıyla gösteren interaktif bir arayüze dönüştürür ve kullanıcı etkileşimlerini zenginleştirmek için özel bir bilgi baloncuğu (tooltip) içerir.

## Fonksiyon Grupları
### Ana Isı Haritası Bileşeni
Modülün temelini oluşturur; dışarıdan gelen veri ve yapılandırma bilgilerini alarak ısı haritasının mantıksal hesaplamasını, düzenini ve render işlemini yönetir.
- ActivityHeatmap

### Yardımcı Bilgi Balonuğu
Isı haritası üzerindeki belirli bir veri noktasına (hücre) fare ile gelindiğinde tetiklenen ve o noktaya ait detaylı bilgiyi göstermek için kullanılan, bağımsız görünüm ve biçimlendirme mantığına sahip yardımcı bileşendir.
- CustomTooltip

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayımlar, fonksiyon imzalarından ve modülün genel bakış açıklamasından çıkarılan bilgilere dayanmaktadır.

[Aksiyom 1]: Eğer `data` parametresi verilmemiş veya null/undefined ise, ısı haritası bileşeni düzgün render edilemez (beklenmeyen davranış oluşur veya bileşen hata verir).

[Aksiyom 2]: Eğer `data` parametresi boş bir dizi ise, ısı haritası alanı boş görünür ve hiçbir yoğunluk göstergesi gösterilmez.

[Aksiyom 3]: Eğer `title` parametresi verilmemiş veya boş string ise, ısı haritası başlık alanı boş kalır ancak bileşen yine de render edilir.

[Aksiyom 4]: Eğer `data` içindeki herhangi bir elemanın `dayName` alanı eksik veya hatalı formatta ise, `CustomTooltip` içinde `dayName` bilgisi düzgün gösterilmez (veya `undefined` olarak render olur).

[Aksiyom 5]: Eğer `active` parametresi `false` veya undefined ise, `CustomTooltip` hiçbir içerik göstermez (veya gizli kalır).

[Aksiyom 6]: Eğer `payload` parametresi boş dizi veya undefined ise, `CustomTooltip` içinde gösterilecek veri içeriği olmaz.

[Aksiyom 7]: Isı haritasının renk kodlaması için gerekli olan eşik değerleri (yoğunluk seviyeleri) fonksiyon gövdesinde tanımlı değildir; bu değerler harici bir yapılandırma veya kütüphane tarafından sağlanmalıdır. Eşik değerleri tanımlı değilse, bileşen beklenmeyen davranış gösterebilir (örneğin tüm hücreler aynı renkte görünebilir).

---

## FONKSİYON DETAYLARI

### ActivityHeatmap
**Ne yapar**: ActivityHeatmap, haftalık aktivite verilerini ısı haritası (heatmap) formatında görselleştiren bir React bileşenidir. Verilen veri kümesine göre gün ve saat bazında renk kodlu bir gösterim sunar.

**Nasıl yapar**: Bileşen, HeatmapData türündeki data prop'unu alır ve her bir hücre için aktivite yoğunluğuna bağlı olarak renk intensitesi hesaplar. `title` prop'u ısı haritasının üst kısmında başlık olarak görüntülenir.

**Parametreler**:
- `data` — `HeatmapData[]` türünde olup, ısı haritasında gösterilecek haftalık aktivite veri dizisini temsil eder
- `title` — `string` türünde olup, ısı haritasının başlığını belirler

**Dönüş**: `React.FC<ActivityHeatmapProps>` — ActivityHeatmapProps arayüzüne uygun bir React fonksiyonel bileşeni döndürür

### CustomTooltip
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../AdminEmptyState::AdminEmptyState
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::Activity

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

### [N1_NASIL] AST Pointer: `ActivityHeatmap.tsx::ActivityHeatmap`
- **params**: `{ data, title }`
  - `data` — Ham heatmap veri dizisi; her eleman `day`, `hour`, `count` alanlarına sahiptir (HeatmapData tipinde)
  - `title` — Isı haritası bölümünün üst kısmında gösterilecek opsiyonel başlık metni
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; tüm UI metinleri için `t('...')` çağrıları yapılır
  - `dayNames` — 7 elemanlı dizi; her gün için çevrilmiş gün adını tutar (`t('admin.dashboard.days.mon')` ... `t('admin.dashboard.days.sun')`)
  - `chartData` — `data.map(d => {...})` ile elde edilen dönüştürülmüş veri dizisi; her eleman `{ hour, dayIndex, dayName, count }` yapısındadır. JS `getDay()` indeksleri (0=Pazar) chart indekslerine (0=Pazartesi) dönüştürülür
  - `ourDayIndex` — `data.map` callback içinde hesaplanan gün indeksi; `d.day === 0 ? 6 : d.day - 1` formülüyle Pazartesi=0, Pazar=6 aralığına map edilir
  - `maxCount` — `chartData` içindeki tüm `count` değerlerinin maksimumu; Z ekseni ölçeklendirmesi ve baloncuk boyutu hesabı için kullanılır, başlangıç değeri `1`
  - `zRange` — `[20, 400]` sabit dizi; baloncukların piksel cinsinden minimum ve maksimum alan aralığını belirler, `ZAxis` `range` prop'una verilir
  - `entry` — Scatter içindeki `chartData.map` callback'indeki mevcut veri nesnesi
  - `index` — Scatter içindeki `chartData.map` callback'indeki dizi indeksi; `key={`cell-${index}`}` oluşturmak için kullanılır
  - `intensity` — `entry.count / maxCount` ile hesaplanan yoğunluk oranı (0-1 arası); hücre opacity'si, stroke ve drop-shadow filtresi hesaplamalarının temelini oluşturur
  - `opacity` — `Math.max(0.15, intensity)` ile hesaplanan minimum %15 opacity garantisi olan opaklık değeri; `Cell` bileşeninin `fillOpacity` prop'una verilir
- **Dönüş**: JSX — Isı haritası içeren React bileşeni; `chartData` boşsa `AdminEmptyState` gösterir, doluysa `ResponsiveContainer > ScatterChart` ile baloncuklu scatter chart render eder

---

### [N2_NASIL] AST Pointer: `ActivityHeatmap.tsx::CustomTooltip`
- **params**: `{ active, payload }`
  - `active` — Tooltip'ın aktif olup olmadığını belirten opsiyonel boolean; `true` olduğunda tooltip içeriği gösterilir
  - `payload` — Tooltip payload dizisi; her elemanın `payload[0].payload` alanı `{ dayName, hour, count, dayIndex }` alanlarını taşır
- **ic_degiskenler**:
  - `data` — `payload[0].payload` referansı; tooltip içinde gösterilecek `dayName`, `hour`, `count` değerlerini barındırır
  - `formattedTime` — Template literal ile oluşturulmuş zaman dizesi; format: `"Pazartesi, 14:00"` gibi; `data.dayName` ve `data.hour` birleştirilerek `padStart(2, '0')` ile saat sıfır doldurulur
- **Dönüş**: JSX veya `null` — Aktif ve payload varsa formatlanmış bilgi kartı (`glass-strong` stilli div), değilse `null`

---

### [N3_NASIL] AST Pointer: `ActivityHeatmap.tsx::(d) => { return {...} }`
- **params**: `d`
  - `d` — `data.map()` iterasyonundaki tek bir ham heatmap veri nesnesi; `{ day: number, hour: number, count: number }` yapısındadır
- **ic_degiskenler**:
  - `ourDayIndex` — JS `getDay()` değerini chart indeksine dönüştüren hesaplama: `d.day === 0 ? 6 : d.day - 1`. Sonuç: 0=Pazartesi, 1=Salı, ..., 6=Pazar
- **Dönüş**: `{ hour, dayIndex, dayName, count }` — Chart bileşeninin beklediği dönüştürülmüş veri nesnesi; `dayName` değeri `dayNames[ourDayIndex]` ile lokalize edilmiş gün adıdır

---

### [N4_NASIL] AST Pointer: `ActivityHeatmap.tsx::(entry, index) => { return <Cell /> }`
- **params**: `entry, index`
  - `entry` — `chartData.map()` iterasyonundaki tek bir chart veri nesnesi; `{ hour, dayIndex, dayName, count }` yapısındadır
  - `index` — Mevcut iterasyon indeksi; `key` prop'u için kullanılır (`key={`cell-${index}`}`)
- **ic_degiskenler**:
  - `intensity` — `entry.count / maxCount` ile hesaplanan normalleştirilmiş yoğunluk (0-1 arası); tüm görsel hesaplamaların (opacity, strokeWidth, drop-shadow) temel parametresidir
  - `opacity` — `Math.max(0.15, intensity)` ile hesaplanan opaklık; yoğunluk sıfıra yakınsa bile minimum %15 görünür olmayı garanti eder; `Cell`'in `fillOpacity` prop'una bağlanır
- **Dönüş**: JSX `<Cell>` — Recharts Scatter içindeki tek bir baloncuk hücresi; `fill="#22d3ee"` (cyan), opacity intensity ile orantılı, `intensity > 0.7` olduğunda 2px cyan stroke eklenir, `intensity > 0.5` olduğunda cyan glow drop-shadow filter uygulanır

---

## NODE ID STANDARD

  file: src\components\admin\dashboard\ActivityHeatmap.tsx
  function: src\components\admin\dashboard\ActivityHeatmap.tsx::ActivityHeatmap
  function: src\components\admin\dashboard\ActivityHeatmap.tsx::CustomTooltip

---

## DISA AKTARILANLAR (EXPORTS)
  export: ActivityHeatmap

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `shadow-glow-md`, `tracking-hvac-normal`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-cyan-500/30`, `bg-cyan-500/5`, `border-cyan-400/20`, `border-white/10`, `border-white/5`, `group-hover/heatmap:text-cyan-400`, `hover:fill-white`, `text-cyan-400`, `text-slate-500`, `text-slate-600`, `text-sm`, `text-white`, `text-xs`
- **Layout:** `absolute`, `drop-shadow-heatmap-glow`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-4`, `group-hover/heatmap:w-20`, `h-0.5`, `h-2.5`, `h-48`, `h-full`, `items-center`, `justify-center`, `justify-end`
- **Varyant/Responsive:** `group-hover/heatmap:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-ml-6`, `-translate-x-1/2`, `-translate-y-1/2`, `animate-in`, `blur-80`, `border`, `cursor-pointer`, `duration-200`, `duration-700`, `fade-in`, `font-black`, `glass`, `glass-strong`, `group/heatmap`, `italic`