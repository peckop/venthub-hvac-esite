---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\tr.ts
skeleton_hash: a3af4d5e55488bc6
entity_hashes:
  overview: 676d8815132f98e2
generated_at: 2026-08-15T19:08:10Z
---

## Genel Bakış

Bu modül, admin panelinin Türkçe arayüz çeviri sözlüğünü tanımlayan statik bir dil kaynak dosyasıdır. Farklı iş alanlarına ait çeviri nesnelerini (`a11y`, `audit`, `authority`, `categories`, `common`, `confirm`, `coupons` ve benzeri) bir araya getirerek uygulamanın kullanımına sunulan merkezi `admin` sözlüğünü oluşturur. Dosya saf bir veri modülüdür; herhangi bir iş mantığı, fonksiyon veya dış API bağımlılığı içermez ve yalnızca i18n çerçevelesi tarafından derleme zamanında yüklenerek arayüz bileşenlerine çeviri metinleri sağlar.

## Modül Yapısı

### Dış Bağımlılıklar
Modül, erişilebilirlik, denetim, yetkilendirme, kupon, kategori, doğrulama ve genel metinler gibi farklı dil alanlarına karşılık gelen çoklu çeviri dosyasından nesneler import eder. Bu alt modüllerin her biri ayrı bir TypeScript dosyasında tanımlıdır ve modül tarafından birleştirilerek dışa aktarılır.

### Mimari Rolü
- **Salt veri/konfigürasyon:** Davranışsal mantık, hook veya herhangi bir hesaplama içermez; yalnızca nesne birleştirme ve dışa aktarma yapar.
- **Sözleşme niteliği:** Dışa açılan `admin` nesnesinin anahtar kümesi bir sözhedir; bir öğe eklenip çıkarılması kırıcı değişiklik yaratabilir ve ilgili tipler同一 commit'te güncellenmelidir.
- **Ortam ve API bağımlılığı yoktur:** Doğrudan veritabanı, servis veya ortam değişkeniyle etkileşime girmez.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, statik bir çeviri sözlüğü dosyası olduğu için işlevsel aksiyomlar içermemektedir. Ancak, modülün doğru entegrasyonu ve kullanımı için aşağıdaki yapısal ve bağımlılık varsayımları geçerlidir.

[Aksiyom 1]: Eğer import edilen alt modül dosyaları (örn: `a11y.ts`, `audit.ts`, `categories.ts` vb.) yoksa veya bunların dışa aktardığı çeviri nesneleri (`a11y`, `audit`, `authority`, `categories`, `common`, `confirm`, `coup...`) tanımsızsa, `admin` sözlük nesnesinin ilgili anahtarları (`a11y`, `audit`, `authority`, `categories`, `common`, `confirm`, `coupons` vb.) eksik kalır ve arayüzde o alt modüllere ait çeviri metinleri görüntülenmez.

[Aksiyom 2]: Eğer `admin` nesnesinin tüm alt nesneleri (import edilen nesneler) birleştirilerek bir `Record` yapısında (`admin`) birleştirilmemişse veya bu birleştirme operasyonunda herhangi bir JavaScript spread operatörü (`...`) hatası varsa, modülün varsayılan export'u (`export default admin`) geçerli bir sözlük nesnesi sağlamaz. Bu durumda, i18n çerçevesi (örn: `next-intl`) bu dosyayı yüklerken hata verir veya boş bir çeviri sözlüğü kullanılır.

[Aksiyom 3]: Eğer modül dosyasında tanımlanan `admin` sabit nesnesi, bir `Record<string, any>` yapısına uygun olarak, tüm alt çeviri nesnelerini (`a11y`, `audit`, `authority`, `categories`, `common`, `confirm`, `coupons`, `dashboard` vb.) içeren ve tekrar eden (conflicting) anahtarlar içermeyen, düz bir nesne olarak birleştirilmemişse, i18n framework'ü (örn: `next-intl`) tarafından yüklenirken öngörülemeyen davranışlar (örn: iç içe geçmiş nesnelerin düzgün birleştirilmemesi, anahtar çakışmaları) oluşur ve çeviri metinleri hatalı veya eksik görüntülenebilir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./a11y.tr::a11y
- import: ./audit.tr::audit
- import: ./authority.tr::authority
- import: ./categories.tr::categories
- import: ./common.tr::common
- import: ./confirm.tr::confirm
- import: ./coupons.tr::coupons
- import: ./dashboard.tr::dashboard
- import: ./dataTable.tr::dataTable
- import: ./errorGroups.tr::errorGroups
- import: ./errors.tr::errors
- import: ./inventory.tr::inventory
- import: ./logistics.tr::logistics
- import: ./menu.tr::menu
- import: ./movements.tr::movements
- import: ./orders.tr::orders
- import: ./pricing.tr::pricing
- import: ./products.tr::products
- import: ./returns.tr::returns
- import: ./search.tr::search
- import: ./settings.tr::settings
- import: ./theme.tr::theme
- import: ./titles.tr::titles
- import: ./toolbar.tr::toolbar
- import: ./ui.tr::ui
- import: ./users.tr::users
- import: ./webhooks.tr::webhooks

---

## SABİTLER
- **admin** (object) — `{
  authority,
  pricing,
  categories,
  products,
  common,
  confirm...`

---

## AST POINTERS

Bu dosyada **hiçbir fonksiyon tanımlı değildir**. Dosya yalnızca import edilen çeviri modüllerini bir araya getiren bir nesne (sabit) içerir — fonksiyon gövdesi bulunmamaktadır.

### [N1_NASIL] AST Pointer: `src/i18n/dictionaries/admin/tr.ts` — (dosya düzeyinde)

- **params**: (yok — dosya düzeyinde modül, fonksiyon değil)
- **ic_degiskenler**:
  - `admin` — Tüm alt çeviri modüllerini (`a11y`, `theme`, `audit`, `authority`, `categories`, `common`, `confirm`, `coupons`, `dashboard`, `dataTable`) birleştiren nesne sabiti; admin panelinin Türkçe çevirilerini tutar
- **Import Edilen Modüller** (dolaylı bağımlılıklar):
  - `a11y` — Erişilebilirlik çevirileri (`./a11y.tr`)
  - `theme` — Tema çevirileri (`./theme.tr`)
  - `audit` — Audit log çevirileri (`./audit.tr`)
  - `authority` — Yetki/rol çevirileri (`./authority.tr`)
  - `categories` — Kategori çevirileri (`./categories.tr`)
  - `common` — Genel/paylaşımlı çeviriler (`./common.tr`)
  - `confirm` — Onay dialogu çevirileri (`./confirm.tr`)
  - `coupons` — Kupon çevirileri (`./coupons.tr`)
  - `dashboard` — Dashboard çevirileri (`./dashboard.tr`)
  - `dataTable` — Veri tablosu çevirileri (`./dataTable.tr`)
- **Dönüş**: yok (modül düzeyinde export edilen `admin` nesnesi)

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin