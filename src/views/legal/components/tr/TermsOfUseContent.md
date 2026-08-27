---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\legal\components\tr\TermsOfUseContent.tsx
skeleton_hash: f4764d6f0e46b953
entity_hashes:
  func:TermsOfUseContentTr: ae2cbf8b29e4a1e0
  overview: 6cfd8dacdb7a9f0c
  style_tokens: c2df28d44e819ffd
generated_at: 2026-08-27T07:41:07Z
---

## Genel Bakış
Bu modül, VentHub platformunun Türkçe kullanıcılarına yönelik Kullanım Koşulları metnini ekranda gösteren bir React bileşenini tanımlar. Bileşen, dinamik olarak belirlenebilen bir dil parametresi (`lang`) alarak render edilir ve sadece statik bir içerik gösteriminden sorumludur; dışarıya veri göndermez veya harici bir durum yönetmez.

## Fonksiyon Grupları
### Kullanım Koşulları Bileşeni
Bu grup, yasal metinlerin (Kullanım Koşulları'nın) kullanıcıya Türkçe olarak sunulması için gerekli olan React bileşenini tanımlar ve döndürür.
- TermsOfUseContentTr

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### TermsOfUseContentTr
**Ne yapar**: Kullanım koşulları içeriğine ait bir React fonksiyon bileşeni döndüren bir üst düzey fonksiyondur. Dosya yolu (`src\views\legal\components\tr\TermsOfUseContent.tsx`) ve fonksiyon adındaki `Tr` soneki, bileşenin Türkçe kullanım koşulları içeriğiyle ilişkili olduğunu gösterir. Docstring boş bırakılmıştır; fonksiyonun iç mantığı ve davranışına dair kaynakta ek bilgi bulunmamaktadır.

**Nasıl yapar**: Kaynakta iç mantığa dair bir açıklama (docstring) yer almamaktadır. Fonksiyon, aldığı `lang` parametresini kullanarak bir React fonksiyon bileşeni (`React.FC`) üretir ve döndürür. Bileşenin render mantığı ve hangi içeriği oluşturduğu bu kaynakta belirtilmemiştir.

**Parametreler**:
- `lang`: `{ lang: string }` — Fonksiyona destructuring yoluyla aktarılan nesne içindeki `lang` özelliğidir. Dil bilgisini temsil eden bir string değer alır.

**Dönüş**: `React.FC<{ lang: string }>` — `lang` adında string türünde bir prop alan bir React fonksiyon bileşeni döndürür. Döndürülen bileşen, kendisi de bir `lang` prop'u bekleyerek kullanım koşulları içeriğini render eder.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/TermsOfUseContent.tsx::TermsOfUseContentTr
- **params**: `lang` — sayfa dili; `localizedHref` çağrılarında href üretmek için kullanılır
- **ic_degiskenler**:
  - `legalConfig.websiteUrl` — sitenin alan adı; `<p>` içinde `www.{legalConfig.websiteUrl}` olarak gösterilir
  - `legalConfig.sellerTitle` — satıcı unvanı; işletme bilgisi, fikri mülkiyet ve sorumluluk reddi bölümlerinde `<strong>` içinde kullanılır
  - `legalConfig.sellerAddress` — satıcı adresi; iletişim bilgisi satırında gösterilir
  - `legalConfig.sellerEmail` — satıcı e-posta adresi; iletişim bilgisi satırında ve yetkisiz kullanım bildirimi yönlendirmesinde kullanılır
  - `legalConfig.sellerPhone` — satıcı telefon numarası; iletişim bilgisi satırında gösterilir
  - `legalConfig.mersis` — MERSİS numarası; iletişim bilgisi satırında gösterilir
  - `legalConfig.tradeRegistryNo` — ticaret sicil numarası; iletişim bilgisi satırında gösterilir
  - `legalConfig.etbisNo` — ETBİS kayıt numarası; iletişim bilgisi satırında gösterilir
  - `legalConfig.lastUpdated` — koşulların son güncelleme tarihi; "Değişiklikler" bölümünde gösterilir
  - `Routes.legal.mesafeliSatis()` — mesafeli satış sözleşmesi rotası; `localizedHref` ile birlikte `<Link>` href'inde kullanılır
  - `Routes.legal.onBilgilendirme()` — ön bilgilendirme formu rotası; `localizedHref` ile birlikte `<Link>` href'inde kullanılır
  - `Routes.legal.kvkk()` — KVKK aydınlatma metni rotası; `localizedHref` ile birlikte `<Link>` href'inde kullanılır
  - `Routes.legal.gizlilik()` — gizlilik politikası rotası; `localizedHref` ile birlikte `<Link>` href'inde kullanılır
  - `localizedHref(Routes.legal.mesafeliSatis(), lang)` — mesafeli satış sözleşmesi linkinin dile göre tam URL'si
  - `localizedHref(Routes.legal.onBilgilendirme(), lang)` — ön bilgilendirme formu linkinin dile göre tam URL'si
  - `localizedHref(Routes.legal.kvkk(), lang)` — KVKK aydınlatma metni linkinin dile göre tam URL'si
  - `localizedHref(Routes.legal.gizlilik(), lang)` — gizlilik politikası linkinin dile göre tam URL'si
  - `Link` — Next.js link bileşeni; mesafeli satış, ön bilgilendirme, KVKK ve gizlilik politikası sayfalarına yönlendirmek için kullanılır
- **Dönüş**: React fragment (`<>...</>`) içinde 11 adet `<section>` elementi — Türkçe kullanım koşulları içeriği

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
- **Renkler:** `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `mt-2`, `pl-6`, `space-y-1`, `underline`