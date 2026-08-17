---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\theme.en.ts
skeleton_hash: bcf592d8ea62389b
entity_hashes:
  overview: addd7e38799ae029
generated_at: 2026-08-15T18:16:30Z
---

## Genel Bakış

Bu modül, admin paneli teması ile ilgili kullanıcı arayüzü metinlerinin İngilizce çeviri sözlüğünü tanımlayan bir i18n (uluslararasılaştırma) kaynak dosyasıdır. Tema düzenleme, önizleme ve özelleştirme arayüzlerinde kullanılan tüm etiket, başlık, açıklama ve hata mesajları bu dosyada `theme` sabit objesi altında yapılandırılmıştır. Dosya doğrudan i18n sözlük sistemine entegre edilir ve runtime'da dinamik olarak yüklenmez.

## Fonksiyon Grupları

Bu dosyada fonksiyon bulunmamaktadır — yalnızca statik bir çeviri sözlüğü (i18n dictionary) tanımlanmaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül, i18n sözlük dosyası olup yalnızca statik bir `theme` nesnesi (translation key-value çiftleri) içermektedir. Fonksiyon imzası, fonksiyon gövdesi veya çalıştırılabilir mantık bulunmadığından, mimari varsayım üretilememektedir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **theme** (object) — `{
      label: 'Appearance',
      light: 'Light',
      dark: 'Dark',
  ...`

---

## AST POINTERS

Dosyada herhangi bir fonksiyon gövdesi bulunmamaktadır. `theme.en.ts` dosyası yalnızca bir `theme` sabit nesnesi (i18n sözlük yapısı) içermektedir; fonksiyon imzası veya gövdesi tanımlanmamıştır.

AST Pointer üretimi için gereken minimum koşul (en az bir fonksiyon gövdesi) karşılanmadığından, bu dosya için section boş bırakılır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\theme.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: theme