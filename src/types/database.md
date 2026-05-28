---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\database.ts
skeleton_hash: b1d7533d6bb673aa
entity_hashes:
  overview: 60fe8414ff851e26
generated_at: 2026-05-28T22:38:41Z
---

## Genel Bakış
`src/types/database.ts`, projenin veritabanı şeması için merkezi TypeScript tip erişimi sağlayan纯 typoloji modülüdür. Dosya, yalnızca `./database.types` modülünden `Database` tipini yeniden export ederek tüm projenin bu türe tutarlı ve tip-güvenli bir şekilde erişmesini garanti altına alır. Çalıştırılabilir kod, fonksiyon veya ortam değişkeni içermeyen bu modül, veritabanı tabloları ve ilişkileri hakkında derleyiciye bilgi sağlayarak Servisler, Hook'lar ve ORM katmanları arasında tip uyumsuzluğunun önüne geçer.

---



---

## FONKSİYON DETAYLARI

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

Bu dosyada fonksiyon bulunmamaktadır.

**Dosya:** `C:\Users\alize\venthub-hvac\src\types\database.ts`

**İçerik:** Dosya sadece `./database.types` modülünden `Database` tipini import etmektedir. Herhangi bir fonksiyon, sabit veya sınıf tanımı içermemektedir. Bu bir type definition dosyasıdır.

---

AST Pointer üretilecek fonksiyon gövdesi mevcut değildir.

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