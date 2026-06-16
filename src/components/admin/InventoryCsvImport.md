---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx
skeleton_hash: ed471d6bfb42509d
entity_hashes:
  func:InventoryCsvImport: a3b5b6995ddb5df4
  overview: 3471c7b6d6d55066
  style_tokens: 3e4e1345adb17abc
generated_at: 2026-06-16T10:17:12Z
---

## Genel Bakış
Bu modül, envanter verilerinin CSV dosyası aracılığıyla toplu olarak içe aktarılmasını sağlayan bir React modal bileşenidir. Dosya yükleme, veri doğrulama ve eşik değerine göre stok güncelleme süreçlerini yönetir; üst bileşenle `onSuccess` ve `onClose` callback'leri aracılığıyla iletişim kurar.

## Fonksiyon Grupları
### CSV İçe Aktarma Bileşeni
Modal olarak çalışan ana React bileşenidir. CSV dosyasının seçilmesini, doğrulanmasını ve `effectiveThreshold` parametresine göre envanter güncellemesini tek bir iş akışında yürütür.
- InventoryCsvImport

---

## AXIOMS – Mimari Varsayımlar

Bu modül, CSV tabanlı envanter içe aktarma işlevselliğini sağlayan modal bir React bileşeni olarak aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `isOpen` prop'u `true` değerini almazsa, modal bileşeni render edilmez ve dosya yükleme/işlem süreçleri başlatılamaz.
[Aksiyom 2]: Eğer geçerli bir CSV dosyası seçilmediyse veya dosya içeriği okunamadıysa, veri doğrulama ve önizleme aşamasına geçilemez.
[Aksiyom 3]: Eğer `effectiveThreshold` prop'u sağlanmamışsa (undefined/null), eşik değerine göre stok güncelleme kararı verilemez veya varsayılan bir eşik değeri kullanılır.
[Aksiyom 4]: Eğer CSV dosyasından elde edilen verilerde zorunlu alanlar eksikse veya hatalı veri formatı içeriyorsa, veriler doğrulanamaz ve işleme alınmaz.
[Aksiyom 5]: Eğer üst bileşen `onClose` callback'ini sağlamamışsa, modal kapatma işlemi başarısız olur veya hata oluşur.
[Aksiyom 6]: Eğer üst bileşen `onSuccess` callback'ini sağlamamışsa, başarılı içe aktarma sonrası üst bileşene bildirim gönderilemez.
[Aksiyom 7]: Eğer CSV dosyası çok büyükse veya desteklenmeyen bir formattaysa, dosya yükleme hatası oluşur ve kullanıcıya hata mesajı gösterilir.

---

## FONKSİYON DETAYLARI

### InventoryCsvImport

**Ne yapar**: CSV dosyası aracılığıyla toplu envanter/stok güncelleme işlemi gerçekleştiren modal bileşenidir. Kullanıcının CSV dosyası seçip yüklemesine, verileri önizlemesine, kuru çalıştırma (dry-run) modunda test etmesine veya gerçekten veritabanına aktarmasına olanak tanır. İşlem sonunda hata raporu indirme ve toplu geri alma (undo) işlemleri sunar.

**Nasıl yapar**: Bileşen首先 CSV dosyasını metin olarak okur ve virgülle ayrılmış değerleri parse eder. `sku` ve `qty/quantity/stock/new_stock` sütunlarını başlık satırından otomatik algılar. Parse edilen satırları Supabase veritabanındaki `products` tablosuyla eşleştirerek mevcut stok miktarlarıyla birlikte bir önizleme tablosu oluşturur. `effectiveThreshold` callback'i kullanılarak her ürün için stok durumu (out/critical) belirlenir. `processCSV` fonksiyonu toplu olarak `adjust_stock` RPC çağrısı yapar ve her güncelleme için `logAdminAction` ile denetim kaydı oluşturur. `dryRun` modunda sadece doğrulama yapılır, veritabanına kayıt atılmaz. İşlem sonrası batch tabanlı geri alma butonu sunulur.

**Parametreler**:
- isOpen: boolean — Modalın açık olup olmadığını kontrol eden bayrak. `false` olduğunda bileşen `null` döner ve render edilmez.
- onClose: () => void — Modalın kapatılması istendiğinde çağrılan geri çağıurma fonksiyonu. Hem iptal hem de başarılı işlem sonrası tetiklenir.
- onSuccess: () => void — Stok güncellemesi başarıyla tamamlandığında çağrılan geri çağıurma fonksiyonu. Üst bileşenin verileri yenilemesini tetikler.
- effectiveThreshold: (productId: string) => number | null — Verilen ürün ID'si için kritik stok eşik değerini döndüren fonksiyon. CSV'deki yeni miktar bu değerin altına düştüğünde satır `critical` olarak işaretlenir.

**Dönüş**: JSX.Element — Modal arayüzünü ve CSV işleme mantığını içeren React bileşeni. `isOpen` false ise `null` döner.

---

## İTHALATLAR (IMPORTS)
- import: ../../utils/crypto::generateId
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/lib/utils::cn
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

### [N1_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::InventoryCsvImport
- **params**: `{ isOpen, onClose, onSuccess, effectiveThreshold }` — Modal durumu, kapatma callback'i, başarılı import sonrası callback'ini ve stok eşiği fonksiyonunu alır
- **ic_degiskenler**:
  - `csvPreview` / `setCsvPreview` — CSV'den parse edilmiş önizleme satırlarını tutar (useState)
  - `csvProcessing` / `setCsvProcessing` — CSV işleme sırasında yükleme durumunu belirtir (useState)
  - `csvProgress` / `setCsvProgress` — İşleme ilerleme yüzdesini tutar 0-1 arası (useState)
  - `dryRun` — Kuru çalıştırma modu, sadece doğrulama yapılıp yapılmayacağını belirtir (useState)
  - `csvUndoingRef` — Geri alma işleminin devam edip etmediğini takip eder (useRef)
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `supabase` — Supabase browser client referansı
- **Dönüş**: JSX bileşeni (yok)

### [N2_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleCsvImport (iç fonksiyon)
- **params**: `file: File` — Yüklenen CSV dosyası nesnesi
- **ic_degiskenler**:
  - `textRaw` — Dosyanın ham metin içeriği
  - `text` — BOM karakterinden arındırılmış metin
  - `lines` — Boş satırları filtrelenmiş CSV satırları dizisi
  - `split` — Virgülle splitting yapan, tırnak işaretli alanları koruyan yardımcı fonksiyon
  - `headerRaw` — İlk satırın küçük harfli, trimmed sütun başlıkları
  - `skuIdx` — SKU sütununun indeksi (-1 ise bulunamadı)
  - `qtyIdx` — Miktar sütununun indeksi (qty/quantity/stock/new_stock arar)
  - `parsedRows` — Geçerli satırlar dizisi `{ line, sku, newQty }`
  - `errors` — Hatalı satırlar dizisi `{ line, sku, message }`
  - `i` — For döngüsü indeksi (her satır için)
  - `cells` — Mevcut satırın hücreleri
  - `sku` — SKU string değeri
  - `qtyStr` — Miktar string değeri
  - `newQty` — Sayıya çevrilmiş miktar
  - `skus` — Tekrar eden SKU'ları kaldırılmış benzersiz SKU listesi
  - `products` — Supabase'den çekilen eşleşen ürünler `{ id, sku, name, stock_qty }`
  - `skuToProduct` — SKU ile ürün bilgisini eşleştiren Map
  - `preview` — Oluşturulan önizleme satırları dizisi
  - `row` — parsedRows'taki her bir satır
  - `product` — SKU'ya karşılık gelen ürün bilgisi
  - `th` — effectiveThreshold ile hesaplanan eşik değeri
  - `status` — Stok durumu ('out' | 'critical' | null)
- **Dönüş**: yok (csvPreview state'ini set eder, toast bildirimleri gösterir)

### [N3_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleCsvProcess (iç fonksiyon)
- **params**: yok (arrow function, parametresiz)
- **ic_degiskenler**:
  - `skus` — csvPreview'den extract edilen SKU listesi
  - `products` — Supabase'den çekilen ürünler `{ id, sku }`
  - `skuToId` — SKU'dan productId'ye eşleyen Map
  - `batchId` — generateId() ile üretilen benzersiz toplu iş ID'si
  - `BATCH_SIZE` — Toplu işleme boyutu (20)
  - `chunk` — Her döngü adımındaki dilimlenmiş veri
  - `successCount` — Başarılı güncelleme sayısı
  - `errors` — Hatalı SKU'lar ve mesajları dizisi
  - `downloadErrors` — Hataları CSV olarak indiren iç fonksiyon
  - `header` — Hata CSV'si sütun başlıkları
  - `lines` — Hata CSV'si satırları
  - `csv` — Hatalı CSV'nin tam içeriği
  - `blob` — Hata CSV'si için Blob nesnesi
  - `url` — Blob URL'i
  - `a` — İndirme için oluşturulan geçici anchor elementi
  - `item` — Promise.all içindeki her bir csvPreview elemanı
- **Dönüş**: yok (onClose, onSuccess callback'lerini çağırır, toast bildirimi gösterir)

### [N4_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::processItem (iç async fonksiyon, handleCsvProcess içindeki chunk.map callback'i)
- **params**: `item` — csvPreview elemanı `{ sku, delta, name, current, new, status }`
- **ic_degiskenler**:
  - `_productId` — SKU'dan eşlenen ürün ID'si
  - `reason` — Stok hareketi sebebi ("CSV import: add/remove ...")
  - `error` — supabase.rpc çağrısından dönen hata
  - `logAdminAction` — Lazy import ile yüklenen audit log fonksiyonu (`../../lib/audit` modülünden)
- **Dönüş**: yok (supabase.rpc ile adjust_stock çağırır, audit log yazar, successCount artırır)

### [N5_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::downloadErrors (iç fonksiyon)
- **params**: yok
- **ic_degiskenler**:
  - `header` — CSV sütun başlıkları ['sku', 'message']
  - `lines` — Her hata objesinden oluşturulmuş CSV satırları
  - `csv` — BOM ile başlatılmış tam CSV içeriği
  - `blob` — text/csv charset=utf-8 Blob nesnesi
  - `url` — createObjectURL ile oluşturulan URL
  - `a` — document.createElement('a') ile oluşturulmuş anchor
- **Dönüş**: yok (dosya indirme tetikler)

### [N6_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::undoAll (iç async fonksiyon)
- **params**: yok
- **ic_degiskenler**:
  - `data` — reverse_inventory_batch RPC sonucu (geri alınan hareket sayısı)
  - `error` — RPC hatası
  - `undone` — Number(data || 0) ile sayıya çevrilmiş geri alınan hareket sayısı
- **Dönüş**: yok (supabase.rpc reverse_inventory_batch çağırır, onSuccess tetikler, toast gösterir)

### [N7_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::toastRender (toast.custom callback'i)
- **params**: `id` — toast instance ID'si (toast.dismiss(id) için kullanılır)
- **ic_degiskenler**:
  - `successCount` — Dış kapsamdan gelen başarılı güncelleme sayısı
  - `batchId` — Dış kapsamdan gelen toplu iş ID'si
  - `errors` — Dış kapsamdan gelen hatalar dizisi
  - `t` — Çeviri fonksiyonu
  - `downloadErrors` — Dış kapsamdan gelen hata indirme fonksiyonu
- **Dönüş**: JSX — Başarı bildirim kartı (CheckCircle2 ikonu, hareketlere link, hata indirme butonu, geri alma butonu)

### [N8_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleFileChange (input onChange handler)
- **params**: `e` — React.ChangeEvent<HTMLInputElement>
- **ic_degiskenler**:
  - `file` — `e.target.files?.[0]` ile alınan seçilen dosya
- **Dönüş**: yok (handleCsvImport(file) çağırır)

### [N9_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::handleDryRunKey (input onKeyDown handler)
- **params**: `e` — React.KeyboardEvent
- **ic_degiskenler**: yok
- **Dönüş**: yok (Enter veya Space tuşunda dryRun toggle eder)

### [N10_NASIL] AST Pointer: src/components/admin/InventoryCsvImport.tsx::renderRow (tablo satır render fonksiyonu)
- **params**: `item` — CsvPreviewRow `{ sku, name, current, new, delta, status }`, `idx` — satır indeksi
- **ic_degiskenler**: yok
- **Dönüş**: JSX `<tr>` — SKU adı, mevcut stok, yeni stok, delta değerini gösteren tablo satırı

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