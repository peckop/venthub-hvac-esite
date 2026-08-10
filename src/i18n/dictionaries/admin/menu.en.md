---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\menu.en.ts
skeleton_hash: 1267aa22bdf9267b
entity_hashes:
  overview: 34e06702dc3cc9a5
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış

Bu modül, VentHub HVAC admin panelinin menü sistemi için İngilizce dil çevirilerini içeren bir sözlük dosyasıdır. Dosya, uygulamanın uluslararasılaştırma (i18n) altyapısına entegre olarak admin arayüzündeki menü başlıklarının ve metinlerinin İngilizce karşılıklarını merkezi bir yapıda tanımlar. Herhangi bir dış bağımlılık veya API çağrısı içermez; yalnızca statik bir çeviri nesnesi sunar.

## Modül Yapısı

Bu dosyada herhangi bir fonksiyon bulunmamaktadır. Dosyanın içeriği, `menu` adlı tek bir dışa aktarılan sabit nesneden oluşur. Bu nesne, admin paneli menü hiyerarşisindeki tüm öğelerin (örn. "Dashboard", "Users", "Settings") İngilizce metin karşılıklarını anahtar-değer çiftleri olarak içerir. Modül, i18n motoru tarafından doğrudan içe aktarılıp kullanılmak üzere tasarlanmıştır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **menu** (object) — `{
      groupMain: 'Main Menu',
      groupSales: 'Sales & Operations',
     ...`

---

## AST POINTERS

Bu dosya (`menu.en.ts`) bir i18n sözlük dosyasıdır ve **hiçbir fonksiyon içermemektedir**. Dosya yalnızca `menu` adında bir nesne sabiti tanımlamaktadır.

### [N0_BOS] AST Pointer: menu.en.ts

- **params**: (yok — dosya modül düzeyinde export edilen bir nesne içerir, fonksiyon yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: (yok — dosya düzeyinde fonksiyon tanımlaması mevcut değildir)

**Not**: Bu dosya, admin menü çevirilerini içeren statik bir TypeScript sözlük dosyasıdır. `menu` sabit bir nesnedir ve çalışma zamanı mantığı (koşullar, döngüler, API çağrıları) içermez.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\menu.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: menu