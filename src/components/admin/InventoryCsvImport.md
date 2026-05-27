---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx
skeleton_hash: b3421236e71cdedd
generated_at: 2026-05-27T04:46:09Z
---

## Genel Bakış  
`InventoryCsvImport` bileşeni, yöneticilerin envanter verilerini CSV dosyası üzerinden sisteme aktarmasını sağlayan bir modal penceresidir. Kullanıcı dosya seçtiğinde dosya içeriği okunur, satırlar ayrıştırılır ve iş kurallarına göre doğrulanır; ardından bir ön izleme tablosu gösterilir ve onaylandığında veri aktarımı tamamlanıp geri bildirim verilir.

## Fonksiyon Grupları  

### UI & Dialog Yönetimi  
Bu grup, modalın açılıp kapanması, kullanıcı etkileşimlerinin yakalanması ve bileşenin temel render mantığını içerir.  
- `InventoryCsvImport`, `closeDialog`, `confirmImport`

### CSV Okuma & Ayrıştırma  
Dosya içeriğinin ham metinden satır‑satır bölünmesi, her satırın hücrelerine ayrılması ve temel veri tipine dönüştürülmesi bu fonksiyonlar tarafından yapılır.  
- `handleCsvImport`, `split`, `parseCsvLines`

### Doğrulama & İş Kuralları  
Ayrıştırılan satırlar, SKU varlığı, miktar formatı ve iş eşiği gibi kurallara göre kontrol edilir; hatalı satırlar toplanır.  
- `validateRows`, `collectErrors`, `getEffectiveThreshold`

### Ön İzleme & Geri Bildirim  
Doğrulama sonrası oluşturulan satırlar üzerinden delta (değişim) hesaplanır, ön izleme tablosu hazırlanır ve kullanıcıya hatalar ya da başarı mesajı gösterilir.  
- `buildPreviewRows`, `computeDelta`, `showPreview`, `showSuccessMessage`, `showErrorList`

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `isOpen` prop’u sağlanmazsa, bileşen hiçbir zaman görüntülenmez ve kullanıcı CSV içe aktarma işlemini başlatamaz.  
**Aksiyom 2**: Eğer `onClose` prop’u sağlanmazsa, kullanıcı diyalog penceresini kapattığında hiçbir geri çağırma (callback) çalışmaz; bu da üst katmanın (parent component) kapanma durumunu yönetememesine yol açar.  
**Aksiyom 3**: Eğer `onSuccess` prop’u sağlanmazsa, CSV başarılı bir şekilde içe aktarıldıktan sonra üst katmana bildirim gönderilemez; bu da UI’da “başarılı” mesajı gösterilmemesine ve olası sonraki adımların (ör. liste yenileme) otomatik olarak tetiklenmemesine neden olur.  
**Aksiyom 4**: Eğer `effectiveThreshold` fonksiyonu tanımlı değilse veya `null` döndürürse, ürün başına eşik değeri hesaplanamaz; bu durumda “critical”/“out” durumları belirlenemez ve satır‑satır doğrulama mantığı eksik kalır.  
**Aksiyom 5**: Eğer `effectiveThreshold` fonksiyonu bir sayı döndürürse, bu sayı ürünün kritik eşik değeri olarak kabul edilir; eşik değerin altında kalan `new` değerleri “critical” olarak işaretlenir.  
**Aksiyom 6**: Eğer `effectiveThreshold` fonksiyonu `null` döndürürse, o ürün için eşik kontrolü atlanır ve `status` alanı `null` kalır.  

*Domain‑specific kural*: `effectiveThreshold` fonksiyonunun döndürdüğü sayı, “critical” durumunu belirlemek için kullanılan eşik değeridir; bu eşik değerin kesin bir sınırı (ör. 0‑100) belgelenmemiştir, bu yüzden değer aralığı **bilinmiyor**.

---

## FONKSIYON DETAYLARI

### InventoryCsvImport
**Ne yapar**: CSV dosyasından stok verilerini okuyarak ürünlerin mevcut stok miktarlarını günceller veya bir önizleme sunar. Kullanıcıya kuru çalıştırma (simülasyon) seçeneği ve işlem sonrası hataları indirme imkanı verir. İşlem tamamlandığında başarı mesajı ve ilgili hareketlerin listesine yönlendirme sağlar.  

**Nasıl yapar**: 
- Açık olduğunda (`isOpen`) bileşen, dosya seçimi ve sürükle‑bırak aracılığıyla bir CSV dosyası alır.  
- `handleCsvImport` fonksiyonu dosyayı metin olarak okur, başlık satırını analiz eder ve `sku` ile `qty`/`quantity`/`stock`/`new_stock` sütunlarını bulur.  
- Satırları ayrıştırıp geçerli SKU ve miktarları doğrular, hatalı satırları toplar ve veritabanındaki eşleşen ürünlerle birleştirerek bir önizleme (`csvPreview`) oluşturur.  
- `processCSV` fonksiyonu, önizleme verisini toplu (batch) olarak `adjust_stock` RPC çağrısı ile günceller; `dryRun` aktifse sadece simülasyon yapılır.  
- İşlem sırasında ilerleme yüzdesi (`csvProgress`) ve işlem durumu (`csvProcessing`) güncellenir, hatalar toplanır ve kullanıcıya indirme butonu ile CSV hata raporu sunulur.  
- Başarıda `onSuccess` ve `onClose` callback’leri tetiklenir, ayrıca geri alma (undo) işlemi için `reverse_inventory_batch` RPC çağrısı sağlanır.  

**Parametreler**:
- `isOpen`: boolean — Bileşenin görünür olup olmadığını belirler; `false` ise bileşen render edilmez.  
- `onClose`: () => void — Kullanıcı kapanış butonuna bastığında veya işlem tamamlandığında çağrılan fonksiyon.  
- `onSuccess`: () => void — CSV işleme başarılı bir şekilde tamamlandığında tetiklenen geri bildirim fonksiyonu.  
- `effectiveThreshold`: (productId: string) => number \| null — Bir ürünün kritik stok eşiğini döndüren, ürün ID’sine göre çalışan fonksiyon.  

**Dönüş**: React bileşeni JSX döndürür; fonksiyonun kendisi bir UI komponenti olduğundan tipik olarak `JSX.Element` (veya `null` if `!isOpen`).

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

### [N1_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleCsvImport
- **params**: (file: File)
- **ic_degiskenler**:
  - `file` — the uploaded CSV file object
  - `textRaw` — raw text content of the file
  - `text` — UTF‑8 BOM‑stripped text
  - `lines` — array of non‑empty lines from the CSV
  - `split` — helper function that splits a CSV line into cells
  - `headerRaw` — array of header names lower‑cased and trimmed
  - `skuIdx` — index of the `sku` column in the header
  - `qtyIdx` — index of the quantity column (`qty`, `quantity`, `stock`, or `new_stock`)
  - `parsedRows` — array of objects `{ line, sku, newQty }` for valid rows
  - `errors` — array of objects `{ line, sku, message }` for rows that failed validation
  - `skus` — set of unique SKUs extracted from parsed rows
  - `products` — array of product records fetched from Supabase
  - `skuToProduct` — Map from SKU to `{ id, name, stock }`
  - `preview` — array of `CsvPreviewRow` objects built from parsed rows and product data
- **Dönüş**: yok (side effects: updates state and shows toast messages)

### [N2_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::processCsv
- **params**: ()
- **ic_degiskenler**:
  - `csvPreview` — current preview data from state
  - `setCsvProcessing` — state setter for processing flag
  - `setCsvProgress` — state setter for progress indicator
  - `skus` — array of SKUs extracted from preview
  - `products` — array of product records fetched from Supabase
  - `skuToId` — Map from SKU to product ID
  - `dryRun` — boolean flag indicating whether to perform a dry run
  - `batchId` — unique identifier for the current import batch
  - `successCount` — counter of successfully updated products
  - `errors` — array of `{ sku, message }` for failures
  - `chunk` — slice of preview rows processed in a batch
  - `item` — individual preview row being processed
  - `_productId` — product ID corresponding to the current SKU
  - `reason` — string describing the stock adjustment reason
  - `logAdminAction` — imported audit logging function
  - `downloadErrors` — function that creates and downloads a CSV of errors
  - `toast` — toast notification library
  - `onClose` — callback to close the modal
  - `onSuccess` — callback to signal successful completion
  - `csvUndoingRef` — ref tracking whether an undo operation is in progress
- **Dönüş**: yok (side effects: updates state, shows toast, triggers callbacks)

### [N3_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::updateItemStock
- **params**: (item)
- **ic_degiskenler**:
  - `item` — preview row being processed
  - `_productId` — product ID retrieved from `skuToId`
  - `reason` — reason string for the stock adjustment
  - `logAdminAction` — imported audit logging function
  - `successCount` — incremented on successful adjustment
  - `errors` — appended with error details on failure
- **Dönüş**: yok (side effects: RPC call, audit log, state updates)

### [N4_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::downloadErrors
- **params**: ()
- **ic_degiskenler**:
  - `errors` — array of error objects from the import process
  - `header` — CSV header array `['sku', 'message']`
  - `lines` — array of CSV lines constructed from error objects
  - `csv` — BOM‑prefixed CSV string
  - `blob` — Blob object created from the CSV string
  - `url` — object URL for the Blob
  - `a` — temporary anchor element used to trigger download
- **Dönüş**: yok (side effect: triggers file download)

### [N5_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::undoBatch
- **params**: ()
- **ic_degiskenler**:
  - `csvUndoingRef` — ref indicating if an undo is already running
  - `batchId` — identifier of the batch to reverse
  - `undone` — number of movements reversed returned from RPC
- **Dönüş**: yok (side effects: RPC call, toast notifications, callback)

### [N6_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleFileChange
- **params**: (e)
- **ic_degiskenler**:
  - `e` — change event from the file input
  - `file` — first selected file from `e.target.files`
- **Dönüş**: yok (side effect: calls `handleCsvImport`)

### [N7_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::toggleDryRun
- **params**: (e)
- **ic_degiskenler**:
  - `e` — keyboard event from the dry‑run toggle
- **Dönüş**: yok (side effect: toggles `dryRun` state)

### [N8_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::renderRow
- **params**: (item, idx)
- **ic_degiskenler**:
  - `item` — preview row data
  - `idx` — index of the row in the preview array
- **Dönüş**: JSX element representing a table row

---

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
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `group-hover:bg-cyan-400`, `group-hover:scale-110`, `group-hover:text-slate-300`, `group-hover:text-surface-deep`
- **Responsive:** (yok)