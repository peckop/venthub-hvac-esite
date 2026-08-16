---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\lib\admin\returnStatusMachine.ts
skeleton_hash: 4524368751fb4e7f
entity_hashes:
  func:allowedNextStatuses: c5a64be7cb890a38
  overview: eb1dc3e13feb0c1b
generated_at: 2026-08-16T05:20:52Z
---

## Genel Bakış
İade süreçleri için durum makinesi modülüdür. Mevcut iade durumuna göre bir sonraki adımda geçilebilecek izin verilen durumları hesaplar ve döndürür. İade iş akışının durum geçiş kurallarını merkezi olarak yönetir.

## Fonksiyon Grupları
### Durum Geçiş Kuralları
İade sürecinin izin verilen durum geçişlerini tanımlar ve mevcut duruma göre olası bir sonraki durumları belirler.
- `allowedNextStatuses`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, return (iade) durum makinesi için mevcut durumdan izin verilen sonraki durumları hesaplar. `TRANSITIONS` sabitinde tanımlı geçiş kurallarına dayanır.

**[Aksiyom 1]**: Eğer `TRANSITIONS` sabiti tanımlı değilse veya erişilemezse, `allowedNextStatuses` fonksiyonu çalışamaz ve geçerli durum listesi üretilemez.

**[Aksiyom 2]**: Eğer `current` parametresi, `TRANSITIONS` nesnesinde anahtar (key) olarak mevcut değilse, fonksiyon boş dizi (`[]`) döndürür.

**[Aksiyom 3]**: Eğer `TRANSITIONS` bir durum için boş bir diziye sahipse (geçiş yok), o durumdan çıkış izni olmayan terminal/nihai bir durumdur — fonksiyon boş dizi döndürür.

**[Aksiyom 4]**: Eğer `current` boş string (`""`) olarak verilirse ve `TRANSITIONS` içinde böyle bir anahtar yoksa, sonuç boş dizi olur.

**[Aksiyom 5]**: Fonksiyon her zaman `string[]` (dizi) döndürür — null veya undefined değil.

---

## FONKSİYON DETAYLARI

### allowedNextStatuses
**Ne yapar**: Verilen mevcut statüye göre izin verilen sonraki statülerin listesini döndürür. Bilinmeyen veya tanımsız bir statü verildiğinde boş bir dizi döner; bu durum statünün kilitli olduğunu ve ileri geçiş yapılamayacağını gösterir.

**Nasıl yapar**: `TRANSITIONS` adlı harita nesnesinde `current` parametresini anahtar olarak kullanarak ilgili statünün geçebileceği hedef statüleri bulur. `??` (nullish coalescing) operatörü ile anahtar bulunamazsa varsayılan olarak boş dizi (`[]`) kullanılır. Bulunan dizi `...` (spread) operatörü ile kopyalanarak orijinal `TRANSITIONS` yapısının dışarıdan değiştirilmesi engellenir.

**Parametreler**:
- `current`: `string` — Mevcut durum/akış adımını temsil eden statü dizesi. Bu değer, `TRANSITIONS` haritasında bir anahtar olarak aranır.

**Dönüş**: `string[]` — Verilen `current` statüsünden geçilebilecek izin verilen hedef statülerin dizisi. Tanımsız bir statü verilirse boş dizi (`[]`) döner.

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

### [N1_NASIL] AST Pointer: src/lib/admin/returnStatusMachine.ts::allowedNextStatuses
- **params**: `current: string` — mevcut durum değerini temsil eder, TRANSITIONS nesnesinde hangi durumun izin verilen sonraki durumlarını aratacağını belirtir
- **ic_degiskenler**:
  (fonksiyon gövdesinde değişken tanımlanmamıştır; doğrudan ifade döndürülür)
- **Erisilen Sabitler**:
  - `TRANSITIONS` — modül seviyesinde tanımlı durum geçiş sözlüğü/nesnesi
  - `TRANSITIONS[current]` — mevcut duruma karşılık gelen izin verilen sonraki durumlar dizisi (bulunamazsa `undefined`)
  - `?? []` — nullish coalescing operatörü; `TRANSITIONS[current]` boş/null/undefined ise boş dizi kullanılır
- **Dönüş**: `string[]` — `current` durumundan geçilebilecek izin verilen sonraki durumların dizisi; her çağrıda TRANSITIONS dizisinin浅 kopyasını (spread) döndürerek orijinal diziyi korur

---

## NODE ID STANDARD

  file: src\lib\admin\returnStatusMachine.ts
  function: src\lib\admin\returnStatusMachine.ts::allowedNextStatuses

---

## DISA AKTARILANLAR (EXPORTS)
  export: ReturnStatus
  export: allowedNextStatuses