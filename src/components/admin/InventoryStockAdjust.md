---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\admin\InventoryStockAdjust.tsx
skeleton_hash: c6f44b511d86ab45
entity_hashes:
  func:InventoryStockAdjust: a603a8fb9cd928b0
  overview: 96a63ecb10c9f683
  style_tokens: cd4ce488b4601abd
generated_at: 2026-08-27T13:11:17Z
---

## Genel Bakış
`InventoryStockAdjust` bileşeni, bir ürünün stok miktarını ayarlamak için kullanılan bir yönetim arayüzüdür. Dışarıdan sağlanan `onAdjust` callback'i aracılığıyla üst katmana stok güncelleme isteği iletir; geçici miktar değeri `moveQty` ve `setMoveQty` prop'ları üzerinden yönetilir. Bileşen, `moving` prop'u ile yükleme durumunu kontrol eder ve `_productId` ile hangi ürünün stok ayarının yapılacağını belirler.

## Fonksiyon Grupları

### UI ve Etkileşim Yönetimi
Bileşen, gelen prop'ları JSX içinde giriş alanları ve butonlarla bağlayarak kullanıcı etkileşimini sağlar. Kullanıcı miktar girişi yaptığında `setMoveQty` ile geçici miktar güncellenir; ayarlama butonuna basıldığında `onAdjust` çağrılarak stok güncelleme işlemi tetiklenir.
- InventoryStockAdjust

## Aksiyomlar

**Aksiyom 1**: Eğer `_productId` sağlanmazsa, bileşen hangi ürünün stok ayarının yapılacağını belirleyemez ve işlem başarısız olur.

**Aksiyom 2**: Eğer `onAdjust` fonksiyonu sağlanmazsa, stok ayarlama işlemi tamamlandığında hiçbir geri bildirim gerçekleşmez.

**Aksiyom 3**: Eğer `moving` değeri `true` değilse, bileşen hareket göstergesi göstermemeli ve kullanıcı etkileşimi engellenmemelidir.

**Aksiyom 4**: Eğer `moveQty` değeri tanımlı değilse veya geçersiz ise, bileşen geçerli bir miktar değeriyle çalışamaz.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### InventoryStockAdjust
**Ne yapar**: Envanter stok yönetimi için hızlı stok giriş ve çıkış işlemlerinin yapılabildiği bir arayüz bileşeni sunar. Kullanıcının belirli bir ürün için manuel stok hareketi (giriş veya çıkış) gerçekleştirmesine olanak tanır.

**Nasıl yapar**: `useI18n()` hook'u ile uluslararasılaştırma desteği alır ve `t` fonksiyonunu kullanarak metinleri çevrilmiş biçimde görüntüler. Bileşen, bir sayısal input alanı ve iki butondan oluşan kompakt bir form yapısı render eder. Input alanı `moveQty` değerini gösterir ve değişikliklerde `setMoveQty` ile güncellenir; değer 1'den küçük olamaz, `Math.max(1, ...)` ile alt sınır korunur. "Stok Girişi" butonuna tıklandığında `onAdjust` fonksiyonu pozitif mutlak değer ve `'manual_in'` tipiyle çağrılır. "Stok Çıkışı" butonuna tıklandığında ise negatif mutlak değer ve `'manual_out'` tipiyle çağrılır. `moving` durumu true olduğunda her iki buton da devre dışı bırakılır ve yarı saydam görünüm uygulanır.

**Parametreler**:
- `_productId`: InventoryStockAdjustProps içinde tanımlı — stok hareketi yapılacak ürünün kimlik bilgisi. Alt çizgi öneki ile tanımlanmış olup bileşen içinde doğrudan `onAdjust` fonksiyonuna aktarılır
- `onAdjust`: InventoryStockAdjustProps içinde tanımlı — stok ayarlama işlemini tetikleyen callback fonksiyonu. Üç parametre alır: ürün kimliği, miktar (pozitif veya negatif) ve hareket tipi (`'manual_in'` veya `'manual_out'`)
- `moving`: InventoryStockAdjustProps içinde tanımlı — stok hareketi işleminin devam edip etmediğini gösteren durum değeri. `true` olduğunda butonlar `disabled` durumuna geçer
- `moveQty`: InventoryStockAdjustProps içinde tanımlı — input alanında gösterilen ve hareket miktarını temsil eden sayısal değer
- `setMoveQty`: InventoryStockAdjustProps içinde tanımlı — `moveQty` değerini güncelleyen state setter fonksiyonu. Input onChange olayında `Math.max(1, Number(e.target.value || 1))` hesaplamasıyla çağrılır

**Dönüş**: JSX elementi döndüren bir React fonksiyon bileşeni. Dönen yapı, `space-y-4` sınıflı bir `<section>` içinde çevrilmiş başlık, sayısal input ve iki buton içeren bir `<div>` yapısından oluşur. Bileşenin dönüş tipi kodda açıkça belirtilmemiştir.

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
  - `_productId` — ürün kimliği, stok hareketi butonlarına tıklandığında `onAdjust` fonksiyonuna birinci argüman olarak iletilir
  - `onAdjust` — stok düzeltme fonksiyonu, "Stok Girişi" butonunda `(_productId, Math.abs(moveQty), 'manual_in')` ve "Stok Çıkışı" butonunda `(_productId, -Math.abs(moveQty), 'manual_out')` çağrılarıyla kullanılır
  - `moving` — hareket işlemi devam ederken true olan boolean; her iki butonun `disabled` prop'una atanır
  - `moveQty` — sayısal input'un `value` prop'una atanır; stok hareket miktarını temsil eder
  - `setMoveQty` — input onChange handler'ında `Math.max(1, Number(e.target.value || 1))` sonucuyla çağrılarak miktar güncellenir
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.inventory.quickStockMovement')`, `t('admin.inventory.stockEntry')` ve `t('admin.inventory.stockExit')` çağrılarıyla metinler yerelleştirilir
- **Dönüş**: JSX element (`<section>`); stok giriş/çıkış butonlarını ve miktar input'unu içeren bir form bölümü render eder

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