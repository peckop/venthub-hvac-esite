---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\ui-models.ts
skeleton_hash: cecf3f41ce0cebe8
entity_hashes:
  overview: 33a9634a40be4fcc
generated_at: 2026-08-13T08:54:16Z
---

## Genel Bakış

Bu modül, VentHub HVAC projesinin UI katmanı için gerekli olan tip ve arayüz tanımlarını içeren, yalnızca derleme zamanında var olan bir TypeScript modülüdür. Veritabanı tablolarına karşılık gelen temel tipleri (`DbCategory`, `DbProduct`, `DbInvoiceProfile`, `DbProjectItem`, `DbUserAddress`, `DbUserProject`) import ederek, bu verilerin React bileşenlerinde ve UI yardımcı fonksiyonlarında güvenli bir şekilde işlenmesini sağlayacak veri yapılarını tanımlar. Dosyada herhangi bir çalıştırılabilir kod, fonksiyon veya sabit bulunmamaktadır; tüm amacı TypeScript'in statik tip kontrolü aracılığıyla derleme zamanı güvenliği sağlamaktır.

## Modül Yapısı

Dosya, veritabanı tablolarından UI katmanına veri aktarımını kolayştıran arayüz tanımları içermektedir. Tanımlanan ana arayüzler arasında arama önerileri için `SearchSuggestion`, tam metin arama sonuçları için `FtsProductResult` ve ürün listeleme parametreleri için `GetProductsParams` bulunmaktadır. Bu tipler, veritabanından gelen ham verilerin UI bileşenlerinde kullanılmak üzere şekillendirilmesini sağlar.

## Bağımlılıklar

Dosya, `./database.types` modülünden `Json` tipini ve çeşitli `Db*` veritabanı tiplerini import ederek veri katmanına bağlıdır. Bu bağımlılık yalnızca derleme zamanında geçerlidir ve çalışma zamanında herhangi bir API veya veritabanı sorgusu gerçekleştirmez. UI bileşenleri bu modüldeki tiplere bağımlı olduğundan, modülde yapılacak değişiklikler projenin tip güvenliğini doğrudan etkiler.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül yalnızca TypeScript arayüz ve tip tanımları içermektedir. Çalıştırılabilir kod, fonksiyon gövdesi veya sabit bulunmamaktadır. Dolayısıyla çalışma zamanı varsayımı üretilebilecek herhangi bir fonksiyon imzası mevcut değildir.

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

### FamilyListItem
FamilyListItem: get_product_families_enriched RPC'sinin satır modeli (F5-B W0.2). Aile-bazlı vitrin listelerinin (W2.1) veri birimi; varyant satırı listeye girmez.
- `id: string`
- `name: string`
- `slug: string`
- `series_code: string | null`
- `description: { tr?: string | null; en?: string | null } | null`
- `brand_name: string | null`
- `category_id: string | null`
- `subcategory_id: string | null`
- `cover_image_path: string | null`
- `variant_count: number`
- `min_price: number | null`
- `total_count: number`

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

### Dosya Yapısı Özeti

**Kaynak:** `src/types/ui-models.ts`

**Tür:** TypeScript tip tanımı dosyası (type definitions)

**İçerik:**
- `Json` tipi import edilmiş (`./database.types` kaynağından)
- Database tipleri import edilmiş: `DbCategory`, `DbInvoiceProfile`, `DbProduct`, `DbProjectItem`, `DbUserAddress`, `DbUserProject`

**Not:** Bu dosya salt tip/interface tanımları içeren bir yapıdır. Çalışma zamanı (runtime) kodu, fonksiyon gövdesi veya dışarıya bağımlılık içeren mantık barındırmaz. Dolayısıyla AST Pointer çıkarılacak herhangi bir fonksiyon mevcut değildir.

---

## NODE ID STANDARD

  file: src\types\ui-models.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: Category
  export: DomainCategory
  export: DomainProduct
  export: FamilyListItem
  export: FtsProductResult
  export: InvoiceProfile
  export: Product
  export: ProjectItem
  export: SearchSuggestion
  export: UserAddress
  export: UserProject

---

## BILEŞIM (CONTAINS)
  contains: DomainProduct