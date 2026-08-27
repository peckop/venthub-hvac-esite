---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\InventoryDetailDrawer.tsx
skeleton_hash: 430f4ab6d93eb848
entity_hashes:
  func:InventoryDetailDrawer: d112e7d0baa4046c
  overview: 0293743016101c3c
  style_tokens: 173df4c477f18528
generated_at: 2026-08-27T08:02:16Z
---

## Genel Bakış
InventoryDetailDrawer, envanter öğelerinin ayrıntılarını gösteren bir React bileşenidir. Seçili ürünün stok miktarı, eşik değerleri ve hareket geçmişi gibi bilgileri bir yan çekmece (drawer) arayüzünde sunar. Kullanıcıların QR etiketi yazdırması, eşik güncellemesi, stok ayarlaması ve hareketleri geri alması gibi etkileşimli işlemleri destekler.

## Fonksiyon Grupları
### Ana Bileşen
Bileşenin giriş noktası ve render mantığını yönetir; props içinde gelen durum ve setter fonksiyonlarını kullanarak çekmece arayüzünü oluşturur. Escape tuşu ile çekmeceyi kapatma desteği sağlar, selected nesnesi yoksa null döner.
- InventoryDetailDrawer

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### InventoryDetailDrawer
**Ne yapar**: Seçili bir envanter ürününün detaylarını gösteren, sağdan kayarak açılan bir drawer (çekmece) bileşenidir. Ürün bilgileri, stok durumu, eşik değeri düzenleme, stok hareketi yapma, rezerve siparişler ve hareket geçmişi gibi bölümleri içerir. Radix UI Dialog altyapısını kullanarak modal bir yapı oluşturur.

**Nasıl yapar**: Bileşen, `props` parametresinden gerekli tüm verileri ve fonksiyonları destructure ederek alır. `selected` değeri yoksa `null` döner ve render işlemi gerçekleştirilmez. Radix UI `Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Close` bileşenlerini kullanarak semantik bir modal yapı kurar. `Dialog.Overlay` siyah yarı saydam bir perde oluşturur ve body scroll kilidi sağlar (yorumda "cetvel §2.5" referansı ile ASLA çıkarılmaması gerektiği belirtilmiştir). `Dialog.Content` bileşenine `aria-modal="true"` elle eklenmiştir çünkü Radix'in otomatik olarak bu özelliği basmadığı belirtilmiştir (INV-ADMIN-OVERLAY-2 referansı). Ayrıca APG (ARIA Practices Guide) uyarınca panelin kendisine odaklanması gerektiği için `aria-describedby` undefined olarak ayarlanmıştır. İçerikte `useI18n` hook'u ile uluslararasılaştırma sağlanır. `selected.daily_velocity` tanımlı ve sıfırdan büyük olduğunda "Zeki Öneri Bölümü" gösterilir; bu bölümde 30 günlük satış hızı ve önerilen sipariş miktarı hesaplanır. `selected.abc_class` değeri `'A'` olduğunda ek bir bilgi mesajı görüntülenir. `hasWriteAccess` true olduğunda eşik değeri düzenleme ve stok hareketi bölümleri render edilir. `printQrLabel` fonksiyonu, QR etiket yazdırma butonuna tıklandığında çağrılır ve yazdırma işlemi sırasında buton devre dışı kalır. `Dialog.Root` bileşeninin `onOpenChange` olayı, dialog kapatıldığında `onClose` fonksiyonunu çağırır.

**Parametreler**:
- props: InventoryDetailDrawerProps — Bileşenin ihtiyacı olan tüm verileri ve callback fonksiyonlarını içeren props nesnesi. Aşağıdaki alt alanları içerir:
  - selected: bilinmiyor — Detayları gösterilecek seçili envanter ürünü. Bu değer yoksa bileşen null döner.
  - onClose: () => void — Drawer kapatıldığında çağrılan fonksiyon.
  - printingQr: boolean — QR etiket yazdırma işleminin devam edip etmediğini gösteren durum.
  - setPrintingQr: (value: boolean) => void — `printingQr` durumunu güncelleyen fonksiyon.
  - selectedStock: number | null | undefined — Seçili ürünün güncel stok miktarı. Null veya undefined ise "-" gösterilir.
  - selectedThreshold: number | '' — Kullanıcının ayarladığı eşik değeri. Boş string olabilir.
  - setSelectedThreshold: (value: number | '') => void — Eşik değerini güncelleyen fonksiyon.
  - defaultThreshold: number | null | undefined — Varsayılan eşik değeri. `selectedThreshold` boş olduğunda bu değer gösterilir.
  - saving: boolean — Eşik değeri kaydetme işleminin devam edip etmediğini gösteren durum.
  - saveThreshold: (productId: string) => void — Eşik değerini kaydetmek için çağrılan fonksiyon. `selected.product_id` parametre olarak iletilir.
  - hasWriteAccess: boolean — Kullanıcının yazma yetkisi olup olmadığını belirten değer. Eşik düzenleme, stok hareketi ve son hareketi geri alma bölümleri bu değere bağlı olarak gösterilir.
  - moveQty: number | string — Stok hareketi için girilen miktar değeri.
  - setMoveQty: (value: number | string) => void — `moveQty` değerini güncelleyen fonksiyon.
  - moving: boolean — Stok hareketi işleminin devam edip etmediğini gösteren durum.
  - adjustStock: bilinmiyor — Stok düzeltme işlemi için çağrılan fonksiyon. `InventoryStockAdjust` bileşenine `onAdjust` prop'u olarak iletilir.
  - reservedOrders: bilinmiyor — Rezerve siparişlerin listesi. `InventoryReservedTable` bileşenine prop olarak iletilir.
  - movements: Array — Stok hareket geçmişi kayıtları. `InventoryMovementHistory` bileşenine prop olarak iletilir. Dizi uzunluğu sıfırdan büyükse "son hareketi geri al" butonu gösterilir.
  - undoLastMovement: () => void — Son stok hareketini geri almak için çağrılan fonksiyon.
  - undoing: boolean — Geri alma işleminin devam edip etmediğini gösteren durum.

**Dönüş**: JSX.Element — Radix UI Dialog bileşenlerinden oluşan drawer arayüzünü döndürür. `selected` null veya undefined ise `null` döner.

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
  - `selected` — `props`'tan destructure edilen seçili envanter satırı (`InventoryRow`); drawer kapatma kontrolünde `if (!selected) return null` ile null-guard yapılır; `selected.name`, `selected.product_id`, `selected.physical_stock`, `selected.daily_velocity`, `selected.available_stock`, `selected.abc_class` alanlarına erişilir
  - `onClose` — `props`'tan destructure edilen drawer kapatma fonksiyonu; `Dialog.Root` bileşeninin `onOpenChange` handler'ında `next` false ise çağrılır
  - `printingQr` — `props`'tan destructure edilen QR yazdırma durumu (boolean); QR butonunun `disabled` durumunu ve buton metnini kontrol eder
  - `setPrintingQr` — `props`'tan destructure edilen QR yazdırma durumunu güncelleyen setter fonksiyonu; `printQrLabel` fonksiyonuna ikinci argüman olarak geçilir
  - `selectedStock` — `props`'tan destructure edilen mevcut stok miktarı; özet kartında `?? '-'` fallback ile görüntülenir
  - `selectedThreshold` — `props`'tan destructure edilen eşik değeri; eşik alarm kartında ve input'un `value` prop'unda kullanılır; `=== ''` kontrolüyle boş durum ayrımı yapılır
  - `setSelectedThreshold` — `props`'tan destructure edilen eşik değerini güncelleyen setter fonksiyonu; input `onChange` handler'ında `e.target.value` boşsa `''` değilse `Number(e.target.value)` atanır; reset butonunda `''` atanır
  - `defaultThreshold` — `props`'tan destructure edilen varsayılan eşik değeri; eşik alarm kartında `selectedThreshold === ''` olduğunda `?? '-'` fallback ile kullanılır
  - `saving` — `props`'tan destructure edilen kaydetme işlemi durumu (boolean); eşik kaydet ve reset butonlarının `disabled` durumunu kontrol eder
  - `saveThreshold` — `props`'tan destructure edilen eşiği kaydeden fonksiyon; eşik kaydet butonu `onClick`'inde `selected.product_id` argümanıyla çağrılır
  - `hasWriteAccess` — `props`'tan destructure edilen yazma yetkisi durumu (boolean); eşik düzenleme bölümü, stok düzeltme bölümü ve son hareketi geri al butonunun koşullu render'ını kontrol eder
  - `moveQty` — `props`'tan destructure edilen stok hareket miktarı; `InventoryStockAdjust` bileşeninin `moveQty` prop'una geçilir
  - `setMoveQty` — `props`'tan destructure edilen hareket miktarını güncelleyen setter fonksiyonu; `InventoryStockAdjust` bileşeninin `setMoveQty` prop'una geçilir
  - `moving` — `props`'tan destructure edilen stok hareket işlemi durumu (boolean); `InventoryStockAdjust` bileşeninin `moving` prop'una geçilir
  - `adjustStock` — `props`'tan destructure edilen stok düzeltme fonksiyonu; `InventoryStockAdjust` bileşeninin `onAdjust` prop'una geçilir
  - `reservedOrders` — `props`'tan destructure edilen rezerve sipariş listesi (`ReservedRow[]`); `InventoryReservedTable` bileşeninin `reservedOrders` prop'una geçilir
  - `movements` — `props`'tan destructure edilen stok hareket geçmişi (`Movement[]`); `InventoryMovementHistory` bileşeninin `movements` prop'una geçilir; `.length > 0` kontrolüyle geri al butonunun koşullu render'ını kontrol eder
  - `undoLastMovement` — `props`'tan destructure edilen son hareketi geri alma fonksiyonu; hareket geçmişi başlığının geri al butonu `onClick`'inde çağrılır
  - `undoing` — `props`'tan destructure edilen geri alma işlemi durumu (boolean); geri al butonunun `disabled` durumunu ve buton metnini kontrol eder
  - `t` — `useI18n()` hook'undan destructure edilen i18n çeviri fonksiyonu; tüm UI metinlerinde, QR etiket parametrelerinde ve `stockLine` interpolasyonunda (`{ count: selected.physical_stock }`) kullanılır
- **Dönüş**: `JSX.Element | null` — `selected` falsy ise `null`, aksi halde Radix `Dialog.Root` ile sarmalanmış drawer JSX'i

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