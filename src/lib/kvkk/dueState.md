---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\kvkk\dueState.ts
skeleton_hash: b086f545a664056d
entity_hashes:
  func:computeDueState: 654130d80b0a082a
  func:isTerminalStatus: 804d60cc46a3141a
  overview: e8d1766ba7090536
generated_at: 2026-08-25T08:44:13Z
---

## Genel Bakış

Bu modül, KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında takip edilen işlemlerin son tarih durumlarını (due state) hesaplamak için kullanılır. Bir işlemin terminal (sonlanma) durumda olup olmadığını sorgulama ve mevcut tarih bilgisine göre sürecin ne aşamada olduğunu belirleme işlevlerini sağlar.

## Fonksiyon Grupları

### Durum Kontrol Fonksiyonları
Verilen bir durum değerinin sürecin sonlanmış bir durum olup olmadığını belirler. Bu kontrol, sürecin aktif mi yoksa kapanmış mı olduğunu anlamak için kullanılır.
- isTerminalStatus

### Durum Hesaplama Fonksiyonları
Bir KVKK işlem kaydı ve güncel tarih bilgisini alarak sürecin son tarih açısından hangi aşamada olduğunu (örneğin zamanında, gecikmiş, yakında dolacak) hesaplar ve DueState sonucunu döndürür.
- computeDueState

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imza ve sabit bilgisinden çıkarım yapılabilir.

[Aksiyom 1]: Eğer `TERMINAL_STATUSES` sabiti tanımlı değilse, `isTerminalStatus` fonksiyonu bir terminal durum kontrolü yapamaz.

[Aksiyom 2]: Eğer `status` parametresi `TERMINAL_STATUSES` içinde yer almıyorsa, `isTerminalStatus` fonksiyonu `false` döndürür (varsayılan olumsuz sonuç).

[Aksiyom 3]: Eğer `row` parametresi (`DueStateInput` tipinde) geçerli bir nesne değilse, `computeDueState` fonksiyonu beklenen `DueState` sonucunu üretemez.

[Aksiyom 4]: Eğer `now` parametresi geçerli bir `Date` nesnesi değilse, `computeDueState` fonksiyonu tarih karşılaştırması yapamaz.

[Aksiyom 5]: Eğer `MS_PER_DAY` sabiti tanımlı değilse, `computeDueState` fonksiyonu gün bazlı hesaplama yapamaz.

**Not:** Fonksiyon gövdeleri sağlanmadığı için, bu fonksiyonların iç mantığı, hata yönetimi ve edge-case davranışları hakkında kesin bir çıkarım yapılamaz. Daha detaylı aksiyom üretimi için fonksiyon gövdesi kodu gereklidir.

---

## FONKSİYON DETAYLARI

### isTerminalStatus
**Ne yapar**: Verilen bir durum string'inin tamamlanmış veya reddedilmiş bir terminal durumu olup olmadığını kontrol eder. TypeScript tip koruması (type guard) olarak çalışır; fonksiyon `true` döndürdüğünde, `status` parametresinin tipi `TerminalStatus` literal tipine daraltılır.

**Nasıl yapar**: `TERMINAL_STATUSES` sabit dizisini `readonly string[]` tipine dönüştürerek `includes` metoduyla gelen `status` değerinin bu dizide yer alıp almadığını sorgular. `as readonly string[]` tip dönüşümü, TypeScript'in `includes` metodunu doğru parametre tipiyle kabul etmesini sağlar.

**Parametreler**:
- status: string — Değerlendirilecek durum string'i

**Dönüş**: status is TerminalStatus — `true` dönerse `status` parametresi `TerminalStatus` tipine daraltılır; `false` dönerse durum terminal değildir.

### computeDueState
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## INTERFACES

### DueStateInput
- `due_at: string`
- `status: string`
- `completed_at: string | null`

### DueState
- `daysLeft: number`
- `overdue: boolean`
- `frozen: boolean`

---

## TYPE ALIASES

### TerminalStatus
```typescript
type TerminalStatus = (typeof TERMINAL_STATUSES)[number]
```

---

## SABİTLER
- **TERMINAL_STATUSES** (as_expression) — `['completed', 'rejected'] as const`
- **MS_PER_DAY** (binary_expression) — `24 * 60 * 60 * 1000`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/kvkk/dueState.ts::isTerminalStatus
- **params**: `status: string` — kontrol edilecek durum değeri
- **ic_degiskenler**: yok
- **Dönüş**: `boolean` — `TERMINAL_STATUSES` sabiti içinde `status` varsa `true`, yoksa `false` döner (type guard: `status is TerminalStatus`)

### [N2_NASIL] AST Pointer: src/lib/kvkk/dueState.ts::computeDueState
- **params**: `row: DueStateInput` — vade ve durum bilgilerini içeren satır, `now: Date` — referans anı olarak kullanılan tarih
- **ic_degiskenler**:
  - `due` — `row.due_at` alanının `new Date()` ile Date objesine çevrilip `.getTime()` ile milisaniye cinsinden sayısal değeri; vade tarihinin epoch karşılığı
  - `isTerminal` — `TERMINAL_STATUSES` sabitinin `row.status` alanını içerip içermediğini kontrol eden boolean; sonucun dondurulup dondurulmayacağını belirler
  - `reference` — Eğer `isTerminal` true ise ve `row.completed_at` tanımlıysa `new Date(row.completed_at).getTime()` değeri, aksi halde `now.getTime()` değeri; gün hesabı için kullanılan referans milisaniye anı
- **Dönüş**: `DueState` — şu alanları içeren nesne:
  - `daysLeft`: `(due - reference) / MS_PER_DAY` ifadesinin `Math.ceil()` ile yukarı yuvarlanması; kalan gün sayısı (negatif olabilir)
  - `overdue`: `isTerminal` false ise ve `due < now.getTime()` koşulu sağlanıyorsa `true`; aksi halde `false`; vade geçmiş mi bilgisi
  - `frozen`: `isTerminal` değeri; durum terminal ise `true`, değilse `false`; sonucun dondurulmuş olup olmadığı

---

## NODE ID STANDARD

  file: src\lib\kvkk\dueState.ts
  function: src\lib\kvkk\dueState.ts::isTerminalStatus
  function: src\lib\kvkk\dueState.ts::computeDueState

---

## DISA AKTARILANLAR (EXPORTS)
  export: DueState
  export: DueStateInput
  export: TERMINAL_STATUSES
  export: TerminalStatus
  export: computeDueState
  export: isTerminalStatus