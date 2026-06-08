---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\_components\ProductDetailPageView.tsx
skeleton_hash: b7613a8983970228
entity_hashes:
  func:ProductDetailPage: e3b845e07eaace73
  overview: faf4f4f8b5575270
  style_tokens: 97bcb7e77cb5d07f
generated_at: 2026-06-08T10:08:11Z
---

## Genel Bakış
`ProductDetailPageView.tsx`, bir HVAC ürününün detay sayfasını oluşturan merkezi React bileşenini içerir. Başlangıçta üst bileşen veya sunucu tarafından sağlanan `initialProduct` verisini kullanarak, ürün bilgileri (isim, fiyat, özellikler) ve görseller dahil olmak üzere eksiksiz bir inceleme sayfası render eder. Bileşen, veriye tamamen bağımlıdır; geçerli bir nesne sağlanmadığında hata fırlatabilir veya eksik/boş bir sayfa oluşturabilir.

## Fonksiyon Grupları
### Ürün Detayı Sayfası Bileşeni
Sayfanın tamamını yöneten ana ve tek bileşendir. Aldığı ürün verisini başlık, fiyat, özellik listesi ve görsel galeri gibi bölümlere dönüştürerek kullanıcının etkileşimli bir inceleme deneyimi yaşamasını sağlar.
- ProductDetailPage

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için `initialProduct` parametresinin sağlanması zorunludur.

[Aksiyom 1]: Eğer `initialProduct` parametresi (React prop'u olarak) sağlanmazsa, bileşen hata durumuna geçer, eksik veriyle çalışır veya hiç render edilemez; bu durumda ürün detayı sayfası kullanılamaz hale gelir.
[Aksiyom 2]: Eğer `initialProduct` içinde geçerli bir ürün verisi yapısı (örneğin: başlık, özellikler, görseller vb. alanlar) bulunmazsa, bileşen beklenmeyen davranışlar gösterir veya eksik bileşenlerle render edilir; bu durumda kullanıcıya tutarsız bir arayüz sunulur.

---

## FONKSİYON DETAYLARI

### ProductDetailPage

**Ne yapar**: Ürün detay sayfasını render eden ana React bileşenidir. Verilen ilk ürün verisini (initialProduct) kullanarak, bir HVAC ürününün detaylı görünümünü kullanıcıya sunar.

**Nasıl yapar**: Bileşen, sunucu tarafında veya üst bileşen tarafından sağlanan `initialProduct` prop'unu alır ve bu veriyi kullanarak ürün detay sayfasının tamamını render eder. Bu yapı, Next.js gibi framework'lerde sayfa yükleme performansını artırmak için sıkça kullanılan bir SSR/SSG desenidir.

**Parametreler**:
- `initialProduct` — İlk yüklemede kullanılacak ürün nesnesini temsil eder. Sayfa ilk render edildiğinde bu veri kullanılarak içerik gösterilir, böylece istemci tarafı bekleme süresi azaltılır.

**Dönüş**: `React.FC<ProductDetailPageProps>` tipinde bir React fonksiyonel bileşeni döndürür. Bileşen, `ProductDetailPageProps` arayüzüne uygun olarak yapılandırılmıştır ve `initialProduct` alanını içermelidir.

**İlişkili Tip Tanımı**:
- `ProductDetailPageProps` — Bileşenin kabul ettiği prop'ların tanımlandığı arayüz. En az `initialProduct` alanını içermelidir.

---

## INTERFACES

### ProductDetailPageProps
- `initialProduct?: Product | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ProductDetailPageView.tsx::categoryLookup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `sc` — `categories` dizisinde `product.subcategory_id` ile eşleşen alt kategori nesnesi veya `null`
  - `mc` — `categories` dizisinde `product.category_id` ile eşleşen ana kategori nesnesi veya `null`
- **Dönüş**: `{ mainCategory: Category | null, subCategory: Category | null }`

---

## NODE ID STANDARD

  file: src\app\_components\ProductDetailPageView.tsx
  function: src\app\_components\ProductDetailPageView.tsx::ProductDetailPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductDetailPage
  export: ProductDetailPageProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`, `tracking-hvac-snug`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue/30`, `bg-gold-accent/10`, `bg-industrial-gray`, `bg-primary-navy`, `bg-red-50`, `bg-secondary-blue`, `bg-slate-100`, `bg-slate-50`, `bg-slate-50/30`, `bg-slate-900`, `bg-success-green`, `bg-success-green/10`, `bg-warning-orange`, `bg-warning-orange/10`, `bg-white`
- **Layout:** `absolute`, `backdrop-blur-2`, `backdrop-blur-md`, `backdrop-blur-xl`, `col-span-full`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `flex-wrap`, `gap-1.5`, `gap-2`, `gap-2.5`, `gap-4`
- **Varyant/Responsive:** `:`, `active:`, `disabled:`, `group-hover:`, `hover:`, `last:`, `lg:`, `md:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `${activeSection`, `${isNavSticky`, `${isOpen`, `${isWishlisted`, `${section.bgClass`, `${typeof`, `0`, `:`, `===`, `>`, `active:scale-95`, `active:scale-98`, `animate-in`, `animate-ping`, `animate-pulse`