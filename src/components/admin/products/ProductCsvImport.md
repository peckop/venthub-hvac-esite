---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductCsvImport.tsx
skeleton_hash: 0f28bb5e343c738d
generated_at: 2026-05-23T21:55:33Z
---

## Genel Bakış
`ProductCsvImport` bileşeni, yöneticilerin ürün verilerini CSV dosyasıyla toplu olarak sisteme eklemelerini sağlayan bir arayüzür. Dosya seçimi, içeriğin okunması, verinin dönüştürülmesi, doğrulanması ve başarılı import sonucu `onSuccess` callback'ini tetiklemeyi yönetir.

## Fonksiyon Grupları
### Kullanıcı Arayüzü ve Etkileşim
Kullanıcıyla dosya seçimi, yükleme butonu ve geri bildirim gösterimi gibi etkileşimleri yönetir.
- ProductCsvImport

### CSV Okuma ve Dönüştürme
Seçilen dosyanın içeriğini okur, satırlara ayırır ve ham veriyi ürün nesnelerine dönüştürür.
- ProductCsvImport

### Veri Doğrulama ve Hazırlık
Dönüştürülen ürün kayıtlarını beklenen şema ile karşılaştırır, hatalı satırları tespit eder ve geçerli kayıtları API gönderimine hazırlar.
- ProductCsvImport

### API İletişimi ve Sonuç İşleme
Geçerli ürün listesini backend'e gönderir, yanıtı izler ve başarılı import olduğunda `onSuccess` callback'ini tetikler; hata durumunda kullanıcıya mesaj gösterir.
- ProductCsvImport

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için bazı prop varsayımları gereklidir.

[Aksiyom 1]: Eğer `categories` prop'u tanımlanmazsa, komponent render ederken kategori seçimi boş kalır ve kullanıcı ürün kategorisi seçemez.  
[Aksiyom 2]: Eğer `categories` prop'u bir dizi değilse, içindeki `map` veya filtreleme işlemleri sırasında çalışma zamanı hatası oluşur.  
[Aksiyom 3]: Eğer `onSuccess` prop'u tanımlanmazsa, başarılı CSV import sonrası dışarıya bildirim gönderilmez ve çağrılan fonksiyon yok sayılır.  
[Aksiyom 4]: Eğer `onSuccess` prop'u bir fonksiyon değilse, import tamamlandığında bu değeri çağırılmaya çalışıldığında `onSuccess is not a function` türünde bir hata oluşur.

---

## FONKSIYON DETAYLARI

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
- **params**: categories, onSuccess
- **ic_degiskenler**:
  - `t` — çeviri fonksiyonu, useI18n'den elde edilen t nesnesi
  - `importPreview` — CSV önizleme verilerini tutan state (header, örnek satırlar, toplam satır sayısı) veya null
  - `setImportPreview` — importPreview state'ini güncelleyen setter fonksiyonu
  - `importRows` — tüm CSV satırlarını tutan state (Record<string, string>[] veya null)
  - `setImportRows` — importRows state'ini güncelleyen setter fonksiyonu
  - `isProcessing` — işlem devam ediyorsa true, aksi halde false
  - `setIsProcessing` — isProcessing state'ini güncelleyen setter fonksiyonu
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::handleFileChange
- **params**: e (React.ChangeEvent<HTMLInputElement>)
- **ic_degiskenler**:
  - `f` — seçilen dosya nesnesi (File | undefined)
  - `text` — dosyanın tamamı olarak okunan metin dizisi
  - `lines` — BOM kaldırılmış, boş satırlar filtrelenmiş satır dizisi
  - `split` — CSV satırını tırnak içi virgülleri rispettă ayıran yardımcı fonksiyon
  - `header` — ilk satırdan elde edilen küçük harfli başlık listesi
  - `rows` — tüm satırlardan oluşturulan obje dizisi (her satır bir Record<string, string>)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::(l => { ... })
- **params**: l (string)
- **ic_degiskenler**:
  - `cells` — split fonksiyonu ile ayrılmış hücre dizisi
  - `obj` — her satır için oluşturulan Record<string, string> nesnesi
- **Dönüş**: Record<string, string>

### [N4_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::handleDryRun
- **params**: (yok)
- **ic_degiskenler**:
  - `h` — importPreview.header veya boş dizi
  - `required` — zorunlu kolonlar ['name', 'sku']
  - `hasRequired` — h dizisinde name ve sku beiderinin olup olmadığını gösteren boolean
  - `okCount` — name ve sku beidei dolu olan satır sayısı
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::handleImport
- **params**: (yok)
- **ic_degiskenler**:
  - `h` — importPreview.header (başlık listesi)
  - `mapCategorySlugToId` — kategori slug'ını kategori id'sine çeviren iç fonksiyon
  - `payloads` — ürün ekleme işlemi için hazırlanan insert objeleri dizisi
  - `r` — importRows dizisindeki mevcut satır (Record<string, string>)
  - `p` — tek bir ürün için hazırlanan insert objesi
  - `ok` — başarılı upsert edilen kayıt sayısı
  - `fail` — başarısız upsert edilen kayıt sayısı
  - `chunk` — payloads dizisinin 100'luk parçası
  - `error` — supabase upsert işlemindeki hata nesnesi
  - `e` — catch bloğunda yakalanan genel hata
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::mapCategorySlugToId
- **params**: slug (string)
- **ic_degiskenler**:
  - `s` — slug'un küçük harfe çevrilmiş ve trimlenmiş hali
  - `found` — categories dizisinde name.lowercase === s olan kategori nesnesi (veya undefined)
- **Dönüş**: string | null

### [N7_NASIL] AST Pointer: src/components/admin/products/ProductCsvImport.tsx::((r, idx) => { ... })
- **params**: r (Record<string, string>), idx (number)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element

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
- **shadow:** (yok)
- **height:** `max-h-[90vh]`
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** (yok)

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-50`, `bg-slate-50`, `bg-slate-900/50`, `border-b`, `border-gray-200`, `border-slate-200`, `border-t`, `text-center`, `text-left`, `text-slate-400`, `text-slate-500`, `text-slate-800`, `text-xs`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-col`, `gap-3`, `h-10`, `hidden`, `items-center`, `justify-between`, `justify-center`, `justify-end`, `max-w-4xl`, `overflow-x-auto`, `overflow-y-auto`, `p-2`
- **Responsive:** (yok)
