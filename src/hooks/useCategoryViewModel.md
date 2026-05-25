---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts
skeleton_hash: 9eca81db7f1ae739
generated_at: 2026-05-25T07:28:27Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde kategori yönetimini tek bir noktadan kontrol eden özel bir React hook’udur. Kullanıcı arayüzü ile veri katmanı arasında köprü kurarak, kategori verilerinin durum yönetimini, iş mantığını ve erişim metodlarını tek bir arayüzde toplar. Böylece uygulamanın farklı bileşenleri aynı işlevselliği paylaşır ve tutarlı bir deneyim sunar.

## Fonksiyon Grupları
### Ana View Model Hook'u
Kategori yönetimi için gerekli tüm durum takibi, iş mantığı ve bileşenlerin erişebileceği metotları tek bir arayüzde sunar.  
- useCategoryViewModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### useCategoryViewModel
**Ne yapar**: Bu fonksiyon, kullanıcı arayüzü (UI) temsili için tek doğruluk kaynağı olarak görev yapan gelişmiş ölçekli bir ViewModel hook'udur. Kategori verilerini UI için uygun hale getirme ve ürünleri ait oldukları serilere göre gruplama gibi UI odaklı veri hazırlama işlemleri için gerekli yardımcı fonksiyonları sağlar. Bu hook, UI bileşenlerinin ihtiyaç duyduğu veri yapılarının tutarlı ve standart olmasını garanti eder.
**Nasıl yapar**: Bu hook, kaynak dosyasının hooks klasöründe bulunması ve `use` öneki ile adlandırılması nedeniyle React hook yapısını kullanarak çalışır. UI ile iş mantığı arasında bir ara katman (ViewModel) olarak görev yapar, kategori sarmalama ve ürün gruplama işlemlerini kendi içinde kapsüller ve bu işlemleri gerçekleştiren fonksiyonları dışa açar. Bu sayede iş mantığı UI bileşenlerinden ayrılmış olur ve docstring'de belirtildiği gibi tek bir doğruluk kaynağı sağlanır.
**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: İki adet yardımcı fonksiyonu içeren bir obje döndürür. Dönüş objesindeki özellikler şunlardır: `wrapCategory`, kategori verilerini UI için işleyen/sarmalayan fonksiyon; `groupProductsBySeries`, ürün listesini ait oldukları serilere göre gruplayan fonksiyon. Bu fonksiyonlar UI bileşenleri tarafından doğrudan kullanılmak üzere tasarlanmıştır.

---

## INTERFACES

### CategoryViewModel
- `id: string`
- `slug: string`
- `displayName: string`
- `marketingTitle: string`
- `description: string`
- `imageUrl: string | null`
- `parentId: string | null`
- `level: number`
- `displayMode: 'showcase' | 'landing' | 'series' | 'grid'`
- `raw: DomainCategory`

### SeriesGroup
- `name: string`
- `products: DomainProduct[]`
- `image?: string`
- `minPrice: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts::useCategoryViewModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook tarafından döndürülen çeviri fonksiyonu
  - `lang` — useI18n hook tarafından döndürülen geçerli dil kodu
  - `wrapCategory` — useMemo ile önbelleğe alınmış kategori işleme fonksiyonu
  - `groupProductsBySeries` — useMemo ile önbelleğe alınmış ürün gruplama fonksiyonu
- **Dönüş**: `{ wrapCategory: Function, groupProductsBySeries: Function }` — iki yardımcı fonksiyon içeren nesne

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts::wrapCategory
- **params**: `category: DomainCategory | null | undefined` — işlenecek kategori nesnesi
- **ic_degiskenler**:
  - `localizedCategory` — mapCategoryWithLocale ile yerelleştirilmiş DbCategory tipindeki kategori nesnesi
  - `tKey` — çeviri anahtarı, localizedCategory.translation_key veya slug alanından alınır
  - `translationPath` — çeviri yolu formatında string: `common.categoryList.${tKey}`
  - `translatedName` — t fonksiyonu ile çevrilen kategori ismi
  - `displayName` — kullanıcıya gösterilecek kategori ismi, çevrilen isim geçerliyse o, yoksa menu_label/name kullanılır
  - `marketingTitle` — kategori pazarlama başlığı, marketing_title varsa o, yoksa displayName kullanılır
  - `meta` — kategori metadata alanı, nesne tipindeyse cast edilmiş hali, değilse boş nesne
  - `displayMode` — kategori görüntüleme modu, varsayılan değer 'series'
  - `rawDisplayMode` — ham görüntüleme modu değeri, DB veya metadata'dan alınır
- **Dönüş**: `CategoryViewModel | null` — kategori görünüm modeli nesnesi veya null

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts::groupProductsBySeries
- **params**: `products: DomainProduct[]` — gruplandırılacak ürün dizisi
- **ic_degiskenler**:
  - `seriesMap` — seri isimlerini anahtar olarak kullanan nesne, grup verileri saklar
- **Dönüş**: `SeriesGroup[]` — alfabetik sıralanmış seri grupları dizisi

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts::groupProductsBySeries~forEachCallback
- **params**: `product: DomainProduct` — işlenecek tek ürün nesnesi
- **ic_degiskenler**:
  - `meta` — ürünün metadata alanı, nesne tipindeyse cast edilmiş hali, değilse boş nesne
  - `seriesName` — ürünün ait olduğu seri ismi, metadata veya ürün isminin ilk kelimesinden alınır
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\useCategoryViewModel.ts
  function: src\hooks\useCategoryViewModel.ts::useCategoryViewModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryViewModel
  export: SeriesGroup
  export: useCategoryViewModel