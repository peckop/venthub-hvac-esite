---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\JsonDiffViewer.tsx
skeleton_hash: 30b2fcda71cda919
entity_hashes:
  func:JsonDiffViewer: 00fa2648afca347e
  func:safeStringify: 9ba27221b507c072
  overview: a686cb82b4e79c82
  style_tokens: 447f0cef72f1a3d8
generated_at: 2026-08-27T08:07:05Z
---

## Genel Bakış
`JsonDiffViewer` bileşeni, iki JSON nesnesi arasındaki farkları görsel olarak kullanıcıya sunan bir React arayüzüdür. Bileşen, `before` ve `after` adlı iki prop alır ve bu veriler arasındaki değişiklikleri görüntüler. Görüntüleme sırasında oluşabilecek hataları önlemek üzere `safeStringify` yardımcı fonksiyonu kullanılır.

## Fonksiyon Grupları
### UI Rendering
Kullanıcı arayüzünü oluşturur ve JSON farklarını görselleştirir. `before` ve `after` prop'larını alarak bir React fonksiyonel bileşeni döndürür.
- JsonDiffViewer

### Yardımcı / Utility
Veri işleme ve güvenli string dönüşümünü sağlar; UI bileşeni tarafından kullanılmak üzere tasarlanmıştır. `unknown` tipindeki değerleri güvenli biçimde stringe dönüştürür.
- safeStringify

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

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

### [N1_NASIL] AST Pointer: src/components/admin/JsonDiffViewer.tsx::JsonDiffViewer
- **params**: `before`, `after`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('admin.common.oldValueBefore')`, `t('admin.common.newValueAfter')`, `t('admin.common.added')`, `t('admin.common.deleted')`, `t('admin.common.noChangeDetails')` çağrılarıyla kullanılır
  - `bObj` — `before` parametresi object ve null değilse `before as Record<string, unknown>`, aksi halde boş obje `{}` olarak atanır
  - `aObj` — `after` parametresi object ve null değilse `after as Record<string, unknown>`, aksi halde boş obje `{}` olarak atanır
  - `allKeys` — `bObj` ve `aObj` key'lerinin birleşimi (`new Set` ile tekrarlar kaldırılır), alfabetik sıralanır
  - `safeStringify` — iç fonksiyon; `val` parametresini güvenli şekilde string'e dönüştürür (null/undefined → `'null'`, string → tırnak içinde, object → `JSON.stringify`, diğer → `String`)
- **Dönüş**: JSX element — iki sütunlu (önceki/sonraki değer) diff görünümü; `allKeys` üzerinde `.map()` ile her key için satır oluşturulur, key yoksa "değişiklik yok" mesajı gösterilir

### [N2_NASIL] AST Pointer: src/components/admin/JsonDiffViewer.tsx::safeStringify
- **params**: `val` (unknown)
- **ic_degiskenler**: yok
- **Dönüş**: string — `val` undefined veya null ise `'null'`, string ise `"${val}"` (tırnak içinde), object ise `JSON.stringify(val)`, diğer durumlarda `String(val)`

### [N3_NASIL] AST Pointer: src/components/admin/JsonDiffViewer.tsx::allKeys.map callback
- **params**: `key`
- **ic_degiskenler**:
  - `valB` — `bObj[key]` değeri; önceki (before) nesnede bu key'e karşılık gelen değer
  - `valA` — `aObj[key]` değeri; sonraki (after) nesnede bu key'e karşılık gelen değer
  - `strB` — `safeStringify(valB)` sonucu; `valB`'nin string gösterimi
  - `strA` — `safeStringify(valA)` sonucu; `valA`'nın string gösterimi
  - `isRemoved` — `valB !== undefined && valA === undefined` koşulu; key'in sonraki nesneden silinip silinmediğini belirtir
  - `isAdded` — `valB === undefined && valA !== undefined` koşulu; key'in sonraki nesneye eklenip eklenmediğini belirtir
  - `isChanged` — `!isRemoved && !isAdded && strB !== strA` koşulu; key'in değerinin değişip değişmediğini belirtir
- **Dönüş**: JSX element — değişiklik yoksa gri renkli iki sütunda aynı değer gösterilir; silinmişse before sütunu kırmızı arka planlı ve "silindi" etiketli, eklenmişse before sütunu gri arka planlı ve "eklendi" etiketli, değişmişse before kırmızı/after yeşil arka planlı gösterilir

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