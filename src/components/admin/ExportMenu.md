---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\ExportMenu.tsx
skeleton_hash: ce1680439765f206
generated_at: 2026-05-23T21:53:22Z
---

## Genel Bakış
`ExportMenu` modülü, yönetim panelinde kullanıcının veri dışa aktarma seçeneklerini görüntülemesini ve tetiklemesini sağlayan bir React bileşeni sunar. Bileşen, gelen menü öğelerini listeleyerek her biri için ilgili eylemi çalıştırır ve isteğe bağlı bir buton etiketiyle kullanıcı arayüzünde konumlandırılabilir.

## Fonksiyon Grupları
### ExportMenu Bileşeni
Bu grup, menünün yapısını oluşturma, kullanıcı etkileşimini yönetme ve dışa aktarma işlemlerini başlatma sorumluluğunu üstlenir. Tek bir fonksiyon, tüm bu davranışları birleştirir.
- ExportMenu

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### ExportMenu
**Ne yapar**: Bu bileşen, yönetici panellerinde veya veri yoğun sayfalarda kullanıcıların verileri çeşitli formatlarda dışa aktarmasını sağlayan bir dropdown menüsü oluşturur. Kullanıcıya sunulan dışa aktarma seçenekleri (`items` prop'u ile) esnek bir şekilde tanımlanabilir ve menü tetikleyici düğme metni özelleştirilebilir.
**Nasıl yapar**: Bileşen, bir düğmeye tıklandığında açılan bir kutu (dropdown) mantığı ile çalışır. `items` dizisini döngüye sokarak her bir öğe için bir liste elemanı oluşturur ve bu elemanlara tıklanınca ilgili dışa aktarma işlemini tetikler. Dahili olarak açık/kapalı durumunu yönetir ve seçeneklerin görünürlüğünü kontrol eder.
**Parametreler**:
- `items: ExportMenuItem[]` — Kullanıcıya sunulacak dışa aktarma seçeneklerinin listesini tanımlar. Her bir öğe genellikle bir `label` (etiket) ve `onClick` (tıklama olayı) içerir.
- `buttonLabel?: string` — Menüyü açan tetikleyici düğmenin üzerinde görüntülenecek metindir. İsteğe bağlıdır; bu prop sağlanmazsa bileşen varsayılan bir metin kullanabilir.
**Dönüş**: **JSX.Element** — Ekrana basılmaya hazır, tetikleyici düğme ve koşullu olarak görüntülenen açılır menüyü içeren bir React kullanıcı arayüzü öğesi döndürür. Bileşen geçersiz bir durumdaysa `null` döndürebilir.

---

## TYPE ALIASES

### ExportMenuItem
```typescript
type ExportMenuItem = {
  key: string
  label: string
  onSelect: () => void
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/ExportMenu.tsx::ExportMenu
- **params**: items, buttonLabel
- **ic_degiskenler**: 
  - `_t` — localization function returned by `useI18n()` used to translate UI strings such as admin.a11y.export, admin.common.export, admin.inventory.fileFormat, admin.common.noOptions
- **Dönüş**: JSX element (`<DropdownMenu.Root>`) representing the export menu component

### [N2_NASIL] AST Pointer: src/components/admin/ExportMenu.tsx::item map callback
- **params**: item
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<DropdownMenu.Item>`) representing a single export option in the dropdown menu

---

---

## NODE ID STANDARD

  file: src\components\admin\ExportMenu.tsx
  function: src\components\admin\ExportMenu.tsx::ExportMenu

---

## DISA AKTARILANLAR (EXPORTS)
  export: ExportMenu
  export: ExportMenuItem