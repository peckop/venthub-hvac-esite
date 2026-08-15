---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\tr.ts
skeleton_hash: a25c8f9dde0f26e8
entity_hashes:
  overview: b714ab1d62ae9c57
generated_at: 2026-08-15T15:10:38Z
---

## Genel Bakış
Bu modül, admin panelinin Türkçe çeviri sözlüğünü tanımlayan statik bir dil kaynak dosyasıdır. Alt modüllerden (`a11y`, `audit`, `authority`, `categories`, `common`, `coupons`, `dashboard` vb.) import edilen çeviri nesnelerini birleştirerek, uygulamanın Türkçe arayüzünde kullanılmak üzere merkezi bir `admin` sözlüğü oluşturur ve dışa aktarır.

Dosya saf bir veri modülüdür; herhangi bir iş mantığı, fonksiyon veya API etkileşimi içermez. i18n çerçevelesi tarafından yüklenerek arayüz bileşenlerine çeviri metinleri sağlar.

## Modül Yapısı

### Dış Bağımlılıklar (Importlar)
Modül, farklı işlevsel alanlara ait çeviri nesnelerini çoklu dosyadan import eder: `a11y`, `audit`, `authority`, `categories`, `common`, `confirm`, `coupons`, `dashboard`, `dataTable`, `errorGroups`, `errors`, `inventory`, `logistics`, `menu` ve diğer alt modüller. Her biri bir dil alanına (erişilebilirlik, denetim, yetkilendirme, kupon, genel metinler vb.) karşılık gelir.

### Mimari Notlar
- **Davranışsal mantık yoktur:** Bu dosya salt veri/konfigürasyon içerir; fonksiyon veya hook barındırmaz.
- **Sözleşme niteliği:** Dışa açılan `admin` nesnesinin anahtar kümesi bir sözhedir; tüketiciler bu sabit yapıya bağlıdır. Bir öğe eklenip çıkarılması kırıcı değişiklik yaratabilir ve ilgili tipler同一 commit'te güncellenmelidir.
- **Ortam değişkeni veya API bağımlılığı yoktur:** Doğrudan veritabanı, servis veya ortam değişkeniyle etkileşime girmez; yalnızca derleme zamanında statik olarak bir araya getirilir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, dışa aktarılan `admin` adlı statik bir çeviri sözlüğü nesnesidir ve herhangi bir fonksiyon gövdesi içermez. Aksiyomlar, modülün yapısına ve dışa bağımlılıklarına ilişkindir.

[Aksiyom 1]: Eğer modülde tanımlanan `admin` nesnesi dışa aktarılmazsa, uygulamanın Türkçe arayüzündeki çeviri metinleri yüklenemez ve çeviri erişimi hatalı olur.

[Aksiyom 2]: Eğer `admin` nesnesinin bir alt anahtarı (örneğin `authority`, `categories` vb.) tanımsız (`undefined`) kalırsa, ilgili arayüz alanında ham anahtar metni (key) gösterilir veya çeviri hatası oluşur.

[Aksiyom 3]: Eğer bir çeviri değeri boş string (`""`) olarak bırakılırsa, arayüzde ilgili alanda boş bir metin görüntülenir.

[Aksiyom 4]: Eğer bir alt sözlük import edilemezse (dosya yolu hatalı veya dosya yoksa), `admin` nesnesi o sözlüğü içermeyecek ve ilgili çeviriler eksik kalacaktır.

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
  confirm,
  co...`

---

## AST POINTERS

Bu dosyada tanımlı herhangi bir fonksiyon gövdesi bulunmamaktadır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin