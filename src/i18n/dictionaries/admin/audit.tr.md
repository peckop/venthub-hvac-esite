---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\audit.tr.ts
skeleton_hash: 512c3b4adb378f62
entity_hashes:
  overview: 296262cb85b992c0
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının yönetici (admin) arayüzündeki denetim (audit) alanı için kullanılan Türkçe dil çeviri sözlüğüdür. Dosya, uygulamanın uluslararasılaştırma (i18n) altyapısına entegre edilerek, Türkçe dil seçeneğindeki statik metinlerin ve etiketlerin merkezi bir kaynaktan yönetilmesini sağlar. Bu yapı, farklı diller için benzer sözlük dosyaları oluşturulmasına olanak tanır.

## Modül Yapısı ve Sorumlulukları
Dosya, `audit` adında tek bir dışa aktarılan sabit (nesne) içerir. Bu nesne, denetim ile ilgili ekran başlıkları,但用法 metinleri, hata iletileri ve buton isimleri gibi çevirileri anahtar-değer çiftleri olarak depolar. Modül, doğrudan bir API veya veritabanı sorgulamaz; yalnızca statik metin içeriğini sağlar. Uygulama çalışma zamanında bu sözlüğü ilgili dil için yükler ve arayüzdeki metinleri buna göre render eder.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, uygulamanın Türkçe dil dosyalarından biridir ve sabit bir sözlük yapısına sahiptir.

[Axiom 1]: Eğer `audit` nesnesi对外a aktarılmazsa, uygulamanın i18n sistemi bu dil dosyasını yükleyemez ve Türkçe çeviriler eksik olur.
[Axiom 2]: Eğer `audit` nesnesi içindeki anahtarlar (örneğin, "title", "description", "actions") uygulamanın beklediği anahtarlarla eşleşmezse, çeviriler görünmez veya hata verir.
[Axiom 3]:

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **audit** (object) — `{
      actionTitle: 'İşlem',
      clear: 'Temizle',
      colAction: 'Ak...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır. Dosya, `audit` adında bir çeviri nesnesi (sabit) içeren bir i18n sözlük dosyasıdır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\audit.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: audit