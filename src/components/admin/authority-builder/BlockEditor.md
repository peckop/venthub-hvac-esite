---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\authority-builder\BlockEditor.tsx
skeleton_hash: bb9ce06ca0b5ad23
entity_hashes:
  func:BlockEditor: 214d29bf0d4fb6bd
  overview: 451c6f0d8f51e9a4
  style_tokens: bc113824a6724140
generated_at: 2026-05-28T22:35:21Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin admin yetki yapılandırıcı bölümü için özel bir React bileşen modülüdür. Sadece tek bir düzenleme bileşeni barındırarak, mevcut blok verilerini alır, kullanıcıların bu blokları düzenlemesini sağlar ve yapılan değişiklikleri üst bileşenlere iletir.

## Fonksiyon Grupları
### Blok Düzenleme Arayüzü
Bu grup, modülün tek işlevini barındırır. Verilen blok verileri için kullanıcı dostu bir düzenleme arayüzü sunar ve kullanıcı tarafından yapılan her değişikliği belirtilen geri çağırma fonksiyonu aracılığıyla bildirir.
- BlockEditor

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `block` prop'u sağlanmazsa, bileşen render sırasında hata fırlatabilir veya boş görünebilir.  
[Aksiyom 2]: Eğer `onChange` prop'u sağlanmazsa, blokta yapılan değişiklikler dışarıya iletilemez ve durum güncellenemez.

---

## FONKSİYON DETAYLARI

### BlockEditor
**Ne yapar**: Bu bir React fonksiyonel bileşenidir ve bir blok düzenleyici arayüzü sağlar. `block` prop'u ile alınan blok verisini kullanıcıya düzenleme imkanı sunar ve yapılan her değişikliği `onChange` callback'i aracılığıyla üst bileşene bildirir.

**Nasıl yapar**: Bileşen, iç durum yönetimi veya doğrudan prop manipülasyonu ile blok verisinin bir kopyasını tutar. Kullanıcı girdilerine bağlı olarak bu veriyi günceller ve `onChange` fonksiyonunu tetikleyerek değişiklikleri dışarıya iletir. Render işlemi sırasında mevcut blok yapısına uygun form elemanları ve kontroller oluşturur.

**Parametreler**:
- `block`: BlockEditorProps — Düzenlenecek blok verisini içeren zorunlu prop. Bu prop, blok türü, içeriği ve yapılandırmasını barındırır.
- `onChange`: BlockEditorProps — Blok verisinde meydana gelen değişiklikleri dışarıya bildirmek için kullanılan zorunlu callback prop. Yeni blok verisini parametre olarak alır.

**Dönüş**: React.FC<BlockEditorProps> — Bir React fonksiyonel bileşeni döndürür. Bileşen, belirtilen prop'lar ile çağrıldığında bir JSX ağacı üretir ve blok düzenleme arayüzünü kullanıcıya sunar.

---

## INTERFACES

### BlockEditorProps
- `block: AuthorityBlock`
- `onChange: (updatedBlock: AuthorityBlock) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/authority-builder/BlockEditor.tsx::handleContentChange
- **params**: (fields)
- **ic_degiskenler**:
  - `updatedBlock` — `block` nesnesinin kopyası; `content` alanı `fields` ile birleştirilir, `AuthorityBlock` tipine dönüştürülür.
  - `block` — dışarıdan gelen mevcut blok verisi (kapalı kapsamda kullanılmaktadır).
  - `onChange` — üst bileşenden gelen callback; güncellenmiş blok nesnesini alır.
- **Dönüş**: yok (callback `onChange` çağrılır, fonksiyon yan etki üretir).

### [N2_NASIL] AST Pointer: src/components/admin/authority-builder/BlockEditor.tsx::updateRow
- **params**: (i, field, val)
- **ic_degiskenler**:
  - `newRows` — mevcut `rows` dizisinin kopyası; `i` indeksindeki satır, `[field]: val` ile güncellenir.
  - `rows` — dış kapsamda tanımlı satır dizisi; okunur ve kopyalanır.
  - `handleContentChange` — `rows` güncellemesini üst bileşene ileten fonksiyon.
- **Dönüş**: yok (yan etki: `handleContentChange` çağrısı).

### [N3_NASIL] AST Pointer: src/components/admin/authority-builder/BlockEditor.tsx::addRow
- **params**: ()
- **ic_degiskenler**:
  - `rows` — dış kapsamda tanımlı satır dizisi; mevcut elemanları korur.
  - `handleContentChange` — yeni satır eklenmiş `rows` dizisini üst bileşene ileten fonksiyon.
- **Dönüş**: yok (yan etki: `handleContentChange` çağrısı).

### [N4_NASIL] AST Pointer: src/components/admin/authority-builder/BlockEditor.tsx::removeRow
- **params**: (i)
- **ic_degiskenler**:
  - `rows` — dış kapsamda tanımlı satır dizisi; `i` indeksindeki eleman filtrelenir.
  - `handleContentChange` — filtrelenmiş `rows` dizisini üst bileşene ileten fonksiyon.
- **Dönüş**: yok (yan etki: `handleContentChange` çağrısı).

### [N5_NASIL] AST Pointer: src/components/admin/authority-builder/BlockEditor.tsx::renderRow
- **params**: (row, i)
- **ic_degiskenler**:
  - `row` — tek bir satır nesnesi; `label`, `value`, `unit` alanlarını içerir.
  - `i` — satırın indeks numarası; `key` ve event handler’larda kullanılır.
  - `inputClass` — dıştan gelen CSS sınıfı; input elementlerine uygulanır.
  - `updateRow` — satırdaki bir alanı güncelleyen fonksiyon.
  - `removeRow` — satırı silen fonksiyon.
  - `Trash2` — ikon bileşeni; silme butonunda gösterilir.
- **Dönüş**: JSX element (satırın render çıktısı).

### [N6_NASIL] AST Pointer: src/components/admin/authority-builder/BlockEditor.tsx::updateItem
- **params**: (i, field, val)
- **ic_degiskenler**:
  - `newItems` — mevcut `items` dizisinin kopyası; `i` indeksindeki öğe, `[field]: val` ile güncellenir.
  - `items` — dış kapsamda tanımlı öğe dizisi; okunur ve kopyalanır.
  - `handleContentChange` — `items` güncellemesini üst bileşene ileten fonksiyon.
- **Dönüş**: yok (yan etki: `handleContentChange` çağrısı).

### [N7_NASIL] AST Pointer: src/components/admin/authority-builder/BlockEditor.tsx::addItem
- **params**: ()
- **ic_degiskenler**:
  - `items` — dış kapsamda tanımlı öğe dizisi; mevcut elemanları korur.
  - `handleContentChange` — yeni öğe eklenmiş `items` dizisini üst bileşene ileten fonksiyon.
- **Dönüş**: yok (yan etki: `handleContentChange` çağrısı).

### [N8_NASIL] AST Pointer: src/components/admin/authority-builder/BlockEditor.tsx::removeItem
- **params**: (i)
- **ic_degiskenler**:
  - `items` — dış kapsamda tanımlı öğe dizisi; `i` indeksindeki öğe filtrelenir.
  - `handleContentChange` — filtrelenmiş `items` dizisini üst bileşene ileten fonksiyon.
- **Dönüş**: yok (yan etki: `handleContentChange` çağrısı).

### [N9_NASIL] AST Pointer: src/components/admin/authority-builder/BlockEditor.tsx::renderItem
- **params**: (item, i)
- **ic_degiskenler**:
  - `item` — tek bir öğe nesnesi; `icon`, `title`, `description` alanlarını içerir.
  - `i` — öğenin indeks numarası; `key` ve event handler’larda kullanılır.
  - `inputClass` — dıştan gelen CSS sınıfı; input elementlerine uygulanır.
  - `textareaClass` — dıştan gelen CSS sınıfı; textarea elementine uygulanır.
  - `updateItem` — öğenin bir alanını güncelleyen fonksiyon.
  - `removeItem` — öğeyi silen fonksiyon.
  - `Trash2` — ikon bileşeni; silme butonunda gösterilir.
- **Dönüş**: JSX element (öğenin render çıktısı).

---

## NODE ID STANDARD

  file: src\components\admin\authority-builder\BlockEditor.tsx
  function: src\components\admin\authority-builder\BlockEditor.tsx::BlockEditor

---

## DISA AKTARILANLAR (EXPORTS)
  export: BlockEditor

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-indigo-50`, `bg-indigo-50/20`, `bg-slate-50`, `bg-slate-50/30`, `bg-slate-50/50`, `bg-white`, `border-indigo-100/50`, `border-slate-100`, `hover:text-indigo-700`, `hover:text-red-500`, `text-center`, `text-indigo-400`, `text-indigo-600`, `text-slate-300`, `text-slate-400`
- **Layout:** `absolute`, `flex`, `flex-1`, `gap-1`, `gap-2`, `gap-3`, `gap-4`, `grid`, `grid-cols-2`, `h-32`, `h-7`, `h-9`, `items-center`, `items-start`, `justify-between`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `${inputClass`, `${textareaClass`, `border`, `font-black`, `font-bold`, `font-mono`, `group`, `italic`, `px-3`, `py-1`, `rounded`, `rounded-full`, `rounded-lg`, `rounded-xl`, `space-y-3`