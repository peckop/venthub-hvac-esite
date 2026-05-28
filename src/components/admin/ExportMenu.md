---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\ExportMenu.tsx
skeleton_hash: ce1680439765f206
entity_hashes:
  func:ExportMenu: 9e536638b7cdf449
  overview: fcef70276d80a8c4
  style_tokens: 7659c3683121a964
generated_at: 2026-05-28T22:35:34Z
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

## FONKSİYON DETAYLARI

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

## NODE ID STANDARD

  file: src\components\admin\ExportMenu.tsx
  function: src\components\admin\ExportMenu.tsx::ExportMenu

---

## DISA AKTARILANLAR (EXPORTS)
  export: ExportMenu
  export: ExportMenuItem

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-lg`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-emerald-500/10`, `border-white/10`, `hover:bg-white/5`, `hover:text-white`, `text-emerald-400`, `text-slate-300`, `text-slate-500`, `text-xs`
- **Layout:** `flex`, `gap-2`, `gap-3`, `h-12`, `h-8`, `items-center`, `justify-center`, `min-w-140px`, `min-w-200px`, `p-2`, `shadow-elevation-5`, `w-8`, `z-50`, `zoom-in-95`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-in`, `border`, `cursor-pointer`, `duration-200`, `fade-in`, `font-black`, `font-bold`, `glass-strong`, `italic`, `mb-1`, `outline-none`, `pb-2`, `pt-2`, `px-3`, `px-4`