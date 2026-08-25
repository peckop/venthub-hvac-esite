---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\__tests__\AdminErrorsPage.integration.test.tsx
skeleton_hash: c7a228172d0474af
entity_hashes:
  overview: 7130a4af4162ff59
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:31:26Z
---

## Genel Bakış
Bu dosya, AdminErrorsPage bileşeninin entegrasyon testlerini içeren bir test modülüdür. Vitest ve @testing-library/react araçlarıyla test senaryoları oluşturulmuş, ayrıca testA11y fonksiyonu ile erişilebilirlik testleri yapılmaktadır. Dosyada sb adlı bir sabit tanımlanmıştır, ancak bu sabitin amacı kaynakta belirtilmemiştir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca modül sabitinden (`sb (call)`) çıkarım yapılabilmektedir. Sınırlı bilgi mevcuttur.

[Aksiyom 1]: Eğer `sb` çağrısının tanımlı olduğu test framework'ü (muhtemelen Storybook veya ilgili test yardımcı kütüphanesi) modüle import edilebilir durumda değilse, test dosyası derlenemez ve çalıştırılamaz.

[Aksiyom 2]: Eğer test edilen `AdminErrorsPage` bileşeni ilgili yoldan import edilebilir durumda değilse, bu entegrasyon testi çalıştırılamaz.

[Aksiyom 3]: Eğer test ortamı (test runner, DOM ortamı vb.) yapılandırılmamışsa, React bileşen testleri gerçekleştirilemez.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../AdminErrorsPage::AdminErrorsPage
- import: @/utils/testA11y::testA11y
- import: @testing-library/react::render
- import: @testing-library/react::screen
- import: react::React
- import: vitest::describe
- import: vitest::expect
- import: vitest::it
- import: vitest::vi

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  const errorsData = [
    {
      id: 'e1',
      at:...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::ok (ana test setup fonksiyonu)
- **params**: yok
- **ic_degiskenler**:
  - `errorsData` — iki elemanlı test hata verisi dizisi; her eleman `id`, `at`, `url`, `message`, `stack`, `user_agent`, `release`, `env`, `level` alanlarına sahip nesne
  - `queryChain` — Supabase sorgu zinciri taklidi nesne; `order()`, `gte()`, `lte()`, `eq()`, `or()` metotları zincirleme `queryChain` döndürür, `range()` metodu `Promise.resolve({ data: errorsData, count: errorsData.length, error: null })` döndürür
  - `channel` — Supabase realtime kanal taklidi nesne; `on()` ve `subscribe()` metotları zincirleme `channel` döndürür
  - `client` — Supabase istemci taklidi nesne; `from()` metodu `{ select() }` döndürür, `channel()` metodu `channel` döndürür, `removeChannel()` metodu boş
- **Dönüş**: `{ errorsData, client }` nesnesi

### [N2_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::queryChain.order
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `queryChain` (kendisi)

### [N3_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::queryChain.gte
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `queryChain` (kendisi)

### [N4_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::queryChain.lte
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `queryChain` (kendisi)

### [N5_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::queryChain.eq
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `queryChain` (kendisi)

### [N6_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::queryChain.or
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `queryChain` (kendisi)

### [N7_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::queryChain.range
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `Promise.resolve({ data: errorsData, count: errorsData.length, error: null })` — `errorsData` dizisini ve uzunluğunu içeren çözülmüş promise

### [N8_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::channel.on
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `channel` (kendisi)

### [N9_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::channel.subscribe
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `channel` (kendisi)

### [N10_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::client.from
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `{ select() }` nesnesi — içinde `select` metodu barındıran nesne

### [N11_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::client.from().select
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `queryChain`

### [N12_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::client.channel
- **params**: yok (çağrıda argüman yok)
- **ic_degiskenler**: yok
- **Dönüş**: `channel`

### [N13_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::client.removeChannel
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (boş gövde)

### [N14_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::mock useRole
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ useRole: () => ({ canWrite: () => false, canAccess: () => true, isReadOnly: true, role: 'admin', loading: false, roleLoading: false }) }` nesnesi

### [N15_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::mock useI18n
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }` nesnesi

### [N16_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::mock useSearchParams/useRouter/usePathname
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => '/admin/errors' }` nesnesi

### [N17_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::test "hataları render eder + sıralanabilir başlıkta aria-sort taşır"
- **params**: yok
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` ile alınan tüm tablo başlık hücreleri dizisi
- **Dönüş**: yok (async test, yan etki: `render` çağrısı, `findByText` bekleme, `expect` doğrulamaları)

### [N18_NASIL] AST Pointer: AdminErrorsPage.integration.test.tsx::test "a11y ihlali yok (axe 0)"
- **params**: yok
- **ic_degiskenler**:
  - `container` — `render(<AdminErrorsPage />)` dönüşünden destructure edilen DOM konteyneri
  - `results` — `testA11y(container)` ile elde edilen erişilebilirlik test sonuçları
- **Dönüş**: yok (async test, yan etki: `render` çağrısı, `findByText` bekleme, `expect` doğrulaması)

---

## NODE ID STANDARD

  file: AdminErrorsPage.integration.test.tsx

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