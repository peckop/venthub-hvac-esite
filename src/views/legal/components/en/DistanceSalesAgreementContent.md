---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\en\DistanceSalesAgreementContent.tsx
skeleton_hash: c6c503b55cc8e727
entity_hashes:
  func:DistanceSalesAgreementContentEn: d5e77ac6d6f1d0fc
  overview: e09c7552d45f9eb1
  style_tokens: c2df28d44e819ffd
generated_at: 2026-08-27T07:36:41Z
---

## Genel Bakış

Bu modül, mesafeli satış sözleşmesinin İngilizce içeriğini görüntülemek için kullanılan bir React bileşeni içerir. Bileşen, dil parametresi alarak çoklu dil desteği sağlar. Modül, yasal belgelerin kullanıcıya sunulduğu bir görünüm katmanında yer alır.

## Fonksiyon Grupları

### Bileşen
Mesafeli satış sözleşmesinin İngilizce metnini kullanıcı arayüzünde render eder. Dil parametresi ile çalışır ve yasal içerik sunumundan sorumludur.
- DistanceSalesAgreementContentEn

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Fonksiyon gövdesi sağlanmadığından, yalnızca imzadan (`{ lang }` parametresi alan bir React bileşeni) yola çıkılarak modülün doğru çalışması için gerekli koşullar belirlenememektedir. Mimari varsayımların üretilebilmesi için fonksiyon gövdesinin incelenmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### DistanceSalesAgreementContentEn

**Ne yapar**: Mesafeli satış sözleşmesi içeriğini görüntülemek için kullanılan bir React fonksiyonel bileşenidir. Fonksiyon adındaki "En" suffix'i, bu bileşenin İngilizce dilindeki içeriği temsil ettiğini gösterir. Docstring boş bırakılmıştır; bileşenin detaylı işlev tanımı kaynak kodda belirtilmemiştir.

**Nasıl yapar**: React fonksiyonel bileşeni (FC) olarak tanımlanmıştır. Parametre olarak aldığı `lang` prop'unu destructuring yöntemiyle çıkararak kullanır. Bileşenin iç mantığı ve render edeceği içerik hakkında kaynakta ek bilgi bulunmamaktadır.

**Parametreler**:
- lang: `{ lang: string }` — Bileşenin hangi dilde içerik göstereceğini belirten string değer. Fonksiyon tanımında destructuring ile alınır; dışarıdan bir obje içinde `lang` property'si olarak iletilir.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` adında string tipinde bir prop alan bir React fonksiyonel bileşeni döndürür. Bu dönüş tipi, bileşenin JSX elementi olarak kullanılabilir olduğunu ve çağrıldığı yerde `lang` prop'unun zorunlu olarak iletilmesi gerektiğini belirtir.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfigEn
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/DistanceSalesAgreementContent.tsx::DistanceSalesAgreementContentEn
- **params**: `lang` — bileşenin görüntüleneceği dil kodu (string)
- **ic_degiskenler**:
  - `legalConfig` — `@/config/legal` modülünden import edilen `legalConfigEn` nesnesi; satıcı unvanı, adres, telefon, e-posta, KEP, MERSIS, ticaret sicil, oda, vergi dairesi/numarası, ETBIS, iade süresi, fatura teslim süresi, teslimat süresi, kargo firmaları, iade adresi, iade kargo sorumlusu, garanti süresi, faydalı ömür, satış sonrası servis ve son güncelleme tarihi alanlarını içerir
  - `localizedHref` — `@/utils/routes` modülünden import edilen fonksiyon; verilen rota yolunu `lang` parametresine göre yerelleştirilmiş URL'ye dönüştürür
  - `Routes` — `@/utils/routes` modülünden import edilen rota tanımları nesnesi; `Routes.legal.onBilgilendirme()` ve `Routes.legal.kvkk()` çağrılarıyla mesafeli satış sözleşmesi ön bilgilendirme formu ve KVKK aydınlatma metni sayfalarının yolları elde edilir
  - `Link` — `next/link` modülünden import edilen bileşen; ön bilgilendirme formu ve KVKK aydınlatma metni sayfalarına yönlendirme bağlantıları oluşturmak için kullanılır
  - `legalConfig.sellerTitle` — satıcı ticari unvanı, sözleşmenin taraflar bölümünde satıcı adı olarak gösterilir
  - `legalConfig.websiteUrl` — e-ticaret sitesi URL'si, taraflar bölümünde ve tanımlar bölümünde platform adresi olarak gösterilir
  - `legalConfig.sellerAddress` — satıcı adres bilgisi, taraflar bölümünde gösterilir
  - `legalConfig.sellerPhone` — satıcı telefon numarası, taraflar bölümünde gösterilir
  - `legalConfig.sellerEmail` — satıcı e-posta adresi, taraflar bölümünde ve cayma bildirimi gönderim adresi olarak gösterilir
  - `legalConfig.kepAddress` — satıcı KEP adresi, taraflar bölümünde gösterilir
  - `legalConfig.mersis` — MERSIS numarası, taraflar bölümünde gösterilir
  - `legalConfig.tradeRegistryNo` — ticaret sicil numarası, taraflar bölümünde gösterilir
  - `legalConfig.chamberOfCommerce` — ticaret odası bilgisi, taraflar bölümünde gösterilir
  - `legalConfig.taxOffice` — vergi dairesi adı, taraflar bölümünde gösterilir
  - `legalConfig.taxNumber` — vergi numarası, taraflar bölümünde gösterilir
  - `legalConfig.etbisNo` — ETBIS kayıt numarası, taraflar bölümünde gösterilir
  - `legalConfig.refundTime` — iade süresi, mal/hizmet ve fiyat bölümünde fiyat/ürün hatalarında iade süresi ve cayma hakkının kullanılması bölümünde iade işlem süresi olarak gösterilir
  - `legalConfig.invoiceDeliveryTime` — fatura teslim süresi, mal/hizmet ve fiyat bölümünde e-fatura/e-arşiv fatura gönderim süresi olarak gösterilir
  - `legalConfig.deliveryTime` — teslimat süresi, teslimat bölümünde kargoya verilme süresi olarak gösterilir
  - `legalConfig.cargoCompanies` — kargo firması bilgisi, teslimat bölümünde taşıyıcı ve cayma hakkının kullanılması bölümünde iade kargo firması olarak gösterilir
  - `legalConfig.returnAddress` — iade gönderim adresi, cayma hakkının kullanılması bölümünde ürün iade adresi olarak gösterilir
  - `legalConfig.returnShippingBearer` — iade kargo masrafını üstlenen taraf bilgisi, cayma hakkının kullanılması bölümünde gösterilir
  - `legalConfig.warrantyPeriod` — garanti süresi, ayıplı mal ve garanti bölümünde gösterilir
  - `legalConfig.usefulLife` — faydalı ömür bilgisi, ayıplı mal ve garanti bölümünde gösterilir
  - `legalConfig.afterSalesService` — yetkili servis / satış sonrası iletişim bilgisi, ayıplı mal ve garanti bölümünde gösterilir
  - `legalConfig.lastUpdated` — sözleşmenin son güncelleme tarihi, yürürlük bölümünde metin tarihi olarak gösterilir
- **Dönüş**: React.ReactNode — 14 maddelik mesafeli satış sözleşmesi içeriğini JSX olarak döndürür; taraflar, tanımlar, konu, sözleşmenin kurulması ve saklanması, mal/hizmet ve fiyat, teslimat, cayma hakkı, cayma hakkının kullanılması ve iade, cayma hakkının istisnaları, ayıplı mal/garanti/satış sonrası, mücbir sebep, kişisel verilerin korunması, uyuşmazlık çözümü ve yürürlük bölümlerini içerir

---

## NODE ID STANDARD

  file: src\views\legal\components\en\DistanceSalesAgreementContent.tsx
  function: src\views\legal\components\en\DistanceSalesAgreementContent.tsx::DistanceSalesAgreementContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: DistanceSalesAgreementContentEn

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