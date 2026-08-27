---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\admin\InventoryDetailDrawer.tsx
skeleton_hash: 8dfaab977cb74191
entity_hashes:
  func:InventoryDetailDrawer: d112e7d0baa4046c
  overview: 0293743016101c3c
  style_tokens: 173df4c477f18528
generated_at: 2026-08-27T13:08:53Z
---

## Genel Bakış
InventoryDetailDrawer, admin panelinde seçili bir envanter öğesinin detaylarını gösteren bir yan çekmece (drawer) bileşenidir. Ürünün stok miktarı, eşik değerleri, hareket geçmişi ve rezerve sipariş bilgilerini sunar. Kullanıcının QR etiketi yazdırması, eşik güncellemesi, stok ayarlaması ve hareketleri geri alması gibi etkileşimli işlemleri destekler.

## Fonksiyon Grupları

### Ana Bileşen
Çekmece arayüzünün render mantığını yönetir, Escape tuşu ile kapatma davranışını tanımlar ve alt bileşenler aracılığıyla ürün bilgileri, stok kartları, eşik formu, stok ayarlama aracı, zeki satın alma önerisi, rezerve sipariş tablosu ve hareket geçmişi bölümlerini sunar. Props olarak gelen durum ve callback fonksiyonlarını (örneğin `printQrLabel`, `saveThreshold`, `adjustStock`, `undoLastMovement`) ilgili UI etkileşimlerine bağlar.
- InventoryDetailDrawer

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### InventoryDetailDrawer
**Ne yapar**: Seçili bir envanter öğesinin detaylarını gösteren, ekranın sağ tarafından kayarak açılan bir yan panel (drawer) bileşenidir. Stok miktarı, eşik alarmı, akıllı satın alma önerisi, stok hareket geçmişi ve rezerve siparişler gibi bilgileri kullanıcıya sunar; yazma yetkisi olan kullanıcılar için eşik düzenleme ve stok ayarlama işlemleri sağlar.

**Nasıl yapar**: Radix UI `Dialog` bileşenlerini kullanarak modal bir drawer yapısı oluşturur. `Dialog.Root` ile açık/kapalı durumu yönetilir; `onOpenChange` callback'i aracılığıyla panel kapatıldığında `onClose` fonksiyonu tetiklenir. `Dialog.Overlay` siyah yarı saydam bir perde ekleyerek arka planı kilitler ve body scroll'u engeller (yorumda belirtildiği üzere cetvel §2.5 kuralı). `Dialog.Content` panelin kendisi olup `aria-modal="true"` özelliği elle eklenmiştir çünkü Radix'in otomatik olarak bu özelliği basmadığı belirtilmiştir; ayrıca `aria-describedby` özelliği `undefined` olarak ayarlanmıştır çünkü gövde semantik yapı (tablolar, çoklu bölüm) içerdiğinden APG (ARIA Practices Guide) uyarınca başlığa değil panelin kendisine odaklanılması gerektiği ifade edilmiştir. Bileşen `selected` prop'u null ise erken dönüş yaparak hiçbir şey render etmez. İçerik bölümünde `selected.daily_velocity` tanımlı ve sıfırdan büyük olduğunda "Zeki Öneri" bölümü koşullu olarak render edilir; bu bölümde 30 günlük satış hızı ve önerilen sipariş miktarı hesaplanarak gösterilir. `selected.abc_class` değeri `'A'` olduğunda ek bir bilgi mesajı görüntülenir. `hasWriteAccess` true olduğunda eşik düzenleme ve stok ayarlama bölümleri görünür hale gelir. Hareket geçmişi listesinde (`movements`) eleman varsa ve yazma erişimi mevcutsa son hareketi geri alma butonu gösterilir.

**Parametreler**:
- props: InventoryDetailDrawerProps — Bileşenin tüm verilerini ve callback fonksiyonlarını içeren props nesnesi. Aşağıdaki alanlar bu nesneden destructure edilir:
  - selected: bilinmiyor — Detayları gösterilecek seçili envanter öğesi. `name`, `product_id`, `physical_stock`, `daily_velocity`, `available_stock`, `abc_class` gibi alanlara sahiptir. Null olabilir; null ise bileşen hiçbir şey render etmez.
  - onClose: () => void — Panel kapatıldığında çağrılan fonksiyon.
  - printingQr: boolean — QR etiketi yazdırma işleminin devam edip etmediğini gösteren durum bayrağı.
  - setPrintingQr: (value: boolean) => void — `printingQr` durumunu güncelleyen setter fonksiyonu.
  - selectedStock: string | number | null | undefined — Seçili öğenin mevcut stok miktarı. Null veya undefined ise `'-'` olarak gösterilir.
  - selectedThreshold: string | number — Kullanıcının girdiği eşik değeri. Boş string olabilir.
  - setSelectedThreshold: (value: string | number) => void — Eşik değerini güncelleyen setter fonksiyonu.
  - defaultThreshold: string | number | null | undefined — Varsayılan eşik değeri. `selectedThreshold` boş string olduğunda bu değer kullanılır.
  - saving: boolean — Eşik kaydetme işleminin devam edip etmediğini gösteren durum bayrağı.
  - saveThreshold: (productId: string) => void — Belirtilen ürün kimliği için eşik değerini kaydeden fonksiyon.
  - hasWriteAccess: boolean — Kullanıcının yazma yetkisi olup olmadığını belirten bayrak. Eşik düzenleme, stok ayarlama ve hareket geri alma bölümlerinin görünürlüğünü kontrol eder.
  - moveQty: bilinmiyor — Stok hareketi için girilen miktar değeri.
  - setMoveQty: (value: bilinmiyor) => void — Stok hareketi miktarını güncelleyen setter fonksiyonu.
  - moving: boolean — Stok hareketi işleminin devam edip etmediğini gösteren durum bayrağı.
  - adjustStock: bilinmiyor — Stok ayarlama işlemini gerçekleştiren fonksiyon. `InventoryStockAdjust` bileşeninin `onAdjust` prop'una aktarılır.
  - reservedOrders: bilinmiyor — Rezerve siparişlerin listesi. `InventoryReservedTable` bileşenine prop olarak aktarılır.
  - movements: Array — Son stok hareketlerinin listesi. Uzunluğu kontrol edilerek geri alma butonunun görünürlüğü belirlenir ve `InventoryMovementHistory` bileşenine prop olarak aktarılır.
  - undoLastMovement: () => void — Son stok hareketini geri alan fonksiyon.
  - undoing: boolean — Geri alma işleminin devam edip etmediğini gösteren durum bayrağı.

**Dönüş**: JSX.Element — Radix UI Dialog yapısını temel alan, envanter detaylarını gösteren drawer bileşeninin render çıktısı. `selected` null ise `null` döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/inventory::InventoryRow
- import: ../../types/inventory::ReservedRow
- import: ./InventoryMovementHistory::InventoryMovementHistory
- import: ./InventoryMovementHistory::Movement
- import: ./InventoryQrLabel::printQrLabel
- import: ./InventoryReservedTable::InventoryReservedTable
- import: ./InventoryStockAdjust::InventoryStockAdjust
- import: @/i18n/I18nProvider::useI18n
- import: @radix-ui/react-dialog
- import: react::React

---

## INTERFACES

### InventoryDetailDrawerProps
STOK DETAY ÇEKMECESİ. Cetvel: `docs/standards/admin-design-standard.md` §4. NEDEN MODAL (§4.1/§4.3): §4.1 "tablo satırı seçince hızlı detay" için non-modal split panel öneriyor; ama §4.3 net: **"Modal bir drawer, sadece şekli değişmiş bir modaldır"** ve panelin non-modal SAYILMASI için arka içeriğin
- `selected: InventoryRow | null`
- `onClose: () => void`
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

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/InventoryDetailDrawer.tsx::InventoryDetailDrawer
- **params**: `props: InventoryDetailDrawerProps`
- **ic_degiskenler**:
  - `selected` — props'tan destructure edilen seçili envanter satırı (InventoryRow); drawer'ın gösterdiği ana veri kaynağı. `selected.name`, `selected.product_id`, `selected.physical_stock`, `selected.daily_velocity`, `selected.available_stock`, `selected.abc_class` alanlarına erişilir. `null` veya `undefined` ise fonksiyon `null` döner ve render gerçekleşmez
  - `onClose` — drawer'ı kapatma fonksiyonu; Dialog.Root bileşeninin `onOpenChange` callback'inde `next` değeri `false` olduğunda çağrılır
  - `printingQr` — QR etiketi yazdırma işlemi devam ediyor mu (boolean); QR butonunun `disabled` durumunu ve buton metnini kontrol eder
  - `setPrintingQr` — QR yazdırma durumunu değiştiren setter; `printQrLabel` fonksiyonuna ikinci argüman olarak iletilir
  - `selectedStock` — seçili ürünün güncel stok miktarı (sayı veya null); özet kartında `selectedStock ?? '-'` olarak gösterilir
  - `selectedThreshold` — seçili eşik alarm değeri (sayı veya boş string); input alanının `value`'su olarak kullanılır, boşsa `defaultThreshold` gösterilir
  - `setSelectedThreshold` — eşik değerini değiştiren setter; input `onChange`'inde `e.target.value` ile sayıya dönüştürülerek veya boş string olarak çağrılır, reset butonunda `''` ile çağrılır
  - `defaultThreshold` — varsayılan eşik değeri; `selectedThreshold` boş olduğunda özet kartında `defaultThreshold ?? '-'` olarak gösterilir
  - `saving` — eşik kaydetme işlemi devam ediyor mu (boolean); kaydet ve reset butonlarının `disabled` durumunu kontrol eder
  - `saveThreshold` — eşik değerini kaydetme fonksiyonu; kaydet butonu `onClick`'inde `saveThreshold(selected.product_id)` olarak çağrılır
  - `hasWriteAccess` — yazma yetkisi var mı (boolean); eşik düzenleme bölümü, stok hareketleri bölümü ve son hareketi geri alma butonunun görünürlüğünü kontrol eder
  - `moveQty` — stok hareket miktarı; `InventoryStockAdjust` bileşenine prop olarak iletilir
  - `setMoveQty` — stok hareket miktarını değiştiren setter; `InventoryStockAdjust` bileşenine prop olarak iletilir
  - `moving` — stok hareketi (düzeltme) işlemi devam ediyor mu (boolean); `InventoryStockAdjust` bileşenine prop olarak iletilir
  - `adjustStock` — stok düzeltme fonksiyonu; `InventoryStockAdjust` bileşeninin `onAdjust` prop'una atanır
  - `reservedOrders` — rezerve siparişler dizisi (ReservedRow[]); `InventoryReservedTable` bileşenine prop olarak iletilir
  - `movements` — stok hareket geçmişi dizisi (Movement[]); `InventoryMovementHistory` bileşenine prop olarak iletilir, ayrıca `movements.length > 0` kontrolüyle geri alma butonunun görünürlüğü belirlenir
  - `undoLastMovement` — son hareketi geri alma fonksiyonu; hareket geçmişi başlığındaki geri alma butonu `onClick`'inde çağrılır
  - `undoing` — geri alma işlemi devam ediyor mu (boolean); geri alma butonunun `disabled` durumunu ve metnini kontrol eder
  - `t` — i18n çeviri fonksiyonu; `useI18n()` hook'undan elde edilir, tüm UI metinlerinin çevirisinde kullanılır
- **Dönüş**: `selected` falsy ise `null`, aksi halde JSX (Dialog.Root bileşeni — Radix Dialog kullanılarak oluşturulmuş modal drawer)

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
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-accent-weak`, `bg-admin-surface`, `bg-admin-surface-2`, `bg-admin-warning`, `bg-black/60`, `border-admin-accent/30`, `border-admin-border`, `border-b`, `border-l`, `focus-visible:border-admin-accent/40`, `hover:bg-admin-accent-hover`, `hover:border-admin-warning/30`, `hover:text-admin-danger`, `hover:text-admin-fg`
- **Layout:** `-right-8`, `-top-8`, `absolute`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `grid`, `grid-cols-2`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `animate-in`, `animate-ping`, `animate-pulse`, `blur-3xl`, `border`, `disabled:opacity-50`, `duration-300`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-admin-accent/30`, `font-bold`, `font-mono`, `font-semibold`, `group`, `inset-0`