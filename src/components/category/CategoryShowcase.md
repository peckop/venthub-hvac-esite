---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\CategoryShowcase.tsx
skeleton_hash: 6e859293916635a8
entity_hashes:
  func:CategoryShowcase: 27f451ff64c2aa4f
  overview: aa513280097fa05a
  style_tokens: 74c7a2fe586c3948
generated_at: 2026-06-08T10:08:47Z
---

## Genel Bakış
`CategoryShowcase` modülü, bir kategori ve ona bağlı alt kategorileri görsel bir vitrin içinde sunan bir React bileşenidir. Gelen `category`, `subCategories` ve `parentCategory` prop'larını alarak, kategori kartı, alt kategori listesi ve üst kategori navigasyonu gibi UI bileşenlerini oluşturur.

## Fonksiyon Grupları
### Ana Bileşen – UI Oluşturma
Bu grup, dışarıdan sağlanan veri prop'larını alıp kullanıcı arayüzüne yansıtır. Bileşen, kategori başlığını, açıklamasını ve görselini gösterir; alt kategorileri haritalayarak kart veya bağlantı listesi üretir; varsa üst kategoriye yönlendiren bir geri bağlantı ekler.
- CategoryShowcase

---

## AXIOMS – Mimari Varsayımlar
Bu modül, dışarıdan verilen `category`, `subCategories` ve `parentCategory` prop'larını kullanarak bir kategori vitrini bileşeni oluşturur. Doğru çalışması için bu prop'ların geçerli ve beklenen tiplerde olması gerekir.

[Aksiyom 1]: Eğer `category` prop'u `null` veya `undefined` ise, bileşen ana kategori bilgilerini (başlık, açıklama, görsel) gösteremez veya hatalı render edilir.

[Aksiyom 2]: Eğer `category` prop'u bir nesne (`object`) değilse, bileşen kategori alanlarına (`title`, `description`, `image` vb.) erişemez ve bu alanları okumaya çalışırken hata oluşur.

[Aksiyom 3]: Eğer `subCategories` prop'u `null` veya `undefined` ise, bileşen alt kategori listesini oluşturamaz veya boş bir liste olarak davranır.

[Aksiyom 4]: Eğer `subCategories` prop'u bir dizi (`Array`) değilse, bileşen alt kategorileri haritalayarak kart oluşturma işlemini gerçekleştiremez ve hata oluşur.

[Aksiyom 5]: Eğer `parentCategory` prop'u `null` veya `undefined` ise, bileşen üst kategoriye yönlendiren geri bağlantıyı göstermez.

[Aksiyom 6]: Eğer `parentCategory` prop'u geçerli bir nesne (`object`) içermiyorsa ve bileşen bu nesneden alanlar (`title`, `slug` vb.) okumaya çalışıyorsa, hatalı veya eksik veri ile render olur.

---

## FONKSİYON DETAYLARI

### CategoryShowcase
**Ne yapar**:  
Kategori gösterimini sağlayan bir React bileşeni oluşturur. Bu bileşen, üst kategori bilgisi, alt kategoriler ve ilgili kategori verilerini alarak, kullanıcıya görsel olarak çekici bir kategori galerisini sunar.  

**Nasıl yapar**:  
Fonksiyon, `CategoryShowcaseProps` tipinde bir nesne alır ve bu nesnenin `category`, `subCategories` ve `parentCategory` alanlarını kullanarak JSX döndürür. İçerik, kategori başlığı, açıklama, görsel ve alt kategori bağlantıları gibi öğeleri içerir. Bileşen, stil ve layout için CSS sınıfları veya stil bileşenleri kullanır.  

**Parametreler**:
- category: object — Gösterilecek ana kategori bilgilerini içerir (örneğin, ad, açıklama, görsel URL).
- subCategories: array — Ana kategoriye ait alt kategorilerin listesini tutar; her öğe alt kategori nesnesidir.
- parentCategory: object — Ana kategorinin üst kategorisi hakkında bilgi sağlar (örneğin, ad, link).

**Dönüş**:  
React.FC<CategoryShowcaseProps> tipinde bir fonksiyon bileşeni döndürür. Bu bileşen, JSX ile kategori galerisini render eder.

---

## INTERFACES

### CategoryShowcaseProps
- `category: DomainCategory`
- `subCategories: DomainCategory[]`
- `parentCategory?: DomainCategory | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryShowcase.tsx::subCategoryRenderCallback
- **params**:
  - `sub` — render edilecek alt kategori objesi; `sub.id`, `sub.slug`, `sub.image_url`, `sub.description` özellikleri erişime açıktır
- **ic_degiskenler**:
  (yok — doğrudan JSX döndürür, iç değişken tanımlamaz)
- **Yan etkilerde erişilen dış kaynaklar**:
  - `Routes.category(category.slug, sub.slug)` — alt kategori URL'ini oluşturur
  - `getCategoryDisplayName(sub)` — alt kategorinin gösterilecek adını döndürür
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` — Supabase depolama URL kökünü alır
  - `getCategoryIcon(sub.slug, { size: 64, className: "..." })` — slug'a karşılık gelen ikon bileşenini döndürür
  - `t('category.inspectSeries')` — i18n çeviri anahtarına karşılık gelen metni döndürür
- **Dönüş**: JSX — `Link` ile sarılmış alt kategori kartı (görsel/ikon, başlık, açıklama, "İncele" butonu)

---

## NODE ID STANDARD

  file: src\components\category\CategoryShowcase.tsx
  function: src\components\category\CategoryShowcase.tsx::CategoryShowcase

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryShowcase

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-hero`, `rounded-hvac-2xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-50`, `bg-gradient-to-r`, `bg-gradient-to-t`, `bg-gray-50`, `bg-light-gray`, `bg-orange-50`, `bg-primary-navy`, `bg-primary-navy/10`, `bg-secondary-blue/20`, `bg-slate-50`, `bg-slate-900/50`, `bg-white`, `border-4`, `border-b`, `border-gray-100`
- **Layout:** `absolute`, `backdrop-blur-sm`, `bottom-4`, `bottom-8`, `flex`, `flex-col`, `flex-shrink-0`, `from-black/60`, `from-primary-navy/80`, `from-secondary-blue`, `from-slate-950/80`, `gap-16`, `gap-2`, `gap-6`, `gap-8`
- **Varyant/Responsive:** `focus-visible:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-translate-x-1/2`, `animate-bounce`, `animate-fadeIn`, `aspect-4/3`, `aspect-4/5`, `aspect-video`, `border`, `cursor-pointer`, `duration-300`, `duration-700`, `duration-hvac-glacial`, `focus-ring`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `font-bold`