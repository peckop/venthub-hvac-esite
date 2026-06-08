---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx
skeleton_hash: c0f1efabd085dabf
entity_hashes:
  func:InventoryCsvImport: 312fdc52cc14a1c7
  overview: b024d6af47a350e3
  style_tokens: 3e4e1345adb17abc
generated_at: 2026-06-08T10:08:36Z
---

## Genel Bakış
Bu modül, CSV dosyaları aracılığıyla envanter verilerinin toplu olarak içe aktarılmasını sağlayan bir React modal bileşenidir. Dosya yükleme, veri doğrulama, önizleme ve eşik değerine göre stok güncelleme süreçlerini tek bir arayüzde yönetir ve üst bileşenle callback fonksiyonları aracılığıyla iletişim kurar.

## Fonksiyon Grupları
### Ana Bileşen
CSV içe aktarma iş akışını (dosya seçimi, doğrulama, önizleme ve nihai işleme) tek bir yerde yönetir ve modal kontrolü ile üst bileşenle iletişim sağlar.
- InventoryCsvImport

---

## AXIOMS – Mimari Varsayımlar

Bu modül, CSV tabanlı toplu envanter içe aktarma işlevi sağlayan modal bir React bileşenidir.

[Aksiyom 1]: Eğer `onClose` callback'i sağlanmazsa veya geçerli bir fonksiyon olmazsa, modal kapatılamaz ve kullanıcı arayüzünde kilitli bir durum oluşur.

[Aksiyom 2]: Eğer `onSuccess` callback'i sağlanmazsa, başarılı CSV içe aktarma işleminden sonra üst bileşen stok verilerini yenileme bildirimi alamaz.

[Aksiyom 3]: Eğer `effectiveThreshold` değeri sağlanmazsa (undefined/null), modülün eşik bazlı stok güncelleme mantığı çalışmayabilir; bilinmiyor hangi default davranış uygulanır — fonksiyon gövdesinde bu durumun ele alınıp alınmadığı bilinmiyor.

[Aksiyom 4]: Eğer `isOpen` false değerini alırsa, modal bileşeni render edilmez veya gizli durumda olur; bileşenin iç CSV yükleme/dogrulama state'leri bu durumda sıfırlanıp sıfırlanmayacağı fonksiyon gövdesine bağlıdır.

[Aksiyom 5]: Eğer bileşen modal içinde CSV dosyası yükleme ve doğrulama yürütüyorsa, `effectiveThreshold` sayısal bir değer olarak verilmelidir — aksi takdirde eşik karşılaştırma mantığı beklenmeyen sonuçlar üretebilir.

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

### [N1_NASIL] AST Pointer: InventoryCsvImport.tsx::handleCsvImport
- **params**: (file: File)
- **ic_degiskenler**:
  - `textRaw` — Dosyanın ham metin içeriği (BOM karakteri dahil)
  - `text` — BOM karakteri temizlenmiş CSV metni
  - `lines` — Boş satırları filtrelenmiş satır dizisi
  - `split` — Virgülle ayıran ve tırnak işaretlerini işleyen yardımcı fonksiyon
  - `headerRaw` — Küçük harf ve boşluk temizlenmiş başlık satırı
  - `skuIdx` — SKU sütununun indeksi
  - `qtyIdx` — qty/quantity/stock/new_stock sütununun indeksi
  - `parsedRows` — Geçerli satırların {line, sku, newQty} formatında tutulduğu dizi
  - `errors` — Hatalı satırların {line, sku, message} formatında tutulduğu dizi
  - `products` — Supabase'den çekilen ürünlerin (id, sku, name, stock_qty) dizisi
  - `skuToProduct` — SKU'ya göre ürün bilgilerini (id, name, stock) tutan Map
  - `preview` — Önizleme satırlarının (CsvPreviewRow) tutulduğu dizi
- **Dönüş**: yok — State güncelleme (setCsvPreview) ve toast hata mesajları

### [N2_NASIL] AST Pointer: InventoryCsvImport.tsx::handleCsvProcess
- **params**: yok
- **ic_degiskenler**:
  - `skus` — csvPreview'deki benzersiz SKU listesi
  - `products` — Supabase'den çekilen ürünlerin (id, sku) dizisi
  - `skuToId` — SKU'ya göre ürün ID'lerini tutan Map
  - `successCount` — Başarıyla güncellenen ürün sayısı
  - `errors` — Hatalı SKU ve mesajlarını tutan dizi
  - `batchId` — Toplu işlem için benzersiz ID (generateId ile oluşturuldu)
  - `BATCH_SIZE` — Toplu işleme boyutu (20)
- **Dönüş**: yok — State güncelleme (setCsvProcessing, setCsvProgress), onClose/onSuccess çağrısı, toast bildirimi

### [N3_NASIL] AST Pointer: InventoryCsvImport.tsx::processItem (inner async)
- **params**: (item: CsvPreviewRow)
- **ic_degiskenler**:
  - `_productId` — SKU'ya karşılık gelen ürün ID'si (skuToId Map'inden)
  - `reason` — Stok hareketi nedeni metni (CSV import add/remove)
- **Dönüş**: yok — supabase.rpc('adjust_stock') çağrısı ve logAdminAction ile audit loglama

### [N4_NASIL] AST Pointer: InventoryCsvImport.tsx::downloadErrors
- **params**: yok
- **ic_degiskenler**:
  - `header` — CSV başlık satırı (['sku', 'message'])
  - `lines` — Hataların CSV formatında satırları
  - `csv` — Tam CSV metni (BOM dahil)
  - `blob` — CSV dosyası için Blob nesnesi
  - `url` — Blob URL'i
  - `a` — Dosyayı indirmek için oluşturulan anchor element
- **Dönüş**: yok — Tarayıcıda dosya indirme tetikleme

### [N5_NASIL] AST Pointer: InventoryCsvImport.tsx::toastContent (inner)
- **params**: (id: string)
- **ic_degiskenler**:
  - (Local variable yok, sadece parametre ve closure değişkenleri kullanılıyor)
- **Dönüş**: JSX.Element — Başarı toast bildirimi (Hareketleri Gör, Hataları İndir, Tümünü Geri Al butonları)

### [N6_NASIL] AST Pointer: InventoryCsvImport.tsx::handleUndo (inner async)
- **params**: yok
- **ic_degiskenler**:
  - `data` — reverse_inventory_batch RPC dönüş değeri
  - `error` — RPC hatası
  - `undone` — Geri alınan hareket sayısı
- **Dönüş**: yok — supabase.rpc('reverse_inventory_batch') çağrısı, toast bildirimi, onSuccess çağrısı

### [N7_NASIL] AST Pointer: InventoryCsvImport.tsx::handleFileChange
- **params**: (e: React.ChangeEvent<HTMLInputElement>)
- **ic_degiskenler**:
  - `file` — Seçilen dosya (e.target.files[0])
- **Dönüş**: yok — handleCsvImport(file) çağrısı

### [N8_NASIL] AST Pointer: InventoryCsvImport.tsx::handleDryRunToggle
- **params**: (e: React.KeyboardEvent<HTMLInputElement>)
- **ic_degiskenler**:
  - (Local variable yok)
- **Dönüş**: yok — dryRun durumunu togggle etme

### [N9_NASIL] AST Pointer: InventoryCsvImport.tsx::renderRow
- **params**: (item: CsvPreviewRow, idx: number)
- **ic_degiskenler**:
  - (Local variable yok, sadece parametre kullanılıyor)
- **Dönüş**: JSX.Element — Tablo satırı (sku, name, current, new, delta sütunları)

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