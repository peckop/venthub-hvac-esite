---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts
skeleton_hash: d08e2980428fda08
entity_hashes:
  overview: 1633dd4f76130b20
generated_at: 2026-08-25T07:28:10Z
---

## Genel Bakış
Bu modül, `useAdminTable` hook'unun sıralama modu (sort mode) ile ilgili davranışlarını test eden bir test dosyasıdır. Dosya, `@testing-library/react` ve `vitest` kütüphanelerini kullanarak hook'un sıralama işlevselliğini doğrular. Modülde tanımlı fonksiyon bulunmamakta olup, yalnızca test senaryoları ve ilgili import ifadeleri yer almaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Verilen kaynak bir test dosyasıdır (`useAdminTable.sortMode.test.ts`). Fonksiyon gövdeleri, fonksiyon imzaları ve modül sabitleri sağlanmadığından, mimari varsayım üretilememektedir. Aksiyomlar yalnızca fonksiyon gövdelerinden türetilir; test dosyası adlarından veya dosya yapısından çıkarım yapılmaz.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../useAdminTable::useAdminTable
- import: @testing-library/react::act
- import: @testing-library/react::renderHook
- import: @testing-library/react::waitFor
- import: vitest::describe
- import: vitest::expect
- import: vitest::it
- import: vitest::vi

---

## INTERFACES

### Row
- `id: string`
- `n: number`
- `name: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::vi.mock factory fonksiyonu
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: Obje — `useSearchParams`, `useRouter`, `usePathname` fonksiyonlarını içeren bir nesne döndürür.

### [N2_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::describe callback fonksiyonu
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `it` blokları içinde test senaryolarını tanımlar.

### [N3_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::it("server: toggleSort fetcher'ı yeni sort ile çağırır, rows'u CLIENT sıralamaz") callback fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `rows` — `Row[]` tipinde, kasıtlı sırasız test verisi (id: 'b', n: 2 ve id: 'a', n: 1)
  - `fetcher` — `vi.fn()` ile oluşturulan mock fonksiyon, `rows` ve `totalMatched: 2` döndürür
  - `result` — `renderHook` sonucu, `useAdminTable` hook'unun döndürdüğü nesneyi içerir
- **Dönüş**: yok — `expect` ifadeleriyle test assertions çalıştırır.

### [N4_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::renderHook callback (ilk test)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `useAdminTable<Row>` hook sonucu — `resource: 'test'`, `rowId: (r) => r.id`, `fetcher`, `sortMode: 'server'`, `paginationMode: 'server'`, `syncUrl: false` parametreleriyle çağrılır.

### [N5_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::act callback (ilk test - toggleSort)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `result.current.sorting.toggleSort('n')` çağrısı yapar.

### [N6_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::waitFor callback (ilk test - fetcher kontrolü)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `fetcher` fonksiyonunun son çağrısının `{ sort: { key: 'n', dir: 'asc' } }` içerdiğini doğrular.

### [N7_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::it('shift-aralık: toggle(id,{shiftKey}) ardışık aralığı seçer') callback fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `rows` — `Row[]` tipinde, sıralı test verisi (id: 'a', 'b', 'c')
  - `fetcher` — `vi.fn()` ile oluşturulan mock fonksiyon, `rows` ve `totalMatched: 3` döndürür
  - `result` — `renderHook` sonucu, `useAdminTable` hook'unun döndürdüğü nesneyi içerir
- **Dönüş**: yok — `expect` ifadeleriyle test assertions çalıştırır.

### [N8_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::renderHook callback (ikinci test)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `useAdminTable<Row>` hook sonucu — `resource: 'test'`, `rowId: (r) => r.id`, `fetcher`, `paginationMode: 'none'`, `sortMode: 'none'`, `syncUrl: false` parametreleriyle çağrılır.

### [N9_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::act callback (ikinci test - toggle 'a')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `result.current.selection.toggle('a')` çağrısı yapar.

### [N10_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::act callback (ikinci test - toggle 'c' with shiftKey)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `result.current.selection.toggle('c', { shiftKey: true })` çağrısı yapar.

### [N11_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::it('pageCount = ceil(totalMatched/pageSize) (client-süzme sonrası doğru) [ADV-1#1]') callback fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `rows` — `Row[]` tipinde, 10 elemanlı test verisi (id: 'r0'...'r9')
  - `fetcher` — `vi.fn()` ile oluşturulan mock fonksiyon, `rows` ve `totalMatched: 95` döndürür
  - `result` — `renderHook` sonucu, `useAdminTable` hook'unun döndürdüğü nesneyi içerir
- **Dönüş**: yok — `expect` ifadeleriyle test assertions çalıştırır.

### [N12_NASIL] AST Pointer: C:\tmp\wt-supurme\src\hooks\__tests__\useAdminTable.sortMode.test.ts::renderHook callback (üçüncü test)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `useAdminTable<Row>` hook sonucu — `resource: 'test'`, `rowId: (r) => r.id`, `fetcher`, `pageSize: 50`, `paginationMode: 'server'`, `sortMode: 'server'`, `syncUrl: false` parametreleriyle çağrılır.

---

## NODE ID STANDARD

  file: useAdminTable.sortMode.test.ts