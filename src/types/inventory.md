---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\inventory.ts
skeleton_hash: b6300d6fc404b991
entity_hashes:
  overview: 0673781afc683fb3
generated_at: 2026-05-28T22:38:41Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin envanter yönetim sistemi için merkezi TypeScript tip tanımlarını barındıran bir tür deposudur. Supabase veritabanından gelen `Category` tipini, admin paneli ortak tiplerinden `Density` ve `LoadState` tiplerini içe aktararak envanter verilerinin proje genelinde güvenli ve tutarlı bir şekilde işlenmesini sağlar. Herhangi bir işlev, sabit veya çalıştırılabilir kod içermeyen bu dosya, tamamen derleme zamanı tip güvenliği amacıyla var olur ve `InventoryRow` gibi envanter satır yapılarının tanımını merkezileştirir.

## Modül Yapısı
Bu dosya salt tip tanımı (type definition) modülüdür — çalışabilir fonksiyon veya modül-seviyesi executable kod barındırmaz. Sunduğu tipler, projenin envanter ile ilgili tüm katmanlarında (API çağrıları, bileşen prop'ları, veri işleme) kullanılarak veri akışının tipsel olarak doğrulanmasını mümkün kılar. Doğru çalışması, projenin TypeScript yapılandırmasında doğru yola sahip olmasına ve gerçek envanter veri şemasıyla uyumlu olmasına bağlıdır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

**Gerekçe:** Bu modül (`inventory.ts`) yalnızca TypeScript tip tanımları içeren bir type-definition dosyasıdır. Fonksiyon gövdesi, çalıştırılabilir kod veya sabit içermemektedir. Verilen modül imzası listesi de boş (yok) olarak belirtilmiştir. Aksiyomlar yalnızca fonksiyon gövdelerinden üretilebildiği ve docstring/yorum/variable isminden bilgi çıkarılamayacağı için, bu modül için mimari varsayım türetilmemiştir.

**Not:** Bu modülün gerçek anlamda işlevsel olabilmesi için şu **dolaylı bağımlılıklar** (fonksiyon gövdesinden üretilmeyen, dış kaynak notları olarak sunulan) söylenebilir:
- Supabase veritabanı tarafındaki ilgili tablo tanımlarının var olması gerekir
- `admin` panelinden içe aktarılan tip tanımlarının (`yoğunluk`, `yük durumu`) var olması gerekir

Ancak bu bilgiler modülün kendi fonksiyon gövdesinden türetilmediği için aksiyom formatına dahil edilmemiştir.

---

## FONKSİYON DETAYLARI

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

Bu dosyada fonksiyon gövdesi bulunmamaktadır.

---

## NODE ID STANDARD

  file: src\types\inventory.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryRow
  export: ReservedRow
  export: SortKey
  export: VisibleCols