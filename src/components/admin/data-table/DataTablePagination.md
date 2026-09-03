---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-scrubber\src\components\admin\data-table\DataTablePagination.tsx
skeleton_hash: 5265a4a576032a79
entity_hashes:
  func:DataTablePagination: c8e912b4df860174
  overview: e792b3a403037aca
  style_tokens: 7ccdec5abbb098cb
generated_at: 2026-09-03T12:32:56Z
---

## Genel Bakış
`DataTablePagination` modülü, yönetici paneli veri tablosu bileşeninin sayfalama işlevini sunan bir React bileşenidir. `DataTablePaginationProps` yapılandırmasını alarak sayfa navigasyonunu yönetir.

## Fonksiyon Grupları
### Sayfalama İşlevi
Tablo sayfasının kontrollerini ve dolaşılmasını sağlayan bileşen.
- DataTablePagination

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### DataTablePagination

**Ne yapar**: Veri tablosunun altında yer alan sayfalama denetimlerini işler — önceki sayfa, mevcut sayfa bilgisi ve sonraki sayfa butonlarını sunar.

**Nasıl yapar**: `pageCount` değeri 1'den küçük veya eşitse hiçbir şey göstermez (null döner), çünkü tek sayfa için denetimler işlevsizdir ve bilgisiz gürültü yapar. Aksi durumda, bir div içinde üç element oluşturur: önceki sayfaya gitmek için bir buton (ChevronRight ikonu 180° döndürülmüş), mevcut sayfanın konumunu gösteren bir etiket (renderPageLabel verilmişse custom metin, aksi takdirde "sayfa / pageCount" formatı), ve sonraki sayfaya gitmek için bir buton (ChevronRight ikonu normal yönde). Butonlar, sayfa sınırlarına ulaşıldığında disabled hale getirilir — önceki buton page <= 1 olduğunda, sonraki buton page >= pageCount olduğunda. Stil olarak admin-surface, admin-border, ve admin-fg-muted token'larını kullanır; disabled durumunda opacity düşürülür ve imleç "not-allowed" gösterilir.

**Parametreler**:
- page: number — mevcut sayfa numarası
- pageCount: number — toplam sayfa sayısı
- setPage: (page: number) => void — sayfayı değiştirmek için callback fonksiyonu
- previousLabel: string — önceki buton erişilebilirlik etiketi (aria-label)
- nextLabel: string — sonraki buton erişilebilirlik etiketi (aria-label)
- renderPageLabel: ((page: number, pageCount: number) => ReactNode) | undefined — sayfa etiketi metnini özelleştirmek için optional render fonksiyonu

**Dönüş**: ReactNode — pageCount 1'den küçük veya eşitse null; aksi takdirde sayfalama denetim öğelerini içeren JSX elemanı.

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

### [N1_NASIL] AST Pointer: DataTablePagination.tsx::DataTablePagination
- **params**: `props: DataTablePaginationProps`
- **ic_degiskenler**:
  - `page` — mevcut sayfa numarası, önceki/sonraki düğmelerde yeni sayfa numarasını hesaplamada ve sayfa etiketinde kullanılır
  - `pageCount` — toplam sayfa sayısı, denetim gösterilip gösterilmemesine karar verir ve sonraki düğmesinin disabled durumunu belirler
  - `setPage` — sayfa numarasını güncelleme fonksiyonu, her iki navigasyon düğmesinin tıklama handler'larında çağrılır
  - `previousLabel` — önceki düğmesinin aria-label değeri
  - `nextLabel` — sonraki düğmesinin aria-label değeri
  - `renderPageLabel` — sayfa etiketini render etme fonksiyonu, varsa `renderPageLabel(page, pageCount)` çağrılır; yoksa `${page} / ${pageCount}` metin gösterilir
- **Dönüş**: `ReactNode` — pageCount 1'den büyükse önceki/sonraki düğmeleriyle sayfa gösterisini içeren JSX div'i döner; pageCount 1 veya daha azsa null döner (denetim gösterilmez)

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