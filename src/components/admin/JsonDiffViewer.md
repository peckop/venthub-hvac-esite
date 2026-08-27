---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\admin\JsonDiffViewer.tsx
skeleton_hash: 2128e2e264cb0b0f
entity_hashes:
  func:JsonDiffViewer: 00fa2648afca347e
  func:safeStringify: 9ba27221b507c072
  overview: a686cb82b4e79c82
  style_tokens: 447f0cef72f1a3d8
generated_at: 2026-08-27T13:11:53Z
---

## Genel Bakış
Bu modül, iki JSON nesnesi arasındaki farkları görsel olarak gösteren bir React bileşeni ve bu bileşenin veri işleme sürecinde kullandığı güvenli bir string dönüşüm yardımcısını içerir. Modül, admin arayüzünde veri değişikliklerinin anlaşılmasını kolaylaştırmayı amaçlar.

## Fonksiyon Grupları
### UI Rendering
Kullanıcı arayüzünü oluşturur ve JSON verileri arasındaki farkları görsel bir formatta sunar.
- JsonDiffViewer

### Yardımcı / Utility
Veri işleme ve güvenli string dönüşümünü sağlar; UI bileşeni tarafından kullanılır.
- safeStringify

## Bağımlılıklar ve Mimari Notlar
- **İç Bağımlılıklar**: `safeStringify` fonksiyonu, `JsonDiffViewer` bileşeni tarafından kullanılır.
- **Dış Bağımlılıklar**: Modül, `React` kütüphanesine bağımlıdır. Fonksiyon imzalarından başka bir dış bağımlılık bilgisi çıkarılamaz.
- **Dinamik/Lazy Yükleme**: Kaynakta bu konuda bilgi bulunmamaktadır.
- **Mimari Önem**: Modül, admin panelinde JSON formatındaki veri değişikliklerinin görsel olarak incelenmesi için temel bir bileşendir.

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `before` prop'u sağlanmazsa, `JsonDiffViewer` bileşeni karşılaştırma yapacak bir kaynak veriye sahip olamaz.

[Aksiyom 2]: Eğer `after` prop'u sağlanmazsa, `JsonDiffViewer` bileşeni karşılaştırma yapacak bir hedef veriye sahip olamaz.

[Aksiyom 3]: Eğer `safeStringify` fonksiyonuna bir `val` parametresi verilmezse, fonksiyon çağrısı gerçekleştirilemez.

---

## FONKSİYON DETAYLARI

### JsonDiffViewer
**Ne yapar**: Bu bileşen, `before` ve `after` props'larını alır ve bir React functional component döndürür.  
**Nasıl yapar**: Fonksiyon imzasında gövde gözetilmediği için iç mantığı belirtilmemiştir; sadece prop alıp bir JSX döndürür.  
**Parametreler**:
- before: type — önceki JSON verisini temsil eder (tipi imzada belirtilmemiştir, `unknown` olarak kabul edilebilir)  
- after: type — sonraki JSON verisini temsil eder (tipi imzada belirtilmemiştir, `unknown` olarak kabul edilebilir)  
**Dönüş**: `React.FC<JsonDiffViewerProps>` — bir React fonksiyonel bileşeni döndürür.

### safeStringify
**Ne yapar**: Bu fonksiyon, bir `unknown` tipindeki değeri alır ve bir sonuç döndürür.  
**Nasıl yapar**: Fonksiyon gövdesi ve dönüş tipi belgelenmediği için iç işlem açıklanamamaktadır.  
**Parametreler**:
- val: type — işlenecek değeri temsil eder (tipi `unknown` olarak belirtilmiştir)  
**Dönüş**: Dönüş tipi fonksiyon imzasında açıkça belirtilmemiştir; belirsizdir (`void` veya başka bir tip olabilir).

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: react::React

---

## INTERFACES

### JsonDiffViewerProps
- `before: unknown`
- `after: unknown`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: components/admin/JsonDiffViewer.tsx::JsonDiffViewer
- **params**: `before`, `after`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('admin.common.oldValueBefore')`, `t('admin.common.newValueAfter')`, `t('admin.common.added')`, `t('admin.common.deleted')`, `t('admin.common.noChangeDetails')` çağrılarında kullanılır
  - `bObj` — `before` parametresinin object ve null olmayan durumda `Record<string, unknown>` olarak atanmış hali; aksi durumda boş obje atanır
  - `aObj` — `after` parametresinin object ve null olmayan durumda `Record<string, unknown}` olarak atanmış hali; aksi durumda boş obje atanır
  - `allKeys` — `bObj` ve `aObj` key'lerinin `Set` ile birleştirilip alfabetik sıralanmış dizisi; `.map()` ile her key için diff satırı oluşturulur
  - `safeStringify` — `val` parametresini alan, undefined/null ise `'null'`, string ise tırnak içinde, object ise `JSON.stringify`, diğer durumlarda `String(val)` döndüren yardımcı fonksiyon
- **Dönüş**: JSX element — iki sütunlu (before/after) diff görünümü; `allKeys` boşsa "noChangeDetails" mesajı gösterir

### [N2_NASIL] AST Pointer: components/admin/JsonDiffViewer.tsx::safeStringify
- **params**: `val` (unknown)
- **ic_degiskenler**: yok
- **Dönüş**: string — `val` undefined veya null ise `'null'`, string ise `"${val}"` (tırnak içinde), object ise `JSON.stringify(val)`, diğer durumlarda `String(val)`

### [N3_NASIL] AST Pointer: components/admin/JsonDiffViewer.tsx::allKeys.map callback
- **params**: `key`
- **ic_degiskenler**:
  - `valB` — `bObj[key]` erişimi; before objesindeki key karşılığı değer
  - `valA` — `aObj[key]` erişimi; after objesindeki key karşılığı değer
  - `strB` — `safeStringify(valB)` sonucu; before değerinin string gösterimi
  - `strA` — `safeStringify(valA)` sonucu; after değerinin string gösterimi
  - `isRemoved` — `valB !== undefined && valA === undefined` koşulu; key'in before'da var olup after'da silinmiş olduğunu belirtir
  - `isAdded` — `valB === undefined && valA !== undefined` koşulu; key'in before'da yokken after'da eklenmiş olduğunu belirtir
  - `isChanged` — `!isRemoved && !isAdded && strB !== strA` koşulu; key'in her iki tarafta da var olup değerinin değiştiğini belirtir
- **Dönüş**: JSX element — değişmemiş key'ler için iki sütunda aynı değer gösterilir; eklenen/silinen/değişen key'ler için renkli vurgu ve `t()` ile çevrilmiş etiketler (`added`, `deleted`) kullanılır

---

## NODE ID STANDARD

  file: src\components\admin\JsonDiffViewer.tsx
  function: src\components\admin\JsonDiffViewer.tsx::JsonDiffViewer
  function: src\components\admin\JsonDiffViewer.tsx::safeStringify

---

## DISA AKTARILANLAR (EXPORTS)
  export: JsonDiffViewer

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-danger`, `bg-admin-danger-weak`, `bg-admin-success`, `bg-admin-success-weak`, `bg-admin-surface-2`, `bg-admin-surface-3`, `border-admin-border`, `border-b`, `border-r`, `hover:bg-admin-surface-2`, `text-admin-danger`, `text-admin-fg-muted`, `text-admin-fg-subtle`, `text-admin-success`, `text-center`
- **Layout:** `flex`, `flex-1`, `gap-2`, `h-2`, `items-center`, `max-h-400px`, `overflow-hidden`, `overflow-x-auto`, `p-3`, `w-2`, `w-full`
- **Varyant/Responsive:** `:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${isAdded`, `${isRemoved`, `:`, `border`, `font-mono`, `font-semibold`, `isAdded`, `isChanged`, `isRemoved`, `italic`, `leading-relaxed`, `mr-2`, `opacity-70`, `px-2`, `py-1`