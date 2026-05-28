---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx
skeleton_hash: 350fc3508bede109
generated_at: 2026-05-23T22:41:48Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunun ürün keşif bölümünü yöneten React görünüm bileşenidir. Kullanıcıların platformdaki tüm ürünleri keşfetmesini sağlayan arayüz katmanını oluşturur, dışarıdan iletilen ürün listesi ve yükleme durumu verileriyle görünümü dinamik olarak çalıştırır.

## Fonksiyon Grupları
### Ana Ürün Keşif Arayüz Bileşeni
Modülün tüm temel sorumluluğunu yerine getiren, ürün keşif görünümünü oluşturan ana React bileşenidir. Dışarıdan alınan girdilerle arayüzün gerektiği gibi görüntülenmesini sağlar.
- ProductsDiscoveryView

---

## AXIOMS – Mimari Varsayımlar
ProductsDiscoveryView, ürün keşfi işlevini yerine getiren bir React görünüm bileşenidir; doğru çalışması için bağımlı olduğu alt bileşenlerin erişilebilir olması ve giriş prop'larının tanımlanan tür ve formatta iletilmesi zorunludur.

[Aksiyom 1]: Eğer modülün çağırdığı CategoryOrbitCarousel alt bileşeni proje kapsamında erişilebilir, doğru import edilmiş ve çalışır durumda değilse, ProductsDiscoveryView hiçbir içerik oluşturamadan çalışma zamanı hatası fırlatır.
[Aksiyom 2]: Eğer giriş propu olarak iletilen products değeri geçerli bir dizi formatında değilse, bileşen varsayılan boş dizi değerini kullanamaz ve ürün listelemesi hiç görüntülenmez ya da render işlemi başarısız olur.
[Aksiyom 3]: Eğer giriş propu olarak iletilen isLoading değeri boolean türünde bir veri değilse, yükleme durumu yönetimi hatalı çalışır, kullanıcıya yanlış yükleme göstergesi gösterilir ya da hiç gösterilemez.
[Aksiyom 4]: Eğer CategoryOrbitCarousel alt bileşeninin çalışması için gereken zorunlu tüm giriş prop'ları ProductsDiscoveryView tarafından doğru şekilde iletilmiyorsa, alt bileşen işlevini yerine getiremez ve ana ürün keşif ekranı içeriksiz kalır.

---

## FONKSIYON DETAYLARI

### ProductsDiscoveryView
**Ne yapar**: Venthub HVAC projesindeki ürün keşif ekranını oluşturan React fonksiyonel bileşenidir. Kullanıcıların keşfetmesi için sunulacak ürünleri ve yükleme durumunu alarak uygun görselleştirmeyi sunan ana sayfa bileşenidir. Sadece ürün listesini ve yükleme sürecini yöneterek kullanıcılara kesintisiz bir ürün keşif deneyimi sunmakla sorumludur.
**Nasıl yapar**: Kendisine tanımlanan varsayılan prop değerleri sayesinde herhangi bir prop gönderilmediğinde bile hata vermeden çalışır. Gelen ürün listesini kullanarak ekranda görüntülenecek ürünleri render eder, yükleme bayrağı üzerinden veri çekme sürecini yöneterek kullanıcıya uygun durum geri bildirimi sunar. src/views dizininde yer alan bir görünüm bileşeni olarak ana ürün keşif akışının merkezinde yer alır, projenin ürün keşif modülünün temel giriş noktasıdır.
**Parametreler**:
- name: products, type: dizi (ProductsDiscoveryViewProps tipinde tanımlı) — Ekranda gösterilecek olan tüm HVAC ürünlerinin listesidir, varsayılan değeri boş dizidir.
- name: isLoading, type: boolean (ProductsDiscoveryViewProps tipinde tanımlı) — Ürünlerin API veya başka bir harici kaynaktan yüklenip yüklenmediğini belirten durum bayrağıdır, varsayılan değeri false olarak tanımlanmıştır.
**Dönüş**: React.FC<ProductsDiscoveryViewProps> türünde, tanımlanan tüm prop'larla tam uyumlu çalışan bir React fonksiyonel bileşeni döndürür. Bu bileşen tarayıcı DOM'una eklenerek ürün keşif ekranını son kullanıcıya sunar.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx::anonim_loading_placeholder
- **params**: (parametre yok)
- **ic_degiskenler**: (yok, dahili değişken tanımlı değil)
- **Dönüş**: Yükleme durumunda gösterilen, animasyonlu glow efektli boşluk JSX React elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx::ProductsDiscoveryView
- **params**: products (varsayılan: [], Product tipinde dizi), isLoading (varsayılan: false, yükleme durumu boolean değeri)
- **ic_degiskenler**:
  - `router` — Next.js useRouter hook'undan alınan sayfa yönlendirme nesnesi
  - `t` — useI18n sağlayıcısından alınan çeviri metni getiren fonksiyon
  - `viewMode` — grid veya list görünüm modunu tutan state değişkeni
  - `setViewMode` — viewMode state'ini güncelleyen state setter fonksiyonu
  - `productsRef` — Ürün grid section'ına atanmış DOM referansı
  - `handleSubcategorySelect` — Kategori karuzelinden gelen alt kategori seçim olaylarını yöneten callback fonksiyonu
  - `products.length` — Listelenen toplam ürün sayısı, arayüzde gösterilir
  - `LayoutGrid` — Lucide-react'ten importlanan grid görünümü ikonu bileşeni
  - `List` — Lucide-react'ten importlanan liste görünümü ikonu bileşeni
  - `CategoryOrbitCarousel` — Kategori gezintisi için kullanılan karuzel bileşeni
  - `ProductCard` — Tekil ürün bilgilerini gösteren kart bileşeni
- **Dönüş**: Tüm ürün keşif arayüzünü içeren ana JSX React elementi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx::handleSubcategorySelect
- **params**: categorySlug (string, seçilen ana kategorinin benzersiz kısaltması), subcategorySlug (opsiyonel string, seçilen alt kategorinin benzersiz kısaltması)
- **ic_degiskenler**:
  - `router` — Üst kapsamdan alınan Next.js yönlendirme nesnesi
  - `Routes.category` — Rota adresi oluşturan yardımcı fonksiyon
- **Dönüş**: yok, yalnızca seçilen kategorinin rota adresine yönlendirme yapar

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx::anonim_products_map_callback
- **params**: product (üzerinde işlem yapılan tekil Product nesnesi), index (ürünün products dizisindeki sıfır tabanlı indeksi)
- **ic_degiskenler**:
  - `ESTIMATED_3D_ITEMS` — 3D animasyonlu ilk kategori karuzeli ürün sayısı olarak tanımlanan 8 sabiti
  - `TOTAL_3D_DURATION` — Toplam 3D karuzel animasyon süresini hesaplayan değişken
  - `GRID_ENTRY_DELAY` — Ürün grid giriş animasyonunun başlangıç gecikmesini hesaplayan değişken
  - `isInitialView` — Ürünün ilk görünür alanda (viewport) olup olmadığını kontrol eden boolean
  - `product.id` — Ürünün benzersiz kimliği, React listesi anahtarı olarak kullanılır
  - `viewMode` — Üst kapsamdan alınan grid/list görünüm modu, ProductCard'a layout olarak geçirilir
- **Dönüş**: Her ürün için sarmalanmış motion.div ve içindeki ProductCard bileşeninden oluşan JSX elementi

---

## NODE ID STANDARD

  file: src\views\ProductsDiscoveryView.tsx
  function: src\views\ProductsDiscoveryView.tsx::ProductsDiscoveryView

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductsDiscoveryView