---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\settings.en.ts
skeleton_hash: b018c49f0ceb881c
entity_hashes:
  overview: a6820ef6861612f2
generated_at: 2026-06-13T11:16:46Z
---

## Genel Bakış

Bu modül, admin panelindeki ayarlar sayfası için İngilizce çeviri sözlüğü içermektedir. Dosya, `settings` adlı bir nesne tanımlayarak kullanıcay arayüzündeki tüm ayarlar sayfası metinlerini (başlıklar, etiketler, mesajlar, hata uyarıları vb.) merkezi bir yapıda sunar. Internationalization (i18n) altyapısı tarafından içe aktarılır ve uygulama genelinde İngilizce dil desteği için kullanılır.

---

> **Not:** Bu dosyada herhangi bir fonksiyon veya metot bulunmamaktadır. Yalnızca statik bir çeviri sözlüğü yapısı (`settings` sabiti) içermektedir. Dolayısıyla "Fonksiyon Grupları" bölümü üretilememiştir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir i18n sözlük dosyasıdır (admin/settings.en.ts) ve `settings` adında statik bir nesne içermektedir. Fonksiyon gövdesi bulunmadığından, fonksiyonel aksiyom üretilemez.

**Tespit edilen yapısal varsayımlar:**

1. **[Aksiyom 1]:** Eğer `settings` nesnesi uluslararasılaştırma (i18n) sözlük yapısına uygun (anahtar-değer çiftlerinden oluşan) değilse, uygulama çevirileri düzgün yüklenemez.

2. **[Aksiyom 2]:** Eğer `settings` nesnesi, admin settings sayfasında referans verilen tüm çeviri anahtarlarını (translation keys) içermiyorsa, eksik alanlar için tanımsız/boş metin görüntülenir.

3. **[Aksiyom 3]:** Eğer `settings` nesnesinin değerleri string tipinde değilse, i18n motoru çeviri işlemesi sırasında hata oluşur.

---

> **Not:** Bu modül statik bir veri yapısı (i18n sözlüğü) olduğundan, fonksiyon imzası veya fonksiyon gövdesi mevcut değildir. Detaylı fonksiyonel aksiyom üretimi için modülde çalışan işlevsel kodların incelenmesi gerekir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **settings** (object) — `{
      siteName: 'Site Name',
      tagline: 'Tagline',
      contactEmail: ...`

---

## AST POINTERS

Bu dosyada (`src/i18n/dictionaries/admin/settings.en.ts`) **hiçbir fonksiyon gövdesi bulunmamaktadır**.

Dosya yapısı itibarıyla bir **i18n (uluslararasılaştırma) sözlük dosyası** olup, yalnızca `settings` adında bir sabit (object) içerir. Bu object, admin paneli "Settings" sayfası için İngilizce çeviri metinlerini (anahtar-değer çiftleri) barındırır.

Fonksiyon imzası, fonksiyon gövdesi veya çalıştırılabilir kod bloğu mevcut olmadığından **AST Pointer üretilemez**.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\settings.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: settings