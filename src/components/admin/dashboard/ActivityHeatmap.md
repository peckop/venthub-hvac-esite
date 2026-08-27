---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\dashboard\ActivityHeatmap.tsx
skeleton_hash: 7ba86de476bb1ab7
entity_hashes:
  func:ActivityHeatmap: bd94540a2dbd025e
  func:CustomTooltip: 99bc62d30dc2bdeb
  overview: 54bf3273bff08181
  style_tokens: eb5185c4c1f4adc3
generated_at: 2026-08-27T08:08:00Z
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
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-accent-weak`, `bg-admin-surface`, `border-admin-accent/30`, `border-admin-border`, `group-hover/heatmap:text-admin-accent`, `hover:fill-white`, `text-admin-accent`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-fg-subtle`, `text-sm`, `text-xs`
- **Layout:** `absolute`, `drop-shadow-heatmap-glow`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-4`, `group-hover/heatmap:w-20`, `h-0.5`, `h-2.5`, `h-48`, `h-full`, `items-center`, `justify-center`, `justify-end`
- **Varyant/Responsive:** `group-hover/heatmap:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-ml-6`, `-translate-x-1/2`, `-translate-y-1/2`, `animate-in`, `blur-80`, `border`, `cursor-pointer`, `duration-200`, `duration-700`, `fade-in`, `font-semibold`, `group/heatmap`, `italic`, `mb-10`, `mb-2`