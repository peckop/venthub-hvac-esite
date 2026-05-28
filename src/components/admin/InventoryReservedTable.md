---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryReservedTable.tsx
skeleton_hash: 83eea5dd1bd8d79e
entity_hashes:
  func:InventoryReservedTable: 126336fe1c94b592
  overview: e173f7662e40b92c
  style_tokens: 45cb66bf7519a761
generated_at: 2026-05-28T22:35:35Z
---

## Genel Bakış
`InventoryReservedTable` bileşeni, yönetim panelinde rezerve edilmiş siparişlerin listelendiği bir tabloyu render eder. Gelen `reservedOrders` propunu alır, tablo başlıklarını ve satırlarını oluşturur, ayrıca boş veri durumları ve yükleme/hataya karşı temel UI geri bildirimlerini sağlar.

## Fonksiyon Grupları
### UI Render & Layout
Bu grup, tablo yapısını, başlık satırını ve her bir rezerve sipariş satırını JSX içinde oluşturur.  
- InventoryReservedTable

### Veri Hazırlama & Durum Kontrolü
Bu grup, `reservedOrders` propunun varlığını, boş olup olmadığını ve olası hata/boş veri senaryolarını kontrol eder; UI’nın hangi duruma göre gösterileceğine karar verir.  
- InventoryReservedTable

---

## AXIOMS – Mimari Varsayımlar
Bu modül için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `reservedOrders` prop'u sağlanmazsa, bileşen derleme zamanında TypeScript hatası verir veya çalışma zamanında `undefined` değeri nedeniyle render sırasında hata olur.  
[Aksiyom 2]: Eğer `reservedOrders` `null` veya `undefined` ise, bileşen `.length` özelliğine erişmeye çalıştığı için çalışma zamanı hatası olur.  
[Aksiyom 3]: Eğer `reservedOrders` boş bir dizi (`[]`) ise, bileşen boş veri durumu UI'sini render eder.  
[Aksiyom 4]: Eğer `reservedOrders` bir dizi tipi değilse (örneğin string, obje), bileşen `.length` veya `.map` gibi dizi metodlarına erişmeye çalıştığı için beklenmeyen davranış veya hata olur.

---

## FONKSİYON DETAYLARI

### InventoryReservedTable
**Ne yapar**: Rezervasyon alınan siparişlerin bir tablosunu görüntüler.  
**Nasıl yapar**: `reservedOrders` prop'undan gelen veriyi alıp, her bir sipariş için tablo satırı oluşturur ve bu satırları bir JSX tablosu içinde render eder.  
**Parametreler**:
- reservedOrders: InventoryReservedTableProps — Görüntülenecek rezervasyon siparişlerinin veri yapısı (genellikle bir dizi ve ilgili meta bilgiler içerir).  
**Dönüş**: void — Fonksiyon bir JSX elementi döndürür; açık bir değer döndürmez.

---

## INTERFACES

### InventoryReservedTableProps
- `reservedOrders: ReservedRow[]`

---

## TYPE ALIASES

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

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryReservedTable.tsx::InventoryReservedTable
- **params**: reservedOrders
- **ic_degiskenler**: 
  - `reservedOrders` — prop containing array of reserved order objects, used to check length and map over.
- **Dönüs**: JSX.Element

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InventoryReservedTable.tsx::InventoryReservedTable.map callback
- **params**: ro
- **ic_degiskenler**: 
  - `ro` — each reserved order object with `order_id`, `created_at`, and `quantity` properties.
- **Dönüs**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\admin\InventoryReservedTable.tsx
  function: src\components\admin\InventoryReservedTable.tsx::InventoryReservedTable

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryReservedTable
  export: ReservedRow

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-transparent`, `bg-white/2`, `border-b`, `border-separate`, `border-spacing-0`, `border-white/5`, `group-last:border-0`, `hover:bg-white/2`, `text-cyan-400`, `text-left`, `text-right`, `text-slate-300`, `text-slate-500`, `text-xs`
- **Layout:** `overflow-hidden`, `w-full`
- **Varyant/Responsive:** `group-last:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `font-black`, `font-bold`, `font-mono`, `group`, `px-4`, `py-3`, `tracking-tighter`, `transition-colors`, `uppercase`