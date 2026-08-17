---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\i18n\dictionaries\en.ts
skeleton_hash: 1500d0cc44015ec8
entity_hashes:
  overview: ae56d958419ef214
generated_at: 2026-08-16T11:27:47Z
---

## Genel Bakış

Bu modül, VentHub HVAC projesinin uluslararasılaştırma (i18n) altyapısında kullanılan İngilizce dil sözlüğünü tanımlayan statik bir veri dosyasıdır. Uygulamanın tüm arayüz metinlerini — buton etiketleri, hata mesajları, menü başları ve benzeri kullanıcıya görünen tüm metinleri — tek bir `en` nesnesi altında merkezi olarak tanımlar. Modül herhangi bir işlevsel mantık, API çağrısı veya ortam değişkeni kullanmaz; yalnızca `i18n` çekirdek modülü tarafından içe aktarılan ve çeviri kaynağı olarak tüketilen saf bir sabitler kümesidir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Modül yalnızca statik bir çeviri sözlüğü (`en` nesnesi) içermekte olup herhangi bir fonksiyon, iş mantığı veya koşullu akış içermediğinden, fonksiyon gövdesinden türetilebilecek mimari varsayım bulunmamaktadır.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./admin/en::admin
- import: ./tr::tr

---

## SABİTLER
- **en** (object) — `{
  common: {
    paginationLabel: 'Pagination',
    paginationPrevious: '...`

---

## AST POINTERS

### Dosya Yapısı: `src/i18n/dictionaries/en.ts`

**NOT**: Bu dosyada **fonksiyon tanımları bulunmamaktadır**. Dosya, import edilen nesneleri birleştiren bir TypeScript sözlük (dictionary/constant) dosyasıdır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: en