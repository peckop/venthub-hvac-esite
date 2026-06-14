---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminErrorsPage.integration.test.tsx
skeleton_hash: c41bcd38e3076e47
entity_hashes:
  overview: 7130a4af4162ff59
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T17:01:44Z
---

## Genel Bakış
Bu modül, AdminErrorsPage bileşeninin tümleştirme testlerini içerir. Temel amacı, bileşenin various senaryolar altında (başlangıç yüklemesi, erişilebilirlik, hata durumları) doğru davranış sergilediğini ve erişilebilirlik standartlarına uygun olduğunu doğrulamaktır. Testler, Vitest test çalıştırıcısı ve Testing Library ile gerçekleştirilir.

## Fonksiyon Grupları
Bu dosyada tanımlanmış bir fonksiyon veya metot bulunmamaktadır. Modül, üst düzey test senaryolarından (`describe`, `it` blokları) oluşmaktadır. Testlerin genel odak alanları aşağıdadır:

### Temel Render ve Erişilebilirlik Testleri
- `testA11y` yardımıyla sayfanın erişilebilirlik (a11y) standartlarına uygunluğunu doğrular.
- Sayfanın temel render durumunu ve "Admin Hataları" başlığını kontrol eder.

### Veri Yükleme ve Hata Senaryoları Testleri
- Veri yükleme durumunu ve potansiyel hata senaryolarını test eder.
- Mock fonksiyonlar (`vi.fn`) kullanılarak API çağrıları simüle edilir ve bileşenin bu senaryolara verdiği tepkiler doğrulanır.

### Modül Bağımlılıkları
- **Dış Bağımlılıklar:** `AdminErrorsPage` bileşeni (test edilen asıl modül), `@testing-library/react` (test yardımcıları), `vitest` (test çerçevesi) ve özel `testA11y` erişilebilirlik testi yardımcısı.
- **Test Ortamı:** Dosya, bir test ortamı (`__tests__` klasörü) içinde yer alır ve birim/test çifti (unit/integration test) mantığıyla çalışır. Ortam değişkeni kullanmaz; tüm veriler test içinde mock (`vi.mock`) ile sahnelenir.

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
  const errorsData = [
    {
      id: 'e1',
      at: '20...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `__tests__/AdminErrorsPage.integration.test.tsx::setup` (anonim箭头)
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `errorsData` — Mock hata listesi dizisi; iki adet hata nesnesi içerir (id, at, url, message, stack, user_agent, release, env, level alanları)
  - `errorsData[0]` — İlk hata kaydı; level:'error', url:'/checkout', message:'TypeError: x is undefined'
  - `errorsData[1]` — İkinci hata kaydı; level:'warn', url:'/cart', message:'Warning: slow render', stack:null
  - `queryChain` — Supabase sorgu zinciri mock nesnesi; order/gte/lte/eq/or metodları zincir döner, range() Promise.resolve ile `{data, count, error}` döner
  - `queryChain.range()` — Zincirin son halkası; Promise.resolve({ data: errorsData, count: errorsData.length, error: null }) döner
  - `channel` — Realtime kanal mock nesnesi; on() ve subscribe() zincir halinde channel referansını döner
  - `client` — Supabase client mock nesnesi; from() inner select() ile queryChain döner, channel() ile channel referansını döner, removeChannel() no-op
  - `client.from()` — select() metodunu barındıran nesne döner
  - `client.channel()` — channel referansını döner
- **Dönüş**: `{ errorsData, client }` — testlerde useSWR ve realtime mock zinciri olarak kullanılmak üzere mock client ve hata verisi

---

### [N2_NASIL] AST Pointer: `__tests__/AdminErrorsPage.integration.test.tsx::mockUseRole`
- **params**: () — parametre yok
- **ic_degiskenler**:
  - *(yok — inline return)*
- **Dönüş**: `{ useRole: () => ({ canWrite: () => false, canAccess: () => true, isReadOnly: true, role: 'admin', loading: false, roleLoading: false }) }` — useRole hook'unu mocklayan nesne; admin rolü, salt okunur, yazma yetkisi yok

---

### [N3_NASIL] AST Pointer: `__tests__/AdminErrorsPage.integration.test.tsx::mockUseI18n`
- **params**: () — parametre yok
- **ic_degiskenler**:
  - *(yok — inline return)*
- **Dönüş**: `{ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }` — useI18n hook'unu mocklayan nesne; t fonksiyonu key'i olduğu gibi döner, dil 'tr'

---

### [N4_NASIL] AST Pointer: `__tests__/AdminErrorsPage.integration.test.tsx::mockUseRouter`
- **params**: () — parametre yok
- **ic_degiskenler**:
  - *(yok — inline return)*
- **Dönüş**: `{ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => '/admin/errors' }` — next/navigation hook'larını mocklayan nesne; boş URLSearchParams, vi.fn() ile replace/push, path '/admin/errors'

---

### [N5_NASIL] AST Pointer: `__tests__/AdminErrorsPage.integration.test.tsx::it_render_test`
- **params**: () — parametre yok (async callback)
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` ile dönen tüm sütun başlığı elementleri dizisi; aria-sort niteliği kontrol edilir
- **Dönüş**: yok — render, findByText, getAllByRole, expect ile yan etkileri olan test; aria-sort='descending' ve aria-sort='none' assertions'ları çalıştırır

---

### [N6_NASIL] AST Pointer: `__tests__/AdminErrorsPage.integration.test.tsx::it_a11y_test`
- **params**: () — parametre yok (async callback)
- **ic_degiskenler**:
  - `container` — `render(<AdminErrorsPage />)` destructuring'inden elde edilen DOM kök düğümü; testA11y fonksiyonuna parametre olarak verilir
  - `results` — `testA11y(container)` çağrısının sonucu; axe erişilebilirlik raporu nesnesi, `toHaveNoViolations()` ile assert edilir
- **Dönüş**: yok — render, findByText, testA11y, expect ile yan etkileri olan test; erişilebilirlik ihlali olmadığını doğrular

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminErrorsPage.integration.test.tsx

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