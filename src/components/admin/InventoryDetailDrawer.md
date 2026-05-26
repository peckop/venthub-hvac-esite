---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryDetailDrawer.tsx
skeleton_hash: b4c161454e49e38a
generated_at: 2026-05-23T21:53:04Z
---

## Genel Bakış
`InventoryDetailDrawer` bileşeni, yönetim panelinde bir envanter öğesinin ayrıntılarını yan panel (drawer) içinde görüntüleyen ve kullanıcının bu öğeyi düzenlemesine ya da silmesine olanak tanıyan bir React bileşenidir. Props aracılığıyla gelen envanter verisini alır, form durumunu yönetir ve güncelleme/silme gibi işlemler için API servislerine yönlendirme yapar.

## Fonksiyon Grupları
### UI Render & Layout
Drawer’ın başlık, içerik alanı ve aksiyon butonları (kaydet, iptal, sil) gibi görsel yapısını oluşturur ve JSX çıktısını üretir.
- InventoryDetailDrawer

### State & Event Management
Kullanıcı girdilerini (form alanları) izler, bileşen içi durumu (state) günceller ve buton tıklamaları gibi olayları yönetir.
- InventoryDetailDrawer

### Veri İşleme & Servis Entegrasyonu
Formdan alınan veriyi doğrular, envanter güncelleme veya silme gibi API çağrılarını başlatır ve gelen yanıtları işleyerek UI’yı günceller.
- InventoryDetailDrawer

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### InventoryDetailDrawer
**Ne yapar**: InventoryDetailDrawer, bir envanter öğesinin detaylarını görüntülemek için kullanılan bir drawer (çekmece) bileşenidir. Fonksiyon, aldığı InventoryDetailDrawerProps türündeki parametreye göre drawer'ın içeriğini ve davranışını belirler.
**Nasıl yapar**: Bir React bileşeni olarak, InventoryDetailDrawerProps tipindeki prop nesnesinde bulunan değerleri kullanarak ilgili drawer arayüzünü render eder. Drawer'ın görünürlüğü, gösterilecek veri ve olası callback'ler prop'lar aracılığıyla yönetilir.
**Parametreler**:
- props: InventoryDetailDrawerProps — Drawer'ın yapılandırmasını (açık/kapalı durumu, envanter detay verisi, kapatma işlevi vb.) taşıyan prop nesnesidir.
**Dönüş**: Return tipi belirtilmemiştir; bu nedenle dönüş değeri bilinmemektedir.

---

## INTERFACES

### InventoryDetailDrawerProps
- `selected: InventoryRow | null`
- `setSelected: (v: InventoryRow | null) => void`
- `printingQr: boolean`
- `setPrintingQr: (v: boolean) => void`
- `selectedStock: number | null`
- `selectedThreshold: number | ''`
- `setSelectedThreshold: (v: number | '') => void`
- `defaultThreshold: number | null`
- `saving: boolean`
- `saveThreshold: (id: string) => void`
- `hasWriteAccess: boolean`
- `moveQty: number`
- `setMoveQty: (v: number) => void`
- `moving: boolean`
- `adjustStock: (id: string, delta: number, reason: string) => void`
- `reservedOrders: ReservedRow[]`
- `movements: Movement[]`
- `undoLastMovement: () => void`
- `undoing: boolean`
- `t: (key: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryDetailDrawer.tsx::InventoryDetailDrawer
- **params**: `props: InventoryDetailDrawerProps`
- **ic_degiskenler**:
  - `selected` — currently selected inventory item (InventoryRow); used to display name, product_id, daily_velocity, available_stock, abc_class via dot access; passed to `printQrLabel`.
  - `setSelected` — state setter for `selected`; called with `null` to close drawer (backdrop click, close button, Escape key via `onKey`).
  - `printingQr` — boolean flag; disables QR button and shows `'...'` when true.
  - `setPrintingQr` — state setter for `printingQr`; passed as second argument to `printQrLabel`.
  - `selectedStock` — numeric stock level or `'-'`; displayed in “Güncel Stok” card.
  - `selectedThreshold` — string or number; threshold input value; used in condition to decide display value (if empty, falls back to `defaultThreshold`).
  - `setSelectedThreshold` — state setter for threshold; called with `e.target.value === '' ? '' : Number(e.target.value)` on input change.
  - `defaultThreshold` — default threshold value; used when `selectedThreshold` is empty.
  - `saving` — boolean; disables threshold save button and shows `'...'`.
  - `saveThreshold` — function to save threshold; called with `selected.product_id`.
  - `hasWriteAccess` — boolean; controls visibility of write‑access sections (threshold edit, stock adjust, undo button).
  - `moveQty` — number; stock movement quantity passed to `InventoryStockAdjust`.
  - `setMoveQty` — state setter for `moveQty`; passed to `InventoryStockAdjust`.
  - `moving` — boolean; stock movement in progress; passed to `InventoryStockAdjust`.
  - `adjustStock` — function to adjust stock; passed as `onAdjust` to `InventoryStockAdjust`.
  - `reservedOrders` — array of ReservedRow; passed to `InventoryReservedTable`.
  - `movements` — array of Movement; passed to `InventoryMovementHistory`; also used for length check in undo button condition.
  - `undoLastMovement` — function to undo last movement; called on button click.
  - `undoing` — boolean; disables undo button and shows `'Geri Alınıyor...'`.
  - `t` — translation function; called with `'admin.ui.close'` for close button label.
  - `printQrLabel` — imported async function from `'./InventoryQrLabel'`; called with `selected` and `setPrintingQr` inside QR button onClick (using `void` to ignore promise).
  - `useEffect` — React hook; used to register/unregister a keyboard event listener for Escape key.
  - `window` — global object; `addEventListener('keydown', onKey)` / `removeEventListener('keydown', onKey)`.
  - `onKey` — arrow function defined inside `useEffect` callback; checks `e.key === 'Escape'` and calls `setSelected(null)`.
- **Dönüş**: `JSX.Element | null` — returns `null` if `!selected`, otherwise renders a drawer panel (fragment containing a backdrop and an aside with all item details, controls, and sub‑components).

---

## NODE ID STANDARD

  file: src\components\admin\InventoryDetailDrawer.tsx
  function: src\components\admin\InventoryDetailDrawer.tsx::InventoryDetailDrawer

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryDetailDrawer

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** `shadow-[-20px_0_50px_rgba(0,0,0,0.5)]`, `shadow-[0_0_10px_rgba(34,211,238,0.8)]`, `shadow-[0_0_15px_rgba(245,158,11,0.5)]`, `shadow-[0_0_15px_rgba(34,211,238,0.5)]`, `shadow-[0_0_30px_rgba(34,211,238,0.05)]`
- **height:** (yok)
- **width:** `sm:w-[480px]`
- **spacing:** (yok)
- **diğer:** `tracking-[0.2em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-lg`, `rounded-hvac-xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500`, `bg-black/60`, `bg-cyan-400`, `bg-cyan-400/10`, `bg-white/[0.02]`, `bg-white/[0.03]`, `border-b`, `border-cyan-400/20`, `border-l`, `border-none`, `border-white/10`, `border-white/5`, `text-3xl`, `text-base`, `text-cyan-300`
- **Layout:** `-right-8`, `-top-8`, `absolute`, `backdrop-blur-sm`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `grid`
- **Responsive:** `sm:` prefix kullanımları
