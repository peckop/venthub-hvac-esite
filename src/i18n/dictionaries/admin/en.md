---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\i18n\dictionaries\admin\en.ts
skeleton_hash: 52acb6a97b3323f4
entity_hashes:
  overview: d20c765ec6eb43b4
generated_at: 2026-08-27T04:13:27Z
---

## Genel Bakış

Bu dosya, admin panelinin İngilizce lokalizasyon sözlüğünü oluşturmak amacıyla farklı modüllere ait çeviri kaynaklarını tek bir `admin` nesnesi altında birleştirir. a11y, audit, authority, categories, common, confirm, coupons ve dashboard gibi alt sözlükleri import ederek dışa aktarır. Dosya herhangi bir fonksiyon, ortam değişkeni veya API çağrısı içermez; yalnızca statik çeviri verilerini merkezileştiren bir birleştirme modülüdür.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

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
- import: ./dataRequests.en::dataRequests
- import: ./dataTable.en::dataTable
- import: ./errorGroups.en::errorGroups
- import: ./errors.en::errors
- import: ./inventory.en::inventory
- import: ./invoices.en::invoices
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
  dataRequests,
  dataTabl...`

---

## AST POINTERS

Bu dosyada (`C:\tmp\vh-comp\src\i18n\dictionaries\admin\en.ts`) fonksiyon tanımlanmamıştır.

Dosya yalnızca aşağıdaki bileşenlerden oluşur:

- **İçe Aktarımlar**: `a11y`, `audit`, `authority`, `categories`, `common`, `confirm`, `coupons`, `dashboard`, `dataRequests`, `dataTable` — her biri kendi `.en` modülünden tekil export olarak alınır.
- **Sabit**: `admin` — object türünde bir sabit; muhtemelen yukarıdaki tüm içe aktarımları tek bir çatı altında birleştiren sözlük (dictionary) nesnesi.

Fonksiyon gövdesi bulunmadığından AST Pointer üretilecek birim yoktur.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin