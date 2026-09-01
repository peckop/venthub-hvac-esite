---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-rec89\src\types\ui-models.ts
skeleton_hash: 4874e85390a3507f
entity_hashes:
  overview: 33a9634a40be4fcc
generated_at: 2026-09-01T09:44:00Z
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

### FtsProductResult
`fts_search_products` RPC'sinin GERÇEK satır modeli. Eskiden `extends DomainProduct` yazıyordu: tip 30 alan vaat ediyor, RPC 6 alan döndürüyordu. Bu yalan canlı bir hatayı gizledi — arama sonucu `r.slug!` ile yönlendiriliyordu ve slug hiç gelmediği için `/products/undefined` açılıyordu. (W4b'de doma
- `id: string`
- `name: string`
- `sku: string`
- `brand: string`
- `price: number | null`
- `rank?: number`
- `is_fuzzy_match?: boolean`
- `family_slug?: string | null`
- `cover_image_path?: string | null`

### FamilyListItem
FamilyListItem: get_product_families_enriched RPC'sinin satır modeli (F5-B W0.2). Aile-bazlı vitrin listelerinin (W2.1) veri birimi; varyant satırı listeye girmez.
- `id: string`
- `name: string`
- `name_i18n?: { tr?: string | null; en?: string | null } | null`
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
W4b: `price` BİLİNÇLİ olarak domain tipinden çıkarıldı. Satış fiyatını artık fiyat motoru üretiyor (`display_price` → `WithDisplayPrice.displayPrice`); ham kolon müşteri yolunda SELECT bile edilmiyor. Tip `price: number` demeye devam etseydi kaçan her okuma derlenir ve runtime'da `undefined` alırdı 
```typescript
type DomainProduct = Omit<DbProduct, 'name' | 'description' | 'brand' | 'price'> & {
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
type ProjectItem = Omit<DbProjectItem, 'product'> & { product?: Product }
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