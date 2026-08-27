---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminWebhookEventsPage.tsx
skeleton_hash: 3382534dcd8f5b28
entity_hashes:
  func:AdminWebhookEventsPage: 48683db839635910
  overview: 9f2ace90b78b56d4
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-27T07:23:36Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici panelinde webhook olaylarını görüntülemeye yönelik bir React sayfa bileşenidir. Admin kullanıcıların sistemde gerçekleşen webhook tetiklemelerini listelemesine ve izlemesine olanak tanır. Sayfa, sunucudan webhook verilerini çekerek kullanıcıya düzenli bir arayüzle sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Sayfanın ana yapısını ve kullanıcı arayüzünü oluşturan React bileşenidir. Webhook olaylarını listelemek için gerekli veri çekme işlemini başlatır ve sonuçları kullanıcıya sunar.
- AdminWebhookEventsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** `AdminWebhookEventsPage` fonksiyonunun gövdesi verilmemiştir; yalnızca imza (`() -> React.FC`) mevcuttur. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebilir. Gövde sağlanmadığı sürece bu bileşenin hangi bağımlılıklara, durum değişkenlerine, API çağrılarına veya eşik değerlerine ihtiyaç duyduğu belirlenemez.

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
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../i18n/I18nProvider::useI18n
- import: ./WebhookEventsTableBody::WebhookEventsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminWebhookEventsPage.tsx::AdminWebhookEventsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('admin.webhooks.eventsTitle')` ve `t('admin.webhooks.eventsSubtitle')` çağrılarıyla sayfa başlığı ve açıklamasının metinlerini almak için kullanılır
- **Dönüş**: JSX elementi — üst düzey `<div className="space-y-6 pb-20">` kapsayıcısı içinde şunları döndürür:
  - `AdminPageHeader` bileşeni (`title` ve `description` prop'ları ile, değerleri `t()` ile çevrilmiş)
  - `Suspense` bileşeni (`fallback` prop'u olarak `AdminSkeleton` bileşeni, `variant="table"`, `count={5}`, `rows={8}` prop'ları ile); içinde `WebhookEventsTableBody` bileşeni (prop'suz) yer alır

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