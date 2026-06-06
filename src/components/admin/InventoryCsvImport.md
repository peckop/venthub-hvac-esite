---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx
skeleton_hash: 07494bb5cb231527
entity_hashes:
  func:InventoryCsvImport: 312fdc52cc14a1c7
  overview: cb53e1e441eee9fe
  style_tokens: 3e4e1345adb17abc
generated_at: 2026-06-06T21:54:43Z
---

## Genel Bakış
Bu modül, CSV dosyaları aracılığıyla envanter verilerinin toplu olarak içe aktarılmasını sağlayan tek bir React bileşeninden oluşur. Modal yapısında çalışan bileşen, dosya yükleme, veri doğrulama, önizleme ve eşik değerine göre stok güncelleme süreçlerini yönetir.

## Fonksiyon Grupları
### Ana Bileşen
Tüm CSV içe aktarma iş akışını (dosya seçimi, doğrulama, önizleme ve nihai işleme) tek bir yerde yönetir ve üst bileşenle iletişim için callback fonksiyonları kullanır.
- InventoryCsvImport

---

## AXIOMS – Mimari Varsayımlar

Bu modül, CSV tabanlı envanter içe aktarma işlevi sağlayan bir React bileşenidir. Fonksiyon gövdesi erişilebilir olmadığından, yalnızca fonksiyon imzası ve modül bağlamından çıkarılabilen yapısal aksiyomlar tanımlanmıştır.

[Aksiyom 1]: Eğer `onClose` callback fonksiyonu sağlanmazsa, modal bileşenin kullanıcı tarafından kapatılması sonrasında üst bileşen durumu güncellenemez ve bileşen kalıcı olarak açık kalabilir.

[Aksiyom 2]: Eğer `onSuccess` callback fonksiyonu sağlanmazsa, CSV içe aktarma işlemi başarılı bir şekilde tamamlansa bile üst bileşen başarı durumundan haberdar olamaz; ilgili veri yenileme veya bildirim tetiklenemez.

[Aksiyom 3]: Eğer `isOpen` prop'u `true` olarak ayarlanmazsa, modal bileşen render edilmez veya görünür hale gelmez; bu durumda içe aktarma işlevi kullanıcıya sunulmaz.

[Aksiyom 4]: Eğer `effectiveThreshold` parametresi geçerli bir sayısal değer olarak sağlanmazsa (örn: `undefined`, `null`, veya negatif değer), envanter eşik kontrolü sırasında beklenmeyen davranışlar oluşabilir; eşik değerinin pozitif bir sayı olması beklenir.

[Aksiyom 5]: Eğer modal açıkken (`isOpen: true`) kullanıcı dosya yükleme sürecini başlatmazsa veya geçerli bir CSV dosyası seçmezse, içe aktarma işlemi ilerleyemez ve önizleme adımı gösterilemez.

---

## FONKSİYON DETAYLARI

### InventoryCsvImport
**Ne yapar**: CSV dosyasından toplu stok güncelleme yapmak için bir modal arayüzü sunar. Kullanıcının CSV dosyası yüklemesine, stok değişikliklerini önizlemesine ve (isteğe bağlı olarak) veritabanını güncellemesine olanak tanır. Kuru çalıştırma (dry-run) modu ile önce simülasyon yapılabilir.

**Nasıl yapar**: CSV dosyasını satır satır ayrıştırarak SKU ve miktar bilgilerini çıkarır. Mevcut ürün verisiyle eşleştirerek stok değişimlerini hesaplar ve bir önizleme tablosu oluşturur. `processCSV` fonksiyonu ile toplu veritabanı güncelleme yapar (20'şerli gruplar halinde). İşlem sonrası geri alma (undo) seçeneği sunan bir bildirim gösterir.

**Parametreler**:
- isOpen: boolean — Modalın açılıp kapanmasını kontrol eder. `false` olduğunda bileşen `null` döner ve render edilmez.
- onClose: () => void — Modal kapatıldığında çağrılan geri çağırma fonksiyonu.
- onSuccess: () => void — Stok güncelleme başarıyla tamamlandığında çağrılan geri çağırma fonksiyonu.
- effectiveThreshold: (productId: string) => number | null — Belirli bir ürün için stok eşik değerini döndüren fonksiyon. Stok durumu belirlemede kullanılır.

**Dönüş**: JSX.Element | null — Modal açıkken JSX bileşeni, kapalıyken `null` döner.

---

## INTERFACES

### CsvPreviewRow
- `sku: string`
- `name: string`
- `current: number`
- `new: number`
- `delta: number`
- `status: 'out' | 'critical' | null`

### InventoryCsvImportProps
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`
- `effectiveThreshold: (_productId: string) => number | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `InventoryCsvImport.tsx`::handleCsvImport (anonim async arrow — file parse)
- **params**: `(file: File)` — yüklenen CSV dosyası
- **ic_degiskenler**:
  - `textRaw` — dosyanın ham string içeriği (`file.text()` sonucu)
  - `text` — BOM karakteri (`\ufeff`) temizlenmiş CSV metni
  - `lines` — boş satırları filtrelenmiş CSV satır dizisi
  - `split` — virgülle splitting yapan inner fonksiyon, tırnak içi virgülleri korur
  - `headerRaw` — küçük harfe normalize edilmiş başlık sütun adları dizisi
  - `skuIdx` — başlık satırında `sku` sütununun indexi (-1 ise yok)
  - `qtyIdx` — başlık satırında qty/quantity/stock/new_stock sütununun indexi
  - `parsedRows` — `{ line: number; sku: string; newQty: number }` geçerli satırlar dizisi
  - `errors` — `{ line: number; sku: string; message: string }` hata satırlar dizisi
  - `cells` — mevcut satırın split edilmiş hücreleri
  - `sku` — mevcut satırın SKU değeri (trimmed)
  - `qtyStr` — mevcut satırın miktar ham string'i
  - `newQty` — parse edilmiş miktar sayısı (NaN olabilir)
  - `skus` — parsedRows'dan tekrarsız SKU listesi (`Set` → array)
  - `products` — Supabase'den gelen eşleşen ürün kayıtları (`id, sku, name, stock_qty`)
  - `skuToProduct` — SKU → `{ id, name, stock }` Map'i
  - `preview` — `CsvPreviewRow[]` önizleme satırları dizisi
  - `product` — mevcut satır için SKU'dan bulunan ürün bilgisi
  - `th` — `effectiveThreshold(product.id)` çağrısıyla dönen eşik değeri
  - `status` — `'out' | 'critical' | null` ürün stok durumu flag'i
- **Dönüş**: yok (state setter'ları `setCsvPreview` ve `toast` ile yan etki)

---

### [N2_NASIL] AST Pointer: `InventoryCsvImport.tsx`::handleProcessCsv (anonim async arrow — CSV işleme)
- **params**: yok
- **ic_degiskenler**:
  - `skus` — `csvPreview` dizisinden çıkarılmış SKU listesi
  - `products` — Supabase'den gelen `{ sku, id }` eşleşen ürün kayıtları
  - `skuToId` — SKU → ürün ID Map'i
  - `successCount` — başarılı stok güncelleme sayacı
  - `errors` — `{ sku: string; message: string }` hata listesi
  - `batchId` — `generateId()` ile üretilen benzersiz batch kimliği
  - `BATCH_SIZE` — toplu işlem boyutu (sabit: 20)
  - `chunk` — mevcut batch'in `csvPreview` alt dizisi
  - `_productId` — SKU'dan bulunan ürün ID'si
  - `reason` — hareket açıklaması (`CSV import: add/remove ...`)
  - `downloadErrors` — inner fonksiyon; hataları CSV olarak indirir
  - `header` — hata CSV başlık satırı (`['sku', 'message']`)
  - `lines` — hata satırlarının CSV formatlanmış hali
  - `csv` — BOM eklenmiş tam hata CSV stringi
  - `blob` — CSV içeriğinden oluşturulan Blob nesnesi
  - `url` — Blob için oluşturulan object URL
  - `a` — indirme için geçici `<a>` DOM elementi
  - `id` — `toast.custom` callback parametresi, toast instance ID'si
  - `undone` — `reverse_inventory_batch` RPC sonucu geri alınan hareket sayısı
- **Dönüş**: yok (toast, state setter'ları, `onClose()`, `onSuccess()` yan etkileri)

---

### [N3_NASIL] AST Pointer: `InventoryCsvImport.tsx`::processItem (anonim async arrow — tekil ürün işleme, batch içinde)
- **params**: `(item)` — `csvPreview` satır nesnesi (`{ sku, delta, ... }`)
- **ic_degiskenler**:
  - `_productId` — `skuToId.get(item.sku)` ile elde edilen ürün UUID'si
  - `reason` — dinamik hareket sebebi stringi (add/remove ve mutlak delta)
  - `error` — `supabase.rpc('adjust_stock', ...)` destructured hata nesnesi
  - `logAdminAction` — dinamik import ile yüklenen audit log fonksiyonu
- **Dönüş**: yok (rpc çağrısı, audit log, `successCount++` yan etkisi; catch'te `errors.push`)

---

### [N4_NASIL] AST Pointer: `InventoryCsvImport.tsx`::downloadErrors (anonim arrow — hata CSV indirme)
- **params**: yok
- **ic_degiskenler**:
  - `header` — CSV başlık dizisi `['sku', 'message']`
  - `lines` — her hatanın CSV escape edilmiş satır dizisi
  - `csv` — BOM (`\ufeff`) ile birleştirilmiş tam CSV metni
  - `blob` — CSV metninden oluşan `Blob` nesnesi (`type: text/csv`)
  - `url` — `URL.createObjectURL` ile üretilen geçici dosya URL'i
  - `a` — programatik oluşturulmuş `<a>` elementi (click ile indirme tetiklenir)
- **Dönüş**: yok (DOM elementi click ve `URL.revokeObjectURL` ile temizlik)

---

### [N5_NASIL] AST Pointer: `InventoryCsvImport.tsx`::toastContentRenderer (anonim arrow — toast JSX renderer)
- **params**: `(id)` — toast instance ID'si (string)
- **ic_degiskenler**:
  - `batchId` — üst scope'tan gelen batch ID (JSX içinde link URL'inde kullanılır: `/admin/movements?batch=${batchId}`)
  - `successCount` — üst scope'tan gelen başarılı güncelleme sayısı (JSX içinde gösterilir)
  - `errors` — üst scope'tan gelen hata dizisi (length > 0 ise hata butonu render edilir)
  - `downloadErrors` — üst scope'tan gelen hata indirme fonksiyonu reference'i
- **Dönüş**: JSX (`<div>` — glass-strong styled toast bileşeni, içinde link ve butonlar)

---

### [N6_NASIL] AST Pointer: `InventoryCsvImport.tsx`::handleUndo (anonim async arrow — geri alma handler'ı, toast içinde)
- **params**: yok
- **ic_degiskenler**:
  - `csvUndoingRef` — `useRef<boolean>` flag'ı, çifte tıklama engeli (current erişimi)
  - `data` — `supabase.rpc('reverse_inventory_batch', ...)` sonucu geri alınan satır sayısı
  - `error` — RPC sonucu destructured hata nesnesi
  - `undone` — `Number(data || 0)` ile parse edilmiş geri alınan hareket sayısı
  - `e` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok (`onSuccess()`, `toast.success`/`toast.error`, `toast.dismiss(id)` yan etkileri)

---

### [N7_NASIL] AST Pointer: `InventoryCsvImport.tsx`::handleFileChange (anonim arrow — dosya input onChange)
- **params**: `(e)` — React `ChangeEvent<HTMLInputElement>` olay nesnesi
- **ic_degiskenler**:
  - `file` — `e.target.files?.[0]` ile alınan ilk dosya reference'ı
- **Dönüş**: yok (`handleCsvImport(file)` çağrısı ile yan etki)

---

### [N8_NASIL] AST Pointer: `InventoryCsvImport.tsx`::handleDryRunToggle (anonim arrow — keyboard handler)
- **params**: `(e)` — `KeyboardEvent` olay nesnesi
- **ic_degiskenler**: (yok — sadece parametre kullanılır)
- **Dönüş**: yok (`setDryRun(!dryRun)` state setter ile yan etki)

---

### [N9_NASIL] AST Pointer: `InventoryCsvImport.tsx`::renderRow (anonim arrow — tablo satır renderer)
- **params**: `(item, idx)` — `item: CsvPreviewRow` önizleme satırı, `idx: number` satır indexi
- **ic_degiskenler**: (yok — sadece parametre ve JSX template kullanımı)
- **Dönüş**: JSX (`<tr>` — hover efektli, SKU/name/current/new/delta sütunlu tablo satırı; `item.delta` rengine göre `text-emerald-400` veya `text-rose-400`conditional class)

---

## NODE ID STANDARD

  file: src\components\admin\InventoryCsvImport.tsx
  function: src\components\admin\InventoryCsvImport.tsx::InventoryCsvImport

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryCsvImport

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-lg`, `rounded-hvac-xl`, `shadow-glow-md`, `shadow-glow-sm`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-400`, `bg-black/60`, `bg-cyan-400`, `bg-rose-500/20`, `bg-surface-deep/20`, `bg-surface-midnight`, `bg-transparent`, `bg-white`, `bg-white/10`, `bg-white/2`, `bg-white/5`, `border-2`, `border-b`, `border-dashed`, `border-none`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `h-10`, `h-12`, `h-16`, `h-3`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `group-hover:`, `group-last:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${dryRun`, `${item.delta`, `0`, `:`, `>`, `animate-in`, `animate-spin`, `border`, `cursor-default`, `cursor-pointer`, `decoration-cyan-400/30`, `disabled:opacity-30`, `duration-300`, `fade-in`, `focus-visible:ring-2`