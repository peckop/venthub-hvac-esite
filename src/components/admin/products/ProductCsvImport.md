---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductCsvImport.tsx
skeleton_hash: 2e8e1e1cb29892cd
entity_hashes:
  func:ProductCsvImport: b9e64cb88774e0d3
  overview: 19951cbd59cf400f
  style_tokens: d505eb2f0859ff7f
generated_at: 2026-06-13T21:06:01Z
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
**Ne yapar**: Bu React bileşeni, CSV dosyası kullanarak toplu ürün içe aktarma işlevini sağlar. Kullanıcının bir CSV dosyası seçmesini, ilk 10 satırı önizlemesini, olası hataları kontrol etmesini (dry run) ve nihayetinde veritabanına aktarmasını yöneten bir modal arayüzü sunar.
**Nasıl yapar**: `useState` hook'ları ile `importPreview` (önizleme verisi), `importRows` (tüm satırlar) ve `isProcessing` (işlem durumu) durumlarını yönetir. `useI18n` hook'u ile çoklu dil desteği sağlar. Ana işlevsellik, `handleFileChange` (dosya okuma ve CSV ayrıştırma), `handleDryRun` (eksik sütun kontrolü) ve `handleImport` (veritabanına upsert) adlı üç iç fonksiyon tarafından gerçekleştirilir. `handleImport`, verileri 100 satırlık gruplara (chunk) bölerek `supabase.from('products').upsert` ile toplu olarak işler.
**Parametreler**:
- categories: `Category[]` — Mevcut ürün kategorilerinin listesi. `handleImport` içinde `category_slug` veya `category` alanından `category_id`'ye eşleştirmek için kullanılır.
- onSuccess: `() => void` — Başarılı bir içe aktarma işlemi sonrasında çağrılacak geri çağıurma fonksiyonu. Bu, genellikle üst bileşenin veri listesini yenilemesi tetiklemek için kullanılır.

**Dönüş**: JSX elementi döndürür (`<>...</>`). Bileşen, gizli bir dosya input'u, tetikleyici bir buton ve duruma bağlı olarak modal içeren bir önizleme arayüzü render eder.

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

### [N1_NASIL] AST Pointer: ProductCsvImport.tsx::ProductCsvImport
- **params**: `{ categories, onSuccess }` — categories: kategori listesi (prop), onSuccess: içe aktarma başarılı olduğunda çağrılan callback (prop)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu, UI metinlerini çevirir
  - `importPreview` / `setImportPreview` — useState: CSV'nin ilk 10 satırının header+rows+total bilgisini tutan önizleme nesnesi, null ise modal gizli
  - `importRows` / `setImportRows` — useState: CSV'den parse edilmiş tüm satırların Record<string,string> dizisi, içe aktarmada kullanılır
  - `isProcessing` / `setIsProcessing` — useState: içe aktarma sırasında true olan yüklenme bayrağı, butonları devre dışı bırakır
- **Dönüş**: JSX (React elementi) — dosya input butonu ve importPreview varsa modal önizleme UI'ı

### [N2_NASIL] AST Pointer: ProductCsvImport.tsx::handleFileChange
- **params**: `e: React.ChangeEvent<HTMLInputElement>` — dosya input change eventi
- **ic_degiskenler**:
  - `f` — e.target.files?.[0] — seçilen ilk dosya nesnesi, yoksa fonksiyon erken döner
  - `text` — f.text() ile okunan dosya içeriğinin tamamı (string)
  - `lines` — BOM temizliği yapılmış, boş satırları filtrelenmiş CSV satırları dizisi
  - `split` — iç fonksiyon: virgülle ayırırken tırnak içi virgülleri koruyan CSV parser, her hücreden tırnak işaretlerini temizler
  - `header` — ilk satırdan parse edilmiş, lowercase ve trim edilmiş sütun başlıkları dizisi
  - `rows` — kalan satırları header sütunlarıyla eşleştirerek Record<string,string> dizisine dönüştüren parsed satırlar
- **Dönüş**: yok (yan etki: setImportRows, setImportPreview, e.target.value = '' çağırır)

### [N3_NASIL] AST Pointer: ProductCsvImport.tsx::handleDryRun
- **params**: yok
- **ic_degiskenler**:
  - `h` — importPreview?.header || [] — mevcut CSV sütun başlıkları dizisi
  - `required` — ['name', 'sku'] — zorunlu sütun isimleri sabit dizisi
  - `hasRequired` — required dizisindeki her elemanın h içinde olup olmadığını kontrol eden boolean
  - `okCount` — importPreview.rows içinden hem 'name' hem 'sku' alanı dolu olan satırların sayısı
- **Dönüş**: yok (yan etki: alert ile kuru çalıştırma sonucunu gösterir)

### [N4_NASIL] AST Pointer: ProductCsvImport.tsx::handleImport
- **params**: yok
- **ic_degiskenler**:
  - `h` — importPreview.header — CSV sütun başlıkları dizisi, SKU ve name zorunluluğunu kontrol eder
  - `mapCategorySlugToId` — iç fonksiyon: kategori slug'ını categories prop'u içinden bularak category_id döner
  - `payloads` — Database['public']['Tables']['products']['Insert'][] tipinde ürün ekleme nesneleri dizisi, toplu upsert için biriktirilir
  - `r` — for döngüsü içindeki mevcut import satırı (Record<string,string>)
  - `p` — her satır için oluşturulan tekil ürün insert nesnesi (sku, name, slug, brand, model_code, status, price, stock_qty, low_stock_threshold, category_id alanlarını doldurur)
  - `ok` — başarılı upsert edilen ürün sayacı
  - `fail` — hatalı upsert edilen ürün sayacı
  - `i` — chunk döngüsü indeksi (100'erli gruplar)
  - `chunk` — payloads.slice(i, i+100) ile elde edilen 100'lük upsert grubu
  - `error` — supabase.from('products').upsert() sonucundaki hata nesnesi (destructured)
- **Dönüş**: yok (yan etki: chunked upsert ile veritabanına yazar, alert gösterir, setImportPreview/setImportRows ile state temizler, onSuccess() callback'ini çağırır)

### [N5_NASIL] AST Pointer: ProductCsvImport.tsx::mapCategorySlugToId
- **params**: `slug: string` — eşleştirilecek kategori slug'ı
- **ic_degiskenler**:
  - `s` — slug değerinin lowercase + trim edilmiş hali, karşılaştırma için normalize edilir
  - `found` — categories prop'u içinde name.toLowerCase() === s eşleşmesiyle bulunan kategori nesnesi, eşleşme yoksa undefined
- **Dönüş**: `found?.id || null` — bulunan kategorinin ID'si veya eşleşme yoksa null

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