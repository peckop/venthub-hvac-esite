---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\dashboard\AbcPieChart.tsx
skeleton_hash: 86396a9f281a2c0f
entity_hashes:
  func:AbcPieChart: cde258b4cc2386ed
  overview: 64d9c987fb2a5f21
  style_tokens: 5302d85fc9a1582c
generated_at: 2026-08-27T08:07:59Z
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
**Ne yapar**: ABC ürün sınıflandırmasına ait verileri pasta grafik (pie chart) olarak görselleştiren bir React bileşenidir. Veri yoksa veya tüm değerler sıfırsa boş durum ekranı gösterir; aksi halde etkileşimli bir pasta grafik oluşturur ve merkezinde toplam stok miktarını görüntüler.

**Nasıl yapar**: Bileşen, `useI18n()` hook'u aracılığıyla uluslararasılaştırma fonksiyonu `t`'yi alır. İlk olarak `data` prop'unu kontrol eder: veri yoksa, dizi uzunluğu sıfırsa ya da tüm elemanların `value` değeri sıfırsa, `AdminEmptyState` bileşenini içeren bir boş durum kartı döndürür. Veri mevcutsa, `data` dizisindeki tüm `value` değerlerini `reduce` ile toplayarak `totalValue` hesaplar. Ardından Recharts kütüphanesinin `ResponsiveContainer`, `PieChart`, `Pie`, `Cell`, `Tooltip` ve `Legend` bileşenlerini kullanarak responsive bir pasta grafik oluşturur. Pasta dilimleri `data` dizisindeki her elemanın `color` özelliğine göre renklendirilir; her hücre (`Cell`) hover'da opaklık geçişi ve tıklanabilirlik efektlerine sahiptir. Tooltip, ürün sayısı ve sınıf bilgisini uluslararasılaştırılmış biçimde gösterir. Grafik merkezinde, bulanık arka plan efektli (`blur-3xl`) bir katman üzerinde toplam stok sayısı ve "toplam stok" etiketi yer alır. Başlık olarak `title` prop'u kullanılır; belirtilmemişse uluslararasılaştırılmış varsayılan metin (`admin.dashboard.abcProductClassification`) görüntülenir.

**Parametreler**:
- data: AbcPieChartProps['data'] — Her elemanı `value` (sayısal) ve `color` (renk kodu) özelliklerini içeren bir dizi. Pasta grafik dilimlerinin değerlerini ve renklerini belirler.
- title: AbcPieChartProps['title'] — Bileşenin üst kısmında gösterilecek başlık metni. Belirtilmezse varsayılan uluslararasılaştırılmış metin kullanılır.

**Dönüş**: JSX elementi döndürür. Veri yoksa veya tüm değerler sıfırsa boş durum kartı, aksi halde pasta grafik içeren bir bileşen ağacı döndürür. Kesin dönüş tipi kaynakta belirtilmemiştir.

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
- **params**: `data` — ABC sınıflandırma veri dizisi; her elemanda `value` (sayı) ve `color` (renk) alanları bulunur; `title` — grafik başlığı, verilmezse varsayılan çeviri anahtarı kullanılır
- **ic_degiskenler**:
  - `t` — `useI18n()` kancasından destructure edilen çeviri fonksiyonu; metinleri yerelleştirmek için kullanılır
  - `data.length` — veri dizisinin uzunluğu; boş veri kontrolünde `=== 0` ile karşılaştırılır
  - `d` — `data.every()` callback parametresi; her elemanın `d.value` değeri `0` ile eşit mi diye kontrol edilir
  - `totalValue` — `data.reduce()` ile hesaplanan toplam stok miktarı; `acc` birikimli toplam, `curr` mevcut eleman, her elemanın `curr.value` değeri toplanır; grafik merkezinde gösterilir
  - `entry` — `data.map()` callback parametresi; her dilim verisini temsil eder, `entry.color` ile dilim rengi belirlenir
  - `index` — `data.map()` callback parametresi; her dilim için benzersiz key üretmek amacıyla `cell-${index}` formatında kullanılır
  - `value` — Tooltip `formatter` fonksiyonunun ilk parametresi (sayı tipinde); ürün sayısını temsil eder, `t('admin.dashboard.productCount', { count: value })` ile çevrilir
  - `name` — Tooltip `formatter` fonksiyonunun ikinci parametresi (string tipinde); ürün sınıfını temsil eder, `t('admin.dashboard.productClass', { name })` ile çevrilir
  - `value` — Legend `formatter` fonksiyonunun parametresi; legend etiketi metnini temsil eder, `<span>` içinde render edilir
  - `PieIcon` — `lucide-react` kütüphanesinden import edilen ikon; boş durumda `AdminEmptyState` bileşeninin `icon` prop'una aktarılır
  - `AdminEmptyState` — boş durum bileşeni; veri yoksa veya tüm değerler sıfırsa `icon`, `title`, `description` ve `compact` prop'ları ile render edilir
  - `ResponsiveContainer` — recharts bileşeni; `%100` genişlik ve yükseklik ile grafik konteynerini responsive yapar
  - `PieChart` — recharts pasta grafik konteyneri
  - `Pie` — recharts pasta dilim bileşeni; `data`, `cx`, `cy`, `innerRadius` (70), `outerRadius` (95), `paddingAngle` (5), `dataKey` ("value"), `stroke` ("#0A0F1E"), `strokeWidth` (6), `animationBegin` (0), `animationDuration` (1500) prop'ları ile yapılandırılır
  - `Cell` — recharts hücre bileşeni; her dilim için `key`, `fill` (entry.color) ve className prop'ları ile render edilir
  - `Tooltip` — recharts araç ipucu bileşeni; `contentStyle` (yuvarlak köşeler, blur arka plan, gölge), `itemStyle` (yazı tipi ayarları) ve `formatter` prop'ları ile yapılandırılır
  - `Legend` — recharts legend bileşeni; `verticalAlign` ("bottom"), `align` ("center"), `height` (40), `iconType` ("circle"), `iconSize` (8) ve `formatter` prop'ları ile yapılandırılır
- **Dönüş**: JSX elementi — veri yoksa boş durum kartı, varsa pasta grafik ve merkezde toplam stok gösteren bileşen ağacı döndürür

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