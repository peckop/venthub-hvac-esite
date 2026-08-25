---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\admin\data-table\FacetedFilter.tsx
skeleton_hash: acaab1978f17b5cf
entity_hashes:
  func:FacetedFilter: 49c4b53ab33910e8
  overview: d3bf186543b0d057
  style_tokens: 0c0078156433b2eb
generated_at: 2026-08-25T07:24:54Z
---

## Genel Bakış

FacetedFilter, admin veri tablosu bileşenleri arasında yer alan ve çoklu değerli filtreleme (facet-based filtering) işlevi sunan bir React bileşenidir. Belirli bir facet (özellik/kategori) için seçili değerleri yönetir ve kullanıcı seçimlerinde dışarıya bildirimde bulunur. `clearLabel` prop'u aracılığıyla temizleme butonunun metni özelleştirilebilir.

## Fonksiyon Grupları

### Filtre Bileşeni

Verilen bir facet tanımına göre filtre arayüzünü oluşturur, kullanıcının birden fazla değer seçmesine olanak tanır ve seçim değişikliklerini `onChange` geri çağırımıyla dışarı bildirir. `selected` prop'u ile mevcut seçili durumu alır; `clearLabel` ile temizleme eyleminin etiketini belirler.

- FacetedFilter

---

## AXIOMS – Mimari Varsayımlar

Fonksiyon gövdesi verilmediğinden, yalnızca fonksiyon imzasından çıkarılabilecek varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `facet` prop'u sağlanmazsa, bileşenin hangi filtre seçeneklerini göstereceği bilinmiyor; fonksiyon gövdesi görülmediğinden hata verip vermeyeceği belirlenemez.

[Aksiyom 2]: Eğer `onChange` prop'u sağlanmazsa, kullanıcı bir filtre seçimi yaptığında bileşenin bu değişikliği üst bileşene nasıl bildireceği bilinmiyor.

[Aksiyom 3]: Eğer `selected` prop'u sağlanmazsa, bileşenin hangi filtre değerlerinin seçili olduğunu nasıl belirleyeceği bilinmiyor.

[Aksiyom 4]: Eğer `clearLabel` prop'u sağlanmazsa, temizleme işleminde kullanıcıya gösterilecek metnin ne olacağı bilinmiyor.

**Not:** Bu bileşenin iç çalışma mantığı, hata yönetimi, render davranışı ve alt bileşen kullanımı hakkında kesin bilgi verilemez çünkü fonksiyon gövdesi sağlanmamıştır. Yukarıdaki varsayımlar yalnızca prop imzasından çıkarılan minimum gereksinimlerdir.

---

## FONKSİYON DETAYLARI

### FacetedFilter

**Ne yapar**: Çoklu seçimli (faceted) bir filtre bileşeni oluşturur. Kullanıcının bir popover (açılır pencere) içindeki seçenekler listesinden birden fazla değer seçip kaldırmasına olanak tanır. Seçili öğe sayısı bir badge ile gösterilir ve tüm seçimleri temizleme işlevi sunar.

**Nasıl yapar**: Radix UI `Popover` bileşenlerini (`Popover.Root`, `Popover.Trigger`, `Popover.Portal`, `Popover.Content`) kullanarak bir tetikleyici buton ve açılır içerik oluşturur. İç mantıkta tanımlanan `toggle` fonksiyonu, `selected` dizisi içinde verilen değer varsa onu çıkarır (`filter` ile), yoksa diziye ekler (`spread` ile). Her `facet.options` elemanı için bir buton render edilir; bu butonlar `selected.includes(option.value)` kontrolüyle seçili durumu belirler ve `aria-pressed` özniteliğiyle erişilebilirlik sağlar. Seçili durumda bir onay ikonu (`Check`) ve renk değişimi gösterilir. Seçili öğe sayısı sıfırdan büyükse, tetikleyici buton üzerinde bir sayı badge'i ve içerik altında tüm seçimleri temizleyen bir buton (`clearLabel` etiketli, `onChange([])` çağıran) görüntülenir.

**Parametreler**:
- `facet`: FacetedFilterProps'tan gelen nesne — Filtrenin etiketini (`label`) ve mevcut seçenekler listesini (`options`) içerir. Her seçenek bir `value`, `label` ve `count` alanına sahiptir.
- `selected`: FacetedFilterProps'tan gelen dizi — Şu anda seçili olan değerlerin listesidir.
- `onChange`: FacetedFilterProps'tan gelen fonksiyon — Seçili değerler listesi değiştiğinde çağrılır; yeni seçili değerler dizisini parametre olarak alır.
- `clearLabel`: FacetedFilterProps'tan gelen string — Tüm seçimleri temizleme butonunda görünen metin ve `aria-label` değeri olarak kullanılır.

**Dönüş**: `ReactNode` — Radix UI Popover yapısıyla oluşturulmuş, tetikleyici buton ve açılır filtre içeriğinden oluşan bir React bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminButtonSecondaryClass
- import: ./types::type { DataTableFacet }
- import: @radix-ui/react-popover
- import: lucide-react::Check
- import: lucide-react::Filter
- import: lucide-react::X
- import: react::type { ReactNode }

---

## INTERFACES

### FacetedFilterProps
- `facet: DataTableFacet`
- `selected: string[]`
- `onChange: (next: string[]) => void`
- `clearLabel: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/data-table/FacetedFilter.tsx::FacetedFilter
- **params**: `facet` (DataTableFacet tipinde, filtre seçeneklerini içerir), `selected` (string dizisi, seçili değerler), `onChange` (fonksiyon, seçili değerler değiştiğinde çağrılır), `clearLabel` (string, temizleme butonu etiketi)
- **ic_degiskenler**:
  - `toggle` — aldığı `value` string parametresini `selected` dizisinde kontrol eder; varsa `selected.filter((v) => v !== value)` ile çıkarır, yoksa `[...selected, value]` ile ekler ve `onChange` çağırır
  - `checked` — `.map()` callback içinde her `option` için `selected.includes(option.value)` sonucunu tutar; butonun stil sınıfını ve `aria-pressed` niteliğini belirler
- **Dönüş**: ReactNode (Popover.Root ile sarmalanmış JSX ağacı)

### [N2_NASIL] AST Pointer: src/components/admin/data-table/FacetedFilter.tsx::toggle
- **params**: `value` (string, eklenip çıkarılacak değer)
- **ic_degiskenler**:
  - `selected` — üst kapsamdan yakalanan closure değişkeni; `includes` ile `value` içeriyor mu kontrol edilir
  - `v` — `filter` callback parametresi; `value` ile eşit olmayan elemanları tutar
- **Dönüş**: yok (void — yan etki olarak `onChange` çağırır)

### [N3_NASIL] AST Pointer: src/components/admin/data-table/FacetedFilter.tsx::option_map_callback
- **params**: `option` (facet.options dizisinin tek elemanı; `.value`, `.label`, `.count` alanlarına sahip)
- **ic_degiskenler**:
  - `checked` — `selected.includes(option.value)` sonucu; butonun renk sınıfını (`text-admin-accent` / `text-admin-fg`), onay kutusunun arka planını ve `Check` ikonunun görünürlüğünü kontrol eder
  - `option.value` — butonun `key` niteliği ve `toggle` çağrısına argüman olarak kullanılır
  - `option.label` — butonun `aria-label` niteliği ve metin içeriği olarak kullanılır
  - `option.count` — sağ taraftaki sayaç baloncuğunda görüntülenen sayı
- **Dönüş**: JSX element (tek bir `button` öğesi)

---

## NODE ID STANDARD

  file: FacetedFilter.tsx
  function: FacetedFilter.tsx::FacetedFilter

---

## DISA AKTARILANLAR (EXPORTS)
  export: FacetedFilter
  export: FacetedFilterProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-surface`, `bg-admin-surface-2`, `border-admin-accent`, `border-admin-border`, `border-b`, `group-hover:bg-admin-surface-3`, `hover:bg-admin-surface-2`, `hover:text-admin-fg`, `stroke-4`, `text-admin-accent`, `text-admin-accent-fg`, `text-admin-fg`, `text-admin-fg-muted`, `text-xs`
- **Layout:** `custom-scrollbar`, `flex`, `gap-2`, `gap-3`, `h-12`, `h-4`, `h-5`, `h-px`, `inline-flex`, `items-center`, `justify-between`, `justify-center`, `max-h-300px`, `min-w-240px`, `min-w-5`
- **Varyant/Responsive:** `:`, `focus-visible:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${checked`, `:`, `animate-in`, `border`, `cursor-pointer`, `duration-200`, `fade-in`, `focus-visible:ring-2`, `focus-visible:ring-admin-accent/30`, `focus-visible:ring-admin-border`, `font-semibold`, `group`, `mb-2`, `my-3`, `outline-none`