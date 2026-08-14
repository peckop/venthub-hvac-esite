---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\e2e\admin-smoke.e2e.ts
skeleton_hash: 04c7e0b87d83897c
entity_hashes:
  overview: 529d691256ce33bd
generated_at: 2026-08-14T21:28:07Z
---

## Genel Bakış
Bu modül, Playwright kullanılarak yazılmış bir uçtan uca (E2E) test dosyasıdır. Modül, bir yönetim panelinin (admin) temel işlevselliğini "smoke test" (duman testi) yöntemiyle doğrulamak amacıyla tasarlanmıştır. Dosya seviyesinde çalışan bir betik yapısına sahiptir ve tanımlı bir fonksiyon veya metod içermez; test senaryolarını doğrudan dosya içinde çalıştırır.

## Fonksiyon Grupları
Bu dosyada fonksiyon veya metod tanımlı değildir; bu nedenle "Fonksiyon Grupları" bölümü oluşturulamaz. Modülün yapısı, test betiği olarak aşağıdaki temel amaca ve bağımlılıklara dayanır:

**Modülün Amacı ve Kullanım Dökümanı:**
- **Amaç:** Bir admin kullanıcısının sisteme giriş yapabilmesini ve yönetim arayüzünün ana sayfalarına erişebilmesini hızlı bir şekilde doğrulamak.
- **Kullanılan Ortam Değişkenleri:** Test senaryolarında sabit (hardcoded) bir `EMAIL` ve `PASSWORD` kullanılır. Bu, ortam değişkenlerinden okunmaz, doğrudan dosya içinde tanımlıdır.
- **Etkileşim:** Test, Playwright'ın `test` ve `expect` metotlarını kullanarak tarayıcıda belirli bir URL'de gezinir, form alanlarını doldurur ve assertions (doğrulamalar) yapar. Modül, bir API veya veritabanı tablosunu doğrudan sorgulamaz; bunun yerine web arayüzünün görünür durumunu doğrulama mantığıyla çalışır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, admin kullanıcı için e2e smoke testi içeren bir test dosyasıdır. Doğru çalışması için aşağıdaki mimari varsayımlar gereklidir:

[Aksiyom 1]: Eğer `EMAIL` sabiti tanımlı değilse veya geçerli bir admin e-posta adresi içermiyorsa, tüm testler giriş aşamasında başarısız olur.

[Aksiyom 2]: Eğer `PASSWORD` sabiti tanımlı değilse veya geçerli bir admin şifresi içermiyorsa, tüm testler giriş aşamasında başarısız olur.

[Aksiyom 3]: Eğer admin giriş endpoint'i (veya ilgili API) erişilebilir durumda değilse veya test ortamı düzgün yapılandırılmamışsa, tüm e2e testleri bağlantı/hatayla sonuçlanır.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: @playwright/test::expect
- import: @playwright/test::test

---

## SABİTLER
- **EMAIL** [env-backed] (member_expression) — `process.env.E2E_ADMIN_EMAIL`
- **PASSWORD** [env-backed] (member_expression) — `process.env.E2E_ADMIN_PASSWORD`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: admin-smoke.e2e.ts::anonymous_wrapper
- **params**: () — parametre yok
- **ic_degiskenler**:
  (fonksiyon gövdesinde yerel değişken tanımlanmamıştır)
- **Dönüş**: yok — E2E test dosyasının üst seviye sarmalayıcı arrow function'ıdır; `test.skip(...)` ve `test(...)` çağrılarını barındırarak testleri Playwright'a kaydeder. `EMAIL` ve `PASSWORD` modül seviyesi sabitlerinden `test.skip` koşulunda yararlanır (ikisi de tanımlı değilse testi atlar).

### [N2_NASIL] AST Pointer: admin-smoke.e2e.ts::anonymous_test_callback
- **params**: `{ page }` — Playwright Page nesnesi; tarayıcı sekmesiyle etkileşim kurmak için kullanılır
- **ic_degiskenler**:
  - `ordersLink` — `page.locator('a[href="/admin/orders"]').first()` çağrısıyla oluşturulur; admin paneli sidebar'ındaki "/admin/orders" adresine giden ilk `<a>` linkini temsil eder. Mount doğruluğu ve navigasyon interaktifliği için kullanılır
- **Dönüş**: yok — yan etkilerle çalışır:
  1. `page.goto('/tr/auth/login')` ile login sayfasına gider
  2. `page.fill(...)` ile `EMAIL` ve `PASSWORD` sabitlerini form inputlarına yazar
  3. `page.click('button[type="submit"]')` ile formu submit eder
  4. `page.waitForURL(...)` ile login sonrası URL'in `/auth/login` dışına çıkmasını bekler (`.catch()` ile hata yutulur)
  5. `page.goto('/admin')` ile admin paneline gider
  6. `expect(ordersLink).toBeVisible(...)` ile sidebar linkinin render edildiğini doğrular
  7. `expect(page.getByTestId('admin-dashboard')).toBeVisible(...)` ile dashboard bileşeninin mount olduğunu ve render-loop'da takılı kalmadığını doğrular
  8. `ordersLink.click()` ile menüye tıklar
  9. `expect(page).toHaveURL(/\/admin\/orders/...)` ile navigasyonun gerçekten gerçekleştiğini doğrular

---

## NODE ID STANDARD

  file: e2e\admin-smoke.e2e.ts