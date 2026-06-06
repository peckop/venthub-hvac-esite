---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\ui-models.ts
skeleton_hash: 99b64ded625b7139
entity_hashes:
  overview: 880a05d23bd685e7
generated_at: 2026-06-06T21:56:21Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin UI katmanı için tip tanımları içeren, yalnızca derleme zamanında var olan bir TypeScript modülüdür. Veritabanı tablolarına karşılık gelen temel tipleri (DbCategory, DbProduct vb.) import ederek, bu verilerin UI bileşenlerinde güvenli bir şekilde kullanılmasını sağlayacak arayüz ve tip tanımları tanımlar. Dosyada herhangi bir çalıştırılabilir kod, sabit veya fonksiyon bulunmamaktadır; tüm amacı tip güvenliği sağlamaktır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül yalnızca TypeScript tip tanımları içermektedir; herhangi bir çalıştırılabilir fonksiyon gövdesi veya modül sabiti bulunmamaktadır. Bu nedenle, fonksiyon gövdesinden türetilebilecek aksiyom yoktur.

**[Aksiyom 1]:** Eğer `db-rows` modülü mevcut değilse veya içinden `DbCategory` ve `DbProduct` tipleri export edilmiyorsa, derleme zamanında hata oluşur.

**[Aksiyom 2]:** Eğer `db-rows` modülündeki `DbCategory` veya `DbProduct` tiplerinin yapıları (alan isimleri/tipleri) değiştirilirse, bu modüldeki karşılık gelen UI tip tanımlarının da güncellenmesi gerekir; aksi takdirde derleme hatası oluşur.

---

**Not:** Bu dosyada herhangi bir fonksiyon gövdesi, sabit veya çalıştırılabilir kod bulunmadığından, fonksiyonel davranışa ilişkin aksiyom üretilememektedir. Mevcut aksiyomlar yalnızca derleme zamanı bağımlılığı ilişkisine dayanmaktadır.

---

## FONKSİYON DETAYLARI

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

Bu dosya (`C:\Users\alize\venthub-hvac\src\types\ui-models.ts`) **tip tanımları dosyasıdır** ve:

- **Fonksiyon gövdesi**: Yok
- **Fonksiyon imzası**: Yok
- **Sabit tanımı**: Yok
- **Class tanımı**: Yok

Dosya sadece şu import'ları içerir:
```typescript
import type { DbCategory, DbProduct, DbUserProject, DbProjectItem, DbUserAddress, DbInvoiceProfile }
import type { Json } from './database.types';
```

Bu import'lar, dosya içinde tanımlanacak tipler tarafından kullanılacak referanslardır. Dosyanın kendisinde herhangi bir çalıştırılabilir fonksiyon veya metot gövdesi bulunmadığından **AST Pointer üretilecek fonksiyon yoktur**.

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