---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\__tests__\AdminAuditLogPage.integration.test.tsx
skeleton_hash: b2bda3c4b5254c4c
entity_hashes:
  overview: d51c37c3501b18d2
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:32:46Z
---

## Genel Bakış

Bu dosya, `AdminAuditLogPage` bileşeninin entegrasyon testlerini içerir. Vitest test çerçevesi ve React Testing Library kullanılarak bileşenin render edilmesi, ekran üzerindeki elementlerin sorgulanması ve erişilebilirlik kontrolleri (`testA11y`) gerçekleştirilir. Dosyada tanımlı fonksiyon bulunmamakta; tüm testler modül seviyesinde `describe`, `it`, `expect`, `vi` gibi Vitest yardımcılarıyla ve `sb` sabitiyle yapılandırılmıştır.

Test ortamında `@testing-library/react` kütüphanesinden `render` ve `screen` araçları, `vitest`'ten mock ve assertion fonksiyonları, ayrıca `@/utils/testA11y` modülünden erişilebilirlik test yardımcısı içe aktarılır. Bu dosya herhangi bir API veya veritabanı sorgulaması doğrudan yapmaz; bunun yerine `AdminAuditLogPage` bileşeninin davranışını ve erişilebilirliğini doğrular.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül bir test dosyasıdır (`AdminAuditLogPage.integration.test.tsx`). Fonksiyon gövdesi verilmediğinden, fonksiyon gövdesinden türetilecek aksiyom üretilememektedir. Modül sabiti olarak yalnızca `sb (call)` tanımlıdır; ancak bu sabitin hangi koşullara bağlı çalıştığı fonksiyon gövdesi olmadan belirlenemez.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../AdminAuditLogPage::AdminAuditLogPage
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
  const auditData = [
    {
      id: 'a1',
      at: ...`

---

## NODE ID STANDARD

  file: AdminAuditLogPage.integration.test.tsx

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