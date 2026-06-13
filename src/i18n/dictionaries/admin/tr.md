---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\tr.ts
skeleton_hash: 4bd0c5d000e0f1a4
entity_hashes:
  overview: c015499002971f60
generated_at: 2026-06-13T11:18:06Z
---

## Genel Bakış
Bu modül, admin panelinin Türkçe çevirilerini merkezi bir noktadan yöneten bir dil sözlüğü dosyasıdır. Farklı işlevsel alanlara ait çeviri nesnelerini bir araya getirir ve bunları tek bir "admin" adlı dışa açık bir sözlük olarak sunar. Modülün temel amacı, çevirilerin tutarlılığını ve bakımını kolaylaştırmaktır.

## Fonksiyon Grupları
*(Bu dosyada herhangi bir fonksiyon tanımlı değildir.)*

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir i18n çeviri sözlüğü (dictionary) yapısıdır ve statik bir key-value objesi olarak tanımlanmıştır. Sadece veri taşıma/amacıyla kullanılır.

**[Aksiyom 1]:** Eğer `admin` nesnesi içinde tanımlı bir çeviri key'i (API çağrısı, UI bileşeni veya middleware tarafından) aranıyorsa, o key'in `admin` objesi içinde var olması gerekir; yoksa, istenen dil için çeviri bulunamaz ve uygulama davranışı tanımsızdır (boş string, fallback key veya runtime hatası oluşur).

**[Aksiyom 2]:** Eğer bu sözlük dosyası uygulamanın dil değiştirme (locale switching) mekanizması tarafından yükleniyorsa, `admin` objesinin her bir value'sunun string türünde olması gerekir; yoksa, çeviri rendering sırasında hata oluşur.

**[Aksiyom 3]:** Eğer bu dosya bir `export` ile dışa açılıyorsa, modülü import eden tüketici tarafında `admin` objesinin erişilebilir (truthy) olması gerekir; yoksa, consumer tarafında `undefined` reference hatası oluşur.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **admin** (object) — `{
  authority,
  categories,
  products,
  common,
  users,
  inventory,
  or...`

---

## AST POINTERS

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin