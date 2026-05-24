---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx
skeleton_hash: bb9ce06ca0b5ad23
generated_at: 2026-05-23T21:51:42Z
---

## Genel Bakış
`BlockEditor` bileşeni, yetki yapılandırma arayüzünde bir blokun içeriğini görüntülemek ve düzenlemekten sorumludur. Gelen `block` verisini alarak kullanıcı etkileşimlerini yönetir ve değişiklikleri `onChange` geri çağrısı ile üst bileşene iletir. Bu bileşen, form alanları ve düzen öğeleriyle blok düzenleme deneyimini sağlar.

## Fonksiyon Grupları
### Render ve Düzen
Blokun görsel sunumu, giriş alanları ve düzen öğelerinin JSX ile oluşturulmasını kapsar.
- BlockEditor

### Durum ve Veri Yönetimi
Kullanıcı girdilerini yerel state'te tutar ve `block` prop'undaki değişiklikleri izleyerek state'i senkronize eder.
- BlockEditor

### Etkinlik ve Değişiklik İletimi
Kullanıcı etkileşimlerinden (input değişikliği, buton tıklaması) tetiklenen olayları işler, doğrulama yapar ve güncellenmiş blok verisini `onChange` ile dışarı aktarır.
- BlockEditor

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### BlockEditor
**Ne yapar**: authority-builder modülü kapsamında tanımlanmış tek bir yetki bloğunun düzenlenmesini sağlayan React kullanıcı arayüzü bileşenidir. Blok verisini alır, görselleştirir ve kullanıcı tarafından yapılan değişiklikleri bildirir.

**Nasıl yapar**: Kontrollü bileşen (controlled component) mantığıyla çalışır. Kendisine prop olarak iletilen `block` verisini form elemanlarına bağlar ve kullanıcı etkileşimi sonrasında güncellenmiş veriyi `onChange` callback fonksiyonu aracılığıyla üst bileşene iletir.

**Parametreler**:
- `block`: `BlockEditorProps['block']` — Düzenlenmekte olan authority bloğunun mevcut yapılandırma verisini tutan nesne.
- `onChange`: `BlockEditorProps['onChange']` — Blok verisi güncellendiğinde tetiklenen geri çağırma fonksiyonu. Güncellenmiş blok verisini argüman olarak alır.

**Dönüş**: `React.FC<BlockEditorProps>` — Bir React fonksiyonel bileşeni olarak tanımlanmıştır. Render edildiğinde ilgili authority bloğunun düzenleme arayüzünü oluşturan JSX elementini döndürür.

---

## INTERFACES

### BlockEditorProps
- `block: AuthorityBlock`
- `onChange: (updatedBlock: AuthorityBlock) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx::updateBlockFromFields
- **params**: fields
- **ic_degiskenler**: 
  - `fields` — Partial<Record<string, unknown>> containing partial block content to merge into the existing block.
  - `block` — the current AuthorityBlock object being edited.
  - `onChange` — callback function that propagates the updated block to the parent component.
  - `updatedBlock` — newly created AuthorityBlock instance with merged content (`...block.content, ...fields`).
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx::updateRow
- **params**: i, field, val
- **ic_degiskenler**: 
  - `i` — numeric index of the row to be updated within the rows array.
  - `field` — string key indicating which property of the row object to change (e.g., 'label', 'value', 'unit').
  - `val` — new value to assign to the specified field.
  - `rows` — current array of row objects representing feature rows.
  - `handleContentChange` — state updater function that replaces the rows array with a new version.
  - `newRows` — shallow copy of rows where the row at index `i` has its `[field]` property set to `val`.
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx::addRow
- **params**: (none)
- **ic_degiskenler**: 
  - `rows` — current array of row objects.
  - `handleContentChange` — state updater used to append a new default row object `{ label: 'Yeni Özellik', value: '-' }` to the rows array.
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx::removeRow
- **params**: i
- **ic_degiskenler**: 
  - `i` — index of the row to remove from the rows array.
  - `rows` — current array of row objects.
  - `handleContentChange` — state updater that returns a new rows array excluding the element at index `i` via `filter`.
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx::renderRow
- **params**: row, i
- **ic_degiskenler**: 
  - `row` — object with `label`, `value`, and optionally `unit` properties describing a single feature row.
  - `i` — index of the row within the list, used for `key` and handler callbacks.
  - `inputClass` — CSS class string applied to `<input>` elements for consistent styling.
  - `updateRow` — callback `(i, field, val) => {...}` that updates a specific field of the row at index `i`.
  - `removeRow` — callback `(i) => {...}` that removes the row at index `i`.
- **Dönüş**: JSX.Element

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx::updateItem
- **params**: i, field, val
- **ic_degiskenler**: 
  - `i` — index of the item to update within the items array.
  - `field` — property name to modify (`title`, `description`, or `icon`).
  - `val` — new value for the specified property.
  - `items` — current array of item objects.
  - `handleContentChange` — state updater function for the items array.
  - `newItems` — shallow copy of items where the item at index `i` has its `[field]` property set to `val`.
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx::addItem
- **params**: (none)
- **ic_degiskenler**: 
  - `items` — current array of item objects.
  - `handleContentChange` — state updater used to append a default item `{ title: 'Özellik Başlığı', description: 'Detay metni...', icon: 'zap' }` to the items array.
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx::removeItem
- **params**: i
- **ic_degiskenler**: 
  - `i` — index of the item to remove from the items array.
  - `items` — current array of item objects.
  - `handleContentChange` — state updater that returns a new items array excluding the element at index `i` via `filter`.
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx::renderItem
- **params**: item, i
- **ic_degiskenler**: 
  - `item` — object with `icon`, `title`, and `description` properties representing a single feature item.
  - `i` — index of the item within the list, used for `key` and handler callbacks.
  - `inputClass` — CSS class string applied to `<input>` fields.
  - `textareaClass` — CSS class string applied to the `<textarea>` field.
  - `updateItem` — callback `(i, field, val) => {...}` that modifies a specific field of the item at index `i`.
  - `removeItem` — callback `(i) => {...}` that deletes the item at index `i`.
- **Dönüş**: JSX.Element

---

---

## NODE ID STANDARD

  file: src\components\admin\authority-builder\BlockEditor.tsx
  function: src\components\admin\authority-builder\BlockEditor.tsx::BlockEditor

---

## DISA AKTARILANLAR (EXPORTS)
  export: BlockEditor