---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\lib\admin\returnStatusMachine.ts
skeleton_hash: 5ce707b066c93a43
entity_hashes:
  func:allowedNextStatuses: c5a64be7cb890a38
  overview: eb1dc3e13feb0c1b
generated_at: 2026-08-25T07:27:50Z
---

## Genel Bakış
Bu modül, iade (return) sürecindeki durum geçişlerini tanımlayan bir durum makinesidir. Modül, mevcut bir durumdan hangi durumlara geçiş yapılabileceğini belirleyen kuralları içerir. Modülün tek bir dışa açık fonksiyonu vardır.

## Fonksiyon Grupları

### Durum Geçiş Kuralları
Mevcut iade durumuna göre bir sonraki adımda geçiş yapılabilecek durumların listesini döndürür. Bu fonksiyon, iade sürecindeki yasal durum geçişlerini denetlemek için kullanılır.
- allowedNextStatuses

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir "return" (iade) nesnesinin yaşam döngüsündeki durum geçişlerini tanımlayan bir durum makinesidir.

[Aksiyom 1]: Eğer `TRANSITIONS` sabiti tanımlı değilse, `allowedNextStatuses` fonksiyonu çalışamaz; çünkü izin verilen geçişler bu nesneden okunmaktadır.

[Aksiyom 2]: Eğer `current` parametresi `TRANSITIONS` nesnesinde tanımlı bir anahtar değilse, fonksiyonun davranışı belirsizdir; bilinmiyor hangi değeri döndüreceği.

[Aksiyom 3]: Eğer `TRANSITIONS` nesnesinin değerleri `string[]` tipinde değilse, fonksiyonun dönüş tipi `string[]` garanti edilemez.

---

## FONKSİYON DETAYLARI

### allowedNextStatuses
**Ne yapar**: Verilen mevcut statü (current) değerinden geçiş yapılabilecek izin verilen sonraki statülerin listesini döndürür. Eğer bilinmeyen veya tanımsız bir statü verilirse boş bir dizi döner; bu durum o statünün kilitli olduğunu ve ileri yönlü herhangi bir geçişe izin verilmediğini gösterir.

**Nasıl yapar**: `TRANSITIONS` adlı bir sabit (muhtemelen bir nesne/dictionary yapısı) üzerinden verilen `current` anahtarına karşılık gelen dizi değerini alır. Nullish coalescing operatörü (`??`) kullanılarak, `current` anahtarı `TRANSITIONS` içinde bulunamazsa yerine boş bir dizi (`[]`) atanır. Spread operatörü (`...`) ile bulunan dizi kopyalanarak yeni bir dizi olarak döndürülür; bu sayede orijinal `TRANSITIONS` yapısı değiştirilmemiş olur.

**Parametreler**:
- current: `string` — Geçerli mevcut statü değerini temsil eder. Bu değer `TRANSITIONS` yapısında bir anahtar olarak aranır.

**Dönüş**: `string[]` — Verilen mevcut statüden geçiş yapılabilecek izin verilen sonraki statülerin dizisidir. Eğer `current` değeri `TRANSITIONS` yapısında tanımlı değilse boş bir dizi (`[]`) döner.

---

## TYPE ALIASES

### ReturnStatus
Bilinen iade statüleri (DB `venthub_returns.status`).
```typescript
type ReturnStatus = | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded'
  | 'cancelled'
```

---

## SABİTLER
- **TRANSITIONS** (object) — `{
  requested: ['approved', 'rejected', 'cancelled'],
  approved: ['in_tran...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: returnStatusMachine.ts::allowedNextStatuses
- **params**:
  - `current` — mevcut durumu temsil eden string değer; `TRANSITIONS` objesinde anahtar olarak kullanılır
- **ic_degiskenler**:
  - `TRANSITIONS` — dosya seviyesinde tanımlı sabit obje; durum geçiş haritasını tutar, `current` anahtarıyla erişilir
  - `TRANSITIONS[current]` — `current` durumuna karşılık gelen izin verilen sonraki durum dizisini getirir; bulunamazsa `undefined` döner
  - `??` — nullish coalescing operatörü; `TRANSITIONS[current]` değeri `undefined` veya `null` ise boş dizi `[]` kullanılır
  - `[...]` — spread operatörü; bulunan dizi (veya boş dizi) kopyalanarak yeni bir `string[]` oluşturulur
- **Dönüş**: `string[]` — `current` durumdan geçiş yapılabilecek izin verilen sonraki durumların dizisi; eşleşme yoksa boş dizi döner

---

## NODE ID STANDARD

  file: returnStatusMachine.ts
  function: returnStatusMachine.ts::allowedNextStatuses

---

## DISA AKTARILANLAR (EXPORTS)
  export: ReturnStatus
  export: allowedNextStatuses