---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\__tests__\ReviewSummary.test.tsx
skeleton_hash: 1d7e64bb894898be
entity_hashes:
  func:wrap: 89e2dfa3f5986ebc
  overview: f36b2fc79d41d1f9
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:40:23Z
---

## Genel Bakış
Bu modül, HVAC platformu ödeme akışındaki ReviewSummary bileşeninin test süreçlerini kolaylaştıran bir test yardımcı modülüdür. Tek bir wrap fonksiyonu içerir; bu fonksiyon, test senaryolarında bileşenlerin tutarlı ve doğru ortamda render edilmesini sağlar.

## Fonksiyon Grupları
### Test Ortamı Sarmalama Fonksiyonları
Testlerde doğrudan bileşen render etmek yerine, ortam bağımlılıklarını (örn. i18n sağlayıcıları) otomatik olarak ekleyerek bileşenleri sarmalayan yardımcı işlevi içerir.
- wrap

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ReviewSummary test senaryolarında bileşenleri test ortamında sarmalayan bir test yardımcı fonksiyonu içerir. Aşağıdaki varsayımlar fonksiyon imzasından ve test yardımcı modülü olma niteliğinden türetilmiştir.

[Aksiyom 1]: Eğer `wrap` fonksiyonuna `React.ReactElement` türünde bir değer sağlanmazsa, fonksiyonun davranışı tanımsızdır veya hata fırlatır.

[Aksiyom 2]: Eğer React test çalıştırma ortamı (ör. jsdom) aktif değilse, `wrap` fonksiyonunun döndürdüğü JSX DOM'a render edilemez ve testler çalıştırılamaz.

[Aksiyom 3]: Eğer `wrap` fonksiyonu çağrılmadan önce ReviewSummary bileşeninin bağımlı olduğu bağlam sağlayıcıları (context provider) ortamda mevcut değilse, bileşen render sırasında hata verir.

[Aksiyom 4]: Eğer test ortamında ilgili modül (ReviewSummary) import edilemezse veya modül yükleme hatası alırsa, `wrap` çağrısı başarısız olur.

---

**Not:** Bu modül bir test yardımcı modülüdür; `wrap` fonksiyonunun iç implementasyonu (hangi sağlayıcıları sarmaladığı, hangi kütüphane kullanıldığı) fonksiyon imzasından çıkarılamadığından, aksiyomlar yalnızca girdi türü ve test ortamı gereksinimleri düzeyinde tanımlanmıştır. Fonksiyon gövdesinde hangi context'lerin sağlandığı bilinmiyor.

---

## FONKSİYON DETAYLARI

### wrap

**Ne yapar**: Verilen React elementini `I18nProvider` ile sararak test ortamında render eder.Uluslararası dil desteği gerektiren bileşen testleri için test sarmalayıcı (wrapper) olarak kullanılır.

**Nasıl yapar**: Fonksiyon, önce tarayıcı ortamının varlığını kontrol eder (`window` nesnesi tanımlı mı diye bakar). Eğer tarayıcı ortamındaysa, `localStorage`'a `'lang'` anahtarıyla `'tr'` değerini yazarak Türkçe dil ayarını yapar. Ardından, verilen `ui` elemanını `I18nProvider` bileşeninin içine sarar ve `render` fonksiyonu ile React Testing Library aracılığıyla render eder.

**Parametreler**:
- `ui`: React.ReactElement — Sarmalanacak ve test ortamında render edilecek React bileşeni. Genellikle test edilen bileşenin kendisi buraya geçilir.

**Dönüş**: `RenderResult` — React Testing Library'nin `render` fonksiyonunun döndürdüğü nesne. İçinde `getByText`, `queryByText`, `container` gibi test yardımcılarını barındırır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ReviewSummary.test.tsx::translationsFactory
- **params**: () 
- **ic_degiskenler**: 
  - `None` — Fonksiyon parametre almaz ve içinde değişken tanımlamaz
- **Dönüş**: `object` — `tr` anahtarını içeren çeviri nesnesi döner. `checkout.review.title`, `checkout.review.edit`, `checkout.personal.title`, `checkout.shipping.title`, `checkout.billing.title`, `checkout.invoice.title`, `checkout.invoice.individual`, `checkout.invoice.corporate` değerlerini içerir

### [N2_NASIL] AST Pointer: ReviewSummary.test.tsx::wrap
- **params**: `ui` — React bileşeni olarak test edilecek JSX
- **ic_degiskenler**: 
  - `None` — Fonksiyon içinde değişken tanımlamaz
- **Dönüş**: `render result` — `@testing-library/react`'in `render` fonksiyonunun döndürdüğü nesne. `I18nProvider` ile sarmalanmış bileşeni render eder

### [N3_NASIL] AST Pointer: ReviewSummary.test.tsx::testSuite
- **params**: () 
- **ic_degiskenler**: 
  - `None` — `describe` bloğu içinde değişken tanımlamaz, sadece `it` bloklarını çağırır
- **Dönüş**: `undefined` — Test suite'i tanımlayan yan etkili fonksiyon

### [N4_NASIL] AST Pointer: ReviewSummary.test.tsx::testSameAsShippingTrue
- **params**: () 
- **ic_degiskenler**: 
  - `heading` — `screen.getByRole('heading', { name: 'Siparişi Gözden Geçir' })` ile bulunan başlık elementi
  - `section` — `heading.closest('div')!` ile bulunan başlığın üst div'i
  - `edits` — `within(section).getAllByRole('button', { name: 'Düzenle' })` ile bulunan tüm düzenle butonları
- **Dönüş**: `undefined` — Test asertiflerini çalıştırır

### [N5_NASIL] AST Pointer: ReviewSummary.test.tsx::testSameAsShippingFalse
- **params**: () 
- **ic_degiskenler**: 
  - `heading` — `screen.getByRole('heading', { name: 'Siparişi Gözden Geçir' })` ile bulunan başlık elementi
  - `section` — `heading.closest('div')!` ile bulunan başlığın üst div'i
  - `edits` — `within(section).getAllByRole('button', { name: 'Düzenle' })` ile bulunan tüm düzenle butonları
- **Dönüş**: `undefined` — Test asertiflerini çalıştırır

### [N6_NASIL] AST Pointer: ReviewSummary.test.tsx::testEditCallbacks
- **params**: () 
- **ic_degiskenler**: 
  - `onPersonal` — `vi.fn()` ile oluşturulan mock fonksiyon (kişisel bilgi düzenleme callback'i)
  - `onShipping` — `vi.fn()` ile oluşturulan mock fonksiyon (teslimat düzenleme callback'i)
  - `onBilling` — `vi.fn()` ile oluşturulan mock fonksiyon (fatura düzenleme callback'i)
  - `onInvoice` — `vi.fn()` ile oluşturulan mock fonksiyon (fatura tipi düzenleme callback'i)
  - `heading` — `screen.getByRole('heading', { name: 'Siparişi Gözden Geçir' })` ile bulunan başlık elementi
  - `section` — `heading.closest('div')!` ile bulunan başlığın üst div'i
  - `buttons` — `within(section).getAllByRole('button', { name: 'Düzenle' })` ile bulunan tüm düzenle butonları
- **Dönüş**: `undefined` — Test asertiflerini çalıştırır

---

## NODE ID STANDARD

  file: src\views\checkout\__tests__\ReviewSummary.test.tsx
  function: src\views\checkout\__tests__\ReviewSummary.test.tsx::wrap

---

## DISA AKTARILANLAR (EXPORTS)
  export: wrap

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