---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\dashboard\ActivityHeatmap.tsx
skeleton_hash: fcfcf08ada0258f3
entity_hashes:
  func:ActivityHeatmap: bd94540a2dbd025e
  func:CustomTooltip: 99bc62d30dc2bdeb
  overview: 0c663e64337450d6
  style_tokens: 92623035906e7e7c
generated_at: 2026-06-08T10:08:37Z
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
- **params**: (`data`, `title`)
- **ic_degiskenler**: 
  - `dayNames` — Türkçe gün isimleri dizisi (Pzt, Sal, Çar, Per, Cum, Cmt, Paz)
  - `chartData` — `data.map()` ile oluşturulan, `hour`, `dayIndex`, `dayName`, `count` özellikleri olan dizi
  - `ourDayIndex` — `d.day` değerinden hesaplanan indeks (0=Pzt, 6=Paz)
  - `data` (CustomTooltip içindeki) — `payload[0].payload` erişimiyle alınan HeatmapData & dayName nesnesi
  - `maxCount` — `chartData` dizisi içindeki maksimum `count` değeri (Z ekseni ölçeklendirmesi için)
  - `zRange` — `[20, 400]` sabit dizisi, baloncuk boyut aralığı
  - `intensity` — Her `entry.count / maxCount` oranı
  - `opacity` — `Math.max(0.15, intensity)` hesaplamasıyla belirlenen opaklık
- **Dönüş**: JSX elementi (React component)

### [N2_NASIL] AST Pointer: `ActivityHeatmap.tsx::CustomTooltip`
- **params**: (`active`, `payload`)
- **ic_degiskenler**: 
  - `data` — `payload[0].payload` erişimiyle alınan HeatmapData & dayName nesnesi
- **Dönüş**: JSX elementi veya `null`

### [N3_NASIL] AST Pointer: `ActivityHeatmap.tsx::data.map callback`
- **params**: (`d`)
- **ic_degiskenler**: 
  - `ourDayIndex` — `d.day` değerinden hesaplanan indeks (Pazartesi başlangıçlı)
- **Dönüş**: `{ hour, dayIndex, dayName, count }` nesnesi

### [N4_NASIL] AST Pointer: `ActivityHeatmap.tsx::chartData.map callback`
- **params**: (`entry`, `index`)
- **ic_degiskenler**: 
  - `intensity` — `entry.count / maxCount` hesaplamasıyla elde edilen yoğunluk oranı
  - `opacity` — `Math.max(0.15, intensity)` hesaplamasıyla belirlenen opaklık değeri
- **Dönüş**: `<Cell>` JSX elementi

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