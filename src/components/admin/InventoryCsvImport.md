---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx
skeleton_hash: 9307ed16600356f2
generated_at: 2026-05-23T21:53:07Z
---

## Genel Bakış
`InventoryCsvImport` bileşeni, yöneticilerin envanter verilerini CSV dosyası aracılığıyla sisteme aktarmasını sağlayan bir diyalog penceresidir. Açılır/kapanır durum yönetimi, dosya okuma, veri doğrulama ve başarılı aktarım sonrası geri bildirim gibi sorumlulukları tek bir bileşende toplar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---



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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx::handleCsvImport
- **params**: `file` (File) — user-selected CSV file to parse
- **ic_degiskenler**:
  - `textRaw` — ham dosya içeriği (`file.text()`)
  - `text` — BOM silinmiş dosya içeriği
  - `lines` — satırlara bölünmüş, boş satırlardan arındırılmış dizi
  - `split` — CSV satırını düzgün şekilde ayıran fonksiyon (tırnak içi virgülleri korur)
  - `headerRaw` — başlık satırındaki sütun adları (küçük harf, trimlenmiş)
  - `skuIdx` — 'sku' sütununun index numarası
  - `qtyIdx` — miktar sütununun index numarası (sırayla qty/quantity/stock/new_stock arar)
  - `parsedRows` — çözümlenmiş geçerli satırlar ({ line, sku, newQty })
  - `errors` — hatalı satırlar listesi ({ line, sku, message })
  - `i` — for döngüsü sayacı
  - `cells` — split ile ayrılmış bir satırın hücreleri
  - `sku` — bir satırdaki SKU değeri (trimlenmiş)
  - `qtyStr` — bir satırdaki miktar string değeri (trimlenmiş)
  - `newQty` — bir satırdaki sayısal miktar (NaN veya positive integer)
  - `skus` — tüm parsedRows'daki unique SKU'lar (Set → Array)
  - `products` — supabase'den gelen eşleşen ürün listesi (id, sku, name, stock_qty)
  - `skuToProduct` — SKU → { id, name, stock } haritası
  - `preview` — önizleme satırları dizisi (CsvPreviewRow tipinde)
  - `row` — parsedRows üzerinde dönen her bir satır
  - `product` — skuToProduct'ten eşleşen ürün bilgisi
  - `th` — `effectiveThreshold(product.id)` ile alınan eşik değeri
  - `status` — yeni miktara göre hesaplanan stok durumu ('out' | 'critical' | null)
  - `setCsvPreview` — state güncelleme fonksiyonu (CSV önizlemesini ayarlar)
  - `toast.error` — hata mesajı gösterimi
  - `supabase` — Supabase istemcisi (database sorgusu için)
  - `effectiveThreshold` — ürüne özel eşik değeri döndüren prop fonksiyonu
  - `console.error` — hata loglama (catch bloğunda)
- **Dönüş**: yok (void; yan etki: setCsvPreview çağrılır, toaster mesajları gösterilir)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx::processCsv
- **params**: yok (closure üzerinden state/proplara erişir)
- **ic_degiskenler**:
  - `skus` — csvPreview'deki tüm SKU'lar (dizi)
  - `products` — supabase'den SKU’larla eşleşen ürün listesi (id, sku)
  - `skuToId` — SKU → product ID haritası
  - `dryRun` — kuru çalıştırma modu bayrağı (state/ref'ten kapatma)
  - `successCount` — başarıyla güncellenen ürün sayısı
  - `errors` — işlem sırasında oluşan hatalar ({ sku, message })
  - `batchId` — generateId() ile oluşturulmuş işlem batch ID'si
  - `BATCH_SIZE` — her toplu işlemdeki maksimum ürün sayısı (20)
  - `i` — for döngüsü sayacı
  - `chunk` — csvPreview'in dilimlenmiş parçası (BATCH_SIZE kadar)
  - `_productId` — her bir item için product ID (skuToId üzerinden)
  - `reason` — stok hareket açıklaması
  - `error` — supabase.rpc'den dönen hata nesnesi
  - `logAdminAction` — dinamik import edilen audit fonksiyonu
  - `header` — hata CSV'si için başlık satırı (['sku','message'])
  - `lines` — hata CSV'si için satır dizisi
  - `csv` — oluşturulan CSV içeriği (BOM ile başlar)
  - `blob` — CSV içeriğini saran Blob nesnesi
  - `url` — Blob için oluşturulan geçici URL
  - `a` — download linki olarak kullanılan geçici DOM elemanı
  - `setCsvProcessing` — state güncelleme (işlem durumu)
  - `setCsvProgress` — state güncelleme (ilerleme yüzdesi)
  - `supabase` — Supabase istemcisi
  - `toast` — bildirim gösterimi (react-hot-toast)
  - `generateId` — unique ID oluşturma fonksiyonu
  - `onClose` — modal kapatma prop fonksiyonu
  - `onSuccess` — başarı callback prop fonksiyonu
  - `csvUndoingRef` — geri alma işleminin devam edip etmediğini tutan ref
  - `console.error` — hata loglama
  - `downloadErrors` — aynı fonksiyon içinde tanımlı, hata CSV'sini indiren iç fonksiyon
- **Dönüş**: yok (void; yan etki: stok güncellemeleri, toaster bildirimleri, onClose/onSuccess çağrıları)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx::processItem
- **params**: `item` (object with `sku`, `delta` properties) — işlenecek CSVP PREVIEW satırı
- **ic_degiskenler**:
  - `_productId` — SKU'ya karşılık gelen ürün ID (skuToId Map'inden)
  - `reason` — stok değişimi açıklaması (CSV import: add/remove X)
  - `error` — supabase.rpc'den dönen hata
  - `logAdminAction` — audit log fonksiyonu (dinamik import)
  - `skuToId` — üstten kapatma (SKU → ID haritası)
  - `supabase` — Supabase istemcisi
  - `batchId` — üstten kapatma (işlem batch ID)
  - `successCount` — üstten kapatma (başarılı sayacı, incremente edilir)
  - `errors` — üstten kapatma (hata listesi, push eklenir)
  - `console.error` — hata loglama
- **Dönüş**: yok (void; yan etki: stok güncellemesi yapar, audit log kaydeder, successCount/errors güncellenir)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx::downloadErrors
- **params**: yok (errors dizisini closure üzerinden kullanır)
- **ic_degiskenler**:
  - `errors` — hata listesi (her eleman { sku, message })
  - `header` — CSV başlığı (['sku','message'])
  - `lines` — her hatadan oluşturulmuş CSV satırları (tırnak içinde kaçışlı)
  - `csv` — tam CSV içeriği (BOM ile başlar)
  - `blob` — oluşturulan CSV Blob'u
  - `url` — geçici Blob URL'si
  - `a` — indirme bağlantısı DOM elemanı
  - `document` — tarayıcı DOM API'si (createElement, click)
  - `URL` — geçici URL yönetimi (createObjectURL, revokeObjectURL)
- **Dönüş**: yok (void; yan etki: hata CSV'sini tarayıcıya indirtir)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx::renderToastContent
- **params**: `t` (toast object) — react-hot-toast'un sağladığı toast tanıtıcısı
- **ic_degiskenler**:
  - `successCount` — başarılı güncelleme sayısı
  - `batchId` — işlem batch ID'si
  - `errors` — hata listesi
  - `t.id` — toast tanıtıcısının ID'si (bildirimi kapatmak için)
  - `csvUndoingRef` — geri alma işleminin durumunu tutan ref
  - `supabase` — Supabase istemcisi
  - `toast.dismiss` — toast bildirimini kapatma fonksiyonu
  - `toast.success` — başarılı bildirim gösterme fonksiyonu
  - `toast.error` — hata bildirimi gösterme fonksiyonu
  - `onSuccess` — başarı callback prop fonksiyonu
  - `downloadErrors` — hata CSV'sini indirme fonksiyonu (closure’dan)
  - `console.error` — hata loglama
  - `CheckCircle2` — lucide-react simgesi
  - `React.createElement` — JSX render için
- **Dönüş**: JSX elemanı (div) — toast içeriği olarak gösterilir

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx::undoHandler
- **params**: yok (closure üzerinden batchId, csvUndoingRef, supabase, toast, onSuccess alır)
- **ic_degiskenler**:
  - `csvUndoingRef` — geri alma işleminin devam edip etmediğini tutan ref (okunur ve yazılır)
  - `batchId` — geri alınacak batch'in ID'si
  - `data` — reverse_inventory_batch RPC'sinden dönen geri alınan hareket sayısı
  - `error` — RPC çağrısından dönen hata
  - `undone` — sayıya dönüştürülmüş geri alınan hareket sayısı
  - `supabase` — Supabase istemcisi
  - `toast.success` — başarılı bildirim
  - `toast.error` — hata bildirimi
  - `toast.dismiss` — toast kapatma
  - `onSuccess` — başarı callback prop
  - `console.error` — hata loglama
- **Dönüş**: yok (void; yan etki: inventory_movements batch'ini tersine çevirir, toaster bildirimleri gösterir, onSuccess çağrılır)

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx::handleFileChange
- **params**: `e` (React.ChangeEvent<HTMLInputElement>) — file input değişim olayı
- **ic_degiskenler**:
  - `file` — `e.target.files[0]` (seçilen dosya)
  - `handleCsvImport` — dosya işleme fonksiyonu (closure üzerinden)
- **Dönüş**: yok (void; yan etki: dosya seçildiğinde handleCsvImport'u çağırır)

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx::handleDryRunToggleKey
- **params**: `e` (React.KeyboardEvent) — klavye olayı
- **ic_degiskenler**:
  - `dryRun` — mevcut dryRun durumu (state'ten kapatma)
  - `setDryRun` — dryRun state güncelleme fonksiyonu
- **Dönüş**: yok (void; yan etki: tuşa basıldığında dryRun durumunu tersine çevirir)

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx::renderCsvRow
- **params**: `item` (CsvPreviewRow) — satır verisi (`sku`, `name`, `current`, `new`, `delta`, `status` alanları); `idx` (number) — satır index'i
- **ic_degiskenler**: (yok; doğrudan param alanlarına erişilir)
- **Dönüş**: JSX elemanı (tr) — önizleme tablosunun bir satırını render eder

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
- **shadow:** `shadow-[0_0_10px_rgba(245,158,11,0.3)]`, `shadow-[0_0_20px_rgba(34,211,238,0.3)]`, `shadow-[0_40px_100px_rgba(0,0,0,0.6)]`
- **height:** `max-h-[300px]`, `max-h-[85vh]`
- **width:** `max-w-[200px]`
- **spacing:** (yok)
- **diğer:** `border-t-[#0A0F1E]`, `tracking-[0.2em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-lg`, `rounded-hvac-xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-400`, `bg-black/60`, `bg-cyan-400`, `bg-rose-500/20`, `bg-surface-deep/20`, `bg-surface-midnight`, `bg-transparent`, `bg-white`, `bg-white/10`, `bg-white/5`, `bg-white/[0.02]`, `border-2`, `border-b`, `border-dashed`, `border-none`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `group-hover:bg-cyan-400`, `group-hover:scale-110`, `group-hover:text-slate-300`, `group-hover:text-surface-deep`
- **Responsive:** (yok)
