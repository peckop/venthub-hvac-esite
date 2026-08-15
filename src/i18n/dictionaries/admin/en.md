---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\en.ts
skeleton_hash: 22577370313f14a8
entity_hashes:
  overview: 98dcb3e67e87f77a
generated_at: 2026-08-15T15:09:15Z
---

## Genel Bakış
Bu dosya, admin panelinin İngilizce lokalizasyon sözlüğünü oluşturarak erişilebilirlik, denetim, otorite, kategoriler, ortak metinler, kontrol paneli, veri tablosu ve kuponlar gibi farklı modüllerin çeviri kaynaklarını tek bir `admin` nesnesi altında birleştirir. Uygulama genelinde tutarlı dil kullanımı sağlamak ve çeviri yönetimini merkezileştirmek amacıyla yapılandırılmış statik bir veri dosyasıdır. Dosya herhangi bir fonksiyon, ortam değişkeni veya API çağrısı içermez; yalnızca import edilmiş alt sözlükleri bir araya getirerek dışa aktarır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

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
  pricing,
  common,
  confirm,
  coupons,
  dataTable,
  dashboard,
  erro...`

---

## AST POINTERS

Bu dosya fonksiyon içermemektedir.

**Kaynak**: `C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\en.ts`

**Yapı**: Dosya bir TypeScript çeviri sözlüğü dosyasıdır. Sadece import bildirimleri ve bir nesne aggregator导出 barındırır.

### Import Bağımlılıkları
- `a11y` — `./a11y.en` modülünden, erişilebilirlik çevirileri
- `audit` — `./audit.en` modülünden, denetim çevirileri
- `authority` — `./authority.en` modülünden, yetki çevirileri
- `categories` — `./categories.en` modülünden, kategori çevirileri
- `common` — `./common.en` modülünden, ortak/genel çeviriler
- `confirm` — `./confirm.en` modülünden, onay diyalog çevirileri
- `coupons` — `./coupons.en` modülünden, kupon çevirileri
- `dashboard` — `./dashboard.en` modülünden, kontrol paneli çevirileri
- `dataTable` — `./dataTable.en` modülünden, veri tablosu çevirileri
- `errorGroups` — `./errorGroups.en` modülünden, hata grubu çevirileri

### Sabit
- `admin` — Tüm import edilen çeviri modüllerini birleştiren nesne (object aggregator)

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin