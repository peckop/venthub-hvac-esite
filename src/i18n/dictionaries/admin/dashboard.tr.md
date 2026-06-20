---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\dashboard.tr.ts
skeleton_hash: 0960a1d2a65f7fb0
entity_hashes:
  overview: 978b08ca21df4d0c
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu modül, VentHub HVAC admin panelinin ana dashboard sayfası için kullanılacak Türkçe çeviri metinlerini içeren statik bir uluslararasılaştırma sözlüğü dosyasıdır. Dosya, bir nesne yapısında tanımlanmış çeviri anahtarlarını ve karşılık gelen Türkçe metinleri barındırarak, dashboard arayüzündeki tüm kullanıcı arayüzü metinlerinin dil yönetimini sağlar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir admin dashboard için Türkçe çeviri sözlüğünü içeren bir i18n nesnesidir.

[Aksiyom 1]: Eğer `dashboard` sabiti tanımlı değilse veya bir nesne (object) türünde değilse, modülün dışa aktardığı çeviri sözlüğü kullanılamaz ve çeviri aramaları hata ile sonuçlanır.
[Aksiyom 2]: Eğer `dashboard` nesnesi içinde belirli bir çeviri anahtarı (key) bulunmazsa, o anahtar için çeviri sağlanamaz ve muhtemelen bir fallback mekanizması (eğer varsa) çalışır; fallback yoksa anahtarın kendisi döndürülür veya boş değer dönerek UI'da eksiklik oluşur.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **dashboard** (object) — `{
  subtitle: 'Hızlı bakış ve son hareketler',
  rangeToday: 'Bugün',
  ra...`

---

## AST POINTERS

Bu dosya fonksiyon içermemektedir.

`dashboard.tr.ts` dosyası bir i18n çeviri sözlüğü olup, yalnızca `dashboard` adında bir nesne (object) sabitini dışa aktarmaktadır. Dosyada herhangi bir fonksiyon imzası, fonksiyon gövdesi veya sınıf tanımı bulunmamaktadır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\dashboard.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: dashboard