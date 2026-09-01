---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\en.ts
skeleton_hash: eba8fecca1014207
entity_hashes:
  overview: ae56d958419ef214
generated_at: 2026-09-01T08:44:45Z
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
  whatsappMessages: {
    greeting: 'Hello!',
    stockInquiry: 'Hello! ...`

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

## Tasarım Gerekçeleri (kaynaktan BİREBİR)

> Bu bölüm LLM tarafından **yazılmadı**; kaynaktaki işaretli bloklardan
> birebir kopyalandı. Özetlenmesi veya yeniden ifade edilmesi YASAKTIR —
> gerekçenin değeri tam olarak kelimelerindedir.


```text
⭐"Duct Type Fans" deliberately differs from `ghost` ("In-line / Duct Fans").
⭐"Water Coil Duct Heaters" deliberately differs from `duct-heaters` (electric).
```
