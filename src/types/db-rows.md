---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\db-rows.ts
skeleton_hash: e7958ace534d8ee4
generated_at: 2026-05-25T09:09:25Z
---

## Genel Bakış
`src/types/db-rows.ts` modülü, VentHub HVAC projesinde veritabanı satırlarının tip güvenliğini sağlamak amacıyla tanımlanan TypeScript tiplerini içerir. Modül yalnızca tip seviyesinde tanımlamalar yapar; çalıştırılabilir kod, fonksiyon veya değişken barındırmaz. Proje içinde `database.types` ve `authority` dosyalarından tip import edilerek, bu tipler üzerinden standart veritabanı satır yapıları oluşturulur. Çalışma zamanı ortam değişkeni, dış API veya veritabanı tablo sorgulaması bulunmaz; sadece derleme aşamasında tip denetimi için hizmet verir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---



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

### DbProductEnrichedRow
- `id: string`
- `name: string`
- `brand: string`
- `price: number`
- `sku: string`
- `slug: string`
- `model_code: string`
- `category_id: string`
- `subcategory_id: string`
- `status: string`
- `is_featured: boolean`
- `description: string`
- `image_url: string`
- `image_alt: string`
- `stock_qty: number`
- `low_stock_threshold: number`
- `low_stock_override: boolean`
- `technical_specs: Record<string, Json>`
- `airflow_capacity: number`
- `noise_level: number`
- `pressure_rating: number`
- `created_at: string`
- `updated_at: string`
- `warehouse_location: string`
- `supplier_name: string`

### DbFtsSearchResult extends DbProduct
- `rank: number`
- `is_fuzzy_match?: boolean`

### DbAdminSearchResult extends DbProduct
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

### DbProduct
```typescript
type DbProduct = Omit<Tables['products']['Row'], 'technical_specs'> & {
  technical_specs: Record<string, Json> | null;
}
```

### DbCategory
```typescript
type DbCategory = Omit<Tables['categories']['Row'], 'name' | 'description' | 'metadata' | 'authority_content'> & {
  name: string;
  menu_label: string | null;
  marketing_title: string | null;
  translation_key: s
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
  export: DbProductEnrichedRow
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
  export: PublicSchema
  export: Tables

---

## BILEŞIM (CONTAINS)
  contains: DbProduct