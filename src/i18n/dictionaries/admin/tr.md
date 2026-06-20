---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\tr.ts
skeleton_hash: b6dc563b6dd8a8de
entity_hashes:
  overview: e77595acec187e79
generated_at: 2026-06-19T20:47:54Z
---

## Genel Bakış
Bu modül, admin panelinin Türkçe çeviri sözlüğünü tanımlayan bir dil kaynak dosyasıdır. Farklı işlevsel alanlara ait (yetkilendirme, kategoriler, ortak metinler vb.) çeviri nesnelerini bir araya getirerek, uygulamanın Türkçe arayüzünde kullanılmak üzere merkezi bir `admin` sözlüğü oluşturur ve dışa aktarır.

## Modül Yapısı ve Sorumlulukları
Dosya, statik bir key-value veri yapısıdır ve herhangi bir iş mantığı veya fonksiyon içermez. Temel sorumluluğu, alt modüllerden (`a11y`, `audit`, `authority` vb.) import edilen çeviri nesnelerini birleştirip `admin` adlı tek, tutarlı ve erişilebilir bir sözlük nesnesi olarak dışa sunmaktır. Bu yapı, dil değiştirme mekanizması tarafından yüklenerek arayüz bileşenlerine çeviri metinleri sağlar; herhangi bir API, veritabanı veya ortam değişkeniyle doğrudan etkileşimi yoktur.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./a11y.tr::a11y
- import: ./audit.tr::audit
- import: ./authority.tr::authority
- import: ./categories.tr::categories
- import: ./common.tr::common
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
  categories,
  products,
  common,
  coupons,
  dataTable,
  ...`

---

## AST POINTERS

Bu dosya **fonksiyon içermeyen bir dictionary/modül dosyasıdır**. Sadece import'lar ve bir nesne export'u bulunmaktadır.

### [N1_NASIL] AST Pointer: src/i18n/dictionaries/admin/tr.ts::(modül yapısı)
- **params**: yok (fonksiyon değil, modül)
- **ic_degiskenler**:
  - `a11y` — Erişilebilirlik çevirilerini içeren import
  - `audit` — Audit/sistem log çevirilerini içeren import
  - `authority` — Yetki/hak çevirilerini içeren import
  - `categories` — Kategori çevirilerini içeren import
  - `common` — Ortak/genel çevirileri içeren import
  - `coupons` — Kupon çevirilerini içeren import
  - `dashboard` — Dashboard/panel çevirilerini içeren import
  - `dataTable` — Veri tablosu çevirilerini içeren import
  - `errorGroups` — Hata grupları çevirilerini içeren import
  - `errors` — Hata mesajları çevirilerini içeren import
  - `admin` — Tüm çevirileri birleştiren ana dictionary nesnesi (export edilen)
- **Dönüş**: yok (yan etki: `admin` nesnesini export eder)

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin