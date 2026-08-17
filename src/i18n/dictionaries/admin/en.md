---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\en.ts
skeleton_hash: 458261091768abac
entity_hashes:
  overview: 4b1e1c79283931d3
generated_at: 2026-08-15T19:08:10Z
---

## Genel Bakış
Bu dosya, admin panelinin İngilizce lokalizasyon sözlüğünü oluşturarak erişilebilirlik, denetim, otorite, kategoriler, ortak metinler, kontrol paneli, veri tablosu ve kuponlar gibi farklı modüllerin çeviri kaynaklarını tek bir `admin` nesnesi altında birleştirir. Uygulama genelinde tutarlı dil kullanımı sağlamak ve çeviri yönetimini merkezileştirmek amacıyla yapılandırılmış statik bir veri dosyasıdır. Dosya herhangi bir fonksiyon, ortam değişkeni veya API çağrısı içermez; yalnızca import edilmiş alt sözlükleri bir araya getirerek dışa aktarır.

## Modül Yapısı
Bu dosya fonksiyon içermediğinden "Fonksiyon Grupları" bölümü yerine modülün yapısı aşağıda özetlenmiştir.

### İçe Aktarılan Alt Sözlükler
Modül, farklı alanlara ait çeviri dosyalarını import ederek tek bir `admin` nesnesi altında birleştirir. Her bir import, ilgili domain'e ait anahtar-değer çiftlerini taşır.
- a11y (erişilebilirlik), audit (denetim), authority (otorite), categories (kategoriler), common (ortak metinler), confirm (onay metinleri), coupons (kuponlar), dashboard (kontrol paneli), dataTable (veri tablosu), errorGroups (hata grupları), errors (hatalar), inventory (envanter), logistics (lojistik), menu (menü), movements (hareketler), orders (siparişler), pricing (fiyatlandırma), products (ürünler), returns (iadeler), search (arama), settings (ayarlar), titles (başlıklar), toolbar (araç çubuğu), ui (arayüz), users (kullanıcılar), webhooks

### Dışa Aktarılan Sabitler
Modülün tek çıktısı olan `admin` nesnesi, tüm alt sözlükleri bir araya getirerek uygulama genelinde çeviri erişimi sağlar.

### Bağımlılıklar
Dosya yalnızca yerel çeviri dosyalarına bağımlıdır; dış API, ortam değişkeni veya dinamik yükleme (lazy import) içermez. Tüm bağımlılıklar statik ve derleme zamanında çözümlenir.

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

### [N1_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::a11y
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `a11y` nesnesi (erişilebilirlik çevirileri içerir)

### [N2_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::theme
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `theme` nesnesi (tema/renk çevirileri içerir)

### [N3_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::audit
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `audit` nesnesi (denetim/logging çevirileri içerir)

### [N4_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::authority
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `authority` nesnesi (yetki/izin çevirileri içerir)

### [N5_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::categories
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `categories` nesnesi (kategori çevirileri içerir)

### [N6_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::common
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `common` nesnesi (genel ortak çevirileri içerir)

### [N7_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::confirm
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `confirm` nesnesi (onay/pencere çevirileri içerir)

### [N8_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::coupons
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `coupons` nesnesi (kupon çevirileri içerir)

### [N9_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::dashboard
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `dashboard` nesnesi (gösterge paneli çevirileri içerir)

### [N10_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::dataTable
- **params**: (parametre yok)
- **ic_degiskenler**: Yok (bir object import ediliyor)
- **Dönüş**: `dataTable` nesnesi (veri tablosu çevirileri içerir)

### [N11_NASIL] AST Pointer: src/i18n/dictionaries/admin/en.ts::admin
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `admin` — Tüm import edilen çeviri modüllerini (a11y, theme, audit, authority, categories, common, confirm, coupons, dashboard, dataTable) birleştiren ve export edilen ana İngilizce sözlük nesnesi
- **Dönüş**: `admin` nesnesi (tüm admin alanı çevirilerini birleştiren ana sözlük)

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin