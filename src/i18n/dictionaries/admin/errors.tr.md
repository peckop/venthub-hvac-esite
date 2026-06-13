---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\errors.tr.ts
skeleton_hash: 40a7f1bd4f8b4916
entity_hashes:
  overview: 0cabb6ce3dc6888f
generated_at: 2026-06-13T11:11:53Z
---

## Genel Bakış
Bu modül, yönetimsel (admin) arayüzleri için tanımlanmış hata mesajlarının Türkçe karşılıklarını içeren bir sözlük dosyasıdır. Dosya, bir `errors` sabit nesnesi dışa aktararak, uygulama içinde karşılaşılabilecek hata durumlarının kullanıcıya gösterilecek standart ve tutarlı metinlerini sağlar. Bu yapısıyla, modül uygulamanın uluslararasılaştırma (i18n) altyapısının ve hata işleme mekanizmasının önemli bir parçasıdır.

## Fonksiyon Grupları
Bu dosyada herhangi bir fonksiyon tanımlı değildir. Modül düzeyinde, dışa aktarılmış bir `errors` nesnesi bulunur. Bu nesne, farklı hata senaryolarına karşılık gelen anahtar-değer çiftlerinden oluşur ve uygulamanın ilgili bölümlerinde kullanılmak üzere hazırlanmıştır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Verilen modül, bir hata mesajları sözlüğünden (i18n dictionaries) ibaret olup herhangi bir fonksiyon gövdesi içermemektedir. Modül sadece `errors` adında bir nesne sabitini tanımlamaktadır. AXIOM'lar yalnızca fonksiyon gövdelerindeki mantıksal akış ve koşullardan türetilebilir; sabit veri tanımları (sözlükler, enum'lar, çeviriler) iş mantığı barındırmadığından mimari varsayım üretmek için temel oluşturmaz.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **errors** (object) — `{
      levelTitle: 'Seviye',
      envTitle: 'Ortam',
      detailsTitle: 'D...`

---

## AST POINTERS

Bu dosyada **hiç fonksiyon gövedesi bulunmamaktadır**. Dosya yalnızca bir nesne sabiti (`errors`) içermektedir; fonksiyon imzası, sınıf veya çağrı ilişkisi tanımı yoktur. Dolayısıyla AST Pointer üretilmez.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\errors.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: errors