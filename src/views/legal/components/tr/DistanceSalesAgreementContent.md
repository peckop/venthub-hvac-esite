---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\tr\DistanceSalesAgreementContent.tsx
skeleton_hash: 8cb2c014dd41b8ac
entity_hashes:
  func:DistanceSalesAgreementContentTr: 03bf5fa5238f63e7
  overview: 5da2b46d10bebf39
  style_tokens: 083693da379aea89
generated_at: 2026-06-16T11:56:51Z
---

## Genel Bakış
Bu modül, mesafeli satış sözleşmesinin Türkçe dil versiyonunu gösteren bir React bileşenidir. Yasal metin içeriğini sunan basit bir görünümden (presentation) oluşan bileşen, yalnızca dil prop'u alarak ilgili sözleşme metnini render eder. Mimari olarak yasal belge bileşenleri içinde yer alır ve dinamik bir bağımlılığı yoktur.

## Fonksiyon Grupları
### Sözleşme İçeriği Görünümü
Mesafeli satış sözleşmesinin Türkçe yasal metnini sayfada sunan bileşenin tanımı ve yapısını oluşturur. Fonksiyon, dil parametresine göre içerik üretir veya doğrudan Türkçe içeriği döndürür.
- `DistanceSalesAgreementContentTr`

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### DistanceSalesAgreementContentTr

**Ne yapar**: Mesafeli Satış Sözleşmesi'nin Türkçe versiyonunu içeren bir React bileşeni döndürür. Bu fonksiyon, e-ticaret platformlarında yasal zorunluluk olarak sunulan mesafeli satış sözleşmesi içeriğini Türkçe dil seçeneğiyle render eden bir fonksiyonel bileşeni dışa aktarır.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni (React.FC) döndürür. Döndürülen bileşen, `lang` parametresini kabul eder ve Türkçe ("tr") diline ait mesafeli satış sözleşmesi içeriğini ekrana render eder. "Tr" suffix'i, bu bileşenin yalnızca Türkçe dil içeriğini sunduğunu belirtir.

**Parametreler**:

- **lang**: `string` — Bileşenin hangi dilde içerik göstereceğini belirten dil kodudur. Bu bileşen spesifik olarak Türkçe ("tr") dil içeriği sunar.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` parametresini kabul eden bir React fonksiyonel bileşeni döndürür. Bu bileşen, mesafeli satış sözleşmesinin Türkçe metnini render eder.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: react::React

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\DistanceSalesAgreementContent.tsx
  function: src\views\legal\components\tr\DistanceSalesAgreementContent.tsx::DistanceSalesAgreementContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: DistanceSalesAgreementContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-sm`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `mb-3`, `mt-2`