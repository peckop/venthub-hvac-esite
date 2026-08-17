---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\admin\quotes\AdminQuotesPage.tsx
skeleton_hash: ae905171fd6a573d
entity_hashes:
  func:AdminQuotesPage: 8f282793cec53879
  overview: ed62e4d1f35d7caa
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-16T11:36:10Z
---

## Genel Bakış

Bu modül, admin panelindeki tekliflerin (quotes) yönetim sayfasını sunan üst düzey bir React bileşenidir. Kullanıcılara tekliflerin listelenmesini, görüntülenmesini ve yönetimini sağlayan bir arayüz sağlar. Sayfa, teklif verilerini çekerek admin kullanıcılarının süreçleri izlemesine ve manipüle etmesine olanak tanır.

## Fonksiyon Grupları

### Teklif Yönetim Sayfası

Tek sayfalık bir bileşendir; admin panelindeki quotes bölümünün tamamını yöneten ana konteyner olarak görev yapar.

- AdminQuotesPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için belirtilen fonksiyon imzasında (AdminQuotesPage() -> React.FC) ve verilen modül sabitlerinde herhangi bir parametrik giriş, zorunlu bağımlılık veya iş mantığı koşulu tanımlanmamıştır. Dolayısıyla, bu modül için fonksiyonel veya mimari aksiyom üretmek için yeterli yapısal bilgi mevcut değildir. Modülün doğru çalışması için gerekli koşullar, fonksiyon imzasında belirtilmemiştir.

Aksiyomlar, modülün iç yapısının (bileşenlerin birbirine bağlanma biçimi, state yönetimi, API çağrıları, vb.) ne olduğu bilinmeden, sadece dışsal imza bilgisinden türetilemez. Bu durumda, modülün kendi içinde bağımsız bir “sayfa” (page) olduğu ve React.FC arayüzünü uyguladığı dışında, daha spesifik bir mimari varsayım tanımlanamaz.

Bu nedenle, bu modül için özel aksiyom tanımlanmamıştır. Mimari varsayımların üretilmesi için, modülün内部 yapısının (bileşenlerin, hookların, servislerin vb.) analiz edilmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### AdminQuotesPage
**Ne yapar**: AdminQuotesPage, teklif kuyruğu sayfasını (T067-VH, cetvel Q7) oluşturan üst düzey React fonksiyonel bileşenidir. Sayfa yapısı olarak bir başlık ve Suspense sarımı içinde ana içerik bölgesi sunar.

**Nasıl yapar**: Fonksiyon, sayfa düzenini iki temel bölümden oluşan basit bir yapıda render eder: bir başlık kısmı ve veri yükleme durumunu yöneten React Suspense sarmalı. `useSearchParams` hook'u doğrudan bu bileşen içinde çağrılmaz; bunun yerine, bu hook'u tüketen mantık (veri, URL ve filtre state yönetimi) tamamen alt bileşen olan `QuotesTableBody` içinde, orada kullanılan `useAdminTable` custom hook'u tarafından taşınır. Bu mimari tercih, `useSearchParams`'ı Suspense sınırları içinde tüketmek zorunluluğuna (CLAUDE.md Kural 5 / K2) uymak için yapılmıştır; böylece asenkron veri yükleme süreçleri Suspense bileşeni tarafından şeffaf bir şekilde yönetilir.

**Parametreler**: Bu fonksiyon, bir React fonksiyonel bileşeni olarak harici prop almaz.

**Dönüş**: `React.FC` (React.FunctionComponent) tipinde bir JSX döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../../i18n/I18nProvider::useI18n
- import: ../../../utils/adminUi::adminSectionTitleClass
- import: ../../../utils/adminUi::adminSubtitleClass
- import: ./QuotesTableBody::QuotesTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/quotes/AdminQuotesPage.tsx::AdminQuotesPage
- **params**: (parametre yok — arrow function, boş())
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'unun dönüşünden destructured çeviri fonksiyonu; `t('quotes.admin.title')` ve `t('quotes.admin.subtitle')` çağrılarda başlık ve alt başlık metinlerini i18n anahtarlarından getirir
- **Dönüş**: JSX — `<div>` sarmalayan container içinde `<header>` (başlık + alt başlık) ve `<Suspense>` içinde `<QuotesTableBody />` bileşeni döndürür

**Not**: `adminSectionTitleClass`, `adminSubtitleClass`, `AdminSkeleton`, `QuotesTableBody`, `Suspense` — bunlar import'tan gelen referanslardır, fonksiyon gövdesinde yerel değişken olarak tanımlanmaz; doğrudan JSX içinde kullanılır.

---

## NODE ID STANDARD

  file: src\views\admin\quotes\AdminQuotesPage.tsx
  function: src\views\admin\quotes\AdminQuotesPage.tsx::AdminQuotesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminQuotesPage

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