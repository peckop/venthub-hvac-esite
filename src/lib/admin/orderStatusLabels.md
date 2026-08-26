---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\admin\orderStatusLabels.ts
skeleton_hash: 72e0e1d3bf819b01
entity_hashes:
  func:isOrderBoardStatus: 83f58a39bb062cc5
  func:orderStatusLabel: fd64fbe04de7c1df
  overview: 39e6e6fc2196bd21
generated_at: 2026-08-25T08:46:18Z
---

## Genel Bakış
Bu modül, sipariş durumlarıyla ilgili yardımcı işlevler sunar. Sipariş durumlarının sipariş tahtasına ait olup olmadığını denetler ve kullanıcı arayüzünde gösterilecek çevrilmiş durum etiketleri üretir.

## Fonksiyon Grupları

### Durum Doğrulama
Verilen bir değerin sipariş tahtası durumu olup olmadığını belirler; arayüzde tahtaya özgü mantığın uygulanıp uygulanmayacağını kararlaştırmak için kullanılır.
- isOrderBoardStatus

### Durum Etiketleme
Sipariş durumu bilgisini alır ve dışarıdan sağlanan çeviri fonksiyonunu kullanarak kullanıcıya gösterilecek okunabilir bir etiket döndürür. Durum null veya undefined ise buna uygun bir değer üretir.
- orderStatusLabel

### Dış Bağımlılıklar
- `orderStatusLabel` fonksiyonu, `t` parametresi aracılığıyla bir çeviri (Translate) fonksiyonuna bağlıdır. Bu bağımlılık dışarıdan sağlanır; modül kendi çeviri mantığını barındırmaz.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, sipariş durumu değerlerini etiketlere dönüştüren ve sipariş tahtası (board) durumlarını doğrulayan yardımcı fonksiyonlar içerir.

[Aksiyom 1]: Eğer `orderStatusLabel` fonksiyonuna `status` parametresi olarak `null` veya `undefined` geçilirse, fonksiyon gövdesinde bu durumun nasıl handle edildiği bilinmiyor; ancak imza bu değerlerin kabul edilebilir olduğunu gösterir.

[Aksiyom 2]: Eğer `t` (Translate) fonksiyonu sağlanmazsa, `orderStatusLabel` fonksiyonu çeviri yapamaz; bu durumda ne olacağı fonksiyon gövdesinde belirlenir.

[Aksiyom 3]: Eğer `isOrderBoardStatus` fonksiyonuna verilen `value` bir sipariş tahtası durumu değilse, fonksiyonun ne döndürdüğü fonksiyon gövdesinde belirlenir.

[Aksiyom 4]: Eğer `ORDER_STATUS_LABEL_KEYS` objesi veya `ORDER_STATUS_VALUES` ifadesi tanımlı değilse, bu sabitlere bağlı fonksiyonlar beklenen şekilde çalışamaz.

---

## FONKSİYON DETAYLARI

### isOrderBoardStatus
**Ne yapar**: Verilen string değerini sipariş yönetim paneli durum anahtarlarından biri olup olmadığını denetler. TypeScript type guard olarak tanımlıdır; başarılı eşleşme durumunda derleyiciye değerin `OrderBoardStatus` tipinde olduğunu bildirir.

**Nasıl yapar**: `Object.prototype.hasOwnProperty.call` yöntemini kullanarak `ORDER_STATUS_LABEL_KEYS` nesnesinde verilen `value` anahtarının tanımlı olup olmadığını kontrol eder. Bu yöntem, nesnenin prototip zincirindeki özellikleri değil, doğrudan kendi üzerindeki özellikleri denetler. Fonksiyonun dönüş tipi `value is OrderBoardStatus` olarak tanımlı olduğundan, `true` döndüğü durumda TypeScript derleyicisi bu değeri `OrderBoardStatus` tipiyle daraltır.

**Parametreler**:
- value: string — Durum anahtarının kontrol edileceği aday değer.

**Dönüş**: `value is OrderBoardStatus` — TypeScript type guard dönüşü. Mantıksal olarak `boolean` değer döndürür; `true` ise verilen değer geçerli bir sipariş yönetim paneli durumudur.

### orderStatusLabel
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ./orderStatusMachine::type { OrderBoardStatus }

---

## TYPE ALIASES

### Translate
```typescript
type Translate = (key: string, params?: Record<string, unknown>) => string
```

---

## SABİTLER
- **ORDER_STATUS_LABEL_KEYS** (object) — `{
  pending: 'admin.orders.statusLabels.pending',
  paid: 'admin.orders.sta...`
- **ORDER_STATUS_VALUES** (as_expression) — `Object.keys(ORDER_STATUS_LABEL_KEYS) as OrderBoardStatus[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/admin/orderStatusLabels.ts::isOrderBoardStatus
- **params**: `value: string`
- **ic_degiskenler**: yok
- **Dönüş**: `boolean` — `ORDER_STATUS_LABEL_KEYS` objesinde `value` anahtarının varlığını kontrol eder; type guard olarak `value is OrderBoardStatus` döner

### [N2_NASIL] AST Pointer: src/lib/admin/orderStatusLabels.ts::orderStatusLabel
- **params**: `status: string | null | undefined`, `t: Translate`
- **ic_degiskenler**:
  - `key` — `status` null veya undefined ise boş string, aksi halde `status`'un `.toLowerCase()` ile küçük harfe çevrilmiş hali; `isOrderBoardStatus` kontrolünde ve `ORDER_STATUS_LABEL_KEYS[key]` erişiminde kullanılır
- **Dönüş**: `string` — `key` geçerli bir `OrderBoardStatus` ise `t(ORDER_STATUS_LABEL_KEYS[key])`, değilse `t(ORDER_STATUS_UNKNOWN_KEY)` döner

---

## NODE ID STANDARD

  file: src\lib\admin\orderStatusLabels.ts
  function: src\lib\admin\orderStatusLabels.ts::isOrderBoardStatus
  function: src\lib\admin\orderStatusLabels.ts::orderStatusLabel

---

## DISA AKTARILANLAR (EXPORTS)
  export: ORDER_STATUS_LABEL_KEYS
  export: ORDER_STATUS_VALUES
  export: isOrderBoardStatus
  export: orderStatusLabel