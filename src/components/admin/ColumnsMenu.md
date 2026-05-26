---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\ColumnsMenu.tsx
skeleton_hash: 8e6ac07df5b78228
generated_at: 2026-05-23T21:51:43Z
---

## Genel Bakış
`ColumnsMenu` bileşeni, yönetim panelindeki tablolar için sütun görünürlüğünü ve satır yoğunluğunu kullanıcının ayarlamasına olanak tanıyan bir menü bileşenidir. Dışarıdan aldığı yapılandırma listesine dayanarak her sütunu açıp kapatan denetimler sunar ve yoğunluk değişikliklerini üst bileşene bildirir.

## Fonksiyon Grupları
### Menü ve Kontrol Mantığı
Bu grup, menünün render edilmesi, kullanıcı etkileşimlerinin işlenmesi ve sağlanan sütun listesi ile yoğunluk değerinin bileşen durumuna yansıtılmasından sorumludur.
- ColumnsMenu

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### ColumnsMenu
**Ne yapar**: Kullanıcının tablo kolonlarını açıp kapatmasını ve tablo yoğunluğunu (density) değiştirmesini sağlayan bir açılır menü (popover/menu) bileşenidir. Genellikle bir butona tıklanınca açılan bir panel içinde kolon toggle listesi ve yoğunluk seçenekleri sunar.

**Nasıl yapar**: Dışarıdan aldığı `columns`, `density`, `onDensityChange` ve isteğe bağlı `buttonLabel` prop'larını kullanarak bir kullanıcı arayüzü oluşturur. `columns` dizisindeki her bir öğe için bir checkbox veya toggle switch render eder; `density` değerine göre seçili yoğunluk seviyesini görsel olarak işaretler ve `onDensityChange` callback'i aracılığıyla yoğunluk değişikliklerini üst bileşene bildirir. `buttonLabel` prop'u verilmişse menüyü açan butonun metnini özelleştirir.

**Parametreler**:
- **columns**: `ColumnToggle[]` — Her bir kolonun görünürlük durumunu ve etiketini tutan obje dizisi. Toggle edilecek kolonların listesini belirler.
- **density**: `Density` — Tablonun mevcut yoğunluk ayarı (örneğin "compact", "standard", "comfortable" gibi değerler alabilir).
- **onDensityChange**: `(d: Density) => void` — Kullanıcı yoğunluk seçeneğini değiştirdiğinde çağrılan callback fonksiyonu. Yeni yoğunluk değerini parametre olarak alır.
- **buttonLabel**: `string` (opsiyonel) — Menüyü tetikleyen buton üzerinde gösterilecek metin. Verilmezse varsayılan bir etiket (örneğin "Columns") kullanılabilir.

**Dönüş**: `React.FC<{ columns: ColumnToggle[]; density: Density; onDensityChange: (d: Density) => void; buttonLabel?: string }>` — Belirtilen prop tiplerine sahip bir React fonksiyonel bileşeni döndürür. Bileşen doğrudan JSX içinde kullanılabilir.

---

## TYPE ALIASES

### ColumnToggle
```typescript
type ColumnToggle = { key: string; label: string; checked: boolean; onChange: (v: boolean) => void }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\ColumnsMenu.tsx::ColumnsMenu
- **params**: columns (ColumnToggle[]), density (Density), onDensityChange ((d: Density) => void), buttonLabel (string, optional)
- **ic_degiskenler**:
  - `_t` — translation function returned by `useI18n()` hook, used to localize all user-facing text strings in the component
- **Dönüş**: JSX.Element (renders a DropdownMenu.Root with column toggles and density radio group)

---

## NODE ID STANDARD

  file: src\components\admin\ColumnsMenu.tsx
  function: src\components\admin\ColumnsMenu.tsx::ColumnsMenu

---

## DISA AKTARILANLAR (EXPORTS)
  export: ColumnToggle
  export: ColumnsMenu

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** `shadow-[0_0_10px_rgba(34,211,238,0.3)]`, `shadow-[0_20px_50px_rgba(0,0,0,0.5)]`
- **height:** `max-h-[300px]`
- **width:** `min-w-[140px]`, `min-w-[240px]`
- **spacing:** (yok)
- **diğer:** `stroke-[4px]`, `tracking-[0.2em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-surface-deep`, `bg-white/5`, `border-b`, `border-cyan-400`, `border-white/10`, `border-white/5`, `text-cyan-400`, `text-slate-300`, `text-slate-500`, `text-surface-deep`, `text-xs`
- **Layout:** `custom-scrollbar`, `flex`, `gap-2`, `gap-3`, `h-1.5`, `h-12`, `h-4`, `h-px`, `items-center`, `justify-between`, `justify-center`, `overflow-y-auto`, `p-2`, `w-1.5`, `w-4`
- **Responsive:** (yok)
