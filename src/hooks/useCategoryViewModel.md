---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts
skeleton_hash: 4f967cc6f066d807
entity_hashes:
  func:useCategoryViewModel: 0b861ef832c74aa2
  overview: f10ffa8b681cd8b5
generated_at: 2026-06-19T20:47:53Z
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

## FONKSİYON DETAYLARI

### useCategoryViewModel

**Ne yapar**: UI katmanı için kategori ve ürün verilerini dönüştürmek üzere iki memoize edilmiş fonksiyon döndüren React hook'u. Kategorilerin gösterim modelini (view model) oluşturan ve ürünleri seri bazında gruplayan mantığı merkezi olarak sağlar.

**Nasıl yapar**: `useI18n` hook'unu kullanarak mevcut dili ve çeviri fonksiyonunu alır. Ardından `useMemo` ile iki işlevi sararak gereksiz yeniden hesaplamaları önler. `wrapCategory` fonksiyonu kategori verisini ham veritabanı yapısından UI'a uygun normalize edilmiş görünüme dönüştürür. `groupProductsBySeries` ise ürün dizisini seri anahtarlarına göre haritalandırarak gruplanmış bir dizi üretir.

**Parametreler**: Yok (parametresiz bir hook).

**Dönüş**: `{ wrapCategory, groupProductsBySeries }` — UI temsili için kullanılacak iki memoize edilmiş işlev nesnesi.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/I18nProvider::useI18n
- import: ../lib/type-converters::DomainCategory
- import: ../lib/type-converters::DomainProduct
- import: ../lib/type-converters::mapCategoryWithLocale
- import: ../types/db-rows::type { DbCategory }
- import: react::useMemo

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

## NODE ID STANDARD

  file: src\hooks\useCategoryViewModel.ts
  function: src\hooks\useCategoryViewModel.ts::useCategoryViewModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryViewModel
  export: SeriesGroup
  export: useCategoryViewModel