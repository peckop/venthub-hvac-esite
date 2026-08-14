---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\toolbar.tr.ts
skeleton_hash: a3e3de16ea3f2de8
entity_hashes:
  overview: 3efab1f125273943
generated_at: 2026-06-19T20:47:54Z
---

## Genel Bakış
Bu modül, yönetim paneli (admin) araç çubuğu arayüzünün Türkçe çeviri sözlüğünü içermektedir.Uluslararasılaştırma (i18n) sistemi tarafından kullanılarak, uygulamanın Türkçe dil seçeneğindeki araç çubuğu metinlerini (buton etiketleri, menü başlıkları vb.) sağlamaktadır.

## Modül Yapısı
Dosya, `toolbar` adlı bir nesne/dişli yapısı içermektedir. Bu yapı, araç çubuğunda yer alan tüm UI metinlerinin Türkçe karşılıklarını anahtar-değer çiftleri olarak tanımlamaktadır. Üst düzey bir modül olup, başka modülleri import etmemekte veya fonksiyon içermemektedir — sadece statik bir veri sözlüğüdür.

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir çeviri sözlüğü (dictionary) modülüdür ve minimal mimari varsayımlara sahiptir.

[Aksiyom 1]: Eğer `toolbar` nesnesi tanımlı (undefined) veya null değilse, modül doğru dışa aktarım (export) sağlar.
[Aksiyom 2]: Eğer `toolbar` nesnesi içindeki herhangi bir çeviri anahtarının değeri string değilse (örn: null, undefined, nesne, dizi), ilgili çeviri anahtarı render sırasında "undefined" veya hata mesajı olarak görüntülenebilir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **toolbar** (object) — `{
  searchPlaceholder: 'Ara',
  clear: 'Temizle',
  records: 'kayıt',
  i...`

---

## AST POINTERS

Bu dosyada herhangi bir fonksiyon bulunmamaktadır.

`toolbar.tr.ts` dosyası, yalnızca bir `toolbar` sabit nesnesi içeren bir i18n (uluslararasılaştırma) sözlük dosyasıdır. Fonksiyon imzası veya fonksiyon gövdesi mevcut değildir; dolayısıyla AST Pointer üretilemez.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\toolbar.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: toolbar