---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\InventoryStockAdjust.tsx
skeleton_hash: 2733abe37bc58676
entity_hashes:
  func:InventoryStockAdjust: a603a8fb9cd928b0
  overview: 96a63ecb10c9f683
  style_tokens: cd4ce488b4601abd
generated_at: 2026-08-27T08:05:33Z
---

## Genel Bakış
`InventoryStockAdjust` bileşeni, bir ürünün stok miktarını ayarlamak için bir yönetim arayüzü sunar. Bileşen, dışarıdan sağlanan propları kullanarak kullanıcı etkileşimini yönetir ve stok ayarlama işlemini tetikler.

## Fonksiyon Grupları
### UI ve Props İşleme
Bileşen, gelen propları alır ve kullanıcı arayüzünü oluşturur. Bu grup, bileşenin görsel katmanını ve prop bağlamasını yönetir.
- InventoryStockAdjust

### Durum ve Etkileşim Yönetimi
Kullanıcı etkileşimlerini işler, geçici durumu günceller ve stok ayarlama işlemini tetikler. Bu grup, bileşenin davranışını ve olay yönetimini kapsar.
- (İçeride tanımlı olay işleyicileri ve durum güncellemeleri – doğrudan fonksiyon listesinde yer almaz ancak `InventoryStockAdjust` içinde yer alır)

---

## AXIOMS – Mimari Varsayımlar

Bu bileşen, stok ayarlama arayüzünü sunmak için dışarıdan sağlanan prop'lara bağımlıdır.

[Aksiyom 1]: Eğer `onAdjust` callback'i sağlanmazsa, kullanıcı stok ayarlaması yapamaz çünkü miktar değişikliği üst katmana iletilemez.

[Aksiyom 2]: Eğer `setMoveQty` fonksiyonu sağlanmazsa, kullanıcı miktar girişi yapamaz çünkü geçici durum güncellenemez.

[Aksiyom 3]: Eğer `moveQty` değeri sağlanmazsa, bileşen mevcut ayarlanacak miktarı görüntüleyeme

---

## FONKSİYON DETAYLARI

### InventoryStockAdjust
**Ne yapar**: Envanter yönetim panelinde hızlı stok hareketi (giriş ve çıkış) yapılmasını sağlayan bir React bileşenidir. Kullanıcının belirli bir ürün için sayısal değer girerek stok artırımı veya azaltımı yapmasına olanak tanır.

**Nasıl yapar**: `useI18n()` hook'u aracılığıyla uluslararasılaştırma fonksiyonu `t`'yi alır. Bileşen gövdesinde bir `section` içinde üç ana eleman render eder: bir sayısal `input` (minimum değeri 1), bir "Stok Giriş" butonu ve bir "Stok Çıkış" butonu. Input'un `onChange` olayında girilen değer `Math.max(1, Number(e.target.value || 1))` ifadesiyle işlenir; bu sayede değer her zaman 1 veya daha büyük olur. "Stok Giriş" butonuna tıklandığında `onAdjust` fonksiyonu pozitif `Math.abs(moveQty)` değeri ve `'manual_in'` tipiyle çağrılır. "Stok Çıkış" butonuna tıklandığında ise negatif `Math.abs(moveQty)` değeri ve `'manual_out'` tipiyle çağrılır. Her iki buton da `moving` durumu `true` olduğunda `disabled` hale gelir ve yarı saydam görünür.

**Parametreler**:
- `_productId`: bilinmiyor — Stok hareketi yapılacak ürünün kimlik bilgisini temsil eder. Alt çizgi önekiyle tanımlanmış olup bileşen içinde doğrudan `onAdjust` fonksiyonuna iletilir.
- `onAdjust`: bilinmiyor — Stok düzeltme işlemini tetikleyen geri çağırma (callback) fonksiyonudur. Üç parametre alır: ürün kimliği, miktar (pozitif veya negatif) ve hareket tipi (`'manual_in'` veya `'manual_out'`).
- `moving`: bilinmiyor — Stok hareketi işleminin devam edip etmediğini gösteren boolean değerdir. `true` olduğunda butonlar devre dışı bırakılır.
- `moveQty`: bilinmiyor — Hareket miktarını temsil eden sayısal değerdir. Input bileşeninin `value` prop'una atanır.
- `setMoveQty`: bilinmiyor — `moveQty` değerini güncelleyen durum ayarlayıcı (state setter) fonksiyondur. Input değişikliklerinde yeni değeri hesaplayarak çağrılır.

**Dönüş**: Bileşen bir React fonksiyon bileşeni olarak JSX yapısı döndürür. Kesin dönüş tipi kaynakta belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: react::React

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
- **params**:
  - `_productId` — stok hareketi yapılacak ürünün kimliği; `onAdjust` fonksiyonuna birinci argüman olarak iletilir
  - `onAdjust` — stok düzeltme işlemini tetikleyen fonksiyon; `(productId, miktar, hareket_tipi)` imzasıyla çağrılır
  - `moving` — stok hareketi işleminin devam edip etmediğini gösteren boolean; `true` iken butonlar disabled olur
  - `moveQty` — input alanında gösterilen ve hareket miktarı olarak kullanılan sayısal değer
  - `setMoveQty` — `moveQty` değerini güncelleyen state setter fonksiyonu; input onChange olayında `Math.max(1, Number(e.target.value || 1))` ile çağrılır
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `'admin.inventory.quickStockMovement'`, `'admin.inventory.stockEntry'`, `'admin.inventory.stockExit'` anahtarlarıyla metinleri çözümlemek için kullanılır
- **Dönüş**: JSX — bir `<section>` elementi içinde başlık, sayısal input ve iki butondan oluşan stok hareketi arayüzü döndürür

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
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-danger-weak`, `bg-admin-success-weak`, `bg-admin-surface-2`, `border-admin-border`, `border-admin-danger/30`, `border-admin-success/30`, `focus-visible:border-admin-accent/40`, `hover:bg-admin-danger-weak`, `hover:bg-admin-success-weak`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-success`, `text-sm`, `text-xs`
- **Layout:** `flex`, `flex-1`, `gap-3`, `h-12`, `items-center`, `w-24`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-admin-accent/30`, `font-bold`, `font-semibold`, `ml-1`, `px-4`, `py-3`, `rounded-admin-lg`, `space-y-4`, `transition-colors`, `transition-opacity`