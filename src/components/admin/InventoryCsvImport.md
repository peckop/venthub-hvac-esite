---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryCsvImport.tsx
skeleton_hash: b3421236e71cdedd
entity_hashes:
  func:InventoryCsvImport: bba4310bb8e97324
  overview: 618d3c1361b05bd5
  style_tokens: 3e4e1345adb17abc
generated_at: 2026-05-28T22:35:31Z
---

## Genel Bakış

Bu modül, CSV dosyaları aracılığıyla envanter verilerini toplu olarak içe aktarmak için kullanılan bir React bileşenidir. Kullanıcıya bir dosya seçme, yüklenen verileri doğrulama ve belirli bir eşik değerine göre işleme imkanı sunar. İşlem başarıyla tamamlandığında bir geri çağrı fonksiyonu tetiklenir ve kullanıcıya sonuç bildirilir.

## Fonksiyon Grupları

### Ana Bileşen
Envanter CSV içe aktarma sürecinin tüm adımlarını yönetir; dosya seçimi, veri çözümleme, doğrulama, eşik değeri uygulama ve sonuç bildirimini tek bir yerde toplar.
- InventoryCsvImport

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### InventoryCsvImport
**Ne yapar**: CSV dosyasından ürün stok bilgilerini okuyarak önizleme oluşturur, kullanıcıya gösterir ve isteğe bağlı olarak gerçek veritabanı güncellemelerini (veya sadece kuru çalıştırma) gerçekleştirir.  

**Nasıl yapar**:  
- Bileşen açıldığında (`isOpen` true) dosya seçimi bekler.  
- `handleCsvImport` dosyayı metin olarak okur, başlık satırını analiz eder ve SKU ile miktar sütunlarını belirler.  
- Satırları ayrıştırıp geçerli SKU ve sayısal miktarları doğrular; hatalı satırları toplar.  
- Veritabanından ilgili ürünleri (`supabase.from('products')`) çekerek SKU‑product eşlemesi kurar.  
- Her satır için yeni stok, mevcut stok ve kritik eşik (`effectiveThreshold`) karşılaştırması yaparak bir önizleme (`CsvPreviewRow`) oluşturur ve `csvPreview` durumuna kaydeder.  
- `processCSV` fonksiyonu, önizleme verileri mevcutsa, kuru çalıştırma modunda sadece onay verir; aksi takdirde batch‑boyutlu (20) RPC çağrıları (`adjust_stock`) ile stok değişikliklerini uygular, işlem loglarını (`logAdminAction`) kaydeder ve ilerleme yüzdesini `csvProgress` ile günceller.  
- Başarılı ve hatalı işlemler için toast bildirimleri gösterir, hataları CSV olarak indirilebilir kılar ve geri alma (undo) işlemi için `reverse_inventory_batch` RPC’sini çağırır.  

**Parametreler**:
- `isOpen`: boolean — Bileşenin görünür olup olmadığını belirler; false ise bileşen render edilmez.  
- `onClose`: () => void — Kullanıcı kapanış butonuna tıkladığında veya işlem tamamlandığında çağrılan geri dönüş fonksiyonu.  
- `onSuccess`: () => void — CSV işleme başarılı bir şekilde tamamlandığında tetiklenen geri dönüş fonksiyonu.  
- `effectiveThreshold`: (productId: string) => number \| null — Bir ürünün kritik stok eşiğini döndüren fonksiyon; `null` ise eşik yoktur.  

**Dönüş**: void (React bileşeni JSX döndürür; fonksiyonun kendisi bir değer üretmez).

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
- **params**: `(file: File)`
- **ic_degiskenler**:
  - `textRaw` — `await file.text()` ile dosyanın ham metni.
  - `text` — UTF‑8 BOM kaldırılmış metin.
  - `lines` — satır sonu karakterlerine göre bölünmüş, boş olmayan satırların dizisi.
  - `split` — CSV satırlarını virgül dışındaki tırnakları koruyarak ayıran yardımcı fonksiyon.
  - `headerRaw` — başlık satırının temizlenmiş, küçük harfe dönüştürülmüş hücreleri.
  - `skuIdx` — `sku` başlığının indeks konumu.
  - `qtyIdx` — `qty`/`quantity`/`stock`/`new_stock` başlıklarından birinin indeks konumu.
  - `parsedRows` — geçerli satırların `{ line, sku, newQty }` nesneleri dizisi.
  - `errors` — satır bazlı hata nesneleri `{ line, sku, message }` dizisi.
  - `cells` — mevcut satırın `split` ile ayrılmış hücreleri.
  - `sku` — `skuIdx` konumundaki hücre değeri, boşluklar temizlenmiş.
  - `qtyStr` — `qtyIdx` konumundaki hücre değeri, boşluklar temizlenmiş.
  - `newQty` — `qtyStr` sayısal değere dönüştürülmüş; boş ise `NaN`.
  - `skus` — `parsedRows` içindeki benzersiz `sku` değerlerinin listesi.
  - `products` — Supabase’dan çekilen ürün kayıtları (`id, sku, name, stock_qty`).
  - `skuToProduct` — `sku` → `{ id, name, stock }` haritası.
  - `preview` — `CsvPreviewRow` tipinde önizleme satırları dizisi.
  - `product` — `skuToProduct` haritasından bulunan ürün bilgisi.
  - `th` — `effectiveThreshold(product.id)` çağrısının sonucu.
  - `status` — `row.newQty` ve `th` değerlerine göre `'out' | 'critical' | null`.
- **Dönüş**: yok (yan etkileri: `setCsvPreview`, `toast` bildirimleri, `errors` toplama)

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