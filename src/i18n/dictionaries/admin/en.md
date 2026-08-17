---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\i18n\dictionaries\admin\en.ts
skeleton_hash: edc577a3a239b703
entity_hashes:
  overview: afb267070e987ec0
generated_at: 2026-08-17T11:04:11Z
---

## Genel Bakış
Bu dosya, admin panelinin İngilizce lokalizasyon sözlüğünü oluşturmak için erişilebilirlik, denetim, otorite, kategoriler, ortak metinler, onay metinleri, kuponlar ve kontrol paneli gibi farklı modüllerin çeviri kaynaklarını tek bir `admin` nesnesi altında birleştirir. Uygulama genelinde tutarlı dil kullanımı sağlamak ve çeviri yönetimini merkezileştirmek amacıyla yapılandırılmış statik bir veri dosyasıdır. Dosya herhangi bir fonksiyon, ortam değişkeni veya API çağrısı içermez; yalnızca import edilmiş alt sözlükleri bir araya getirerek dışa aktarır.

## Fonksiyon Grupları
Bu dosyada fonksiyon bulunmamaktadır. Dosya, modül-seviyesi kod ile yalnızca alt sözlükleri import edip `admin` nesnesini export eden bir yerel çeviri birleştirme (barrel) dosyasıdır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, fonksiyon veya mantıksal işlev içermeyen, yalnızca dışa aktarılan statik bir veri yapısıdır (sözlük/nesne birleşimi). Doğru çalışması için aşağıdaki yapısal ve bağlılık varsayımları geçerlidir.

[Aksiyom 1]: Eğer `admin` nesnesini oluşturan tüm alt sözlük dosyaları (içe aktarılan modüller) projede mevcut ve doğru yollardan import edilmiş değilse, derleme zamanında hata oluşur veya dışa aktarılan `admin` nesnesi eksik/bozuk olur.

[Aksiyom 2]: Eğer `admin` nesnesinin dışa aktarıldığı hedef ortam (modül ithalatçısı), bu nesneyi beklenen formatta (anahtar-değer çiftleri içeren bir nesne) tüketemiyorsa, uygulama içinde çeviri erişimi hatalı çalışır (undefined hataları veya eksik metin gösterimi).

[Aksiyom 3]: Eğer dosya, modülün kendi iç yapısını veya dışa aktardığı `admin` nesnesinin yapısını (örneğin, belirli bir dil коду veya namespace'i) değiştirirse, uygulamanın ilgili dildeki tüm metinleri yanlış veya eksik gösterir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./a11y.en::a11y
- import: ./audit.en::audit
- import: ./authority.en::authority
- import: ./categories.en::categories
- import: ./common.en::common
- import: ./confirm.en::confirm
- import: ./coupons.en::coupons
- import: ./dashboard.en::dashboard
- import: ./dataTable.en::dataTable
- import: ./errorGroups.en::errorGroups
- import: ./errors.en::errors
- import: ./inventory.en::inventory
- import: ./logistics.en::logistics
- import: ./menu.en::menu
- import: ./movements.en::movements
- import: ./orders.en::orders
- import: ./pricing.en::pricing
- import: ./products.en::products
- import: ./purchasing.en::purchasing
- import: ./returns.en::returns
- import: ./search.en::search
- import: ./settings.en::settings
- import: ./theme.en::theme
- import: ./titles.en::titles
- import: ./toolbar.en::toolbar
- import: ./ui.en::ui
- import: ./users.en::users
- import: ./webhooks.en::webhooks

---

## SABİTLER
- **admin** (object) — `{
  pricing,
  common,
  confirm,
  coupons,
  dataTable,
  dashboard,...`

---

## AST POINTERS

(Verilen dosyada herhangi bir fonksiyon gövdesi veya fonksiyon imzası bulunmamaktadır. Dosya yalnızca import'lar ve bir nesne ihracı içermektedir.)

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin