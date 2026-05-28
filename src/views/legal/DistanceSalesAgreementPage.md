---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\DistanceSalesAgreementPage.tsx
skeleton_hash: b87686df266773f0
entity_hashes:
  func:DistanceSalesAgreementPage: 818f8664074dced3
  overview: 926bc742391d576d
  style_tokens: bd7814a811af4780
generated_at: 2026-05-28T22:40:07Z
---

## Genel Bakış
Bu modül, hukuk bölümündeki “Uzaktan Satış Sözleşmesi” sayfasını gösteren bir React bileşenidir. Sayfanın görsel yapısını oluşturur ve kullanıcıyla etkileşim gerektiğinde gerekli durum yönetimini sağlar.

## Fonksiyon Grupları
### UI Rendering
Sayfanın düzenini ve içeriğini oluşturarak kullanıcıya Uzaktan Satış Sözleşmesi metnini ve ilgili öğeleri sunar.
- DistanceSalesAgreementPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### DistanceSalesAgreementPage
**Ne yapar**: `DistanceSalesAgreementPage` fonksiyonu, bir React Functional Component (FC) tanımlayarak “Distance Sales Agreement” (Uzak Satış Sözleşmesi) sayfasının UI yapısını oluşturur.  

**Nasıl yapar**: Fonksiyon, parametre almaz ve doğrudan bir React.FC nesnesi döndürür; bu nesne içinde JSX markup ve gerekli React hook’ları bulunur (detaylar fonksiyonun içeriğine göre değişir).  

**Parametreler**:  
- (Parametre yok)

**Dönüş**: `React.FC` — Sayfanın render edilmesini sağlayan bir React Functional Component.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/DistanceSalesAgreementPage.tsx::DistanceSalesAgreementPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `legalConfig` — Proje genelinde hukuki metinlerde kullanılan sabit konfigürasyon nesnesi, sözleşmedeki dinamik değerleri sağlamak için kullanılır
  - `legalConfig.sellerTitle` — Sözleşmenin taraflar bölümünde satıcının unvanını göstermek için kullanılır
  - `legalConfig.websiteUrl` — Platformun internet adresini sözleşmenin ilgili bölümlerinde belirtmek için kullanılır
  - `legalConfig.sellerAddress` — Satıcının fiziksel iletişim adresini sözleşmede göstermek için kullanılır
  - `legalConfig.sellerEmail` — Satıcının e-posta adresini iletişim ve cayma bildirimleri bölümlerinde belirtmek için kullanılır
  - `legalConfig.sellerPhone` — Satıcının telefon numarasını iletişim bölümünde göstermek için kullanılır
  - `legalConfig.taxOffice` — Satıcının vergi dairesi bilgisini sözleşmede belirtmek için kullanılır
  - `legalConfig.taxNumber` — Satıcının vergi numarasını sözleşmede göstermek için kullanılır
  - `legalConfig.deliveryTime` — Siparişin kargoya verileceği süreyi teslimat bölümünde belirtmek için kullanılır
  - `legalConfig.returnAddress` — Ürün iadeleri için gönderilecek adresi cayma hakkı bölümünde göstermek için kullanılır
  - `legalConfig.cargoCompanies` — İade kargo firması bilgisini iade süreci bölümünde belirtmek için kullanılır
  - `legalConfig.refundTime` — Ücret iadesinin yapılacağı maksimum süreyi iade bölümünde belirtmek için kullanılır
  - `legalConfig.lastUpdated` — Sözleşmenin yürürlüğe giriş tarihini son bölümde göstermek için kullanılır
- **Dönüş**: Mesafeli satış sözleşmesi sayfasının tüm UI içeriğini barındıran React JSX elementi

---

## NODE ID STANDARD

  file: src\views\legal\DistanceSalesAgreementPage.tsx
  function: src\views\legal\DistanceSalesAgreementPage.tsx::DistanceSalesAgreementPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: DistanceSalesAgreementPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `bg-yellow-50`, `border-light-gray`, `border-yellow-200`, `text-3xl`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-xl`, `text-xs`, `text-yellow-800`
- **Layout:** `bg-yellow-50`, `border-yellow-200`, `max-w-4xl`, `max-w-prose`, `p-4`, `p-6`, `shadow-sm`, `text-yellow-800`
- **Varyant/Responsive:** `dark:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `dark:prose-invert`, `font-bold`, `font-semibold`, `lg:px-8`, `mb-3`, `mb-6`, `mt-2`, `mt-4`, `mx-auto`, `prose`, `px-4`, `py-10`, `rounded-lg`, `rounded-xl`