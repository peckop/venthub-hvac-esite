---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminCouponsPage.integration.test.tsx
skeleton_hash: 38e4c9bebfcf88db
entity_hashes:
  overview: 6061dc6df19155d0
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T15:29:23Z
---

## Genel Bakış
Bu modül, AdminCouponsPage bileşeninin entegrasyon testlerini içerir. Testler, sayfanın doğru render edilmesini, erişilebilirlik (a11y) standartlarına uygunluğunu ve temel kullanıcı etkileşimlerini doğrulamak amacıyla vitest ve testing-library kullanılarak yazılmıştır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  const couponsData = [
    {
      id: 'c1',
      code: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `__tests__/AdminCouponsPage.integration.test.tsx::(anon_setup)`
- **params**: (yok)
- **ic_degiskenler**:
  - `couponsData` — Test için kullanılan sabit kupon verisi dizisi. İki kupon objesi içerir: biri percentage tipinde aktif, diğeri fixed_amount tipinde pasif.
  - `selectChain` — Supabase `select` sorgu zincir mock'u. `order()` ve `limit()` metodları sunar. `limit()` Promise.resolve ile couponsData ve error:null döner.
  - `updateChain` — Supabase `update` sorgu zincir mock'u. `eq()` ve `in()` metodları sunar. Her ikisi de Promise.resolve ile error:null döner.
  - `client` — Supabase client mock nesnesi. `from()` metodu select/update zincirlerini, `functions.invoke()` kupon verisini, `auth.getSession()` ve `auth.getUser()` oturum bilgilerini döner.
- **Dönüş**: `{ couponsData, client }` — Test ortamında kullanılacak mock veriler ve client

### [N2_NASIL] AST Pointer: `__tests__/AdminCouponsPage.integration.test.tsx::(anon_describe)`
- **params**: (yok)
- **ic_degiskenler**:
  - (yok — gövde sadece iki `it` bloğunu çağırır)
- **Dönüş**: void (describe bloğu dönüş yapmaz)

### [N3_NASIL] AST Pointer: `__tests__/AdminCouponsPage.integration.test.tsx::(anon_it_render)`
- **params**: (yok)
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` ile elde edilen tüm sütun başlığı elementleri dizisi. Sıralanabilir başlıkların `aria-sort` niteliği kontrol edilir.
- **Dönüş**: void

### [N4_NASIL] AST Pointer: `__tests__/AdminCouponsPage.integration.test.tsx::(anon_it_a11y)`
- **params**: (yok)
- **ic_degiskenler**:
  - `container` — `render(<AdminCouponsPage />)` çağrısından destructured edilen DOM konteyneri. `testA11y` fonksiyonuna parametre olarak geçirilir.
  - `results` — `testA11y(container)` Promise'ından dönen sonuç nesnesi. `toHaveNoViolations()` assertion'ı ile axe erişilebilirlik ihlali olmadığı doğrulanır.
- **Dönüş**: void

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminCouponsPage.integration.test.tsx

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)