---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\e2e\checkout-smoke.e2e.ts
skeleton_hash: fade75568c3fc639
entity_hashes:
  overview: 529d691256ce33bd
generated_at: 2026-06-19T09:03:18Z
---

## Genel Bakış

Bu modül, VentHub HVAC uygulamasının ödeme/checkout sürecini Playwright ile test eden bir E2E smoke testi dosyasıdır. Temel kullanıcı kimlik bilgileri (e-posta ve şifre) ile giriş yapılarak sepetten ödeme akışının sorunsuz çalıştığını doğrulamayı amaçlar. Dosya fonksiyon veya sınıf içermeyen, doğrudan modül seviyesinde çalışan bir test scriptidir.

## Test Yapısı

### Test Akışı

Bu dosya, Playwright test çerçevesi kullanarak checkout sürecinin temel adımlarını otomatik olarak test eder. ENV tabanlı kimlik doğrulama bilgileri ile oturum açılır ve ödeme sayfasındaki unsurların varlığı ve işlevselliği doğrulanır.

- Test senaryosu: Sepetten ödeme sürecinin temel (smoke) doğrulaması
- Kullanılan ortam değişkenleri: `EMAIL`, `PASSWORD`
- Bağımlılıklar: `@playwright/test` (expect, test)

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir E2E (End-to-End) test dosyasıdır ve checkout akışı için sigara testi (smoke test) senaryosunu barındırır.

**[Aksiyom 1]:** Eğer EMAIL sabiti geçerli bir test kullanıcısına ait değilse, kimlik doğrulama başarısız olur ve checkout akışı başlatılamaz.

**[Aksiyom 2]:** Eğer PASSWORD sabiti, EMAIL ile eşleşen doğru şifre değilse, oturum açma başarısız olur ve test senaryosu ilerleyemez.

**[Aksiyon 3]:** Eğer test ortamı (uygulama sunucusu, veritabanı) erişilebilir değilse, E2E testi bağlantı hatası ile başarısız olur.

**[Aksiyom 4]:** Eğer test kullanıcısının(seçili email ile) bir sepetinde yeterli ürün yoksa veya ödeme bilgileri tanımlı değilse, checkout akışı tamamlanamaz.

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

### [N1_NASIL] AST Pointer: e2e/checkout-smoke.e2e.ts::outer-test-wrapper
- **params**: () — anonim arrow, parametre yok
- **ic_degiskenler**:
  _(değişken yok — yalnız `test.skip(...)` ve iç `test(...)` çağrısı içerir)_
- **Dönüş**: yok (Playwright test registrasyon yan etkisi)

---

### [N2_NASIL] AST Pointer: e2e/checkout-smoke.e2e.ts::inner-test-callback
- **params**: `({ page })` — Playwright `test` fixture'ından destructured `Page` nesnesi
- **ic_degiskenler**:
  - `addBtn` — `page.getByTitle('Sepete Ekle', { exact: true }).first()` ile bulunan ilk "Sepete Ekle" butonu locator'ı; ürün kartındaki add butonunu temsil eder
  - `email` — `page.getByTestId('checkout-customer-email')` ile elde edilen müşteri e-posta input locator'ı; hem görünürlük kontrolü hem `fill()` ile doldurma için kullanılır
  - `city` — `page.getByTestId('checkout-ship-city')` ile elde edilen şehir input locator'ı; hem görünürlük kontrolü hem `fill()` ile doldurma için kullanılır
- **Dönüş**: yok (async test callback — tüm işlevsellik Playwright assertion/interaction yan etkileri üzerinedir; test sonucu `expect`'ler ile belirlenir)

---

### [N3_NASIL] AST Pointer: e2e/checkout-smoke.e2e.ts::poll-evaluate-callback
- **params**: () — anonim async arrow, `expect.poll()` içine verilen callback
- **ic_degiskenler**:
  _(değişken yok — doğrudan `page.evaluate()` sonucunu return eder)_
- **Dönüş**: `Promise<number>` — localStorage'daki `venthub-cart` anahtarının JSON parse edilmiş halinin dizi uzunluğu (0 veya pozitif tamsayı)

---

### [N4_NASIL] AST Pointer: e2e/checkout-smoke.e2e.ts::browser-evaluate-inner
- **params**: () — anonim arrow, `page.evaluate()` içinde tarayıcı tarafında çalışır
- **ic_degiskenler**:
  - `raw` — `localStorage.getItem('venthub-cart')` sonucu; sepet verisinin ham JSON string'i veya `null`
  - `arr` — `JSON.parse(raw)` sonucu; ham string'in parse edilmiş hali (beklenen tür: dizi)
- **Dönüş**: `number` — `null` ise `0`, parse sonrası dizi ise `arr.length`, dizi değilse `0`; `catch` bloğunda herhangi bir hata durumunda `0`

---

## NODE ID STANDARD

  file: e2e\checkout-smoke.e2e.ts