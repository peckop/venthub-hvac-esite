---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\ProductsGrid.tsx
skeleton_hash: 9ea1ac36dfdc188b
entity_hashes:
  func:ProductsGrid: 3dd0bc95cb82a18e
  overview: b0875b8b603aa680
  style_tokens: 85ab299eedf71c41
generated_at: 2026-05-27T12:19:14Z
---

## Genel Bakış
`ProductsGrid` bileşeni, ürün listesini farklı görünümler (grid/list) ve sıralama seçenekleriyle sunan bir UI konteyneridir. Gelen veri, yükleme durumu ve kullanıcı etkileşimleri (görünüm değişikliği, sıralama değişikliği) üzerinden render mantığını yönetir.

## Fonksiyon Grupları
### UI Render ve Durum Yönetimi
Bu grup, ürün verisini, yükleme göstergesini ve seçili görünüm modunu alarak uygun şekilde görselleştirir; aynı zamanda `onViewModeChange` ve `onSortChange` geri çağrıları aracılığıyla dışarıya etkileşim sinyalleri gönderir.  
- ProductsGrid   (tek bileşen)

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer products prop'u sağlanmazsa, bileşen görüntülenecek ürün verisine sahip olamaz ve boş bir grid veya beklenmeyen içerik ile karşılaşılır.
[Aksiyom 2]: Eğer viewMode prop'u sağlanmazsa, bileşen geçerli bir görünüm modu belirleyemez ve beklenmeyen bir arayüz durumu ile karşılaşılır.
[Aksiyom 3]: Eğer loading prop'u sağlanmazsa, bileşen yükleme durumu hakkında doğru bilgi alamaz ve yanlış bir yükleme durumu göstergesi durumu ile karşılaşılır.
[Aksiyom 4]: Eğer onViewModeChange prop'u sağlanmazsa, görünüm modu değişiklikleri işlenemez ve kullanıcı grid'in görünüm modunu değiştiremez.
[Aksiyom 5]: Eğer onSortChange prop'u sağlanmazsa, ürün sıralama değişiklikleri işlenemez ve kullanıcı grid'deki ürünleri sıralayamaz.

Domain-specific kurallar: bilinmiyor (verilen imza ve modül bilgileri dışında ek bilgi bulunmamaktadır)

---

## FONKSİYON DETAYLARI

### ProductsGrid
**Ne yapar**: VentHub HVAC platformunda kullanılan, ürün listesini ızgara veya liste görünümünde görüntüleyen yeniden kullanılabilir atomik React bileşenidir. Ürünlerin görsel sunumunu yönetir, görüntüleme modu ve sıralama gibi kullanıcı etkileşimlerini üst bileşenlere iletir, yükleme sürecinde uygun gösterimleri devreye sokar.
**Nasıl yapar**: Props olarak aldığı tüm yapılandırma ve veri parametrelerini kullanarak dinamik arayüz oluşturur. Aktif viewMode değerine göre ürünleri ızgara formatında yan yana veya liste formatında alt alta sıralayarak render eder. Yükleme durumu aktifken içerik yerine yükleme göstergesi, ürün listesi boşken uygun bilgilendirme metni gösterir. Kullanıcının görüntüleme modu veya sıralama kriteri değiştirme işlemlerinde ilgili callback fonksiyonlarını tetikleyerek durum değişikliğini üst bileşenlere iletir.
**Parametreler**:
- products: ProductsGridProps["products"] — Görüntülenecek tüm ürünleri içeren dizi, her dizi elemanı tek bir HVAC ürününün tüm detay verilerini barındırır.
- viewMode: ProductsGridProps["viewMode"] — Mevcut aktif görüntüleme modu, "grid" (ızgara) veya "list" (liste) değerlerinden birini alır, arayüzün ürün sunum formatını belirler.
- loading: ProductsGridProps["loading"] — Ürün verilerinin halen yüklenme sürecinde olup olmadığını belirten boolean bayrak, true değeri aldığında arayüzde ürün içeriği yerine yükleme göstergesi gösterilir.
- onViewModeChange: ProductsGridProps["onViewModeChange"] — Kullanıcı görüntüleme modunu değiştirdiğinde tetiklenen callback fonksiyonu, seçilen yeni modu parametre olarak alarak üst bileşenlere durum değişikliğini iletir.
- onSortChange: ProductsGridProps["onSortChange"] — Kullanıcı sıralama kriterini değiştirdiğinde tetiklenen callback fonksiyonu, seçilen yeni sıralama anahtarını parametre olarak alarak üst bileşenlere sıralama değişikliğini iletir.
**Dönüş**: React.FC<ProductsGridProps> — Tip güvenliği sağlanmış bir React fonksiyonel bileşen örneği döndürür, bu bileşen tüm ürün görünümlerini, görüntüleme ve sıralama kontrollerini kendi içinde barındırarak sayfaya render edilir.

---

## INTERFACES

### ProductsGridProps
- `products: Product[]`
- `viewMode: 'grid' | 'list'`
- `loading?: boolean`
- `onViewModeChange?: (mode: 'grid' | 'list') => void`
- `onSortChange?: (sortBy: string) => void`
- `sortBy?: string`

---

We need to produce AST POINTERS section for the given source file. The file is a React component file: ProductsGrid.tsx. The function signature given: ProductsGrid({ products, viewMode, loading, onViewModeChange, onSortChange, sortBy = 'name' }) -> React.FC<ProductsGridProps>. Actually it's an arrow function component.

We need to list each function. There are two functions: the main component function (arrow function) and the inner map callback: product => ( ... ). The map callback is inside JSX but it's a function.

We need to produce for each function: a heading like ### [N1_NASIL] AST Pointer: {rel_path}::fonksiyon_adı

We need to compute relative path? The source_path given: C:\Users\alize\venthub-hvac\src\components\products\ProductsGrid.tsx. Probably relative path from project root? Not given. We'll just use the file name? Usually they'd want something like src/components/products/ProductsGrid.tsx. We'll assume that's the relative path.

Thus for main function: ### [N1_NASIL] AST Pointer: src/components/products/ProductsGrid.tsx::ProductsGrid

For inner map callback: maybe name it as map callback? Could be something like ProductsGrid::mapCallback or just the arrow function. We'll name it as ProductsGrid::mapProduct (or just the inline function). We'll need to decide.

We need to list params, ic_degiskenler (variables

---

## NODE ID STANDARD

  file: src\components\products\ProductsGrid.tsx
  function: src\components\products\ProductsGrid.tsx::ProductsGrid

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductsGrid

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-50`, `bg-white`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `text-center`, `text-slate-400`, `text-slate-500`, `text-slate-700`, `text-slate-900`, `text-sm`, `text-white`
- **Layout:** `absolute`, `flex`, `flex-col`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `items-center`, `items-start`, `justify-between`, `p-1`, `p-2`, `relative`, `right-3`
- **Responsive:** `sm:`, `xl:` prefix kullanımları