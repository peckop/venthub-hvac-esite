---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\e2e\checkout-smoke.e2e.ts
skeleton_hash: 62bc411e2b5acdd4
entity_hashes:
  overview: 529d691256ce33bd
generated_at: 2026-08-28T12:54:04Z
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

## NODE ID STANDARD

  file: e2e\checkout-smoke.e2e.ts

## Tasarım Gerekçeleri (kaynaktan BİREBİR)

> Bu bölüm LLM tarafından **yazılmadı**; kaynaktaki işaretli bloklardan
> birebir kopyalandı. Özetlenmesi veya yeniden ifade edilmesi YASAKTIR —
> gerekçenin değeri tam olarak kelimelerindedir.


```text
NİÇİN ŞİMDİ ÖNEMLİ — bu testin asıl işi bugün değişti. 2026-08-15'te ödeme yolu
FAIL-CLOSED yapıldı (T041-VH): `order-validate` doğrulaması yapılamazsa `iyzico-payment`
ödemeyi BAŞLATMIYOR ve istemci fiyatına düşen yedek yol SİLİNDİ. Bu doğru karar ama yeni
bir risk getirdi: fail-closed mantığında bir hata olsa checkout tamamen ölür ve **bunu
yakalayacak hiçbir çalışma-zamanı kapısı yoktu** — 794 testin tamamı statik/birim, hiçbiri
tarayıcı açmıyor. Bu dosya o boşluğu kapatır.

Ödeme adımına HÂLÂ girilmez (aşağıdaki güvenlik sınırı); ölçülen şey, hunının ödeme
düğmesine kadar boot olup interaktif kaldığıdır.
```

```text
⚠️ ESKİ SEÇİCİ NİÇİN KALDIRILDI (2026-08-15, karantinadan çıkarken ilk koşuda patladı):
Test "satın alınabilir kart"ı `hasNotText: 'Teklif İste'` ile arıyordu. O varsayım
ARTIK YANLIŞ: `/tr/products` F5-B'den beri `FamilyCard` basıyor ve fiyat karttan
BİLEREK kaldırıldı (PS-042 önbellek izolasyonu) — dosyanın kendi yorumu diyor ki
"her kart aynı 'Teklif İste' CTA'sını gösterir". Yani filtre SIFIR kart eşleştiriyordu.
Kod doğruydu, test eski sözleşmeyi kodluyordu.

YENİ ÇAPA: satın alınabilirliğin tek dürüst işareti PDP'deki `pdp-add-to-cart`.
Kart metnine değil, ürünün gerçekten sepete eklenebilir olmasına bakılır. 374 ailenin
348'i fiyatlı, ama İLK kartın fiyatlı olduğu garanti değil — bu yüzden ilk birkaç
kart sırayla denenir. (Kart metnine geri dönme: aynı hataya düşersin.)
```
