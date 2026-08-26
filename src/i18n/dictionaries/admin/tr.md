---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\i18n\dictionaries\admin\tr.ts
skeleton_hash: 6959dc6ee42c1cd6
entity_hashes:
  overview: db9fc58164f2ef61
generated_at: 2026-08-25T07:27:26Z
---

## Genel Bakış
Bu modül, admin paneli için Türkçe dil desteğini sağlayan bir sözlük dosyasıdır. Modül, farklı alanlara (erişilebilirlik, denetim, yetki, kategoriler, genel, onay, kuponlar, kontrol paneli) ait Türkçe çeviri modüllerini içe aktarır ve bunları `admin` adlı bir sabit altında birleştirir. Dosyada fonksiyon tanımları bulunmaz; yalnızca modül seviyesinde içe aktarma ve sabit tanımlama işlemleri yer alır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül yalnızca `admin` adında bir nesne sabiti içermekte olup, fonksiyon tanımlamamaktadır. Fonksiyon gövdesi bulunmadığından, doğru çalışma koşullarına ilişkin çıkarılabilecek mimari varsayım mevcut değildir.

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
- import: ./dataRequests.tr::dataRequests
- import: ./dataTable.tr::dataTable
- import: ./errorGroups.tr::errorGroups
- import: ./errors.tr::errors
- import: ./inventory.tr::inventory
- import: ./invoices.tr::invoices
- import: ./logistics.tr::logistics
- import: ./menu.tr::menu
- import: ./movements.tr::movements
- import: ./orders.tr::orders
- import: ./pricing.tr::pricing
- import: ./products.tr::products
- import: ./purchasing.tr::purchasing
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
  purchasing,
  com...`

---

## AST POINTERS

Bu dosyada (`C:\tmp\wt-supurme\src\i18n\dictionaries\admin\tr.ts`) fonksiyon tanımı bulunmamaktadır.

Dosya, bir i18n (uluslararasılaştırma) sözlük modülüdür. Yapısı şöyledir:

- **10 adet modül importu**: `a11y`, `audit`, `authority`, `categories`, `common`, `confirm`, `coupons`, `dashboard`, `dataRequests`, `dataTable` — her biri `./<ad>.tr` yolundan alınır.
- **1 adet sabit nesne**: `admin` — import edilen alt modüllerin birleştirilmesiyle oluşturulmuş bir sözlük nesnesi olması beklenir; ancak gövde verilmediği için tam yapısı bilinmiyor.

Fonksiyon gövdesi bulunmadığından AST Pointer üretilmemiştir.

---

## NODE ID STANDARD

  file: tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin