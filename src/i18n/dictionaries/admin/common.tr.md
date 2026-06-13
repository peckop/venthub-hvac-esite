---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\common.tr.ts
skeleton_hash: 72388d6c66d5dc1c
entity_hashes:
  overview: 43c6db6003831046
generated_at: 2026-06-13T18:02:40Z
---

## Genel Bakış

Bu dosya, yönetici panelinin (admin) ortak kullanım alanları için Türkçe çeviri sözlüğünü tanımlayan bir kaynak modüldür. Kullanıcı arayüzündeki genel metinlerin (butonlar, başlıklar, hata mesajları, onay yazıları vb.) Türkçedeki karşılıklarını içeren `common` sabitini dışa aktarır. Uluslararasılaştırma (i18n) altyapısı tarafından yüklenerek, uygulamanın Türkçe dil seçeneğindeki metin içeriğini sağlar.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **common** (object) — `{
      yes: 'Evet',
      no: 'Hayır',
      saveChanges: 'Değişiklikleri Ka...`

---

## AST POINTERS

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\common.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: common