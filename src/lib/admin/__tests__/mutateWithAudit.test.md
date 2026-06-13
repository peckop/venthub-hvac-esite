---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\admin\__tests__\mutateWithAudit.test.ts
skeleton_hash: eedfd4339ccc8fe0
entity_hashes:
  overview: 6bd3f61a23004f47
generated_at: 2026-06-13T15:05:09Z
---

## Genel Bakış

Bu dosya, `mutateWithAudit` fonksiyonunun birim testlerini içeren bir Vitest test dosyasıdır. Dosya, Supabase veritabanı üzerinde gerçekleştirilen veri mutation işlemlerinin (ekleme, güncelleme, silme) audit trail (denetim kaydı) mekanizmasıyla birlikte doğru şekilde çalıştığını doğrular. Testler, `fakeSupabase` mock nesnesi ve `audit` sabiti kullanılarak izin kontrolü (`AdminPermissionError`) ve veri yazma operasyonlarının beklenen davranışları test eder.

## Test Yapısı

### Test Senaryoları
- mutateWithAudit fonksiyonunun various CRUD operasyonlarında audit bilgisini doğru kaydettiği doğrulanır
- Admin izin hatalarının (`AdminPermissionError`) uygun durumlarda fırlatıldığı kontrol edilir
- Supabase client'ın (`fakeSupabase`) doğru methodlarının çağrıldığı ve beklenen parametrelerle kullanıldığı assert edilir

### Test Altyapısı
- **Test Framework:** Vitest (`beforeEach`, `describe`,`, `expect`, `it`, `vi`)
- **Mock'lar:** `fakeSupabase` ile veritabanı işlemleri, `audit` sabiti ile denetim bilgisi test edilir
- **Test Edilen Modül:** `../mutateWithAudit` (üst dizindeki kaynak modül)

---

## AXIOMS – Mimari Varsayımlar

Bu modül test dosyasıdır (mutateWithAudit.test.ts) ve kendi içinde mimicari varsayımlar içermemektedir. Test modülü, `mutateWithAudit` fonksiyonunun davranışını doğrulamak amacıyla oluşturulmuş test senaryolarından oluşmaktadır.

Test altyapısının doğru çalışması için aşağıdaki koşullar gereklidir:

[Aksiyom 1]: Eğer `audit` mock fonksiyonu (call) test ortamında doğru yapılandırılmamışsa, audit çağrılarının izlenmesine ilişkin test senaryoları yanlış sonuçlar üretebilir.

[Aksiyom 2]: Eğer `fakeSupabase` (binary_expression) sahte istemcisi gerçek Supabase client arayüzünü doğru şekilde taklit etmiyorsa, `mutateWithAudit` fonksiyonunun veritabanı işlemleri ile ilgili testleri geçersiz sonuçlar verebilir.

[Aksiyom 3]: Eğer `mutateWithAudit` fonksiyonu test edilmekte olan modül test ortamında mevcut değilse (import edilmemişse), tüm test senaryoları başarısız olur.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **audit** (call) — `vi.hoisted(() => ({ logAdminAction: vi.fn().mockResolvedValue(undefined) }))`
- **fakeSupabase** (binary_expression) — `{} as import('@supabase/supabase-js').SupabaseClient<
  import('@/types/datab...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: __tests__/mutateWithAudit.test.ts::describe_block
- **params**: ()
- **ic_degiskenler**:
  - *(blok içinde doğrudan değişken tanımlanmaz — `beforeEach` ve `it` blokları çağırılır)*
- **Dönüş**: yok (test tanımlama bloğu; `beforeEach` ile `audit.logAdminAction.mockClear()` çağrısı; 4 adet `it` bloğu kaydı)

---

### [N2_NASIL] AST Pointer: __tests__/mutateWithAudit.test.ts::it_K3_canWrite_false
- **params**: ()
- **ic_degiskenler**:
  - `fn` — `vi.fn()` ile oluşturulan boş mock fonksiyon; `mutateWithAudit`'e verilen `fn` parametresi olarak gönderilir, çağrılmadığını doğrulamak için kullanılır
- **Dönüş**: yok (test assertion; `mutateWithAudit`'in `canWrite: false` durumunda `AdminPermissionError` fırlattığını, `fn`'in çağrılmadığını ve `audit.logAdminAction`'ın çağrılmadığını doğrular)

---

### [N3_NASIL] AST Pointer: __tests__/mutateWithAudit.test.ts::it_K4_basarili_mutasyon
- **params**: ()
- **ic_degiskenler**:
  - `fn` — `vi.fn().mockResolvedValue({ ok: true })` ile oluşturulan mock fonksiyon; başarılı mutasyon senaryosunda `{ ok: true }` döner, `mutateWithAudit`'in dönüş değerini doğrulamak için kullanılır
  - `r` — `mutateWithAudit`'in return değeri; successful mutation sonucu tutar, `{ ok: true }` olup olmadığı kontrol edilir
- **Dönüş**: yok (test assertion; `r`'nin `{ ok: true }` olduğunu ve `audit.logAdminAction`'ın doğru parametrelerle (`table_name: 'coupons'`, `row_pk: 'c1'`, `action: 'UPDATE'`, `before`, `after`) çağrıldığını doğrular)

---

### [N4_NASIL] AST Pointer: __tests__/mutateWithAudit.test.ts::it_K4_audit_hatasi_fn_bloklamaz
- **params**: ()
- **ic_degiskenler**:
  - `r` — `mutateWithAudit`'in return değeri; audit hata senaryosunda fonksiyonun hâlâ `'done'` döndüğünü doğrulamak için kullanılır
- **Dönüş**: yok (test assertion; `audit.logAdminAction`'ın `mockRejectedValueOnce` ile hata fırlatıldığı durumda bile `mutateWithAudit`'in `fn` sonucunu (`'done'`) bloklamadığını ve döndürdüğünü doğrular)

---

### [N5_NASIL] AST Pointer: __tests__/mutateWithAudit.test.ts::it_ADV1_6_auditedByEdge_cift_log_onlenir
- **params**: ()
- **ic_degiskenler**:
  - `r` — `mutateWithAudit`'in return değeri; `auditedByEdge: true` senaryosunda fonksiyonun `'edge-ok'` döndüğünü doğrulamak için kullanılır
- **Dönüş**: yok (test assertion; `auditedByEdge: true` gönderildiğinde `audit.logAdminAction`'ın çağrılmadığını (çift-log önlenir) ve `fn` sonucunun (`'edge-ok'`) doğru döndüğünü doğrular)

---

## NODE ID STANDARD

  file: src\lib\admin\__tests__\mutateWithAudit.test.ts