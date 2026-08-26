---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useInventoryDetail.ts
skeleton_hash: fa74620e6ff72d0e
entity_hashes:
  func:useInventoryDetail: 6339f8150a38b023
  overview: 4c4c791d580870aa
generated_at: 2026-08-24T12:47:22Z
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

## FONKSİYON DETAYLARI

### useInventoryDetail
**Ne yapar**: Envanter detaylarını yöneten bir React custom hook'udur. Bir envanter satırının detayını açma/kapama, stok hareketlerini ve rezerve siparişleri yükleme, eşik değerini kaydetme, stok düzeltme ve son hareketi geri alma gibi işlemleri sağlar. Hook, bileşenin ihtiyaç duyduğu tüm durum değişkenlerini ve eylem fonksiyonlarını tek bir noktadan dışarıya sunar.

**Nasıl yapar**: Hook, `options` parametresinden yazma yetkisi (`hasWriteAccess`), satır listesi (`rows`) ve mutasyon sonrası tetiklenecek geri çağırma (`onMutated`) alır. `useI18n` ile uluslararasılaştırma desteği ekler. `rowsRef` ve `onMutatedRef` referansları, useCallback bağımlılık döngülerine girmeden güncel değerlere erişmek için kullanılır. `openTokenRef`, hızlı satır değişimlerinde yarış koşullarını önlemek amacıyla açık satırın kimliğini tutar — bir fetch tamamlandığında bu token eşleşmiyorsa sonuç yutulur. `useEffect` ile bileşen yüklendiğinde `inventory_settings` tablosundan global varsayılan düşük stok eşiği çekilir. `loadMovements` ve `loadReserved` useCallback fonksiyonları sırasıyla `inventory_movements` ve `reserved_orders` tablolarından veri çeker. `open` fonksiyonu bir satırı seçer, ilgili hareketleri ve rezerve siparişleri paralel olarak yükler ve yarış koruması uygular. `saveThreshold` fonksiyonu `mutateWithAudit` ile denetimli şekilde eşik değerini günceller. `adjustStock` fonksiyonu `adjust_stock` RPC'si aracılığıyla stok düzeltmesi yapar ve hareket geçmişini yeniler. `undoLastMovement` fonksiyonu son hareketi geri alır; ancak "undo" ile başlayan hareketler tekrar geri alınamaz (sonsuz salınım engeli) ve belirli bir zaman penceresi (`UNDO_WINDOW_MS`) geçmişse işlem reddedilir.

**Parametreler**:
- options: UseInventoryDetailOptions — Hook'un yapılandırma seçeneklerini içerir. Bileşenin yazma yetkisi, mevcut satır listesi ve veri mutasyonu sonrası çağrılacak geri çağırma fonksiyonunu taşır.

**Dönüş**: UseInventoryDetailResult — Aşağıdaki alanları içeren bir nesne döndürür:
- selected: InventoryRow | null — Şu anda detayı açık olan envanter satırı; yoksa null.
- open: (row: InventoryRow) => void — Verilen satırın detayını açar, stok hareketlerini ve rezerve siparişleri yükler.
- close: () => void — Açık detayı kapatır, tüm ilgili durumları sıfırlar.
- detailLoading: boolean — Detaya ait verilerin yüklenip yüklenmediğini gösterir.
- movements: Movement[] — Seçili ürüne ait son stok hareketlerini içerir (en fazla 5 kayıt, yeniden eskiye sıralı).
- reservedOrders: ReservedRow[] — Seçili ürüne ait rezerve siparişleri içerir.
- selectedStock: number | null — Seçili ürünün güncel fiziksel stok miktarı.
- selectedThreshold: number | '' — Seçili ürünün düşük stok eşiği; boş string ise varsayılan kullanılır.
- setSelectedThreshold: (value: number | '') => void — Düşük stok eşiğini ayarlar.
- defaultThreshold: number | null — Sistem genelindeki varsayılan düşük stok eşiği.
- effectiveThreshold: (productId: string) => number | null — Verilen ürün için geçerli eşiği hesaplar; ürünün kendi eşiği varsa onu, yoksa global varsayılanı döndürür.
- saving: boolean — Eşik kaydetme işleminin devam edip etmediğini gösterir.
- moving: boolean — Stok düzeltme işleminin devam edip etmediğini gösterir.
- undoing: boolean — Geri alma işleminin devam edip etmediğini gösterir.
- printingQr: boolean — QR kod yazdırma işleminin devam edip etmediğini gösterir.
- setPrintingQr: (value: boolean) => void — QR kod yazdırma durumunu ayarlar.
- moveQty: number — Stok hareketi için varsayılan miktar; başlangıç değeri 1.
- setMoveQty: (value: number) => void — Stok hareketi miktarını ayarlar.
- saveThreshold: (productId: string) => void — Seçili ürünün düşük stok eşiğini denetimli (audit) şekilde kaydeder.
- adjustStock: (productId: string, delta: number, reason: string) => void — Seçili ürünün stok miktarını belirtilen delta kadar artırır/azaltır; hareket nedeniyle birlikte kaydeder.
- undoLastMovement: () => void — Seçili ürünün son stok hareketini geri alır; "undo" ile başlayan hareketler veya zaman penceresi dışındaki hareketler geri alınamaz.

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
- **params**: `options` (UseInventoryDetailOptions)
- **ic_degiskenler**:
  - `hasWriteAccess` — options'dan destructured, yazma yetkisi olup olmadığını belirten boolean
  - `rows` — options'dan destructured, envanter satırları dizisi
  - `onMutated` — options'dan destructured, mutasyon sonrası çağrılacak callback fonksiyonu
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu
  - `rowsRef` — useRef ile oluşturulan, rows değerinin güncel halini tutan ref
  - `onMutatedRef` — useRef ile oluşturulan, onMutated fonksiyonunun güncel halini tutan ref
  - `selected` — useState ile tutulan, şu an seçili olan InventoryRow veya null
  - `detailLoading` — useState ile tutulan, detay verilerinin yüklenme durumu boolean'ı
  - `movements` — useState ile tutulan, seçili ürüne ait stok hareket geçmişi dizisi
  - `reservedOrders` — useState ile tutulan, seçili ürüne ait rezerve siparişler dizisi
  - `selectedStock` — useState ile tutulan, seçili ürünün fiziksel stok miktarı veya null
  - `selectedThreshold` — useState ile tutulan, seçili ürünün eşik değeri (number) veya boş string ('')
  - `defaultThreshold` — useState ile tutulan, inventory_settings tablosundan çekilen global varsayılan eşik değeri veya null
  - `saving` — useState ile tutulan, eşik kaydetme işlemi sırasında true olan boolean
  - `moving` — useState ile tutulan, stok hareketi (adjustStock) işlemi sırasında true olan boolean
  - `undoing` — useState ile tutulan, son hareketi geri alma işlemi sırasında true olan boolean
  - `printingQr` — useState ile tutulan, QR kod yazdırma işlemi sırasında true olan boolean
  - `moveQty` — useState ile tutulan, hareket miktarı (varsayılan 1)
  - `openTokenRef` — useRef ile oluşturulan, açık satırın product_id'sini tutan ref; hızlı satır değişiminde geç gelen fetch'i yutmak için yarış koruması sağlar
  - `effectiveThreshold` — useCallback ile memoize edilen, bir productId için etkili eşik değerini döndüren fonksiyon
  - `loadMovements` — useCallback ile memoize edilen, bir productId için son 5 stok hareketini Supabase'den çeken async fonksiyon
  - `loadReserved` — useCallback ile memoize edilen, bir productId için rezerve siparişleri Supabase'den çeken async fonksiyon
  - `open` — useCallback ile memoize edilen, bir InventoryRow satırını seçen ve detay verilerini yükleyen fonksiyon
  - `close` — useCallback ile memoize edilen, seçili satırı temizleyip detayları kapatan fonksiyon
  - `describeError` — useCallback ile memoize edilen, hata nesnesini kullanıcıya anlaşılır mesaja çeviren fonksiyon
  - `saveThreshold` — useCallback ile memoize edilen, seçili eşik değerini products tablosuna audit log ile kaydeden fonksiyon
  - `adjustStock` — useCallback ile memoize edilen, adjust_stock RPC ile stok miktarını değiştiren fonksiyon
  - `undoLastMovement` — useCallback ile memoize edilen, son stok hareketini ters çevirerek geri alan fonksiyon
- **Dönüş**: UseInventoryDetailResult (selected, open, close, detailLoading, movements, reservedOrders, selectedStock, selectedThreshold, setSelectedThreshold, defaultThreshold, effectiveThreshold, saving, moving, undoing, printingQr, setPrintingQr, moveQty, setMoveQty, saveThreshold, adjustStock, undoLastMovement)

### [N2_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::useEffect callback (inventory_settings)
- **params**: yok (useEffect callback)
- **ic_degiskenler**:
  - `active` — bileşen mount durumunu takip eden boolean flag; cleanup'ta false yapılır
  - `data` — supabaseBrowserClient.from('inventory_settings').select('default_low_stock_threshold').maybeSingle() sorgusundan dönen veri
  - `error` — aynı sorgudan dönen hata nesnesi
- **Dönüş**: cleanup fonksiyonu (active = false yapan)

### [N3_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::useEffect cleanup
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (active değişkenini false yapar)

### [N4_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::useEffect inner async
- **params**: yok
- **ic_degiskenler**:
  - `data` — inventory_settings tablosundan çekilen default_low_stock_threshold alanını içeren veri
  - `error` — sorgu hatası; varsa setDefaultThreshold çağrılmaz
- **Dönüş**: yok (void)

### [N5_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::effectiveThreshold
- **params**: `productId` (string)
- **ic_degiskenler**:
  - `row` — rowsRef.current içinde product_id'si eşleşen InventoryRow satırı; bulunamazsa undefined
  - `own` — row.low_stock_threshold; ürünün kendi eşik değeri
- **Dönüş**: number | null (ürünün kendi eşik değeri varsa onu, yoksa defaultThreshold'u döndürür)

### [N6_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::loadMovements
- **params**: `productId` (string)
- **ic_degiskenler**:
  - `data` — inventory_movements tablosundan product_id filtresiyle, created_at azalan sırayla, 5 kayıt limitiyle çekilen veri
  - `error` — sorgu hatası; varsa boş Movement[] döndürülür
- **Dönüş**: Movement[] (id, delta, reason, created_at alanlarını içeren dizi)

### [N7_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::loadMovements inner map
- **params**: `m` (inventory_movements tablosundan gelen tek kayıt)
- **ic_degiskenler**: yok
- **Dönüş**: { id: m.id, delta: m.delta, reason: m.reason, created_at: m.created_at }

### [N8_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::loadReserved
- **params**: `productId` (string)
- **ic_degiskenler**:
  - `data` — reserved_orders tablosundan product_id filtresiyle, created_at azalan sırayla çekilen veri
  - `error` — sorgu hatası; varsa boş ReservedRow[] döndürülür
- **Dönüş**: ReservedRow[] (order_id, created_at, status, payment_status, quantity alanlarını içeren dizi)

### [N9_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::loadReserved inner map
- **params**: `r` (reserved_orders tablosundan gelen tek kayıt)
- **ic_degiskenler**: yok
- **Dönüş**: { order_id: r.order_id ?? '', created_at: r.created_at ?? new Date().toISOString(), status: r.status ?? 'pending', payment_status: r.payment_status ?? null, quantity: r.quantity ?? 0 }

### [N10_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::open
- **params**: `row` (InventoryRow)
- **ic_degiskenler**:
  - `own` — rowsRef.current içinde row.product_id eşleşen satırın low_stock_threshold değeri; bulunamazsa undefined
  - `mv` — loadMovements(row.product_id) sonucu, stok hareket geçmişi
  - `ro` — loadReserved(row.product_id) sonucu, rezerve siparişler
- **Dönüş**: yok (openTokenRef.current'ı row.product_id olarak ayarlar, selected/selectedStock/selectedThreshold state'lerini günceller, movements ve reservedOrders'ı yükler; yarış koruması ile openTokenRef.current değişmişse geç gelen cevabı yutar)

### [N11_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::open inner async
- **params**: yok
- **ic_degiskenler**:
  - `mv` — Promise.all ile paralel çekilen loadMovements sonucu
  - `ro` — Promise.all ile paralel çekilen loadReserved sonucu
- **Dönüş**: yok (void; openTokenRef.current !== row.product_id kontrolü yapar, eşleşmiyorsa return eder)

### [N12_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::close
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (openTokenRef.current'ı null yapar, selected/movements/reservedOrders state'lerini sıfırlar, detailLoading'i false yapar)

### [N13_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::describeError
- **params**: `e` (unknown)
- **ic_degiskenler**: yok
- **Dönüş**: string (AdminPermissionError ise t('admin.inventory.settings.noPermission'), Error ise e.message, diğer durumlarda t('admin.common.error'))

### [N14_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::saveThreshold
- **params**: `productId` (string)
- **ic_degiskenler**:
  - `isDefault` — selectedThreshold === '' kontrolü; boşsa varsayılan eşik kullanılır
  - `row` — rowsRef.current içinde product_id eşleşen satır
  - `before` — güncelleme öncesi { low_stock_threshold: row?.low_stock_threshold ?? null }
  - `after` — güncelleme sonrası { low_stock_threshold: isDefault ? null : Number(selectedThreshold), low_stock_override: !isDefault }
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok (mutateWithAudit ile products tablosunu günceller, başarılıysa toast.success gösterir ve onMutatedRef.current()'ı çağırır; hata olursa toast.error ile describeError sonucunu gösterir; finally'de setSaving(false) yapar)

### [N15_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::saveThreshold inner async
- **params**: yok
- **ic_degiskenler**:
  - `isDefault` — selectedThreshold === '' kontrolü
  - `row` — rowsRef.current içinde productId eşleşen satır
  - `before` — güncelleme öncesi low_stock_threshold değeri
  - `after` — güncelleme sonrası low_stock_threshold ve low_stock_override değerleri
  - `e` — catch bloğunda yakalanan hata
- **Dönüş**: yok (void)

### [N16_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::saveThreshold inner fn
- **params**: yok
- **ic_degiskenler**:
  - `error` — supabaseBrowserClient.from('products').update(after).eq('id', productId) sorgusundan dönen hata; varsa throw edilir
- **Dönüş**: yok (void; hata varsa throw error)

### [N17_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::adjustStock
- **params**: `productId` (string), `delta` (number), `reason` (string)
- **ic_degiskenler**:
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok (delta 0 ise return eder; mutateWithAudit ile adjust_stock RPC çağrısı yapar; başarılıysa selectedStock'u günceller, movements'ı yeniden yükler, toast.success gösterir ve onMutatedRef.current()'ı çağırır; hata olursa toast.error ile describeError sonucunu gösterir; finally'de setMoving(false) yapar)

### [N18_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::adjustStock inner async
- **params**: yok
- **ic_degiskenler**:
  - `e` — catch bloğunda yakalanan hata
- **Dönüş**: yok (void)

### [N19_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::adjustStock inner fn
- **params**: yok
- **ic_degiskenler**:
  - `error` — supabaseBrowserClient.rpc('adjust_stock', { p_product_id, p_delta, p_reason }) çağrısından dönen hata; varsa throw edilir
- **Dönüş**: yok (void; hata varsa throw error)

### [N20_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::undoLastMovement
- **params**: yok
- **ic_degiskenler**:
  - `target` — selected state; seçili InventoryRow veya null
  - `last` — movements[0]; son stok hareketi kaydı
  - `inverse` — -Number(last.delta || 0); son hareketin tersi
  - `reason` — `undo:${String(last.id).slice(0, 8)}`; undo hareketinin nedeni
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok (target veya last yoksa return eder; last.reason 'undo' ile başlıyorsa undoNotAllowed hatası gösterir; UNDO_WINDOW_MS geçmişse undoTimePassed hatası gösterir; inverse 0 ise return eder; mutateWithAudit ile adjust_stock RPC çağrısı yapar; başarılıysa selectedStock'u günceller, movements'ı yeniden yükler, toast.success gösterir ve onMutatedRef.current()'ı çağırır; hata olursa toast.error ile undoFailed mesajını gösterir; finally'de setUndoing(false) yapar)

### [N21_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::undoLastMovement inner async
- **params**: yok
- **ic_degiskenler**:
  - `target` — selected state
  - `last` — movements[0]
  - `inverse` — -Number(last.delta || 0)
  - `reason` — `undo:${String(last.id).slice(0, 8)}`
  - `e` — catch bloğunda yakalanan hata
- **Dönüş**: yok (void)

### [N22_NASIL] AST Pointer: src/hooks/useInventoryDetail.ts::undoLastMovement inner fn
- **params**: yok
- **ic_degiskenler**:
  - `error` — supabaseBrowserClient.rpc('adjust_stock', { p_product_id: target.product_id, p_delta: inverse, p_reason: reason }) çağrısından dönen hata; varsa throw edilir
- **Dönüş**: yok (void; hata varsa throw error)

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