---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\tr\DistanceSalesAgreementContent.tsx
skeleton_hash: 4bfe0f08e03c6dd4
entity_hashes:
  func:DistanceSalesAgreementContentTr: 74efe788b0e15e6a
  overview: ba0f5f1025465f7f
  style_tokens: c2df28d44e819ffd
generated_at: 2026-08-27T07:39:44Z
---

## Genel Bakış
Bu modül, mesafeli satış sözleşmesinin Türkçe dil versiyonunu görüntülemek için kullanılan bir React bileşeni içerir. E-ticaret platformlarında yasal zorunluluk olarak sunulan sözleşme metnini Türkçe olarak render eder. Modül yalnızca bir bileşen fonksiyonundan oluşur ve dış bağımlılığı bulunmuyor.

## Fonksiyon Grupları

### Yasal Belge Görünümü
Mesafeli satış sözleşmesinin Türkçe içeriğini sayfada sunan bileşenin tanımlandığı gruptur. Bileşen, dil parametresini alarak sözleşme metnini ekrana render eder.
- `DistanceSalesAgreementContentTr`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca fonksiyon imzasından çıkarılabilecek varsayımlar listelenmiştir.

[Aksiyom 1]: Eğer `lang` prop'u sağlanmazsa, bileşenin nasıl davranacağı fonksiyon gövdesi bilinmediği için belirlenemez.

[Aksiyom 2]: Eğer `lang` prop'u `string` tipinde değilse, TypeScript derleme aşamasında tip uyumsuzluğu hatası oluşur.

[Aksiyom 3]: Eğer bileşenin render ettiği Türkçe sözleşme metni mevcut değilse (dosya, sabit veya kaynak eksikse), içerik boş veya hatalı görüntülenir.

---

## FONKSİYON DETAYLARI

### DistanceSalesAgreementContentTr
**Ne yapar**: Mesafeli satış sözleşmesinin Türkçe içeriğini sunan bir React bileşenidir. `views/legal/components/tr/` klasöründe konumlandırılmıştır ve yasal belge içeriklerinin dil bazlı ayrıştırılması mimarisinin bir parçasıdır.

**Nasıl yapar**: Destructuring ile aldığı `lang` prop'unu kullanarak Türkçe mesafeli satış sözleşmesi metnini render eder. Fonksiyon, `React.FC<{ lang: string }>` tipinde bir bileşen döndürecek şekilde tanımlanmıştır. Docstring boş bırakılmıştır; bileşenin dahili render mantığı hakkında kaynakta ek bilgi bulunmamaktadır.

**Parametreler**:
- lang: `{ lang: string }` — Bileşene aktarılacak dil bilgisini taşıyan nesne içerisinden destructuring ile çıkarılan dil kodu. Kaynakta bu parametrenin bileşen içinde nasıl kullanıldığına dair ek bilgi yer almamaktadır.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` prop'u alan bir React fonksiyonel bileşeni döndürür. Bu, higher-order component (HOC) yapısını işaret eder; dış fonksiyon `lang` değerini alır ve bu değeri kullanan iç bileşeni üretir.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/DistanceSalesAgreementContent.tsx::DistanceSalesAgreementContentTr
- **params**: `lang` — dil kodu, `localizedHref` çağrılarında yönlendirme URL'lerinin dillere göre oluşturulmasında kullanılır
- **ic_degiskenler**:
  - `legalConfig` — `@/config/legal` modülünden import edilen yapılandırma nesnesi; sözleşme metnindeki satıcı bilgileri, süreler ve adresler için kullanılır
    - `legalConfig.sellerTitle` — satıcı unvanı, "Taraflar" bölümünde satıcı adı olarak gösterilir
    - `legalConfig.websiteUrl` — site alan adı, sözleşme metninde platform adresi olarak gösterilir
    - `legalConfig.sellerAddress` — satıcı adresi, satıcı bilgileri alanında gösterilir
    - `legalConfig.sellerPhone` — satıcı telefonu, satıcı bilgileri alanında gösterilir
    - `legalConfig.sellerEmail` — satıcı e-posta adresi, satıcı bilgileri alanında ve cayma bildirim adresi olarak gösterilir
    - `legalConfig.kepAddress` — satıcı KEP adresi, satıcı bilgileri alanında gösterilir
    - `legalConfig.mersis` — MERSİS numarası, satıcı bilgileri alanında gösterilir
    - `legalConfig.tradeRegistryNo` — ticaret sicil numarası, satıcı bilgileri alanında gösterilir
    - `legalConfig.chamberOfCommerce` — kayıtlı olunan oda, satıcı bilgileri alanında gösterilir
    - `legalConfig.taxOffice` — vergi dairesi, satıcı bilgileri alanında gösterilir
    - `legalConfig.taxNumber` — vergi numarası, satıcı bilgileri alanında gösterilir
    - `legalConfig.etbisNo` — ETBİS kayıt numarası, satıcı bilgileri alanında gösterilir
    - `legalConfig.refundTime` — iade süresi, fiyat/stok hatası ve cayma hakkı iade koşullarında gösterilir
    - `legalConfig.invoiceDeliveryTime` — fatura teslim süresi, fatura düzenleme koşullarında gösterilir
    - `legalConfig.deliveryTime` — teslimat süresi, teslimat bölümünde kargoya verilme süresi olarak gösterilir
    - `legalConfig.cargoCompanies` — taşıyıcı firma bilgisi, teslimat ve iade kargo koşullarında gösterilir
    - `legalConfig.returnAddress` — iade gönderim adresi, cayma hakkı kullanımı bölümünde gösterilir
    - `legalConfig.returnShippingBearer` — iade kargo masrafını üstlenen taraf, iade masrafları koşullarında gösterilir
    - `legalConfig.warrantyPeriod` — garanti süresi, ayıplı mal bölümünde gösterilir
    - `legalConfig.usefulLife` — kullanım ömrü, ayıplı mal bölümünde gösterilir
    - `legalConfig.afterSalesService` — yetkili servis/satış sonrası hizmet bilgisi, ayıplı mal bölümünde gösterilir
    - `legalConfig.lastUpdated` — sözleşme son güncelleme tarihi, yürürlük bölümünde gösterilir
  - `Routes` — `@/utils/routes` modülünden import edilen rota tanımları nesnesi
    - `Routes.legal.onBilgilendirme()` — Ön Bilgilendirme Formu sayfasının rota yolunu döndüren fonksiyon; Link bileşenlerinin `href` prop'unda kullanılır
    - `Routes.legal.kvkk()` — KVKK Aydınlatma Metni sayfasının rota yolunu döndüren fonksiyon; Link bileşeninin `href` prop'unda kullanılır
  - `localizedHref` — `@/utils/routes` modülünden import edilen fonksiyon; rota yolu ve `lang` parametresini alarak dile özgü URL oluşturur, Link bileşenlerinin `href` değerinde kullanılır
  - `Link` — `next/link` modülünden import edilen Next.js bağlantı bileşeni; Ön Bilgilendirme Formu ve KVKK metni bağlantılarında kullanılır
- **Dönüş**: JSX (React.ReactNode) — Mesafeli Satış Sözleşmesi'nin Türkçe içeriğini oluşturan 14 bölüm (Taraflar, Tanımlar, Konu, Sözleşmenin Kurulması, Ürün/Bedel ve Ödeme Koşulları, Teslimat, Cayma Hakkı, Cayma Hakkının Kullanımı/İade/Masraflar, Cayma Hakkının İstisnaları, Ayıplı Mal/Garanti/Satış Sonrası Hizmet, Mücbir Sebepler, Kişisel Verilerin Korunması, Uyuşmazlıkların Çözümü, Yürürlük) içeren React fragment'ı

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\DistanceSalesAgreementContent.tsx
  function: src\views\legal\components\tr\DistanceSalesAgreementContent.tsx::DistanceSalesAgreementContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: DistanceSalesAgreementContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `mt-2`, `pl-6`, `space-y-1`, `underline`