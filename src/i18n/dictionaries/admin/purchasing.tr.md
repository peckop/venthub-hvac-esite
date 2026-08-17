---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\i18n\dictionaries\admin\purchasing.tr.ts
skeleton_hash: 55957b84a387fbbd
entity_hashes:
  overview: 76a765e0fc5704e4
generated_at: 2026-08-17T11:04:40Z
---

## Genel Bakış

Bu modül, admin panelindeki satın alma (purchasing) sayfası için Türkçe çeviri anahtarlarını içeren bir uluslararasılaştırma (i18n) sözlüğüdür. Dosya, `purchasing` adında bir sabit nesne dışa aktarır ve bu nesne, uygulama genelinde satın alma ile ilgili arayüz metinlerinin Türkçeye çevrilmesi için kullanılır. Dosyada herhangi bir fonksiyon veya dış bağımlılık bulunmamaktadır; yalnızca statik bir çeviri verisi yapısı tanımlanmaktadır.

## Fonksiyon Grupları

Bu dosyada fonksiyon bulunmamaktadır. Modül, yalnızca statik bir çeviri sözlüğü (nesne yapısı) içerir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir i18n çeviri sözlüğü (translation dictionary) yapısındadır ve minimal mimari varsayımlar içermektedir.

**[Aksiyom 1]:** Eğer `purchasing` nesnesi export edilmezse, uygulamanın satın alma (purchasing) alanına ait Türkçe arayüz metinleri yüklenemez ve çeviri anahtarları (`key`) görüntülenmek yerine ham anahtar isimleri kullanıcıya gösterilir.

**[Aksiyom 2]:** Eğer `purchasing` nesnesi bir object olarak tanımlanmazsa (örn. primitif bir değer veya dizi olarak export edilirse), i18n sistemi bu sözlüğü okuyamaz ve satın alma sayfasındaki tüm metinler çevirisi gösterilmeden.render edilir.

**[Aksiyom 3]:** Eğer `purchasing` nesnesinin içindeki değerler string dışı bir tipte olursa (örn. number, object, null), i18n motoru bu değerleri string olarak işlemez ve ilgili çeviriler hata/alınmaz, boş veya tanımsız görüntülenebilir.

---

> **Not:** Bu dosya basit bir çeviri sözlüğü (dictionary) yapısında olduğu için, fonksiyon gövdesi bulunmadığından daha detaylı aksiyom türetilmemiştir. Modül sadece statik bir object export etmektedir; iş mantığı, doğrulama veya veri dönüşümü içermez.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **purchasing** (object) — `{
  navLabel: 'Satınalma',
  title: 'Satınalma',
  subtitle: 'Tedarikçi si...`

---

## AST POINTERS

Bu dosyada **hiçbir fonksiyon gövdesi bulunmamaktadır**. Dosya, yalnızca bir i18n sözlük dosyasıdır (`purchasing.tr.ts`) ve sadece `purchasing` adlı bir sabit nesne (translation object) içermektedir. Fonksiyon, method veya class tanımı yoktur.

> AST Pointer üretilecek fonksiyon gövdesi mevcut değildir.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\purchasing.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: purchasing