---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\data-table\BulkBar.tsx
skeleton_hash: 75e0953d539abab2
entity_hashes:
  func:BulkBar: ba30c4958f369a2e
  overview: 3bff9d3fdbf00dd5
  style_tokens: dd2e832a7f2c05f0
generated_at: 2026-06-19T20:47:00Z
---

## Genel Bakış

BulkBar, yönetici panelindeki veri tablolarında toplu seçim yapıldığında görüntülenen araç çubuğu bileşenidir. Seçilen öğe sayısını, ilgili etiketleri ve toplu işlem seçeneklerini sunarak kullanıcıya seçim durumunu gösterir ve seçim temizleme ile çoklu işlem yürütme imkânı sağlar.

## Fonksiyon Grupları

### Seçim Durumu Gösterimi
Seçili öğe sayısını ve etiketlerini kullanıcıya sunarak mevcut seçim durumunu görsel olarak iletir.
- BulkBar (bileşen)

### İşlem Yönetimi
Toplu işlemler için tanımlanmış aksiyonları listeler ve seçim temizleme işlevini dışarıya bildirir.
- BulkBar (bileşen — `actions` ve `onClear` prop'ları aracılığıyla)

---

## AXIOMS – Mimari Varsayımlar

Bu modül, seçili öğeler için toplu işlem çubuğu (bulk action bar) gösteren bir React bileşenidir.

[Aksiyom 1]: Eğer `selectedCount` parametresi sayısal değer içermiyorsa, bileşende seçili öğe sayısı gösterimi hatalı veya anlamsız olur.

[Aksiyom 2]: Eğer `onClear` parametresi proporcion olarak sağlanmıyorsa, kullanıcı seçimi temizleme işlemini gerçekleştiremez.

[Aksiyom 3]: Eğer `actions` parametresi geçerli bir dizi veya liste içermiyorsa, bileşende toplu işlem butonları gösterilmez.

[Aksiyom 4]: Eğer `selectedLabel` parametresi sağlanmıyorsa, seçili öğe sayısı yanında görüntülenecek bağlam metni eksik olur.

[Aksiyom 5]: Eğer `clearLabel` parametresi sağlanmıyorsa, temizleme butonunun metin etiketi eksik olur.

[Aksiyom 6]: `toneClassMap` sabitinin, bileşenin farklı durum/ton varyasyonları için geçerli CSS sınıf haritalaması içermesi gerekir; aksi takdirde stil uygulanamaz.

---

## FONKSİYON DETAYLARI

### BulkBar

**Ne yapar**: Seçili öğelerin sayısını ve ilgili toplu işlem (bulk) aksiyonlarını gösteren, sayfanın alt kısmında yapışkan (sticky) olarak konumlanan bir araç çubuğu bileşenidir. Seçim sayıs sıfıra eşit olduğunda hiçbir şey render etmez (null döner), böylece seçili öğe yokken gereksiz bir UI elemanı ekranda bulunmaz.

**Nasıl yapar**: Bileşen, prop olarak gelen `selectedCount` değerini kontrol ederek sıfırsa `null` döner ve DOM'a hiçbir şey eklenmez. Sıfırdan farklıysa, cam efektli (`glassStrongClass`) yuvarlak köşeli bir контейнер içinde iki ana bölümü render eder: sol tarafta seçili öğe sayısını yuvarlak bir rozet içinde gösteren bilgi alanı ve sağ tarafta aksiyon butonlarını döngüyle listeleyen buton alanı. Her bir aksiyonun `panel` özelliği varsa (bir React bileşeni/fonksiyonu ise), butona tıklandığında ilgili panel açılır; `openKey` state'i hangi panelin açık olduğunu kontrol eder. Paneller butonun üstünde (`absolute bottom-full`) konumlandırılmıştır. Paneli kapatmak için `closePanel` fonksiyonu çağrılır ve bu fonksiyon `openKey`'i `null` yaparak tüm panelleri kapatır. `panel`'i olmayan aksiyonlarda ise doğrudan `onRun` fonksiyonu tetiklenir. Her butonun tonuna göre farklı stil sınıfları (`toneClassMap`) uygulanır.

**Parametreler**:
- `selectedCount`: `number` — Seçili öğe sayısını belirtir. Değer 0 ise bileşen render edilmez; 0'dan büyük ise araç çubuğu görünür hale gelir.
- `selectedLabel`: `string` — Seçili öğe sayısının yanında gösterilen açıklayıcı metin. Örneğin `"öğe seçildi"` gibi bir etiket olarak kullanılır.
- `clearLabel`: `string` — Seçimi temizleme butonunun üzerinde ve `aria-label` niteliğinde görünen metin. Büyük harfler ve geniş karakter aralığı ile (`uppercase tracking-widest`) stilize edilir.
- `actions`: `BulkAction[]` — Kullanılabilir toplu işlem aksiyonlarının dizisi. Her aksiyon nesnesi `key` (benzersiz tanımlayıcı), `label` (buton metni), opsiyonel `tone` (buton tonu/renomu), opsiyonel `panel` (açılabilir panel içeriği olarak bir fonksiyon) ve opsiyonel `onRun` (panel olmadan çalıştırılacak fonksiyon) özelliklerini içerir. `panel` bir fonksiyon olarak verildiğinde, `closePanel` callback'ini argüman olarak alır; bu sayede panel kendi içinden kapatılabilir.
- `onClear`: `() => void` — Seçimi temizleme butonuna tıklandığında çağrılan geri çağırma fonksiyonu. Seçili tüm öğelerin seçimini kaldırmak için kullanılır.

**Dönüş**: `React.ReactNode` — Seçim sayısına bağlı olarak `null` veya JSX ile oluşturulmuş bir React düğümü döner. Seçim sayısı sıfır olduğunda `null`, sıfırdan farklı olduğunda sticky araç çubuğu JSX'i döner.

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
    danger: adminTableActionDangerClass...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: BulkBar.tsx::BulkBar
- **params**: `{ selectedCount: number, selectedLabel: string, clearLabel: string, actions: Action[], onClear: () => void }` — BulkBarProps destructured olarak
- **ic_degiskenler**:
  - `openKey` — şu an açık olan panelin key'ini tutar; string veya null (React.useState ile oluşturulmuş state)
  - `setOpenKey` — openKey state'ini güncelleyen setter fonksiyonu
  - `closePanel` — setOpenKey(null) çağırarak açık panelleri kapan yardımcı fonksiyon (tanımlı ama JSX içinde action.panel(closePanel) olarak kullanılır)
- **Dönüş**: `React.ReactNode | null` — selectedCount === 0 ise null, aksi halde sticky bottom toolbar JSX'i

### [N2_NASIL] AST Pointer: BulkBar.tsx::actions.map callback
- **params**: `(action: Action)` — actions dizisinin her elemanı için çalışan arrow fonksiyon
- **ic_degiskenler**:
  - `toneClass` — toneClassMap[action.tone ?? 'default'] ile elde edilen CSS sınıf string'i, butonun renk tonunu belirler
  - `hasPanel` — typeof action.panel === 'function' kontrolü, action'ın panel bileşeni içerip içermediğini boolean olarak tutar
  - `isOpen` — openKey === action.key karşılaştırması, bu action'a ait panelin açık olup olmadığını boolean olarak tutar
- **Dönüş**: JSX `<div>` elemanı (buton ve koşullu panel)

### [N3_NASIL] AST Pointer: BulkBar.tsx::onClick handler (actions.map içindeki button onClick)
- **params**: yok
- **ic_degiskenler**:
  - `hasPanel` — closure tarafından yakalanmış, panel varsa true (üst scope'tan gelir)
  - `isOpen` — closure tarafından yakalanmış, panel açıksa true (üst scope'tan gelir)
- **Erişimler**: `setOpenKey(isOpen ? null : action.key)` — panel varsa toggle eder; `action.onRun()` — panel yoksa doğrudan çalıştırılır
- **Dönüş**: void

---

## NODE ID STANDARD

  file: src\components\admin\data-table\BulkBar.tsx
  function: src\components\admin\data-table\BulkBar.tsx::BulkBar

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
- **Renkler:** `bg-cyan-400`, `hover:text-white`, `text-slate-200`, `text-slate-500`, `text-sm`, `text-surface-deep`, `text-xs`
- **Layout:** `absolute`, `bottom-4`, `bottom-full`, `flex`, `flex-wrap`, `gap-2`, `gap-3`, `gap-4`, `h-8`, `inline-flex`, `items-center`, `justify-between`, `justify-center`, `max-w-4xl`, `relative`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `${glassStrongClass`, `font-black`, `font-bold`, `mb-2`, `mx-auto`, `px-5`, `py-3`, `rounded-2xl`, `rounded-full`, `tracking-widest`, `transition-colors`, `underline`, `uppercase`