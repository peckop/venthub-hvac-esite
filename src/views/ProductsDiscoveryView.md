---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx
skeleton_hash: a62e2580bbc279b4
entity_hashes:
  func:ProductsDiscoveryView: 6785edea688433d2
  overview: 7231c6a1b74d8b9e
  style_tokens: 8ab4f603b12ea696
generated_at: 2026-06-11T16:17:49Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunun ana ürün keşif sayfasını oluşturan React görünüm bileşenidir. Temel sorumluluğu, dışarıdan gelen ürün listesini ve yükleme durumunu yöneterek kullanıcıya dinamik bir arayüz sunmaktır. Bileşen, verinin hazır olma durumuna göre yükleme göstergesi, boş durum mesajı veya ürün listesi gibi farklı arayüzleri render eder.

## Fonksiyon Grupları
### Ana Ürün Keşif Arayüzü
Modülün tek ve temel bileşenini oluşturur. Dışarıdan iletilen `products` ve `isLoading` verilerine bağlı olarak, kullanıcıya ürünleri CategoryOrbitCarousel aracılığıyla sunar veya yükleme/boş durum arayüzlerini gösterir.
- ProductsDiscoveryView

---

## AXIOMS – Mimari Varsayımlar

Bu modül, dışarıdan verilen ürün listesi ve yükleme durumuna bağlı olarak bir keşif arayüzü render eden bir React görünüm bileşenidir.

**[Aksiyom 1]:** Eğer `CategoryOrbitCarousel` bileşeni模ül içine dahil edilmemiş veya tanımlanmamışsa, ProductsDiscoveryView bileşeni render edilemez ve çalışma zamanı hatası oluşur.

**[Aksiyom 2]:** Eğer `products` prop'u sağlanmazsa, bileşen varsayılan olarak boş bir dizi (`[]`) kullanır; bu durumda ürün listesi boş görünür ancak bileşon hata vermez.

**[Aksiyom 3]:** Eğer `isLoading` prop'u sağlanmazsa, bileşen varsayılan olarak `false` değerini kullanır; bu durumda yükleme göstergesi görüntülenmez.

**[Aksiyom 4]:** Eğer `products` boş dizi (`[]`) ve `isLoading` `false` ise, bileşen boş bir durum (muhtemelen "ürün bulunamadı" veya benzeri) gösterir.

---

## FONKSİYON DETAYLARI

### ProductsDiscoveryView
**Ne yapar**: Bu fonksiyon, ürünlerin keşfedilmesi için kullanılan bir React bileşenidir. Kullanıcıya ürün listesini sunar ve veri yüklenme durumunu gösterir.

**Nasıl yapar**: Fonksiyon, gelen products ve isLoading parametrelerini kullanarak bir ürün keşif arayüzü render eder. isLoading true olduğunda yükleme göstergesi sunar, products dizisi dolu olduğunda ise ürünleri listeleyerek kullanıcıya sunar. Bileşen, varsayılan olarak boş bir dizi ve false yükleme durumu ile başlatılabilir.

**Parametreler**:
- products: object[] — Görüntülenecek ürünlerin dizisi. Her bir ürün nesnesi ürün bilgilerini içerir. Varsayılan olarak boş bir dizi kullanılır.
- isLoading: boolean — Verinin yüklenip yüklenmediğini belirten durum bayrağı. true olduğunda yükleme animasyonu gösterilir. Varsayılan olarak false değerini alır.

**Dönüş**: React.FC<ProductsDiscoveryViewProps> — React fonksiyonel bileşeni olarak products dizisini ve isLoading durumunu işleyen bir arayüz bileşeni döndürür.

---

## INTERFACES

### ProductsDiscoveryViewProps
- `initialCategories?: DomainCategory[]`
- `products?: Product[]`
- `isLoading?: boolean`

---

## TYPE ALIASES

### ViewMode
```typescript
type ViewMode = 'grid' | 'list'
```

---

## SABİTLER
- **CategoryOrbitCarousel** (call) — `dynamic(
    () => import('../components/products/CategoryOrbitCarousel'),
...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ProductsDiscoveryView.tsx::LoadingPlaceholder
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — nebula glow animasyonlu yükleme placeholder div'i (w-full h-hvac-section, cyan blur pulse animasyonu)

---

## NODE ID STANDARD

  file: src\views\ProductsDiscoveryView.tsx
  function: src\views\ProductsDiscoveryView.tsx::ProductsDiscoveryView

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductsDiscoveryView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-section`, `rounded-hvac-2xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500/5`, `bg-slate-50`, `bg-slate-50/50`, `bg-surface-darker`, `bg-white`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-white/5`, `hover:text-slate-600`, `md:text-4xl`, `text-3xl`, `text-center`
- **Layout:** `flex`, `flex-col`, `flex-wrap`, `gap-3`, `gap-6`, `grid`, `grid-cols-1`, `h-16`, `h-300px`, `h-8`, `items-center`, `items-start`, `justify-between`, `justify-center`, `lg:grid-cols-3`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `$`, `${isLoading`, `${viewMode`, `:`, `===`, `animate-pulse`, `blur-100`, `border`, `capitalize`, `content-auto`, `duration-300`, `duration-700`, `ease-hvac-ease`, `font-bold`, `font-extrabold`