---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\returns.tr.ts
skeleton_hash: 0f9b313612a99e63
entity_hashes:
  overview: f74c60dbdfef5408
generated_at: 2026-06-13T11:16:09Z
---

## Genel Bakış
Bu dosya, VentHub HVAC uygulamasının yönetici panelindeki "İadeler" (Returns) bölümünün Türkçe dil çeviri sözlüğünü içerir. Modül, arayüzdeki metinlerin ve etiketlerin Türkçe karşılıklarını tanımlayan statik bir sabitler (constants) dosyasıdır. Fonksiyon veya mantıksal işlem barındırmaz, yalnızca bir çeviri sözlüğü yapısı sunar.

## Fonksiyon Grupları
Bu dosyada herhangi bir fonksiyon veya metod bulunmamaktadır. Dosya yalnızca bir dizi sabit değerden oluşmaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, spefisifik aksiyom üretilememektedir. Ancak modül yapısından çıkarılabilecek temel varsayımlar:

[Aksiyom 1]: Eğer `returns` nesnesi tanımlı değilse veya boşsa, i18n sözlük çözümleme hataları oluşur ve Türkçe lokalizasyon stringsleri kullanılamaz.

[Aksiyom 2]: Eğer `returns` nesnesinin beklenen key-value çiftleri (locale stringleri) eksikse, UI bileşenlerinde çeviri fallback'leri tetiklenir veya ham key'ler görüntülenir.

---

**Not:** Bu modül bir i18n sözlük dosyası (`returns.tr.ts`) olduğundan, tipik bir iş mantığı modülü gibi değil, statik veri yapısı olarak çalışır. Detaylı aksiyom üretmek için fonksiyon gövdelerine ihtiyaç vardır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **returns** (object) — `{
      total: 'Toplam: {{count}} iade talebi yönetiliyor.',
      searchPlac...`

---

## AST POINTERS

Bu dosyada (`returns.tr.ts`) herhangi bir fonksiyon gövdesi bulunmamaktadır. Dosya, yalnızca `returns` adında bir sabit (object) içeren bir i18n sözlük dosyasıdır.

**Fonksiyon sayısı: 0**

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\returns.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: returns