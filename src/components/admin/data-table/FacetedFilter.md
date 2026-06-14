---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\data-table\FacetedFilter.tsx
skeleton_hash: 9fff6e6e5122a218
entity_hashes:
  func:FacetedFilter: 03176f4a9f27a70c
  overview: d3bf186543b0d057
  style_tokens: 66a24146db2b557f
generated_at: 2026-06-13T15:00:58Z
---

## Genel Bakış
FacetedFilter, Admin panelindeki veri tablolarında kullanılan çok boyutlu (çoklu seçim) filtreleme bileşenidir. Kullanıcının belirli bir faceted (yüzey/boyut) kategori için birden fazla seçenek seçip seçimsizleştirmesini sağlar; ayrıca tüm seçimleri temizleyen bir "clear" butonu sunar.

## Fonksiyon Grupları
### Filtre Seçenekleri Yönetimi
Bir faceted filtrenin başlığını, mevcut seçeneklerini, her seçenek için seçili durum sayısını ve toplam sayıyı hesaplayarak filtre panelini oluşturur. Seçeneklerin tıklanmasıyla seçili/kaldırma durumlarını `onChange` aracılığıyla üst bileşene iletir.
- FacetedFilter

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmemiştir; yalnızca fonksiyon imzasına dayalı minimum mimari varsayımlar tanımlanabilir.

[Aksiyom 1]: Eğer `facet` parametresi `undefined` veya `null` olarak iletilirse, bileşen filtreleme seçeneklerini.render edemez (props tipi `FacetedFilterProps` olarak tanımlı olmasına rağmen, gövde içeriği bilinmediğinden `facet` yapısının içeriği bilinmiyor).

[Aksiyom 2]: Eğer `selected` parametresi (`FacetedFilterProps.selected`) geçerli bir değerler kümesi/objesi olarak sağlanmazsa, bileşen hangi filtrelerin aktif olduğunu bilemez ve durum göstergesi (ör. işaretli checkbox) hatalı render edilir.

[Aksiyom 3]: Eğer `onChange` callback fonksiyonu (`(value: ...) => void`) olarak sağlanmazsa, kullanıcı bir filtre seçtiğinde/çıkardığında üst bileşene bildirim gönderilemez ve filtre seçimi değişmez.

[Aksiyom 4]: Eğer `clearLabel` parametresi sağlanmazsa (default değer belirtilmemiştir — `clearLabel` imza içinde default değer olarak gelmemektedir), "temizle" butonu için kullanılacak metin bilinmiyor; bileşen bu但onu `undefined` label ile render edebilir.

---

**Notlar:**
- Fonksiyon gövdesi verilmediğinden, bileşenin iç mantığı (hangi HTML elemanlarını render ettiği, hangi event handler'ları bağladığı) **bilinmiyor**.
- `FacetedFilterProps` tip tanımı kaynakta verilmediğinden, `facet` ve `selected`'ın iç yapısı **bilinmiyor**.
- Modül sabitleri (sabit eşik değerleri, sabit listeler vb.) belirtilmemiştir.

---

## FONKSİYON DETAYLARI

### FacetedFilter
**Ne yapar**: Bir facet (örneğin kategori, marka, durum) filtreleme arayüzü sunar; kullanıcının belirli bir facet grubu için birden fazla seçeneği aynı anda açıp kapatmasına olanak tanır. Filtreleme durumu üst bileşen tarafından kontrol edilir.

**Nasıl yapar**: Fonksiyon, bir `Popover` (açılır kutu) içinde filtreleme seçeneklerini listeler. Her bir seçenek bir toggle butonu olarak çalışır: seçenek zaten seçiliyse listeden kaldırılır, değilse listeye eklenir. Bu durum `onChange` callback'i aracılığıyla üst bileşene bildirilir. Seçeneklerin her biri için bir checkbox görseli (`Check` ikonu ile) ve seçenek sayısını (`count`) gösteren bir rozet oluşturulur. Seçili seçenek sayısı, tetikleyici buton üzerinde bir rozet olarak görüntülenir. Seçili filtre varsa, filtreleri temizleme butonu (`X` ikonu ile) görünür hale gelir. `Popover.Root`, `Popover.Trigger`, `Popover.Portal` ve `Popover.Content` bileşenleri, erişilebilirlik ve portal tabanlı konumlandırma için Radix UI Popover bileşenlerini kullanır.

**Parametreler**:
- facet: `{ label: string; options: { value: string; label: string; count: number }[] }` — Filtrelenecek facet grubunun tanımı. `label`, filtre grubunun başlığını; `options` ise içindeki seçeneklerin (değer, etiket, sayı) dizisini tutar.
- selected: `string[]` — Üst bileşen tarafından yönetilen, o facet grubu için halihazırda seçili olan seçenek değerlerinin dizisi.
- onChange: `(selected: string[]) => void` — Seçili seçenekler dizisi güncellendiğinde çağrılan callback fonksiyonu. Yeni seçili değerler dizisini parametre olarak alır.
- clearLabel: `string` — Filtreleri temizleme butonunda görüntülenecek metin (ör. "Temizle", "Tümünü kaldır").

**Dönüş**: `ReactNode` — Bileşen, Radix UI Popover içinde filtreleme arayüzünü oluşturan React JSX elemanlarını döndürür.

---

## INTERFACES

### FacetedFilterProps
- `facet: DataTableFacet`
- `selected: string[]`
- `onChange: (next: string[]) => void`
- `clearLabel: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/components/admin/data-table/FacetedFilter.tsx::FacetedFilter`
- **params**:
  - `facet` — `DataTableFacet` tipinde nesne; `.label` filtre başlığını, `.options` filtre seçeneklerini (value, label, count) içerir
  - `selected` — `string[]` tipinde dizi; şu an seçili olan filtre değerlerini tutar
  - `onChange` — `(values: string[]) => void` callback fonksiyonu; seçili değerler güncellendiğinde çağrılır
  - `clearLabel` — `string`; temizle butonunun gösterilecek metin etiketidir
- **ic_degiskenler**:
  - `toggle` — inner arrow function `(value: string) => void`; bir değerin seçili diziden eklenmesini veya çıkarılmasını sağlar. `selected` dizisini `includes` ile kontrol eder, varsa `filter` ile kaldırır, yoksa spread ile ekler; her durumda `onChange`'i çağırır
  - `checked` — `boolean`; `map` iterasyonu içinde her `option` için hesaplanır; `selected.includes(option.value)` sonucu, ilgili seçeneğin işaretli (checkbox) olup olmadığını belirler
- **Dönüş**: `ReactNode` — Radix UI `Popover` bileşeniyle sarılmış JSX; tetikleyici buton, filtre seçenek listesi ve (seçim varsa) temizle butonunu içeren popup filtre arayüzü render eder

---

## NODE ID STANDARD

  file: src\components\admin\data-table\FacetedFilter.tsx
  function: src\components\admin\data-table\FacetedFilter.tsx::FacetedFilter

---

## DISA AKTARILANLAR (EXPORTS)
  export: FacetedFilter
  export: FacetedFilterProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `shadow-glow-sm`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-white/5`, `border-b`, `border-cyan-400`, `border-white/10`, `border-white/5`, `group-hover:bg-white/10`, `hover:bg-white/5`, `hover:text-white`, `stroke-4`, `text-cyan-400`, `text-slate-300`, `text-slate-400`, `text-slate-500`, `text-surface-deep`
- **Layout:** `custom-scrollbar`, `flex`, `gap-2`, `gap-3`, `h-12`, `h-4`, `h-5`, `h-px`, `inline-flex`, `items-center`, `justify-between`, `justify-center`, `max-h-300px`, `min-w-240px`, `min-w-5`
- **Varyant/Responsive:** `:`, `focus-visible:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${checked`, `:`, `animate-in`, `border`, `cursor-pointer`, `duration-200`, `fade-in`, `focus-visible:ring-2`, `focus-visible:ring-cyan-400/40`, `focus-visible:ring-white/10`, `font-black`, `font-bold`, `glass-strong`, `group`, `mb-2`