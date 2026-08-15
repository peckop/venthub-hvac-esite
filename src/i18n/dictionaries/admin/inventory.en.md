---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\inventory.en.ts
skeleton_hash: 51787c85e403d721
entity_hashes:
  overview: 18ed3f6f33fcd066
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu dosya, uygulamanın admin panelindeki envanter (inventory) yönetim arayüzü için İngilizce dilindeki metinleri içeren bir uluslararasılaştırma (i18n) sözlüğüdür. Dosya, envanter ile ilgili tüm arayüz metinlerini (başlıklar, butonlar, hata mesajları, bilgilendirme metinleri vb.) merkezi olarak tanımlayan statik bir nesne yapısından oluşur. Bu sayede uygulamanın farklı bölümlerinde tutarlı ve yerelleştirilmiş bir kullanıcı deneyimi sağlanır.

## Fonksiyon Grupları
Bu dosyada herhangi bir fonksiyon veya metod bulunmamaktadır. Dosya, salt veri (bir JavaScript nesnesi) içerir ve yalnızca bir module-level sabit tanımlar.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **inventory** (object) — `{
  subtitle: 'Real-Time Stock Tracking',
  allCategories: 'ALL CATEGORIES'...`

---

## AST POINTERS

Bu dosya (`inventory.en.ts`) yalnızca bir sabit nesne (`inventory`) tanımı içermektedir. Fonksiyon imzası veya fonksiyon gövedesi bulunmamaktadır. Dolayısıyla AST Pointer oluşturulacak bir fonksiyon yoktur.

| Dosya | Durum |
|---|---|
| `C:\Users\alize\venthub-hvac\src\i18n\dictionaries\admin\inventory.en.ts` | Fonksiyon içermiyor — sadece `inventory` object sabiti |

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\inventory.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: inventory