---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\db-rows.ts
skeleton_hash: ed3ebdafcfc05c8b
entity_hashes:
  overview: 700f37bc5a714626
generated_at: 2026-08-13T08:54:02Z
---

## Genel Bakış
`db-rows.ts` modülü, VentHub HVAC projesindeki veritabanı tablolarının satır yapılarını temsil eden TypeScript arayüz (interface) tanımlarını içerir. Dosya yalnızca tip (type) ve arayüz tanımlarından oluşur; çalıştırılabilir kod, fonksiyon veya değişken barındırmaz. Bu modül, `database.types` ve `authority` modüllerinden import edilen temel tipleri genişleterek projenin veri modelini tanımlar.

## Fonksiyon Grupları
Bu modülde fonksiyon bulunmamaktadır. Dosya, derleme zamanı tip güvenliği sağlamak üzere saf arayüz tanımlarından oluşur.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** `db-rows.ts` dosyası yalnızca TypeScript arayüz (interface) tanımları içeren, çalıştırılabilir kod barındırmayan bir tip modülüdür. Mimari aksiyomlar yalnızca fonksiyon gövdelerinden türetilebilir; bu modülde herhangi bir fonksiyon imzası veya gövdesi bulunmadığından çıkarılabilir koşul-sonuç ilişkisi mevcut değildir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./authority::type { AuthorityContent
- import: ./database.types::type { Database, Json }

---

## INTERFACES

### DbUserProject
- `id: string`
- `user_id: string`
- `name: string`
- `description: string | null`
- `created_at: string`
- `updated_at: string`

### DbProjectItem
- `id: string`
- `project_id: string`
- `product_id: string`
- `quantity: number`
- `created_at: string`
- `product?: DbProduct | null`

### DbAppSettings
- `id: string`
- `key: string`
- `value: Json`
- `created_at?: string`
- `updated_at?: string`

### DbWebhookEvent
- `id: string`
- `event_type: string`
- `provider: string`
- `status: 'processed' | 'failed' | 'pending'`
- `payload: Json`
- `request_body?: Json`
- `response_body?: Json`
- `error_message?: string`
- `created_at: string`

### DbFtsSearchResult extends DbProduct
- `rank: number`
- `is_fuzzy_match?: boolean`

### DbAdminSearchResult
- `rank: number`
- `total_count: number`
- `purchase_price: number | null`

### CheckoutCustomerInfo
- `name: string`
- `firstName?: string`
- `lastName?: string`
- `email: string`
- `phone: string`
- `identityNumber?: string`

### CheckoutAddressInfo
- `id?: string`
- `full_name?: string`
- `phone: string`
- `city: string`
- `district: string`
- `full_address?: string`
- `fullAddress?: string`
- `postalCode?: string`
- `postal_code?: string`

### CheckoutInvoiceInfo
- `type: 'individual' | 'corporate'`
- `company_name?: string`
- `companyName?: string`
- `tax_office?: string`
- `taxOffice?: string`
- `tax_number?: string`
- `taxNumber?: string`
- `t_c_id?: string`
- `tckn?: string`
- `vkn?: string`
- `vknNumber?: string`
- `eInvoice?: boolean`

### CheckoutLegalConsents
- `kvkk: boolean`
- `sales_agreement: boolean`
- `privacy_policy: boolean`
- `distanceSales: boolean`
- `preInfo: boolean`
- `orderConfirm: boolean`
- `marketing: boolean`

---

## TYPE ALIASES

### PublicSchema
```typescript
type PublicSchema = Database['public']
```

### Tables
```typescript
type Tables = PublicSchema['Tables']
```

### Enums
```typescript
type Enums = PublicSchema['Enums']
```

### LegacyAuthorityContent
@deprecated Eski statik otorite yapısı. Yeni projelerde DynamicAuthorityContent kullanılmalıdır.
```typescript
type LegacyAuthorityContent = {
  brand?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    badges?: string[];
    stats?: Array<{ label: string; value: string }>;
    [key: string]: Json | undefined
```

### AuthorityContent

### CategoryMetadata
```typescript
type CategoryMetadata = {
  hero_title?: string;
  hero_description?: string;
  technical_summary?: string;
  hide_price?: boolean;
  model_type?: string;
  authority_content?: AuthorityContent | Json;
  features?: Ar
```

### LocalizedCategoryMetadata
```typescript
type LocalizedCategoryMetadata = {
  tr?: CategoryMetadata;
  en?: CategoryMetadata;
} & CategoryMetadata
```

### ProductDescriptionI18n
Yerelleştirilmiş ürün açıklaması. Kolon 2026-08-11'de `products` tablosuna eklendi; `database.types.ts` henüz yeniden üretilmediği için burada yapısal olarak tanımlanır (generated dosya elle düzenlenmez).
```typescript
type ProductDescriptionI18n = {
  tr?: string | null;
  en?: string | null;
} | null
```

### DroppedLegacyProductColumns
```typescript
type DroppedLegacyProductColumns = | 'description'
  | 'image_url'
  | 'airflow_capacity'
  | 'noise_level'
  | 'pressure_rating'
  | 'meta_title'
  | 'meta_description'
  | 'is_category_manual'
```

### DbProduct
```typescript
type DbProduct = Omit<
  Tables['products']['Row'],
  'technical_specs' | 'family_id' | 'description_i18n' | DroppedLegacyProductColumns
> & {
  technical_specs: Record<string, Json> | null;
  /** Ürün ailesi kim
```

### DbCategory
```typescript
type DbCategory = Omit<Tables['categories']['Row'], 'name' | 'description' | 'metadata' | 'authority_content'> & {
  name: string;
  menu_label: string | null;
  marketing_title: string | null;
  translation_key: s
```

### DbProductFamily
```typescript
type DbProductFamily = Omit<
  Tables['product_families']['Row'],
  'description' | 'meta_title' | 'meta_description'
> & {
  description: ProductDescriptionI18n;
  meta_title: ProductDescriptionI18n;
  meta_descripti
```

### DbUserAddress
```typescript
type DbUserAddress = Tables['user_addresses']['Row']
```

### DbInvoiceProfile
```typescript
type DbInvoiceProfile = Tables['user_invoice_profiles']['Row']
```

### DbShoppingCart
```typescript
type DbShoppingCart = Tables['shopping_carts']['Row']
```

### DbCartItem
```typescript
type DbCartItem = Tables['cart_items']['Row']
```

### DbOrder
```typescript
type DbOrder = Tables['venthub_orders']['Row']
```

### DbOrderItem
```typescript
type DbOrderItem = Tables['venthub_order_items']['Row']
```

### DbProductInsert
```typescript
type DbProductInsert = Tables['products']['Insert']
```

### DbCategoryInsert
```typescript
type DbCategoryInsert = Tables['categories']['Insert']
```

### DbUserAddressInsert
```typescript
type DbUserAddressInsert = Tables['user_addresses']['Insert']
```

### DbInvoiceProfileInsert
```typescript
type DbInvoiceProfileInsert = Tables['user_invoice_profiles']['Insert']
```

### DbProductUpdate
```typescript
type DbProductUpdate = Tables['products']['Update']
```

### DbUserAddressUpdate
```typescript
type DbUserAddressUpdate = Tables['user_addresses']['Update']
```

### DbInvoiceProfileUpdate
```typescript
type DbInvoiceProfileUpdate = Tables['user_invoice_profiles']['Update']
```

### DbJson

---

## AST POINTERS

Bu dosya **(`db-rows.ts`)** bir **TypeScript tip tanımlama dosyasıdır** (`import type` ifadelerinden anlaşılmaktadır). Dosyada:

- **Fonksiyon gövdesi bulunmamaktadır**
- **Sadece tip tanımları (type/interface) yer almaktadır**
- **Hiçbir çalıştırılabilir kod içermemektedir**

---

### Sonuç

| Kategori | Durum |
|----------|-------|
| Fonksiyon sayısı | 0 |
| AST Pointer üretimi | Yapılamaz |
| Neden | Dosya sadece type tanımlarından oluşmaktadır;fonksiyon gövdesi, parametre veya iç değişken bulunmamaktadır |

---

**Not:** Bu dosya `db-rows.ts` olarak adlandırılmış olup muhtemelen veritabanı satırları için tip tanımları (`DbRow`, `UserRow`, `OrderRow` gibi interface/type tanımları) içermektedir. Çalıştırılabilir fonksiyon barındırmadığı için AST Pointer analizi uygulanamaz.

---

## NODE ID STANDARD

  file: src\types\db-rows.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthorityContent
  export: CategoryMetadata
  export: CheckoutAddressInfo
  export: CheckoutCustomerInfo
  export: CheckoutInvoiceInfo
  export: CheckoutLegalConsents
  export: DbAdminSearchResult
  export: DbAppSettings
  export: DbCartItem
  export: DbCategory
  export: DbCategoryInsert
  export: DbFtsSearchResult
  export: DbInvoiceProfile
  export: DbInvoiceProfileInsert
  export: DbInvoiceProfileUpdate
  export: DbJson
  export: DbOrder
  export: DbOrderItem
  export: DbProduct
  export: DbProductFamily
  export: DbProductInsert
  export: DbProductUpdate
  export: DbProjectItem
  export: DbShoppingCart
  export: DbUserAddress
  export: DbUserAddressInsert
  export: DbUserAddressUpdate
  export: DbUserProject
  export: DbWebhookEvent
  export: Enums
  export: LegacyAuthorityContent
  export: LocalizedCategoryMetadata
  export: ProductDescriptionI18n
  export: PublicSchema
  export: Tables

---

## BILEŞIM (CONTAINS)
  contains: DbProduct