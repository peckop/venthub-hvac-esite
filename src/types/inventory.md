---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\inventory.ts
skeleton_hash: e42c63a5e284355e
entity_hashes:
  overview: 8013fdfdc560f88e
generated_at: 2026-06-08T08:57:37Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde envanter yönetimiyle ilgili veri yapılarını tanımlayan merkezi bir TypeScript tip deposudur. Supabase veritabanından gelen `Category` tipini ve admin paneli ortak tiplerinden `Density` ile `LoadState` tiplerini içe aktararak, envanter satırları (`InventoryRow` yapısı) ve ilgili diğer veri modelleri için proje genelinde tutarlı ve güvenli tip tanımları sunar. Dosyada herhangi bir fonksiyon, sabit veya çalıştırılabilir kod bulunmamakta olup, tamamen derleme zamanı tip güvenliği ve veri şeması uyumu sağlamak amacıyla varlık gösterir.

## Modül Yapısı ve Sorumluluk
Bu dosya salt tip tanımı (type definition) modülüdür. Ana sorumluluğu, envanter verilerinin farklı katmanlarda (API çağrıları, bileşenler, veri işleme mantığı) kullanılırken uyulması gereken yapıyı ve veri tiplerini tek bir merkezi noktada tanımlamaktır. Bu sayede envanter ile ilgili tüm veri akışlarının tipsel olarak doğrulanması ve hata oluşumu en aza indirilmesi hedeflenir. Doğru çalışması, tanımlı tiplerin gerçek Supabase tablo şeması ve uygulama ihtiyaçlarıyla uyumlu olmasına bağlıdır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül salt bir TypeScript tip tanımı (type definition) modülüdür. Doğru çalışması için aşağıda listelenen koşulların varolması gerekir; aksi takdirde derleme zamanı hataları oluşur.

[Aksiyom 1]: Eğer `Category` tipi (Supabase veritabanından içe aktarılan) doğru tanımlanmamış veya erişilebilir değilse, `InventoryRow` ve türevi yapılar oluşamaz ve projenin envanter ile ilgili tüm derleme zamanı tip güvenliği bozulur.

[Aksiyom 2]: Eğer `Density` ve `LoadState` tipleri (admin paneli ortak tiplerinden içe aktarılan) doğru tanımlanmamış veya erişilebilir değilse, modülün sunduğu ortak tip tanımları tutarsız olur ve bu tipleri kullanan tüm modüllerde derleme zamanı hataları meydana gelir.

[Aksiyom 3]: Eğer modül, salt tip tanımları içermek yerine herhangi bir işlevsel kod veya çalışma zamanı bağımlılığı eklerse, projenin derleme zamanı odaklı tasarım ilkesi ihlal edilir ve modülün saf amacı (merkezi tip deposu olmak) bozulur.

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

Bu dosya (`inventory.ts`) bir **Tür Tanımlama (Type Definition)** dosyasıdır. Fonksiyon gövdeleri, fonksiyon imzaları ve class tanımları içermemektedir. Sadece import edilen türler (`Category`, `Density`, `LoadState`) referans olarak yer almaktadır.

Dosyada analiz edilecek herhangi bir fonksiyon bulunmamaktadır.

| Durum | Açıklama |
|-------|----------|
| Fonksiyon Sayısı | 0 |
| Import | `Category` (./ui-models), `Density`, `LoadState` (./admin-shared) |
| Sabit | Yok |
| Class | Yok |
| AST Pointer | Oluşturulacak fonksiyon yok |

---

## NODE ID STANDARD

  file: src\types\inventory.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryRow
  export: ReservedRow
  export: SortKey
  export: VisibleCols