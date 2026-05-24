---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AdminToolbar.tsx
skeleton_hash: 9fd39e890d43433c
generated_at: 2026-05-23T21:51:01Z
---

## Genel Bakış
`AdminToolbar` bileşeni, yönetim panelindeki veri listelerini filtrelemek, aramak ve toplu işlem seçeneklerini sunmak için tasarlanmış bir araç çubuğudur. Gelen props’ları (arama, seçim, chip’ler, toggle’lar, temizleme ve kayıt sayısı gibi) alarak UI öğelerini oluşturur ve kullanıcı etkileşimlerini üst katmana iletir.

## Fonksiyon Grupları
### UI Oluşturma ve Görsel Düzen
Bu grup, toolbar’ın görsel bileşenlerini (arama kutusu, seçim menüsü, chip etiketleri, toggle anahtarları ve kayıt sayısı göstergesi) render eder.
- AdminToolbar

### Etkileşim ve Olay Yönetimi
Kullanıcı eylemlerini (arama değişikliği, seçim değişikliği, chip kaldırma, toggle değişikliği, temizleme) yakalar ve ilgili callback fonksiyonlarını (`onClear` vb.) tetikler.
- AdminToolbar

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### AdminToolbar
**Ne yapar**: Admin arayüzünde kullanıcıya filtreleme, arama ve seçim yapma olanağı sağlayan bir toolbar bileşenidir. Filtreleme durumunu göstermek ve temizlemek için gerekli kontrolleri sunar.

**Nasıl yapar**: Kendisine iletilen `search`, `select`, `chips`, `toggles` gibi state ve callback prop'ları aracılığıyla içindeki arama kutusu, seçim kutuları, chip listesi ve toggle düğmelerini yönetir. `onClear` ile tüm aktif filtrelerin sıfırlanmasını sağlar ve `recordCount` ile mevcut kayıt sayısını görüntüler.

**Parametreler**:
- `search`: any — Arama çubuğu için gerekli state ve işleyici bilgilerini içeren prop.
- `select`: any — Seçim kutularının state ve değişim işleyicilerini içeren prop.
- `chips`: any — Aktif filtreleri temsil eden chip bileşenlerinin listesini ve temizleme işleyicilerini içeren prop.
- `toggles`: any — Açma/kapama düğmelerinin state ve değişim işleyicilerini içeren prop.
- `onClear`: any — Tüm filtreleri temizlemek için çağrılan callback fonksiyonu.
- `recordCount`: any — Filtrelenmiş kayıt sayısını gösteren değer.
- `rig`: any — Toolbar'ın düzen veya davranışına ilişkin ek yapılandırma parametresi.

**Dönüş**: `React.FC<AdminToolbarProps>` — AdminToolbar bileşenini React fonksiyonel bileşeni olarak döndürür. Bu bileşen, AdminToolbarProps tipindeki prop'ları alır ve JSX formatında bir toolbar arayüzü render eder.

---

## TYPE ALIASES

### AdminToolbarChip
```typescript
type AdminToolbarChip = {
  key: string
  label: string
  active: boolean
  onToggle: () => void
  classOn?: string
  classOff?: string
  title?: string
}
```

### AdminToolbarToggle
```typescript
type AdminToolbarToggle = {
  key: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  title?: string
}
```

### AdminToolbarSelectOption
```typescript
type AdminToolbarSelectOption = { value: string; label: string }
```

### AdminToolbarProps
```typescript
type AdminToolbarProps = {
  search?: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    title?: string
    focusShortcut?: string // default '/'
  }
  select?: {
    value: string
  
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AdminToolbar.tsx::keyboard_shortcut_effect
- **params**: yok
- **ic_degiskenler**:
  - `search` — closure'dan erişilen, arama inputunun gösterilip gösterilmeyeceğini belirleyen prop. `if (!search) return` ile erken çıkış sağlar.
  - `handleKeyDown` — iç içe tanımlanmış `KeyboardEvent` işleyicisi.
  - `inputRef` — closure'dan erişilen, `/` tuşuna basıldığında odaklanılacak arama inputuna ait React ref'i.
  - `window` — global `window` nesnesi; `addEventListener` ve `removeEventListener` ile klavye olayının dinlenmesini sağlar.
- **Dönüş**: cleanup fonksiyonu (`() => window.removeEventListener('keydown', handleKeyDown)`)

### [N2_NASIL] AST Pointer: AdminToolbar.tsx::handleKeyDown
- **params**: `e` — KeyboardEvent objesi
- **ic_degiskenler**:
  - `e.key` — basılan tuşun değeri (`'/'`).
  - `document.activeElement?.tagName` — aktif DOM elementinin etiket adı; `INPUT` ve `TEXTAREA` kontrolü için kullanılır.
  - `inputRef` — closure'dan erişilen, `/` tuşuna basıldığında `focus()` çağrılacak ref.
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: AdminToolbar.tsx::hydration_effect
- **params**: yok
- **ic_degiskenler**:
  - `storageKey` — closure'dan erişilen, localStorage anahtarı.
  - `persist` — closure'dan erişilen, hangi kontrollerin kalıcı olacağını belirleyen yapılandırma objesi (`{ search?, select?, chips?, toggles? }`).
  - `select` — closure'dan erişilen, dropdown seçim state'i (`{ value: string, onChange: Function }`).
  - `chips` — closure'dan erişilen, chip listesi (`Array<{ key, active, onToggle }>`).
  - `toggles` — closure'dan erişilen, toggle listesi (`Array<{ key, checked, onChange }>`).
  - `hydratedRef` — closure'dan erişilen, hidrasyonun tamamlanıp tamamlanmadığını tutan `React.MutableRefObject<boolean>`.
  - `enable` — `persist` yapılandırmasına göre oluşturulmuş, hangi state'lerin geri yükleneceğini belirleyen obje.
  - `raw` — `localStorage.getItem(storageKey)` sonucu ham string veri.
  - `saved` — `JSON.parse(raw)` ile parse edilmiş, kaydedilmiş state (`{ search?, select?, chips?, toggles? }`).
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: AdminToolbar.tsx::hydration_chip_callback
- **params**: `ch` — chip objesi (`{ key: string, active: boolean, onToggle: Function }`)
- **ic_degiskenler**:
  - `saved.chips` — closure'dan erişilen, parse edilmiş kaydedilmiş chip durumu (`Record<string, boolean>`).
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: AdminToolbar.tsx::hydration_toggle_callback
- **params**: `t` — toggle objesi (`{ key: string, checked: boolean, onChange: Function }`)
- **ic_degiskenler**:
  - `saved.toggles` — closure'dan erişilen, parse edilmiş kaydedilmiş toggle durumu (`Record<string, boolean>`).
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: AdminToolbar.tsx::persistence_effect
- **params**: yok
- **ic_degiskenler**:
  - `storageKey` — closure'dan erişilen localStorage anahtarı.
  - `hydratedRef` — closure'dan erişilen, hidrasyonun tamamlanıp tamamlanmadığını tutan `React.MutableRefObject<boolean>`.
  - `persist` — closure'dan erişilen persist yapılandırması.
  - `select` — closure'dan erişilen select state'i (`{ value: string }`).
  - `chips` — closure'dan erişilen chip listesi (`Array<{ key, active }>`).
  - `toggles` — closure'dan erişilen toggle listesi (`Array<{ key, checked }>`).
  - `enable` — hangi alanların kaydedileceğini belirleyen obje.
  - `payload` — `localStorage.setItem` ile yazılacak veri (`Record<string, unknown>`).
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: AdminToolbar.tsx::render_select_option_desktop
- **params**: `opt` — option objesi (`{ value: string, label: string }`)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (`<option>`)

### [N8_NASIL] AST Pointer: AdminToolbar.tsx::render_toggle_desktop
- **params**: `tog` — toggle objesi (`{ key:

---

## NODE ID STANDARD

  file: src\components\admin\AdminToolbar.tsx
  function: src\components\admin\AdminToolbar.tsx::AdminToolbar

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminToolbar
  export: AdminToolbarChip
  export: AdminToolbarProps
  export: AdminToolbarSelectOption
  export: AdminToolbarToggle