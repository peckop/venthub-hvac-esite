---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\en.ts
skeleton_hash: 0fc6f1eeba141f7a
entity_hashes:
  overview: 3d02093c393d55b1
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış

Bu dosya, admin panelinin İngilizce lokalizasyon sözlüğünü oluşturarak erişilebilirlik, denetim, otorite, kategoriler, ortak metinler, kontrol paneli, veri tablosu ve kuponlar gibi farklı modüllerin çeviri kaynaklarını tek bir `admin` nesnesi altında birleştirir. Uygulama genelinde tutarlı dil kullanımı sağlamak ve çeviri yönetimini merkezileştirmek amacıyla yapılandırılmış statik bir veri dosyasıdır. Dosya herhangi bir fonksiyon, ortam değişkeni veya API çağrısı içermez; yalnızca import edilmiş alt sözlükleri bir araya getirerek dışa aktarır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül veri ihracatı (data export) yapan bir sözlük modülüdür. Fonksiyon imzası bulunmamaktadır.

**[Aksiyom 1]**: Eğer `admin` nesnesi düzgün bir JavaScript nesnesi (object) olarak tanımlanmazsa, uygulama içinde çeviri erişimi başarısız olur ve tanımsız (undefined) referans hataları oluşur.

**[Aksiyom 2]**: Eğer `admin` nesnesinin içindeki alt sözlük anahtarları (a11y, audit, authority, categories, common, dashboard, errorGroups, errors) eksik veya yanlış tanımlanırsa, ilgili modüllerde çeviri anahtarları çözümlenemez ve uygulama arayüzünde hata mesajları veya boş metinler görüntülenir.

**[Aksiyom 3]**: Eğer `admin` nesnesi `default export` veya `named export` olarak dışa aktarılmazsa, modülü içe aktaran dosyalar `admin` sözlüğüne erişemez ve lokalizasyon sistemi çalışmaz.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./a11y.en::a11y
- import: ./audit.en::audit
- import: ./authority.en::authority
- import: ./categories.en::categories
- import: ./common.en::common
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
- import: ./products.en::products
- import: ./returns.en::returns
- import: ./search.en::search
- import: ./settings.en::settings
- import: ./titles.en::titles
- import: ./toolbar.en::toolbar
- import: ./ui.en::ui
- import: ./users.en::users
- import: ./webhooks.en::webhooks

---

## SABİTLER
- **admin** (object) — `{
  common,
  coupons,
  dataTable,
  dashboard,
  errors,
  toolbar,
  menu,...`

---

## AST POINTERS

Bu dosyada **fonksiyon gövdesi bulunmamaktadır**. Dosya, sadece import edilen sözlük nesnelerini bir araya getiren bir i18n sözlük birleştirme dosyasıdır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin