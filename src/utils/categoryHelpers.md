---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\categoryHelpers.ts
skeleton_hash: c76700fb140c022c
entity_hashes:
  func:getCategoryDescription: 59a2fb71a2f4949e
  func:getCategoryDisplayName: 403835a175ba4a6a
  func:getCategoryMarketingTitle: 72c2aaa786c01ff4
  func:parsePriceToNumber: 42be44b6c84206bc
  overview: 61e31d74a200c4af
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış
Bu yardımcı modül, VentHub HVAC platformunda ürün kategorileri ile ilgili metin üretimi ve veri dönüşümü işlemlerini tek merkezde toplar. Veritabanından alınan kategori nesnelerini kullanarak kullanıcı arayüzü, pazarlama ve açıklama amaçlı metinler oluşturur, ayrıca heterojen formatlarda gelen fiyat verisini uygulamada kullanılabilir sayısal değere dönüştürür. Temel utility işlevleri sunarak farklı modüllerin tekrar eden kod yazmasının önüne geçer.

## Fonksiyon Grupları
### Kategori Odaklı Metin Üretimi
Veritabanından gelen kategori nesneleri üzerinden farklı kullanım senaryolarına uygun metin içerikleri üretir. Arayüzde gösterilecek görüntülenebilir isimler, pazarlama çalışmalarında kullanılacak başlıklar ve kategori açıklamaları bu gruptaki fonksiyonlar ile oluşturulur.
- getCategoryDisplayName, getCategoryMarketingTitle, getCategoryDescription

### Veri Dönüşüm Yardımcıları
Farklı kaynaklardan gelen bilinmeyen tipteki ham verileri uygulama standartlarına uygun tiplere dönüştürür. Özellikle fiyat verilerini sayısal değere çevirme işlevini sunarak tüm platformda fiyat işlemlerinde tutarlılık sağlar.
- parsePriceToNumber

---

## AXIOMS – Mimari Varsayımlar
Bu modül, veritabanından gelen kategori nesnelerini kullanıcı arayüzü için okunabilir metinlere dönüştürmek ve fiyat verilerini sayısal formata parse etmek amacıyla tasarlanmış yardımcı modüldür, tüm fonksiyonlarının doğru çalışması girdi olarak aldığı parametrelerin tür uyumluluğuna ve yapısal bütünlüğüne bağlıdır.

[Aksiyom 1]: Eğer getCategoryDisplayName fonksiyonuna iletilen DbCategory türündeki kategori nesnesi (null/undefined haricinde) gerekli alanları eksik olursa ya da opsiyonel olarak iletilen çeviri fonksiyonu (t) geçersiz bir değer olarak gönderilirse, kategori için kullanıcıya gösterilecek doğru görünür isim üretilemez, arayüzde boş veya hatalı metin görünür.
[Aksiyom 2]: Eğer getCategoryMarketingTitle ve getCategoryDescription fonksiyonlarına iletilen DbCategory nesnesi (null/undefined haricinde) yapısal olarak uyumsuz olursa, pazarlama başlığı veya açıklama metni üretilemez, ilgili arayüz alanlarında beklenmedik çıktı oluşur.
[Aksiyom 3]: Eğer parsePriceToNumber fonksiyonuna iletilen val parametresi sayıya dönüştürülebilecek string, sayı veya standart boş değerler (null/undefined) dışında geçersiz bir veri türü (nesne, dizi vb.) olarak gönderilirse, fiyat değeri başarılı bir şekilde sayısal formata dönüştürülemez, NaN veya hatalı sayısal değer döner, tüm fiyat bazlı hesaplamalar bozulur.
[Aksiyom 4]: Eğer tüm kategori işleme fonksiyonlarına DbCategory türüne uymayan rastgele bir nesne iletilirse, tüm kategori metni üretme işlemleri başarısız olur, modülün kullanıldığı tüm ekranlarda kategori bilgileri doğru şekilde görüntülenemez.

---

## FONKSİYON DETAYLARI

### getCategoryDisplayName
**Ne yapar**: Verilen kategori nesnesi için en uygun yerelleştirilmiş görünüm adını belirler. Kullanıcı arayüzlerinde kategorilerin okunabilir, konuma göre çevrilmiş isimlerini göstermek amacıyla tasarlanmıştır, null veya undefined kategori değerleri için de güvenli şekilde çalışır.
**Nasıl yapar**: Önceliği sağlanmışsa i18n uyumlu çeviri fonksiyonundan gelen yerelleştirilmiş değere verir. Eğer çeviri fonksiyonu sağlanmamışsa veya ilgili çeviri anahtarı mevcut değilse veritabanında kayıtlı `menu_label` alanına geri döner. O da mevcut değilse ham kategori `name` alanını kullanarak her zaman geçerli bir string döndürmesini garanti eder.
**Parametreler**:
- category: DbCategory | null | undefined — Görünüm adı çıkarılacak veritabanı kategori nesnesi, null veya undefined olması durumunda hata fırlatmadan güvenli şekilde çalışır
- t?: (key: string) => string — İsteğe bağlı olarak sağlanan, i18next veya özel bir hook'tan gelen çeviri fonksiyonu, çeviri anahtarı alıp yerelleştirilmiş string döndürür
**Dönüş**: string, çözümlenmiş yerelleştirilmiş kategori görünüm adı, her zaman geçerli bir string olarak döndürülür

### getCategoryMarketingTitle

**Ne yapar**: Verilen kategori nesnesinin pazarlama odaklı başlığını döndürür. Veritabanında tanımlı bir `marketing_title` alanı varsa onu kullanır, aksi takdirde standart ekran adını (display name) alternatif olarak返回 eder.

**Nasıl yapar**: Fonksiyon, kategori nesnesinin `marketing_title` alanını kontrol eder. Eğer bu alan mevcut ve doluysa doğrudan o değer döndürülür. Alan yoksa veya boşsa, kategorinin standart display name değeri fallback olarak kullanılır. Null veya undefined girdiler için güvenli bir şekilde çalışır.

**Parametreler**:
- `category`: `DbCategory | null | undefined` — Pazarlama başlığı bilgisi çıkarılacak veritabanı kategori nesnesi. Null veya undefined olabilir.

**Dönüş**: `string` — Kategorinin pazarlama başlığı veya alternatif olarak standart ekran adı.

### getCategoryDescription
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### parsePriceToNumber
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../types/db-rows::type { DbCategory }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/categoryHelpers.ts::getCategoryDisplayName
- **params**: `category: DbCategory | null | undefined`, `t?: (key: string) => string`
- **ic_degiskenler**:
  - `tKey` — i18n çevirisi için kullanılacak anahtar değer; önce `category.translation_key`, yoksa `category.slug` kullanılır
  - `translationPath` — i18n çeviri fonksiyonuna geçirilen tam yolu temsil eden string; `common.categoryList.{tKey}` formatında
  - `translated` — `t(translationPath)` çağrısının döndürdüğü çeviri sonucu; eğer geçerli bir çeviri varsa kullanılır
- **Dönüş**: `string` — kategori gösterim adı; sırasıyla çeviriden, `menu_label`'dan veya `name`'den döner

### [N2_NASIL] AST Pointer: src/utils/categoryHelpers.ts::getCategoryMarketingTitle
- **params**: `category: DbCategory | null | undefined`
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — `category.marketing_title` varsa onu, yoksa `getCategoryDisplayName(category)` sonucunu döner

### [N3_NASIL] AST Pointer: src/utils/categoryHelpers.ts::getCategoryDescription
- **params**: `category: DbCategory | null | undefined`
- **ic_degiskenler**:
  - `meta` — `category.metadata` değerini tutar; hero açıklaması için kullanılır
- **Dönüş**: `string` — `meta.hero_description` varsa onu, yoksa `category.description`'ı, o da yoksa boş string döner

### [N4_NASIL] AST Pointer: src/utils/categoryHelpers.ts::parsePriceToNumber
- **params**: `val: unknown`
- **ic_degiskenler**:
  - `cleaned` — string değerden rakam, nokta ve virgül dışındaki tüm karakterlerin temizlendiği; virgülün noktaya dönüştürüldüğü intermediate string
  - `parsed` — `cleaned` string'inin `parseFloat` ile number'a dönüştürülmüş hali
- **Dönüş**: `number` — `val` number ise aynen, string ise temizlenip parse edilmiş sayı, parse edilemezse `0`, diğer tipler için `0` döner

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    categoryHelpers_ts__getCategoryDescription["getCategoryDescription"]
    categoryHelpers_ts__getCategoryDisplayName["getCategoryDisplayName"]
    categoryHelpers_ts__getCategoryMarketingTitle["getCategoryMarketingTitle"]
    categoryHelpers_ts__parsePriceToNumber["parsePriceToNumber"]
    categoryHelpers_ts__getCategoryMarketingTitle --> categoryHelpers_ts__getCategoryDisplayName
```

## NODE ID STANDARD

  file: src\utils\categoryHelpers.ts
  function: src\utils\categoryHelpers.ts::getCategoryDisplayName
  function: src\utils\categoryHelpers.ts::getCategoryMarketingTitle
  function: src\utils\categoryHelpers.ts::getCategoryDescription
  function: src\utils\categoryHelpers.ts::parsePriceToNumber

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCategoryDescription
  export: getCategoryDisplayName
  export: getCategoryMarketingTitle
  export: parsePriceToNumber