---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryMovementHistory.tsx
skeleton_hash: b866bc2cf5b15d5f
generated_at: 2026-05-23T21:53:07Z
---

## Genel Bakış
`InventoryMovementHistory` bileşeni, yönetim panelinde envanter hareketlerinin zaman çizelgesini gösteren bir görünümdür. Gelen `movements` verisini alır ve bu veriyi okunabilir bir formatta listeler, böylece kullanıcılar geçmiş envanter değişikliklerini inceleyebilir.

## Fonksiyon Grupları
### Ana Bileşen Grubu
Bu grup, modülün tek işlevini yerine getirir; envanter hareket geçmişini UI olarak render eder.  
- InventoryMovementHistory

---

## AXIOMS – Mimari Varsayımlar
Bu modül, `movements` prop'una dayalı olarak çalışır; bu prop'un varlığı ve türü bileşenin doğru render edilmesi için kritiktir.

[Aksiyom 1]: Eğer `movements` prop'u tanımlı değilse (undefined), bileşen render sırasında `movements.map` gibi bir yöntem çağırarak çalışma zamanı hatası fırlatabilir.  
[Aksiyom 2]: Eğer `movements` prop'u bir dizi (iterable) değilse, `.map` veya benzeri yineleme işlevi başarısız olur ve bileşen hata verir.  
[Aksiyom 3]: Eğer `movements` dizisi boşsa, bileşen hiçbir hareket öğesi render etmez ve boş bir görünüm gösterir.  
[Aksiyom 4]: Eğer `movements` dizisindeki öğeler bileşenin görüntülemesi gereken veriyi (tarih, ürün, miktar vb.) içermiyorsa, bu eksik veriler undefined veya boş olarak görünebilir ve kullanıcıya eksik bilgi sunulur.

---

## FONKSIYON DETAYLARI

### InventoryMovementHistory
**Ne yapar**: Envanter hareketlerinin listesini görüntüleyen bir React bileşenidir.  
**Nasıl yapar**: `movements` prop'undan gelen verileri alıp, içindeki her bir hareket için uygun UI elemanları (örnek satır, kart vb.) oluşturur ve döndürür. Bileşenin iç mantığı, gelen veriyi iterate ederek her bir hareket için gerekli görsel öğeleri üretmektir.  
**Parametreler**:  
- movements: InventoryMovementHistoryProps — Gösterilecek envanter hareketlerinin koleksiyonu (tipi tanımlanmamış, ancak genellikle dizidir).  
**Dönüş**: void (React elementi döndürür; işlevsel bileşen olarak JSX üretir).

---

## INTERFACES

### Movement
- `id: string`
- `delta: number`
- `reason: string`
- `created_at: string`

### InventoryMovementHistoryProps
- `movements: Movement[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/InventoryMovementHistory.tsx::InventoryMovementHistory
- **params**: movements
- **ic_degiskenler**: 
  - `movements` — prop containing array of movement objects passed from parent component.
  - `m` — each movement item iterated over in the `.map` callback; used to access `m.id`, `m.created_at`, `m.reason`, and `m.delta`.
- **Dönüş**: JSX.Element | null (returns `null` when `movements.length === 0`, otherwise returns the rendered table JSX)

---

## NODE ID STANDARD

  file: src\components\admin\InventoryMovementHistory.tsx
  function: src\components\admin\InventoryMovementHistory.tsx::InventoryMovementHistory

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryMovementHistory
  export: Movement

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** (yok)
- **height:** (yok)
- **width:** `max-w-[140px]`
- **spacing:** (yok)
- **diğer:** `tracking-[0.2em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-transparent`, `bg-white/[0.02]`, `border-b`, `border-separate`, `border-spacing-0`, `border-white/5`, `text-emerald-400`, `text-left`, `text-right`, `text-rose-400`, `text-slate-300`, `text-slate-500`, `text-xs`
- **Layout:** `group-last:border-0`, `overflow-hidden`, `w-full`
- **Responsive:** (yok)
