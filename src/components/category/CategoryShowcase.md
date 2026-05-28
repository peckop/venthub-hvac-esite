---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\CategoryShowcase.tsx
skeleton_hash: bba0312a82b87d24
entity_hashes:
  func:CategoryShowcase: 27f451ff64c2aa4f
  overview: 7308f814cbfe1bd6
  style_tokens: 74c7a2fe586c3948
generated_at: 2026-05-28T22:35:43Z
---

## Genel Bakış
`CategoryShowcase` modülü, bir kategori ve ona bağlı alt‑kategorileri görsel bir vitrin içinde sunan bir React bileşenidir. Gelen `category`, `subCategories` ve `parentCategory` prop’larını alır, bunları UI öğelerine dönüştürerek kategori kartı, alt‑kategori listesi ve gerektiğinde üst‑kategori navigasyonu oluşturur.

## Fonksiyon Grupları
### Ana Bileşen – UI Oluşturma
Bu grup, dışarıdan sağlanan veri prop’larını alıp kullanıcı arayüzüne yansıtan temel sorumluluğu taşır. Bileşen, prop’ları ayrıştırır, kategori başlığı, görseli ve açıklamasını gösterir, alt‑kategorileri haritalayarak kart veya bağlantı listesi üretir ve varsa üst‑kategoriye yönlendiren bir geri‑bağlantı ekler.  
- CategoryShowcase

*Fonksiyon İlişkileri:* `CategoryShowcase` tek başına çalışır; aynı modül içinde başka bir fonksiyonu çağırmaz.

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için gerekli props sağlanmalıdır.

[Aksiyom 1]: Eğer `category` prop'u yoksa, bileşen kategori bilgilerini render edemez ve hata veya boş görüntü oluşabilir.  
[Aksiyom 2]: Eğer `subCategories` prop'u yoksa, alt kategori listesi gösterilemez veya boş liste görünebilir.  
[Aksiyom 3]: Eğer `parentCategory` prop'u yoksa, bileşen üst kategori bağlamını kullanamayacak ve ilgili UI öğeleri (örn. geri navigasyon, başlık) eksik görünebilir.

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

### [N1_NASIL] AST Pointer: src/components/category/CategoryShowcase.tsx::(sub) => { ... }
- **params**: sub
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (Link component that renders a subcategory card with image, title, description and an arrow icon)

### [N2_NASIL] AST Pointer: src/components/category/CategoryShowcase.tsx::(feature, i) => { ... }
- **params**: feature, i
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (div component that displays a feature with an icon, title and description)

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