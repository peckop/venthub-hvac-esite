---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\titles.tr.ts
skeleton_hash: 07752b129d3dd28c
entity_hashes:
  overview: 92aa8036d07ad320
generated_at: 2026-06-13T11:17:30Z
---

## Genel Bakış
Bu modül, VentHubHVAC projesinin admin paneli arayüzünde kullanılan başlık metinlerinin (örn. sayfa başlıkları, bölüm başlıkları) Türkçe çevirilerini tutan bir çeviri sözlüğü (dictionary) yapısıdır. Modül, bir fonksiyon veya mantık içermez; doğrudan bir `titles` sabit nesnesi olarak ihrac edilir ve uygulamanın uluslararasılaştırma (i18n) sistemine dahil edilerek kullanılır.

## Fonksiyon Grupları
Modülde herhangi bir fonksiyon veya metot bulunmamaktadır. Kod yapısı, en üst seviyede tanımlanmış statik bir veri yapısından (bir sabit nesne) oluşmaktadır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **titles** (object) — `{
      dashboard: 'Dashboard',
      orders: 'Siparişler',
      inventory: ...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır.

Dosya yapısı:
- **Kaynak**: `C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\titles.tr.ts`
- **Tür**: TypeScript i18n sözlük dosyası
- **İçerik**: `titles` adında bir object sabiti (muhtemelen admin paneli başlık metinleri)
- **Import**: Yok
- **Fonksiyon**: Yok
- **Class**: Yok

**Not**: Bu dosya bir dil sözlüğü (dictionary) dosyasıdır ve çalıştırılabilir fonksiyon içermez. `titles` object'i büyük ihtimalle `export` ile dışa aktarılan bir çeviri anahtar-değer çiftleri koleksiyonudur (örneğin `{ dashboard: "Kontrol Paneli", settings: "Ayarlar" }` gibi).

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\titles.tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: titles