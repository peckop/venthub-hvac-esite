---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminErrorsPage.tsx
skeleton_hash: 4225f5659d041691
entity_hashes:
  func:AdminErrorsPage: d26af9274e4d56dd
  overview: 511e803d5e1695c8
  style_tokens: a7fe3ab3ca0c1259
generated_at: 2026-08-27T07:14:48Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici panelindeki hata yönetim sayfasını oluşturan React bileşenini içerir. Sistemde kaydedilen hata kayıtlarını merkezi bir arayüzde listeleyerek yöneticilerin incelemesine olanak tanır. Hata kayıtlarındaki tarih bilgilerinin okunabilir biçimde sunulmasını destekler.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfa düzeninin, veri çekme işlemlerinin ve hata kayıtlarının listelenmesinin tüm sorumluluğunu taşıyan ana React bileşenidir.
- AdminErrorsPage

### Tarih Formatlama Yardımcıları
Hata kayıtlarındaki tarih nesnelerini, arayüzde gösterilmek üzere okunabilir ve standart bir metin formatına dönüştürmekle sorumlu yardımcı fonksiyondur.
- fmt

## Fonksiyonlar Arası İlişkiler ve Bağımlılıklar
`AdminErrorsPage` bileşeni, hata kayıtlarının tarih bilgilerini okunaklı göstermek için `fmt` fonksiyonunu çağırır. Modül, veri çekme işlemleri için dış kaynaklara ihtiyaç duyar ve bu bağımlılıklar bileşenin yaşam döngüsünde çözümlenir. Mimari olarak, yönetici panelinin bir alt sayfası olarak yalın ve tek sorumluluklu bir yapıya sahiptir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminErrorsPage

**Ne yapar**: İstemci hatalarının (client_errors) listelendiği admin sayfasını render eder. DataTableKit kütüphanesine göç edilmiş, sunucu tarafı (server-mode) çalışan bir hata yönetim sayfasıdır.

**Nasıl yapar**: Sayfa yapısı iki katmandan oluşur: üst kısımda sayfa başlığı, altında ise `Suspense` ile sarılmış bir `ErrorsTableBody` bileşeni yer alır. `useSearchParams` hook'u doğrudan bu bileşen içinde tüketilmek yerine, `Suspense` boundary içine yerleştirilmiştir; bu tasarım CLAUDE.md Kural 5 / K2 gerekliliğine uygundur ve suspans ile ilgili potansiyel hataların önlenmesini sağlar. Veri çekme, URL senkronizasyonu ve filtre state yönetimi gibi tüm mantıksal sorumluluklar `ErrorsTableBody` bileşenine (içinde `useAdminTable` hook'unu kullanan) devredilmiştir; böylece bu üst düzey bileşen yalnızca görünüm yapısını ve Suspense sınırını tanımlar.

**Parametreler**:

Bu fonksiyon (React fonksiyonel bileşeni) herhangi bir parametre almaz.

**Dönüş**: `React.FC` — Suspense ile sarılmış hata tablosu içeriğini ve sayfa başlığını render eden React fonksiyonel bileşeni.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./ErrorsTableBody::ErrorsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\admin\AdminErrorsPage.tsx::AdminErrorsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile alınan çeviri fonksiyonu; `t('admin.titles.errors')` ve `t('admin.errors.subtitle')` çağrılarıyla sayfa başlığı ve alt başlık metinlerini yerelleştirmek için kullanılır
- **Dönüş**: JSX element — `className="space-y-4 pb-20"` olan bir `<div>` kapsayıcısı; içinde `<AdminPageHeader>` (title ve description prop'ları ile) ve `<Suspense>` (fallback olarak `<AdminSkeleton variant="table" count={5} rows={6} />` kullanan) ile sarılmış `<ErrorsTableBody />` bileşeni render eder

---

## NODE ID STANDARD

  file: src\views\admin\AdminErrorsPage.tsx
  function: src\views\admin\AdminErrorsPage.tsx::AdminErrorsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminErrorsPage

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
- **Yardımcı Sınıflar:** `pb-20`, `space-y-4`