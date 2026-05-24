---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\database.ts
skeleton_hash: b1d7533d6bb673aa
generated_at: 2026-05-23T22:32:52Z
---

## Genel Bakış
VentHub HVAC projesinin src/types/database.ts modülü, proje genelinde tip güvenli veritabanı işlemleri yapmak için merkezi tür erişimi sunan yalnızca tür tanımı içeren bir modüldür. Hiçbir çalıştırılabilir kod, fonksiyon veya ortam değişkeni kullanmayan bu modül, yalnızca yerel ./database.types dosyasından temel veritabanı şema tipini import ederek, projenin tüm diğer bölümlerinin bu türe merkezi olarak erişmesini sağlar. Tüm kod tabanında veritabanı ile ilgili tür uyumsuzluklarının önüne geçmek amacıyla yalnızca tür paylaşımı görevini üstlenir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül VentHub HVAC sisteminin veritabanı varlıkları ve işlemleri için TypeScript tip tanımlarını barındırır, projenin hatasız derlenmesi ve tip güvenliğinin sürdürülebilmesi için derleyici ve tüm bağımlı bileşenlerin bu tiplere erişmesi ve tanımlanan tiplere uyumlu çalışması zorunludur.

[Aksiyom 1]: Eğer TypeScript derleyicisi bu dosyayı projenin derleme kapsamına dahil etmezse, proje içindeki tüm modüller bu tip tanımlarına erişemez ve proje başarısızlıkla derlenir.
[Aksiyom 2]: Eğer sistemde kullanılan production veritabanının şeması bu dosyadaki tip tanımlarıyla uyumsuz olursa, TypeScript'in sağladığı tip güvenliği devre dışı kalır, çalışma zamanında veri uyumsuzlukları, hatalı işlem sonuçları veya kalıcı veri kaybı yaşanır.
[Aksiyom 3]: Eğer proje içindeki veritabanı etkileşimi yapan tüm servisler, ORM katmanları veya sorgu modülleri bu dosyadaki tipleri kullanmazsa, projede yaygın tip tutarsızlıkları oluşur, veritabanı ile alışverişi yapılan verilerin doğruluğu hiçbir şekilde garanti edilemez.
[Aksiyom 4]: Eğer bu dosyadaki tip tanımları güncellendikten sonra bu tipleri kullanan tüm bağımlı modüller uyumlu şekilde güncellenmezse, derleme zamanı tip uyumsuzluğu hataları veya çalışma zamanında beklenmedik veri hataları meydana gelir.

---



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
Analiz edilen kaynak dosya `C:\Users\alize\venthub-hvac\src\types\database.ts` üzerinde herhangi bir fonksiyon gövdesi, sınıf yöntemi veya çalıştırılabilir mantık bloğu tanımlanmamıştır. Dosyada sadece `./database.types` konumlu modülden `Database` tipinin import işlemi bulunmaktadır, başka değişken, API çağrısı, return ifadesi veya işlem adımı kaydedilmemiştir.

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