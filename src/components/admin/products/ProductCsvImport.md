---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\products\ProductCsvImport.tsx
skeleton_hash: 4e2039532fb8599b
entity_hashes:
  func:ProductCsvImport: ae0c43fb671597a8
  overview: 70f9ce33028319ac
  style_tokens: 99a3ede3461c54b7
generated_at: 2026-08-15T15:08:02Z
---

## Genel Bakış
Bu modül, yönetici panelinde ürünlerin toplu olarak CSV dosyasından içe aktarılmasını sağlayan bir React bileşenidir. Kullanıcı arayüzünden dosya seçimine, veri işleme ve doğrulamadan sunucuya göndermeye kadar tüm süreci tek bir bileşen içinde entegre eder. Kategorileri prop olarak alır ve başarılı import işlemi sonrası üst bileşeni bilgilendirir.

## Fonksiyon Grupları
### Kullanıcı Arayüzü ve Etkileşim
Yöneticiye CSV dosyası seçimi, yükleme işlemi başlatma ve sürecin durumuyla (hata, başarı, bekleme) ilgili geri bildirim alma olanağı sağlar.
- ProductCsvImport

### Dosya İşleme ve Dönüştürme
Seçilen CSV dosyasını asenkron olarak okur, satırlara böler ve her bir ham satır satırını uygulamanın anlayacağı yapılandırılmış bir ürün nesnesine dönüştürür.
- ProductCsvImport

### Veri Doğrulama ve Hazırlık
Dönüştürülmüş verileri zorunlu alan eksikliği, format hataları gibi kurallara göre denetler. Geçersiz satırları ayırarak geçerli kayıtları toplu bir API isteği için hazırlar.
- ProductCsvImport

### Sunucu İletişimi ve Geri Bildirim
Hazırlanan geçerli ürün verilerini sunucudaki ilgili API endpoint'ine toplu POST isteği olarak gönderir. İşlemin sonucuna göre bileşen içi bir durum mesajı üretir ve başarılı ise tanımlanmış `onSuccess` callback fonksiyonunu çağırarak üst bileşeni bilgilendirir.
- ProductCsvImport

## AXIOMS – Mimari Varsayımlar
Bu bileşenin doğru çalışması için aşağıdaki prop'ların varlığı ve türü kritik öneme sahiptir.

**[Aksiyom 1]:** `categories` prop'u, bileşene bir dizi olarak geçmelidir. Bu dizi, kullanıcının ürün için kategori seçebileceği seçenekleri belirler. Bu prop geçilmezse, kategori seçici alanı boş kalır.

**[Aksiyom 2]:** Başarılı bir CSV import işlemi sonrasında çağrılacak `onSuccess` fonksiyonu (prop) tanımlı olmalıdır. Aksi takdirde, üst bileşen işlem sonucundan haberdar olamaz ve ilgili güncelleme/yenileme işlemleri tetiklenemez.

**[Aksiyom 3]:** Bileşen, CSV dosyasının beklenen sütun sırasına ve formatına (örneğin tarih formatı) uygun olduğunu varsayar. Bu uyumsuzluk, doğrulama hatalarıyla kullanıcıya bildirilir ancak beklenmedik yapısal bir dosya bileşenin kendi iç mantığını bozabilir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesi verilmediğinden, aksiyom üretmek için gerekli bilgi mevcut değildir. Dolayısıyla, modülün doğru çalışması için zorunlu koşullar bu aşamada belirlenememektedir.

---

## FONKSİYON DETAYLARI

### ProductCsvImport

**Ne yapar**: CSV dosyasından toplu ürün içe aktarma işlemi yapan bir React bileşenidir. Kullanıcının CSV dosyasını seçmesine, içeriğin önizlemesini看到masına, kuru çalıştırma (dry run) yapmasına ve veritabanına toplu olarak yazmasına olanak tanır.

**Nasıl yapar**: Bileşen, dosya seçiminden itibaren üç aşamalı bir iş akışı yönetir. İlk olarak dosya okunup CSV satırları `split` adlı yerel fonksiyonla virgülle ayrılır (tırnak içi virgül ayrımını destekler) ve satırlar `importRows` ile `importPreview` state'lerine kaydedilir. Önizleme paneli açıldığında, `handleDryRun` fonksiyonu `name` ve `sku` zorunlu alanların varlığını kontrol eder ve sonuçları inline banner aracılığıyla bildirir. `handleImport` fonksiyonu ise her satırı `Database['public']['Tables']['products']['Insert']` tipinde bir payload nesnesine dönüştürür — `category_slug` veya `category` alanını `mapCategorySlugToId` iç fonksiyonuyla kategori ID'sine eşler, `model_code` ile `model` alternatif alanlarını birleştirir ve `slug` alanını `name`'den otomatik üretir. Hazırlanan payload'lar 100'erlik bloklar halinde `supabase.from('products').upsert(chunk, { onConflict: 'sku' })` çağrısıyla toplu olarak yazılır; bu sayede SKU çakışması varsa mevcut kayıt güncellenir. Bildirimler `alert()` yerine `role="status"` ve `aria-live="polite"` destekli inline banner ile sunulur, hata tonlu bildirimler kullanıcı kapatana kadar ekranda kalır (WCAG 2.2.3 ve WAI-ARIA APG uyarılarına uygundur). `useI18n()` hook'u ile çeviri anahtarları kullanılır. Dosya input'u `className="hidden"` ile gizlidir, tetikleme nhưngonun `onClick` olayıyla `document.getElementById` aracılığıyla yapılır; dosya seçimi sonrası `e.target.value = ''` sıfırlanarak aynı dosyanın tekrar seçilebilmesi sağlanır.

**Parametreler**:

- `categories`: `Category[]` (veya component prop'unda tanımlı kategori dizisi tipi) — Mevcut kategorilerin listesi. CSV'deki `category_slug` veya `category` alanlarının `category_id`'ye eşlenmesi için kullanılır. Her bir kategori nesnesinin `name` ve `id` alanlarına erişilir.
- `onSuccess`: `() => void` — Başarılı içe aktarma işleminden sonra çağrılan geri çağırmadır. Üst bileşeni içe aktarımın tamamlandığı konusunda bilgilendirmek için kullanılır; bileşen içe aktarma başarılı olduğunda veri yenileme gibi yan etkiler tetiklemek üzere bu callback'i invocation eder.

**Dönüş**: `JSX.Element` — Bileşen, gizli dosya input'u, tetikleme butonu, opsiyonel inline bildirim banner'ı ve (veri yüklendiğinde) modal önizleme panelinden oluşan bir JSX yapısı döndürür. Modal içinde CSV verisinin tablo görünümü, kuru çalıştırma butonu ve içe aktarma butonu yer alır.

---

## İTHALATLAR (IMPORTS)
- import: ../../../types/database.types::type { Database }
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: react::React

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
- **params**: `(categories: Category[], onSuccess: () => void)` — `categories` ürün kategorileri listesidir, `onSuccess` başarıyla tamamlandığında çağrılır.
- **ic_degiskenler**:
    - `t` — i18n çeviri fonksiyonu, useI18n hook'unun dönüşünden alınır.
    - `importPreview` — CSV'nin ilk 10 satırlık önizleme verisi ve meta bilgileri (`header`, `rows`, `total`).
    - `setImportPreview` — `importPreview` durumunu güncelleyen setter.
    - `importRows` — CSV'den ayrıştırılmış tüm satırların object dizisi.
    - `setImportRows` — `importRows` durumunu güncelleyen setter.
    - `isProcessing` — İçe aktarma işleminin devam edip etmediğini belirten boolean bayrak.
    - `setIsProcessing` — `isProcessing` durumunu güncelleyen setter.
    - `notice` — Kullanıcıya gösterilen hata veya bilgilendirme mesajı (ton ve metin).
    - `setNotice` — `notice` durumunu güncelleyen setter.
- **Dönüş**: JSX elementi — CSV içe aktarma arayüzü.

### [N2_NASIL] AST Pointer: ProductCsvImport.tsx::handleFileChange
- **params**: `(e: React.ChangeEvent<HTMLInputElement>)` — Dosya input change olayı.
- **ic_degiskenler**:
    - `f` — Seçilen ilk dosya nesnesi (`e.target.files[0]`).
    - `text` — Dosyanın tam metin içeriği.
    - `lines` — BOM karakteri temizlenmiş ve boş satırları filtrelenmiş satır dizisi.
    - `split` — CSV satırını virgülle bölen ve tırnak işaretlerini işleyen yardımcı fonksiyon.
    - `header` — İlk satırdan türetilen, küçük harf ve boşluk temizlenmiş sütun adları dizisi.
    - `rows` — Her satırı `{sütun_adı: değer}` object'ine dönüştürülmüş satır nesneleri dizisi.
- **Dönüş**: yok — Dosya seçimini işler, `importRows` ve `importPreview` durumlarını günceller.

### [N3_NASIL] AST Pointer: ProductCsvImport.tsx::handleDryRun
- **params**: yok
- **ic_degiskenler**:
    - `h` — `importPreview` nesnesinden alınan sütun başlıkları dizisi (yoksa boş dizi).
    - `required` — Zorunlu sütun adları dizisi (`['name', 'sku']`).
    - `hasRequired` — Zorunlu sütunların hepsinin başlıkta bulunup bulunmadığını gösteren boolean.
    - `okCount` — Önizleme satırlarında hem 'name' hem 'sku' değerine sahip satır sayısı.
    - `statusKey` — Duruma göre çeviri anahtarı.
- **Dönüş**: yok — `notice` durumunu günceller, doğrulama sonuçlarını gösterir.

### [N4_NASIL] AST Pointer: ProductCsvImport.tsx::handleImport
- **params**: yok
- **ic_degiskenler**:
    - `h` — `importPreview` nesnesinden alınan sütun başlıkları.
    - `mapCategorySlugToId` — Kategori slug'ını (veya adını) id'ye dönüştüren yardımcı fonksiyon.
    - `payloads` — Veritabanına eklenecek ürün verilerinin (type: `Database['public']['Tables']['products']['Insert'][]`) dizisi.
    - `r` — Döngüdeki mevcut satır object'i.
    - `p` — Döngü içinde oluşturulup `payloads` dizisine push edilen ürün nesnesi.
    - `ok` — Başarılı içe aktarma sayacı.
    - `fail` — Başarısız içe aktarma sayacı.
    - `chunk` — `payloads` dizisinin 100'er elemanlık dilimi.
    - `error` — Supabase upsert işleminde oluşabilecek hata.
- **Dönüş**: yok — Veritabanına toplu içe aktarma yapar, `notice` durumunu günceller, `onSuccess` callback'ini çağırır.

### [N5_NASIL] AST Pointer: ProductCsvImport.tsx::mapCategorySlugToId
- **params**: `(slug: string)` — Eşleştirilecek kategori slug'ı veya adı.
- **ic_degiskenler**:
    - `s` — Slug'ın küçük harf, boşluk temizlenmiş hali.
    - `found` — `categories` dizisinde `c.name.toLowerCase() === s` koşulunu sağlayan ilk kategori nesnesi.
- **Dönüş**: `string | null` — Bulunan kategorinin `id` değeri veya eşleşme yoksa `null`.

### [N6_NASIL] AST Pointer: ProductCsvImport.tsx::l =>
- **params**: `(l: string)` — CSV satırı.
- **ic_degiskenler**:
    - `cells` — Satırın virgülle bölünmüş ve tırnak temizlenmiş hücresi dizisi.
    - `obj` — Sütun başlıklarına göre doldurulacak boş nesne.
- **Dönüş**: `Record<string, string>` — Hücre değerlerini başlıklara eşleyen nesne.

### [N7_NASIL] AST Pointer: ProductCsvImport.tsx::() => // handleDryRun inner
- **params**: yok
- **ic_degiskenler**:
    - `r` — `importPreview.rows` içindeki her bir satır object'i.
- **Dönüş**: `boolean` — `r['name']` ve `r['sku']` değerlerinin ikisinin de truthy olup olmadığı.

### [N8_NASIL] AST Pointer: ProductCsvImport.tsx::(r, idx) => // Table row render
- **params**: `(r: Record<string, string>, idx: number)` — Tablodaki satır ve indeksi.
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (`<tr>`) — Tablo satırı.

### [N9_NASIL] AST Pointer: ProductCsvImport.tsx::(slug: string) => // mapCategorySlugToId definition
- **params**: `(slug: string)` — Eşleştirilecek kategori slug'ı veya adı.
- **ic_degiskenler**:
    - `s` — Slug'ın küçük harf, boşluk temizlenmiş hali.
    - `found` — `categories` dizisinde `c.name.toLowerCase() === s` koşulunu sağlayan ilk kategori nesnesi.
- **Dönüş**: `string | null` — Bulunan kategorinin `id` değeri veya eşleşme yoksa `null`.

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
- **Renkler:** `bg-cyan-400/10`, `bg-gray-50`, `bg-rose-500/10`, `bg-slate-50`, `bg-slate-900/50`, `border-b`, `border-cyan-400/30`, `border-gray-200`, `border-rose-500/30`, `border-slate-200`, `border-t`, `hover:bg-gray-50/50`, `hover:text-current`, `hover:text-slate-600`, `text-center`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-col`, `gap-3`, `h-10`, `hidden`, `items-center`, `items-start`, `justify-between`, `justify-center`, `justify-end`, `max-h-90vh`, `max-w-4xl`, `overflow-x-auto`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminButtonPrimaryClass`, `${adminButtonSecondaryClass`, `${adminCardClass`, `:`, `===`, `animate-in`, `border`, `divide-gray-100`, `divide-y`, `duration-200`, `error`, `fade-in`, `focus-visible:outline-none`, `focus-visible:ring-2`