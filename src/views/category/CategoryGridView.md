---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\category\CategoryGridView.tsx
skeleton_hash: f777c407c48b29e3
entity_hashes:
  func:CategoryGridView: 7b1f2c5723260534
  overview: 24b0f5382275b1f2
  style_tokens: 9b61cf001b5ee023
generated_at: 2026-05-28T22:39:38Z
---

## Genel Bakış
Bu modül, bir kategori ve onun alt kategorilerini, markalarını ve ilgili özellikleri görsel bir ızgara düzeninde gösteren bir React bileşenidir. Kullanıcıya kategori içeriğini düzenli bir şekilde sunarak, filtreleme ve gezinti işlemlerini destekler.

## Fonksiyon Grupları
### Ana Bileşen
Kategori ızgara görünümünü oluşturan ve dışarıdan gelen verileri (kategori, üst kategori, alt kategoriler, markalar ve pro bilgisi) kullanarak arayüzü render eden fonksiyondur.
- CategoryGridView

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `category` prop’u sağlanmazsa, kategori başlığı ve temel kategori bilgileri gösterilemez; bileşen render aşamasında eksik veri hatası oluşur.  

**Aksiyom 2**: Eğer `parentCategory` prop’u sağlanmazsa, üst‑kategori navigasyonu (breadcrumb) eksik olur ve kullanıcı mevcut kategori hiyerarşisini tam olarak göremez.  

**Aksiyom 3**: Eğer `subCategories` prop’u sağlanmazsa, alt‑kategori ızgarası boş kalır; alt‑kategori listesi gösterilemez ve ilgili UI bölümü render edilmez.  

**Aksiyom 4**: Eğer `availableBrands` prop’u sağlanmazsa, marka filtreleme/kullanılabilir marka listesi oluşturulamaz; marka seçimi UI öğesi devre dışı bırakılır veya hatalı davranış sergiler.  

**Aksiyom 5**: Eğer `pro` prop’u sağlanmazsa, “pro” (premium) özellikleri devre dışı kalır; bu özelliklere bağlı UI öğeleri (ör. özel stil, ek aksiyon butonları) gösterilmez.  

**Aksiyom 6**: Eğer herhangi bir prop beklenen tipte (ör. `category` nesnesi, `subCategories` dizi, `availableBrands` dizi, `pro` boolean) gelmezse, tip uyuşmazlığı nedeniyle çalışma zamanı hatası oluşur ve bileşen render edilmez.  

**Aksiyom 7**: Eğer `CategoryGridView` bileşeni içinde kullanılan alt bileşenler (ör. `CategoryCard`, `BrandFilter`) gerekli bağımlılıkları (CSS, ikon setleri vb.) yüklemezse, UI bozulur veya stil kaybı yaşanır.  

**Aksiyom 8**: Eğer `CategoryGridView`’un bulunduğu ortam (ör. Next.js/React uygulaması) gerekli React sürümünü (≥ 16.8) desteklemezse, hook‑lar (useState, useEffect vb.) çalışmaz ve bileşen hata verir.  

**Aksiyom 9**: Eğer `CategoryGridView`’un dışarıdan aldığı veri (ör. API yanıtı) gecikmeli veya hatalı dönerse, bileşen yükleme/boş durum göstergesi (loading spinner) gösterilmez; bu durumda UI boş kalır veya hatalı veri gösterilir.  

**Aksiyom 10**: Eğer `CategoryGridView`’un stil dosyaları (CSS/SCSS) bulunmazsa, bileşenin görsel düzeni bozulur; layout ve grid hizalamaları beklenen şekilde çalışmaz.

---

## FONKSİYON DETAYLARI

### CategoryGridView
**Ne yapar**: Bu React Fonksiyonel Bileşeni, VentHub HVAC platformundaki kategori sayfaları için grid tabanlı arayüz sunar. Almış olduğu kategori, alt kategori, marka ve pro abonelik verilerini kullanarak kullanıcıların kategorileri gezmesi, filtrelemesi ve ilgili ürünlere erişmesi için gerekli UI öğelerini oluşturur. Kullanıcı deneyimini iyileştirmek için dinamik içerik gösterimi ve filtreleme seçenekleri sunar.
**Nasıl yapar**: Bileşen, dışarıdan iletilen tüm propsları alır ve bu verileri kullanarak grid yapısını dinamik olarak oluşturur. Öncelikle ana kategori bilgilerini başlık olarak gösterir, ardından alt kategorileri kartlar halinde sıralar, mevcut markaları filtre seçenekleri olarak ekler ve pro kullanıcıları için özel içeriklerin erişilebilirliğini kontrol eder. Tüm veri akışını props üzerinden sağlayarak bağımsız, test edilebilir ve yeniden kullanılabilir bir yapı sunar.
**Parametreler**:
- category: Category — Mevcut aktif kategori ile ilgili tüm meta verileri içeren nesne, kategori kimliği, adı, tanımı ve görsel bilgileri gibi temel verileri barındırır.
- parentCategory: Category | undefined — Mevcut kategorinin üst kategorisi ile ilgili bilgileri içeren opsiyonel nesne, eğer mevcut kategori ana seviye bir kategori ise bu değer tanımlanmayabilir.
- subCategories: Category[] — Mevcut kategorinin altındaki tüm alt kategorileri içeren dizi, grid görünümünde her bir alt kategori için ayrı kart öğeleri oluşturmak için kullanılır.
- availableBrands: Brand[] — Mevcut kategori ile ilişkili tüm markaları içeren dizi, kullanıcıların marka bazında filtreleme yapması için seçenekler sunar.
- pro: boolean — Mevcut kullanıcının pro abonelik durumunu belirten mantıksal değer, pro özel indirimler veya içeriklerin gösterilip gösterilmeyeceğine karar vermek için kullanılır.
**Dönüş**: React.FC<CategoryGridViewProps> türünde bir React bileşeni döndürür. Bu döndürülen bileşen, alınan tüm propsları kullanarak render edilmiş grid arayüzünü sunar ve kategori gezintisi, alt kategori listeleme, marka filtreleme ve pro içerik erişimi gibi temel işlevleri barındırır.

---

## INTERFACES

### CategoryGridViewProps
- `category: DomainCategory`
- `parentCategory?: DomainCategory | null`
- `subCategories: DomainCategory[]`
- `availableBrands: string[]`
- `products: Product[]`
- `filters: CategoryFilters`
- `onUpdateFilters: (updates: Partial<CategoryFilters>) => void`
- `loading?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\category\CategoryGridView.tsx::CategoryGridView
- **params**: (category, parentCategory, subCategories, availableBrands, products, filters, onUpdateFilters, loading)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook’inden dönen çeviri fonksiyonu; UI metinlerini yerelleştirmek için kullanılır.
- **Dönüş**: React element (JSX) döner; fonksiyon bir React functional component olarak tanımlanmıştır.

---

## NODE ID STANDARD

  file: src\views\category\CategoryGridView.tsx
  function: src\views\category\CategoryGridView.tsx::CategoryGridView

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryGridView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-white`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `hover:text-slate-600`, `text-center`, `text-slate-400`, `text-slate-500`, `text-slate-700`, `text-slate-900`, `text-sm`, `text-white`
- **Layout:** `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `gap-12`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `items-center`, `items-start`, `justify-between`, `lg:flex-row`, `lg:w-80`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `lg:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `${filters.viewMode`, `:`, `===`, `border`, `focus-visible:ring-primary-ocean/20`, `font-bold`, `font-medium`, `list`, `mb-10`, `pb-6`, `pl-4`, `pr-10`, `py-2.5`, `py-32`, `rounded-lg`