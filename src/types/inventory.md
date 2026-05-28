---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\inventory.ts
skeleton_hash: b6300d6fc404b991
generated_at: 2026-05-23T22:33:05Z
---

## Genel Bakış
Bu TypeScript modülü, VentHub HVAC projesinin envanter yönetimi sistemi için gerekli ortak tür tanımlarını toplayan bir tür merkezidir. Envanterle ilgili tüm kodlarda tutarlı tip kullanımını sağlamak amacıyla Supabase veritabanı entegrasyonundan gelen kategori tipini, admin paneli ortak tiplerinden yoğunluk ve yük durumu tiplerini içe aktararak projenin ilgili tüm bölümlerine sunar. Herhangi bir çalıştırılabilir işlem, sabit ya da işlev barındırmayan bu modül, tamamen envanter işlemlerinin tip güvenliğini sağlamak için tasarlanmıştır.

---

## AXIOMS – Mimari Varsayımlar
Bu TypeScript tip tanımı (inventory.ts) modülü, VentHub HVAC projesinin envanter varlıkları için tip güvenliği sağlamak amacıyla kullanılır; doğru çalışması için TypeScript derleyicisi tarafından erişilebilir ve proje içindeki gerçek envanter veri yapılarıyla tutarlı olması gereklidir.

[Aksiyom 1]: Eğer TypeScript derleyicisi bu dosyaya proje yapılandırmasında (tsconfig vb.) tanımlı yol üzerinden erişemiyorsa, dosya içindeki tipleri kullanan tüm modüllerde derleme zamanı hatası oluşur.
[Aksiyom 2]: Eğer dosya içindeki tip tanımları, projedeki gerçek envanter veri yapısının formatıyla eşleşmiyorsa, TypeScript'in sağladığı tip güvenliği ortadan kalkar, çalışma zamanı veri uyumsuzluğu hataları meydana gelir.
[Aksiyom 3]: Eğer dosyada geçerli olmayan TypeScript sözdizimi (syntax hatası) varsa, projenin tamamı derlenemez.
[Aksiyom 4]: Eğer bu dosya projenin derleme ve paketleme zincirine dahil edilmemişse, üretim ortamında tipler referans gösterilemez, uygulama çalıştırılamaz.

---



---

## TYPE ALIASES

### InventoryRow
```typescript
type InventoryRow = {
    product_id: string;
    name: string;
    physical_stock: number;
    reserved_stock: number;
    available_stock: number;
    warehouse_location?: string | null;
    supplier_name?: stri
```

### SortKey
```typescript
type SortKey = 'name' | 'physical' | 'reserved' | 'available' | 'threshold' | 'status' | 'location' | 'supplier' | 'days_empty' | 'abc'
```

### ReservedRow
```typescript
type ReservedRow = {
    order_id: string;
    created_at: string;
    status: string;
    payment_status: string | null;
    quantity: number
}
```

### VisibleCols
```typescript
type VisibleCols = {
    name: boolean;
    physical: boolean;
    reserved: boolean;
    available: boolean;
    threshold: boolean;
    status: boolean;
    location: boolean;
    supplier: boolean;
    abc: 
```

---

## AST POINTERS
İlişkili kaynak dosyası `C:\Users\alize\venthub-hvac\src\types\inventory.ts` içerisinde analiz edilecek herhangi bir fonksiyon gövdesi, sınıf metodu veya çağrılabilir varlık tanımlı değildir. Dosyada yalnızca tip importları bulunmaktadır:
- `../lib/supabase` modülünden import edilen `Category` tipi
- `./admin-shared` modülünden import edilen `Density` ve `LoadState` tipleri

---

## NODE ID STANDARD

  file: src\types\inventory.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryRow
  export: ReservedRow
  export: SortKey
  export: VisibleCols