---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\ui-models.ts
skeleton_hash: 5caf209aa3f87f6d
entity_hashes:
  overview: cdd1d441caa7d556
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış

Bu modül, VentHub HVAC projesinin UI katmanı için gerekli olan tip ve arayüz tanımlarını içeren, yalnızca derleme zamanında var olan bir TypeScript modülüdür. Veritabanı tablolarına karşılık gelen temel tipleri import ederek, bu verilerin React bileşenlerinde ve UI yardımcı fonksiyonlarında güvenli bir şekilde işlenmesini sağlayacak veri yapılarını tanımlar. Dosyada herhangi bir çalıştırılabilir kod, fonksiyon veya sabit bulunmamaktadır; tüm amacı TypeScript'in statik tip kontrolü aracılığıyla derleme zamanı güvenliği sağlamaktır.

## Modül Yapısı

Dosya, veritabanı tablolarından UI katmanına veri aktarımını kolaylaştıran arayüz tanımları içerir. Tanımlanan ana arayüzler arasında arama önerileri için `SearchSuggestion`, tam metin arama sonuçları için `FtsProductResult` ve ürün listeleme parametreleri için `GetProductsParams` bulunmaktadır. Bu tipler, veritabanından gelen DbCategory, DbProduct, DbInvoiceProfile, DbProjectItem, DbUserAddress ve DbUserProject gibi ham verilerin UI bileşenlerinde kullanılmak üzere şekillendirilmesini sağlar.

---

## AXIOMS – Mimari Varsayımlar

Bu modül yalnızca TypeScript tip tanımları (interfaces ve type aliases) içermekte olup, herhangi bir çalıştırılabilir fonksiyon gövdesi veya modül sabiti içermemektedir. Dolayısıyla, bir fonksiyon gövdesinden çıkarılabilecek çalışma zamanı varsayımları mevcut değildir.

**[Aksiyom 1]:** Eğer bu modül (`ui-models.ts`) bir TypeScript derleyicisi (ör. `tsc`) tarafından bir `.js` veya `.dts` çıktısına dönüştürülmezse, modülün tanımladığı tipler derleme zamanında var olmaz ve projenin hiçbir工作的 zaman kodu etkilenmez.

**[Aksiyom 2]:** Eğer projedeki UI bileşenleri bu modüldeki tiplere (ör. `DbCategory`, `DbProduct`) bağımlıysa ve bu modül güncellenip ilgili tipler değiştirilip yeniden derlenmezse, UI bileşenlerinin tip hataları alması ve derleme sürecinin başarısız olması olur.

**[Aksiyom 3]:** Eğer bu modülde tanımlanan tipler (örn: `DbCategory`) gerçek veritabanı şemasını (`db-rows` veya benzeri bir modüldeki_satır tiplerini) doğru bir şekilde yansıtmıyorsa, UI katmanı veritabanından gelen verilerle tutarsız tiplerde çalışır ve beklenmedik çalışma zamanı hatalarına yol açabilir (örn: `undefined` değerlere erişim, tip uyuşmazlığı).

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./database.types::type { Json }

---

## INTERFACES

### SearchSuggestion
- `text?: string`
- `label: string`
- `type: 'product' | 'category' | 'brand'`
- `slug?: string`
- `url: string`
- `metadata?: Json`

### FtsProductResult extends DomainProduct
- `rank?: number`
- `is_fuzzy_match?: boolean`

### GetProductsParams
- `categoryIds?: string[]`
- `searchQuery?: string`
- `brand?: string`
- `minPrice?: number`
- `maxPrice?: number`
- `limit?: number`
- `offset?: number`

---

## TYPE ALIASES

### DomainCategory
DomainCategory: The sanitized, UI-ready version of a category. Refines DbCategory to guarantee name and description are strings.
```typescript
type DomainCategory = Omit<DbCategory, 'name' | 'description'> & {
  name: string;
  description: string;
}
```

### DomainProduct
DomainProduct: The sanitized, UI-ready version of a product. Refines DbProduct to guarantee name, description and brand are strings.
```typescript
type DomainProduct = Omit<DbProduct, 'name' | 'description' | 'brand'> & {
  name: string;
  description: string;
  brand: string;
}
```

### Category

### Product

### UserProject

### ProjectItem
```typescript
type ProjectItem = DbProjectItem & { product?: Product }
```

### UserAddress

### InvoiceProfile

---

## AST POINTERS

Bu dosyada fonksiyon gövdesi bulunmamaktadır.

`ui-models.ts` dosyası sadece **type importları** içermektedir:

```typescript
import type { Json } from './database.types';
import type { DbCategory, DbInvoiceProfile, DbProduct, DbProjectItem, DbUserAddress, DbUserProject } 
```

Fonksiyon imzası, fonksiyon gövdesi, sabit veya class tanımı **yoktur**.

| Öğe | Durum |
|-----|-------|
| Fonksiyon gövdeleri | ❌ Yok |
| Fonksiyon imzaları | ❌ Yok |
| Sınıflar | ❌ Yok |
| Sabitler | ❌ Yok |
| Import edilen tipler | ✅ 6 adet (Json, DbCategory, DbInvoiceProfile, DbProduct, DbProjectItem, DbUserAddress, DbUserProject) |

---

## NODE ID STANDARD

  file: src\types\ui-models.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: Category
  export: DomainCategory
  export: DomainProduct
  export: FtsProductResult
  export: GetProductsParams
  export: InvoiceProfile
  export: Product
  export: ProjectItem
  export: SearchSuggestion
  export: UserAddress
  export: UserProject

---

## BILEŞIM (CONTAINS)
  contains: DomainProduct