---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\i18n\dictionaries\admin\users.tr.ts
skeleton_hash: f683d2c02365ca48
entity_hashes:
  overview: e82fc2cbc75bd133
generated_at: 2026-08-16T09:20:11Z
---

## Genel Bakış
Bu modül, uygulamanın yönetici (admin) panelindeki "Kullanıcılar" bölümü için Türkçe çeviri metinlerini içeren statik bir veri dosyasıdır. Herhangi bir mantık veya işlevsunmaz; yalnızca bir nesne olarak uluslararasılaştırma (i18n) sözlüğüne aktarılır.

## Fonksiyon Grupları
### Modül Yapısı
Bu dosya, bir `users` sabit nesnesi dışa aktararak modülün temel ve tek amacını yerine getirir. Nesne, uygulama arayüzünde kullanıcı yönetimi ile ilgili tüm metinlerin (başlıklar, butonlar, hata mesajları vb.) Türkçe karşılıklarını tutar.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **users** (object) — `{
      subtitle: 'Sistem kullanıcılarını ve rollerini yönetin.',
      sea...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır. Dosya, yalnızca bir `users` nesnesi (i18n sözlük yapısı) içeren bir TypeScript sabitler dosyasıdır. Fonksiyon gövdesi, parametre veya iç değişken analizi yapılacak herhangi bir bileşen mevcut değildir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\users.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: users