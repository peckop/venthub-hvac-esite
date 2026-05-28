---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\supabase.ts
skeleton_hash: 0bb8187b63eb38da
entity_hashes:
  overview: e6186c84d9a0cbfa
generated_at: 2026-05-28T22:38:34Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki tüm Supabase veritabanı işlemlerinin merkezi noktasıdır. Temel amacını, projenin her yerinde kullanılmak üzere tek bir Supabase istemcisi oluşturmaktır. Modül, zorunlu ortam değişkenlerini kontrol eder, eksik veya hatalı durumlarda uyarı verir ve proje için gerekli olan tip güvenli istemci yapısını ve sabit listeyi sağlar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül Supabase istemcisini başlatmak ve HVAC markaları listesini tutmak için tasarlanmıştır.

**[Aksiyom 1]:** Eğer `SUPABASE_URL` ortam değişkeni tanımlı değilse, `missingEnv` değişkeni truthy değer alır ve `supabase` istemcisi güvenli bir şekilde başlatılamaz.

**[Aksiyom 2]:** Eğer `SUPABASE_ANON_KEY` ortam değişkeni tanımlı değilse, `missingEnv` değişkeni truthy değer alır ve `supabase` istemcisi güvenli bir şekilde başlatılamaz.

**[Aksiyom 3]:** Eğer hem `SUPABASE_URL` hem de `SUPABASE_ANON_KEY` ortam değişkenleri tanımlıysa, `supabase` ternary ifadesi tarafından geçerli bir istemci nesnesi oluşturulur.

**[Aksiyom 4]:** Eğer ortam değişkenleri eksik olmasına rağmen `supabase` nesnesi üzerinden veritabanı işlemi başlatılırsa, istemci yapılandırması eksik olacağından hata oluşur.

**[Aksiyom 5]:** `HVAC_BRANDS` dizisi modül içinde sabit olarak tanımlı olmalı ve geçerli HVAC markalarını içermelidir; aksi takdirde marka bazlı filtreleme/listeleme işlemleri beklenen sonuçları vermez.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### CartItem
- `id: string`
- `product: Product`
- `quantity: number`
- `price: number`

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

### HVACBrand
- `name: string`
- `slug: string`
- `description: string`
- `country: string`
- `logo?: string`

---

## TYPE ALIASES

### UserAddress

### InvoiceProfile

### Category

### Product

### UserProject

### ProjectItem
```typescript
type ProjectItem = DbProjectItem & { product?: Product }
```

---

## SABİTLER
- **SUPABASE_URL** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_URL || ''`
- **SUPABASE_ANON_KEY** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''`
- **missingEnv** (binary_expression) — `!SUPABASE_URL || !SUPABASE_ANON_KEY`
- **supabase** (ternary_expression) — `typeof window !== 'undefined'
  ? createBrowserClient<Database>(
      SUPA...`
- **HVAC_BRANDS** (array) — `[
  {
    name: 'AVenS',
    slug: 'avens',
    description: 'Türk premiu...`

---

## AST POINTERS

(No function bodies were provided for analysis.)

---

## NODE ID STANDARD

  file: src\lib\supabase.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartItem
  export: Category
  export: FtsProductResult
  export: GetProductsParams
  export: HVACBrand
  export: HVAC_BRANDS
  export: InvoiceProfile
  export: Product
  export: ProjectItem
  export: SearchSuggestion
  export: UserAddress
  export: UserProject
  export: supabase

---

## BILEŞIM (CONTAINS)
  contains: DomainProduct