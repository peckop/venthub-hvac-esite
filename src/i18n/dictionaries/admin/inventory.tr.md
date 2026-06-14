---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\inventory.tr.ts
skeleton_hash: 20e5c75f0b38a23a
entity_hashes:
  overview: 18ed3f6f33fcd066
generated_at: 2026-06-13T11:12:31Z
---

## Genel Bakış

Bu dosya, admin paneli envanter (inventory) bölümünün Türkçe dil çevirilerini içeren bir sözlük dosyasıdır.Uluslararasılaştırma (i18n) sistemi tarafından kullanılarak, kullanıcı arayüzündeki metinlerin Türkçe olarak görüntülenmesini sağlar. Dosya, statik bir veri yapısı olup herhangi bir iş mantığı veya fonksiyon içermemektedir.

## İçerik Yapısı

Dosya içerisinde `inventory` adında bir sabit tanımlı olup, envanter yönetimi ile ilgili tüm arayüz metinlerini (başlıklar, buton etiketleri, hata mesajları, onay metinleri vb.) Türkçe karşılıklarıyla birlikte içerir. Bu yapı, uygulamanın farklı diller destekleyebilmesi için bir çeviri katmanı olarak görev yapar.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül, bir i18n çeviri sözlüğü (dictionary) olup sabit bir `{ inventory: object }` yapısı export etmektedir. Fonksiyon imzası veya fonksiyon gövdesi bulunmadığından, mimari varsayım üretilecek bir çalışma zamanı davranışı mevcut değildir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **inventory** (object) — `{
      subtitle: 'Ürün stok seviyelerini ve depo hareketlerini izleyin.',
  ...`

---

## AST POINTERS
Bu dosyada tanımlı fonksiyon bulunmamaktadır. Dosya, bir nesne (inventory) içermektedir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\inventory.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: inventory