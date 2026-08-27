---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\InventoryCsvImport.tsx
skeleton_hash: dd9394357b1fe44d
entity_hashes:
  func:InventoryCsvImport: 9318bdab1aeb480b
  overview: 8a8e33b88d67f992
  style_tokens: 735539ffb01f0fbd
generated_at: 2026-08-27T08:01:22Z
---

## Genel Bakış

Bu modül, envanter verilerinin CSV dosyası aracılığıyla toplu olarak içe aktarılmasını sağlayan bir React bileşenidir. Bileşen, bir modal/dialog yapısı içinde açılır (`isOpen`), kapatma (`onClose`) ve başarılı içe aktarım sonrası bildirim (`onSuccess`) geri çağrılarını destekler. `effectiveThreshold` parametresi, içe aktarma sırasında kullanılacak eşik değerini belirtir.

## Fonksiyon Grupları

### Ana Bileşen

Envanter CSV içe aktarma sürecinin tamamını tek bir bileşen olarak yönetir. Dosya seçimi, doğrulama, yükleme ve sonuç bildirimi gibi adımları kapsar; bileşen dışarıdan yalnızca dört prop ile yapılandırılır.

- InventoryCsvImport

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### InventoryCsvImport
**Ne yapar**: Envanter ürünlerinin stok miktarlarını toplu olarak CSV dosyasından içe aktaran bir React bileşenidir. Kullanıcı bir CSV dosyası seçer, bileşen dosyayı ayrıştırarak ürün bilgilerini önizleme olarak gösterir ve ardından istenen ürünün stoğunu günceller. "Kuru çalıştırma" (dry run) modu ile gerçek veritabanı yazma işlemi yapmadan yalnızca simülasyon çalıştırılabilir.

**Nasıl yapar**: Bileşen açıldığında (`isOpen` true ise) bir diyalog penceresi render eder. Kullanıcı CSV dosyası seçtiğinde `handleCsvImport` fonksiyonu tetiklenir; bu fonksiyon dosyayı metin olarak okur, BOM karakterini temizler, satırlara böler ve virgülle ayrılmış değerleri ayrıştırır. CSV başlığında `sku` sütunu ile birlikte `qty`, `quantity`, `stock` veya `new_stock` sütunlarından birini arar. Her satırda SKU ve miktar bilgisini doğrulayarak geçerli satırları `parsedRows` dizisine, hatalı satırları `errors` dizisine ekler. Ardından Supabase üzerinden `products` tablosundan eşleşen ürünleri sorgular ve her ürün için `effectiveThreshold` fonksiyonu ile eşik değeri hesaplayarak stok durumunu (`out`, `critical` veya `null`) belirler. Sonuç `csvPreview` state'ine kaydedilir ve önizleme tablosu gösterilir.

`processCSV` fonksiyonu ise içe aktarma işlemini başlatır. Kuru çalıştırma modu kapalıysa, kullanıcının onayını almak için `confirm` fonksiyonunu çağırır. Onay alındıktan sonra ürünleri 20'şerlik gruplara (BATCH_SIZE) böler ve her grup için paralel olarak Supabase RPC fonksiyonu `adjust_stock` çağrısı yapar. Her başarılı güncelleme sonrası `../../lib/audit` modülünden dinamik olarak import edilen `logAdminAction` fonksiyonu ile denetim kaydı oluşturur. Tüm işlemler bir `batch_id` ile gruplanır. İşlem tamamlandığında başarılı/hatalı ürün sayılarını gösteren bir bildirim (toast) görüntülenir; bu bildirimde hareketleri görüntüleme linki, hataları CSV olarak indirme butonu ve tüm işlemi geri alma (undo) butonu bulunur. Geri alma işlemi Supabase RPC fonksiyonu `reverse_inventory_batch` ile gerçekleştirilir. `csvUndoingRef` referansı, geri alma işleminin aynı anda birden fazla kez tetiklenmesini engellemek için kullanılır.

Bileşen, Radix UI `Dialog` bileşenini temel alır ve `Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Close` alt bileşenlerini kullanır. Diyalog kapatıldığında `onClose` çağrılır. Dosya yükleme alanı sürükle-bırak görselli bir bölge olup, gizli bir `<input type="file" accept=".csv">` öğesi içerir. Kuru çalıştırma modu bir checkbox ve özel bir switch butonu ile kontrol edilir. Önizleme tablosu yalnızca `csvPreview` dizisi dolu olduğunda gösterilir ve her satırda ürün adı, SKU, mevcut stok, yeni stok ve stok farkı (delta) bilgileri yer alır. Delta değeri pozitifse yeşil, negatifse kırmızı renkte gösterilir.

**Parametreler**:
- isOpen: `boolean` — Diyalog penceresinin açık olup olmadığını belirler. `false` olduğunda bileşen `null` döndürerek hiçbir şey render etmez.
- onClose: `() => void` — Diyalog kapatıldığında çağrılan geri çağırma fonksiyonu. Kapatma butonu, iptal butonu ve diyalog dışı tıklama ile tetiklenir.
- onSuccess: `() => void` — İçe aktarma işlemi başarıyla tamamlandığında çağrılan geri çağırma fonksiyonu. Hem normal içe aktarma hem de geri alma (undo) işlemi sonrası tetiklenir.
- effectiveThreshold: `(productId: string) => number | null` — Verilen ürün kimliğine ait kritik stok eşik değerini döndüren fonksiyon. Dönen değer `null` ise eşik kontrolü yapılmaz; aksi halde yeni stok miktarı bu değerle karşılaştırılarak `'critical'` durumu belirlenir.

**Dönüş**: Bileşen, `isOpen` `false` olduğunda `null` döndürür. Aksi halde Radix UI `Dialog` bileşenlerinden oluşan bir JSX ağacı döndürür. Kodda açık bir dönüş tipi belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../../utils/crypto::generateId
- import: ./overlay/ConfirmProvider::useConfirm
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/lib/utils::cn
- import: @radix-ui/react-dialog
- import: lucide-react::CheckCircle2
- import: lucide-react::FileUp
- import: lucide-react::Info
- import: lucide-react::Search
- import: lucide-react::X
- import: react::React
- import: react::useRef
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### CsvPreviewRow
CSV STOK İÇE AKTARMA. `dcc5a895` (Inventory → DataTableKit) göçünde importer'ı kayboldu; dosya tam yazılmış hâlde ama HİÇBİR yerden çağrılmadan kaldı → "CSV Yükle" işlevi kullanıcıdan düştü. Cetvel: `docs/standards/admin-design-standard.md` §4. · §4.8 — elle yazılmış perde/dialog odak tuzağı, ESC ve
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
- **params**: `file: File`
- **ic_degiskenler**:
  - `textRaw` — `file.text()` ile okunan ham metin
  - `text` — BOM karakteri (`\uFEFF`) kaldırılmış metin
  - `lines` — metnin satırlara bölünmüş hali, boş satırlar filtrelenmiş
  - `split` — virgülle ayırma fonksiyonu, tırnak işaretlerini işler
  - `headerRaw` — başlık satırı, küçük harfe çevrilmiş ve trimlenmiş
  - `skuIdx` — `'sku'` sütununun indeksi
  - `qtyIdx` — miktar sütununun indeksi; `'qty'`, `'quantity'`, `'stock'`, `'new_stock'` sırasıyla aranır
  - `parsedRows` — geçerli satırların listesi; her eleman `{ line, sku, newQty }` içerir
  - `errors` — hata listesi; her eleman `{ line, sku, message }` içerir
  - `i` — döngü sayacı (1'den başlar, başlık satırı atlanır)
  - `cells` — `split(lines[i])` ile elde edilen hücre dizisi
  - `sku` — `cells[skuIdx]`'den alınan stok kodu, trimlenmiş
  - `qtyStr` — `cells[qtyIdx]`'den alınan miktar string'i, trimlenmiş
  - `newQty` — `qtyStr`'nin sayıya çevrilmiş hali; boşsa `NaN`
  - `skus` — `parsedRows`'tan elde edilen benzersiz SKU dizisi
  - `products` — `supabase.from('products').select('id, sku, name, stock_qty').in('sku', skus)` sorgusundan dönen veri
  - `skuToProduct` — SKU'dan `{ id, name, stock }` objesine eşleyen `Map`
  - `preview` — `CsvPreviewRow[]` tipinde önizleme satırları
  - `row` — `parsedRows` üzerindeki döngü elemanı
  - `product` — `skuToProduct.get(row.sku)` ile eşleşen ürün
  - `th` — `effectiveThreshold(product.id)` ile hesaplanan eşik değeri
  - `status` — stok durumu: `row.newQty <= 0` ise `'out'`, eşik altındaysa `'critical'`, değilse `null`
- **Dönüş**: yok — `setCsvPreview(preview)` çağırır, hatalarda `toast.error` ile bildirim yapar

### [N2_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleCsvProcess
- **params**: yok
- **ic_degiskenler**:
  - `ok` — `confirm()` dialog sonucu; `dryRun` false ise onay zorunlu
  - `skus` — `csvPreview.map(item => item.sku)` ile elde edilen SKU dizisi
  - `products` — `supabase.from('products').select('id, sku').in('sku', skus)` sorgusundan dönen veri
  - `skuToId` — SKU'dan ürün ID'sine eşleyen `Map`
  - `successCount` — başarılı güncellenen ürün sayısı
  - `errors` — hata listesi; her eleman `{ sku, message }` içerir
  - `batchId` — `generateId()` ile oluşturulan toplu işlem kimliği
  - `BATCH_SIZE` — parti boyutu sabiti (20)
  - `i` — döngü sayacı
  - `chunk` — `csvPreview.slice(i, i + BATCH_SIZE)` ile elde edilen alt dizi
  - `item` — `chunk.map` içindeki her bir `CsvPreviewRow` elemanı
  - `_productId` — `skuToId.get(item.sku)` ile eşleşen ürün ID'si
  - `reason` — işlem nedeni string'i (örn. `"CSV import: add 5"`)
  - `error` — `supabase.rpc('adjust_stock', ...)` sonucu dönen hata
  - `logAdminAction` — dinamik import ile yüklenen audit fonksiyonu (`../../lib/audit`)
  - `downloadErrors` — hataları CSV olarak indiren iç fonksiyon
  - `id` — `toast.custom` callback'ine gelen toast ID'si
  - `data` — `supabase.rpc('reverse_inventory_batch', ...)` sonucu dönen veri
  - `undone` — geri alınan işlem sayısı (`Number(data || 0)`)
  - `e` — catch bloğundaki hata
- **Dönüş**: yok — `dryRun` true ise `onClose()` çağırır; değilse `onClose()` ve `onSuccess()` çağırır, `toast.custom` ile başarı bildirimi gösterir

### [N3_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::chunkItemProcessor
- **params**: `item` (CsvPreviewRow tipinde)
- **ic_degiskenler**:
  - `_productId` — `skuToId.get(item.sku)` ile eşleşen ürün ID'si; yoksa veya `item.delta === 0` ise fonksiyon erken döner
  - `reason` — işlem nedeni string'i; `item.delta` pozitifse `'add'`, negatifse `'remove'` ifadesi içerir
  - `error` — `supabase.rpc('adjust_stock', { p_product_id, p_delta, p_reason, p_batch_id })` sonucu dönen hata
  - `logAdminAction` — dinamik import ile yüklenen audit fonksiyonu; `table_name: 'inventory_movements'`, `action: 'INSERT'` ile kayıt yapar
  - `err` — catch bloğundaki hata; `errors` dizisine `{ sku, message }` olarak eklenir
- **Dönüş**: yok — başarılıysa `successCount` artırır; hata olursa `errors` dizisine ekler

### [N4_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::downloadErrors
- **params**: yok
- **ic_degiskenler**:
  - `header` — CSV başlık satırı dizisi (`[t('...sku'), t('...message')]`)
  - `lines` — `errors.map` ile üretilen CSV satırları; SKU ve message çift tırnak içinde escape edilmiş
  - `csv` — BOM karakteri eklenmiş tam CSV metni
  - `blob` — `new Blob([csv], { type: 'text/csv;charset=utf-8;' })` ile oluşturulan dosya blob'u
  - `url` — `URL.createObjectURL(blob)` ile oluşturulan geçici URL
  - `a` — `document.createElement('a')` ile oluşturunan indirme linki; `download` attribute'u tarih damgası içerir
- **Dönüş**: yok — tarayıcıda dosya indirme tetikler, ardından `URL.revokeObjectURL(url)` ile URL temizlenir

### [N5_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::toastCustomRender
- **params**: `id` (toast bildiriminin benzersiz kimliği)
- **ic_degiskenler**: yok — JSX doğrudan döndürülür; `successCount`, `batchId`, `errors`, `downloadErrors`, `csvUndoingRef`, `supabase`, `onSuccess`, `t` gibi dış kapsamdaki değerlere erişir
- **Dönüş**: JSX elementi — başarı bildirimi, "Hareketleri Gör" linki, hata indirme butonu ve "Geri Al" butonu içerir

### [N6_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::undoHandler
- **params**: yok
- **ic_degiskenler**:
  - `data` — `supabase.rpc('reverse_inventory_batch', { p_batch_id: batchId })` sonucu dönen veri
  - `error` — RPC sonucu dönen hata; varsa throw edilir
  - `undone` — `Number(data || 0)` ile hesaplanan geri alınan işlem sayısı
  - `e` — catch bloğundaki hata
- **Dönüş**: yok — başarılıysa `toast.success` ve `onSuccess()` çağırır; `finally` bloğunda `csvUndoingRef.current = false` ve `toast.dismiss(id)` yapılır

### [N7_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::fileInputOnChange
- **params**: `e` (ChangeEvent<HTMLInputElement>)
- **ic_degiskenler**:
  - `file` — `e.target.files?.[0]` ile seçilen dosya; varsa `handleCsvImport(file)` çağrılır
- **Dönüş**: yok — `handleCsvImport` fonksiyonunu tetikler

### [N8_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::dryRunKeyHandler
- **params**: `e` (KeyboardEvent)
- **ic_degiskenler**: yok — `e.key` kontrol edilir
- **Dönüş**: yok — `Enter` veya `Space` tuşunda `setDryRun(!dryRun)` çağırır ve `e.preventDefault()` yapar

### [N9_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::previewRowRender
- **params**: `item` (CsvPreviewRow), `idx` (number)
- **ic_degiskenler**: yok — JSX doğrudan döndürülür; `item.name`, `item.sku`, `item.current`, `item.new`, `item.delta` kullanılır
- **Dönüş**: JSX elementi (`<tr>`) — ürün adı/SKU, mevcut stok, yeni stok ve delta sütunlarını render eder; delta pozitifse yeşil, negatifse kırmızı renk uygulanır

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
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-danger-weak`, `bg-admin-surface`, `bg-admin-surface-2`, `bg-admin-surface-3`, `bg-admin-warning`, `bg-black/60`, `bg-surface-deep/20`, `bg-transparent`, `border-2`, `border-admin-border`, `border-admin-danger/30`, `border-b`, `border-dashed`, `border-separate`
- **Layout:** `absolute`, `block`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `h-10`, `h-12`, `h-16`, `h-3`, `h-4`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `group-hover:`, `group-last:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${dryRun`, `${item.delta`, `-translate-x-1/2`, `-translate-y-1/2`, `0`, `:`, `>`, `animate-in`, `animate-spin`, `border`, `cursor-pointer`, `decoration-admin-accent`, `disabled:opacity-30`, `duration-300`, `fade-in`