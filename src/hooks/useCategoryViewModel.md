---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts
skeleton_hash: 9eca81db7f1ae739
entity_hashes:
  func:useCategoryViewModel: 0b861ef832c74aa2
  overview: f10ffa8b681cd8b5
generated_at: 2026-05-28T22:37:55Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde kategori yönetimini tek bir noktadan kontrol eden bir React hook'idir. Kullanıcı arayüzü ile veri katmanı arasında köprü kurarak, kategori verilerinin durumunu, iş mantığını ve bileşenlerin erişebileceği metotları tutarlı bir arayüzde sunar.

## Fonksiyon Grupları
### Kategori ViewModel Hook'u
Kategori yönetimi için gerekli tüm durum takibi, veri hazırlama (kategori sarmalama, ürün gruplandırma gibi işlemler) ve iş mantığını dışa açan ana hook yapısıdır.
- useCategoryViewModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

**Not:** Mimari varsayımlar yalnızca fonksiyon gövdesinden (implementation body) üretilebilir. Verilen girdide `useCategoryViewModel` fonksiyonunun gövde kodu (iç implementasyon detayları) bulunmamaktadır. Sadece fonksiyon imzası (`useCategoryViewModel()`) ve eski doküman açıklaması mevcuttur.

Fonksiyon gövdesi sağlandığında aşağıdaki alanlar incelenecektir:
- Hook'un çağırdığı harici servisler (API çağrıları)
- Bağımlılık enjeksiyonu (context, servis referansları)
- Hata yönetimi varsayımları
- State yönetim sınırlamaları
- Eşik değerleri ve kabul kriterleri

---

## FONKSİYON DETAYLARI

### useCategoryViewModel

**Ne yapar**: UI katmanı için kategori ve ürün verilerini dönüştürmek üzere iki memoize edilmiş fonksiyon döndüren React hook'u. Kategorilerin gösterim modelini (view model) oluşturan ve ürünleri seri bazında gruplayan mantığı merkezi olarak sağlar.

**Nasıl yapar**: `useI18n` hook'unu kullanarak mevcut dili ve çeviri fonksiyonunu alır. Ardından `useMemo` ile iki işlevi sararak gereksiz yeniden hesaplamaları önler. `wrapCategory` fonksiyonu kategori verisini ham veritabanı yapısından UI'a uygun normalize edilmiş görünüme dönüştürür. `groupProductsBySeries` ise ürün dizisini seri anahtarlarına göre haritalandırarak gruplanmış bir dizi üretir.

**Parametreler**: Yok (parametresiz bir hook).

**Dönüş**: `{ wrapCategory, groupProductsBySeries }` — UI temsili için kullanılacak iki memoize edilmiş işlev nesnesi.

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

### [N1_NASIL] AST Pointer: src/hooks/useCategoryViewModel.ts::useCategoryViewModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t, lang` — useI18n() hook'undan dönen çeviri fonksiyonu ve güncel dil kodu
  - `wrapCategory` — useMemo ile sarmalanmış fonksiyon; bir DomainCategory'yi CategoryViewModel'e dönüştürür (yerelleştirme, çeviri çözümleme, display mode resolver)
  - `groupProductsBySeries` — useMemo ile sarmalanmış fonksiyon; DomainProduct[] dizisini series adına göre gruplanmış SeriesGroup[] dizisine dönüştürür
- **Dönüş**: `{ wrapCategory, groupProductsBySeries }` — iki memoize edilmiş utility fonksiyonu

---

### [N2_NASIL] AST Pointer: src/hooks/useCategoryViewModel.ts::wrapCategory (iç fonksiyon)
- **params**: `category: DomainCategory | null | undefined`
- **ic_degiskenler**:
  - `localizedCategory` — mapCategoryWithLocale(category as DbCategory, lang) ile oluşturulmuş, mevcut dile göre yerelleştirilmiş kategori nesnesi
  - `tKey` — çeviri anahtarı; localizedCategory.translation_key varsa o, yoksa localizedCategory.slug kullanılır
  - `translationPath` — `` `common.categoryList.${tKey}` `` formatında tam çeviri yolu
  - `translatedName` — `t(translationPath)` çağrısıyla elde edilmiş çevrilmiş kategori adı
  - `displayName` — çeviri başarılıysa (translatedName tanımsız değilse ve translationPath'e eşit değilse) translatedName, değilse `localizedCategory.menu_label || localizedCategory.name` fallback'i
  - `marketingTitle` — `localizedCategory.marketing_title` varsa o, yoksa displayName
  - `meta` — `localizedCategory.metadata` objesi; object ise `Record<string, unknown>`'a cast edilir, değilse boş obje `{}`
  - `displayMode` — CategoryViewModel['displayMode'] tipinde mutable değişken; varsayılan `'series'`
  - `rawDisplayMode` — `localizedCategory.display_mode || meta.display_mode`; display mode çözümlemesi yapılır (showcase/landing ise aynen alınır, grid ise series'e çevrilir)
- **Dönüş**: CategoryViewModel nesnesi — `{ id, slug, displayName, marketingTitle, description, imageUrl, parentId, level, displayMode, raw }`

---

### [N3_NASIL] AST Pointer: src/hooks/useCategoryViewModel.ts::groupProductsBySeries (iç fonksiyon)
- **params**: `products: DomainProduct[]`
- **ic_degiskenler**:
  - `seriesMap` — `Record<string, SeriesGroup>` yapısında series adından SeriesGroup'a eşleme haritası; başlangıçta boş `{}` oluşturulur
  - `product` — forEach döngüsünde ele alınan her bir DomainProduct nesnesi
  - `meta` — product.metadata objesi; `'metadata' in product` ve object ve null değilse `Record<string, unknown>`'a cast edilir, değilse boş obje `{}`
  - `seriesName` — `meta.series as string` varsa o, değilse `product.name.split(' ')[0]`; bilinen marka adları listesinde (`['Vortice', 'Avens', 'Soler', 'Casals', 'Vorticel']`) yer alıyorsa `product.name.split(' ')[1]`'e veya orijinal seriesName'e fallback yapılır
- **Dönüş**: `SeriesGroup[]` — `Object.values(seriesMap).sort((a, b) => a.name.localeCompare(b.name))` ile isimlerine göre alfabetik sıralanmış series grupları dizisi

---

### [N4_NASIL] AST Pointer: src/hooks/useCategoryViewModel.ts::product (forEach callback)
- **params**: `product: DomainProduct`
- **ic_degiskenler**:
  - `meta` — product.metadata objesi; `'metadata' in product && typeof product.metadata === 'object' && product.metadata !== null` koşulunu sağlıyorsa `Record<string, unknown>`'a cast edilir, değilse boş obje `{}`
  - `seriesName` — `meta.series as string` varsa o string, değilse `product.name.split(' ')[0]`; `['Vortice', 'Avens', 'Soler', 'Casals', 'Vorticel']` listesinde yer alıyorsa `product.name.split(' ')[1] || seriesName` fallback'i yapılır
- **Dönüş**: yok (void callback; `seriesMap` objesini yan etkiyle mutate eder: `seriesMap[seriesName].products.push(product)` ile ürün ekler, `seriesMap[seriesName].minPrice` günceller)

---

## NODE ID STANDARD

  file: src\hooks\useCategoryViewModel.ts
  function: src\hooks\useCategoryViewModel.ts::useCategoryViewModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryViewModel
  export: SeriesGroup
  export: useCategoryViewModel