---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\data-table\DataTableHead.tsx
skeleton_hash: 9dc0b8198ab4243a
entity_hashes:
  func:DataTableHead: 6c9fd15265777c11
  overview: 8a2e4ee22e36046d
  style_tokens: f757e445b6e3cc07
generated_at: 2026-06-13T14:59:47Z
---

## Genel Bakış

Bu modül, veri tablolarının başlık (header) kısmını oluşturan bir React bileşenidir. Bileşen, tablonun sütun yapısını ve sıralama durumunu yöneterek kullanıcıya verilerin organizedsunulmasını sağlar.

## Fonksiyon Grupları

### Tablo Başlık Bileşeni
Tabloların sütun başlıklarını oluşturarak sıralama işlevselliğini entegre eden temel UI bileşenini yönetir.
- DataTableHead, props aracılığıyla sütun tanımlarını ve sıralama parametrelerini alarak uygun başlık yapısını oluşturur.

### Dinamik Bağımlılık Yönetimi
Bileşenin gerektirdiği dış kütüphaneleri ve yardımcı bileşenleri koşullara göre yükleyerek performans optimizasyonu sağlar.
- Bileşen, sadece ihtiyaç duyulan dış bileşenleri ve yardımcı fonksiyonları dinamik olarak içe aktarır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi paylaşılmadığından, mimari varsayımlar yalnızca fonksiyon imzasından çıkarılabilecek minimum düzeydedir. Fonksiyon gövdesi detayları sunulduğunda aksiyomlar güncellenebilir.

**[Aksiyom 1]:** Eğer `DataTableHeadProps<T>` prop'su (`props`) olarak iletilmezse veya `undefined`/`null` olarak iletilirse, bileşen_render_sürecinde_beklenmeyen_durum_oluşur (bileşen hata fırlatabilir veya boş/bozuk bir tablo başlığı render eder).

**[Aksiyom 2]:** Eğer `T` generic tip parametresi tablo verisi ile tutarsız bir tipte tanımlanırsa, TypeScript derleme_aşamasında_tip_hatası_oluşur; çalışma zamanında ise sütun tanımları ile gerçek veri yapısı uyuşmazlık gösterir.

---

> **Not:** Detaylı aksiyom üretimi için `DataTableHead` fonksiyonunun gövdesi (function body) paylaşılmalıdır. Mevcut bilgiler yalnızca fonksiyon imzasından ibarettir.

---

## FONKSİYON DETAYLARI

### DataTableHead
**Ne yapar**: Veri tablosunun başlık satırını (`<thead>`) oluşturur. Sütun başlıklarını, sıralama durumunu, seçilebilir (checkbox) ve genişletilebilir özelliklerini yöneterek erişilebilir ve interaktif bir tablo başlığı render eder. Generik bir yapıya (`<T>`) sahiptir, böylece farklı veri türleriyle çalışabilir.

**Nasıl yapar**: Fonksiyon, `props`'tan gelen değerleri destructuring ile çıkararak başlar. `compact` prop'una göre hücre içi boşlukları (padding) dinamik olarak ayarlar. `selectable` prop'u `true` ise, tüm satırları seçmek için bir onay kutusu içeren ekstra bir sütun ekler. `expandable` prop'u `true` ise, satır genişletme butonu için boş bir sütun ekler. Ardından, `columns` dizisini iterasyona alır; ancak sadece `visibleKeys` kümesinde bulunan sütunları render eder. Her sütun için, sütunun sıralanabilir olup olmadığına ve aktif sıralama durumuna bağlı olarak `aria-sort` özniteliğini (değerleri: `'ascending'`, `'descending'`, `'none'` veya `undefined`) hesaplar. Sütun metin hizalamasına (`left`, `center`, `right`) göre uygun CSS sınıfını atar. Sütun sıralanabilir ise, bir `<button>` içinde başlık metnini ve sıralama yönünü belirten bir ok simgesi ile render eder; sıralanabilir değilse başlık metnini düz metin olarak render eder.

**Parametreler**:
- `props`: `DataTableHeadProps<T>` — Tablo başlığının tüm yapılandırma ve durum değerlerini içeren genel (generic) bir nesne. Bu nesnenin beklenen alanları aşağıdadır:
    - `columns`: `Column<T>[]` — Tanımlı tüm sütunların dizisi. Her bir sütun nesnesi `key`, `header`, `sortable`, `align`, `headerClassName` gibi özellikler içerir.
    - `visibleKeys`: `Set<string>` — Kullanıcı tarafından görünür olarak ayarlanmış sütun anahtarlarının kümesi. Sadece bu kümede anahtarı bulunan sütunlar render edilir.
    - `sort`: `{ key: string; dir: 'asc' | 'desc' } | null | undefined` — Aktif sıralamanın durumu. `key` sıralanan sütunun anahtarını, `dir` ise sıralama yönünü (`'asc'` artan veya `'desc'` azalan) belirtir.
    - `onToggleSort`: `(key: string) => void` — Bir sütun başlığına tıklandığında çağrılan geri çağırım (callback) fonksiyonu. İlgili sütunun sıralama durumunu tersine çevirir veya aktif sıralamayı ayarlar.
    - `selectable`: `boolean` — Tabloda toplu seçim (tümünü seç/kaldır) için bir checkbox sütunu gösterilip gösterilmeyeceğini belirtir.
    - `allSelected`: `boolean` — Mevcut tüm görünür satırların seçili olup olmadığını belirtir. Checkbox'ın `checked` durumunu kontrol eder.
    - `onToggleAll`: `() => void` — "Tümünü Seç/Kaldır" checkbox'ına tıklandığında çağrılan geri çağırım fonksiyonu.
    - `expandable`: `boolean` — Her satır için bir genişletme/daraltma butonu gösterilip gösterilmeyeceğini belirtir.
    - `selectAllLabel`: `string` — "Tümünü Seç" checkbox'ı için `aria-label` erişilebilirlik özniteliğinde kullanılacak metin.
    - `compact`: `boolean` — Kompakt (sıkışık) bir görünüm için hücre içi boşlukları küçültülüp küçültülmeyeceğini belirtir.

**Dönüş**: `ReactNode` — Bu bileşen, `<thead>` etiketi içinde bir `<tr>` satırını ve içindeki tüm başlık hücrelerini (`<th>`) içeren bir React düğümü (node) döndürür. Döndürülen yapı, bir HTML tablosunun başlık bölümünü temsil eder.

---

## INTERFACES

### DataTableHeadProps
- `columns: AdminColumn<T>[]`
- `visibleKeys: Set<string>`
- `sort: SortState | null`
- `onToggleSort: (key: string) => void`
- `selectable: boolean`
- `allSelected: boolean`
- `onToggleAll: () => void`
- `expandable: boolean`
- `selectAllLabel: string`
- `compact: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/data-table/DataTableHead.tsx::DataTableHead
- **params**: (props: DataTableHeadProps<T>)
- **ic_degiskenler**:
  - `props` — bileşenin girdilerini tutar, yıkılarak (destructure) içeriğine erişilir
  - `columns` — tablonun sütun tanımlarını içeren dizi, props'tan yıkılarak elde edilir
  - `visibleKeys` — görünür sütun anahtarlarını tutan Set, props'tan yıkılarak elde edilir ve sütunların gösterilip gösterilmeyeceğini belirler
  - `sort` — mevcut sıralama durumunu (anahtar ve yön) tutan nesne veya null, props'tan yıkılarak elde edilir
  - `onToggleSort` — bir sütuna göre sıralamayı değiştirmek için kullanılan geri çağırma fonksiyonu, props'tan yıkılarak elde edilir
  - `selectable` — satırların seçilebilir olup olmadığını belirten boolean, props'tan yıkılarak elde edilir
  - `allSelected` — tüm satırların seçili olup olmadığını belirten boolean, props'tan yıkılarak elde edilir
  - `onToggleAll` — tüm satırların seçimini değiştirmek için kullanılan geri çağırma fonksiyonu, props'tan yıkılarak elde edilir
  - `expandable` — satırların genişletilebilir olup olmadığını belirten boolean, props'tan yıkılarak elde edilir
  - `selectAllLabel` — tümünü seç onay kutusunun erişilebilirlik etiketi olarak kullanılan string, props'tan yıkılarak elde edilir
  - `compact` — sıkışık dolgu (padding) kullanılıp kullanılmayacağını belirten boolean, props'tan yıkılarak elde edilir
  - `pad` — compact durumuna göre ayarlanan dolgu sınıfı (string), JSX içinde sınıflarda kullanılır
- **Dönüş**: ReactNode (JSX ile tablo başlık satırını render eder)

---

## NODE ID STANDARD

  file: src\components\admin\data-table\DataTableHead.tsx
  function: src\components\admin\data-table\DataTableHead.tsx::DataTableHead

---

## DISA AKTARILANLAR (EXPORTS)
  export: DataTableHead

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white/5`, `border-white/10`, `hover:text-cyan-400`, `text-center`, `text-cyan-400`, `text-cyan-400/50`
- **Layout:** `flex-row-reverse`, `gap-2`, `h-4`, `inline-flex`, `items-center`, `w-10`, `w-4`, `w-8`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminTableHeadCellClass`, `${alignClass`, `${col.headerClassName`, `${pad`, `:`, `===`, `col.align`, `focus-visible:ring-cyan-400/30`, `focus-visible:ring-offset-0`, `glass-strong`, `right`, `rounded-md`, `tracking-widest`, `transition-colors`