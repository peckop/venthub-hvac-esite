---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\admin\dashboard\AbcPieChart.tsx
skeleton_hash: 80f926fbaf3cf540
entity_hashes:
  func:AbcPieChart: cde258b4cc2386ed
  overview: 64d9c987fb2a5f21
  style_tokens: 5302d85fc9a1582c
generated_at: 2026-08-27T13:12:35Z
---

## Genel Bakış
AbcPieChart, yönetim paneli gösterge tablosunda ABC ürün sınıflandırması verilerini interaktif bir donut (halka) pasta grafiği olarak görselleştiren React bileşenidir. Veri dizisi ve opsiyonel bir başlık alarak grafik oluşturur; veri yoksa veya tüm değerler sıfırsa AdminEmptyState bileşeniyle boş durum ekranı gösterir.

## Fonksiyon Grupları
### Pasta Grafiği Görselleştirme
Bileşenin tek ve temel sorumluluğudur: gelen veri dizisini doğrular, geçerliyse ResponsiveContainer ve PieChart bileşenleriyle renkli dilimlerden oluşan interaktif bir halka grafik oluşturur. Grafik merkezinde toplam stok sayısını, altında ise Legend ve Tooltip bileşenlerini sunar.

- AbcPieChart

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari fonksiyon gövdesi paylaşılmadığından, yalnızca fonksiyon imzasından çıkarılabilir minimum varsayımlar tanımlanmıştır.

[Aksiyom 1]: Eğer `data` prop'u verilmezse, bileşen tanımsız davranış gösterebilir; çünkü `AbcPieChartProps` içinde `data` için bir default değer belirtilmemiştir.

[Aksiyom 2]: Eğer `title` prop'u verilmezse, bileşen tanımsız davranış gösterebilir; çünkü `AbcPieChartProps` içinde `title` için bir default değer belirtilmemiştir.

[Aksiyom 3]: Eğer `AbcPieChartProps` tipi tanımlı değilse veya `data`/`title` alanlarını içermiyorsa, TypeScript derleme hatası oluşur.

---

## FONKSİYON DETAYLARI

### AbcPieChart
**Ne yapar**: ABC ürün sınıflandırmasını gösteren bir pasta grafik (pie chart) bileşenidir. Gelen veri boşsa, yoksa veya tüm değerler sıfırsa, kullanıcıya bilgilendirici bir boş durum ekranı sunar. Aksi takdirde, Recharts kütüphanesini kullanarak etkileşimli ve animasyonlu bir pasta grafik çizer ve grafik merkezinde toplam stok miktarını görüntüler.

**Nasıl yapar**: Bileşen, önce `useI18n` hook'u aracılığıyla uluslararasılaştırma fonksiyonunu (`t`) alır. Ardından gelen `data` prop'unu kontrol eder: veri yoksa, boşsa veya tüm elemanların `value` değeri sıfırsa, `AdminEmptyState` bileşenini içeren bir boş durum arayüzü döndürür. Veri mevcutsa, `data` dizisindeki tüm `value` değerlerini toplayarak `totalValue` hesaplar. Ana dönüş kısmında, `ResponsiveContainer` içinde bir `PieChart` oluşturur. Grafik, `innerRadius` ve `outerRadius` ile halka şeklinde, `paddingAngle` ile dilimler arası boşluklu, `stroke` ile kenarlıklı ve animasyonlu (`animationDuration`) bir `Pie` bileşeni içerir. Her dilim, verideki `color` değerine göre boyanır. Grafik üzerinde özel stillenmiş bir `Tooltip` ve `Legend` bulunur. Grafik mutlak konumlandırılmış bir `div` içinde, merkezde toplam stok miktarını ve bir etiket gösterir.

**Parametreler**:
- `data`: `AbcPieChartProps['data']` (tipi verilmemiş, ancak gövdeden `value` ve `color` alanlarına sahip bir nesne dizisi olduğu anlaşılmaktadır) — Grafikte gösterilecek veri seti. Her elemanın bir `value` (sayısal değer) ve bir `color` (renk kodu) özelliği olmalıdır.
- `title`: `AbcPieChartProps['title']` (tipi verilmemiş, ancak gövdeden bir string olduğu anlaşılmaktadır) — Grafiğin başlığı. Belirtilmezse veya boşsa, `t('admin.dashboard.abcProductClassification')` ile alınan varsayılan metin kullanılır.

**Dönüş**: Bileşen, bir React bileşeni olarak JSX döndürür. Dönüş tipi kodda açıkça belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../AdminEmptyState::AdminEmptyState
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::PieChart
- import: recharts::Cell
- import: recharts::Legend
- import: recharts::Pie
- import: recharts::PieChart
- import: recharts::ResponsiveContainer
- import: recharts::Tooltip

---

## INTERFACES

### AbcPieChartProps
- `data: Array<{ name: string; value: number; color: string }>`
- `title?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/dashboard/AbcPieChart.tsx::AbcPieChart
- **params**: `data` — ABC ürün sınıflandırma veri dizisi (her elemanda `value` ve `color` alanları bulunur), `title` — grafik başlığı (opsiyonel, yoksa varsayılan çeviri anahtarı kullanılır)
- **ic_degiskenler**:
  - `t` — `useI18n()` kancasından destructure edilen çeviri fonksiyonu; metinleri yerelleştirmek için kullanılır
  - `totalValue` — `data.reduce((acc, curr) => acc + curr.value, 0)` ile hesaplanan tüm veri elemanlarının `value` alanlarının toplamı; grafik merkezinde gösterilir
  - `d` — `data.every(d => d.value === 0)` ifadesindeki her bir veri elemanı; tüm değerlerin sıfır olup olmadığını kontrol etmek için kullanılır
  - `acc` — `reduce` işlemindeki birikimli toplam değeri tutan akümülatör
  - `curr` — `reduce` işlemindeki mevcut veri elemanı; `curr.value` ile değeri toplama eklenir
  - `entry` — `data.map((entry, index) => ...)` içindeki her bir veri elemanı; `entry.color` ile hücre rengi belirlenir
  - `index` — `data.map((entry, index) => ...)` içindeki döngü indeksi; `key={`cell-${index}`}` olarak Cell bileşenine atanır
  - `value` — Tooltip `formatter` fonksiyonunda ürün sayısını temsil eden sayısal değer; Legend `formatter` fonksiyonunda ise sınıf adını temsil eden metin
  - `name` — Tooltip `formatter` fonksiyonunda ürün sınıfı adını temsil eden metin
- **Dönüş**: JSX elementi — veri yoksa veya tüm değerler sıfırsa `AdminEmptyState` içeren boş durum kartı; aksi halde `ResponsiveContainer` içinde `PieChart` (donut grafik) ve merkezde toplam stok gösteren bileşen döndürür

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
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-surface-2`, `border-admin-border`, `group-hover/pie:text-admin-accent`, `text-4xl`, `text-admin-fg`, `text-admin-fg-muted`, `text-xs`
- **Layout:** `absolute`, `drop-shadow-pie-chart-glow`, `flex`, `flex-1`, `flex-col`, `group-hover/pie:w-20`, `h-0.5`, `h-full`, `items-center`, `justify-center`, `left-1/2`, `min-h-300px`, `p-10`, `relative`, `top-1/2`
- **Varyant/Responsive:** `group-hover/pie:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-mt-4`, `-translate-x-1/2`, `-translate-y-1/2`, `blur-3xl`, `border`, `cursor-pointer`, `duration-500`, `duration-700`, `font-semibold`, `group/pie`, `hover:opacity-80`, `inset-0`, `italic`, `mb-10`, `ml-1`