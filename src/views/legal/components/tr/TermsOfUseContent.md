---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\tr\TermsOfUseContent.tsx
skeleton_hash: 4dccdb20b4ad17f8
entity_hashes:
  func:TermsOfUseContentTr: eed63a486a457bcd
  overview: c8c962c36de42ed3
  style_tokens: 6460a848de07bdf3
generated_at: 2026-06-16T11:57:51Z
---

## Genel Bakış
Bu modül, VentHub platformunun Türkçe kullanıcılarına yönelik Kullanım Koşulları metnini ekranda gösteren bir React bileşenidir. İçerik, dinamik olarak belirlenebilen bir dil parametresine (`lang`) göre render edilebilir; bu sayede farklı dil sürümlerine aynı yapıyla geçiş yapılabilir. Bileşen, modülün genel yapısı içinde sadece statik bir içerik gösteriminden sorumludur ve dışarıya veri göndermez veya harici bir durum yönetmez.

## Fonksiyon Grupları
### Kullanım Koşulları Bileşeni
Bu grup, yasal metinlerin (özellikle Kullanım Koşulları'nın) kullanıcıya sunulması için gerekli olan React bileşenini tanımlar.
- TermsOfUseContentTr

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### TermsOfUseContentTr

**Ne yapar**: Türkçe Kullanım Koşulları içerik bileşenini döndüren bir React fonksiyonel bileşenidir. VentHub HVAC uygulamasının yasal sayfalarında görüntülenmek üzere tasarlanmış, kullanıcılara hizmet koşullarını Türkçe olarak sunan bir bileşen fabrikasıdır.

**Nasıl yapar**: Fonksiyon çağrıldığında, `React.FC<{ lang: string }>` türünde bir fonksiyonel bileşen döndürür. Döndürülen bileşen, `lang` prop'unu kabul ederek dil yapılandırmasına uyum sağlar. Bileşen, Türkçe olarak hazırlanmış Kullanım Koşulları metin içeriğini render eder.

**Parametreler**:
- Bu fonksiyon parametre almaz — çağrıldığında doğrudan bir React bileşeni döndürür.

**Dönüş**: `React.FC<{ lang: string }>` — Dil parametresini kabul eden, VentHub HVAC uygulamasının Türkçe Kullanım Koşulları içeriğini render eden bir React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/TermsOfUseContent.tsx::TermsOfUseContentTr
- **params**: () — parametre almaz (React bileşen imzası `({ lang: string })` olarak tanımlı olmasına rağmen fonksiyon gövdesinde `lang` parametresi destructure edilmemiş ve hiç kullanılmamıştır)
- **ic_degiskenler**: yerel değişken yoktur — fonksiyon doğrudan JSX döndürür
- **Erisilen Dis Kaynaklar**:
  - `legalConfig.websiteUrl` — 1. maddede site adresi olarak kullanılır (`www.{legalConfig.websiteUrl}`)
  - `legalConfig.sellerTitle` — 3. maddede fikri mülkiyet sahibi, 5. maddede sorumluluk red-dicları içinde satıcı unvanı olarak kullanılır
  - `legalConfig.lastUpdated` — 7. maddede koşulların son güncelleme tarihi olarak `<strong>` etiketi içinde gösterilir
- **Dönüş**: JSX fragment (`<>...</>`) — 7 adet `<section>` içeren Türkçe Kullanım Koşulları içerik yapısı. Her bölüm bir `<h2>` başlık ve ilgili `<p>` veya `<ul>` açıklama içerir. Return türü React.FC bileşenidir.
- **Yan Etkiler**: yok — saf bileşen, state değiştirmez, API çağrısı yapmaz, hook kullanmaz

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\TermsOfUseContent.tsx
  function: src\views\legal\components\tr\TermsOfUseContent.tsx::TermsOfUseContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: TermsOfUseContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `pl-6`, `space-y-1`