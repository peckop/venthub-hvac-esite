---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\__tests__\useAdminTable.sortMode.test.ts
skeleton_hash: 5529b7430fb81eff
entity_hashes:
  overview: 1633dd4f76130b20
generated_at: 2026-06-13T15:02:22Z
---

## Genel Bakış
Bu dosya, `useAdminTable` hook'unun sıralama (sort) modu davranışını test eden bir test modülüdür. Hook'un sıralama state'i ile ilgili çeşitli senaryoları (başlangıç değeri, sıralama yönü değişikliği, sütun değişikliği) Vitest ve Testing Library kullanarak doğrulamayı amaçlar.

## Fonksiyon Grupları
Bu dosyada tanımlanmış fonksiyon veya metot bulunmamaktadır. Dosya tamamen test senaryolarından oluşmaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Verilen modül bir test dosyasıdır (`useAdminTable.sortMode.test.ts`) ve:
- Fonksiyon imzası belirtilmemiş
- Modül sabitleri belirtilmemiş
- Fonksiyon gövdesi paylaşılmamış

Mimari varsayımlar yalnızca **fonksiyon gövdesinden** üretilebilir. Test dosyasının çalışması için gerekli olan `useAdminTable` hook'unun implementasyonu, test edilen bileşenler ve kullanılan test altyapısı (örn: `@testing-library`, `vitest`, `jest`) bilinmediğinden, modüle özgü aksiyom türetmek mümkün değildir.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### Row
- `id: string`
- `n: number`
- `name: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::mockSetup
- **params**: (yok)
- **ic_degiskenler**:
  - Return object inline (anonim) — `useAdminTable` hook'unun test sırasında kullanacağı URL/routing mock'larını döner
- **Dönüş**: `{ useSearchParams, useRouter, usePathname }` — mock hook fabrikaları

---

### [N2_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::test_server_toggleSort_fetcher_call
- **params**: (yok — async arrow, `it()` callback)
- **ic_degiskenler**:
  - `rows` — `Row[]` tipinde, sırasız iki satır dizisi (`b` id=2, `a` id=1); server'ın gönderdiği ham sıra
  - `fetcher` — `vi.fn().mockResolvedValue({ rows, totalMatched: 2 })` ile oluşturulmuş sahte veri çekme fonksiyonu; `useAdminTable`'ya passed
  - `result` — `renderHook` return value; `result.current` üzerinden hook'un暴露 ettiği API'ye erişilir (`result.current.rows`, `result.current.sorting`, `result.current.selection`)
- **Dönüş**: yok (test assertion side-effect'leri)

---

### [N3_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::test_shift_aralik_toggle
- **params**: (yok — async arrow, `it()` callback)
- **ic_degiskenler**:
  - `rows` — `Row[]` tipinde, üç satır (`a`, `b`, `c`); shift-aralık testi için sıralı dizi
  - `fetcher` — `vi.fn().mockResolvedValue({ rows, totalMatched: 3 })` — sahte fetcher, `paginationMode: 'none'`, `sortMode: 'none'` ile kullanılır
  - `result` — `renderHook` return value; `result.current.selection.toggle()` ve `result.current.selection.selectedIds` üzerinden seçim API'si test edilir
- **Dönüş**: yok (assertion side-effect)

---

### [N4_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::test_pageCount_calculation
- **params**: (yok — async arrow, `it()` callback)
- **ic_degiskenler**:
  - `rows` — `Array.from({ length: 10 }, (_, i) => ...)` ile oluşturulmuş 10 elemanlı `Row[]` dizisi; sayfalama için test verisi
  - `fetcher` — `vi.fn().mockResolvedValue({ rows, totalMatched: 95 })` — 95 toplam satır sunan sahte fetcher; `pageSize: 50` ile `pageCount` hesabını doğrular
  - `result` — `renderHook` return value; `result.current.totalMatched` ve `result.current.pagination.pageCount` değerlerini assert için kullanılır
- **Dönüş**: yok (assertion side-effect)

---

### [N5_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::inline_renderHook_callback_1
- **params**: (yok — inline arrow)
- **ic_degiskenler**: (yok)
- **Dönüş**: `useAdminTable<Row>` hook çağrısı — `resource: 'test'`, `rowId`, `fetcher`, `sortMode: 'server'`, `paginationMode: 'server'`, `syncUrl: false` konfigürasyonu ile hook instance'ı döner

---

### [N6_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::inline_renderHook_callback_2
- **params**: (yok — inline arrow)
- **ic_degiskenler**: (yok)
- **Dönüş**: `useAdminTable<Row>` hook çağrısı — `paginationMode: 'none'`, `sortMode: 'none'`, `syncUrl: false` konfigürasyonu

---

### [N7_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::inline_renderHook_callback_3
- **params**: (yok — inline arrow)
- **ic_degiskenler**: (yok)
- **Dönüş**: `useAdminTable<Row>` hook çağrısı — `pageSize: 50`, `paginationMode: 'server'`, `sortMode: 'server'`, `syncUrl: false`

---

### [N8_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::inline_act_sorting_callback
- **params**: (yok — inline async arrow)
- **ic_degiskenler**: (yok)
- **Dönüş**: `result.current.sorting.toggleSort('n')` çağrısı — sıralama sütununu `'n'` olarak toggle eder

---

### [N9_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::inline_act_selection_toggle_a
- **params**: (yok — inline async arrow)
- **ic_degiskenler**: (yok)
- **Dönüş**: `result.current.selection.toggle('a')` çağrısı — `'a'` id'li satırı seçime ekler/çıkarır

---

### [N10_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::inline_act_selection_toggle_c_shift
- **params**: (yok — inline async arrow)
- **ic_degiskenler**: (yok)
- **Dönüş**: `result.current.selection.toggle('c', { shiftKey: true })` çağrısı — shift tuşu basılıyken `'c'` satırını toggle eder, aralık seçimini tetikler

---

### [N11_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::inline_rowId_callback
- **params**: `r` — `Row` tipinde tek satır nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: `r.id` — satırın benzersiz kimliği

---

### [N12_NASIL] AST Pointer: __tests__/useAdminTable.sortMode.test.ts::inline_fetcher_expect_callback
- **params**: (yok — inline arrow)
- **ic_degiskenler**: (yok)
- **Dönüş**: `expect.objectContaining({ sort: { key: 'n', dir: 'asc' } })` — fetcher'ın son çağrısında `sort` parametresinin doğru değerlerle geldiğini doğrular

---

## NODE ID STANDARD

  file: src\hooks\__tests__\useAdminTable.sortMode.test.ts