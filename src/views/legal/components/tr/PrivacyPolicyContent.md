---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\tr\PrivacyPolicyContent.tsx
skeleton_hash: 1bc648a0cf64b837
entity_hashes:
  func:PrivacyPolicyContentTr: 6b0fd40aa0eb2227
  overview: 2458658c904596d0
  style_tokens: 4e890ff82c62079d
generated_at: 2026-06-16T11:57:39Z
---

## Genel Bakış
Bu modül, VentHUB platformunun yasal sayfaları için kullanılan, Türkçe gizlilik politikası içeriğini sunan bir React bileşenidir. Tek bir fonksiyonel bileşen olarak, kullanıcılara yasal düzenlemeler ve veri koruma politikaları hakkında bilgilendirici bir içerik sunar.

## Fonksiyon Grupları
### Statik İçerik Sunumu
Modül, gizlilik politikasının tam metnini doğrudan bileşen içinde tanımlanmış JSX yapısıyla statik olarak render eder.
- PrivacyPolicyContentTr

---

## AXIOMS – Mimari Varsayımlar

Bu modül, yasal gizlilik politikası içeriğini Türkçe olarak render eden bir React fonksiyonel bileşenidir.

**[Aksiyom 1]:** Eğer `lang` prop'u bileşene sağlanmazsa, bileşen çalışmayabilir veya beklenmeyen bir davranış gösterebilir.

**[Aksiyom 2]:** Eğer `lang` prop'u geçerli bir string değeri almazsa, içerik diline göre doğru render edilemeyebilir.

**[Aksiyom 3]:** Eğer React çalışma ortamı (React runtime) mevcut değilse, bileşen hiç oluşturulamaz.

---

> **Not:** Bu modül minimal bir imzaya sahiptir — `lang` prop'u dışında herhangi bir parametre, varsayılan değer veya sabit tanımlanmamıştır. Fonksiyon gövdesi verilmediği için bileşenin hangi içeriği render ettiği ve `lang` değerine bağlı olarak ne tür bir mantık yürüttüğü bilinmemektedir. Ek aksiyomlar, fonksiyon gövdesi incelendikten sonra eklenebilir.

---

## FONKSİYON DETAYLARI

### PrivacyPolicyContentTr
**Ne yapar**: Bu fonksiyon, Türkçe gizlilik politikası içeriğini render eden bir React fonksiyonel bileşenidir. Hukuki metinlerin Türkçe versiyonunu kullanıcıya göstermek amacıyla tasarlanmıştır.

**Nasıl yapar**: Bileşen, verilen `lang` prop'una göre dil ayarını alır ve Türkçe gizlilik politikası içeriğini döndürür. `React.FC` (Functional Component) tipi ile tanımlandığı için stateless bir yapıda çalışır ve doğrudan JSX içeriği üretir.

**Parametreler**:
- lang: string — Bileşenin hangi dilde içerik göstereceğini belirleyen dil kodu parametresi. Destructure edilmiş bir prop nesnesi (`{ lang }`) olarak alınır.

**Dönüş**: `React.FC<{ lang: string }>` — TypeScript ile tip güvenli olarak tanımlanmış, lang parametresini kabul eden bir React fonksiyonel bileşeni döndürür. Bu bileşen, Türkçe gizlilik politikası içeriğini render eden JSX yapısını üretir.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/PrivacyPolicyContent.tsx::PrivacyPolicyContentTr
- **params**: `{ lang }` — string, dil kodu, localizedHref fonksiyonuna geçirilir
- **ic_degiskenler**: (fonksiyon gövdesinde herhangi bir yerel değişken tanımlanmamıştır; tüm değerler parametrelerden ve import edilen modüllerden doğrudan erişilir)
  - `legalConfig.sellerTitle` — Yasal satıcı unvanı, Veri Sorumlusu bölümünde render edilir
  - `legalConfig.sellerAddress` — Satıcı adresi, Veri Sorumlusu bölümünde render edilir
  - `legalConfig.sellerEmail` — Satıcı e-postası, Veri Sorumlusu bölümünde render edilir
  - `legalConfig.sellerPhone` — Satıcı telefonu, Veri Sorumlusu bölümünde render edilir
  - `legalConfig.retentionOrders` — Sipariş/fatura verilerinin saklama süresi, Saklama Süreleri bölümünde render edilir
  - `legalConfig.retentionSupport` — Destek yazışmalarının saklama süresi, Saklama Süreleri bölümünde render edilir
  - `legalConfig.retentionMarketing` — Pazarlama verilerinin saklama süresi, Saklama Süreleri bölümünde render edilir
  - `legalConfig.retentionLogs` — Log/güvenlik kayıtlarının saklama süresi, Saklama Süreleri bölümünde render edilir
  - `legalConfig.applicationEmail` — KVKK başvuru e-postası, Haklarınız bölümünde render edilir
  - `legalConfig.lastUpdated` — Politikanın son güncelleme tarihi, Güncellemeler bölümünde render edilir
  - `Routes.legal.cerez()` — Çerez Politikası sayfası rota üretici fonksiyonu, localizedHref'e argüman olarak geçirilir
  - `localizedHref(Routes.legal.cerez(), lang)` — Dil duyarlı href üretici, Çerez Politikası Linkinin href değerini oluşturur
  - `lang` — Parametre, localizedHref fonksiyonuna ikinci argüman olarak geçirilir
- **Dönüş**: JSX fragment — 8 bölüm içeren Gizlilik Politikası içeriği (Veri Sorumlusu, Toplanan Veriler, İşleme Amaçları, Paylaşımlar, Çerezler, Saklama Süreleri, Haklarınız, Güncellemeler)

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\PrivacyPolicyContent.tsx
  function: src\views\legal\components\tr\PrivacyPolicyContent.tsx::PrivacyPolicyContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: PrivacyPolicyContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-primary-navy`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `pl-6`, `space-y-1`, `underline`