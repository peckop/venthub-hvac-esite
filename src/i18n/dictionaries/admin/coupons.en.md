---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\coupons.en.ts
skeleton_hash: f5b43b114e0a73ee
entity_hashes:
  overview: e01c0e2ade1a4912
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış

Bu modül, VentHub HVAC yönetim panelindeki kupon yönetimi (coupons) arayüzünün İngilizce dil sözlüğünü (translation dictionary) içermektedir. React/Next.js uygulamasının `i18n` (uluslararasılaştırma) altyapısının bir parçası olarak, kuponlarla ilgili tüm arayüz metinlerinin (başlıklar, buton etiketleri, form alanları, hata mesajları vb.) tutarlı bir şekilde yönetilmesini sağlar. Modül, statik bir çeviri nesnesi tanımlar ve dinamik bir bağımlılığı yoktur.

## Fonksiyon Grupları

Bu dosyada herhangi bir fonksiyon veya metod bulunmamaktadır. Modül yalnızca modül-seviyesinde tanımlanmış, statik bir sözlük (dictionary) nesnesi içermektedir; dolayısıyla fonksiyonel bir gruplama yapılamamaktadır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir i18n sözlüğü olarak coupons ile ilgili çevirileri içerir. Dolayısıyla, sözlük nesnesinin geçerli olması ve gerekli çevirileri sağlaması beklenir.

[Aksiyom 1]: Eğer coupons nesnesi (object) tanımlı değilse veya null/undefined değerindeyse, modül yüklenirken hata oluşur veya çeviriler kullanılamaz.
[Aksiyom 2]: Eğer coupons nesnesinde en az bir çeviri anahtarı (key-value çifti) yoksa, modül işlevsel değildir ve beklenen metinler gösterilemez.
[Aksiyom 3]: Eğer coupons nesnesinin değerleri string tipinde değilse, çeviriler yanlış formatlanabilir, render edilemez veya uygulama hataları oluşabilir.
[Aksiyom 4]: Eğer coupons nesnesi salt okunur (readonly) değilse veya dışarıdan değiştirilebilirse, çalışma zamanında çevirilerin tutarsızlığına yol açabilir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **coupons** (object) — `{
      subtitle: 'Manage discount coupons and track usage statistics',
   ...`

---

## AST POINTERS

Bu dosyada herhangi bir fonksiyon bulunmamaktadır.

**`C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\coupons.en.ts`** dosyası, i18n (uluslararasılaştırma) amacıyla kullanılan statik bir sözlük/veri dosyasıdır. İçeriği yalnızca `coupons` adlı bir object sabitinden ibarettir ve fonksiyon, class veya import içermemektedir.

AST Pointer üretimi için fonksiyon gövdesi gerekli olduğundan, bu dosya için AST Pointer oluşturulamaz.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\coupons.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: coupons