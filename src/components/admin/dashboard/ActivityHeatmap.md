---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\ActivityHeatmap.tsx
skeleton_hash: 2c5758de78bc1dee
entity_hashes:
  func:ActivityHeatmap: bd94540a2dbd025e
  func:CustomTooltip: 99bc62d30dc2bdeb
  overview: 0c663e64337450d6
  style_tokens: 92623035906e7e7c
generated_at: 2026-05-28T22:35:38Z
---

## Genel Bakış
Bu modül, yönetim panelinde aktivite verilerini görselleştirmek için kullanılan bir ısı haritası bileşenidir. Dışarıdan gelen veri setini takvim benzeri bir arayüze dönüştürerek yoğunluk bilgisini renk kodlamasıyla sunar ve fare etkileşimlerinde detaylı bilgi sağlamak için özel bir tooltip bileşeni içerir.

## Fonksiyon Grupları
### Isı Haritası Ana Bileşeni
Bileşenin temel yapısını, veri işleme mantığını ve render çıkışını yönetir; dışarıdan aldığı veri ve başlık bilgisiyle ısı haritasını oluşturur.
- ActivityHeatmap

### Bilgi Baloncuğu (Tooltip)
Isı haritası üzerindeki veri noktalarına fare ile gelindiğinde gösterilen detaylı bilgi balonunun görünümünü ve içeriğini hazırlar.
- CustomTooltip

---

## AXIOMS – Mimari Varsayımlar
Bu modül için aksiyomlar, sadece fonksiyon imzalarından ve bileşen yapısından türetilmiştir.

[Aksiyom 1]: Eğer `data` parametresi (HeatmapData[] yapısı) verilmemiş veya `undefined`/`null` ise, ActivityHeatmap bileşeni ısı haritası görselleştirmesi oluşturamaz.

[Aksiyom 2]: Eğer `title` parametresi verilmemiş veya boş string ise, bileşen başlıksız çalışır; bileşenin başlık alanı boş kalır.

[Aksiyom 3]: Eğer CustomTooltip `active` parametresi `false` ise, tooltip görünmez durumda olur.

[Aksiyom 4]: Eğer CustomTooltip `payload` parametresi `undefined` veya boş dizi ise, tooltip içinde gösterilecek veri içeriği olmaz.

[Aksiyom 5]: Eğer CustomTooltip `payload[0].payload` yapısı `{ payload: HeatmapData & { dayName: string } }` formatında değilse, tooltip düzgün biçimlendirilemez.

[Aksiyom 6]: HeatmapData yapısının ısı haritası verisini temsil edecek gerekli alanları (örn: değer, tarih/tanımlayıcı) içermesi gerekir; aksi takdirde ısı haritası hücreleri anlamsız değerler gösterebilir.

---

**Not:** Bu aksiyomlar sadece fonksiyon imzaları ve bileşen tanımları referans alınarak oluşturulmuştur. Fonksiyon gövdesindeki detaylı doğrulama, varsayılan değer处理 ve hata yönetimi mantığı bilinmemektedir.

---

## FONKSİYON DETAYLARI

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