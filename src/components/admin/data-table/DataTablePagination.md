---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t137\src\components\admin\data-table\DataTablePagination.tsx
skeleton_hash: 2d8110771d7b8225
entity_hashes:
  func:DataTablePagination: 1bc1ecc9b76e1cba
  overview: e792b3a403037aca
  style_tokens: 7ccdec5abbb098cb
generated_at: 2026-08-26T18:40:17Z
---

## Genel Bakış
Bu modül, admin panelindeki veri tabloları için sayfalama (pagination) arayüzünü sunan bir React bileşenidir. `DataTablePaginationProps` tipindeki özellikleri alarak sayfa geçiş kontrollerini render eder. Modül, `admin/data-table` alt yapısının bir parçası olarak veri tablosu bileşeninin alt bölümünde konumlanır.

## Fonksiyon Grupları

### Sayfalama Bileşeni
Veri tablosunun alt kısmında görüntülenen sayfalama arayüzünü oluşturur. Kullanıcının sayfalar arasında gezinmesini sağlayan kontrolleri ve ilgili bilgileri render eder.
- DataTablePagination

## Bağımlılıklar ve Mimari Notlar

- **Dış bağımlılıklar**: React kütüphanesi (`ReactNode` dönüş tipi) ve `DataTablePaginationProps` tip tanımı (muhtemelen aynı `data-table` dizinindeki bir tipler dosyasından import edilir).
- **İç bağımlılıklar**: Tek bileşenli bir modül olduğundan iç fonksiyon çağrısı yoktur.
- **Mimari önem**: Admin panelindeki tüm veri tablolarının sayfalama davranışını standartlaştıran yeniden kullanılabilir bir sunum bileşenidir. `data-table` alt sisteminin ayrılmaz bir parçasıdır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi sağlanmadığından, bileşenin çalışma mantığına ilişkin varsayımlar çıkarılamamaktadır. Yalnızca fonksiyon imzası (`DataTablePagination(props: DataTablePaginationProps) -> ReactNode`) mevcuttur; bu da bileşenin bir React bileşeni olduğunu ve `DataTablePaginationProps` tipinde bir props nesnesi aldığını gösterir. Props yapısının detayları ve bileşenin iç davranışı bilinmemektedir.

---

## FONKSİYON DETAYLARI

### DataTablePagination
**Ne yapar**: Tablonun altında sayfalama denetimleri (önceki/sonraki butonları ve mevcut sayfa göstergesi) sunan bir React bileşenidir. Tek sayfalık veri setlerinde denetimleri göstermeyerek gereksiz arayüz kalabalığını önler. Bileşen, `docs/standards/admin-standard.md` dosyasının §3 bölümündeki "Sayfalama — altta; ~50 öğeden sonra zorunlu" kuralını uygular.

**Nasıl yapar**: Bileşen, gelen `props` nesnesinden gerekli değerleri çıkarır. Eğer toplam sayfa sayısı (`pageCount`) 1 veya daha az ise, hiçbir denetim göstermeden `null` döner. Aksi takdirde, bir kapsayıcı `div` içinde iki buton ve bir bilgi etiketi oluşturur. Sol buton, mevcut sayfayı bir azaltır ancak sayfa numarasının 1'in altına düşmesini engeller. Sağ buton, mevcut sayfayı bir artırır ancak toplam sayfa sayısını aşmasını engeller. Her iki buton da sınır değerlerde (`page <= 1` veya `page >= pageCount`) devre dışı bırakılır. Ortadaki etiket, özel bir `renderPageLabel` fonksiyonu sağlanmışsa onu kullanır, sağlanmamışsa varsayılan olarak "mevcutSayfa / toplamSayfa" biçiminde metin gösterir.

**Parametreler**:
- props: DataTablePaginationProps — Bileşenin davranışını ve görünümünü yapılandıran özellikleri içerir.
  - page: number — Mevcut aktif sayfa numarası.
  - pageCount: number — Toplam sayfa sayısı.
  - setPage: (page: number) => void — Aktif sayfa numarasını güncelleyen fonksiyon.
  - previousLabel: string — "Önceki sayfa" butonu için erişilebilirlik (aria-label) etiketi.
  - nextLabel: string — "Sonraki sayfa" butonu için erişilebilirlik (aria-label) etiketi.
  - renderPageLabel?: (page: number, pageCount: number) => ReactNode — Sayfa göstergesinin içeriğini özel olarak biçimlendirmek için kullanılan isteğe bağlı fonksiyon.

**Dönüş**: ReactNode — Sayfalama denetimlerini içeren JSX yapısı veya toplam sayfa sayısı 1'den küçükse `null`.

---

## İTHALATLAR (IMPORTS)
- import: lucide-react::ChevronRight
- import: react::type { ReactNode }

---

## INTERFACES

### DataTablePaginationProps
- `page: number`
- `pageCount: number`
- `setPage: (page: number) => void`
- `previousLabel: string`
- `nextLabel: string`
- `renderPageLabel?: (page: number, pageCount: number) => ReactNode`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\tmp\venthub-wt-t137\src\components\admin\data-table\DataTablePagination.tsx::DataTablePagination
- **params**: `props: DataTablePaginationProps`
- **ic_degiskenler**:
  - `page` — props nesnesinden ayrıştırılan mevcut sayfa numarası.
  - `pageCount` — props nesnesinden ayrıştırılan toplam sayfa sayısı.
  - `setPage` — props nesnesinden ayrıştırılan, sayfa değiştirmek için kullanılan fonksiyon.
  - `previousLabel` — props nesnesinden ayrıştırılan, "önceki" butonu için erişilebilirlik etiketi.
  - `nextLabel` — props nesnesinden ayrıştırılan, "sonraki" butonu için erişilebilirlik etiketi.
  - `renderPageLabel` — props nesnesinden ayrıştırılan, sayfa etiketini özel olarak render etmek için opsiyonel fonksiyon.
  - `ChevronRight` — lucide-react kütüphanesinden gelen ok ikonu bileşeni, butonlarda kullanılır.
- **Dönüş**: `ReactNode` — pageCount 1'den küçük veya eşitse `null`, aksi halde sayfalama arayüzünü oluşturan JSX elementi.

---

## NODE ID STANDARD

  file: src\components\admin\data-table\DataTablePagination.tsx
  function: src\components\admin\data-table\DataTablePagination.tsx::DataTablePagination

---

## DISA AKTARILANLAR (EXPORTS)
  export: DataTablePagination

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface`, `bg-admin-surface-2`, `border-admin-border`, `border-t`, `hover:text-admin-fg`, `text-admin-fg-muted`, `text-center`, `text-xs`
- **Layout:** `flex`, `flex-wrap`, `gap-2`, `h-8`, `items-center`, `justify-center`, `justify-end`, `p-4`, `w-8`
- **Varyant/Responsive:** `disabled:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `disabled:cursor-not-allowed`, `disabled:opacity-30`, `font-semibold`, `px-3`, `py-1.5`, `rotate-180`, `rounded-admin-md`, `tracking-tighter`, `transition-colors`