---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminWebhookEventsPage.tsx
skeleton_hash: 4a62ad71ca0bc5b0
entity_hashes:
  func:AdminWebhookEventsPage: 48683db839635910
  overview: d868678ca607445a
  style_tokens: 5e9d7754f938f018
generated_at: 2026-06-19T20:49:21Z
---

## Genel Bakış
VentHub HVAC yönetici panelinde webhook olaylarını görüntülemeye yönelik bir React sayfa bileşenidir. Admin kullanıcıların sistemde gerçekleşen webhook tetiklemelerini listelemesine ve izlemesine olanak tanır. Sayfa, arka planda sunucuyla iletişim kurarak webhook verilerini asenkron olarak çeker ve düzenli bir arayüzle sunar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Sayfanın ana yapısını ve kullanıcı arayüzünü oluşturan React bileşenidir. Sayfa düzenini render eder, veri çekme sürecini başlatır ve webhook olaylarını tablo veya liste halinde kullanıcıya sunar.

- AdminWebhookEventsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesine dayalı mimari varsayımlar sınırlıdır çünkü yalnızca bir React bileşeni imzası mevcuttur.

---

**[Aksiyom 1]**: Eğer `AdminWebhookEventsPage` bir React uygulaması bağlamında (React Router vb.) render edilmemişse, bileşen doğru çalışamaz ve sayfa gösterilemez olur.

**[Aksiyom 2]**: Eğer bileşenin döndürdüğü `React.Fc` tipi geçerli bir JSX içermiyorsa, React render ağacı oluşturulamaz ve hata fırlatılır.

**[Aksiyom 3]**: Eğer bileşen çağrıldığında (`AdminWebhookEventsPage()`) geriye geçerli bir React fonksiyonel bileşeni dönmüyorsa, bileşen kullanılamaz hale gelir.

---

> **Not:** Fonksiyon imzası (`def AdminWebhookEventsPage() -> React.FC`) çok basit olup, parametre veya default değer içermemektedir. Dolayısıyla; veri kaynağı (API endpoint), kimlik doğrulama zorunluluğu, state yönetimi kütüphanesi, hook kullanımı veya dış bağımlılıklar hakkında fonksiyon gövdesinden türetilebilir bilgi bulunmamaktadır. Eski dokümanda webhook olaylarını sunucudan çektiği belirtilmiş olsa da, bu bilgi dokümandan türetilmiştir ve aksiyom olarak dikkate **alınmamıştır**.

---

## FONKSİYON DETAYLARI

### AdminWebhookEventsPage
**Ne yapar**: Admin panelinde webhook eventlerinin listelendiği sayfa bileşenidir. Webhook olaylarını göstermek ve yönetmek için kullanılan bir React sayfa bileşenidir.

**Nasıl yapar**: Bir React fonksiyonel bileşenidir ve admin paneli rotalandırma yapısı altında webhook eventleri sayfasını render eder. Sayfa yüklendiğinde event verilerini çekmek için fetchEvents fonksiyonunu çağırır.

**Parametreler**:
- Bu fonksiyon parametre almamaktadır

**Dönüş**: React JSX bileşeni döndürür (sayfa içeriği)

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./WebhookEventsTableBody::WebhookEventsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminWebhookEventsPage.tsx::AdminWebhookEventsPage
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile alınan çeviri fonksiyonu; `admin.webhooks.eventsTitle` ve `admin.webhooks.eventsSubtitle` anahtarlarıyla uluslararasılaştırılmış metinleri döndürür
- **Dönüş**: `JSX.Element` — `<div>` wrapper içinde; `<header>` kısmında `adminSectionTitleClass` className'li `<h1>` başlık ve `adminSubtitleClass` className'li `<p>` alt başlık, ardından `<Suspense>` ile sarılmış `<WebhookEventsTableBody />` bileşeni. Suspense fallback olarak `<AdminSkeleton variant="table" count={5} rows={8} />` gösterilir. Lazy yüklenen tablo gövdesi yüklenene kadar skeleton loading durumu sergilenir.

---

## NODE ID STANDARD

  file: src\views\admin\AdminWebhookEventsPage.tsx
  function: src\views\admin\AdminWebhookEventsPage.tsx::AdminWebhookEventsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminWebhookEventsPage

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
- **Yardımcı Sınıflar:** `pb-20`, `space-y-6`