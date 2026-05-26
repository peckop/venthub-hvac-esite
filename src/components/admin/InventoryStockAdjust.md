---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryStockAdjust.tsx
skeleton_hash: 257f3a60c6c02a8b
generated_at: 2026-05-23T21:53:10Z
---

## Genel Bakış
`InventoryStockAdjust` bileşeni, admin panelinde bir ürünün stok miktarını ayarlamak için kullanılan bir React bileşenidir. Kullanıcıdan girilen miktarı alır, hareket durumu ve güncelleme işlevi üzerinden üst katmana bildirir ve bekleme durumunu yönetir.

## Fonksiyon Grupları
### UI Render ve Etkileşim
Bu grup, bileşenin görsel arayüzünü oluşturur, giriş alanı ve butonları render eder ve kullanıcı etkileşimlerini yakalar.
- InventoryStockAdjust

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `onAdjust` prop'u verilmezse, stok miktarı ayarlama işlemi gerçekleşemez.  
[Aksiyom 2]: Eğer `setMoveQty` prop'u verilmezse, kullanıcı tarafından girilen miktar değeri yerel durumda güncellenemez.  
[Aksiyom 3]: Eğer `moving` prop'u verilmezse, butonların etkin/devre dışı durumu belirlenemez ve kullanıcı arayüzü beklenen loading durumunu göstermeyebilir.  
[Aksiyom 4]: Eğer `moveQty` prop'u verilmezse, girişte gösterilecek miktar değeri tanımlı olmayacak ve kullanıcı girişi boş veya tanımsız başlayabilir.  
[Aksiyom 5]: Eğer `_productId` prop'u verilmezse, hangi ürünün stoku ayarlanacağı belirlenemez ve `onAdjust` çağrısı anlamlı bir veri taşıyamaz.

---

## FONKSIYON DETAYLARI

### InventoryStockAdjust
**Ne yapar**: Envanter stoğu ayarlama işlemini yönetmek için kullanılan bir bileşendir.  
**Nasıl yapar**: `_productId`, `onAdjust`, `moving`, `moveQty` ve `setMoveQty` prop’larını alır; bu değerleri kullanarak stoğu ayarlama arayüzünü oluşturur, `moveQty` değişikliklerini `setMoveQty` ile günceller ve stoğın nihai değeri belirlendiğinde `onAdjust` fonksiyonunu çağırarak dış dünyaya bildirir.  
**Parametreler**:
- _productId: string veya number — Ayarlanacak ürünün benzersiz kimliği  
- onAdjust: function — Stok miktarı değiştiğinde dışarıya bildirilecek geri çağırım fonksiyonu  
- moving: boolean — Stok hareketinin gerçekleşip gerçekleşmediğini gösteren bayrak  
- moveQty: number — Kullanıcının ayarlamak istediği miktar  
- setMoveQty: function — `moveQty` durumunu güncelleyen setter fonksiyonu  
**Dönüş**: void — Fonksiyon bir değer döndürmez; sadece yan etkiler (state güncelleme ve callback çağrısı) üzerinden işini yapar.

---

## INTERFACES

### InventoryStockAdjustProps
- `_productId: string`
- `onAdjust: (_productId: string, delta: number, reason: string) => void`
- `moving: boolean`
- `moveQty: number`
- `setMoveQty: (qty: number) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/InventoryStockAdjust.tsx::InventoryStockAdjust
- **params**: _productId, onAdjust, moving, moveQty, setMoveQty
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (React element)

---

## NODE ID STANDARD

  file: src\components\admin\InventoryStockAdjust.tsx
  function: src\components\admin\InventoryStockAdjust.tsx::InventoryStockAdjust

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryStockAdjust

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** (yok)
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `tracking-[0.2em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-emerald-500/10`, `bg-rose-500/10`, `bg-white/[0.03]`, `border-emerald-500/20`, `border-rose-500/20`, `border-white/5`, `text-emerald-400`, `text-rose-400`, `text-slate-500`, `text-sm`, `text-white`, `text-xs`
- **Layout:** `flex`, `flex-1`, `gap-3`, `h-12`, `items-center`, `w-24`
- **Responsive:** (yok)
