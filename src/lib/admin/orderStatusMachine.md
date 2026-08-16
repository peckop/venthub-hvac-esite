---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\lib\admin\orderStatusMachine.ts
skeleton_hash: 51582b8e8d32543b
entity_hashes:
  func:allowedNextOrderStatuses: 221ca6e8684b547c
  func:canTransitionOrder: 8a458e539fece6a8
  overview: 94cd02ee81a21baa
generated_at: 2026-08-16T05:20:38Z
---

## Genel Bakış
Bu modül, sipariş durumu makinelerinin (state machine) geçiş kurallarını yönetmek için temel yardımcı fonksiyonlar sunar. Amacı, bir siparişin bulunduğu mevcut durumdan izin verilen sonraki durumları belirlemek ve belirli bir durum geçişinin geçerliliğini kontrol etmektir. Bu, sipariş yönetim akışının tutarlı ve kurallara uygun şekilde ilerlemesini sağlayan merkezi bir bileşendir.

## Fonksiyon Grupları
### Sipariş Durumu Geçiş Kuralları
Bu grup, sipariş durumları arasındaki izin verilen geçişleri tanımlar ve doğrular.
- allowedNextOrderStatuses, canTransitionOrder

---

## AXIOMS – Mimari Varsayımlar

Bu modül, sipariş durumları arası geçiş kurallarını yöneten bir durum makinesi (state machine) içerir.

---

**[Aksiyom 1]:** `current` parametresi olarak verilen string, `TRANSITIONS` objesinde tanımlı bir durum anahtarı olmalıdır.
**Eğer** `current` değeri `TRANSITIONS` objesinde bir key olarak mevcut değilse, `allowedNextOrderStatuses` boş bir dizi döndürür veya tanımsız davranış oluşur.

**[Aksiyom 2]:** `TRANSITIONS` objesi, her bir durum için izin verilen bir sonraki durumların listesini içermelidir.
**Eğer** `TRANSITIONS` tanımlı değilse veya bir durum anahtarı eksikse, geçiş kontrolü tutarsız sonuçlar üretir.

**[Aksiyom 3]:** `canTransitionOrder(current, next)` fonksiyonu, `TRANSITIONS[current]` içinde `next` değerinin varlığını kontrol eder.
**Eğer** `next` değeri `TRANSITIONS[current]` listesinde bulunmuyorsa, `false` döner.

**[Aksiyom 4]:** `allowedNextOrderStatuses` fonksiyonu sadece `TRANSITIONS` objesindeki tanımlı durumlar için anlamlı sonuç döner.
**Eğer** tanımsız bir durum字符串i girilirse, boş dizi (`[]`) veya beklenmeyen sonuç döner.

**[Aksiyom 5]:** `OrderBoardStatus` tipi ile `TRANSITIONS` objesinde kullanılan durum stringleri aynı domain'de olmalıdır.
**Eğer** tip ile runtime değerleri uyuşmazsa, TypeScript derleme zamanında hata vermez ama runtime'da tutarsızlık oluşur.

---

> **Not:** Bu aksiyomlar sadece fonksiyon imzaları ve `TRANSITIONS` sabit yapısından türetilmiştir. Belirli durum isimleri (örn: "pending", "shipped") veya geçiş kuralları modül içeriğinden çıkarılmamıştır.

---

## FONKSİYON DETAYLARI

### allowedNextOrderStatuses
**Ne yapar**: Verilen bir sipariş durumundan (current) izin verilen sonraki durumların listesini döndürür. Eğer verilen durum bilinmiyor veya tanımsız ise, geçiş izni verilmeyen (kilitli) durumu temsil eden boş bir dizi döner.

**Nasıl yapar**: Fonksiyon, dışarıda tanımlı bir `TRANSITIONS` haritasını kullanır. `current` parametrelerini bir `OrderBoardStatus` türüne dönüştürerek bu haritada bir anahtar olarak arar. Haritada karşılık gelen bir değer varsa, o değer bir dizi içinde döndürülür; `??` (nullish coalescing) operatörü ile haritada anahtar bulunamazsa boş bir dizi (`[]`) kullanılır. Döndürülen dizi, orijinal `TRANSITIONS` değerinin bir kopyasıdır, böylece dışarıdan değiştirilmesi engellenir.

**Parametreler**:
- `current`: `string` — Sorgulanan mevcut sipariş durumunu temsil eden metin dizesi. Fonksiyon içinde `OrderBoardStatus` türüne zorunlu dönüşüm (`as`) yapılarak kullanılır.

**Dönüş**: `OrderBoardStatus[]` — `current` durumundan izin verilen sonraki durumların dizisi. Tanımsız bir durum sorgulanırsa boş dizi döner.

### canTransitionOrder
**Ne yapar**: Belirli bir mevcut durumdan (`current`) hedef duruma (`next`) geçişin izinli olup olmadığını kontrol eder. Genellikle sürükle-bırak arayüzündeki geçiş kapılarını doğrulamak ve veri mutasyonları öncesi güvenlik kontrolleri için kullanılır.

**Nasıl yapar**: `allowedNextOrderStatuses` fonksiyonunu `current` parametresiyle çağırarak izin verilen sonraki durumların listesini alır. Ardından, `next` parametresini `OrderBoardStatus` türüne dönüştürerek (dizeyi tür güvenli bir değere çevirir) bu listede (`includes` metoduyla) olup olmadığını kontrol eder. Sonuç olarak bir mantıksal değer (`true`/`false`) döner.

**Parametreler**:
- `current`: `string` — Geçişin başlatıldığı mevcut sipariş durumunu temsil eden metin dizesi.
- `next`: `string` — Hedeflenen veya gidilmek istenen sipariş durumunu temsil eden metin dizesi. Fonksiyon içinde `OrderBoardStatus` türüne zorunlu dönüşüm (`as`) yapılarak kullanılır.

**Dönüş**: `boolean` — Geçiş izinliyse `true`, izin verilmeyen veya tanımsız bir geçiş ise `false` döner.

---

## TYPE ALIASES

### OrderBoardStatus
Kanban'ın kullandığı efektif statüler (DB status + ödeme kaynaklı türevler).
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
  pending: ['confirmed', 'cancelled'],
  paid: ['confirmed', 'cancelled'],
...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/admin/orderStatusMachine.ts::allowedNextOrderStatuses
- **params**: `current: string` — geçerli sipariş durumu anahtarı
- **ic_degiskenler**: (yok — fonksiyon gövdesinde yerel değişken tanımlanmamış)
- **Kullanım**: `TRANSITIONS[current as OrderBoardStatus]` — TRANSITIONS nesnesinde mevcut duruma karşılık gelen izin verilen sonraki durumlar dizisi alınır; `??` operatörü ile `undefined`/`null` durumunda boş dizi fallback yapılır; spread (`...`) ile kopyalanarak yeni dizi döndürülür
- **Dönüş**: `OrderBoardStatus[]` — current durumundan geçilebilecek izin verilen durumların dizisi

### [N2_NASIL] AST Pointer: src/lib/admin/orderStatusMachine.ts::canTransitionOrder
- **params**: `current: string` — geçerli sipariş durumu anahtarı, `next: string` — hedeflenen sipariş durumu anahtarı
- **ic_degiskenler**: (yok — fonksiyon gövdesinde yerel değişken tanımlanmamış)
- **Kullanım**: `allowedNextOrderStatuses(current)` — mevcut durumdan izin verilen sonraki durumlar alınır; `.includes(next as OrderBoardStatus)` — hedef durumun izin verilenler listesinde olup olmadığı kontrol edilir
- **Dönüş**: `boolean` — current'dan next'e geçişin izinli olup olmadığı

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