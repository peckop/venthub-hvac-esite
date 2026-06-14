---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminErrorGroupsPage.integration.test.tsx
skeleton_hash: cd887b63c2abe4a3
entity_hashes:
  overview: 1cd10a7aacc90ca5
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T18:59:49Z
---

## Genel Bakış

Bu dosya, `AdminErrorGroupsPage` React bileşeninin entegrasyon testlerini içeren bir test modülüdür. Modül, sayfanın temel olarak render edilip edilemediğini ve erişilebilirlik (a11y) standartlarına uygun olup olmadığını doğrulayan iki temel senaryoyu çalıştırır. Dosya, projenin test altyapısı olan Vitest ve Testing Library ile harici bir API veya ortam değişkeni kullanmadan, tamamen bileşen seviyesinde izole testler gerçekleştirmektedir.

## Fonksiyon Grupları

### Test Senaryoları

Bileşenin beklenen davranışlarını ve kalite standartlarını doğrulayan iki adet entegrasyon testi senaryosunu barındırır.

- `AdminErrorGroupsPage` bileşeninin ekranda başarıyla render edilip edilmediğini doğrular.
- Bileşenin erişilebilirlik (a11y) kurallarına uyup uymadığını, `testA11y` yardımcı fonksiyonunu kullanarak test eder.

### Test Ortamı ve Bağımlılıklar

Testlerin çalışması için gerekli olan kütüphaneleri, test edilecek bileşeni ve yardımcı araçları tanımlayan import ve değişken tanımlamalarını içerir.

- `@testing-library/react` kütüphanesinden `render` ve `screen`, testin temel render ve sorgulama fonksiyonlarını sağlar.
- `vitest` kütüphanesinden `describe`, `expect`, `it`, `vi` test tanımlama ve断言 fonksiyonları ithal edilir.
- Test edilecek `AdminErrorGroupsPage` bileşeni ve projenin kendi `testA11y` yardımcı modülü import edilir; `sb` değişkeni tanımlı olmakla birlikte testlerde kullanılmaz.
- Harici API çağrısı, veritabanı sorgusu veya ortam değişkeni kullanımı bulunmaz; modül saf bir birim/entegrasyon test yapısındadır.

---

## AXIOMS – Mimari Varsayımlar

Bu bir test dosyasıdır (integration test). Doğrudan test edilen modülün fonksiyon gövdesi verilmediğinden, test dosyasının yapısından çıkarılabilecek sınırlı mimari varsayımlar mevcuttur.

[Aksiyom 1]: Eğer `sb` (service broker/call) servisi çalışmıyorsa veya erişilebilir değilse, testlerin ilgili API çağrılarını içeren senaryoları başarısız olur.

[Aksiyom 2]: Eğer test ortamı (test runner, JSX/TSX derleyici, React test utilities) doğru yapılandırılmamışsa, modülün render edilmesi veya bileşenlerin yüklenmesi başarısız olur.

[Aksiyom 3]: Eğer `AdminErrorGroupsPage` bileşeni var değilse veya ilgili import yolları kırıksa, test dosyası derleme aşamasında hata verir.

---

**Not:** Bu dosya bir entegrasyon testi olup, test edilen asıl `AdminErrorGroupsPage` modülünün fonksiyon gövdesi verilmemiştir. Dolayısıyla asıl modüle ait detaylı mimari varsayımlar ancak o modülün kaynak kodu incelendiğinde üretilebilir. Mevcut bilgilerle yalnızca test dosyasının çalışma koşullarına ilişkin genel varsayımlar tanımlanabilmiştir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  const groupsData = [
    {
      id: 'g1111111-aaaa',
  ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/__tests__/AdminErrorGroupsPage.integration.test.tsx::setupMockData
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `groupsData` — Test için örnek hata grupları dizisi (2 nesne içerir: bir error, bir warn seviyesinde hata)
  - `queryChain` — Supabase select sorgu zinciri mock nesnesi (order, eq, is, gte, lte, or, range metodları içerir)
  - `updateChain` — Supabase update sorgu zinciri mock nesnesi (eq, in metodları içerir)
  - `clientErrorsChain` — client_errors tablosu için özel sorgu zinciri mock nesnesi (eq, order, limit metodları içerir)
  - `channel` — Realtime kanal mock nesnesi (on, subscribe metodları içerir)
  - `client` — Ana Supabase client mock nesnesi (from, rpc, channel, removeChannel metodları içerir)
- **Dönüş**: `{ groupsData, client }` — Mock veriler ve client nesnesi

### [N2_NASIL] AST Pointer: src/views/admin/__tests__/AdminErrorGroupsPage.integration.test.tsx::testRenderAndSorting
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` ile alınan tüm sütun başlıkları
- **Dönüş**: void (test assertion'ları yapar)

### [N3_NASIL] AST Pointer: src/views/admin/__tests__/AdminErrorGroupsPage.integration.test.tsx::testAccessibility
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `container` — `render()` fonksiyonundan dönen React konteyner
  - `results` — `testA11y(container)` çağrısından dönen erişilebilirlik sonuçları
- **Dönüş**: void (test assertion'ları yapar)

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminErrorGroupsPage.integration.test.tsx

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