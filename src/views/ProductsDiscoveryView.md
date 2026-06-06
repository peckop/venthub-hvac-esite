---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx
skeleton_hash: 85896be8bdf21200
entity_hashes:
  func:ProductsDiscoveryView: 6785edea688433d2
  overview: 7c5010aea8b1e551
  style_tokens: 17792abc2680c491
generated_at: 2026-06-06T21:58:50Z
---

## Genel Bakış
Venthub HVAC platformunun ürün keşif sayfasını oluşturan temel React görünüm bileşenidir. Modül, dışarıdan gelen ürün listesi ve yükleme durumu verilerini kullanarak kullanıcılara dinamik bir arayüz sunar. Bu arayüz sayesinde kullanıcılar platformdaki ürünleri görüntüleyebilir ve sistemdeki yükleme durumunu takip edebilir.

## Fonksiyon Grupları
### Ana Ürün Keşif Arayüzü
Modülün tek ve temel sorumluluğu olan ürün keşif arayüzünü oluşturan React bileşenini içerir. Dışarıdan alınan girdilere bağlı olarak yükleme göstergesi veya ürün listesi gibi farklı durumları render eder.
- ProductsDiscoveryView

---

## AXIOMS – Mimari Varsayımlar

Bu modül, dışarıdan iletilen ürün listesi ve yükleme durumuna bağlı çalışan bir React görünüm bileşenidir.

**[Aksiyom 1]**: Eğer `products` parametresi dizi (`Array`) tipinde değilse, bileşen hata verir olur.

**[Aksiyom 2]**: Eğer `products` boş dizi (`[]`) olarak kalırsa veya hiç ürün sağlanmamışsa, boş durum (empty state) görünümü gösterilir olur.

**[Aksiyom 3]**: Eğer `isLoading` `true` değerini alırsa, ürün listesi yerine yükleme göstergesi görüntülenir olur.

**[Aksiyom 4]**: Eğer `CategoryOrbitCarousel` bileşeni kullanılamıyorsa veya import edilmemişse, bileşenin çalışması sırasında run-time hatası oluşur olur.

**[Aksiyom 5]**: Eğer `products` dolu bir dizi ise ve `isLoading` `false` ise, ürünler CategoryOrbitCarousel aracılığıyla görüntülenir olur.

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

### [N1_NASIL] AST Pointer: ProductsDiscoveryView.tsx::loadingPlaceholder
- **params**: ()
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: JSX (bos loading placeholder animasyonu iceren div)

### [N2_NASIL] AST Pointer: ProductsDiscoveryView.tsx::ProductsDiscoveryView
- **params**: (products = [], isLoading = false)
- **ic_degiskenler**:
  - `router` — useNavigation hook'undan gelen yonlendirici nesne, sayfalar arasi gecis icin kullanilir
  - `t` — useI18n hook'undan gelen ceviri fonksiyonu, UI metinlerini cok dilli yapar
  - `viewMode` — Urunlerin gorunum modunu belirten state (grid veya list), baslangici 'grid'
  - `setViewMode` — viewMode state'ini guncelleyen setter fonksiyonu
  - `productsRef` — Urun grid section'ina referans, animasyon veya scroll kontrolu icin kullanilir
  - `handleSubcategorySelect` — Alt kategori secildiginde yonlendirme islemi yapan useCallback fonksiyonu
- **Dönüş**: JSX (Urun kesif sayfasinin tam gorunumu)

### [N3_NASIL] AST Pointer: ProductsDiscoveryView.tsx::handleSubcategorySelect
- **params**: (categorySlug: string, subcategorySlug?: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (sadece yonlendirme yan etkisi var, donus degeri yok)

### [N4_NASIL] AST Pointer: ProductsDiscoveryView.tsx::productMappingCallback
- **params**: (product, index)
- **ic_degiskenler**:
  - `ESTIMATED_3D_ITEMS` — 3D animasyonlu urun sayisi tahmini, animasyon zamanlamasi icin kullanilir
  - `TOTAL_3D_DURATION` — Toplam 3D animasyon suresi, gecikme hesaplamasi icin kullanilir
  - `GRID_ENTRY_DELAY` — Grid giris animasyonu icin gecikme suresi, 3D animasyonla es zamanli baslatma icin
  - `isInitialView` — Urunun ilk ekran gorunumde olup olmadigini belirleyen boolean, animasyon gecikmesi icin
- **Dönüş**: JSX (animasyonlu ProductCard iceren motion.div)

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
- **Yardımcı Sınıflar:** `$`, `${isLoading`, `${viewMode`, `:`, `===`, `animate-pulse`, `blur-100`, `border`, `capitalize`, `duration-300`, `duration-700`, `ease-hvac-ease`, `font-bold`, `font-extrabold`, `font-medium`