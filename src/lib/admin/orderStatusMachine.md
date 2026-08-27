---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\admin\orderStatusMachine.ts
skeleton_hash: 3f66b0e1667490f2
entity_hashes:
  func:allowedNextOrderStatuses: aeafdd7e384021d1
  func:canTransitionOrder: b9d35825d6dc47f6
  overview: 94cd02ee81a21baa
generated_at: 2026-08-27T06:57:18Z
---

## Genel Bakış
Bu modül, sipariş durumları arasındaki geçiş kurallarını tanımlayan bir durum makinesi (state machine) yapısıdır. Siparişlerin hangi durumdan hangi duruma geçebileceğini kontrol eder ve geçiş izinlerini doğrular. Modül, sipariş yaşam döngüsünde geçerli durum akışını güvence altına alır.

## Fonksiyon Grupları

### Durum Geçiş Kontrolü
Sipariş durum geçişlerinin geçerliliğini sorgulayan fonksiyonları içerir. Mevcut bir durumdan yapılabilecek geçişleri listeler ve belirli bir geçişin izinli olup olmadığını denetler.
- allowedNextOrderStatuses, canTransitionOrder

---

## AXIOMS – Mimari Varsayımlar

Bu modül, sipariş durumları arasındaki geçişleri tanımlayan bir durum makinesi uygular. Fonksiyonların doğru çalışması için `TRANSITIONS` sabitinin tanımlı ve doğru yapılandırılmış olması gerekir.

[Aksiyom 1]: Eğer `TRANSITIONS` sabiti yoksa veya tanımlı değilse, `allowedNextOrderStatuses` ve `canTransitionOrder` fonksiyonları çalışamaz.

[Aksiyom 2]: Eğer `current` parametresi `TRANSITIONS` objesinde tanımlı bir anahtar değilse, `allowedNextOrderStatuses` fonksiyonu geçerli bir `OrderBoardStatus[]` dizisi döndüremez.

[Aksiyom 3]: Eğer `current` veya `next` parametreleri `TRANSITIONS` objesindeki geçerli durum anahtarlarıyla eşleşmiyorsa, `canTransitionOrder` fonksiyonu geçişin yapılıp yapılamayacağını doğru şekilde belirleyemez.

---

## FONKSİYON DETAYLARI

### allowedNextOrderStatuses
**Ne yapar**: Verilen bir sipariş durumundan (`current`) geçiş yapılabilecek izin verilen sonraki durumların listesini döndürür. Bilinmeyen veya tanımlanmamış bir durum verilmesi durumunda, boş bir dizi döndürerek geçişleri kilitler.
**Nasıl yapar**: Fonksiyon, `TRANSITIONS` adlı önceden tanımlanmış bir sabit nesneyi kullanır. Verilen `current` parametresini `OrderBoardStatus` tipine dönüştürerek bu nesnede arar. Eğer `current` için bir geçiş listesi tanımlıysa, o listeyi kopyalayarak döndürür; tanımlı değilse (`?? []` operatörü ile) boş bir dizi döndürür.
**Parametreler**:
- current: string — Geçiş yapılmak istenen mevcut sipariş durumu.
**Dönüş**: `OrderBoardStatus[]` — Mevcut durumdan geçiş yapılabilecek izin verilen sonraki durumların bir dizisi. Bilinen bir durum için tanımlı geçişlerin kopyası, bilinmeyen bir durum için boş dizi.

### canTransitionOrder
**Ne yapar**: İki sipariş durumu arasındaki geçişin (`current`'dan `next`'e) izinli olup olmadığını kontrol eder. Panonun sürükle-bırak arayüzü ve veri mutasyonu koruması gibi yerlerde geçiş izni sorgulamak için kullanılır.
**Nasıl yapar**: `allowedNextOrderStatuses` fonksiyonunu çağırarak mevcut durumdan (`current`) izin verilen tüm sonraki durumların listesini alır. Ardından, hedef durumu (`next`) bu listenin içerip içermediğini kontrol eder ve sonucu boolean olarak döndürür.
**Parametreler**:
- current: string — Mevcut sipariş durumu.
- next: string — Geçiş yapılmak istenen hedef sipariş durumu.
**Dönüş**: `boolean` — Geçiş izinli ise `true`, izinli değilse `false` döndürür.

---

## TYPE ALIASES

### OrderBoardStatus
Kanban'ın kullandığı **efektif** statüler. ⚠ BU BİR SSOT DEĞİL, **BİRLEŞİMDİR** (T111-VH ile açıkça yazıldı). Aşağıdaki dokuz değer İKİ AYRI DB kolonundan gelir: · `venthub_orders.status`         → pending · confirmed · processing · shipped · delivered · cancelled · `venthub_orders.payment_status` →
```typescript
type OrderBoardStatus = | 'pending'
  | 'paid'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'partial_refunded'
```

---

## SABİTLER
- **TRANSITIONS** (object) — `{
  pending: ['confirmed', 'cancelled', 'refunded', 'partial_refunded'],
  ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/admin/orderStatusMachine.ts::allowedNextOrderStatuses
- **params**: `current: string` — mevcut sipariş durumu
- **ic_degiskenler**:
  - `TRANSITIONS` — modül seviyesinde tanımlı sabit nesne; `current` parametresi `OrderBoardStatus` tipine cast edilerek anahtar olarak kullanılır
  - `current as OrderBoardStatus` — `current` parametresinin `OrderBoardStatus` tipine daraltılması; `TRANSITIONS` nesnesinde geçerli bir anahtar olmasını sağlar
  - `?? []` — nullish coalescing operatörü; `TRANSITIONS[current]` değeri `undefined` veya `null` ise boş dizi kullanılır
  - `[...]` — spread operatörü; bulunan diziyi kopyalayarak yeni bir dizi oluşturur
- **Dönüş**: `OrderBoardStatus[]` — izin verilen bir sonraki sipariş durumlarının dizisi

### [N2_NASIL] AST Pointer: src/lib/admin/orderStatusMachine.ts::canTransitionOrder
- **params**: `current: string` — mevcut sipariş durumu, `next: string` — hedef sipariş durumu
- **ic_degiskenler**:
  - `allowedNextOrderStatuses(current)` — aynı modüldeki fonksiyon çağrısı; `current` durumundan geçiş yapılabilecek durumların listesini döndürür
  - `next as OrderBoardStatus` — `next` parametresinin `OrderBoardStatus` tipine daraltılması; `.includes()` ile karşılaştırmada kullanılır
- **Dönüş**: `boolean` — `next` durumuna geçiş yapılabiliyorsa `true`, yapılamıyorsa `false`

---

## NODE ID STANDARD

  file: src\lib\admin\orderStatusMachine.ts
  function: src\lib\admin\orderStatusMachine.ts::allowedNextOrderStatuses
  function: src\lib\admin\orderStatusMachine.ts::canTransitionOrder

---

## DISA AKTARILANLAR (EXPORTS)
  export: OrderBoardStatus
  export: allowedNextOrderStatuses
  export: canTransitionOrder