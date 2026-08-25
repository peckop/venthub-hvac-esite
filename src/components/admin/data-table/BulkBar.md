---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\admin\data-table\BulkBar.tsx
skeleton_hash: a458d0304b1561bd
entity_hashes:
  func:BulkBar: fc5039c1504322f5
  overview: f1148d070e7fc5c5
  style_tokens: 7264340c3de4adfc
generated_at: 2026-08-25T07:24:53Z
---

## Genel Bakış
BulkBar, bir veri tablosunda seçili öğelerin sayısını gösteren ve bu öğeler üzerinde toplu işlem gerçekleştirilmesini sağlayan bir React bileşenidir. Admin panelindeki veri tablosu arayüzünde, kullanıcı seçim yaptıktan sonra görünür hale gelen bir aksiyon çubuğu olarak çalışır.

## Fonksiyon Grupları

### Bileşen Çıktısı
Seçili öğe sayısını, seçim temizleme işlemini ve tanımlanmış toplu aksiyonları kullanıcıya sunan arayüzün oluşturulmasından sorumludur.
- BulkBar

## Bağımlılıklar

### Dış Bağımlılıklar
- React kütüphanesi (bileşenin dönüş tipi `React.ReactNode` olarak tanımlıdır)

### İç Bağımlılıklar
- Bu modül tek bir dışa aktarılan bileşenden oluştuğundan, modül içi fonksiyon çağrısı bulunmamaktadır.

### Mimari Notlar
- Bileşen, `BulkBarProps` tipi aracılığıyla dışarıdan yapılandırılır: `selectedCount` (seçili öğe sayısı), `selectedLabel` (seçim etiketi), `clearLabel` (temizleme etiketi), `actions` (toplu aksiyon listesi) ve `on` olay işleyicisi parametre olarak alınır.
- `source_path` bilgisine göre `admin/data-table` altında konumlanmıştır; bu da onun bir DataTable bileşeniyle birlikte kullanılmak üzere tasarlandığını gösterir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, davranışsal aksiyom üretilemez. Aşağıdaki varsayımlar yalnızca fonksiyon imzasından çıkarılabilir:

[Aksiyom 1]: Eğer `selectedCount` prop'u sağlanmazsa, bileşenin kaç öğe seçili olduğunu göstermesi mümkün olmaz.

[Aksiyom 2]: Eğer `actions` prop'u sağlanmazsa, toplu işlem seçeneklerinin görüntülenmesi mümkün olmaz.

[Aksiyom 3]: Eğer `toneClassMap` sabiti tanımlı değilse, bileşenin stil/tone sınıflarını eşlemesi mümkün olmaz.

---

**Not:** Fonksiyon gövdesi verilmediği için `selectedLabel`, `clearLabel` ve `on` prop'larının kullanım amacı ile `toneClassMap` sabitinin yapısı ve kullanım detayları bilinmiyor. Daha kesin aksiyomlar için fonksiyon gövdesi gereklidir.

---

## FONKSİYON DETAYLARI

### BulkBar
**Ne yapar**: Toplu seçim yapıldığında sayfanın alt kısmında yapışkan (sticky) bir aksiyon çubuğu görüntüleyen React bileşenidir. Seçili öğe sayısını, seçim etiketini, temizleme butonunu ve tanımlanmış aksiyon butonlarını kullanıcıya sunar. Hiçbir öğe seçili değilse bileşen hiçbir şey render etmez.

**Nasıl yapar**: Bileşen, `selectedCount` değeri 0 olduğunda erken dönüş yaparak null döndürür ve render sürecini sonlandırır. Aksi halde, sayfanın alt kısmına sabitlenmiş bir çubuk içinde iki ana bölüm oluşturur: sol tarafta seçili öğe sayısı (yuvarlak rozet içinde), seçim etiketi ve temizleme butonu; sağ tarafta ise `actions` dizisindeki her aksiyon için butonlar yer alır. Her aksiyon butonu için `toneClassMap` kullanılarak ton/stil sınıfı belirlenir. Aksiyonun `panel` özelliği bir fonksiyon ise, butona tıklama olayı bir panel açma/kapama mekanizması çalıştırır; bu mekanizma `openKey` state değişkeni aracılığıyla hangi panelin açık olduğunu takip eder. Panel açıldığında, bileşenin kendisini kapatma fonksiyonunu (`closePanel`) parametre olarak alan `action.panel` fonksiyonu çağrılarak panel içeriği render edilir. Panel özelliği olmayan aksiyonlarda ise doğrudan `action.onRun` fonksiyonu çağrılır. `closePanel` fonksiyonu, `setOpenKey(null)` çağırarak açık olan herhangi bir paneli kapatır.

**Parametreler**:
- `selectedCount`: number — Seçili öğelerin sayısını belirtir. Bu değer 0 olduğunda bileşen hiçbir şey render etmez.
- `selectedLabel`: string — Seçili öğelerin yanında gösterilen metin etiketidir (örneğin "öğe seçildi").
- `clearLabel`: string — Seçimi temizleme butonunda görünen metin ve aynı zamanda butonun `aria-label` erişilebilirlik özelliğidir.
- `actions`: Array<{ key: string; label: string; tone?: string; panel?: (close: () => void) => React.ReactNode; onRun?: () => void | Promise<void> }> — Çubukta gösterilecek aksiyon butonlarının tanımlarını içeren dizi. Her elemanda `key` (benzersiz tanımlayıcı), `label` (buton metni), `tone` (opsiyonel stil tonu, varsayılan 'default'), `panel` (opsiyonel, bir fonksiyon olarak tanımlanmışsa tıklamada açılır panel içeriğini üretir; kapanış fonksiyonunu parametre olarak alır) ve `onRun` (opsiyonel, panel yoksa tıklamada çalıştırılan fonksiyon) alanları bulunur.
- `onClear`: () => void — Seçimi temizleme butonuna tıklandığında çağrılan geri çağırım fonksiyonudur.

**Dönüş**: `React.ReactNode` — Seçili öğe sayısı 0 ise null, aksi halde yapışkan aksiyon çubuğunun JSX ağacını döndürür.

---

## İTHALATLAR (IMPORTS)
- import: react::React

---

## INTERFACES

### BulkAction
- `key: string`
- `label: string`
- `tone?: 'default' | 'danger' | 'warning'`
- `panel?: (close: () => void) => React.ReactNode`
- `onRun?: () => Promise<void>`

### BulkBarProps
- `selectedCount: number`
- `selectedLabel: string`
- `clearLabel: string`
- `actions: BulkAction[]`
- `onClear: () => void`

---

## SABİTLER
- **toneClassMap** (object) — `{
    default: adminTableActionClass,
    danger: adminTableActionDangerCla...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/data-table/BulkBar.tsx::BulkBar
- **params**: `selectedCount`, `selectedLabel`, `clearLabel`, `actions`, `onClear` (BulkBarProps'tan gelir)
- **ic_degiskenler**:
  - `openKey` — React.useState ile tutulan state; şu an açık olan panel'in `action.key` değeri (string) veya hiç panel açık değilse `null`
  - `setOpenKey` — `openKey` state'ini güncelleyen setter fonksiyonu
  - `closePanel` — `setOpenKey(null)` çağırarak açık paneli kapatan yardımcı fonksiyon; `action.panel(closePanel)` aracılığıyla alt panele kapatma işlevi olarak aktarılır
- **Dönüş**: `React.ReactNode` — `selectedCount === 0` ise `null`, aksi halde seçim bilgisi ve aksiyon butonlarını içeren JSX ağacı

---

### [N2_NASIL] AST Pointer: src/components/admin/data-table/BulkBar.tsx::closePanel
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `void` — `setOpenKey(null)` çağırarak paneli kapatır

---

### [N3_NASIL] AST Pointer: src/components/admin/data-table/BulkBar.tsx::actions.map callback
- **params**: `action` — `actions` dizisinin her bir elemanı; `.key`, `.label`, `.tone`, `.panel`, `.onRun` alanlarına erişilir
- **ic_degiskenler**:
  - `toneClass` — `toneClassMap[action.tone ?? 'default']` ifadesinden elde edilen CSS sınıf adı; butonun görsel tonunu belirler
  - `hasPanel` — `typeof action.panel === 'function'` kontrolünün sonucu; aksiyonun bir panel açıp açmayacağını belirten boolean
  - `isOpen` — `openKey === action.key` karşılaştırması; bu aksiyonun panelinin şu an açık olup olmadığını belirten boolean
- **Dönüş**: JSX elementi — her aksiyon için `<div>` içinde buton ve koşullu panel render'ı

---

### [N4_NASIL] AST Pointer: src/components/admin/data-table/BulkBar.tsx::onClick handler (actions.map içinde)
- **params**: yok
- **ic_degiskenler**: yok — `hasPanel`, `isOpen`, `action` dış kapsamdan (actions.map callback) gelir
- **Dönüş**: `void` — `hasPanel` true ise `setOpenKey(isOpen ? null : action.key)` çağırarak panel açar/kapatır; `hasPanel` false ve `action.onRun` varsa `void action.onRun()` çağırarak aksiyonu çalıştırır

---

## NODE ID STANDARD

  file: BulkBar.tsx
  function: BulkBar.tsx::BulkBar

---

## DISA AKTARILANLAR (EXPORTS)
  export: BulkAction
  export: BulkBar
  export: BulkBarProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-surface`, `border-admin-border`, `hover:text-admin-fg`, `text-admin-accent-fg`, `text-admin-fg`, `text-admin-fg-muted`, `text-sm`, `text-xs`
- **Layout:** `absolute`, `bottom-4`, `bottom-full`, `flex`, `flex-wrap`, `gap-2`, `gap-3`, `gap-4`, `h-8`, `inline-flex`, `items-center`, `justify-between`, `justify-center`, `max-w-4xl`, `relative`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-medium`, `font-semibold`, `mb-2`, `mx-auto`, `px-5`, `py-3`, `rounded-admin-lg`, `rounded-full`, `transition-colors`, `underline`