---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx
skeleton_hash: 761e75d04491351f
entity_hashes:
  func:InventoryCsvImport: 312fdc52cc14a1c7
  overview: e2963426468ad6fc
  style_tokens: 3e4e1345adb17abc
generated_at: 2026-05-29T18:44:43Z
---

## Genel Bakış
Bu modül, CSV dosyaları aracılığıyla envanter (stok) verilerinin toplu olarak içe aktarılmasını sağlayan bir React bileşenidir. Kullanıcıya dosya yükleme, verileri önizleme ve onaylama, ardından seçilen eşik değerine göre stok ayarlama işlemi sunar.

## Fonksiyon Grupları
### Ana Bileşen
Envanter CSV içe aktarma sürecinin tüm kullanıcı arayüzü ve iş mantığını yönetir; dosya seçimi, doğrulama, önizleme ve nihai işleme adımlarını tek bir yerde toplar.
- InventoryCsvImport

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir modal/dialog yapısı olarak tasarlanmıştır ve dış bağımlılıkların sağlanması gerekmektedir.

[Aksiyom 1]: Eğer `onClose` callback'i sağlanmazsa, kullanıcı modalı kapatamaz ve bileşen çıkışsız kalır.

[Aksiyom 2]: Eğer `onSuccess` callback'i sağlanmazsa, başarılı CSV içe aktarma işlemi sonrasında üst bileşene bildirim yapılamaz.

[Aksiyom 3]: Eğer `effectiveThreshold` değeri sağlanmazsa, envanter verilerinin eşik bazlı işlenmesinde tanımsız davranış oluşur.

[Aksiyom 4]: Eğer `isOpen` false veya tanımsız ise, modal görünür olmaz (bileşen rendered olmayabilir).

[Aksiyom 5]: Eğer bileşen bir üst bileşen tarafından DOM'a yerleştirilmemişse (örn: bir Modal portal içinde değilse), dosya seçme ve doğrulama akışı görünür şekilde çalışmaz.

[Aksiyom 6]: Eğer `effectiveThreshold` geçerli bir sayısal değer değilse (null, undefined veya string), eşik bazlı filtreleme/kabul kriteri uygulanamaz.

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

### [N1_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleCsvImport
- **params**: `file` (File) — CSV dosyası nesnesi
- **ic_degiskenler**:
  - `csvPreview` — CSV önizleme satırlarını tutan state (başlangıçta temizlenir)
  - `textRaw` — Dosyadan okunan ham metin içeriği
  - `text` — BOM karakteri temizlenmiş metin
  - `lines` — Boş satırları filtrelenmiş CSV satırları dizisi
  - `split` — CSV satırlarını virgülle ayıran ve tırnak işaretlerini işleyen yardımcı fonksiyon
  - `headerRaw` — İlk satırın küçük harfe çevrilmiş ve boşlukları temizlenmiş hali
  - `skuIdx` — SKU sütununun indeksi
  - `qtyIdx` — Miktar sütununun indeksi (qty/quantity/stock/new_stock alternatifleriyle)
  - `parsedRows` — Geçerli CSV satırlarının (line, sku, newQty) dizisi
  - `errors` — Hatalı satırların (line, sku, message) dizisi
  - `i` — For döngüsü sayaç değişkeni (satır numarası)
  - `cells` — Mevcut satırın hücre değerleri dizisi
  - `sku` — Mevcut satırın SKU değeri (trimmed)
  - `qtyStr` — Mevcut satırın miktar değeri string olarak
  - `newQty` — Sayıya çevrilmiş miktar (geçersiz ise NaN)
  - `skus` — Benzersiz SKU değerlerinin dizisi
  - `products` — Veritabanından getirilen ürün verileri (id, sku, name, stock_qty)
  - `skuToProduct` — SKU'dan ürüne eşleme Map'i
  - `preview` — Oluşturulan CsvPreviewRow dizisi
  - `row` — parsedRows dizisinin her bir elemanı
  - `product` — Mevcut satırın SKU'suna karşılık gelen ürün
  - `th` — Ürün için eşik değeri (effectiveThreshold ile hesaplanan)
  - `status` — Ürünün stok durumu ('out', 'critical' veya null)
- **Dönüş**: yok (state günceller ve toast gösterir)

### [N2_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleCsvProcess
- **params**: yok
- **ic_degiskenler**:
  - `csvPreview` — İşlenecek CSV önizleme verisi
  - `csvProcessing` — İşlem durumunu takip eden state
  - `csvProgress` — İlerleme yüzdesi state'i
  - `skus` — csvPreview'deki tüm SKU'ların dizisi
  - `products` — Veritabanından getirilen ürün verileri (id, sku)
  - `skuToId` — SKU'dan product_id'ye eşleme Map'i
  - `dryRun` — Kuru çalıştırma modu (true ise gerçek işlem yapılmaz)
  - `successCount` — Başarılı güncelleme sayısı sayaacı
  - `errors` — Hatalı işlemlerin (sku, message) dizisi
  - `batchId` — İşlem batch ID'si (generateId ile oluşturulan)
  - `BATCH_SIZE` — Toplu işlem boyutu (20)
  - `i` — For döngüsü sayaç değişkeni
  - `chunk` — Mevcut toplu iş parçası (csvPreview.slice ile)
  - `item` — chunk içindeki her bir eleman
  - `_productId` — Mevcut SKU'nun product_id karşılığı
  - `reason` — Stok hareketi açıklaması
  - `error` — supabase.rpc hatası
  - `logAdminAction` — Dinamik import edilen audit log fonksiyonu
  - `err` — Try-catch'te yakalanan hata
  - `downloadErrors` — Hataları CSV olarak indiren yerel fonksiyon
  - `header` — Hata CSV başlık satırı
  - `lines` — Hata satırları
  - `csv` — Oluşturulan hata CSV içeriği
  - `blob` — CSV verisi için Blob nesnesi
  - `url` — Blob için oluşturulan URL
  - `a` — İndirme bağlantısı için HTML anchor elementi
  - `id` — toast.custom tarafından verilen toast ID'si
- **Dönüş**: yok (onSuccess() ve onClose() çağırır)

### [N3_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::processItem
- **params**: `item` (CsvPreviewRow) — İşlenecek CSV satır verisi
- **ic_degiskenler**:
  - `skuToId` — SKU'dan product_id'ye eşleme Map'i (dış kapsamdan)
  - `_productId` — Mevcut SKU'nun product_id karşılığı
  - `reason` — Stok hareketi açıklaması
  - `error` — supabase.rpc hatası
  - `logAdminAction` — Dinamik import edilen audit log fonksiyonu
  - `batchId` — İşlem batch ID'si (dış kapsamdan)
  - `err` — Try-catch'te yakalanan hata
  - `successCount` — Başarılı güncelleme sayacı (dış kapsamdan, güncellenir)
  - `errors` — Hatalar dizisi (dış kapsamdan, güncellenir)
- **Dönüş**: yok (successCount artırır veya errors'a ekler)

### [N4_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::downloadErrors
- **params**: yok
- **ic_degiskenler**:
  - `errors` — Hatalı işlemlerin dizisi (dış kapsamdan)
  - `header` — CSV başlık satırı ['sku', 'message']
  - `lines` — Her hata için CSV formatında satır
  - `csv` — BOM ile başlayan tam CSV içeriği
  - `blob` — CSV verisi için Blob nesnesi
  - `url` — Blob için oluşturulan URL
  - `a` — İndirme bağlantısı için HTML anchor elementi
- **Dönüş**: yok (dosya indirme tetikler)

### [N5_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::renderToastContent
- **params**: `id` (string) — toast.custom tarafından verilen toast ID'si
- **ic_degiskenler**:
  - `successCount` — Başarılı güncelleme sayısı (dış kapsamdan)
  - `batchId` — İşlem batch ID'si (dış kapsamdan)
  - `errors` — Hatalı işlemlerin dizisi (dış kapsamdan)
  - `downloadErrors` — Hataları indiren fonksiyon (dış kapsamdan)
  - `csvUndoingRef` — Geri alma işlemini takip eden ref
  - `onSuccess` — Başarı callback'i (dış kapsamdan)
- **Dönüş**: JSX elementi (toast içeriği)

### [N6_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleUndo
- **params**: yok
- **ic_degiskenler**:
  - `csvUndoingRef` — Geri alma işlemini takip eden ref
  - `batchId` — İşlem batch ID'si (dış kapsamdan)
  - `data` — reverse_inventory_batch RPC sonucu
  - `error` — RPC hatası
  - `undone` — Geri alınan hareket sayısı
  - `e` — Try-catch'te yakalanan hata
- **Dönüş**: yok (toast gösterir ve onSuccess() çağırır)

### [N7_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleFileChange
- **params**: `e` (ChangeEvent<HTMLInputElement>) — Dosya input değişiklik olayı
- **ic_degiskenler**:
  - `file` — Seçilen dosya (e.target.files[0])
  - `handleCsvImport` — CSV import fonksiyonu (dış kapsamdan)
- **Dönüş**: yok (handleCsvImport çağırır)

### [N8_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleKeyDown
- **params**: `e` (KeyboardEvent) — Klavye olayı
- **ic_degiskenler**:
  - `dryRun` — Kuru çalıştırma modu state'i
  - `setDryRun` — dryRun state setter'ı
- **Dönüş**: yok (dryRun toggle eder)

### [N9_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::renderPreviewRow
- **params**: 
  - `item` (CsvPreviewRow) — Önizleme satır verisi
  - `idx` (number) — Satır indeksi
- **ic_degiskenler**:
  - `item.name` — Ürün adı
  - `item.sku` — Ürün SKU'su
  - `item.current` — Mevcut stok miktarı
  - `item.new` — Yeni stok miktarı
  - `item.delta` — Stok değişim miktarı
- **Dönüş**: JSX table row elementi

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