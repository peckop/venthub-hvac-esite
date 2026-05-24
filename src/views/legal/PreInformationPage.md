---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\PreInformationPage.tsx
skeleton_hash: 47f4bda80ce59bb6
generated_at: 2026-05-23T22:41:14Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kullanıcı arayüzündeki hukuki içerikli sayfalardan biri olan ön bilgi sayfasını yöneten React bileşen modülüdür. Kullanıcıların hizmete erişmeden önce incelemeleri gereken yasal ön bilgileri sunmak üzere geliştirilmiştir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tüm sorumluluğunu üstlenen, hukuki ön bilgi sayfasının kullanıcı arayüzünü ve çalışma mantığını tek başına yöneten ana React bileşenidir, sayfadaki tüm içerikleri kullanıcıya sunar.
- PreInformationPage

---

## AXIOMS – Mimari Varsayımlar
VentHub HVAC projesinin yasal görünüm katmanında yer alan istemci tarafı React sayfa bileşenidir, çalışması için uygulamanın temel frontend mimarisinin ilgili tüm bağımlılık ve yapılandırma koşullarını sağlaması zorunludur.

[Aksiyom 1]: Eğer projenin kök React çalışma zamanı hook desteği sunan 16.8 veya üstü bir sürüm değilse, bu sayfa bileşeni hiç render edilemez, uygulama çalışması sırasında hataya yol açar.
[Aksiyom 2]: Eğer uygulamanın istemci tarafı rota yönetim sisteminde PreInformationPage için tanımlı geçerli bir erişim rotası yoksa, kullanıcı bu yasal sayfaya hiç erişemez, 404 bulunamadı hatası alır.
[Aksiyom 3]: Eğer bu sayfada gösterilecek yasal ön bilgi içeriklerine erişim için gerekli kaynak erişimi (statik içerik dosyası veya içerik API'si) yoksa, sayfada boş içerik gösterilir, yasal bilgilendirme zorunluluğu karşılanamaz.
[Aksiyom 4]: Eğer uygulamanın yetkilendirme katmanında bu yasal sayfanın oturum açmamış kullanıcılar dahil herkese erişilebilir olmasına izin veren kural tanımlı değilse, kullanıcılar yetkisiz erişim nedeniyle giriş ekranına yönlendirilir, yasal gereklilikler ihlal edilir.

---

## FONKSIYON DETAYLARI

### PreInformationPage
**Ne yapar**: VentHub HVAC projesinin yasal süreçler kapsamında kullanılan ön bilgilendirme sayfasını oluşturan ana React bileşenidir. Kullanıcılara herhangi bir yasal işlem başlamadan önce sunulması gereken temel ön bilgileri görüntülemek amacıyla tasarlanmış, projenin yasal sayfaları grubunda yer alan bağımsız bir sayfa bileşenidir.
**Nasıl yapar**: Herhangi bir harici giriş parametresi almadan çalışacak şekilde tasarlanan bu fonksiyon, React.FC tipinde bir bileşen döndürerek projenin yönlendirme sistemi üzerinden erişilen bağımsız bir sayfa olarak çalışır. VentHub projesinin src/views/legal dizini altında konumlanarak tüm yasal içerikli sayfaların toplandığı kategoride yer alır, dahili olarak kendi içeriğini yöneterek harici prop bağımlılığı olmadan çalışır.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz, bağımsız olarak çalışacak şekilde tasarlanmıştır.
**Dönüş**: React.FC — React ekosistemi ile uyumlu, tarayıcı ortamında DOM'a eklendiğinde ön bilgilendirme sayfasının tüm kullanıcı arayüzünü render edebilen bir fonksiyonel React bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\legal\PreInformationPage.tsx::PreInformationPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `legalConfig` — Hukuki metinlerde kullanılacak sabit şirket ve operasyonel değerleri içeren import edilmiş config nesnesi
  - `legalConfig.sellerTitle` — Satıcı ünvanını ekrana yazdırmak için kullanılan config değeri
  - `legalConfig.sellerAddress` — Satıcı adresini ekrana yazdırmak için kullanılan config değeri
  - `legalConfig.sellerEmail` — Satıcı iletişim e-postasını ekrana yazdırmak için kullanılan config değeri
  - `legalConfig.sellerPhone` — Satıcı iletişim telefonunu ekrana yazdırmak için kullanılan config değeri
  - `legalConfig.taxOffice` — Satıcı vergi dairesi bilgisini ekrana yazdırmak için kullanılan config değeri
  - `legalConfig.taxNumber` — Satıcı vergi numarasını ekrana yazdırmak için kullanılan config değeri
  - `legalConfig.deliveryTime` — Teslimat süresi bilgisini ekrana yazdırmak için kullanılan config değeri
  - `legalConfig.shippingFee` — Kargo ücreti bilgisini ekrana yazdırmak için kullanılan config değeri
  - `legalConfig.returnAddress` — İade adresi bilgisini ekrana yazdırmak için kullanılan config değeri
  - `legalConfig.lastUpdated` — Ön bilgilendirme formunun son güncellenme tarihini ekrana yazdırmak için kullanılan config değeri
- **Dönüş**: React.FC (Ön Bilgilendirme Formu arayüzünü içeren JSX elementi)

---

## NODE ID STANDARD

  file: src\views\legal\PreInformationPage.tsx
  function: src\views\legal\PreInformationPage.tsx::PreInformationPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: PreInformationPage