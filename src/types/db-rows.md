---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\db-rows.ts
skeleton_hash: 1ad6e65787a8f1b5
generated_at: 2026-05-23T22:33:04Z
---

## Genel Bakış
VentHub HVAC projesinin TypeScript tiplerini yöneten src/types dizininde yer alan bu modül, proje genelinde veritabanı etkileşimleri sırasında kullanılacak standartlaştırılmış veritabanı satır tiplerini tanımlamak amacıyla oluşturulmuştur. Hiçbir çalıştırılabilir kod, fonksiyon veya çalışma zamanı değeri barındırmayan, sadece tip seviyesinde tanımlamalar yapan bir modüldür.

Modül yalnızca proje içindeki başka tip tanımı dosyalarından dış tipler import eder; veritabanı temel tiplerini barındıran `database.types` dosyasından temel veri tiplerini, yetkilendirme ile ilgili tipleri içeren `authority` dosyasından dinamik içerik tipini alarak kendi içindeki tip tanımları için temel oluşturur. Doğrudan herhangi bir ortam değişkeni kullanmaz, çalışma zamanında hiçbir harici API veya veritabanı tablosu ile etkileşim kurmaz, sadece tüm proje bileşenleri için tek tip standardı sunar.

---

## AXIOMS – Mimari Varsayımlar
Bu TypeScript tip tanımlama modülü, projedeki veritabanı satırı yapılarının tip güvenliğiyle kullanılmasını sağlamak için tasarlanmıştır, çalışmasının temel koşulu projenin TypeScript altyapısıyla tam uyumlu olmasıdır.

[Aksiyom 1]: Eğer bu modül projenin TypeScript derleme zincirine dahil edilmezse, tanımlanan tipler üzerinden hiçbir derleme zamanı tip denetimi gerçekleştirilemez, çalışma zamanı veri uyumsuzlukları riski ortaya çıkar.
[Aksiyom 2]: Eğer bu modülde tanımlanan tip yapıları, kullanılan veritabanının gerçek şema yapısıyla eşleşmiyorsa, veritabanı okuma/yazma işlemlerinde çalışma zamanında veri kaybı, bozulması veya beklenmedik hatalar meydana gelir.
[Aksiyom 3]: Eğer bu modülü içe aktaran proje bileşenlerinin kullandığı TypeScript sürümü, bu modüldeki tip sözdizimini desteklemiyorsa, projenin derleme süreci başarısız olur.

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
*Analiz edilen `C:\Users\alize\venthub-hvac\src\types\db-rows.ts` dosyasında herhangi bir uygulanmış fonksiyon, sınıf metodu veya analiz edilebilir yürütülebilir kod bloğu tespit edilmemiştir. Dosya yalnızca TypeScript tip importları içermektedir:*
- İçe aktarılan tipler: `Database`, `Json` (`./database.types` modülünden), `DynamicAuthorityContent` (`./authority` modülünden)

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
  export: PublicSchema
  export: Tables

---

## BILEŞIM (CONTAINS)
  contains: DbProduct