---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\category\SilentFanWizard.test.tsx
skeleton_hash: 857074c9446e8544
entity_hashes:
  func:ac: 0ceb3e9131161c62
  overview: f29d305e3eba79d7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:00:10Z
---

## Genel Bakış

Bu modül, SilentFanWizard bileşenini test eden bir test dosyasıdır. Dosya adından anlaşılacağı üzere, sessiz fan sihirbazı bileşeninin davranışlarını doğrulamaya yöneliktir. Modülde yalnızca `ac` adında tek bir fonksiyon tanımlıdır.

## Fonksiyon Grupları

### Test Yardımcıları
Modülde tanımlı tek fonksiyondur. Kaynakta bu fonksiyonun ne iş yaptığına dair ayrıntı bulunmamaktadır; yalnızca adı verilmiştir.

- ac

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediğinden (`ac()` yalnızca imza olarak mevcut), davranışsal çıkarım yapılamamaktadır. Modül sabitleri (`getWizardCandidatesMock`, `ADAYLAR`) tanımlanmış olup test altyapısının bu değerlere erişim sağladığı bilinmektedir; ancak bunların nasıl kullanıldığı fonksiyon gövdesi olmadan belirlenemez.

---

## FONKSİYON DETAYLARI

### ac
**Ne yapar**: SilentFanWizard bileşenini test ortamında varsayılan prop'larla render eden yardımcı bir test fonksiyonudur. Test dosyasında tekrar tekrar aynı render işlemini yazmak yerine bu fonksiyon çağrılarak kod tekrarı önlenir.

**Nasıl yapar**: React Testing Library'nin `render` fonksiyonunu çağırarak `SilentFanWizard` bileşenini belirli varsayılan prop'larla birlikte render eder. `isOpen` prop'u true olarak, `onClose` prop'u Vitest kütüphanesinin `vi.fn()` fonksiyonuyla oluşturulan bir mock fonksiyon olarak ve `categorySlug` prop'u `"inline-duct-fans"` string değeri olarak iletilir. `vi.fn()`, çağrıları izlenebilen ve davranışları test sırasında özelleştirilebilen sahte bir fonksiyon oluşturur.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: React Testing Library'nin `render` fonksiyonunun dönüş değerini döndürür. Bu dönüş değeri, render edilen bileşen üzerinde sorgulama yapma (`getByText`, `getByRole` vb.), yeniden render etme ve diğer test işlemlerini gerçekleştirmek için kullanılan bir nesnedir.

---

## İTHALATLAR (IMPORTS)
- import: ./SilentFanWizard::SilentFanWizard
- import: @/lib/hvac/ductFanSelection::type { FanAdayi }
- import: @testing-library/react::fireEvent
- import: @testing-library/react::render
- import: @testing-library/react::screen
- import: @testing-library/react::waitFor
- import: react::React
- import: vitest::beforeEach
- import: vitest::describe
- import: vitest::expect
- import: vitest::it
- import: vitest::vi

---

## SABİTLER
- **getWizardCandidatesMock** (call) — `vi.fn()`
- **ADAYLAR** (array) — `[
  {
    id: 'p-150',
    sku: 'VRT-17162',
    ad: 'Vortice Lineo 150 Q...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: SilentFanWizard.test.tsx::ac
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `render` fonksiyonunun dönüşü (RenderResult)

### [N2_NASIL] AST Pointer: SilentFanWizard.test.tsx::vi.mock (hvac/ductFanSelection factory)
- **params**: yok
- **ic_degiskenler**:
  - `args` — spread ile `getWizardCandidatesMock`'a aktarılan bilinmeyen argümanlar
- **Dönüş**: `{ getWizardCandidates: Function }` — mock edilmiş modül nesnesi

### [N3_NASIL] AST Pointer: SilentFanWizard.test.tsx::vi.mock (supabaseBrowserClient factory)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ supabaseBrowserClient: {} }` — boş nesne döndüren mock modül

### [N4_NASIL] AST Pointer: SilentFanWizard.test.tsx::vi.mock (useI18n factory)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ useI18n: Function }` — `useI18n` hook'unu döndüren mock modül

### [N5_NASIL] AST Pointer: SilentFanWizard.test.tsx::useI18n (mock dönüşü)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ t: Function, lang: string }` — `t` fonksiyonu ve `'tr'` dili

### [N6_NASIL] AST Pointer: SilentFanWizard.test.tsx::t (i18n çeviri fonksiyonu)
- **params**: `key: string`, `params?: Record<string, string | number>`
- **ic_degiskenler**:
  - `key` — çeviri anahtarı
  - `params` — opsiyonel parametre sözlüğü; varsa `Object.values(params).join(',')` ile virgülle birleştirilip key'e eklenir
- **Dönüş**: `string` — params varsa `"key:deger1,deger2"`, yoksa `key` aynen döner

### [N7_NASIL] AST Pointer: SilentFanWizard.test.tsx::vi.mock (useLocalizedRoutes factory)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ useLocalizedRoutes: Function }` — mock modül

### [N8_NASIL] AST Pointer: SilentFanWizard.test.tsx::useLocalizedRoutes (mock dönüşü)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ product: Function }` — `product` fonksiyonu döner

### [N9_NASIL] AST Pointer: SilentFanWizard.test.tsx::product (localized route fonksiyonu)
- **params**: `slug: string`
- **ic_degiskenler**:
  - `slug` — ürün slug'ı; URL'de kullanılır
- **Dönüş**: `string` — `` `/tr/products/${slug}` ``

### [N10_NASIL] AST Pointer: SilentFanWizard.test.tsx::beforeEach (her testten önce)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `getWizardCandidatesMock.mockReset()` ile sıfırlanır, `getWizardCandidatesMock.mockResolvedValue(ADAYLAR)` ile varsayılan yanıt ayarlanır

### [N11_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('kapalıyken HİÇBİR şey basmaz ve veri de çekmez')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `isOpen={false}` ile render eder, dialog olmadığını ve `getWizardCandidatesMock` çağrılmadığını doğrular

### [N12_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('açıkken modal ve ilk adım görünür')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `ac()` ile render eder, dialog ve `'silentFanWizard.step1Title'` metninin varlığını doğrular

### [N13_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('mahal seçilince ikinci adıma geçer')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `ac()` ile render eder, `'silentFanWizard.room.kitchen'` tıklanır, `'silentFanWizard.step2Title'` görünür

### [N14_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('geri butonu bir önceki adıma döndürür')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `ac()` ile render eder, `'silentFanWizard.room.bedroom'` tıklanır, `'silentFanWizard.goBack'` label'lı buton tıklanır, `'silentFanWizard.step1Title'` geri gelir

### [N15_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('⭐kullanıcı hiçbir şeye dokunmadan sonuca atlayabilir')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `ac()` ile render eder, `'silentFanWizard.skipToResult'` tıklanır, `waitFor` ile `'silentFanWizard.resultTitle'` görünür, `getWizardCandidatesMock`'ın `'inline-duct-fans'` ile çağrıldığı doğrulanır

### [N16_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('üç öneri rozetini ve gerekçe cümlesini basar')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `ac()` ile render eder, `'silentFanWizard.skipToResult'` tıklanır, `'silentFanWizard.badgeBest'`, `'silentFanWizard.badgeQuietest'`, `'silentFanWizard.badgeEfficient'` rozetleri ve `resultNeed` regex deseni doğrulanır

### [N17_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('önerilen ürün kartı gerçek ürüne link verir')
- **params**: yok
- **ic_degiskenler**:
  - `linkler` — `screen.getAllByText('silentFanWizard.cardCta')` ile bulunan tüm CTA elementleri
- **Dönüş**: yok — yan etki: `ac()` ile render eder, `'silentFanWizard.skipToResult'` tıklanır, `/Vortice Lineo/` regex ile eşleşen element sayısı > 0 doğrulanır, ilk link'in `href`'inde `'/tr/products/vortice-lineo-'` içerdiği doğrulanır

### [N18_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('hesap dökümü İSTENİRSE açılır — varsayılan kapalı')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `ac()` ile render eder, `'silentFanWizard.skipToResult'` tıklanır, `'silentFanWizard.showDetails'` görünür, `'silentFanWizard.detailVolume'` başta yoktur, `'silentFanWizard.showDetails'` tıklanınca `'silentFanWizard.detailVolume'` ve `'silentFanWizard.detailNeed'` görünür

### [N19_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('⭐uygun model yoksa SESSİZ kalmaz, açıkça söyler')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `getWizardCandidatesMock.mockResolvedValue` ile tek zayıf aday (`pqCurveHam: '[[0, 20], [15, 10], [30, 0]]'`, `maksDebiM3h: 30`) atanır, `ac()` ile render eder, `'silentFanWizard.skipToResult'` tıklanır, `'silentFanWizard.noMatchTitle'` görünür, `'silentFanWizard.badgeBest'` yoktur

### [N20_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('⭐sorgu patlarsa hata YUTULMAZ — kullanıcı görür')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `getWizardCandidatesMock.mockRejectedValue` ile `Error('column category_slugs does not exist')` atanır, `ac()` ile render eder, `'silentFanWizard.skipToResult'` tıklanır, `'silentFanWizard.errorTitle'` görünür, `'silentFanWizard.resultTitle'` yoktur

### [N21_NASIL] AST Pointer: SilentFanWizard.test.tsx::it('aday listesi iki kez ÇEKİLMEZ (baştan başlayınca da)')
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki: `ac()` ile render eder, `'silentFanWizard.skipToResult'` tıklanır, `'silentFanWizard.resultTitle'` görünür, `'silentFanWizard.restart'` tıklanır, tekrar `'silentFanWizard.skipToResult'` tıklanır, `'silentFanWizard.resultTitle'` tekrar görünür, `getWizardCandidatesMock`'ın yalnızca 1 kez çağrıldığı doğrulanır

---

## NODE ID STANDARD

  file: src\components\category\SilentFanWizard.test.tsx
  function: src\components\category\SilentFanWizard.test.tsx::ac

---

## DISA AKTARILANLAR (EXPORTS)
  export: ac

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