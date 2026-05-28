---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\supabase.ts
skeleton_hash: 0bb8187b63eb38da
generated_at: 2026-05-23T22:32:24Z
---

## Genel Bakış
VentHub HVAC projesinin Supabase veritabanı entegrasyonunu merkezi olarak yöneten bu modül, projenin tüm bölümlerinde kullanılmak üzere tekil Supabase istemcisini tanımlar. Supabase bağlantısı için zorunlu olan `SUPABASE_URL` ve `SUPABASE_ANON_KEY` ortam değişkenlerini kontrol eder, eksik olmaları durumunda uyarı mekanizmasını devreye sokar. Tarayıcı ve sunucu tarafı kullanımlarına uygun Supabase istemci API'lerini, projeye özel veritabanı ve arayüz tipleriyle entegre ederek tip güvenli işlemleri mümkün kılar, ayrıca HVAC markalarına ait sabit listeyi depolar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül proje için Supabase istemcisini initialize etmek ve HVAC sistemleri için geçerli marka listesini tutmak amacıyla tasarlanmıştır, çalışması için gerekli ortam değişkenlerinin işletim ortamında tanımlı olması temel koşuldur.

[Aksiyom 1]: Eğer SUPABASE_URL ve SUPABASE_ANON_KEY ortam değişkenleri işletim ortamında tanımlı değilse, modül içindeki missingEnv bayrağı true olur, supabase istemcisi oluşturulamaz ve bu modülü kullanan tüm servisler Supabase ile veri alışverişi yapamaz.
[Aksiyom 2]: Eğer SUPABASE_URL ve SUPABASE_ANON_KEY değişkenleri tanımlı olsa da geçersiz formatta ise, supabase istemcisi oluşturulsa bile tüm kimlik doğrulama ve veri erişim sorguları başarısız olur.
[Aksiyom 3]: Eğer HVAC_BRANDS sabiti eksik veya geçersiz öğeler içeren bir dizi olarak tanımlıysa, bu modülü kullanan HVAC ile ilgili listeleme, filtreleme veya doğrulama işlemleri hatalı çalışır.
[Aksiyom 4]: Eğer modülü kullanan servisler missingEnv bayrağının durumunu kontrol etmeden supabase istemcisini kullanmaya çalışırsa, ortam değişkenleri eksik olduğunda sessiz hata oluşur ve sorun kök nedeninin tespiti gecikir.

---



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

Analiz edilen `C:\Users\alize\venthub-hvac\src\lib\supabase.ts` kaynak dosyasında herhangi bir fonksiyon imzası veya fonksiyon gövdesi tanımlanmamıştır. Yalnızca global düzeyde aşağıdaki sabit değişkenler bulunmaktadır:
- `SUPABASE_URL` — İkili ifade ile tanımlanmış Supabase servis erişim URL'si sabiti
- `SUPABASE_ANON_KEY` — İkili ifade ile tanımlanmış anonim kullanıcı erişim anahtarı sabiti
- `missingEnv` — Gerekli ortam değişkenlerinin eksikliğini işaret eden ikili ifade ile tanımlı kontrol sabiti
- `supabase` — Üçlü (koşullu) ifade ile tanımlanmış Supabase istemcisi nesnesi değişkeni
- `HVAC_BRANDS` — HVAC sektörü markalarını içeren dizi türünde sabit

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