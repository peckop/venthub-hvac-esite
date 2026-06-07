---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\__tests__\pdfGeneratorFallback.test.ts
skeleton_hash: 6f910285d7493481
entity_hashes:
  overview: 7c69a4b29725167d
generated_at: 2026-06-07T15:51:15Z
---

## Genel Bakış
Bu dosya, `pdfGenerator` modülündeki `generateProductDatasheet` fonksiyonunun "fallback" (yedek) mekanizmasını test etmek için yazılmış bir Vitest birim test dosyasıdır. Ana PDF oluşturma yöntemi başarısız olduğunda modülün alternatif bir yola geçiş yapıp yapmadığını doğrular. Testler, font yerleşimi ve metin hizalama gibi temel PDF çizim fonksiyonlarını taklit eden mock nesneler kullanarak modülün dayanıklılığını doğrular.

## Fonksiyon Grupları
*(Bu dosya bir test betik/dosyasıdır ve kendi içinde tanımlı bir fonksiyon içermez; bu nedenle "Fonksiyon Grupları" bölümü üretilemez.)*

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir test dosyasıdır ve mock fonksiyonlardan oluşan test altyapısını tanımlar. Gerçek modül fonksiyon imzaları verilmediğinden, test edilen modüle ilişkin mimari varsayımlar çıkarılamamıştır.

**Tespit edilen test altyapısı mock'ları:**
- `mockSetFont`, `mockSetFontSize` → Font ayarlama çağrıları
- `mockText` → Metin ekleme çağrıları
- `mockSave` → PDF kaydetme çağrıları
- `mockAddFileToVFS` → VFS dosyası ekleme çağrıları
- `mockAddFont` → Font ekleme çağrıları
- `mockSplitTextToSize` → Metin boyutlandırma çağrıları

> **Not:** Test dosyası yapısına dayanarak, test edilen asıl modülün PDF üretimi yaptığı ve fallback mekanizması içerdiği çıkarılabilir. Ancak bu bilgi docstring/yorumlardan türetilmiş olup aksiyon üretmek için yeterli değildir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **mockSetFont** (call) — `vi.fn()`
- **mockSetFontSize** (call) — `vi.fn()`
- **mockText** (call) — `vi.fn()`
- **mockSave** (call) — `vi.fn()`
- **mockAddFileToVFS** (call) — `vi.fn()`
- **mockAddFont** (call) — `vi.fn()`
- **mockSplitTextToSize** (call) — `vi.fn().mockImplementation((text: string) => [text])`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `pdfGeneratorFallback.test.ts`::(jsPDF_mock_factory)
- **params**: (yok)
- **ic_degiskenler**: (yok — doğrudan literal obje döner)
- **Dönüş**: `{ jsPDF: class }` — jsPDF sınıfının mock versiyonunu döner; `internal.pageSize` (getWidth/getHeight), `setFont`, `setFontSize`, `setFillColor`, `rect`, `roundedRect`, `setTextColor`, `text`, `setDrawColor`, `line`, `splitTextToSize`, `addImage`, `addPage`, `setPage`, `save`, `addFileToVFS`, `addFont` alanlarını içerir; her alan ilgili mock fonksiyona (örn. `mockSetFont`, `mockText`, `mockSave`, `mockAddFileToVFS`, `mockAddFont`, `mockSplitTextToSize`) veya `vi.fn()`'e bağlanmıştır

---

### [N2_NASIL] AST Pointer: `pdfGeneratorFallback.test.ts`::(default_mock_factory)
- **params**: (yok)
- **ic_degiskenler**: (yok — doğrudan literal obje döner)
- **Dönüş**: `{ default: vi.fn() }` — `default` anahtarıyla bir vi.fn() mock'u döner

---

### [N3_NASIL] AST Pointer: `pdfGeneratorFallback.test.ts`::(test_suite_body)
- **params**: (yok)
- **ic_degiskenler**:
  - `mockProduct` — testlerde kullanılan sahte `Product` nesnesi; `id`, `name`, `brand`, `sku`, `model_code`, `description`, `technical_specs` (airflow, noise, power) alanlarını içerir
  - `consoleErrorSpy` — `console.error` fonksiyonunu izleyen spy; beforeEach'te oluşturulur, afterEach'te geri yüklenir
- **Dönüş**: (yok — describe bloğu yan etki olarak testleri kaydeder)

---

### [N4_NASIL] AST Pointer: `pdfGeneratorFallback.test.ts`::(beforeEach_callback)
- **params**: (yok)
- **ic_degiskenler**:
  - `consoleErrorSpy` — `vi.spyOn(console, 'error').mockImplementation(() => {})` ile oluşturulur; console.error çağrılarını yakalar ve susturur; üst kapsam (test_suite_body) ile paylaşılan değişkene atama yapılır
- **Dönüş**: (yok — yan etki: mock'ları temizler ve console spy'ı kurar)

---

### [N5_NASIL] AST Pointer: `pdfGeneratorFallback.test.ts`::(afterEach_callback)
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: (yok — yan etki: `consoleErrorSpy.mockRestore()` ve `vi.restoreAllMocks()` çağırarak mock'ları temizler)

---

### [N6_NASIL] AST Pointer: `pdfGeneratorFallback.test.ts`::(it_fallback_font_fetch_reject)
- **params**: (yok)
- **ic_degiskenler**:
  - `fetchSpy` — `vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'))` ile oluşturulur; global fetch fonksiyonunu mock eder ve her çağrıyı reddeder
- **Dönüş**: Promise<void> — `await expect(generateProductDatasheet(mockProduct)).resolves.not.toThrow()` ile sonuç doğrulanır
- **Yan etkiler**: `consoleErrorSpy`'in çağrılmış olması beklenir; `mockSetFont`'ün `'helvetica'` argümanıyla çağrılması beklenir; test sonunda `fetchSpy.mockRestore()` ile fetch mock'u geri yüklenir

---

### [N7_NASIL] AST Pointer: `pdfGeneratorFallback.test.ts`::(it_fallback_font_non_ok_status)
- **params**: (yok)
- **ic_degiskenler**:
  - `fetchSpy` — `vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' } as Response)` ile oluşturulur; global fetch fonksiyonunu mock eder ve 404 yanıtı döner
- **Dönüş**: Promise<void> — `await expect(generateProductDatasheet(mockProduct)).resolves.not.toThrow()` ile sonuç doğrulanır
- **Yan etkiler**: `consoleErrorSpy`'in çağrılmış olması beklenir; `mockSetFont`'ün `'helvetica'` argümanıyla çağrılması beklenir; test sonunda `fetchSpy.mockRestore()` ile fetch mock'u geri yüklenir

---

## NODE ID STANDARD

  file: src\lib\__tests__\pdfGeneratorFallback.test.ts