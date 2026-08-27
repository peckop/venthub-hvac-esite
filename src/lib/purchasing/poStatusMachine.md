---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\purchasing\poStatusMachine.ts
skeleton_hash: 52256c2929a9bed6
entity_hashes:
  func:allowedNextPoStatuses: 61761b9e31de6aa0
  func:isManualPoTransitionAllowed: daf7d6e4e1f8e07b
  overview: b2ca3afe0384f93f
generated_at: 2026-08-27T06:57:44Z
---

## Genel Bakış

Bu modül, satın alma siparişlerinin (Purchase Order) durum geçişlerini tanımlayan ve denetleyen bir durum makinesidir. Modül, mevcut bir PO durumundan hangi durumlara geçilebileceğini sorgulamayı ve belirli bir manuel geçişin izinli olup olmadığını doğrulamayı sağlar.

## Fonksiyon Grupları

### Durum Geçiş Denetimi
PO yaşam döngüsündeki durum geçişlerini sorgulamak ve doğrulamakla sorumludur. Mevcut duruma bağlı olarak izinli hedef durumları listeler ve belirli bir geçişin kurallara uygun olup olmadığını kontrol eder.

- allowedNextPoStatuses
- isManualPoTransitionAllowed

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### allowedNextPoStatuses
**Ne yapar**: Bir satın alma siparişinin (purchase order) mevcut durumundan geçiş yapabileceği geçerli sonraki durumları döndürür. Mevcut durum bilinmiyorsa veya terminal (ileri geçiş yapılamayan) bir durumdaysa boş bir dizi döndürür.

**Nasıl yapar**: `TRANSITIONS` adlı sabit yapıdan (muhtemelen bir harita/nesne) `current` anahtarına karşılık gelen geçerli durum dizisini alır. Nullish coalescing operatörü (`??`) kullanılarak, `current` anahtarı `TRANSITIONS` içinde bulunamazsa boş bir dizi (`[]`) kullanılması sağlanır. Sonuç, spread operatörü (`...`) ile yeni bir diziye kopyalanarak döndürülür; bu sayede orijinal `TRANSITIONS` yapısı değiştirilmemiş olur.

**Parametreler**:
- `current`: `string` — Satın alma siparişinin mevcut durumunu temsil eden durum dizesi.

**Dönüş**: `string[]` — Mevcut durumdan geçiş yapılabilecek izin verilen sonraki durumların dizisi. Durum bilinmiyorsa veya terminal durumdaysa boş dizi döner.

### isManualPoTransitionAllowed
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## TYPE ALIASES

### PoStatus
Bilinen PO statüleri (DB `purchase_orders.status`).
```typescript
type PoStatus = | 'draft'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'closed'
  | 'cancelled'
```

---

## SABİTLER
- **PO_STATUSES** (array) — `[
  'draft',
  'ordered',
  'partially_received',
  'received',
  'close...`
- **TRANSITIONS** (object) — `{
  draft: ['ordered', 'cancelled'],
  ordered: ['partially_received', 'rec...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/purchasing/poStatusMachine.ts::allowedNextPoStatuses
- **params**: `current` (string) — mevcut sipariş durumu
- **ic_degiskenler**:
  - `TRANSITIONS[current]` — TRANSITIONS nesnesinden `current` anahtarına karşılık gelen dizi; spread operatörü ile yüzeysel kopya alınır
  - `?? []` — nullish coalescing; `TRANSITIONS[current]` undefined veya null ise boş dizi kullanılır
- **Dönüş**: `string[]` — `current` durumundan geçiş yapılabilecek izinli durumların kopyası

### [N2_NASIL] AST Pointer: src/lib/purchasing/poStatusMachine.ts::isManualPoTransitionAllowed
- **params**: `current` (string) — mevcut sipariş durumu, `next` (string) — hedef sipariş durumu
- **ic_degiskenler**:
  - `DERIVED_STATUSES` — `readonly string[]` olarak cast edilen sabit; `next` bu dizide yer alıyorsa fonksiyon `false` döner ve erken çıkış yapar
  - `next` — hem DERIVED_STATUSES hem allowedNextPoStatuses sonuçlarıyla `.includes()` ile eşleşme kontrolüne tabi tutulur
  - `allowedNextPoStatuses(current)` — N1 fonksiyonu çağrılarak `current` durumundan izinli geçişler alınır; dönen dizide `next` var mı kontrol edilir
- **Dönüş**: `boolean` — `next` bir türetilmiş durum değilse ve `current` durumundan izinli geçişler arasında yer alıyorsa `true`, aksi halde `false`

---

## NODE ID STANDARD

  file: src\lib\purchasing\poStatusMachine.ts
  function: src\lib\purchasing\poStatusMachine.ts::allowedNextPoStatuses
  function: src\lib\purchasing\poStatusMachine.ts::isManualPoTransitionAllowed

---

## DISA AKTARILANLAR (EXPORTS)
  export: PO_STATUSES
  export: PoStatus
  export: allowedNextPoStatuses
  export: isManualPoTransitionAllowed