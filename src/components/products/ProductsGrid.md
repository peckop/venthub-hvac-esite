---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\ProductsGrid.tsx
skeleton_hash: 9ea1ac36dfdc188b
generated_at: 2026-05-23T22:26:11Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ürün listeleme bölümünde kullanılan, ürünleri ızgara formatında sunan temel React bileşenini barındırır. Gelen yapılandırma ve veri prop'larını işleyerek kullanıcılara tutarlı bir ürün görüntüleme deneyimi sunar, yükleme, sıralama ve görünüm ayarı gibi temel işlevleri destekler.

## Fonksiyon Grupları
### Ana Ürün Listeleme Bileşeni
Modülün tüm sorumluluklarını üstlenen bu grup, ürün görüntüleme ve kullanıcı etkileşimi yönetimi işlevlerini tek bileşen altında toplar. Gelen veri ve ayar prop'larını işleyerek ürünleri istenen formatta sunar, görünüm modu ve sıralama değişikliği gibi kullanıcı taleplerini üst bileşenlere iletir.
- ProductsGrid

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı ürün listeleme grid bileşeni, tüm çalışması için gereken veri ve aksiyon fonksiyonlarını üst bileşen tarafından kendisine prop olarak iletilmesini varsayar; hiçbir harici kaynaktan veri çekmez ya da state yönetimi yapmaz.

[Aksiyom 1]: Eğer `products` prop'u iletilmezse, bileşen gösterilecek ürün verisine erişemez, boş içerikli liste hatasız olsa da kullanıcıya hiçbir ürün gösterilemez.
[Aksiyom 2]: Eğer `viewMode` prop'u iletilmezse, bileşen mevcut görünüm ayarını bilemez, grid görünümü doğru şekilde başlatılamaz, kullanıcıya hatalı görünüm render edilir.
[Aksiyom 3]: Eğer `loading` prop'u iletilmezse, veri yüklenme durumu kullanıcıya bildirilemez, ürünler yüklenirken ekranda kalıcı olarak boş liste görüntüsü oluşur.
[Aksiyom 4]: Eğer `onViewModeChange` callback prop'u iletilmezse, kullanıcının görünüm modu değiştirme talebi üst bileşene iletilemez, görünüm modu hiçbir şekilde güncellenemez.
[Aksiyom 5]: Eğer `onSortChange` callback prop'u iletilmezse, kullanıcının ürün sıralaması değiştirme talebi üst bileşene iletilemez, ürün listesinin sıralaması hiçbir şekilde güncellenemez.

---

## FONKSIYON DETAYLARI

### ProductsGrid
**Ne yapar**: Ürün listesini kullanıcının tercihine göre ızgara veya liste modunda görüntüleyen atomik React bileşenidir. HVAC sistemi ürünleri için tasarlanan bu bileşen, ürünlerin tutarlı bir şekilde son kullanıcıya sunulmasını sağlarken, görünüm modu değiştirme ve sıralama işlemlerini de destekler. Yüklenme durumu kontrolü ile boş veya eksik içerik gösterilmesinin önüne geçer.
**Nasıl yapar**: Gelen prop'lardaki değerleri işleyerek iç mantığını çalıştırır, viewMode prop'una göre görünüm şablonunu seçerek ürünleri ilgili düzende ekrana yansıtır. Kullanıcı tarafından tetiklenen görünüm modu değiştirme veya sıralama değiştirme isteklerini üst bileşene iletmek için tanımlı callback fonksiyonlarını tetikler, loading prop'u true olduğu durumda içerik yerine yüklenme göstergesi sunar.
**Parametreler**:
- products: ProductsGridProps içindeki products tipi — Bileşende görüntülenecek tüm ürünlerin detaylarını barındıran veri dizisidir, bileşenin ana içeriğini oluşturur.
- viewMode: ProductsGridProps içindeki viewMode tipi — Mevcut aktif görünüm modunu tutan değişkendir, ızgara veya liste görünümü seçeneklerinden birini alır.
- loading: ProductsGridProps içindeki loading tipi — Ürün verilerinin henüz yüklenmediğini belirten boolean değer, true olduğu durumda bileşen yüklenme göstergesi gösterir.
- onViewModeChange: ProductsGridProps içindeki onViewModeChange tipi — Kullanıcı görünüm modunu değiştirmek istediğinde tetiklenen callback fonksiyonudur, yeni seçilen görünüm modunu üst bileşene iletir.
- onSortChange: ProductsGridProps içindeki onSortChange tipi — Kullanıcı sıralama kriterini değiştirdiğinde tetiklenen callback fonksiyonudur, yeni seçilen sıralama tercihini üst bileşene ileterek liste güncellemesini tetikler.
**Dönüş**: React.FC<ProductsGridProps> tipinde bir React fonksiyonel bileşeni döndürür. Tanımlanan prop türlerine uygun olarak çalışan bu bileşen, tarayıcıda kullanıcıya gösterilecek React elementini üretir, tüm prop kontrollerini ve görünüm mantığını barındırır.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\ProductsGrid.tsx::ProductsGrid
- **params**: (products, viewMode, loading, onViewModeChange, onSortChange, sortBy = 'name')
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, UI metinlerini yerelleştirmek için tüm metin gösterimlerinde kullanılır
  - `useI18n` — Uygulama yerelleştirme sistemine erişmek için kullanılan React hook'u
- **Dönüş**: Ürün grid/listesi ve araç çubuğunu içeren React JSX elementi

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\ProductsGrid.tsx::products.map callback
- **params**: (product)
- **ic_degiskenler**:
  - `product.id` — İşlenen ürünün benzersiz kimliği, React liste render'ında key propu olarak kullanılır
  - `product` - products dizisinden dönen tekil Product tipi nesnesi, alt ProductCard bileşenine aktarılır
  - `viewMode` — Üst kapsamdaki ana ProductsGrid fonksiyonundan erişilen görünüm modu, ProductCard'a layout propu olarak aktarılır
- **Dönüş**: İşlenen ürün için oluşturulmuş ProductCard JSX elementi

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
