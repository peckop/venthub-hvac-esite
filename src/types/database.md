---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\types\database.ts
skeleton_hash: 5400bd1e74f5ba4e
entity_hashes:
  overview: 60fe8414ff851e26
generated_at: 2026-08-27T07:07:26Z
---

## Genel Bakış
Bu modül, veritabanı ile ilgili TypeScript tip tanımlarını içe aktaran bir tip modülüdür. './database.types' dosyasından `Database` tipini import ederek projenin diğer bölümlerinin kullanımına sunar. Modülde fonksiyon, sabit veya değişken bulunmaz; yalnızca tip içe aktarma işlemi gerçekleştirilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Modülde fonksiyon tanımları ve modül sabitleri bulunmamaktadır. Aksiyomlar yalnızca fonksiyon gövdelerinden üretildiğinden, bu dosyadan çıkarılacak mimari varsayım bulunmamaktadır. Dosya büyük olasılıkla yalnızca tip tanımları (interface, type alias vb.) içermektedir; ancak bu bilgi fonksiyon gövdesinden gelmediği için aksiyom olarak yazılmamıştır.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./database.types::Database

---

## TYPE ALIASES

### Tables
```typescript
type Tables = <T extends keyof Database['public']['Tables']>
```

### Enums
```typescript
type Enums = <T extends keyof Database['public']['Enums']>
```

### Category
```typescript
type Category = Tables<'categories'>
```

### Product
```typescript
type Product = Tables<'products'>
```

### Order
```typescript
type Order = Tables<'venthub_orders'>
```

### OrderItem
```typescript
type OrderItem = Tables<'venthub_order_items'>
```

### Profile
```typescript
type Profile = Tables<'user_profiles'>
```

### Project
```typescript
type Project = Tables<'user_projects'>
```

---

## AST POINTERS

Bu dosyada (`src/types/database.ts`) tanımlı fonksiyon bulunmamaktadır. Dosya yalnızca `Database` tipini `./database.types` modülünden içe aktaran bir `import` ifadesi içermektedir.

---

## NODE ID STANDARD

  file: src\types\database.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: Category
  export: Enums
  export: Order
  export: OrderItem
  export: Product
  export: Profile
  export: Project
  export: Tables