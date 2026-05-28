---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryStockAdjust.tsx
skeleton_hash: 257f3a60c6c02a8b
entity_hashes:
  func:InventoryStockAdjust: 140b16e336bb5af7
  overview: 3b1f0525645c9b2f
  style_tokens: 333546eed756e72e
generated_at: 2026-05-28T22:35:34Z
---

## Genel Bakış
`InventoryStockAdjust` bileşeni, bir ürünün stok miktarını ayarlamak için kullanılan bir yönetim arayüzü sunar. Kullanıcıdan alınan miktar değişikliği, dışarıdan sağlanan `onAdjust` callback’i aracılığıyla üst katmana iletilir ve bileşen içinde geçici bir durum (`moveQty`) yönetilir.

## Fonksiyon Grupları
### UI ve Props İşleme
Bileşen, gelen `productId`, `moving`, `onAdjust`, `moveQty` ve `setMoveQty` gibi prop’ları alır, bunları JSX içinde uygun giriş alanları ve butonlarla bağlayarak kullanıcı etkileşimini sağlar.  
- InventoryStockAdjust

### Durum ve Etkileşim Yönetimi
Kullanıcı miktar girişi yaptığında `setMoveQty` ile geçici miktar güncellenir; “Ayarlama” butonuna basıldığında `onAdjust` çağrılarak stok güncelleme işlemi tetiklenir.  
- (İçeride tanımlı event handler’lar ve state güncellemeleri – doğrudan fonksiyon listesinde yer almaz ancak `InventoryStockAdjust` içinde yer alır)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır. Aşağıdaki aksiyomlar, **InventoryStockAdjust** bileşeninin fonksiyon imzasından türetilmiştir.

**Aksiyom 1**: Eğer `_productId` sağlanmazsa, bileşen hangi ürünün stok ayarının yapılacağını belirleyemez ve işlem **başarısız** olur.  

**Aksiyom 2**: Eğer `onAdjust` fonksiyonu sağlanmazsa, stok ayarlama işlemi tamamlandığında **hiçbir geri bildirim** (ör. API çağrısı, durum güncellemesi) gerçekleşmez.  

**Aksiyom 3**: Eğer `moving` değeri `true` değilse, bileşen **hareket (loading) göstergesi** göstermemeli ve kullanıcı etkileşimi **engellenmemelidir**.  

**Aksiyom 4**: Eğer `moveQty` değeri tanımlı değilse veya `null/undefined` ise, bileşen **geçerli bir miktar** alana kadar **işlem yapmaz** ve muhtemelen bir doğrulama hatası gösterir.  

**Aksiyom 5**: Eğer `setMoveQty` fonksiyonu sağlanmazsa, kullanıcı tarafından girilen miktar **bileşen içinde saklanamaz** ve UI’da **girdi değişikliği** yansıtılamaz.  

**Aksiyom 6**: Eğer `moveQty` negatif bir sayı ise, **stok azaltma** mantığı dışındaki bir senaryo olduğu için **işlem reddedilir** (negatif miktar kabul edilmez).  

**Aksiyom 7**: Eğer `setMoveQty` bir fonksiyon değilse, **state güncellemesi** yapılamaz ve bileşen **runtime hatası** verir.  

**Aksiyom 8**: Eğer `onAdjust` bir fonksiyon değilse, **stok ayarlama** tamamlandığında **callback** tetiklenemez ve **yanıt** alınamaz.

---

## FONKSİYON DETAYLARI

### InventoryStockAdjust
**Ne yapar**: Belirli bir ürün için hızlı stok girişi veya çıkışı yapılmasını sağlayan bir React bileşenidir. Kullanıcı miktar girip iki butondan birine tıklayarak manuel stok hareketi oluşturur.

**Nasıl yapar**: Bir input alanı ve iki buton içeren bir bölüm render eder. Input `moveQty` state'ine bağlıdır ve değer değiştiğinde `setMoveQty` ile güncellenir (en az 1 olacak şekilde zorlanır). "Stok Girişi" butonu, `onAdjust` callback'ine pozitif miktar ve `'manual_in'` türü ile çağrı yapar; "Stok Çıkışı" butonu negatif miktar ve `'manual_out'` türü ile çağrı yapar. Butonlar `moving` prop'u `true` iken devre dışı kalır.

**Parametreler**:
- `_productId`: `string` — Stok hareketi yapılacak ürünün benzersiz kimliği. `onAdjust` callback'ine parametre olarak iletilir.
- `onAdjust`: `(productId: string, qty: number, type: 'manual_in' | 'manual_out') => void` — Stok hareketini gerçekleştiren callback fonksiyonu. Ürün ID'si, miktar (pozitif veya negatif) ve hareket türü parametrelerini alır.
- `moving`: `boolean` — Bir stok hareketi işlemi devam ederken butonların devre dışı bırakılmasını sağlayan bayrak.
- `moveQty`: `number` — Input alanındaki mevcut miktar değeri. Varsayılan olarak en az 1 olacak şekilde yönetilir.
- `setMoveQty`: `React.Dispatch<React.SetStateAction<number>>` — `moveQty` state'ini güncellemek için kullanılan fonksiyon. Input onChange olayında çağrılır.

**Dönüş**: `JSX.Element` — Stok hareketi arayüzüne ait bir `section` elementi döndürür.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryStockAdjust.tsx::InventoryStockAdjust
- **params**: `_productId`, `onAdjust`, `moving`, `moveQty`, `setMoveQty`
- **ic_degiskenler**:
  - `moveQty` — Mevcut stok hareket miktarını tutar; input değeri olarak ve `onAdjust` çağrısında mutlak değeri (`Math.abs(moveQty)`) ile kullanılır.
  - `setMoveQty` — Stok miktarını güncellemek için kullanılan fonksiyon; input `onChange` olayında yeni değeri hesaplayıp atar.
  - `moving` — Stok hareketi işleminin devam edip etmediğini belirten boolean; butonların `disabled` özelliğini kontrol eder.
  - `onAdjust` — Stok giriş/çıkış işlemini gerçekleştirmek için çağrılan callback; `_productId`, mutlak miktar ve işlem türü (`'manual_in'` veya `'manual_out'`) parametreleriyle çağrılır.
  - `_productId` — Stok hareketi yapılacak ürünün ID'si; `onAdjust` callback'ine ilk argüman olarak iletilir.
  - `e` — Input değişikliği event nesnesi; `e.target.value` üzerinden yeni miktar alınır ve `Number()` ile sayıya dönüştürülür.
- **Dönüş**: React.ReactNode (JSX elemanı)

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
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-emerald-500/10`, `bg-rose-500/10`, `bg-white/3`, `border-emerald-500/20`, `border-rose-500/20`, `border-white/5`, `focus-visible:border-cyan-400/40`, `hover:bg-emerald-500/20`, `hover:bg-rose-500/20`, `text-emerald-400`, `text-rose-400`, `text-slate-500`, `text-sm`, `text-white`, `text-xs`
- **Layout:** `flex`, `flex-1`, `gap-3`, `h-12`, `items-center`, `w-24`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-cyan-400/20`, `font-black`, `font-bold`, `ml-1`, `px-4`, `py-3`, `rounded-2xl`, `space-y-4`, `tracking-widest`, `transition-colors`, `transition-opacity`