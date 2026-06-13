---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\en.ts
skeleton_hash: c4cb063f1ba2c520
entity_hashes:
  overview: a741317a2d701ec4
generated_at: 2026-06-13T11:10:48Z
---

## Genel Bakış

Bu dosya, admin panelinin İngilizce lokalizasyon sözlüğünü oluşturarak birden fazla alt sözlüğü tek bir `admin` nesnesi altında birleştirir. A11y, denetim, otorite, kategoriler, ortak metinler, kontrol paneli, hata grupları ve hata mesajları gibi farklı modüllerin çeviri kaynaklarını merkezi bir noktadan对外a sunar. Bu yapı, uygulama genelinde tutarlı dil kullanımı sağlar ve çeviri yönetimini kolaylaştırır.

## Modül Yapısı

### Bağımlılıklar
Dosya, aşağıdaki sözlük modüllerinden çevirileri içe aktarır:
- a11y.en, audit.en, authority.en, categories.en, common.en, dashboard.en, errorGroups.en, errors.en

### Dışa Aktarım
- **admin**: Tüm alt sözlüklerin birleştirildiği ana İngilizce sözlük nesnesi

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

**Gerekçe:**

Bu modül bir **i18n (uluslararasılaşma) sözlük dosyası**dır (`admin` adında bir object sabiti içerir). Modülde:

- **Fonksiyon gövdesi bulunmamaktadır** — aksiyomların üretileceği temel kaynak yoktur
- Yalnızca statik bir veri yapısı (object constant) mevcuttur
- Modül, bir API sunmaz; sadece çeviri metinleri içeren bir veri kaynağıdır

Mimari aksiyomlar, fonksiyonların çalışma koşullarından türetilebilir; bu modülde böyle bir yapı olmadığından aksiyom üretmek mümkün değildir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **admin** (object) — `{
  common,
  dashboard,
  errors,
  toolbar,
  menu,
  titles,
  audit,
  in...`

---

## AST POINTERS

Bu dosyada fonksiyon gövdesi bulunmamaktadır. Dosya, i18n sözlük dosyası olup sadece import'lar ve bir nesne sabitinin export'unu içerir.

### [N1_KOSUL] AST Pointer: admin\en.ts::admin

- **params**: yok
- **ic_degiskenler**:
  - `admin` — İngilizce admin arayüz çevirilerini içeren nesne; aşağıdaki alt nesneleri birleştirir (spread):
    - `...a11y` — Erişilebilirlik çevirilerinden aktarım (a11y.en.ts kaynaklı)
    - `...audit` — Denetim/audit çevirilerinden aktarım (audit.en.ts kaynaklı)
    - `...authority` — Yetki çevirilerinden aktarım (authority.en.ts kaynaklı)
    - `...categories` — Kategori çevirilerinden aktarım (categories.en.ts kaynaklı)
    - `...common` — Ortak/genel çevirilerden aktarım (common.en.ts kaynaklı)
    - `...dashboard` — Dashboard çevirilerinden aktarım (dashboard.en.ts kaynaklı)
    - `...errorGroups` — Hata grupları çevirilerinden aktarım (errorGroups.en.ts kaynaklı)
    - `...errors` — Hatalar çevirilerinden aktarım (errors.en.ts kaynaklı)
    - `...inventory` — Envanter çevirilerinden aktarım (inventory.en.ts kaynaklı)
    - `...logistics` — Lojistik çevirilerinden aktarım (logistics.en.ts kaynaklı)
- **Dönüş**: `admin` nesnesi (i18n dictionary object) — spread operatörü ile 10 farklı çeviriden birleştirilmiş tek bir flat/nesne yapısı olarak export edilir

**Not**: Dosya fonksiyon/barındırmaz; saf bir veri (translation dictionary) modülüdür. `admin` sabiti, tüm alt sözlüklerin birleşimi olarak dışa aktarılır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin