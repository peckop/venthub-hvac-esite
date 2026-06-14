---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\tr.ts
skeleton_hash: adb27ebbc07c7d53
entity_hashes:
  overview: 84411b9534640216
generated_at: 2026-06-14T22:51:53Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin uluslararasılaştırma (i18n) altyapısının temelini oluşturan, tamamen statik bir Türkçe çeviri sözlüğüdür. Uygulama arayüzündeki tüm metinlerin Türkçe karşılıklarını barındıran `tr` adlı sabit bir nesne içerir. Modül, hiçbir iş mantığı, fonksiyon, ortam değişkeni veya harici API çağrısı içermez; yalnızca veri sağlayan bir sözlük olarak görev yapar.

## Fonksiyon Grupları
Bu dosyada tanımlanmış herhangi bir fonksiyon, metot veya sınıf bulunmamaktadır. Modülün tüm içeriği, projenin dil yükleme mekanizması tarafından içe aktarılmak üzere tanımlanmış, Unicode karakter kodlamasıyla yazılmış bir anahtar-değer çiftleri koleksiyonundan (nesnesinden) ibarettir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül saf bir statik veri modülüdür (sözlük/taslak) — çalıştırılabilir fonksiyon içermez. Aksiyomlar, i18n altyapısının bu modüle yönelik beklediği yapısal koşulları tanımlar.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./admin/tr::admin

---

## SABİTLER
- **tr** (object) — `{
  common: {
    update: 'Güncelle',
    unitMeters: '{{v}} m',
    unitCubi...`

---

## AST POINTERS

Bu dosyada fonksiyon tanımlı değildir.

### Dosya Yapısı

**Dosya tipi**: TypeScript çeviri sözlüğü (i18n dictionary)

**Import**:
- `admin` — `'./admin/tr'` yolundan içe aktarılan admin çevirileri nesnesi

**Sabit**:
- `tr` — Türkçe çeviri anahtar-değer çiftlerini içeren nesne; uygulamanın Türkçe dil dosyasıdır

**Fonksiyon gövdeleri**: Yok

**Return**: Yok (nesne dışa aktarılır)

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: tr