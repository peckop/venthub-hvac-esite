---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\errorGroups.en.ts
skeleton_hash: 54e9229bb7718984
entity_hashes:
  overview: 38d648bd807c5d10
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış

Bu modül, admin arayüzünde kullanılan hata gruplarının İngilizce çevirilerini tanımlayan bir uluslararasılaştırma (i18n) sözlük dosyasıdır. Dosya, `errorGroups` adlı bir nesne içerir ve hata mesajlarının kategori bazlı organize edilmesini sağlar. Bu sözlük, uygulamanın hata gösterim bileşenleri tarafından çağrılarak kullanıcıya anlamlı hata mesajları sunulmasında kullanılır.

## Modül Yapısı

Bu dosya yalnızca veri tanımı içeren bir sözlük modülüdür — herhangi bir fonksiyon veya metod içermez. Tanımlanan `errorGroups` sabiti, hata kategorilerine göre gruplandırılmış çeviri anahtarları ve değerlerinden oluşan bir yapı sunar. Dosya, i18n sistemine entegre edilerek admin panelindeki hata gösterimlerinin dil desteği almasını sağlar.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, hata gruplarını (error groups) tanımlayan statik bir veri yapısı (nesne) sunar. Doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `errorGroups` nesnesi tanımlı ve geçerli bir JavaScript nesnesi (object) değilse, modül i18n sözlüklerinde hata gruplarını düzgün sunamaz ve uygulama hata gösteriminde tutarsız davranışlar sergiler.

[Aksiyom 2]: Eğer `errorGroups` içindeki her bir anahtar (hata grubu ID'si), insan tarafından okunabilir ve anlamlı bir metin dizesi (string) olarak atanmamışsa, uygulama arayüzünde hata grupları boş veya hatalı gösterilir.

[Aksiyom 3]: Eğer `errorGroups` nesnesinin yapısı, application codbase'indeki (örneğin `ErrorBoundary`, `ErrorList` gibi) bileşenlerin beklediği formata uymuyorsa, hata grupları bileşenler tarafından alınamaz ve işlenemez.

[Aksiyom 4]: Eğer `errorGroups` nesnesi farklı diller için tanımlanmış sözlük dosyaları (örn: `errorGroups.en.ts`) arasında tutarlı bir yapıya sahip değilse (örn: aynı ID'ler farklı dillerde farklı anlamlara geliyorsa), dil değişikliklerinde hata grupları eksik veya yanlış çevrilmiş olarak görünür.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **errorGroups** (object) — `{
      subtitle: 'Monitor, assign, and manage the status of grouped client e...`

---

## AST POINTERS

Bu dosyada herhangi bir fonksiyon gövdesi bulunmamaktadır. Dosya yalnızca bir nesne (object) tanımı içermektedir; fonksiyon imzaları ve gövdeleri mevcut değildir. Dolayısıyla AST Pointer üretilemez.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\errorGroups.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: errorGroups