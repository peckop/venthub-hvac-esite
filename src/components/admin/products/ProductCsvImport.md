---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductCsvImport.tsx
skeleton_hash: 1330c8b076710dd1
entity_hashes:
  func:ProductCsvImport: 1375065d67decd2a
  overview: 19951cbd59cf400f
  style_tokens: d505eb2f0859ff7f
generated_at: 2026-06-08T10:08:37Z
---

## Genel Bakış
`ProductCsvImport` bileşeni, yönetici panelinde ürün verilerinin CSV dosyası aracılığıyla toplu olarak içe aktarılmasını sağlayan kapsamlı bir araçtır. Kullanıcı arayüzü sunmaktan başlayarak dosya okuma, veri dönüştürme, doğrulama ve sunucuya gönderme süreçlerini tek bir bileşen içinde yönetir.

## Fonksiyon Grupları
### Kullanıcı Arayüzü ve Etkileşim
Bileşen, yöneticiye dosya seçimi için bir arayüz sunar, yükleme butonu sağlar ve işlem süreciyle ilgili durum mesajlarını gösterir.
- ProductCsvImport

### CSV Okuma ve Dönüştürme
Seçilen CSV dosyasının içeriğini asenkron olarak okur, satırlara böler ve ham veri satırlarını uygulamanın beklediği ürün nesne yapısına dönüştürür.
- ProductCsvImport

### Veri Doğrulama ve Hazırlık
Dönüştürülmüş ham veri dizisini, beklenen alanlar ve formatlar için denetler. Hatalı satırları ayırır, geçerli kayıtları ise toplu API isteği için uygun hale getirir.
- ProductCsvImport

### API İletişimi ve Sonuç İşleme
Geçerli ürün kayıtlarını bir araya getirerek sunucudaki ilgili API uç noktasına toplu ekleme isteği gönderir. Başarı durumunda üst bileşene geri bildirimde bulunur, hata oluşursa kullanıcıya bilgilendirme mesajı üretir.
- ProductCsvImport

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için bazı prop varsayımları gereklidir.

[Aksiyom 1]: Eğer `categories` prop'u tanımlanmazsa, komponent render ederken kategori seçimi boş kalır ve kullanıcı ürün kategorisi seçemez.  
[Aksiyom 2]: Eğer `categories` prop'u bir dizi değilse, içindeki `map` veya filtreleme işlemleri sırasında çalışma zamanı hatası oluşur.  
[Aksiyom 3]: Eğer `onSuccess` prop'u tanımlanmazsa, başarılı CSV import sonrası dışarıya bildirim gönderilmez ve çağrılan fonksiyon yok sayılır.  
[Aksiyom 4]: Eğer `onSuccess` prop'u bir fonksiyon değilse, import tamamlandığında bu değeri çağırılmaya çalışılırken bir hata fırlatılacaktır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için aksiyomlar, verilen fonksiyon imzası ve eski dokümanın Genel Bakış açıklamasına dayanarak tanımlanmıştır.

[Aksiyom 1]: Eğer `categories` prop'u sağlanmazsa, bileşen CSV'den dönüştürülen ürünler için geçerli kategori seçemeyeceğinden veya kullanıcının kategori ataması yapamayacağından veri hazırlık/hatlama süreci bozulur.
[Aksiyom 2]: Eğer `onSuccess` callback fonksiyonu sağlanmazsa, başarılı CSV içe aktarma işlemi sonrasında bileşen üst bileşene bildirimde bulunamaz veya işlem sonucunu raporlayamaz.
[Aksiyom 3]: Eğer seçilen CSV dosyasının içeriği (satır/sütun yapısı) beklenen formata (örn: belirli sütun başlıkları) uymazsa, veri dönüştürme ve doğrulama aşaması başarısız olur.
[Aksiyom 4]: Eğer CSV dosyası okunamaz (bozuk, erişilemez veya geçersiz bir dosya ise), bileşen kullanıcıya hata geri bildirimi göstermeli ve onSuccess tetiklenmemelidir.
[Aksiyom 5]: Eğer CSV'den dönüştürülen ürün verisi, iş kurallarına (örn: zorunlu alanların doluluğu, veri tipleri, eşik değerleri) uymazsa, veri doğrulama aşaması başarısız olur ve import işlemi durdurulur.

---

## FONKSİYON DETAYLARI

### ProductCsvImport
**Ne yapar**: Product CSV dosyasının içeri aktarımını yöneten bir React bileşenidir.  
**Nasıl yapar**: `categories` prop'undan gelen kategori listesini kullanarak kullanıcıya gerekli eşleştirme seçeneklerini sunar ve işlem tamamlandığında `onSuccess` callback'ini tetikler.  
**Parametreler**:
- categories: any — Ürünlerin eşleştirilebileceği kategori listesi.  
- onSuccess: () => void — CSV içeri aktarma başarılı olduğunda çağrılan geri çağırım fonksiyonu.  
**Dönüş**: void (bir değer döndürmez, sadece UI render eder).

---

## INTERFACES

### CategoryOpt
- `id: string`
- `name: string`

### ProductCsvImportProps
- `categories: CategoryOpt[]`
- `onSuccess: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::ProductCsvImport
- **params**: `{ categories, onSuccess }` — categories: mevcut kategoriler dizisi (prop), onSuccess: başarı callback'i (prop)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu
  - `importPreview` / `setImportPreview` — React state: CSV önizleme verisi `{ header: string[], rows: Record<string,string>[], total: number }` veya null
  - `importRows` / `setImportRows` — React state: CSV'den ayrıştırılmış tüm satırlar `Record<string,string>[]` veya null
  - `isProcessing` / `setIsProcessing` — React state: içe aktarma işlemi devam ediyor mu flag'i
- **Dönüş**: JSX element (React fragment — CSV dosya seçici butonu ve modal önizleme arayüzü)

### [N2_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::handleFileChange
- **params**: `e: React.ChangeEvent<HTMLInputElement>` — dosya input change olayı
- **ic_degiskenler**:
  - `f` — seçilen dosya nesnesi, `e.target.files?.[0]` referansı, undefined ise fonksiyon erken döner
  - `text` — dosyanın tam metin içeriği, `f.text()` asenkron okumasıyla elde edilir
  - `lines` — BOM karakteri (`\ufeff`) kaldırıldıktan ve satır sonlarına göre split edildikten sonra boş satırları filtrelenmiş satır dizisi
  - `split` — yerel CSV ayrıştırma fonksiyonu: virgülle split eder, tırnak işaretlerini ve çift tırnak kaçışlarını işler
  - `header` — ilk satırdan elde edilen sütun başlıkları, küçük harfe dönüştürülmüş ve trim edilmiş `string[]`
  - `rows` — her satırı `{ sütunAdı: hücreDeğeri }` objesine dönüştüren `Record<string,string>[]` dizisi; eksik hücreler boş string ile doldurulur
- **Dönüş**: void (yan etkiler: `setImportRows(rows)`, `setImportPreview({...})`, `e.target.value = ''` ile input reset)

### [N3_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::split
- **params**: `s: string` — split edilecek ham CSV satırı veya başlık satırı
- **ic_degiskenler**: (yok — tek satırlık inline fonksiyon)
- **Dönüş**: `string[]` — tırnak-aware virgül split sonucu, her hücredeki baş/son tırnak işaretleri kaldırılmış, çift tırnak (`""`) tek tırnak (`"`) olarak değiştirilmiş

### [N4_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::handleDryRun
- **params**: (yok)
- **ic_degiskenler**:
  - `h` — importPreview?.header dizisi, yoksa boş dizi; mevcut sütun başlıklarını tutar
  - `required` — zorunlu sütun adları dizisi `['name', 'sku']`
  - `hasRequired` — boolean, tüm zorunlu sütunların header'da bulunup bulunmadığını belirtir
  - `okCount` — importPreview.rows içinden hem 'name' hem 'sku' alanına sahip satır sayısı
- **Dönüş**: void (yan etki: `alert()` ile kuru çalıştırma sonucu gösterir)

### [N5_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::handleImport
- **params**: (yok)
- **ic_degiskenler**:
  - `h` — importPreview.header, CSV sütun başlıkları dizisi
  - `mapCategorySlugToId` — yerel fonksiyon: kategori slug'ını kategori ID'sine eşler
  - `payloads` — `Database['public']['Tables']['products']['Insert'][]` tipinde, veritabanına yazılacak ürün objeleri dizisi
  - `r` — for döngüsündeki her bir CSV satırı `Record<string,string>`
  - `p` — her satır için inşa edilen `products.Insert` tipinde ürün objesi; `sku`, `name`, `slug`, `brand`, opsiyonel olarak `model_code`, `status`, `price`, `stock_qty`, `low_stock_threshold`, `category_id` alanlarını içerir
  - `chunk` — payloads dizisinin 100'er elemanlık alt dizisi (toplu upsert için)
  - `ok` — başarılı upsert sayısı sayacı, başlangıç 0
  - `fail` — başarısız upsert sayısı sayacı, başlangıç 0
  - `i` — chunk döngüsü indeksi, 100'er adım ilerler
- **Dönüş**: void (yan etkiler: `supabase.from('products').upsert(chunk, { onConflict: 'sku' })` ile veritabanına yazar, `alert()` ile sonuç gösterir, `setImportPreview(null)`, `setImportRows(null)`, `onSuccess()`, `setIsProcessing(false)` çağırır)

### [N6_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::mapCategorySlugToId
- **params**: `slug: string` — eşleştirilecek kategori slug'ı (ör: "klima", "ısı pompası")
- **ic_degiskenler**:
  - `s` — normalize edilmiş slug: null-safe, küçük harfe çevrilmiş ve trim edilmiş hali
  - `found` — `categories` prop'u üzerinde `.find()` ile `c.name.toLowerCase() === s` eşleşmesiyle bulunan kategori objesi veya undefined
- **Dönüş**: `string | null` — eşleşen kategorinin `id` değeri veya bulunamazsa `null`

---

## NODE ID STANDARD

  file: src\components\admin\products\ProductCsvImport.tsx
  function: src\components\admin\products\ProductCsvImport.tsx::ProductCsvImport

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductCsvImport

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-50`, `bg-slate-50`, `bg-slate-900/50`, `border-b`, `border-gray-200`, `border-slate-200`, `border-t`, `hover:bg-gray-50/50`, `hover:text-slate-600`, `text-center`, `text-left`, `text-slate-400`, `text-slate-500`, `text-slate-800`, `text-xs`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-col`, `gap-3`, `h-10`, `hidden`, `items-center`, `justify-between`, `justify-center`, `justify-end`, `max-h-90vh`, `max-w-4xl`, `overflow-x-auto`, `overflow-y-auto`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `${adminButtonPrimaryClass`, `${adminButtonSecondaryClass`, `${adminCardClass`, `animate-in`, `divide-gray-100`, `divide-y`, `duration-200`, `fade-in`, `font-semibold`, `inset-0`, `italic`, `rounded-b-2xl`, `transition-colors`, `uppercase`, `whitespace-nowrap`