---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\hooks\useInventoryDetail.ts
skeleton_hash: ea70fcdd2ce69378
entity_hashes:
  func:useInventoryDetail: 8772b4d5485a8593
  overview: 4c4c791d580870aa
generated_at: 2026-08-15T18:26:23Z
---

## Genel Bakış

Bu modül, envanter (stok) detay verilerinin yönetimini sağlayan bir React custom hook sunar. Tek bir koordine edici hook olarak tasarım edilmiş olup, envanter detay sayfasının tüm veri ihtiyaçlarını merkezi bir noktadan karşılar.

## Fonksiyon Grupları

### Ana Hook (Koordinatör)

Envanter detay sayfasının tüm veri akışını yöneten merkezi hook. Veri çekme, durum yönetimi ve sayfa mantığını bir araya getirir.

- `useInventoryDetail` — Envanter detay bilgilerini getirir, ilgili durumları yönetir ve üst bileşenlere gerekli verileri sunar. Seçenek parametreleri ile farklı senaryolara esneklik sağlar.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için minimum bilgi ile üretilen varsayımlar aşağıdadır. Fonksiyon gövdesi mevcut olmadığından, çıkarımlar yalnızca **fonksiyon imzası** ve **modül sabitlerinden** yapılmıştır.

---

**[Aksiyom 1]**: Eğer `options` parametresi geçerli bir `UseInventoryDetailOptions` nesnesi olarak sağlanmazsa, hook beklenmeyen davranış sergiler veya hata fırlatır.

> **Gerekçe:** Fonksiyon imzası `options` parametresini zorunlu olarak alır (default değer yoktur).

---

**[Aksiyom 2]**: Eğer `UNDO_WINDOW_MS` sabiti hesaplanamaz veya geçerli bir sayısal (milisaniye) değere sahip olmazsa, geri alma (undo) penceresi mekanizması çalışamaz.

> **Gerekçe:** Sabit bir `binary_expression` olarak tanımlanmıştır; adı zaman penceresine işaret eder. Tam değeri bilinmiyor, ancak pozitif bir milisaniye değeri olması beklenir.

---

**[Aksiyom 3]**: Bu hook bir React bileşeninin veya özel hook'un içinde kullanımına yöneliktir; React hook kurallarına (conditional call yasak) uyulmazsa hata oluşur.

> **Gerekçe:** Dosya uzantısı `.ts` ve fonksiyon adı `useInventoryDetail` — React hook convention'ına uyar.

---

**Not:** `UseInventoryDetailOptions` ve `UseInventoryDetailResult` tiplerinin iç yapısı bu verilerde mevcut değildir. Bu tiplerin hangi alanları zorunlu kıldığı **bilinmiyor**.

---

## FONKSİYON DETAYLARI

### useInventoryDetail

**Ne yapar**: Envanter detay panelinin tüm durum yönetimini tek bir custom React hook'ta merkezileştirir. Seçili ürünün detay gösterimi, hareket geçmişi, rezervasyon listesi, eşik değeri kaydetme, stok ayarlama ve son hareketi geri alma işlevlerini bir arada sunar. Bu hook, envanter tablosundaki satırlara tıklandığında detay panelinin açılmasından kapanmasına kadar tüm yaşam döngüsünü yönetir.

**Nasıl yapar**: `UseInventoryDetailOptions` parametresinden `hasWriteAccess`, `rows` ve `onMutated` değerlerini alır. `useRef` ile rows ve onMutated referanslarını tutarak asenkron callback'lerin her zaman güncel değerlere erişmesini sağlar. `openTokenRef` mekanizması ile hızlı satır değişimlerinde geç gelen fetch isteklerini yutar (yarış koruması). `useEffect` ile bileşen mount olduğunda `inventory_settings` tablosundan `default_low_stock_threshold` değerini çekerek global varsayılan eşiği yükler. `useCallback` ile sarılmış tüm iç fonksiyonları, dışarıya hem durum (state) değerlerini hem de bu fonksiyonları birlikte döner. `mutateWithAudit` çağrıları ile veritabanı değişikliklerini denetim kaydıyla birlikte yapar.

**Parametreler**:
- options: `UseInventoryDetailOptions` — Hook'un yapılandırma seçeneklerini içeren nesne. İçinde `hasWriteAccess: boolean` (yazma yetkisi olup olmadığı), `rows: InventoryRow[]` (envanter satırları dizisi), `onMutated: () => Promise<void>` (veri değişikliği sonrası tetiklenecek callback) bulunur.

**Dönüş**: `UseInventoryDetailResult` — Seçili satır, detay yükleme durumu, hareket listesi, rezervasyonlar, seçili stok miktarı, eşik değerleri, various loading flag'leri, eşiği kaydetme/stock ayarlama/geri alma fonksiyonları gibi envanter detay panelinin ihtiyacı olan tüm durum ve eylemleri içeren nesne.

---

## İTHALATLAR (IMPORTS)
- import: ../components/admin/InventoryMovementHistory::type { Movement }
- import: ../i18n/I18nProvider::useI18n
- import: ../types/inventory::type { InventoryRow, ReservedRow }
- import: @/lib/admin/mutateWithAudit::AdminPermissionError
- import: @/lib/admin/mutateWithAudit::mutateWithAudit
- import: @/lib/supabase/client::supabaseBrowserClient
- import: react::useCallback
- import: react::useEffect
- import: react::useRef
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### InventoryRowWithThreshold extends InventoryRow
Tablodan gelen satır — eşik kolonu view'de yok, `products`'tan eşleştirilir.
- `low_stock_threshold?: number | null`

### UseInventoryDetailOptions
- `hasWriteAccess: boolean`
- `rows: InventoryRowWithThreshold[]`
- `onMutated: () => Promise<void> | void`

### UseInventoryDetailResult
- `selected: InventoryRow | null`
- `open: (row: InventoryRow) => void`
- `close: () => void`
- `detailLoading: boolean`
- `movements: Movement[]`
- `reservedOrders: ReservedRow[]`
- `selectedStock: number | null`
- `selectedThreshold: number | ''`
- `setSelectedThreshold: (v: number | '') => void`
- `defaultThreshold: number | null`
- `effectiveThreshold: (productId: string) => number | null`
- `saving: boolean`
- `moving: boolean`
- `undoing: boolean`
- `printingQr: boolean`
- `setPrintingQr: (v: boolean) => void`
- `moveQty: number`
- `setMoveQty: (v: number) => void`
- `saveThreshold: (productId: string) => void`
- `adjustStock: (productId: string, delta: number, reason: string) => void`
- `undoLastMovement: () => void`

---

## SABİTLER
- **UNDO_WINDOW_MS** (binary_expression) — `10 * 60 * 1000`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::useInventoryDetail
- **params**: (options: UseInventoryDetailOptions)
- **ic_degiskenler**:
  - `hasWriteAccess` — options'dan destructure edilen, stok ayarlarını kaydetme/silme yetkisi boolean'ı
  - `rows` — inventory tablosu satırlarının dizi referansı
  - `onMutated` — veri değişikliği sonrası çağrılan callback fonksiyonu
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `rowsRef` — rows'un ref içinde tutulduğu değişmez referans
  - `onMutatedRef` — onMutated callback'ini ref içinde tutan referans
  - `selected` — seçili inventory satırı state'i (InventoryRow | null)
  - `detailLoading` — detay yükleme durumu boolean state'i
  - `movements` — ürün hareket geçmişi dizisi state'i (Movement[])
  - `reservedOrders` — ürün için rezerve edilmiş siparişler dizisi state'i (ReservedRow[])
  - `selectedStock` — seçili ürünün fiziksel stok miktarı state'i (number | null)
  - `selectedThreshold` — seçili ürünün özel düşük stok eşiği state'i (number | '')
  - `defaultThreshold` — inventory_settings tablosundan çekilen global düşük stok eşiği state'i (number | null)
  - `saving` — eşik kaydetme işlemi devam ediyor mu boolean state'i
  - `moving` — stok ayarlama/hareket ekleme işlemi devam ediyor mu boolean state'i
  - `undoing` — son hareketi geri alma işlemi devam ediyor mu boolean state'i
  - `printingQr` — QR kod yazdırma durumu boolean state'i
  - `moveQty` — hareket miktarı state'i (number, varsayılan 1)
  - `openTokenRef` — açık satır kimliğini tutan ref, yarış koruması için (string | null)
- **Dönüş**: UseInventoryDetailResult (seçili satır, aç/kapat fonksiyonları, yükleme durumları, stok/eşik değerleri, hareket verileri, rezerve siparişler, kaydet/ayarla/geri alma fonksiyonları dahil bir nesne)

### [N2_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::useEffect (defaultThreshold yükleme)
- **params**: () (boş parametre, useEffect callback'i)
- **ic_degiskenler**:
  - `active` — cleanup fonksiyonunda false yapılan flag, component unmount edildiğinde state güncellemesini engeller (boolean)
  - `data` — supabase sorgusundan dönen inventory_settings satırı (varsayılan eşik değerini içerir)
  - `error` — supabase sorgusundan dönen hata nesnesi
  - `default_low_stock_threshold` — data içindeki düşük stok eşiği değeri, null olabilir
- **Dönüş**: void (yan etki: defaultThreshold state'ini günceller)

### [N3_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::async (defaultThreshold yükleme asenkron kısmı)
- **params**: () (boş parametre)
- **ic_degiskenler**:
  - `data` — supabase sorgusundan dönen inventory_settings satırı
  - `error` — supabase sorgusundan dönen hata nesnesi
  - `default_low_stock_threshold` — data içindeki düşük stok eşiği değeri
- **Dönüş**: Promise<void>

### [N4_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::cleanup (useEffect return)
- **params**: () (boş parametre)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (yan etki: active flag'ini false yapar)

### [N5_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::effectiveThreshold
- **params**: (productId: string)
- **ic_degiskenler**:
  - `row` — rowsRef içindeki productId eşleşen satır (InventoryRow | undefined)
  - `own` — satırın kendi düşük stok eşiği değeri (number | undefined)
- **Dönüş**: number | null (ürünün özel eşiği varsa o, yoksa global defaultThreshold)

### [N6_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::loadMovements
- **params**: (productId: string)
- **ic_degiskenler**:
  - `data` — inventory_movements tablosundan dönen ham satırlar dizisi
  - `error` — supabase sorgusundan dönen hata nesnesi
  - `m` — map içindeki her bir ham hareket satırı
- **Dönüş**: Promise<Movement[]> (hareket geçmişi dizisi, hata olursa boş dizi)

### [N7_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::map (loadMovements içinde)
- **params**: (m)
- **ic_degiskenler**: (yok, m parametresi kullanılıyor)
- **Dönüş**: Movement nesnesi (id, delta, reason, created_at alanlarını içerir)

### [N8_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::loadReserved
- **params**: (productId: string)
- **ic_degiskenler**:
  - `data` — reserved_orders tablosundan dönen ham satırlar dizisi
  - `error` — supabase sorgusundan dönen hata nesnesi
  - `r` — map içindeki her bir ham rezerve satırı
- **Dönüş**: Promise<ReservedRow[]> (rezerve siparişler dizisi, hata olursa boş dizi)

### [N9_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::map (loadReserved içinde)
- **params**: (r)
- **ic_degiskenler**: (yok, r parametresi kullanılıyor)
- **Dönüş**: ReservedRow nesnesi (order_id, created_at, status, payment_status, quantity alanlarını içerir)

### [N10_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::open
- **params**: (row: InventoryRow)
- **ic_degiskenler**:
  - `openTokenRef.current` — şu anki açık satırın product_id'si, yarış koruması için (string)
  - `own` — rowsRef içindeki row.product_id eşleşen satırın kendi düşük stok eşiği (number | undefined)
- **Dönüş**: void (yan etki: selected, selectedStock, selectedThreshold, movements, reservedOrders, detailLoading state'lerini günceller)

### [N11_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::async (open içinde asenkron kısım)
- **params**: () (boş parametre)
- **ic_degiskenler**:
  - `mv` — loadMovements sonucu hareket dizisi (Movement[])
  - `ro` — loadReserved sonucu rezerve siparişler dizisi (ReservedRow[])
- **Dönüş**: Promise<void>

### [N12_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::close
- **params**: () (boş parametre)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (yan etki: openTokenRef, selected, movements, reservedOrders, detailLoading state'lerini sıfırlar)

### [N13_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::describeError
- **params**: (e: unknown)
- **ic_degiskenler**: (yok, sadece parametre kullanılıyor)
- **Dönüş**: string (hatanın kullanıcıya gösterilecek açıklaması)

### [N14_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::saveThreshold
- **params**: (productId: string)
- **ic_degiskenler**:
  - `isDefault` — seçilen eşik boş string mi, yani varsayılan mı (boolean)
  - `row` — rowsRef içindeki productId eşleşen satır (InventoryRow | undefined)
  - `before` — güncelleme öncesi nesne (low_stock_threshold alanını içerir)
  - `after` — güncelleme sonrası nesne (low_stock_threshold ve low_stock_override alanlarını içerir)
  - `e` — try-catch içinde yakalanan hata nesnesi
- **Dönüş**: void (yan etki: saving state'ini, selectedThreshold'ı sıfırlar, toast mesajı gösterir, onMutatedRef.current() çağırır)

### [N15_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::async (saveThreshold içinde asenkron kısım)
- **params**: () (boş parametre)
- **ic_degiskenler**:
  - `isDefault` — selectedThreshold boş string mi (boolean)
  - `row` — rowsRef içindeki productId eşleşen satır
  - `before` — güncelleme öncesi nesne
  - `after` — güncelleme sonrası nesne
  - `e` — try-catch içinde yakalanan hata nesnesi
- **Dönüş**: Promise<void>

### [N16_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::async (saveThreshold fn içinde)
- **params**: () (boş parametre)
- **ic_degiskenler**:
  - `error` — supabase güncelleme sorgusundan dönen hata nesnesi
- **Dönüş**: Promise<void>

### [N17_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::adjustStock
- **params**: (productId: string, delta: number, reason: string)
- **ic_degiskenler**:
  - `e` — try-catch içinde yakalanan hata nesnesi
- **Dönüş**: void (yan etki: moving state'ini, selectedStock ve movements state'lerini günceller, toast mesajı gösterir, onMutatedRef.current() çağırır)

### [N18_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::async (adjustStock içinde asenkron kısım)
- **params**: () (boş parametre)
- **ic_degiskenler**:
  - `e` — try-catch içinde yakalanan hata nesnesi
- **Dönüş**: Promise<void>

### [N19_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::async (adjustStock fn içinde)
- **params**: () (boş parametre)
- **ic_degiskenler**:
  - `error` — supabase rpc sorgusundan dönen hata nesnesi
- **Dönüş**: Promise<void>

### [N20_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::undoLastMovement
- **params**: () (boş parametre)
- **ic_degiskenler**:
  - `target` — şu anki seçili ürün satırı (InventoryRow | null)
  - `last` — movements[0], en son hareket (Movement | undefined)
  - `inverse` — son hareketin tersi işareti ile miktarı (number)
  - `reason` — geri alma nedeni string'i (undo:XXX formatında)
  - `e` — try-catch içinde yakalanan hata nesnesi
- **Dönüş**: void (yan etki: undoing state'ini, selectedStock ve movements state'lerini günceller, toast mesajı gösterir, onMutatedRef.current() çağırır)

### [N21_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::async (undoLastMovement içinde asenkron kısım)
- **params**: () (boş parametre)
- **ic_degiskenler**:
  - `target` — selected state'inden gelen seçili satır (InventoryRow | null)
  - `last` — movements[0], en son hareket (Movement | undefined)
  - `inverse` — son hareketin tersi (number)
  - `reason` — geri alma nedeni (string)
  - `e` — try-catch içinde yakalanan hata nesnesi
- **Dönüş**: Promise<void>

### [N22_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::async (undoLastMovement fn içinde)
- **params**: () (boş parametre)
- **ic_degiskenler**:
  - `error` — supabase rpc sorgusundan dönen hata nesnesi
- **Dönüş**: Promise<void>

---

## NODE ID STANDARD

  file: src\hooks\useInventoryDetail.ts
  function: src\hooks\useInventoryDetail.ts::useInventoryDetail

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryRowWithThreshold
  export: UseInventoryDetailOptions
  export: UseInventoryDetailResult
  export: useInventoryDetail

---

## BILEŞIM (CONTAINS)
  contains: InventoryRow