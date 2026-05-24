---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\PrivacyPolicyPage.tsx
skeleton_hash: 236dec3edf614633
generated_at: 2026-05-23T22:41:22Z
---

## Genel Bakış
VentHub HVAC platformunun yasal bölümünde yer alan bu modül, kullanıcılara platformun gizlilik politikasını sunan React tabanlı bir ön yüz bileşeni barındırır. Yasal sayfalar kategorisinde yer alan bu modül, kullanıcıların platformun kişisel veri işleme süreçleriyle ilgili şartları kolayca görüntülemesini sağlamak amacıyla tasarlanmıştır.

## Fonksiyon Grupları
### Gizlilik Politikası Ana Sayfa Bileşeni
Modülün tüm sorumluluğunu üstlenen, gizlilik politikası sayfasının tüm yapı ve içeriğini kullanıcıya sunan tek bileşendir.
- PrivacyPolicyPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı Gizlilik Politikası sayfası modülünün doğru şekilde oluşturulması, görüntülenmesi ve kullanıcılara erişilebilir olması için uygulamanın React runtime ortamına, yönlendirme sistemine ve paylaşılan ortak bileşen bağımlılıklarının sorunsuz çalışması zorunludur.

[Aksiyom 1]: Eğer projeye React kütüphanesi (JSX çalışma zamanı dahil) dahil edilmemiş veya erişilebilir değilse, bu bileşen hiçbir şekilde oluşturulamaz ve uygulama çalışma zamanında kritik hata fırlatır.
[Aksiyom 2]: Eğer uygulamanın istemci tarafı yönlendirme sistemi bu sayfa bileşenini ilgili rota altında kaydetmemişse, kullanıcılar Gizlilik Politikası sayfasına erişemez ve erişim denemesi sonucunda 404 hatası alır.
[Aksiyom 3]: Eğer sayfanın kullandığı paylaşılan ortak şablon, navigasyon, altbilgi gibi temel bileşenler proje içinde erişilebilir değilse, sayfa düzeni bozuk görüntülenir veya hiç oluşturulamaz.
[Aksiyom 4]: Eğer son kullanıcının tarayıcısında JavaScript çalıştırma özelliği devre dışı bırakılmışsa, bu React bileşeni istemcide oluşturulamaz, kullanıcıya boş veya eksik içerik gösterilir.

---

## FONKSIYON DETAYLARI

### PrivacyPolicyPage
**Ne yapar**: VentHub HVAC projesinin yasal içerikli sayfalarından biri olarak, platformun gizlilik politikasını son kullanıcılara sunmak üzere tasarlanmış React tabanlı sayfa bileşenidir. Genel domain yapısına entegre şekilde çalışarak kullanıcıların gizlilik politikası metin ve ilgili tüm yasal içerikleri sorunsuzca görüntülemesini sağlar.
**Nasıl yapar**: Standart React bileşeni standartlarına uygun olarak çalışır, projenin kaynak kod ağacında src/views/legal dizininde konumlanarak projenin sayfa hiyerarşisinde yer alır. Sayfa için gerekli tüm içeriği işleyerek React sanal DOM yapısına ekler, kullanıcının cihazında doğru şekilde görüntülenmesini sağlar.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: React.FC tipinde, gizlilik politikası sayfasının tüm görsel, metinsel ve yapısal içeriğini barındıran geçerli bir React bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/PrivacyPolicyPage.tsx::PrivacyPolicyPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `React` — JSX sözdizimi ile sayfa içeriği oluşturmak için kullanılan ana React kütüphanesi
  - `Link` — Next.js tarafından sağlanan istemci tarafı yönlendirme bileşeni, Çerez Politikası sayfasına köprü oluşturmak için kullanılır
  - `legalConfig` — Hukuki metinlerde kullanılacak sabit şirket ve veri saklama verilerini içeren proje konfigürasyon nesnesi
  - `legalConfig.sellerTitle` — Veri sorumlusu bölümünde gösterilen şirket unvanı
  - `legalConfig.sellerAddress` — Veri sorumlusu bölümünde gösterilen şirket fiziksel adresi
  - `legalConfig.sellerEmail` — Veri sorumlusu bölümünde gösterilen şirket iletişim e-posta adresi
  - `legalConfig.sellerPhone` — Veri sorumlusu bölümünde gösterilen şirket iletişim telefon numarası
  - `legalConfig.retentionOrders` — Sipariş ve faturalandırma verilerinin saklama süresi değeri
  - `legalConfig.retentionSupport` — Destek yazışması verilerinin saklama süresi değeri
  - `legalConfig.retentionMarketing` — Pazarlama verilerinin saklama süresi değeri
  - `legalConfig.retentionLogs` — Güvenlik loglarının saklama süresi değeri
  - `legalConfig.applicationEmail` — Kullanıcıların KVKK hakları için başvuracağı resmi başvuru e-posta adresi
  - `legalConfig.lastUpdated` — Gizlilik politikasının son güncellenme tarihi değeri
  - `Routes` — Proje genelinde kullanılan rota adreslerini barındıran yardımcı nesne
  - `Routes.legal.cerez()` — Çerez Politikası sayfasının rota adresini döndüren fonksiyon, Link bileşeninin href özelliğine atanır
- **Dönüş**: React.FC türünde JSX elementi, Gizlilik Politikası sayfasının tüm kullanıcı arayüzü içeriğini render ederek döndürür

---

## NODE ID STANDARD

  file: src\views\legal\PrivacyPolicyPage.tsx
  function: src\views\legal\PrivacyPolicyPage.tsx::PrivacyPolicyPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: PrivacyPolicyPage